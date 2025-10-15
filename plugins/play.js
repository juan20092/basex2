import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from "ytdl-core"
import { youtubedl, youtubedlv2 } from "@bochilteam/scraper"
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const { ytmp3 } = require("@hiudyy/ytdl") // API funcional

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text)
    throw `¿𝙌𝙪𝙚 𝙘𝙖𝙣𝙘𝙞𝙤́𝙣 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙤?

Uso:
${usedPrefix + command} nombre del video o artista`

  try {
    await m.react("🕓")

    // 🔹 Búsqueda en YouTube
    const yt_play = await search(args.join(" "))
    const video = yt_play[0]
    if (!video) throw "No se encontró ningún video con ese término."

    const v = video.url // URL del video para fallbacks

    await m.react("✅")

    // 🔹 DESCARGA PRINCIPAL CON API @hiudyy/ytdl
    const result = await ytmp3(v)
    const fileName = `${sanitizeFilename(video.title)}.mp3`

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: result },
        mimetype: "audio/mpeg",
        fileName,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: "Descargado con API @hiudyy/ytdl",
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

function sanitizeFilename(name = "audio") {
  return String(name).replace(/[\\/:*?"<>|]/g, "").slice(0, 200)
}
