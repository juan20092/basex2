import yts from 'yt-search'

const MAX_SECONDS = 90 * 60
const HTTP_TIMEOUT_MS = 90 * 1000

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

function formatErr(err, maxLen = 1500) {
  const e = err ?? 'Error desconocido'
  let msg = ''

  if (e instanceof Error) msg = e.stack || `${e.name}: ${e.message}`
  else if (typeof e === 'string') msg = e
  else {
    try {
      msg = JSON.stringify(e, null, 2)
    } catch {
      msg = String(e)
    }
  }

  msg = String(msg || 'Error desconocido').trim()
  if (msg.length > maxLen) msg = msg.slice(0, maxLen) + '\n... (recortado)'
  return msg
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

function guessMimeFromUrl(fileUrl = '') {
  let ext = ''
  try {
    ext = new URL(fileUrl).pathname.split('.').pop() || ''
  } catch {
    ext = String(fileUrl).split('.').pop() || ''
  }
  ext = '.' + String(ext).toLowerCase().replace(/[^a-z0-9]/g, '')
  if (ext === '.m4a') return 'audio/mp4'
  if (ext === '.opus') return 'audio/ogg; codecs=opus'
  if (ext === '.webm') return 'audio/webm'
  return 'audio/mpeg'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const chatId = m?.chat || m?.key?.remoteJid
  if (!chatId) return

  if (!text) {
    return conn.sendMessage(
      chatId,
      { text: `「✦」Escribe el nombre o link del video.\n> ✐ Ejemplo » *${usedPrefix + command} lovely*` },
      { quoted: m }
    )
  }

  await conn.sendMessage(chatId, { react: { text: '🕒', key: m.key } }).catch(() => {})

  let ytUrl = text.trim()
  let ytInfo = null

  try {
    if (!/youtu\.be|youtube\.com/i.test(ytUrl)) {
      const search = await yts(ytUrl)
      const first = search?.videos?.[0]
      if (!first) {
        await conn.sendMessage(chatId, { text: '「✦」No se encontraron resultados.' }, { quoted: m })
        return
      }
      ytInfo = first
      ytUrl = first.url
    } else {
      const search = await yts({ query: ytUrl, pages: 1 })
      if (search?.videos?.length) ytInfo = search.videos[0]
    }
  } catch (e) {
    await conn.sendMessage(
      chatId,
      { text: `「✦」Error buscando en YouTube.\n\n> 🧩 Error:\n\`\`\`\n${formatErr(e)}\n\`\`\`` },
      { quoted: m }
    )
    return
  }

  const durSec =
    parseDurationToSeconds(ytInfo?.duration?.seconds) ??
    parseDurationToSeconds(ytInfo?.seconds) ??
    parseDurationToSeconds(ytInfo?.duration) ??
    parseDurationToSeconds(ytInfo?.timestamp)

  if (durSec && durSec > MAX_SECONDS) {
    await conn.sendMessage(
      chatId,
      { text: `「✦」Audio muy largo.\n> Máx: ${Math.floor(MAX_SECONDS / 60)} min.` },
      { quoted: m }
    )
    return
  }

  const title = ytInfo?.title || 'Audio'
  const author = ytInfo?.author?.name || ytInfo?.author || 'Desconocido'
  const duration = ytInfo?.timestamp || 'Desconocida'
  const thumbnail = ytInfo?.thumbnail

  const caption = `🎧 *Reproduciendo*
━━━━━━━━━━━━━━
📌 *Título:* ${title}
👤 *Canal:* ${author}
⏱️ *Duración:* ${duration}
🔗 *Link:* ${ytUrl}
━━━━━━━━━━━━━━`

  try {
    if (thumbnail) await conn.sendMessage(chatId, { image: { url: thumbnail }, caption }, { quoted: m })
    else await conn.sendMessage(chatId, { text: caption }, { quoted: m })
  } catch {}

  let apiResp = null
  try {
    const apiUrl =
      `https://api-adonix.ultraplus.click/download/ytaudio` +
      `?apikey=Adofreekey&url=${encodeURIComponent(String(ytUrl))}`

    apiResp = await fetchJson(apiUrl, HTTP_TIMEOUT_MS)
  } catch (e) {
    await conn.sendMessage(
      chatId,
      { text: `「✦」Error usando la API.\n\n> 🧩 Error:\n\`\`\`\n${formatErr(e)}\n\`\`\`` },
      { quoted: m }
    )
    return
  }

  if (!apiResp?.status || !apiResp?.data?.url) {
    await conn.sendMessage(
      chatId,
      { text: `「✦」La API no devolvió un link válido.\n\n> Respuesta:\n\`\`\`\n${String(JSON.stringify(apiResp, null, 2)).slice(0, 1500)}\n\`\`\`` },
      { quoted: m }
    )
    return
  }

  const directUrl = String(apiResp.data.url)
  const apiTitle = apiResp?.data?.title || title

  try {
    const audioBuffer = await fetchBuffer(directUrl, HTTP_TIMEOUT_MS)
    const mime = guessMimeFromUrl(directUrl)

    await conn.sendMessage(
      chatId,
      {
        audio: audioBuffer,
        mimetype: mime,
        fileName: `${apiTitle}.mp3`
      },
      { quoted: m }
    )

    await conn.sendMessage(chatId, { react: { text: '✔️', key: m.key } }).catch(() => {})
  } catch (e) {
    await conn.sendMessage(
      chatId,
      { text: `「✦」Error descargando/enviando el audio.\n\n> 🧩 Error:\n\`\`\`\n${formatErr(e)}\n\`\`\`` },
      { quoted: m }
    )
  }
}

handler.help = ['play <texto|link>']
handler.tags = ['multimedia']
handler.command = ['play']

export default handler



/*import fetch from "node-fetch"
import yts from "yt-search"
import fs from "fs"
import path from "path"

const TMP_DIR = path.join(process.cwd(), "tmp")

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) {
return conn.reply(
m.chat,
❌ Usa el comando así:\n\n${usedPrefix + command} nombre de la canción,
m
)
}

try {
// 📂 Crear carpeta tmp si no existe
if (!fs.existsSync(TMP_DIR)) {
fs.mkdirSync(TMP_DIR, { recursive: true })
}

// 🔍 Buscar en YouTube  
const search = await yts(text)  
if (!search.videos || search.videos.length === 0) {  
  return conn.reply(m.chat, "❌ No se encontraron resultados.", m)  
}  

// 🎵 Primer resultado  
const video = search.videos[0]  
const videoUrl = video.url  

// 📡 Llamar a la API  
const apiUrl = `https://gawrgura-api.onrender.com/download/ytmp3?url=${encodeURIComponent(text)}`  
const res = await fetch(apiUrl)  
const json = await res.json()  

if (!json.status || !json.result) {  
  return conn.reply(m.chat, "❌ Error al descargar el audio.", m)  
}  

// 🧾 Nombre del archivo  
const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, "")  
const filePath = path.join(TMP_DIR, `${safeTitle}.mp3`)  

// ⬇️ Descargar el audio a tmp/  
const audioRes = await fetch(json.result)  
const buffer = await audioRes.arrayBuffer()  
fs.writeFileSync(filePath, Buffer.from(buffer))  

// ℹ️ Información  
let info = `

🎧 Reproduciendo
━━━━━━━━━━━━━━
📌 Título: ${video.title}
👤 Canal: ${video.author.name}
⏱️ Duración: ${video.timestamp}
👁️ Vistas: ${video.views.toLocaleString()}
━━━━━━━━━━━━━━
`

await conn.sendMessage(  
  m.chat,  
  {  
    image: { url: video.thumbnail },  
    caption: info.trim()  
  },  
  { quoted: m }  
)  

// 🔊 Enviar audio desde archivo local  
await conn.sendMessage(  
  m.chat,  
  {  
    audio: fs.readFileSync(filePath),  
    mimetype: "audio/mp3",  
    fileName: `${safeTitle}.mp3`  
  },  
  { quoted: m }  
)  

// 🧹 Borrar archivo después de enviar  
fs.unlinkSync(filePath)

} catch (e) {
console.error(e)
conn.reply(m.chat, "❌ Ocurrió un error inesperado.", m)
}
}

handler.help = ["play <canción>"]
handler.tags = ["descargas"]
handler.command = ["play"]

export default handler*/
