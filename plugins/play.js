import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from "ytdl-core"
import { youtubedl, youtubedlv2 } from "@bochilteam/scraper"

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) throw `🎵 *¿Qué canción quieres descargar?*\n\n📌 *Uso:*\n${usedPrefix + command} <nombre de la canción>\n\n📝 *Ejemplo:*\n${usedPrefix + command} bad bunny`

  try {
    // Reacción de espera
    await m.react("🕓")

    // 🔍 Búsqueda en YouTube
    const searchResults = await yts.search({ query: text, hl: "es", gl: "ES" })
    if (!searchResults.videos.length) throw "❌ No se encontraron resultados para tu búsqueda."
    
    const video = searchResults.videos[0]
    const videoUrl = video.url
    const videoTitle = video.title
    const videoThumb = video.thumbnail

    // Información del video
    const infoMsg = `🎬 *INFORMACIÓN DEL VIDEO*\n
📌 *Título:* ${videoTitle}
⏱️ *Duración:* ${video.timestamp || "Desconocido"}
👁️ *Vistas:* ${video.views ? formatNumber(video.views) : "N/A"}
👤 *Canal:* ${video.author?.name || "Desconocido"}
📅 *Publicado:* ${video.ago || "N/A"}
🔗 *URL:* ${videoUrl}

⏳ *Descargando audio...*`

    // Enviar información con miniatura
    await conn.sendMessage(m.chat, {
      image: { url: videoThumb },
      caption: infoMsg,
      contextInfo: {
        externalAdReply: {
          title: "🎧 AlyaBot - Descargador MP3",
          body: "Convirtiendo a audio...",
          thumbnail: await (await fetch(videoThumb)).buffer(),
          mediaType: 1,
          sourceUrl: videoUrl
        }
      }
    }, { quoted: m })

    await m.react("✅")

    // 🎯 INTENTO 1: APIs principales
    let audioData = await getAudioFromWorkingAPIs(videoUrl, videoTitle)
    
    // 🎯 INTENTO 2: Fallback si la API falla
    if (!audioData) {
      await m.reply("⚠️ *API principal falló, intentando método alternativo...*")
      audioData = await getAudioFallback(videoUrl, videoTitle)
    }

    // 🎯 INTENTO 3: Último recurso (ytdl-core)
    if (!audioData) {
      await m.reply("🔄 *Usando método directo...*")
      audioData = await getAudioYtdl(videoUrl)
    }

    if (!audioData || !audioData.url) {
      throw "❌ No se pudo obtener el audio. Intenta con otro video."
    }

    // 📤 Enviar el audio
    await m.reply(`✅ *Audio descargado*\n📌 *Servidor:* ${audioData.api}\n📁 *Tamaño:* ${audioData.size || "Desconocido"}\n\n⏳ *Enviando...*`)

    await conn.sendMessage(m.chat, {
      audio: { url: audioData.url },
      mimetype: 'audio/mpeg',
      fileName: `${cleanFileName(videoTitle)}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: `🎧 ${videoTitle.substring(0, 60)}${videoTitle.length > 60 ? '...' : ''}`,
          body: `Servidor: ${audioData.api}`,
          thumbnail: await (await fetch(videoThumb)).buffer(),
          mediaType: 1,
          sourceUrl: videoUrl
        }
      }
    }, { quoted: m })

    await m.react("🎧")

  } catch (error) {
    console.error("Error en handler:", error)
    await m.react("❌")
    await m.reply(`❌ *Error:* ${error.message || error}\n\n⚠️ *Solución:*\n• Verifica tu conexión\n• Intenta con otro video\n• El video puede ser muy largo\n• O usa: ${usedPrefix}play2 para video`)
  }
}

handler.help = ['play', 'musica', 'audio', 'ytmp3', 'song']
handler.tags = ['downloader']
handler.command = /^(play|musica|audio|ytmp3|song|descargarmusica)$/i
handler.exp = 0
handler.limit = true
handler.premium = false
handler.register = true

export default handler

// ============================================
// 🔧 FUNCIONES PRINCIPALES
// ============================================

/**
 * 🎯 Obtener audio de APIs que SÍ funcionan
 */
async function getAudioFromWorkingAPIs(url, title) {
  const apis = [
    // ✅ API 1: Akuari.my.id (MUY CONFIABLE)
    {
      name: "Akuari API",
      url: `https://api.akuari.my.id/downloader/youtube?link=${encodeURIComponent(url)}`,
      parser: async (data) => {
        if (data.respon?.audio) {
          return {
            url: data.respon.audio,
            api: "Akuari.my.id",
            size: data.respon.size
          }
        }
        return null
      }
    },
    
    // ✅ API 2: YouTube MP3 Converter
    {
      name: "YouTube MP3",
      url: `https://yt1s.com/api/ajaxSearch/index`,
      method: "POST",
      body: new URLSearchParams({
        q: url,
        vt: "home"
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      parser: async (data) => {
        if (data.links && data.links.mp3) {
          const mp3 = Object.values(data.links.mp3).pop()
          if (mp3 && mp3.k) {
            const dlRes = await fetch(`https://yt1s.com/api/ajaxConvert/convert`, {
              method: "POST",
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                vid: data.vid,
                k: mp3.k
              })
            })
            const dlData = await dlRes.json()
            return {
              url: dlData.dlink,
              api: "YT1S.com",
              size: mp3.size
            }
          }
        }
        return null
      }
    },
    
    // ✅ API 3: ZenzAPI (sin key pública)
    {
      name: "ZenzAPI Pública",
      url: `https://zenzapis.xyz/downloader/youtube?url=${encodeURIComponent(url)}&apikey=free`,
      parser: (data) => {
        if (data.result?.audio) {
          return {
            url: data.result.audio,
            api: "ZenzAPI",
            size: data.result.size
          }
        }
        return null
      }
    },
    
    // ✅ API 4: API de bots populares
    {
      name: "Bots API",
      url: `https://api.botcahx.eu.org/api/download/youtube?url=${encodeURIComponent(url)}&type=audio`,
      parser: (data) => {
        if (data.result) {
          return {
            url: data.result,
            api: "Botcahx API"
          }
        }
        return null
      }
    },
    
    // ✅ API 5: Savetube (alternativa)
    {
      name: "Savetube",
      url: `https://api.savetube.io/api/v1/download?url=${encodeURIComponent(url)}&format=mp3`,
      parser: (data) => {
        if (data.url) {
          return {
            url: data.url,
            api: "Savetube.io"
          }
        }
        return null
      }
    }
  ]

  // Probar cada API
  for (const api of apis) {
    try {
      console.log(`🔹 Probando: ${api.name}`)
      
      let response
      if (api.method === "POST") {
        response = await fetch(api.url, {
          method: "POST",
          headers: api.headers || {},
          body: api.body
        })
      } else {
        response = await fetch(api.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          }
        })
      }

      if (response.ok) {
        const data = await response.json()
        const result = await api.parser(data)
        
        if (result && result.url) {
          // Verificar que el enlace sea válido
          const headRes = await fetch(result.url, { method: 'HEAD' })
          if (headRes.ok) {
            console.log(`✅ ${api.name} funcionó!`)
            return {
              url: result.url,
              title: title,
              api: result.api || api.name,
              size: result.size
            }
          }
        }
      }
    } catch (error) {
      console.log(`❌ ${api.name} falló:`, error.message)
      continue
    }
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  return null
}

