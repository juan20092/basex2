import yts from 'yt-search'

export default {
  name: 'play',
  command: ['play'],
  category: 'descargas',

  async run(ctx) {
    const { sock: conn, m, from, args } = ctx

    try {
      const query = Array.isArray(args) ? args.join(' ').trim() : ''

      if (!query) {
        return await conn.sendMessage(
          from,
          { text: 'Ejemplo:\n.yts anuel aa' },
          { quoted: m }
        )
      }

      const res = await yts(query)
      const videos = Array.isArray(res?.videos) ? res.videos.slice(0, 10) : []

      if (!videos.length) {
        return await conn.sendMessage(
          from,
          { text: 'No encontré resultados.' },
          { quoted: m }
        )
      }

      let thumbBuffer = null
      try {
        if (videos[0]?.thumbnail) {
          const response = await fetch(videos[0].thumbnail)
          const arrayBuffer = await response.arrayBuffer()
          thumbBuffer = Buffer.from(arrayBuffer)
        }
      } catch (e) {
        console.error('Error descargando thumbnail:', e)
      }

      const mp3Rows = videos.map((v, i) => ({
        header: `${i + 1}`,
        title: String(v.title || 'Sin título').slice(0, 72),
        description: `🎵 MP3 | ⏱ ${v.timestamp || '??:??'} | 👤 ${v.author?.name || 'Desconocido'}`.slice(0, 72),
        id: `.ytmp3 ${v.url}`
      }))

      const mp4Rows = videos.map((v, i) => ({
        header: `${i + 1}`,
        title: String(v.title || 'Sin título').slice(0, 72),
        description: `🎬 MP4 | ⏱ ${v.timestamp || '??:??'} | 👤 ${v.author?.name || 'Desconocido'}`.slice(0, 72),
        id: `.ytmp4 ${v.url}`
      }))

      if (thumbBuffer) {
        await conn.sendMessage(
          from,
          {
            image: thumbBuffer,
            caption:
              `🎵 *FSOCIETY BOT*\n\n` +
              `🔎 Resultado para: *${query}*\n` +
              `📌 Primer resultado: *${videos[0].title}*\n\n` +
              `Ahora selecciona si quieres descargar en MP3 o MP4.`
          },
          { quoted: m }
        )
      } else {
        await conn.sendMessage(
          from,
          {
            text:
              `🎵 *FSOCIETY BOT*\n\n` +
              `🔎 Resultado para: *${query}*\n\n` +
              `Selecciona si quieres descargar en MP3 o MP4.`
          },
          { quoted: m }
        )
      }

      return await conn.sendMessage(
        from,
        {
          text: `Resultados para: ${query}`,
          title: 'FSOCIETY BOT',
          subtitle: 'Selecciona formato',
          footer: 'Descargas YouTube',
          interactiveButtons: [
            {
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: '🎵 Descargar MP3',
                sections: [
                  {
                    title: 'Resultados MP3',
                    rows: mp3Rows
                  }
                ]
              })
            },
            {
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: '🎬 Descargar MP4',
                sections: [
                  {
                    title: 'Resultados MP4',
                    rows: mp4Rows
                  }
                ]
              })
            }
          ]
        },
        { quoted: m }
      )
    } catch (e) {
      console.error('Error en ysearch:', e)

      return await conn.sendMessage(
        from,
        { text: `Error en ysearch:\n${e?.message || e}` },
        { quoted: m }
      )
    }
  }
}    title: data?.title || data?.result?.title || "audio",
    fileName: String(data?.filename || data?.fileName || data?.result?.filename || "audio.bin").trim() || "audio.bin",
  }
}

async function resolveFastestAudioLink(videoUrl) {
  const sources = [
    { endpointUrl: API_AUDIO_URL, sourceLabel: "principal" },
    { endpointUrl: API_AUDIO_LEGACY_URL, sourceLabel: "legacy" },
    { endpointUrl: API_AUDIO_ALT_URL, sourceLabel: "alterna" },
  ]
  
  for (const source of sources) {
    try {
      const result = await requestAudioLink(videoUrl, source.endpointUrl, source.sourceLabel)
      return result
    } catch (error) {
      console.log(`Error con ${source.sourceLabel}:`, error.message)
      continue
    }
  }
  
  throw new Error("No se pudo obtener un enlace de descarga desde las rutas internas.")
}

