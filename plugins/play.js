import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from 'ytdl-core'
import axios from 'axios'

const HTTP_TIMEOUT_MS = 90 * 1000
const MAX_SECONDS = 90 * 60

// 🔥 DVYER API
async function getDvyerAudio(url) {
  const api = `https://dv-yer-api.online/ytdlmp3?mode=link&url=${encodeURIComponent(url)}&quality=128k`
  const res = await fetch(api)
  const json = await res.json()

  if (!json || json.status === false) {
    throw new Error('DVYER no devolvió resultado')
  }

  const dl = json?.download_url || json?.url || json?.result?.url
  if (!dl) throw new Error('DVYER sin link válido')

  return dl
}

// 🔧 FUNCIONES AUXILIARES
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
    try { data = text ? JSON.parse(text) : null } catch {}
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    if (!data) throw new Error('JSON inválido')
    return data
  } finally {
    clearTimeout(t)
  }
}

function parseDurationToSeconds(d) {
  if (!d) return null
  if (typeof d === 'number') return d
  const parts = String(d).split(':').map(Number)
  return parts.reduce((a, b) => a * 60 + b, 0)
}

// 🔥 HANDLER
let handler = async (m, { conn, command, args, text, usedPrefix }) => {

if (!text) throw `⭐ Ingresa el nombre de la canción\nEjemplo:\n${usedPrefix + command} Feid`

try {
await m.react('⚡')

const yt_play = await search(args.join(" "))

// ⛔ duración
const durSec = parseDurationToSeconds(yt_play[0]?.duration?.seconds || yt_play[0]?.timestamp)
if (durSec && durSec > MAX_SECONDS) {
await conn.sendMessage(m.chat, { text: `❌ Muy largo.` }, { quoted: m })
return
}

// 🎧 mensaje
await conn.sendMessage(m.chat, {
text: `🎧 Descargando...\n${yt_play[0].title}`,
contextInfo: {
externalAdReply: {
title: yt_play[0].title,
thumbnailUrl: yt_play[0].thumbnail,
mediaType: 1,
renderLargerThumbnail: true
}}} , { quoted: m })

// 🔥 PLAY (ANTES SPOTIFY)
if (command == 'play') {	
try {

// 1️⃣ DVYER
const dvyerUrl = await getDvyerAudio(yt_play[0].url)

// validar
let head = await fetch(dvyerUrl, { method: 'HEAD' }).catch(() => null)
if (!head || !head.ok) throw new Error('DVYER link inválido')

await conn.sendMessage(m.chat, { 
audio: { url: dvyerUrl }, 
mimetype: 'audio/mpeg',
fileName: `${yt_play[0].title}.mp3`
}, { quoted: m })

} catch {
try {

// 2️⃣ API ADONIX
const apiUrl = `https://api-adonix.ultraplus.click/download/ytaudio?apikey=Adofreekey&url=${encodeURIComponent(yt_play[0].url)}`
const apiResp = await fetchJson(apiUrl)

if (!apiResp?.status || !apiResp?.data?.url) throw 'API2'

await conn.sendMessage(m.chat, { 
audio: { url: apiResp.data.url }, 
mimetype: 'audio/mpeg'
}, { quoted: m })

} catch {
try {

// 3️⃣ GAWRGURA
const apiUrl2 = `https://gawrgura-api.onrender.com/download/ytmp3?url=${encodeURIComponent(yt_play[0].url)}`
const res2 = await fetch(apiUrl2)
const json2 = await res2.json()

if (!json2?.status || !json2?.result) throw 'API3'

await conn.sendMessage(m.chat, { 
audio: { url: json2.result }, 
mimetype: 'audio/mpeg'
}, { quoted: m })

} catch {
try {

// 4️⃣ YTDL (FINAL)
let info = await ytdl.getInfo(yt_play[0].url)
let format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' })

await conn.sendMessage(m.chat, { 
audio: { url: format.url }, 
mimetype: 'audio/mpeg'
}, { quoted: m })

} catch {
await conn.sendMessage(m.chat, { text: '❌ Todas las APIs fallaron' }, { quoted: m })
await m.react('❌')
}}}
}
}

// 🎥 VIDEO
if (command == 'play8') {
try {
const apiUrl = `https://api-adonix.ultraplus.click/download/ytvideo?apikey=Adofreekey&url=${encodeURIComponent(yt_play[0].url)}`
const apiResp = await fetchJson(apiUrl)

if (!apiResp?.status || !apiResp?.data?.url) throw 'video'

await conn.sendMessage(m.chat, { 
video: { url: apiResp.data.url },
caption: '✅ Video descargado'
}, { quoted: m })

} catch {
await conn.sendMessage(m.chat, { text: '❌ Error video' }, { quoted: m })
}
}

} catch (error) {
console.error(error)
await conn.sendMessage(m.chat, { text: `❌ Error: ${error.message}` }, { quoted: m })
}
}

handler.command = ['play', 'play8']
export default handler

// 🔎 SEARCH
async function search(query) {
const res = await yts.search(query)
return res.videos
}
