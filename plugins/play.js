import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from "ytdl-core"
import axios from "axios"
import { youtubedl, youtubedlv2 } from "@bochilteam/scraper"

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text)
    throw `¿Que canción descargo?\n\nUso:\n${usedPrefix + command} feid normal`

  await m.react("🕓")

  const query = args.join(" ")
  const yt_play = await search(query)
  const video = yt_play && yt_play[0]
  if (!video) return m.reply("❌ No se encontró el video.")

  // Guarda la url para fallbacks
  const v = video.url

  try {
    await m.react("✅")

    // Llamada a Sylphy
    const apiResp = await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(v)}&apikey=sylphy-e321`, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Node.js) Bot",
        Accept: "application/json, text/plain, */*"
      },
      timeout: 20000
    })
    const api = await apiResp.json().catch(() => null)

    // LOG para debugging — pega este objeto si sigue fallando
    console.log("Sylphy API response:", JSON.stringify(api, null, 2))

    if (!api || !api.res || !api.res.url) {
      throw new Error("La API de Sylphy no devolvió `res.url`.")
    }

    const remoteUrl = api.res.url

    // Estrategia 1: fetch con headers y follow
    try {
      const dlResp = await fetch(remoteUrl, {
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (Node.js) Bot",
          Referer: v,
          Accept: "audio/*, application/octet-stream, */*"
        },
        timeout: 60000
      })

      // info útil para debugging
      console.log("DL fetch status:", dlResp.status)
      console.log("DL content-type:", dlResp.headers.get("content-type"))
      console.log("DL content-length:", dlResp.headers.get("content-length"))

      if (!dlResp.ok) throw new Error(`Respuesta de descarga no OK: ${dlResp.status}`)

      const contentType = dlResp.headers.get("content-type") || ""
      const contentLength = dlResp.headers.get("content-length")
      const sizeBytes = contentLength ? parseInt(contentLength, 10) : null

      // Si content-type parece audio o el tamaño es razonable, convertir a buffer
      if ((contentType.includes("audio") || contentType.includes("mpeg") || contentType.includes("octet-stream")) && (sizeBytes === null || sizeBytes > 1024 * 5)) {
        const arrayBuf = await dlResp.arrayBuffer()
        const buffer = Buffer.from(arrayBuf)
        // enviar audio como buffer
        await conn.sendMessage(
          m.chat,
          {
            audio: buffer,
            mimetype: "audio/mpeg",
            fileName: `${video.title}.mp3`,
            contextInfo: {
              externalAdReply: {
                title: video.title,
                body: "Descargado con Sylphy API",
                thumbnailUrl: video.thumbnail,
                mediaType: 1,
                renderLargerThumbnail: true,
                sourceUrl: v
              }
            }
          },
          { quoted: m }
        )
        return
      } else {
        // Si el content-type no es audio o el archivo es muy pequeño, lanzar para intentar otros métodos
        throw new Error(`Content-type no válido o archivo muy pequeño (${contentType} / ${sizeBytes})`)
      }
    } catch (eFetch) {
      console.log("Fetch directo falló:", eFetch.message)
      // continuar a axios
    }

    // Estrategia 2: axios con responseType arraybuffer (a veces mejor para redirect/respuestas)
    try {
      const ax = await axios.get(remoteUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Node.js) Bot",
          Referer: v,
          Accept: "audio/*, application/octet-stream, */*"
        },
        maxRedirects: 5,
        timeout: 60000
      })

      const ct = ax.headers["content-type"] || ""
      const cl = ax.headers["content-length"] || ax.data?.byteLength || null
      console.log("Axios content-type:", ct, "content-length:", cl)

      if ((ct.includes("audio") || ct.includes("mpeg") || ct.includes("octet-stream")) && (cl === null || cl > 1024 * 5)) {
        const buffer = Buffer.from(ax.data)
        await conn.sendMessage(
          m.chat,
          {
            audio: buffer,
            mimetype: "audio/mpeg",
            fileName: `${video.title}.mp3`,
            contextInfo: {
              externalAdReply: {
                title: video.title,
                body: "Descargado con Sylphy API",
                thumbnailUrl: video.thumbnail,
                mediaType: 1,
                renderLargerThumbnail: true,
                sourceUrl: v
              }
            }
          },
          { quoted: m }
        )
        return
      } else {
        throw new Error(`Axios devolvió content-type ${ct} y size ${cl}`)
      }
    } catch (eAx) {
      console.log("Axios fallo:", eAx.message)
    }

    // Estrategia 3: intentar añadir query ?dl=1 o &dl=1 (algunas urls requieren esto)
    try {
      const trial = remoteUrl.includes("?") ? `${remoteUrl}&dl=1` : `${remoteUrl}?dl=1`
      const r = await fetch(trial, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (Node.js) Bot", Referer: v } })
      console.log("Intent dl=1 status:", r.status, r.headers.get("content-type"), r.headers.get("content-length"))
      if (r.ok && (r.headers.get("content-type") || "").includes("audio")) {
        const buf = Buffer.from(await r.arrayBuffer())
        await conn.sendMessage(m.chat, { audio: buf, mimetype: "audio/mpeg", fileName: `${video.title}.mp3` }, { quoted: m })
        return
      }
    } catch (eTrial) {
      console.log("Trial dl=1 fallo:", eTrial.message)
    }

    // Si llega aquí, la descarga directa de api.res.url falló: usar fallbacks conocidos
    throw new Error("No fue posible obtener el binario desde la URL de la API (probable HTML/redirect). Procediendo a fallbacks.")
  } catch (err) {
    console.log("Fallback iniciando por error:", err.message)

    // FALLBACK 1: Bochilteam scraper con v (url)
    try {
      const yt = await youtubedl(v).catch(async _ => await youtubedlv2(v))
      const dl_url = await yt.audio["128kbps"].download()
      const ttl = yt.title || video.title || "audio"
      await conn.sendMessage(m.chat, { audio: { url: dl_url }, mimetype: "audio/mpeg", fileName: `${ttl}.mp3` }, { quoted: m })
      return
    } catch (e1) {
      console.log("Fallback bochilteam falló:", e1.message)
    }

    // FALLBACK 2: ytdl-core
    try {
      const info = await ytdl.getInfo(v)
      const format = ytdl.chooseFormat(info.formats, { filter: "audioonly" })
      if (!format || !format.url) throw new Error("ytdl no devolvió formato válido")
      await conn.sendMessage(m.chat, { audio: { url: format.url }, mimetype: "audio/mpeg" }, { quoted: m })
      return
    } catch (e2) {
      console.log("Fallback ytdl falló:", e2.message)
    }

    // Si todo falló, mandar mensaje con info útil para debugging
    m.reply(
      `⚠️ No se pudo descargar el audio desde Sylphy ni desde los fallbacks.\n\nHe registrado en consola la respuesta de la API (Sylphy). Por favor, pega aquí la salida de la consola que empieza con "Sylphy API response:" para que lo revise.`
    )
  }
}

handler.command = ["play"]
handler.exp = 0
export default handler

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: "es", gl: "ES", ...options })
  return search.videos
}