async function fetchJson(url, timeoutMs = HTTP_TIMEOUT_MS) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: ctrl.signal,
      headers: { accept: 'application/json', 'user-agent': 'Mozilla/5.0' }
    })
    const text = await res.text().catch(() => '')
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }
    if (!res.ok) {
      const msg = data?.message || data?.error || text || `HTTP ${res.status}`
      throw new Error(`HTTP ${res.status}: ${String(msg).slice(0, 400)}`)
    }
    if (data == null) throw new Error('Respuesta JSON inválida')
    return data
  } finally {
    clearTimeout(t)
  }
}

async function fetchBuffer(url, timeoutMs = HTTP_TIMEOUT_MS) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': 'Mozilla/5.0' } })
    if (!res.ok) throw new Error(`No se pudo bajar el audio (HTTP ${res.status})`)
    const ab = await res.arrayBuffer()
    return Buffer.from(ab)
  } finally {
    clearTimeout(t)
  }
}

function parseDurationToSeconds(d) {
  if (d == null) return null
  if (typeof d === 'number' && Number.isFinite(d)) return Math.max(0, Math.floor(d))
  const s = String(d).trim()
  if (!s) return null
  if (/^\d+$/.test(s)) return Math.max(0, parseInt(s, 10))
  const parts = s.split(':').map((x) => x.trim()).filter(Boolean)
  if (!parts.length || parts.some((p) => !/^\d+$/.test(p))) return null
  let sec = 0
  for (const p of parts) sec = sec * 60 + parseInt(p, 10)
  return Number.isFinite(sec) ? sec : null
}

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) throw `⭐ 𝘐𝘯𝘨𝘳𝘦𝘴𝘢 𝘦𝘭 𝘵𝘪́𝘵𝘶𝘭𝘰 𝘥𝘦 𝘭𝘢 𝘤𝘢𝘯𝘤𝘪𝘰́𝘯 𝘲𝘶𝘦 𝘥𝘦𝘴𝘦𝘢𝘴 𝘥𝘦𝘴𝘤𝘢𝘳𝘨𝘢𝘳.

» 𝘌𝘫𝘦𝘮𝘱𝘭𝘰:
${usedPrefix + command} Cypher - Rich vagos `

  try {
    await m.react('⚡')
    
    // Usar la nueva función de búsqueda
    const searchResult = await resolveSearch(args.join(" "))
    const yt_play = [{
      title: searchResult.title,
      url: searchResult.videoUrl,
      thumbnail: searchResult.thumbnail,
      duration: { seconds: null }
    }]
    
    let additionalText = ''
    if (command === 'play') {
      additionalText = ''
    } else if (command === 'play8') {
      additionalText = 'video 🎥'
    }

    // Verificar duración máxima
    const durSec = parseDurationToSeconds(yt_play[0]?.duration?.seconds) ?? 
                    parseDurationToSeconds(yt_play[0]?.seconds) ?? 
                    parseDurationToSeconds(yt_play[0]?.duration) ?? 
                    parseDurationToSeconds(yt_play[0]?.timestamp)

    if (durSec && durSec > MAX_SECONDS) {
      await conn.sendMessage(m.chat, { text: `⭐ Audio muy largo.\n> Máximo permitido: ${Math.floor(MAX_SECONDS / 60)} minutos.` }, { quoted: m })
      await m.react('❌')
      return
    }

    await conn.sendMessage(m.chat, {
      text: `*⌈🎵 YT MUSIC PREMIUM 🎵⌋*
01:27 ━━━━━⬤──── 05:48
*⇄ㅤ   ◁   ㅤ  ❚❚ㅤ     ▷ㅤ   ↻*
𝙀𝙡𝙞𝙩𝙚 𝘽𝙤𝙩 𝙂𝙡𝙤𝙗𝙖𝙡`, 
      contextInfo: {
        externalAdReply: {
          title: yt_play[0].title,
          body: "Elite Bot Global",
          thumbnailUrl: yt_play[0].thumbnail, 
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      } 
    }, { quoted: m })

    if (command == 'play') {	
      try {
        await m.react('💯')
        
        // Obtener el enlace de audio más rápido usando las nuevas APIs
        const audioLink = await resolveFastestAudioLink(yt_play[0].url)
        const audioBuffer = await fetchBuffer(audioLink.downloadUrl, HTTP_TIMEOUT_MS)
        
        await conn.sendMessage(m.chat, { 
          audio: audioBuffer, 
          mimetype: 'audio/mpeg',
          fileName: `${audioLink.title || yt_play[0].title}.mp3`
        }, { quoted: m })
        
      } catch (error) {
        console.log("Error con API principal:", error.message)
        try {
          // Fallback con ytdl-core
          let searchh = await yts(yt_play[0].url)
          let __res = searchh.all.map(v => v).filter(v => v.type == "video")
          let infoo = await ytdl.getInfo('https://youtu.be/' + __res[0].videoId)
          let ress = await ytdl.chooseFormat(infoo.formats, { filter: 'audioonly' })
          await conn.sendMessage(m.chat, { audio: { url: ress.url }, mimetype: 'audio/mpeg' }, { quoted: m })
        } catch (fallbackError) {
          await conn.sendMessage(m.chat, { text: '❌ Error: No se pudo descargar el audio con ningún método disponible.' }, { quoted: m })
          await m.react('❌')
        }
      }
    }  

    if (command == 'play8') {
      try {
        await m.react('✅')
        
        // Para video, usar la API de video (manteniendo la del código original)
        const apiUrl = `https://api-adonix.ultraplus.click/download/ytvideo?apikey=Adofreekey&url=${encodeURIComponent(yt_play[0].url)}`
        const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)

        if (apiResp?.status && apiResp?.data?.url) {
          await conn.sendMessage(m.chat, { 
            video: { url: apiResp.data.url }, 
            fileName: `${yt_play[0].title}.mp4`, 
            mimetype: 'video/mp4', 
            caption: `𝙑𝙄𝘿𝙀𝙊 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝘿𝙊 [✅] `, 
            thumbnail: await fetch(yt_play[0].thumbnail) 
          }, { quoted: m })
        } else {
          throw new Error('API de video no funcionó')
        }
      } catch {   
        try {  
          // Intentar con API alternativa de video
          const apiUrl2 = `https://gawrgura-api.onrender.com/download/ytmp4?url=${encodeURIComponent(yt_play[0].url)}`
          const res2 = await fetch(apiUrl2)
          const json2 = await res2.json()

          if (json2?.status && json2?.result) {
            await conn.sendMessage(m.chat, { 
              video: { url: json2.result }, 
              fileName: `${yt_play[0].title}.mp4`, 
              caption: `𝙑𝙄𝘿𝙀𝙊 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝘿𝙊 [✅] `, 
              thumbnail: { url: yt_play[0].thumbnail }, 
              mimetype: 'video/mp4' 
            }, { quoted: m })     
          } else {
            throw new Error('API alternativa de video falló')
          }
        } catch {  
          try {
            // Último recurso: ytdl-core para video
            let searchh = await yts(yt_play[0].url)
            let __res = searchh.all.map(v => v).filter(v => v.type == "video")
            let infoo = await ytdl.getInfo('https://youtu.be/' + __res[0].videoId)
            let format = ytdl.chooseFormat(infoo.formats, { quality: '18' })
            await conn.sendMessage(m.chat, { 
              video: { url: format.url }, 
              fileName: `${yt_play[0].title}.mp4`, 
              mimetype: 'video/mp4', 
              caption: `𝙑𝙄𝘿𝙀𝙊 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝘿𝙊 𝘾𝙊𝙉 𝙐𝙇𝙏𝙄𝙈𝙊 𝙍𝙀𝘾𝙐𝙍𝙎𝙊 [✅] `, 
              thumbnail: await fetch(yt_play[0].thumbnail) 
            }, { quoted: m })
          } catch {
            await conn.sendMessage(m.chat, { text: '❌ Error: No se pudo descargar el video con ningún método disponible.' }, { quoted: m })
            await m.react('❌')
          }
        }
      }
    }
  } catch (error) {
    console.error(error)
    await conn.sendMessage(m.chat, { text: `❌ Error general: ${error.message}` }, { quoted: m })
    await m.react('❌')
  }
}

handler.command = ['play', 'play8']
handler.exp = 0
export default handler

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: "es", gl: "ES", ...options });
  return search.videos
}

function MilesNumber(number) {
  const exp = /(\d)(?=(\d{3})+(?!\d))/g;
  const rep = "$1.";
  let arr = number.toString().split(".");
  arr[0] = arr[0].replace(exp, rep);
  return arr[1] ? arr.join(".") : arr[0]
}

function secondString(seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d == 1 ? " día, " : " días, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hora, " : " horas, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minuto, " : " minutos, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " segundo" : " segundos") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay
}

function bytesToSize(bytes) {
  return new Promise((resolve, reject) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return 'n/a';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) resolve(`${bytes} ${sizes[i]}`);
    resolve(`${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`)
  })
      }
