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
      // Intentar tus APIs funcionales
      audioData = await getAudioFromYourAPIs(v, video.title)
    } catch (apiError) {
      console.log("❌ Error en APIs funcionales:", apiError.message)
      
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
          isDirect: false
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
          isDirect: true
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
            body: `Duración: ${audioData.duration}`,
            thumbnailUrl: audioData.thumbnail || video.thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    )

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

// 🔹 FUNCIÓN CON TUS APIs FUNCIONALES (INTEGRADAS)
async function getAudioFromYourAPIs(youtubeUrl, videoTitle) {
  // Extraer ID del video para algunas APIs
  const videoId = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/)?.[1] || ''
  
  // 🔹 LISTA DE TUS APIs FUNCIONALES (del segundo código)
  const apis = [
    // API 1: Dorratz API
    {
      name: "Dorratz",
      url: `https://api.dorratz.com/v3/ytdl?url=${encodeURIComponent(youtubeUrl)}`,
      parser: async (data) => {
        const mp3 = data.medias?.find(media => 
          (media.quality === "160kbps" || media.quality === "128kbps") && 
          media.extension === "mp3"
        )
        return mp3 ? {
          url: mp3.url,
          title: videoTitle,
          duration: mp3.duration || 'N/A',
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          isDirect: false
        } : null
      }
    },
    
    // API 2: Neoxr API
    {
      name: "Neoxr",
      url: `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(youtubeUrl)}&type=audio&quality=128kbps&apikey=GataDios`,
      parser: (data) => {
        if (data.data?.url) {
          return {
            url: data.data.url,
            title: videoTitle,
            duration: 'N/A',
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            isDirect: false
          }
        }
        return null
      }
    },
    
    // API 3: FGMods API
    {
      name: "FGMods",
      url: `https://api.fgmods.xyz/api/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}&apikey=elrebelde21`,
      parser: (data) => {
        if (data.result?.dl_url) {
          return {
            url: data.result.dl_url,
            title: videoTitle,
            duration: 'N/A',
            thumbnail: data.result.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            isDirect: false
          }
        }
        return null
      }
    },
    
    // API 4: Siputzx API
    {
      name: "Siputzx",
      url: `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(youtubeUrl)}`,
      parser: (data) => {
        if (data.dl) {
          return {
            url: data.dl,
            title: videoTitle,
            duration: 'N/A',
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            isDirect: false
          }
        }
        return null
      }
    },
    
    // API 5: Zenkey API
    {
      name: "Zenkey",
      url: `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${encodeURIComponent(youtubeUrl)}`,
      parser: (data) => {
        if (data.result?.download?.url) {
          return {
            url: data.result.download.url,
            title: videoTitle,
            duration: data.result.duration || 'N/A',
            thumbnail: data.result.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            isDirect: false
          }
        }
        return null
      }
    },
    
    // API 6: Exonity API (por título)
    {
      name: "Exonity",
      url: `https://exonity.tech/api/dl/playmp3?query=${encodeURIComponent(videoTitle)}`,
      parser: (data) => {
        if (data.result?.download) {
          return {
            url: data.result.download,
            title: videoTitle,
            duration: 'N/A',
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            isDirect: false
          }
        }
        return null
      }
    }
  ]

  // 🔹 Intentar cada API hasta que una funcione
  for (let api of apis) {
    try {
      console.log(`🔹 Intentando API: ${api.name}`)
      
      // Configurar timeout
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      
      const res = await fetch(api.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeout)
      
      if (res.ok) {
        const data = await res.json()
        const result = await api.parser(data)
        
        if (result && result.url) {
          console.log(`✅ API ${api.name} funcionó correctamente`)
          
          // Verificar que el archivo sea accesible
          try {
            const headRes = await fetch(result.url, { method: 'HEAD', timeout: 5000 })
            if (headRes.ok) {
              return result
            }
          } catch (checkError) {
            console.log(`⚠️ API ${api.name} devolvió URL no accesible`)
            continue // Intentar siguiente API
          }
        }
      }
    } catch (error) {
      console.log(`❌ API ${api.name} falló:`, error.message)
      continue // Intentar siguiente API
    }
  }
  
  throw new Error("Todas las APIs funcionales fallaron")
}

// 🔹 Función para obtener tamaño del archivo (opcional)
async function getFileSize(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', timeout: 5000 })
    return parseInt(res.headers.get('content-length') || 0)
  } catch {
    return 0
  }
}
