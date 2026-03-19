import fetch from 'node-fetch';

var handler = async (m, { conn, args }) => {

if (!args[0]) {
return conn.reply(m.chat, 'Pon link', m)
}

try {

await conn.reply(m.chat, 'Descargando...', m)

let res = await tiktokdl(args[0])
let data = res.data

// 🔥 probar todos los videos posibles
let video =
data.hdplay ||
data.wmplay ||
data.play

if (video) {

await conn.sendFile(
m.chat,
video,
"tiktok.mp4",
"✅ TikTok descargado",
m
)

} else {

return conn.reply(m.chat, 'No se pudo obtener video', m)

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


async function tiktokdl(url) {

let api = `https://www.tikwm.com/api/?url=${url}&hd=1`
let res = await (await fetch(api)).json()
return res

}
