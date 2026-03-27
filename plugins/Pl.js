import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from 'ytdl-core'
import axios from 'axios'
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'

const HTTP_TIMEOUT_MS = 90 * 1000
const MAX_SECONDS = 90 * 60

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
let q, v, yt, dl_url, ttl, size, lolhuman, lolh, n, n2, n3, n4, cap, qu, currentQuality   
if (!text) throw `✦ ¡Hey! Parece que olvidaste ingresar el nombre de la música de YouTube.\n💫 Ejemplo:\n\n> .play Blessd mirame`

try {
await m.react('🕓')
const yt_play = await search(args.join(" "))
let additionalText = ''
if (command === 'play') {
additionalText = ''
} else if (command === 'play2') {
additionalText = 'video 🎥'}

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
text: `01:27 ━━━━━━━⬤────── 05:48
*⇄ㅤ          ◁      ㅤ  ❚❚ㅤ        ▷ㅤ        ↻*

𝙀𝙡𝙞𝙩𝙚 𝘽𝙤𝙩 𝙂𝙡𝙤𝙗𝙖𝙡`, 
contextInfo: {
externalAdReply: {
title: yt_play[0].title,
body: wm,
thumbnailUrl: yt_play[0].thumbnail, 
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true
}}} , { quoted: m })

if (command == 'play') {	
try {
await m.react('✅')

const apiUrl = `${global.api.url}/dl/ytmp3v2?url=${encodeURIComponent(yt_play[0].url)}&key=${global.api.key}`
const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)

if (!apiResp?.status || !apiResp?.data?.dl) {
throw new Error('La API no devolvió un link válido')
}

const directUrl = String(apiResp.data.dl)
const audioBuffer = await fetchBuffer(directUrl, HTTP_TIMEOUT_MS)

await conn.sendMessage(m.chat, { 
audio: audioBuffer, 
mimetype: 'audio/mpeg',
fileName: `${yt_play[0].title}.mp3`
}, { quoted: m })

} catch {
try {

const apis = [
`${global.APIs.axi.url}/down/ytaudio?url=${encodeURIComponent(yt_play[0].url)}`,
`${global.APIs.ootaizumi.url}/downloader/youtube/play?query=${encodeURIComponent(yt_play[0].url)}`,
`${global.APIs.vreden.url}/api/v1/download/youtube/audio?url=${encodeURIComponent(yt_play[0].url)}&quality=256`,
`${global.APIs.stellar.url}/dl/ytdl?url=${encodeURIComponent(yt_play[0].url)}&format=mp3&key=${global.APIs.stellar.key}`,
`${global.APIs.ootaizumi.url}/downloader/youtube?url=${encodeURIComponent(yt_play[0].url)}&format=mp3`,
`${global.APIs.vreden.url}/api/v1/download/play/audio?query=${encodeURIComponent(yt_play[0].url)}`,
`${global.APIs.nekolabs.url}/downloader/youtube/v1?url=${encodeURIComponent(yt_play[0].url)}&format=mp3`,
`${global.APIs.nekolabs.url}/downloader/youtube/play/v1?q=${encodeURIComponent(yt_play[0].url)}`
]

for (let apiUrl2 of apis) {
try {
const res2 = await fetch(apiUrl2)
const json2 = await res2.json()

let link = json2?.result?.download?.url || 
           json2?.result?.download || 
           json2?.result || 
           json2?.resultado?.url_dl

if (link) {
await conn.sendMessage(m.chat, { 
audio: { url: link }, 
mimetype: 'audio/mpeg' 
}, { quoted: m })
return
}
} catch {}
}

throw new Error('Todas las APIs fallaron')

} catch {
try {
let searchh = await yts(yt_play[0].url)
let __res = searchh.all.map(v => v).filter(v => v.type == "video")
let infoo = await ytdl.getInfo('https://youtu.be/' + __res[0].videoId)
let ress = await ytdl.chooseFormat(infoo.formats, { filter: 'audioonly' })
await conn.sendMessage(m.chat, { audio: { url: ress.url }, mimetype: 'audio/mpeg' }, { quoted: m })
} catch {
await conn.sendMessage(m.chat, { text: '❌ Error: No se pudo descargar el audio con ningún método disponible.' }, { quoted: m })
await m.react('❌')
}}}
}

if (command == 'play2') {
try {
await m.react('✅')

await conn.sendMessage(m.chat, { 
text: '⏳ ESPERA POR FAVOR ESTOY DESCARGANDO TU VIDEO...' 
}, { quoted: m })

const apiUrl = `${global.api.url}/dl/ytmp4?url=${encodeURIComponent(yt_play[0].url)}&key=${global.api.key}`
const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)

if (apiResp?.status && apiResp?.data?.dl) {
await conn.sendMessage(m.chat, { 
video: { url: apiResp.data.dl }, 
fileName: `${yt_play[0].title}.mp4`, 
mimetype: 'video/mp4', 
caption: `𝙑𝙄𝘿𝙀𝙊 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝘿𝙊 [✅] ` 
}, { quoted: m })
} else {
throw new Error('API de video no funcionó')
}
} catch {   
try {  
const apiUrl2 = `https://gawrgura-api.onrender.com/download/ytmp4?url=${encodeURIComponent(yt_play[0].url)}`
const res2 = await fetch(apiUrl2)
const json2 = await res2.json()

if (json2?.status && json2?.result) {
await conn.sendMessage(m.chat, { 
video: { url: json2.result }, 
fileName: `${yt_play[0].title}.mp4`, 
caption: `𝙑𝙄𝘿𝙀𝙊 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝘿𝙊 [✅] `, 
mimetype: 'video/mp4' 
}, { quoted: m })     
} else {
throw new Error('API alternativa de video falló')
}
} catch {  
try {
let searchh = await yts(yt_play[0].url)
let __res = searchh.all.map(v => v).filter(v => v.type == "video")
let infoo = await ytdl.getInfo('https://youtu.be/' + __res[0].videoId)
let format = ytdl.chooseFormat(infoo.formats, { quality: '18' })
await conn.sendMessage(m.chat, { 
video: { url: format.url }, 
fileName: `${yt_play[0].title}.mp4`, 
mimetype: 'video/mp4', 
caption: `𝙑𝙄𝘿𝙀𝙊 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝘿𝙊 [✅] ` 
}, { quoted: m })
} catch {
await conn.sendMessage(m.chat, { text: '❌ Error: No se pudo descargar el video con ningún método disponible.' }, { quoted: m })
await m.react('❌')
}}}}
} catch (error) {
console.error(error)
await conn.sendMessage(m.chat, { text: `❌ Error general: ${error.message}` }, { quoted: m })
await m.react('❌')
}
}
handler.command = ['play', 'play2']
handler.exp = 0
export default handler

