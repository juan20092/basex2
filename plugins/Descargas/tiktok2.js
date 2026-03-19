import fetch from 'node-fetch';

var handler = async (m, { conn, args }) => {

    if (!args[0]) {
        return conn.reply(m.chat, 'Pon link', m)
    }

    try {

        await conn.reply(m.chat, 'Descargando...', m)

        let res = await tiktokdl(args[0])
        let data = res.data

        // ✅ usar cualquier video disponible
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

        } else {

            // si no hay video usar imágenes + audio
            if (data.images) {

                for (let img of data.images) {
                    await conn.sendFile(m.chat, img, "img.jpg", "", m)
                }

                if (data.music) {
                    await conn.sendFile(m.chat, data.music, "audio.mp3", "", m)
                }

            }

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
