import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from "ytdl-core"
import { youtubedl, youtubedlv2 } from "@bochilteam/scraper"

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text)
    throw `¿Qué canción quieres descargar?

Uso:
${usedPrefix + command} nombre del video o artista`

  try {
    await m.react("🕓")

    // 🔹 Búsqueda en YouTube
    const yt_play = await search(args.join(" "))
    const video = yt_play[0]
    if (!video) throw "No se encontró ningún video con ese término."

    const v = video.url // URL del video para fallback

    await m.react("✅")

    // 🔹 DESCARGA PRINCIPAL CON SANKA VOLLEREI
    const sanka = await getFromSanka(v)
    const fileName = `${sanitizeFilename(sanka.title || video.title)}.mp3`
    const audioUrl = sanka.download

    // 🔹 ENVIAR SOLO EL AUDIO (eliminado el envío de imagen por separado)
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: fileName,
        contextInfo: {
          externalAdReply: {
            title: sanka.title || video.title,
            body: "Descargado con Sanka Vollerei",
            thumbnailUrl: sanka.thumbnail || video.thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: v
          }
        }
      },
      { quoted: m }
    )
  } catch (err) {
    console.log("❌ Error en descarga principal Sanka:", err)
    try {
      // 🔹 Fallback 1 — Bochilteam Scraper
      const yt = await youtubedl(v).catch(async _ => await youtubedlv2(v))
      const dl_url = await yt.audio["128kbps"].download()
      const ttl = await yt.title

      // 🔹 ENVIAR SOLO EL AUDIO (eliminado el envío de imagen por separado)
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: dl_url },
          mimetype: "audio/mpeg",
          fileName: `${ttl}.mp3`
        },
        { quoted: m }
      )
    } catch {
      try {
        // 🔹 Fallback 2 — ytdl-core directo
        let info = await ytdl.getInfo(v)
        let format = ytdl.chooseFormat(info.formats, { filter: "audioonly" })

        // 🔹 ENVIAR SOLO EL AUDIO (eliminado el envío de imagen por separado)
        await conn.sendMessage(
          m.chat,
          { audio: { url: format.url }, mimetype: "audio/mpeg" },
          { quoted: m }
        )
      } catch (e) {
        m.reply(`⚠️ Error final: ${e.message}`)
      }
    }
  }
}

handler.command = ["play"]
handler.exp = 0
export default handler

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: "es", gl: "ES", ...options })
  return search.videos
}

function sanitizeFilename(name = "audio") {
  return String(name).replace(/[\\/:*?"<>|]/g, "").slice(0, 200)
