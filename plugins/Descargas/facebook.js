import fg from 'api-dylux'
import fetch from 'node-fetch'
import { facebookdl } from '../../lib/facebookscraper.js'
import axios from 'axios'

const handler = async (m, {conn, args, command, usedPrefix}) => {
let user = global.db.data.users[m.sender]

if (!args[0])
return conn.reply(
m.chat,
`${lenguajeGB['smsAvisoMG']()}𝙄𝙉𝙂𝙍𝙀𝙎𝙀 𝙐𝙉 𝙀𝙉𝙇𝘼𝘾𝙀 𝘿𝙀 𝙁𝘼𝘾𝙀𝘽𝙊𝙊𝙆`,
fkontak,
m
)

if (!args[0].match(/facebook\.com|fb\.watch/g))
return conn.reply(
m.chat,
`${lenguajeGB['smsAvisoMG']()}𝙄𝙉𝙂𝙍𝙀𝙎𝙀 𝙐𝙉 𝙀𝙉𝙇𝘼𝘾𝙀 𝙑Á𝙇𝙄𝘿𝙊`,
fkontak,
m
)

let contenido = `✅ 𝙑𝙄𝘿𝙀𝙊 𝘿𝙀 𝙁𝘼𝘾𝙀𝘽𝙊𝙊𝙆\n${wm}`
await m.react('⏱️')

try {
// 🟢 API NEXY (AGREGADA)
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

} catch {

try {
// 🔵 TU API ORIGINAL (NO TOCADA)
const apiUrl = `https://api.dorratz.com/fbvideo?url=${args[0]}`
const response = await fetch(apiUrl)
const data = await response.json()

const videosConUrl = data.filter((v) => typeof v.url === 'string' && v.url.startsWith('http'))

const prioridades = ['1080p', '720p (HD)']
let videoSeleccionado = null

for (const resolucion of prioridades) {
videoSeleccionado = videosConUrl.find((v) => v.resolution === resolucion)
if (videoSeleccionado) break
}

if (!videoSeleccionado) {
videoSeleccionado = videosConUrl[0]
}

const downloadUrl = videoSeleccionado.url
const contenido = `Resolución: ${videoSeleccionado.resolution}`

await conn.sendFile(m.chat, downloadUrl, 'video.mp4', contenido, m)
await m.react('✅')

} catch {

try {
const api = await fetch(`https://api.agatz.xyz/api/facebook?url=${args[0]}`)
const data = await api.json()
const videoUrl = data.data.hd || data.data.sd
const imageUrl = data.data.thumbnail

if (videoUrl && videoUrl.endsWith('.mp4')) {
await conn.sendFile(m.chat, videoUrl, 'video.mp4', `${gt}`, m, null, fake)
await m.react('✅')
} else if (imageUrl) {
await conn.sendFile(m.chat, imageUrl, 'thumbnail.jpg', contenido, m, null, fake)
await m.react('✅')
}

} catch {

try {
const api = await fetch(`${global.APIs.neoxr.url}/fb?url=${args[0]}&apikey=${global.APIs.neoxr.key}`)
const response = await api.json()

if (response.status && Array.isArray(response.data)) {
const videoHD = response.data.find((video) => video.quality === 'HD')?.url
const videoSD = response.data.find((video) => video.quality === 'SD')?.url
const videoUrl = videoHD || videoSD

await conn.sendFile(m.chat, videoUrl, 'video.mp4', contenido, m, null, fake)
await m.react('✅')
}

} catch {

try {
const apiUrl = `${apis}/download/facebook?url=${args[0]}`
const apiResponse = await fetch(apiUrl)
const delius = await apiResponse.json()

const downloadUrl = delius.urls[0].hd || delius.urls[0].sd

await conn.sendFile(m.chat, downloadUrl, 'video.mp4', contenido, m)

} catch {

try {
const ress = await fg.fbdl(args[0])
const urll = ress.data[0].url

await conn.sendFile(m.chat, urll, 'video.mp4', contenido, m)
await m.react('✅')

} catch {

try {
const result = await facebookdl(args[0])
const {video} = result

let url = video[0]?.url

await conn.sendFile(m.chat, url, 'video.mp4', contenido, m)

} catch (e) {
console.log(e)
m.reply('❌ Todas las APIs fallaron')
}
}
}
}
}
}
}
}

handler.command = /^(facebook|fb|facebookdl|fbdl)$/i
handler.limit = 3

export default handler} catch (e) {
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
