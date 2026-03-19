import fetch from 'node-fetch'

var handler = async (m, { conn, args }) => {

if (!args[0]) {
return conn.reply(m.chat, 'Pon el link de TikTok', m)
}

try {

await conn.reply(m.chat, 'Descargando...', m)

let api = `https://tikwm.org/api/?url=${args[0]}`
let res = await (await fetch(api)).json()

if (!res || !res.data) {
return conn.reply(m.chat, 'Error en API', m)
}

let data = res.data

// intentar todos los videos posibles
let video =
data.hdplay ||
data.play ||
data.wmplay

if (video) {

await conn.sendFile(
m.chat,
video,
"tiktok.mp4",
"✅ TikTok descargado",
m
)

return
}

// si no hay video mandar imágenes + audio
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

handler.help = ['tiktok2 <link>']
handler.tags = ['descargas']
handler.command = ['tiktok2']
handler.group = true

export default handler
