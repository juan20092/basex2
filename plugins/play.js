import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from 'ytdl-core'

const HTTP_TIMEOUT_MS = 90 * 1000
const MAX_SECONDS = 90 * 60

// API de dev (sin key necesaria)
const API_DEV_URL = "https://dv-yer-api.online"

// Funciones auxiliares
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
if (!res.ok) throw new Error(`No se pudo bajar el archivo (HTTP ${res.status})`)
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

function durationToSeconds(duration) {
if (!duration) return null
const parts = duration.split(':').map(Number)
if (parts.length === 2) return parts[0] * 60 + parts[1]
if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
return null
}

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
if (!text) throw `✦ ¡Hey! Ingresa el nombre de la música.\n💫 Ejemplo: .play Blessd mirame`

try {
await m.react('🕓')
const yt_play = await search(args.join(" "))

// Verificar duración máxima
const durSec = parseDurationToSeconds(yt_play[0]?.duration?.seconds) ??
parseDurationToSeconds(yt_play[0]?.seconds) ??
parseDurationToSeconds(yt_play[0]?.duration) ??
parseDurationToSeconds(yt_play[0]?.timestamp)

if (durSec && durSec > MAX_SECONDS) {
await conn.sendMessage(m.chat, { text: `⭐ Audio muy largo. Máximo ${Math.floor(MAX_SECONDS / 60)} minutos.` }, { quoted: m })
await m.react('❌')
return
}

// Enviar preview
await conn.sendMessage(m.chat, {
text: `🎵 *${yt_play[0].title}* 🎵\n⏱️ Duración: ${yt_play[0].duration?.timestamp || 'Desconocida'}\n\n⬇️ Descargando...`,
contextInfo: {
externalAdReply: {
title: yt_play[0].title,
body: wm || 'Elite Bot',
thumbnailUrl: yt_play[0].thumbnail,
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true
}}} , { quoted: m })

if (command == 'play') {	
await m.react('✅')

try {
// Usar API de dev para audio
const apiUrl = `${API_DEV_URL}/ytdlmp3?mode=link&url=${encodeURIComponent(yt_play[0].url)}&quality=128k`
const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)

if (!apiResp?.ok) throw new Error('API respondió con error')

// Construir URL de descarga
let downloadUrl = apiResp.download_url_full || apiResp.direct_url || apiResp.url
if (downloadUrl && downloadUrl.startsWith('/')) {
downloadUrl = `${API_DEV_URL}${downloadUrl}`
}
if (!downloadUrl) throw new Error('No se encontró URL de descarga')

// Verificar duración
if (apiResp.duration) {
const durSecApi = durationToSeconds(apiResp.duration)
if (durSecApi && durSecApi > MAX_SECONDS) {
await conn.sendMessage(m.chat, { text: `⭐ Audio muy largo. Máximo ${Math.floor(MAX_SECONDS / 60)} minutos.` }, { quoted: m })
await m.react('❌')
return
}
}

const audioBuffer = await fetchBuffer(downloadUrl, HTTP_TIMEOUT_MS)

// Mimetype correcto según extensión
const filename = apiResp.filename || `${yt_play[0].title}.mp3`
const ext = filename.split('.').pop().toLowerCase()
const mimetype = ext === 'm4a' ? 'audio/mp4' : 'audio/mpeg'

await conn.sendMessage(m.chat, {
audio: audioBuffer,
mimetype: mimetype,
fileName: filename.replace(/\.m4a$/, '.mp3')
}, { quoted: m })

} catch (error) {
console.error('Error API dev:', error.message)
await m.react('⚠️')

try {
// Fallback: ytdl-core
const info = await ytdl.getInfo(yt_play[0].url)
const audioFormat = ytdl.chooseFormat(info.formats, { 
filter: 'audioonly',
quality: 'lowestaudio'
})

if (audioFormat?.url) {
await conn.sendMessage(m.chat, { 
audio: { url: audioFormat.url }, 
mimetype: 'audio/mpeg' 
}, { quoted: m })
} else {
throw new Error('No se encontró formato de audio')
}
} catch (error2) {
console.error('Error ytdl-core:', error2.message)
await conn.sendMessage(m.chat, { text: '❌ Error al descargar el audio.' }, { quoted: m })
await m.react('❌')
}}
}

