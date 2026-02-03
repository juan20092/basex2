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
    const v = video.url

    await m.react("✅")

    // 🔹 DESCARGA PRINCIPAL CON TUS APIs FUNCIONALES
    let audioData = null
    
    try {
      // Intentar tus APIs funcionales (las que funcionan)
      audioData = await getAudioFromAPIs(v, video.title)
      
      if (audioData.url) {
        m.reply(`> ❀ *Audio procesado. Servidor:* \`${audioData.api}\``)
      }
    } catch (apiError) {
      console.log("❌ Error en APIs:", apiError.message)
      
      // 🔹 Fallback 1 — Bochilteam Scraper
      try {
        const yt = await youtubedl(v).catch(async _ => await youtubedlv2(v))
        const dl_url = await yt.audio["128kbps"].download()
        const ttl = await yt.title
        const thumb = await yt.thumbnail

        audioData = {
          url: dl_url,
          title: ttl,
          duration: video?.timestamp || 'N/A',
          thumbnail: thumb,
          isDirect: false,
          api: "Bochilteam Scraper"
        }
      } catch {
        // 🔹 Fallback 2 — ytdl-core directo
        let info = await ytdl.getInfo(v)
        let format = ytdl.chooseFormat(info.formats, { filter: "audioonly" })
        let thumb = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url

        audioData = {
          url: format.url,
          title: info.videoDetails.title,
          duration: `${info.videoDetails.lengthSeconds} segundos`,
          thumbnail: thumb,
          isDirect: true,
          api: "ytdl-core"
        }
      }
    }

    // 🔹 ENVÍO DE AUDIO CON MINIATURA
    const fileName = `${sanitizeFilename(audioData.title)}.mp3`
    
    await conn.sendMessage(
      m.chat,
      {
        audio: { 
          url: audioData.url 
        },
        mimetype: "audio/mpeg",
        fileName: fileName,
        contextInfo: {
          externalAdReply: {
            title: audioData.title,
            body: `Duración: ${audioData.duration}\nServidor: ${audioData.api}`,
            thumbnailUrl: audioData.thumbnail || video.thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    )

    await m.react("✔️")

  } catch (err) {
    console.error("❌ Error general:", err)
    await m.react("❌")
    m.reply(`⚠️ Error al procesar la solicitud: ${err.message}`)
  }
}

handler.command = ["play"]
handler.exp = 0
export default handler

// 🔹 FUNCIONES AUXILIARES

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: "es", gl: "ES", ...options })
  return search.videos
}

function sanitizeFilename(name = "audio") {
  return String(name).replace(/[\\/:*?"<>|]/g, "").slice(0, 200)
}

// 🔹 FUNCIÓN CON TUS APIs FUNCIONALES (exactamente como en tu código)
async function getAudioFromAPIs(url, title) {
  // 🔹 LISTA DE TUS APIs QUE SÍ FUNCIONAN
  const apis = [
    {
      api: 'ZenzzXD',
      endpoint: `https://zenzapis.xyz/downloader/ytmp3?url=${encodeURIComponent(url)}&apikey=YOUR_API_KEY`,
      extractor: res => res.data?.download_url || res.result?.download_url
    },
    {
      api: 'ZenzzXD v2',
      endpoint: `https://zenzapis.xyz/downloader/ytmp3v2?url=${encodeURIComponent(url)}&apikey=YOUR_API_KEY`,
      extractor: res => res.data?.download_url || res.result?.download_url
    },
    {
      api: 'Yupra',
      endpoint: `https://api.yupra.org/api/downloader/ytmp3?url=${encodeURIComponent(url)}`,
      extractor: res => res.result?.link || res.data?.link
    },
    {
      api: 'Vreden',
      endpoint: `https://api.vredendjogja.com/api/v1/download/youtube/audio?url=${encodeURIComponent(url)}&quality=128`,
      extractor: res => res.result?.download?.url || res.data?.download?.url
    },
    {
      api: 'Vreden v2',
      endpoint: `https://api.vredendjogja.com/api/v1/download/play/audio?query=${encodeURIComponent(title)}`,
      extractor: res => res.result?.download?.url || res.data?.download?.url
    },
    {
      api: 'Xyro',
      endpoint: `https://api.xyro.io/download/youtubemp3?url=${encodeURIComponent(url)}`,
      extractor: res => res.result?.download || res.data?.download
    }
  ]

  // 🔹 Intentar cada API (exactamente como tu función fetchFromApis)
  for (const { api, endpoint, extractor } of apis) {
    try {
      console.log(`🔹 Probando API: ${api}`)
      
      // Configurar timeout de 10 segundos
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      
      // Hacer la petición
      const response = await fetch(endpoint, { 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        signal: controller.signal 
      })
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        console.log(`❌ ${api}: HTTP ${response.status}`)
        continue
      }
      
      const data = await response.json()
      const link = extractor(data)
      
      if (link && typeof link === 'string' && link.startsWith('http')) {
        console.log(`✅ ${api}: Funcionó!`)
        
        // Verificar que el enlace sea accesible
        const headResponse = await fetch(link, { method: 'HEAD', timeout: 5000 })
        if (headResponse.ok) {
          return {
            url: link,
            title: title,
            api: api,
            isDirect: false
          }
        }
      } else {
        console.log(`❌ ${api}: No devolvió enlace válido`)
      }
    } catch (error) {
      console.log(`❌ ${api}: ${error.message}`)
    }
    
    // Esperar 500ms antes de intentar la siguiente API
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  throw new Error("Todas las APIs fallaron")
}

// 🔹 Función para formatear vistas (opcional, de tu código)
function formatViews(views) {
  if (views === undefined) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}
