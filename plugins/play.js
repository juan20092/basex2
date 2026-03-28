import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from 'ytdl-core'

const HTTP_TIMEOUT_MS = 90 * 1000
const MAX_SECONDS = 90 * 60

// ================= FUNCIONES =================

async function fetchJson(url, timeoutMs = HTTP_TIMEOUT_MS) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: ctrl.signal,
      headers: { 'user-agent': 'Mozilla/5.0' }
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.message || 'Error API')
    return json
  } finally {
    clearTimeout(t)
  }
}

function parseDurationToSeconds(d) {
  if (!d) return null
  if (typeof d === 'number') return d
  let parts = d.split(':').map(Number)
  if (parts.length === 2) return parts[0]*60 + parts[1]
  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2]
  return null
}

// ================= HANDLER =================

let handler = async (m, { conn, command, args, text }) => {

  if (!text) throw `✦ Escribe el nombre de la canción\n\nEjemplo:\n.play Blessd mirame`

  try {
    await m.react('🕓')

    const yt = await yts(text)
    const vid = yt.videos[0]

    if (!vid) throw 'No se encontró nada'

    const dur = parseDurationToSeconds(vid.timestamp)
    if (dur && dur > MAX_SECONDS) {
      return conn.sendMessage(m.chat, {
        text: `❌ Audio muy largo\nMáx: ${MAX_SECONDS/60} min`
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      text: `🎵 *${vid.title}*\n⏱ ${vid.timestamp}\n\n⬇️ Descargando...`,
      contextInfo: {
        externalAdReply: {
          title: vid.title,
          body: 'Elite Bot',
          thumbnailUrl: vid.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // ================= API PRINCIPAL =================

    try {
      let api = `https://dv-yer-api.online/ytdlmp3?url=${encodeURIComponent(vid.url)}`
      let res = await fetchJson(api)

      let url = res?.download_url_full || res?.url

      if (url && url.startsWith('/')) {
        url = `https://dv-yer-api.online${url}`
      }

      if (!url) throw 'Sin link'

      await conn.sendMessage(m.chat, {
        audio: { url: url },
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`,
        ptt: false
      }, { quoted: m })

      await m.react('✅')

    } catch (e) {

      // ================= API 2 =================

      try {
        let api2 = `https://gawrgura-api.onrender.com/download/ytmp3?url=${encodeURIComponent(vid.url)}`
        let res2 = await fetch(api2)
        let json2 = await res2.json()

        if (!json2?.result) throw 'API2 error'

        await conn.sendMessage(m.chat, {
          audio: { url: json2.result },
          mimetype: 'audio/mpeg',
          fileName: `${vid.title}.mp3`
        }, { quoted: m })

        await m.react('✅')

      } catch (e2) {

        // ================= FALLBACK FINAL =================

        try {
          let info = await ytdl.getInfo(vid.url)
          let format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' })

          await conn.sendMessage(m.chat, {
            audio: { url: format.url },
            mimetype: 'audio/mpeg',
            fileName: `${vid.title}.mp3`
          }, { quoted: m })

          await m.react('✅')

        } catch (e3) {
          await conn.sendMessage(m.chat, {
            text: '❌ Error: No se pudo descargar el audio'
          }, { quoted: m })

          await m.react('❌')
        }
      }
    }

  } catch (err) {
    await conn.sendMessage(m.chat, {
      text: `❌ Error: ${err}`
    }, { quoted: m })

    await m.react('❌')
  }
}

handler.command = ['play']
export default handler