if (command == 'play2') {
await m.react('✅')
await conn.sendMessage(m.chat, { text: '⏳ DESCARGANDO VIDEO...' }, { quoted: m })

try {
// Usar API de dev para video
const apiUrl = `${API_DEV_URL}/ytdlmp4?mode=link&url=${encodeURIComponent(yt_play[0].url)}&quality=360p`
const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)

let downloadUrl = apiResp?.download_url_full || apiResp?.direct_url
if (downloadUrl && downloadUrl.startsWith('/')) {
downloadUrl = `${API_DEV_URL}${downloadUrl}`
}

if (apiResp?.ok && downloadUrl) {
const videoBuffer = await fetchBuffer(downloadUrl, HTTP_TIMEOUT_MS)
await conn.sendMessage(m.chat, {
video: videoBuffer,
fileName: `${apiResp.filename || yt_play[0].title}.mp4`,
mimetype: 'video/mp4',
caption: `✅ VIDEO DESCARGADO\n📌 ${yt_play[0].title}`
}, { quoted: m })
} else {
throw new Error('API de video no funcionó')
}

} catch (error) {
console.error('Error API dev video:', error.message)
await m.react('⚠️')

try {
// Fallback: ytdl-core para video
const info = await ytdl.getInfo(yt_play[0].url)
const videoFormat = ytdl.chooseFormat(info.formats, { quality: '18' })

if (videoFormat?.url) {
await conn.sendMessage(m.chat, {
video: { url: videoFormat.url },
fileName: `${yt_play[0].title}.mp4`,
mimetype: 'video/mp4',
caption: `✅ VIDEO DESCARGADO\n📌 ${yt_play[0].title}`
}, { quoted: m })
} else {
throw new Error('No se encontró formato de video')
}
} catch (error2) {
await conn.sendMessage(m.chat, { text: '❌ Error al descargar el video.' }, { quoted: m })
await m.react('❌')
}}
}
} catch (error) {
console.error('Error general:', error)
await conn.sendMessage(m.chat, { text: `❌ Error: ${error.message}` }, { quoted: m })
await m.react('❌')
}
}
handler.command = ['play', 'play2']
handler.exp = 0
export default handler

async function search(query, options = {}) {
const search = await yts.search({ query, hl: "es", gl: "ES", ...options });
return search.videos};await m.react('✅')

// Usar API dv-yer-api.online para audio
const apiUrl = `https://dv-yer-api.online/ytdlmp3?mode=link&url=${encodeURIComponent(yt_play[0].url)}&quality=128k`
const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)

if (!apiResp?.ok) {
throw new Error('La API respondió con error')
}

// Construir URL completa para descarga
let downloadUrl = apiResp.download_url_full || apiResp.direct_url || apiResp.url
if (downloadUrl && downloadUrl.startsWith('/')) {
downloadUrl = `https://dv-yer-api.online${downloadUrl}`
}
if (!downloadUrl) {
throw new Error('No se encontró URL de descarga')
}

// Verificar duración
if (apiResp.duration) {
const durSecApi = durationToSeconds(apiResp.duration)
if (durSecApi && durSecApi > MAX_SECONDS) {
await conn.sendMessage(m.chat, { text: `⭐ Audio muy largo.\n> Máximo permitido: ${Math.floor(MAX_SECONDS / 60)} minutos.` }, { quoted: m })
await m.react('❌')
return
}
}

const audioBuffer = await fetchBuffer(downloadUrl, HTTP_TIMEOUT_MS)

// Determinar el mimetype correcto según la extensión
const filename = apiResp.filename || `${yt_play[0].title}.mp3`
const ext = filename.split('.').pop().toLowerCase()
const mimetype = ext === 'm4a' ? 'audio/mp4' : 'audio/mpeg'