/**
 * 🔄 Fallback con Bochilteam Scraper
 */
async function getAudioFallback(url, title) {
  try {
    const yt = await youtubedl(url).catch(async () => await youtubedlv2(url))
    const dlUrl = await yt.audio["128kbps"].download()
    
    return {
      url: dlUrl,
      title: title,
      api: "Bochilteam Scraper",
      isDirect: false
    }
  } catch (error) {
    console.log("❌ Bochilteam falló:", error.message)
    return null
  }
}

/**
 * 🚀 Último recurso: ytdl-core
 */
async function getAudioYtdl(url) {
  try {
    const info = await ytdl.getInfo(url)
    const format = ytdl.chooseFormat(info.formats, { 
      filter: 'audioonly',
      quality: 'highestaudio'
    })
    
    if (format && format.url) {
      return {
        url: format.url,
        title: info.videoDetails.title,
        api: "YouTube Direct",
        isDirect: true
      }
    }
  } catch (error) {
    console.log("❌ ytdl-core falló:", error.message)
  }
  return null
}

// ============================================
// 🛠️ FUNCIONES UTILITARIAS
// ============================================

/**
 * 📊 Formatear números grandes
 */
function formatNumber(num) {
  if (!num) return "0"
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B"
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}

/**
 * 🧹 Limpiar nombre de archivo
 */
function cleanFileName(name) {
  return name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100)
}

/**
 * ⏱️ Formatear segundos a tiempo
 */
function formatDuration(seconds) {
  if (!seconds) return "00:00"
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 📏 Obtener tamaño del archivo
 */
async function getFileSize(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const size = response.headers.get('content-length')
    if (size) {
      const mb = parseInt(size) / (1024 * 1024)
      return mb.toFixed(2) + " MB"
    }
  } catch (error) {
    console.log("Error obteniendo tamaño:", error.message)
  }
  return "Desconocido"
}

/**
 * 🔍 Buscar video alternativo (si el primero falla)
 */
async function searchAlternativeVideo(query) {
  try {
    const search = await yts.search({ query, hl: "es", gl: "ES" })
    if (search.videos.length > 1) {
      return search.videos[1] // Retorna el segundo resultado
    }
  } catch (error) {
    console.log("Error en búsqueda alternativa:", error)
  }
  return null
}
