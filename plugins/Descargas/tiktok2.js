import fetch from 'node-fetch';

var handler = async (m, { conn, args }) => {
    if (!args[0]) {
        return conn.reply(m.chat, `Por favor, ingresa un enlace de TikTok.`, m);
    }

    try {
        await conn.reply(
            m.chat,
            `✦ ¡Espera por favor!
Estoy descargando el TikTok...`,
            m
        );

        const tiktokData = await tiktokdl(args[0]);

        if (!tiktokData || !tiktokData.data) {
            return conn.reply(m.chat, "Error al obtener datos.", m);
        }

        const data = tiktokData.data;

        // ✅ SI ES VIDEO NORMAL
        if (data.play) {
            await conn.sendFile(
                m.chat,
                data.play,
                "tiktok.mp4",
                `☑️ Video descargado

© Elite Bot`,
                m
            );
        }

        // ✅ SI ES TIKTOK DE IMÁGENES
        else if (data.images && data.images.length > 0) {

            await conn.reply(m.chat, "📸 Enviando imágenes...", m);

            for (let img of data.images) {
                await conn.sendFile(
                    m.chat,
                    img,
                    "img.jpg",
                    "",
                    m
                );
            }

            // ✅ enviar audio
            if (data.music) {
                await conn.sendFile(
                    m.chat,
                    data.music,
                    "audio.mp3",
                    "🎵 Audio del TikTok",
                    m
                );
            }

        } else {
            return conn.reply(m.chat, "No se pudo descargar.", m);
        }

    } catch (e) {
        conn.reply(m.chat, `Error: ${e.message}`, m);
    }
};

handler.help = ['tiktok <link>'];
handler.tags = ['descargas'];
handler.command = ['tiktok2', 'tt'];
handler.group = true;

export default handler;


async function tiktokdl(url) {
    let api = `https://www.tikwm.com/api/?url=${url}&hd=1`;
    let res = await (await fetch(api)).json();
    return res;
}
