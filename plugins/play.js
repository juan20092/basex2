import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from "ytdl-core"
import { youtubedl, youtubedlv2 } from "@bochilteam/scraper"

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text)
    throw `¿𝙌𝙪𝙚 𝙘𝙖𝙣𝙘𝙞𝙤́𝙣 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙤?

» 𝘌𝘭 𝘶𝘴𝘰 𝘥𝘦𝘭 𝘤𝘰𝘮𝘢𝘯𝘥𝘰 𝘦𝘴 :
${usedPrefix + command} feid normal`

  try {
    await m.react("🕓")

    const yt_play = await search(args.join(" "))
    const video = yt_play[0]

    await m.react("✅")

    // 🔹 DESCARGA PRINCIPAL CON API DE SYLPHY
    const api = await (
      await fetch(
        `https://api.sylphy.xyz/download/ytmp3?url=${video.url}&apikey=sylphy-e321`
      )
    ).json()

    if (!api?.res?.url)
      throw "Error: No se obtuvo URL de descarga desde la API Sylphy."

    // 🔸 Enviar solo el audio con miniatura (sin mensaje previo)
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: api.res.url },
        mimetype: "audio/mpeg",
        fileName: `${video.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: "Descargado con Sylphy API",
            thumbnailUrl: video.thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: video.url
          }
        }
      },
      { quoted: m }
    )
  } catch (err) {
    console.log("❌ Error en descarga principal:", err)
    try {
      // 🔹 Fallback 1 — Bochilteam Scraper
      const yt = await youtubedl(v).catch(async _ => await youtubedlv2(v))
      const dl_url = await yt.audio["128kbps"].download()
      const ttl = await yt.title

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