async function search(query, options = {}) {
const search = await yts.search({ query, hl: "es", gl: "ES", ...options });
return search.videos};const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)

if (!apiResp?.status || !apiResp?.data?.dl) {
throw new Error('La API no devolvió un link válido')
}

const directUrl = String(apiResp.data.dl)
const audioBuffer = await fetchBuffer(directUrl, HTTP_TIMEOUT_MS)

await conn.sendMessage(m.chat, { 
audio: audioBuffer, 
mimetype: 'audio/mpeg',
fileName: `${yt_play[0].title}.mp3`
}, { quoted: m })

} catch {
try {
// fallback original intacto
const apiUrl2 = `https://gawrgura-api.onrender.com/download/ytmp3?url=${encodeURIComponent(yt_play[0].url)}`
const res2 = await fetch(apiUrl2)
const json2 = await res2.json()

if (json2?.status && json2?.result) {
await conn.sendMessage(m.chat, { 
audio: { url: json2.result }, 
mimetype: 'audio/mpeg' 
}, { quoted: m })
} else {
throw new Error('API alternativa falló')
}
} catch {
try {
let searchh = await yts(yt_play[0].url)
let __res = searchh.all.map(v => v).filter(v => v.type == "video")
let infoo = await ytdl.getInfo('https://youtu.be/' + __res[0].videoId)
let ress = await ytdl.chooseFormat(infoo.formats, { filter: 'audioonly' })
await conn.sendMessage(m.chat, { audio: { url: ress.url }, mimetype: 'audio/mpeg' }, { quoted: m })
} catch {
await conn.sendMessage(m.chat, { text: '❌ Error: No se pudo descargar el audio con ningún método disponible.' }, { quoted: m })
await m.react('❌')
}}}
}  

if (command == 'play2') {
try {
await m.react('✅')

await conn.sendMessage(m.chat, { 
text: '⏳ ESPERA POR FAVOR ESTOY DESCARGANDO TU VIDEO...' 
}, { quoted: m })

// 🔁 TAMBIÉN TE CAMBIÉ LA DE VIDEO (MISMA API)
const apiUrl = `${global.api.url}/dl/ytmp4?url=${encodeURIComponent(yt_play[0].url)}&key=${global.api.key}`
const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)

if (apiResp?.status && apiResp?.data?.dl) {
await conn.sendMessage(m.chat, { 
video: { url: apiResp.data.dl }, 
fileName: `${yt_play[0].title}.mp4`, 
mimetype: 'video/mp4', 
caption: `𝙑𝙄𝘿𝙀𝙊 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝘿𝙊 [✅] ` 
}, { quoted: m })
} else {
throw new Error('API de video no funcionó')
}
} catch {   
try {  
const apiUrl2 = `https://gawrgura-api.onrender.com/download/ytmp4?url=${encodeURIComponent(yt_play[0].url)}`
const res2 = await fetch(apiUrl2)
const json2 = await res2.json()

if (json2?.status && json2?.result) {
await conn.sendMessage(m.chat, { 
video: { url: json2.result }, 
fileName: `${yt_play[0].title}.mp4`, 
caption: `𝙑𝙄𝘿𝙀𝙊 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝘿𝙊 [✅] `, 
mimetype: 'video/mp4' 
}, { quoted: m })     
} else {
throw new Error('API alternativa de video falló')
}
} catch {  
try {
let searchh = await yts(yt_play[0].url)
let __res = searchh.all.map(v => v).filter(v => v.type == "video")
let infoo = await ytdl.getInfo('https://youtu.be/' + __res[0].videoId)
let format = ytdl.chooseFormat(infoo.formats, { quality: '18' })
await conn.sendMessage(m.chat, { 
video: { url: format.url }, 
fileName: `${yt_play[0].title}.mp4`, 
mimetype: 'video/mp4', 
caption: `𝙑𝙄𝘿𝙀𝙊 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝘿𝙊 [✅] ` 
}, { quoted: m })
} catch {
await conn.sendMessage(m.chat, { text: '❌ Error: No se pudo descargar el video con ningún método disponible.' }, { quoted: m })
await m.react('❌')
}}}}
} catch (error) {
console.error(error)
await conn.sendMessage(m.chat, { text: `❌ Error general: ${error.message}` }, { quoted: m })
await m.react('❌')
}
}
handler.command = ['play', 'play2']
handler.exp = 0
export default handler

async function search(query, options = {}) {
const search = await yts.search({ query, hl: "es", gl: "ES", ...options });
return search.videos};
