//import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'
import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import axios from 'axios'; 
import { savetube } from '../lib/yt-savetube.js'
import { ogmp3 } from '../lib/youtubedl.js'; 
const LimitAud = 725 * 1024 * 1024; // 725MB
const LimitVid = 425 * 1024 * 1024; // 425MB
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;
const userCaptions = new Map();
const userRequests = {};
  
const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) return m.reply(`*🤔Que está buscando? 🤔*\n*Ingrese el nombre de la canción*\n\n*Ejemplo:*\n${usedPrefix + command} emilia 420`);
const tipoDescarga = command === 'play' || command === 'musica' ? 'audio' : command === 'play2' ? 'video' : command === 'play3' ? 'audio (documento)' : command === 'play4' ? 'video (documento)' : '';
if (userRequests[m.sender]) return await conn.reply(m.chat, `⏳ Hey @${m.sender.split('@')[0]} espera pendejo, ya estás descargando algo 🙄\nEspera a que termine tu solicitud actual antes de hacer otra...`, userCaptions.get(m.sender) || m);
userRequests[m.sender] = true;
try {
let videoIdToFind = text.match(youtubeRegexID) || null;
const yt_play = await search(args.join(' ')); 
let ytplay2 = await yts(videoIdToFind === null ? text : 'https://youtu.be/' + videoIdToFind[1]);
if (videoIdToFind) {
const videoId = videoIdToFind[1];
ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId)}
ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2;
const PlayText = await conn.sendMessage(m.chat, { text: `${yt_play[0].title}
*⇄ㅤ     ◁   ㅤ  ❚❚ㅤ     ▷ㅤ     ↻*

*⏰ Duración:* ${secondString(yt_play[0].duration.seconds)}
*👉🏻Aguarde un momento en lo que envío su ${tipoDescarga}*`,  
contextInfo:{  
forwardedNewsletterMessageInfo: { 
newsletterJid: '120363321650707484@newsletter', 
serverMessageId: '', 
newsletterName: 'LoliBot ✨️' },
forwardingScore: 9999999,  
isForwarded: true,   
mentionedJid: null,  
externalAdReply: {  
showAdAttribution: false,  
renderLargerThumbnail: false,  
title: yt_play[0].title,   
body: "LoliBot",
containsAutoReply: true,  
mediaType: 1,   
thumbnailUrl: yt_play[0].thumbnail, 
sourceUrl: "skyultraplus.com"
}}}, { quoted: m })
userCaptions.set(m.sender, PlayText);

const [input, qualityInput = command === 'play' || command === 'musica' || command === 'play3' ? '320' : '720'] = text.split(' ');
const audioQualities = ['64', '96', '128', '192', '256', '320'];
const videoQualities = ['240', '360', '480', '720', '1080'];
const isAudioCommand = command === 'play' || command === 'musica' || command === 'play3';
const selectedQuality = (isAudioCommand ? audioQualities : videoQualities).includes(qualityInput) ? qualityInput : (isAudioCommand ? '320' : '720');
const isAudio = command.toLowerCase().includes('mp3') || command.toLowerCase().includes('audio')
const format = isAudio ? 'mp3' : '720' 

const audioApis = [
{ url: () => savetube.download(yt_play[0].url, format), extract: (data) => ({ data: data.result.download, isDirect: false }) },
{ url: () => ogmp3.download(yt_play[0].url, selectedQuality, 'audio'), extract: (data) => ({ data: data.result.download, isDirect: false }) },
{ url: () => fetch(`https://api.dorratz.com/v3/ytdl?url=${yt_play[0].url}`).then(res => res.json()), extract: (data) => { 
const mp3 = data.medias.find(media => media.quality === "160kbps" && media.extension === "mp3");
return { data: mp3.url, isDirect: false }}},
{ url: () => fetch(`https://api.neoxr.eu/api/youtube?url=${yt_play[0].url}&type=audio&quality=128kbps&apikey=GataDios`).then(res => res.json()), extract: (data) => ({ data: data.data.url, isDirect: false }) },
{ url: () => fetch(`https://api.fgmods.xyz/api/downloader/ytmp4?url=${yt_play[0].url}&apikey=elrebelde21`).then(res => res.json()), extract: (data) => ({ data: data.result.dl_url, isDirect: false }) },
{ url: () => fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${yt_play[0].url}`).then(res => res.json()), extract: (data) => ({ data: data.dl, isDirect: false }) },
{ url: () => fetch(`${info.apis}/download/ytmp3?url=${yt_play[0].url}`).then(res => res.json()), extract: (data) => ({ data: data.status ? data.data.download.url : null, isDirect: false }) },
{ url: () => fetch(`https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${yt_play[0].url}`).then(res => res.json()), extract: (data) => ({ data: data.result.download.url, isDirect: false }) },
{ url: () => fetch(`https://exonity.tech/api/dl/playmp3?query=${yt_play[0].title}`).then(res => res.json()), extract: (data) => ({ data: data.result.download, isDirect: false }) 
}];

