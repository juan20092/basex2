import fetch from "node-fetch"
import axios from 'axios'

let handler = async (m, { conn, args, text, usedPrefix }) => {
  if (!text)
    throw `🎵 *¿Qué canción de Spotify quieres descargar?*\n\n📌 *Uso:*\n${usedPrefix + command} <nombre de la canción>\n\n📝 *Ejemplo:*\n${usedPrefix + command} bad bunny un verano sin ti`

  // Control de solicitudes simultáneas
  if (global.userRequests && global.userRequests[m.sender]) {
    return m.reply(`⏳ *Espera un momento*\nYa estás descargando una canción. Espera a que termine.`)
  }
  
  global.userRequests = global.userRequests || {}
  global.userRequests[m.sender] = true

  try {
    await m.react("🕓")

    // 🎯 BUSCAR EN SPOTIFY
    const spotifyResults = await searchSpotify(text)
    if (!spotifyResults || spotifyResults.length === 0) {
      throw "❌ No se encontraron resultados en Spotify para tu búsqueda."
    }

    const track = spotifyResults[0]
    
    // 📋 INFORMACIÓN DE LA CANCIÓN
    const infoMsg = `🎵 *INFORMACIÓN DE LA CANCIÓN*\n
🎼 *Título:* ${track.name}
🎤 *Artista(s):* ${track.artists.join(', ')}
💿 *Álbum:* ${track.album}
⏱️ *Duración:* ${track.duration}
📅 *Publicado:* ${track.release_date || 'N/A'}
👁️ *Popularidad:* ${track.popularity || 'N/A'}%
🔗 *URL Spotify:* ${track.url}

⏳ *Descargando...*`

    // Enviar información con miniatura
    await conn.sendMessage(m.chat, {
      image: { url: track.image },
      caption: infoMsg,
      contextInfo: {
        externalAdReply: {
          title: "🎧 Spotify Downloader",
          body: "Convirtiendo a MP3...",
          thumbnailUrl: track.image,
          mediaType: 1,
          sourceUrl: track.url
        }
      }
    }, { quoted: m })

    await m.react("✅")

    // 🎯 DESCARGAR CANCIÓN CON APIS DE SPOTIFY
    let audioData = null
    
    // Intento 1: API Siputzx (de tu código)
    try {
      console.log("🔹 Intentando API Siputzx...")
      const res = await fetch(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(track.url)}`)
      const data = await res.json()
      
      if (data?.data?.download) {
        audioData = {
          url: data.data.download,
          api: "Siputzx API",
          title: track.name,
          artist: track.artists[0]
        }
      }
    } catch (e) {
      console.log("❌ Siputzx falló:", e.message)
    }

    // Intento 2: Otras APIs de Spotify
    if (!audioData) {
      audioData = await trySpotifyAPIs(track.url, track.name, track.artists[0])
    }

    // Intento 3: Buscar alternativa en YouTube
    if (!audioData) {
      await m.reply("⚠️ *API Spotify falló, buscando en YouTube...*")
      audioData = await searchYouTubeAlternative(track.name + " " + track.artists[0])
    }

    if (!audioData || !audioData.url) {
      throw "❌ No se pudo descargar la canción. Intenta con otro nombre."
    }

    // 📤 ENVIAR AUDIO
    await m.reply(`✅ *Canción descargada*\n📌 *Servidor:* ${audioData.api}\n🎤 *Artista:* ${audioData.artist}\n⏳ *Enviando...*`)

    await conn.sendMessage(m.chat, {
      audio: { url: audioData.url },
      mimetype: 'audio/mpeg',
      fileName: `${cleanFileName(track.name)} - ${cleanFileName(track.artists[0])}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: `🎧 ${track.name.substring(0, 60)}${track.name.length > 60 ? '...' : ''}`,
          body: `Artista: ${track.artists[0]}`,
          thumbnailUrl: track.image,
          mediaType: 1,
          sourceUrl: track.url
        }
      }
    }, { quoted: m })

    await m.react("🎧")

  } catch (error) {
    console.error("Error:", error)
    await m.react("❌")
    await m.reply(`❌ *Error:* ${error.message || error}\n\n⚠️ *Posibles soluciones:*\n• Verifica el nombre de la canción\n• Intenta con otro artista\n• La canción puede no estar disponible`)
  } finally {
    // Liberar usuario
    if (global.userRequests) {
      delete global.userRequests[m.sender]
    }
  }
}

handler.help = ['spotify', 'spotifydl', 'spotifymp3', 'music']
handler.tags = ['downloader']
handler.command = /^(spotify|spotifydl|spotifymp3|music|spotimusic)$/i
handler.exp = 0
handler.limit = true
handler.premium = false
handler.register = true

export default handler

// ============================================
// 🎯 FUNCIONES PRINCIPALES PARA SPOTIFY
// ============================================

/**
 * 🔍 Buscar en Spotify
 */
async function searchSpotify(query) {
  try {
    // Obtener token de Spotify
    const token = await getSpotifyToken()
    
    // Buscar tracks
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.tracks || !data.tracks.items.length) {
      return []
    }
    
    // Procesar resultados
    return data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(artist => artist.name),
      album: track.album.name,
      duration: formatDuration(track.duration_ms),
      url: track.external_urls.spotify,
      image: track.album.images[0]?.url || '',
      preview_url: track.preview_url,
      popularity: track.popularity,
      release_date: track.album.release_date
    }))
    
  } catch (error) {
    console.error("Error en searchSpotify:", error)
    
    // Fallback: Buscar con API pública
    return await searchSpotifyPublic(query)
  }
}

