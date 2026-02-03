import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from 'ytdl-core'
import axios from 'axios'
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'

const HTTP_TIMEOUT_MS = 90 * 1000
const MAX_SECONDS = 90 * 60

// Funciones auxiliares del segundo código
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
text: `01:27 ━━━━━━━━━⬤──────── 05:48
*⇄ㅤ       ◁      ㅤ  ❚❚ㅤ        ▷ㅤ       ↻*

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
// Usar API funcional del segundo código
const apiUrl = `https://api-adonix.ultraplus.click/download/ytaudio?apikey=Adofreekey&url=${encodeURIComponent(yt_play[0].url)}`
const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)

if (!apiResp?.status || !apiResp?.data?.url) {
throw new Error('La API no devolvió un link válido')
}

const directUrl = String(apiResp.data.url)
const audioBuffer = await fetchBuffer(directUrl, HTTP_TIMEOUT_MS)

await conn.sendMessage(m.chat, { 
audio: audioBuffer, 
mimetype: 'audio/mpeg',
fileName: `${yt_play[0].title}.mp3`
}, { quoted: m })

} catch {
try {
// Segundo intento con API alternativa del segundo código (comentada)
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
// Tercer intento con ytdl-core (último recurso)
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
// Mensaje de espera sin miniatura
await conn.sendMessage(m.chat, { 
text: '⏳ ESPERA POR FAVOR ESTOY DESCARGANDO TU VIDEO...' 
}, { quoted: m })

// Usar API para video (misma base)
const apiUrl = `https://api-adonix.ultraplus.click/download/ytvideo?apikey=Adofreekey&url=${encodeURIComponent(yt_play[0].url)}`
const apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)

if (apiResp?.status && apiResp?.data?.url) {
await conn.sendMessage(m.chat, { 
video: { url: apiResp.data.url }, 
fileName: `${yt_play[0].title}.mp4`, 
mimetype: 'video/mp4', 
caption: `𝙑𝙄𝘿𝙀𝙊 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝘿𝙊 [✅] ` 
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
let format = ytdl.chooseFormat(infoo.formats, { quality: '18' }) // 360p
await conn.sendMessage(m.chat, { 
video: { url: format.url }, 
fileName: `${yt_play[0].title}.mp4`, 
mimetype: 'video/mp4', 
caption: `𝙑𝙄𝘿𝙀𝙊 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝙕 𝘾𝙊𝙉 𝙐𝙇𝙏𝙄𝙈𝙊 𝙍𝙀𝘾𝙐𝙍𝙎𝙊 [✅] ` 
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
handler.command = ['play', 'play2']  // Cambiados los comandos
handler.exp = 0
export default handler

async function search(query, options = {}) {
const search = await yts.search({ query, hl: "es", gl: "ES", ...options });
return search.videos};

function MilesNumber(number) {
const exp = /(\d)(?=(\d{3})+(?!\d))/g;
const rep = "$1.";
let arr = number.toString().split(".");
arr[0] = arr[0].replace(exp, rep);
return arr[1] ? arr.join(".") : arr[0]};

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
return dDisplay + hDisplay + mDisplay + sDisplay};

function bytesToSize(bytes) {
return new Promise((resolve, reject) => {
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
if (bytes === 0) return 'n/a';
const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
if (i === 0) resolve(`${bytes} ${sizes[i]}`);
resolve(`${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`)})};