await conn.sendMessage(m.chat, {
audio: audioBuffer,
mimetype: mimetype,
fileName: filename.replace(/\.m4a$/, '.mp3')
}, { quoted: m })

} catch (error) {
console.error('Error en API:', error.message)
await m.react('⚠️')

try {
// Fallback: ytdl-core directo
const info = await ytdl.getInfo(yt_play[0].url)
const audioFormat = ytdl.chooseFormat(info.formats, { 
filter: 'audioonly',
quality: 'lowestaudio'
})

if (audioFormat && audioFormat.url) {
await conn.sendMessage(m.chat, { 
audio: { url: audioFormat.url }, 
mimetype: 'audio/mpeg' 
}, { quoted: m })
} else {
throw new Error('No se encontró formato de audio')
}
} catch (error2) {
console.error('Error en ytdl-core:', error2.message)
await conn.sendMessage(m.chat, { text: '❌ Error: No se pudo descargar el audio.\n\nIntenta con otro tema o usa el comando .ytmp3 + link' }, { quoted: m })
await m.react('❌')
}}
}

if (command == 'play2') {
try {
await m.react('✅')
await conn.sendMessage(m.chat, { text: '⏳ DESCARGANDO VIDEO...' }, { quoted: m })

// Usar API dv-yer-api.online para video
const apiUrl = `https://dv-yer-api.online/ytdlmp4?mode=link&url=${encodeURIComponent(yt_play[0].url)}&quality=360p`
const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)

let downloadUrl = apiResp?.download_url_full || apiResp?.direct_url
if (downloadUrl && downloadUrl.startsWith('/')) {
downloadUrl = `https://dv-yer-api.online${downloadUrl}`
}

if (apiResp?.ok && downloadUrl) {
const videoBuffer = await fetchBuffer(downloadUrl, HTTP_TIMEOUT_MS)
await conn.sendMessage(m.chat, {
video: videoBuffer,
fileName: `${apiResp.filename || yt_play[0].title}.mp4`,
mimetype: 'video/mp4',
caption: `✅ VIDEO DESCARGADO\n📌 ${yt_play[0].title}`
}, { quoted: m })
} else {
throw new Error('API de video no funcionó')
}

} catch (error) {
console.error('Error en video:', error.message)
await m.react('⚠️')

try {
// Fallback: ytdl-core para video
const info = await ytdl.getInfo(yt_play[0].url)
const videoFormat = ytdl.chooseFormat(info.formats, { quality: '18' })

if (videoFormat && videoFormat.url) {
await conn.sendMessage(m.chat, {
video: { url: videoFormat.url },
fileName: `${yt_play[0].title}.mp4`,
mimetype: 'video/mp4',
caption: `✅ VIDEO DESCARGADO\n📌 ${yt_play[0].title}`
}, { quoted: m })
} else {
throw new Error('No se encontró formato de video')
}
} catch (error2) {
await conn.sendMessage(m.chat, { text: '❌ Error: No se pudo descargar el video.' }, { quoted: m })
await m.react('❌')
}}
}
} catch (error) {
console.error('Error general:', error)
await conn.sendMessage(m.chat, { text: `❌ Error: ${error.message}` }, { quoted: m })
await m.react('❌')
}
}
handler.command = ['play', 'play2']
handler.exp = 0
export default handler

async function search(query, options = {}) {
const search = await yts.search({ query, hl: "es", gl: "ES", ...options });
return search.videos};try {
await m.react('✅')
console.log('Intentando descargar audio de:', yt_play[0].url)

// Usar API dv-yer-api.online
const apiUrl = `https://dv-yer-api.online/ytdlmp3?mode=link&url=${encodeURIComponent(yt_play[0].url)}&quality=128k`
console.log('API URL:', apiUrl)

const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)
console.log('Respuesta API:', JSON.stringify(apiResp, null, 2))

if (!apiResp?.ok) {
throw new Error('La API respondió con error')
}

// Construir URL completa para descarga
let downloadUrl = apiResp.download_url_full || apiResp.direct_url || apiResp.url
if (downloadUrl && downloadUrl.startsWith('/')) {
downloadUrl = `https://dv-yer-api.online${downloadUrl}`
}
if (!downloadUrl) {
throw new Error('No se encontró URL de descarga')
}

console.log('URL de descarga:', downloadUrl)

// Verificar duración
if (apiResp.duration) {
const durSecApi = durationToSeconds(apiResp.duration)
if (durSecApi && durSecApi > MAX_SECONDS) {
await conn.sendMessage(m.chat, { text: `⭐ Audio muy largo.\n> Máximo permitido: ${Math.floor(MAX_SECONDS / 60)} minutos.` }, { quoted: m })
await m.react('❌')
return
}
}