/**
 * 🔑 Obtener token de Spotify
 */
async function getSpotifyToken() {
  try {
    // Credenciales públicas (puedes cambiarlas)
    const clientId = '5c0986c5a6184288b2f4e5668e90c3a6'  // Ejemplo público
    const clientSecret = '7f78b15b6bdd4fe3a5ad7d31e1895698' // Ejemplo público
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: 'grant_type=client_credentials'
    })
    
    const data = await response.json()
    return data.access_token
    
  } catch (error) {
    console.error("Error obteniendo token Spotify:", error)
    // Token de respaldo
    return 'BQCl0mWCEjw_kbTmBw-Wj5Om4kP4r69F-9jKlOCwVlRj9dNR-N_VBUVf48D3eTOlOlnD8yV8BdMsqVH2zRx29MGDnW5U9IZ8UeIzFQN79XHEnTtJ7cY'
  }
}

/**
 * 🔄 Buscar en Spotify con API pública
 */
async function searchSpotifyPublic(query) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
      headers: {
        'Authorization': 'Bearer BQCl0mWCEjw_kbTmBw-Wj5Om4kP4r69F-9jKlOCwVlRj9dNR-N_VBUVf48D3eTOlOlnD8yV8BdMsqVH2zRx29MGDnW5U9IZ8UeIzFQN79XHEnTtJ7cY'
      }
    })
    
    const data = await response.json()
    return data.tracks?.items.map(track => ({
      name: track.name,
      artists: track.artists.map(artist => artist.name),
      album: track.album.name,
      duration: formatDuration(track.duration_ms),
      url: track.external_urls.spotify,
      image: track.album.images[0]?.url || ''
    })) || []
    
  } catch (error) {
    console.error("Error en searchSpotifyPublic:", error)
    return []
  }
}

/**
 * ⬇️ Intentar diferentes APIs para descargar de Spotify
 */
async function trySpotifyAPIs(spotifyUrl, title, artist) {
  const apis = [
    // API 1: Siputzx (funcional)
    {
      name: "Siputzx API",
      url: `https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(spotifyUrl)}`,
      parser: (data) => data?.data?.download || data?.download
    },
    
    // API 2: SpotiDL API
    {
      name: "SpotiDL",
      url: `https://spotidl.vercel.app/download?url=${encodeURIComponent(spotifyUrl)}`,
      parser: (data) => data?.download_url || data?.url
    },
    
    // API 3: SpotifyDL
    {
      name: "SpotifyDL",
      url: `https://spotifydl-api.vercel.app/?url=${encodeURIComponent(spotifyUrl)}`,
      parser: (data) => data?.result?.download_link || data?.downloadLink
    },
    
    // API 4: Spotify MP3 Downloader
    {
      name: "SpotifyMP3",
      url: `https://api.spotify-downloader.com/?url=${encodeURIComponent(spotifyUrl)}`,
      parser: (data) => data?.audio || data?.mp3
    },
    
    // API 5: All Media API
    {
      name: "AllMedia API",
      url: `https://api.allmediadata.com/download/spotify?url=${encodeURIComponent(spotifyUrl)}`,
      parser: (data) => data?.url || data?.download
    },
    
    // API 6: Music DL
    {
      name: "MusicDL",
      url: `https://musicdl.vercel.app/api/spotify?url=${encodeURIComponent(spotifyUrl)}`,
      parser: (data) => data?.downloadUrl || data?.url
    }
  ]

  for (const api of apis) {
    try {
      console.log(`🔹 Probando API Spotify: ${api.name}`)
      
      const response = await fetch(api.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      })
      
      if (response.ok) {
        const data = await response.json()
        const downloadUrl = api.parser(data)
        
        if (downloadUrl && downloadUrl.startsWith('http')) {
          // Verificar que el enlace funcione
          const headRes = await fetch(downloadUrl, { method: 'HEAD' })
          if (headRes.ok) {
            console.log(`✅ ${api.name} funcionó!`)
            return {
              url: downloadUrl,
              api: api.name,
              title: title,
              artist: artist
            }
          }
        }
      }
    } catch (error) {
      console.log(`❌ ${api.name} falló:`, error.message)
      continue
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  return null
}

/**
 * 🎥 Buscar alternativa en YouTube
 */
async function searchYouTubeAlternative(query) {
  try {
    const yts = await import('yt-search')
    const search = await yts.default({ query, hl: "es", gl: "ES" })
    
    if (search.videos && search.videos.length > 0) {
      const video = search.videos[0]
      
      // Descargar usando ytdl-core
      const ytdl = await import('ytdl-core')
      const info = await ytdl.default.getInfo(video.url)
      const format = ytdl.default.chooseFormat(info.formats, { 
        filter: 'audioonly',
        quality: 'highestaudio'
      })
      
      if (format && format.url) {
        return {
          url: format.url,
          api: "YouTube Alternative",
          title: video.title,
          artist: "From YouTube"
        }
      }
    }
  } catch (error) {
    console.error("Error en YouTube alternative:", error)
  }
  return null
}

// ============================================
// 🛠️ FUNCIONES UTILITARIAS
// ============================================

/**
 * ⏱️ Formatear duración
 */
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * 🧹 Limpiar nombre de archivo
 */
function cleanFileName(name) {
  return name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 50)
}

/**
 * 📊 Formatear número
 */
function formatNumber(num) {
  if (!num) return "0"
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}