const videoApis = [
{ url: () => savetube.download(yt_play[0].url, '720'), extract: (data) => ({ data: data.result.download, isDirect: false }) },
{ url: () => ogmp3.download(yt_play[0].url, selectedQuality, 'video'), extract: (data) => ({ data: data.result.download, isDirect: false }) },
{ url: () => fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${yt_play[0].url}`).then(res => res.json()), extract: (data) => ({ data: data.dl, isDirect: false }) },
{ url: () => fetch(`https://api.neoxr.eu/api/youtube?url=${yt_play[0].url}&type=video&quality=720p&apikey=GataDios`).then(res => res.json()), extract: (data) => ({ data: data.data.url, isDirect: false }) },
{ url: () => fetch(`https://api.fgmods.xyz/api/downloader/ytmp4?url=${yt_play[0].url}&apikey=elrebelde21`).then(res => res.json()), extract: (data) => ({ data: data.result.dl_url, isDirect: false }) },
{ url: () => fetch(`${info.apis}/download/ytmp4?url=${encodeURIComponent(yt_play[0].url)}`).then(res => res.json()), extract: (data) => ({ data: data.status ? data.data.download.url : null, isDirect: false }) },
{ url: () => fetch(`https://exonity.tech/api/dl/playmp4?query=${encodeURIComponent(yt_play[0].title)}`).then(res => res.json()), extract: (data) => ({ data: data.result.download, isDirect: false })
}];

const download = async (apis) => {
let mediaData = null;
let isDirect = false;
for (const api of apis) {
try {
const data = await api.url();
const { data: extractedData, isDirect: direct } = api.extract(data);
if (extractedData) {
const size = await getFileSize(extractedData);
if (size >= 1024) {
mediaData = extractedData;
isDirect = direct;
break;
}}} catch (e) {
console.log(`Error con API: ${e}`);
continue;
}}
return { mediaData, isDirect };
};

if (command === 'play' || command === 'musica') {
const { mediaData, isDirect } = await download(audioApis);
if (mediaData) {
const fileSize = await getFileSize(mediaData);
if (fileSize > LimitAud) {
await conn.sendMessage(m.chat, { document: isDirect ? mediaData : { url: mediaData }, mimetype: 'audio/mpeg', fileName: `${yt_play[0].title}.mp3`, contextInfo: {} }, { quoted: m });
} else {
await conn.sendMessage(m.chat, { audio: isDirect ? mediaData : { url: mediaData }, mimetype: 'audio/mpeg', contextInfo: {} }, { quoted: m });
}} else {
//await m.react('❌');
}}

if (command === 'play2' || command === 'video') {
const { mediaData, isDirect } = await download(videoApis);
if (mediaData) {
const fileSize = await getFileSize(mediaData);
const messageOptions = { fileName: `${yt_play[0].title}.mp4`, caption: `🔰 Aquí está tu video \n🔥 Título: ${yt_play[0].title}`, mimetype: 'video/mp4' };
if (fileSize > LimitVid) {
await conn.sendMessage(m.chat, { document: isDirect ? mediaData : { url: mediaData }, ...messageOptions }, { quoted: m });
} else {
await conn.sendMessage(m.chat, { video: isDirect ? mediaData : { url: mediaData }, thumbnail: yt_play[0].thumbnail, ...messageOptions }, { quoted: m });
}} else {
//await m.react('❌');
}}

if (command === 'play3' || command === 'playdoc') {
const { mediaData, isDirect } = await download(audioApis);
if (mediaData) {
await conn.sendMessage(m.chat, { document: isDirect ? mediaData : { url: mediaData }, mimetype: 'audio/mpeg', fileName: `${yt_play[0].title}.mp3`, contextInfo: {} }, { quoted: m });
} else {
await m.react('❌');
}}

if (command === 'play4' || command === 'playdoc2') {
const { mediaData, isDirect } = await download(videoApis);
if (mediaData) {
await conn.sendMessage(m.chat, { document: isDirect ? mediaData : { url: mediaData }, fileName: `${yt_play[0].title}.mp4`, caption: `🔰Título: ${yt_play[0].title}`, thumbnail: yt_play[0].thumbnail, mimetype: 'video/mp4'}, { quoted: m })
} else {
//await m.react('❌');
}}
} catch (error) {
console.error(error);
m.react("❌️")
} finally {
delete userRequests[m.sender]; 
}}
handler.help = ['play', 'play2', 'play3', 'play4', 'playdoc'];
handler.tags = ['downloader'];
handler.command = ['play', 'play2', 'play3', 'play4', 'audio', 'video', 'playdoc', 'playdoc2', 'musica'];
handler.register = true;
export default handler;

async function search(query, options = {}) {
const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
return search.videos;
}

function MilesNumber(number) {
const exp = /(\d)(?=(\d{3})+(?!\d))/g;
const rep = '$1.';
const arr = number.toString().split('.');
arr[0] = arr[0].replace(exp, rep);
return arr[1] ? arr.join('.') : arr[0];
}

function secondString(seconds) {
seconds = Number(seconds);
const d = Math.floor(seconds / (3600 * 24));
const h = Math.floor((seconds % (3600 * 24)) / 3600);
const m = Math.floor((seconds % 3600) / 60);
const s = Math.floor(seconds % 60);
const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';
return dDisplay + hDisplay + mDisplay + sDisplay;
  }
  
const getBuffer = async (url) => {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error("Error al obtener el buffer", error);
    throw new Error("Error al obtener el buffer");
  }
}

async function getFileSize(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return parseInt(response.headers.get('content-length') || 0);
  } catch {
    return 0; // Si falla, asumimos 0
  }
}                  }
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