const audioBuffer = await fetchBuffer(downloadUrl, HTTP_TIMEOUT_MS)
console.log('Audio descargado, tamaño:', audioBuffer.length)

await conn.sendMessage(m.chat, {
audio: audioBuffer,
mimetype: 'audio/mpeg',
fileName: `${apiResp.filename || yt_play[0].title}.mp3`
}, { quoted: m })

} catch (error) {
console.error('Error en API principal:', error.message)
await conn.sendMessage(m.chat, { text: `❌ Error con API principal: ${error.message}\n\nIntentando con método alternativo...` }, { quoted: m })

try {
// Segundo intento: API alternativa gawrgura
console.log('Intentando API alternativa...')
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
} catch (error2) {
console.error('Error en API alternativa:', error2.message)
try {
// Tercer intento: ytdl-core
console.log('Intentando ytdl-core...')
let infoo = await ytdl.getInfo(yt_play[0].url)
let ress = ytdl.chooseFormat(infoo.formats, { filter: 'audioonly', quality: 'lowestaudio' })
await conn.sendMessage(m.chat, { audio: { url: ress.url }, mimetype: 'audio/mpeg' }, { quoted: m })
} catch (error3) {
console.error('Error en ytdl-core:', error3.message)
await conn.sendMessage(m.chat, { text: '❌ Error: No se pudo descargar el audio con ningún método disponible.\n\n' + error3.message }, { quoted: m })
await m.react('❌')
}}}
}

if (command == 'play2') {
try {
await m.react('✅')
await conn.sendMessage(m.chat, {
text: '⏳ DESCARGANDO VIDEO...'
}, { quoted: m })

const apiUrl = `https://dv-yer-api.online/ytdlmp4?mode=link&url=${encodeURIComponent(yt_play[0].url)}&quality=360p`
const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)

let downloadUrl = apiResp?.download_url_full || apiResp?.direct_url
if (downloadUrl && downloadUrl.startsWith('/')) {
downloadUrl = `https://dv-yer-api.online${downloadUrl}`
}

if (apiResp?.ok && downloadUrl) {
const videoBuffer = await fetchBuffer(downloadUrl, HTTP_TIMEOUT_MS)
await conn.sendMessage(m.chat, {
video: videoBuffer,
fileName: `${apiResp.filename || yt_play[0].title}.mp4`,
mimetype: 'video/mp4',
caption: `✅ VIDEO DESCARGADO\n📌 ${yt_play[0].title}`
}, { quoted: m })
} else {
throw new Error('API de video no funcionó')
}

} catch (error) {
console.error('Error en video:', error.message)
try {
const apiUrl2 = `https://gawrgura-api.onrender.com/download/ytmp4?url=${encodeURIComponent(yt_play[0].url)}`
const res2 = await fetch(apiUrl2)
const json2 = await res2.json()

if (json2?.status && json2?.result) {
await conn.sendMessage(m.chat, {
video: { url: json2.result },
fileName: `${yt_play[0].title}.mp4`,
caption: `✅ VIDEO DESCARGADO\n📌 ${yt_play[0].title}`,
mimetype: 'video/mp4'
}, { quoted: m })
} else {
throw new Error('API alternativa falló')
}
} catch (error2) {
try {
let infoo = await ytdl.getInfo(yt_play[0].url)
let format = ytdl.chooseFormat(infoo.formats, { quality: '18' })
await conn.sendMessage(m.chat, {
video: { url: format.url },
fileName: `${yt_play[0].title}.mp4`,
mimetype: 'video/mp4',
caption: `✅ VIDEO DESCARGADO (último recurso)\n📌 ${yt_play[0].title}`
}, { quoted: m })
} catch (error3) {
await conn.sendMessage(m.chat, { text: '❌ Error: No se pudo descargar el video.' }, { quoted: m })
await m.react('❌')
}}}}
} catch (error) {
console.error('Error general:', error)
await conn.sendMessage(m.chat, { text: `❌ Error: ${error.message}` }, { quoted: m })
await m.react('❌')
}
}
handler.command = ['play', 'play2']
handler.exp = 0
export default handler

async function search(query, options = {}) {
const search = await yts.search({ query, hl: "es", gl: "ES", ...options });
return search.videos};
