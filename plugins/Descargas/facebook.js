import fg from 'api-dylux'
import fetch from 'node-fetch'
import { facebookdl } from '../../lib/facebookscraper.js'
import axios from 'axios'

const handler = async (m, {conn, args, command, usedPrefix}) => {
let user = global.db.data.users[m.sender]

if (!args[0])
return conn.reply(
m.chat,
`${lenguajeGB['smsAvisoMG']()} INGRESE UN ENLACE DE FACEBOOK\nEjemplo:\n*${usedPrefix + command} https://fb.watch/...*`,
fkontak,
m
)

if (!/facebook\.com|fb\.watch/.test(args[0]))
return conn.reply(
m.chat,
`${lenguajeGB['smsAvisoMG']()} INGRESE UN ENLACE VÁLIDO DE FACEBOOK`,
fkontak,
m
)

let contenido = `✅ VIDEO DE FACEBOOK\n${wm}`
await m.react('⏱️')

try {
// 🟢 NUEVA API (PRIORIDAD 1)
const apiDirecta = `https://api-nexy.ultraplus.click/api/dl/facebook?url=${encodeURIComponent(args[0])}`
const res = await fetch(apiDirecta)
const json = await res.json()

if (json.status && json.media && Array.isArray(json.media)) {
const media = json.media.find(v => v.type === 'video') || json.media[0]

if (media && media.url) {
await conn.sendFile(m.chat, media.url, 'video.mp4', contenido, m)
await m.react('✅')
return
}
}

throw 'Nexy falló'
} catch (e) {
console.log('Error Nexy:', e)

try {
// 🔵 API DORRATZ
const apiUrl = `https://api.dorratz.com/fbvideo?url=${args[0]}`
const response = await fetch(apiUrl)
const data = await response.json()

const videosConUrl = Array.isArray(data)
? data.filter(v => typeof v.url === 'string' && v.url.startsWith('http'))
: []

let videoSeleccionado = videosConUrl.find(v => v.resolution === '1080p') 
|| videosConUrl.find(v => v.resolution === '720p (HD)') 
|| videosConUrl[0]

if (!videoSeleccionado) throw 'Dorratz sin video'

await conn.sendFile(m.chat, videoSeleccionado.url, 'video.mp4', `Resolución: ${videoSeleccionado.resolution}`, m)
await m.react('✅')
return

} catch (e) {
console.log('Error Dorratz:', e)

try {
// 🟣 API AGATZ
const api = await fetch(`https://api.agatz.xyz/api/facebook?url=${args[0]}`)
const data = await api.json()

const videoUrl = data?.data?.hd || data?.data?.sd

if (videoUrl) {
await conn.sendFile(m.chat, videoUrl, 'video.mp4', contenido, m, null, fake)
await m.react('✅')
return
}

throw 'Agatz sin video'

} catch (e) {
console.log('Error Agatz:', e)

try {
// 🟡 NEOXR
const api = await fetch(`${global.APIs.neoxr.url}/fb?url=${args[0]}&apikey=${global.APIs.neoxr.key}`)
const response = await api.json()

if (response.status && Array.isArray(response.data)) {
const videoUrl = response.data.find(v => v.quality === 'HD')?.url 
|| response.data.find(v => v.quality === 'SD')?.url

if (videoUrl) {
await conn.sendFile(m.chat, videoUrl, 'video.mp4', contenido, m, null, fake)
await m.react('✅')
return
}
}

throw 'Neoxr falló'

} catch (e) {
console.log('Error Neoxr:', e)

try {
// 🟠 API DELIUS
const apiUrl = `${apis}/download/facebook?url=${args[0]}`
const apiResponse = await fetch(apiUrl)
const delius = await apiResponse.json()

const downloadUrl = delius?.urls?.[0]?.hd || delius?.urls?.[0]?.sd

if (downloadUrl) {
await conn.sendFile(m.chat, downloadUrl, 'video.mp4', contenido, m)
await m.react('✅')
return
}

throw 'Delius falló'

} catch (e) {
console.log('Error Delius:', e)

try {
// 🔴 API DYLUX
const ress = await fg.fbdl(args[0])
const urll = ress.data[0].url

await conn.sendFile(m.chat, urll, 'video.mp4', contenido, m)
await m.react('✅')
return

} catch (e) {
console.log('Error Dylux:', e)

try {
// ⚫ SCRAPER LOCAL
const result = await facebookdl(args[0])
const video = result.video

let url = video[0]?.url || video[0]?.download?.()

if (url) {
await conn.sendFile(m.chat, url, 'video.mp4', contenido, m)
await m.react('✅')
return
}

throw 'Scraper falló'

} catch (e) {
console.log('Error final:', e)
m.reply('❌ Todas las APIs fallaron')
}
}
}
}
}
}
}

handler.command = /^(facebook|fb|facebookdl|fbdl)$/i
handler.limit = 3

export default handler
