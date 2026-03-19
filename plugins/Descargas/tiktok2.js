import fetch from 'node-fetch'

var handler = async (m, { conn, args }) => {

if (!args[0]) {
return conn.reply(m.chat, 'Pon link', m)
}

try {

await conn.reply(m.chat, 'Descargando...', m)

let api = `https://www.tikwm.com/api/?url=${args[0]}&hd=1`
let res = await (await fetch(api)).json()

if (!res.data) {
return conn.reply(m.chat, 'Error API', m)
}

let data = res.data

let video =
data.hdplay ||
data.play ||
data.wmplay

if (video) {

await conn.sendFile(
m.chat,
video,
"tiktok.mp4",
"✅ TikTok",
m
)

return
}

if (data.images) {

for (let img of data.images) {

await conn.sendFile(
m.chat,
img,
"img.jpg",
"",
m
)

}

if (data.music) {

await conn.sendFile(
m.chat,
data.music,
"audio.mp3",
"",
m
)

}

return
}

conn.reply(m.chat, 'No se pudo descargar', m)

} catch (e) {

conn.reply(m.chat, e.message, m)

}

}

handler.command = ['tiktok2']
handler.tags = ['descargas']
handler.group = true

export default handler
