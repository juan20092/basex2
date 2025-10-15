import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from "ytdl-core"
import { youtubedl, youtubedlv2 } from "@bochilteam/scraper"

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text)
    throw `¿Qué canción quieres descargar?\n\nUso:\n${usedPrefix + command} nombre del video o artista`

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

    // 🔹 ENVÍO DE MINIATURA (NO DESCARGABLE)
    await conn.sendMessage(
      m.chat,
      {
        image: { url: sanka.thumbnail || video.thumbnail },
        caption: `🎵 *${sanka.title || video.title}*\n⏱️ Duración: ${sanka.duration || video.timestamp}\n\n_Enviando audio..._`
      },
      { quoted: m }
    )

    // 🔹 ENVÍO DE AUDIO POR SEPARADO
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: fileName
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
      const thumb = await yt.thumbnail

      // Miniatura primero
      await conn.sendMessage(
        m.chat,
        {
          image: { url: thumb },
          caption: `🎵 *${ttl}*\n\n_Enviando audio..._`
        },
        { quoted: m }
      )

      // Audio después
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

        // Miniatura primero
        await conn.sendMessage(
          m.chat,
          {
            image: { url: info.videoDetails.thumbnails[0].url },
            caption: `🎵 *${info.videoDetails.title}*\n\n_Enviando audio..._`
          },
          { quoted: m }
        )

        // Audio después
        await conn.sendMessage(
          m.chat,
          { 
            audio: { url: format.url }, 
            mimetype: "audio/mpeg",
            fileName: `${info.videoDetails.title}.mp3`
          },
          { quoted: m }
        )
      } catch (e) {
        m.reply(`⚠️ Error final: ${e.message}`)
      }
    }
  }
}

handler.command = ["play2"]
handler.exp = 0
export default handler

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: "es", gl: "ES", ...options })
  return search.videos
}

function sanitizeFilename(name = "audio") {
  return String(name).replace(/[\\/:*?"<>|]/g, "").slice(0, 200
