import { ytdl } from "@bochilteam/scraper"
import yts from "yt-search"
import ytdlCore from "ytdl-core"

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) throw `🎵 ¿Qué canción quieres descargar?\n\nUso: ${usedPrefix + command} <nombre del video>`
  
  // 🔹 Validación de entrada
  if (text.length > 100) throw "❌ La búsqueda es demasiado larga (máx. 100 caracteres)"
  
  try {
    await m.react("🕓")
    
    // 🔹 Búsqueda con timeout
    const searchResults = await Promise.race([
      search(args.join(" ")),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout en búsqueda")), 15000)
      )
    ])
    
    const video = searchResults[0]
    if (!video) throw "❌ No se encontró ningún video con ese término"
    
    await m.react("✅")
    
    // 🔹 Intentar descargas en orden de preferencia
    const audioData = await tryDownloadMethods(video.url, video.title)
    
    await conn.sendMessage(m.chat, {
      audio: { url: audioData.url },
      mimetype: "audio/mpeg",
      fileName: audioData.filename,
      contextInfo: {
        externalAdReply: {
          title: audioData.title || video.title,
          body: "🎶 Descarga completada",
          thumbnailUrl: audioData.thumbnail || video.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: video.url
        }
      }
    }, { quoted: m })
    
  } catch (error) {
    console.error("❌ Error general:", error)
    await m.react("❌")
    await m.reply(`⚠️ Error: ${error.message}`)
  }
}

// 🔹 Función mejorada de descarga con métodos ordenados
async function tryDownloadMethods(url, title) {
  const methods = [
    { name: "Sanka Vollerei", fn: getFromSanka },
    { name: "Bochilteam", fn: getFromBochilteam },
    { name: "ytdl-core", fn: getFromYtdlCore }
  ]
  
  for (const method of methods) {
    try {
      console.log(`🔄 Intentando descarga con: ${method.name}`)
      const result = await Promise.race([
        method.fn(url, title),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout en ${method.name}`)), 10000)
        )
      ])
      console.log(`✅ Éxito con: ${method.name}`)
      return result
    } catch (error) {
      console.warn(`❌ Falló ${method.name}:`, error.message)
      // Continuar al siguiente método
    }
  }
  
  throw new Error("Todos los métodos de descarga fallaron")
}

// 🔹 Sanka Vollerei mejorado
async function getFromSanka(youtubeUrl, title) {
  const endpoint = `https://www.sankavollerei.com/download/ytmp3?apikey=planaai&url=${encodeURIComponent(youtubeUrl)}`
  
  const response = await fetch(endpoint)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  
  const data = await response.json()
  
  // Validación robusta de la respuesta
  if (!data?.status || !data?.result?.download) {
    throw new Error("Respuesta inválida del servicio")
  }
  
  return {
    url: data.result.download,
    filename: `${sanitizeFilename(data.result.title || title)}.mp3`,
    title: data.result.title,
    thumbnail: data.result.thumbnail
  }
}

// 🔹 Bochilteam mejorado
async function getFromBochilteam(url, title) {
  const yt = await ytdl(url)
  const downloadUrl = await yt.audio["128kbps"].download()
  
  return {
    url: downloadUrl,
    filename: `${sanitizeFilename(yt.title || title)}.mp3`,
    title: yt.title
  }
}

// 🔹 ytdl-core mejorado
async function getFromYtdlCore(url, title) {
  const info = await ytdlCore.getInfo(url)
  const format = ytdlCore.chooseFormat(info.formats, { 
    filter: "audioonly",
    quality: "highestaudio"
  })
  
  if (!format) throw new Error("No se encontró formato de audio")
  
  return {
    url: format.url,
    filename: `${sanitizeFilename(info.videoDetails.title || title)}.mp3`,
    title: info.videoDetails.title
  }
}

// 🔹 Búsqueda con manejo de errores
async function search(query, options = {}) {
  try {
    const search = await yts.search({ 
      query, 
      hl: "es", 
      gl: "ES", 
      ...options 
    })
    return search.videos || []
  } catch (error) {
    throw new Error(`Error en búsqueda: ${error.message}`)
  }
}

// 🔹 Sanitización mejorada
function sanitizeFilename(name = "audio") {
  return String(name)
    .replace(/[\\/:*?"<>|]/g, "")
    .trim()
    .slice(0, 100) // Límite más conservador
}

handler.command = ["play", "musica", "song"]
handler.exp = 0
export default handler
