import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from 'ytdl-core'
import axios from 'axios'
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
let q, v, yt, dl_url, ttl, size
if (!text) throw `¿𝙌𝙪𝙚 𝙘𝙖𝙣𝙘𝙞𝙤́𝙣 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙤?

» 𝘌𝘭 𝘶𝘴𝘰 𝘥𝘦𝘭 𝘤𝘰𝘮𝘢𝘯𝘥𝘰 𝘦𝘴 :
${usedPrefix + command} feid normal`
try {
await m.react('🕓')
const yt_play = await search(args.join(" "))

await conn.sendMessage(m.chat, {
text: `01:27 ━━━━━⬤──── 05:48
*⇄ㅤ   ◁   ㅤ  ❚❚ㅤ     ▷ㅤ   ↻*
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
let q = '128kbps'
let v = yt_play[0].url

// 🔹 DESCARGA PRINCIPAL CON API DE SYLPHY (del primer código)
const api = await (
  await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${v}&apikey=sylphy-e321`)
).json()

if (!api?.res?.url) throw 'Error: No se obtuvo URL de descarga desde la API Sylphy.'

await conn.sendMessage(m.chat, { 
  audio: { url: api.res.url }, 
  mimetype: 'audio/mpeg', 
  fileName: `${yt_play[0].title}.mp3` 
}, { quoted: m })

} catch (err) {
try {
// 🔹 Fallback 1 — Bochilteam Scraper
const yt = await youtubedl(v).catch(async _ => await youtubedlv2(v))
const dl_url = await yt.audio['128kbps'].download()
const ttl = await yt.title
await conn.sendMessage(m.chat, { audio: { url: dl_url }, mimetype: 'audio/mpeg', fileName: `${ttl}.mp3` }, { quoted: m})
} catch {
try {
// 🔹 Fallback 2 — ytdl-core directo
let info = await ytdl.getInfo(v)
let format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' })
await conn.sendMessage(m.chat, { audio: { url: format.url }, mimetype: 'audio/mpeg' }, { quoted: m })
} catch (e) {
m.reply(`⚠️ Error: ${e.message}`)
}}}
}
} catch (e) {
m.reply(`⚠️ Error general: ${e.message}`)
}}
handler.command = ['play']
handler.exp = 0
export default handler

async function search(query, options = {}) {
const search = await yts.search({ query, hl: "es", gl: "ES", ...options });
return search.videos};
