import fetch from 'node-fetch';

var handler = async (m, { conn, args }) => {

if (!args[0]) {
return conn.reply(m.chat, 'Pon link', m)
}

try {

await conn.reply(m.chat, 'Descargando...', m)

let api = `https://api.tiklydown.eu.org/api/download?url=${args[0]}`
let res = await (await fetch(api)).json()

let video =
res.video?.noWatermark ||
res.video?.noWatermark_hd ||
res.video?.watermark

if (video) {

await conn.sendFile(
m.chat,
video,
"tiktok.mp4",
"✅ TikTok descargado",
m
)

} else {

conn.reply(m.chat, 'No se pudo descargar', m)

}

} catch (e) {

conn.reply(m.chat, e.message, m)

}

}

handler.command = ['tiktok2']
handler.tags = ['descargas']
handler.help = ['tiktok2 link']
handler.group = true

export default handler
