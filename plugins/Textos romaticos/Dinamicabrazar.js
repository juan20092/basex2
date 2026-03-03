import fs, { promises } from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Validación mejorada similar al primer código
    if (!text && !m.mentionedJid[0] && !m.quoted) 
        throw `⚠️ 𝙀𝙏𝙄𝙌𝙐𝙀𝙏𝘼 𝘼 𝙇𝘼 𝙋𝙀𝙍𝙎𝙊𝙉𝘼 𝙌𝙐𝙀 𝙌𝙐𝙄𝙀𝙍𝙀𝙎 𝘿𝘼𝙍 𝙐𝙉 𝘼𝘽𝙍𝘼𝙕𝙊.`

    try {
        // ✅ Obtener el usuario real (CORREGIDO)
        let user = m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.quoted 
                ? m.quoted.sender 
                : false

        if (!user) throw `⚠️ No encontré a quién mencionas.`

        // Crear el nombre de usuario basado en el JID
        let userName = user.split('@')[0]
        let senderName = m.sender.split('@')[0]

        let fkontak = { 
            key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" }, 
            message: { 
                contactMessage: { 
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
                }
            }, 
            participant: "0@s.whatsapp.net" 
        }

        // ✅ Menú corregido usando las variables correctas
        let menu = `
*@${senderName}* 𝙏𝙀 𝘿𝙄𝙊 𝙐𝙉 𝘼𝘽𝙍𝘼𝙕𝙊 𝘿𝙀 𝙊𝙎𝙊 𝘼 *@${userName}* , 𝙀𝙍𝙀𝙎 𝙐𝙉𝘼 𝙂𝙍𝘼𝙉 𝙋𝙀𝙍𝙎𝙊𝙉𝘼, 𝙏𝙀 𝘼𝘿𝙈𝙄𝙍𝘼 𝙔 𝙀𝙎𝙏𝘼 𝙊𝙍𝙂𝙐𝙇𝙇𝙊𝙎@ 𝘿𝙀 𝙏𝙄.😍
━━━━━━━━━━━━━━━
*@${userName}*
 𝙏𝙀 𝘿𝙄𝙀𝙍𝙊𝙉 𝙐𝙉 𝘼𝘽𝙍𝘼𝙕𝙊. 🫂
        `.trim()

        // Array de videos
        const vi = [
            'https://telegra.ph/file/899eb3e64097ff236113f.mp4',
            'https://telegra.ph/file/3f2223646db5e854dcd94.mp4',
            'https://telegra.ph/file/8da4ce3f1cc7297037aba.mp4',
            'https://telegra.ph/file/b7371a28e5afebdcb1666.mp4',
            'https://telegra.ph/file/edc48fbdde69d7fc5b889.mp4'
        ]

        // ✅ Array de imágenes por si falla el video
        const images = [
            'https://telegra.ph/file/899eb3e64097ff236113f.jpg', // Ajusta estas URLs
            'https://telegra.ph/file/3f2223646db5e854dcd94.jpg',
            'https://telegra.ph/file/8da4ce3f1cc7297037aba.jpg'
        ]

        try {
            // ✅ Intentar enviar video con selección aleatoria corregida
            await conn.sendMessage(m.chat, { 
                video: { url: vi[Math.floor(Math.random() * vi.length)] }, 
                gifPlayback: true, 
                caption: menu, 
                mentions: [m.sender, user]  // ✅ Menciones correctas
            }, { quoted: fkontak })
        } catch (videoError) {
            console.log('Falló el video, intentando con imagen:', videoError)
            try {
                // ✅ Si falla el video, enviar imagen
                await conn.sendMessage(m.chat, { 
                    image: { url: images[Math.floor(Math.random() * images.length)] }, 
                    caption: menu, 
                    mentions: [m.sender, user]  // ✅ Menciones correctas
                }, { quoted: fkontak })
            } catch (imageError) {
                console.log('Falló la imagen, enviando solo texto:', imageError)
                // ✅ Si todo falla, al menos enviar el texto
                await conn.sendMessage(m.chat, { 
                    text: menu,
                    mentions: [m.sender, user]
                }, { quoted: fkontak })
            }
        }

    } catch (e) {
        console.log('❌ Error en el comando abrazar:', e)
        await m.reply(`❌ Hubo un error ejecutando el comando.`)
    }
}

handler.command = /^(abrazar|abrazo)$/i
handler.register = false
handler.group = true

export default handler
