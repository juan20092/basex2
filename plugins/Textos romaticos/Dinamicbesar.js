let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Validación mejorada
    if (!text && !m.mentionedJid[0] && !m.quoted) 
        throw `⚠️ 𝙀𝙏𝙄𝙌𝙐𝙀𝙏𝘼 𝘼 𝙇𝘼 𝙋𝙀𝙍𝙎𝙊𝙉𝘼 𝙌𝙐𝙀 𝙏𝙀 𝙌𝙐𝙄𝙀𝙍𝙀𝙎 𝘽𝙀𝙎𝘼𝙍.\n\n✨ *Ejemplo:*\n.${command} @usuario`

    try {
        // ✅ Obtener el usuario real (CORREGIDO)
        let user = m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.quoted 
                ? m.quoted.sender 
                : false

        if (!user) throw `⚠️ No encontré a quién mencionas.`

        let senderName = m.sender.split('@')[0]
        let userName = user.split('@')[0]

        let fkontak = { 
            key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" }, 
            message: { 
                contactMessage: { 
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
                }
            }, 
            participant: "0@s.whatsapp.net" 
        }

        // ✅ Menú corregido con menciones reales
        let menu = `
*@${senderName}* 𝙀𝙎𝙏𝘼 𝘽𝙀𝙎𝘼𝙉𝘿𝙊 𝘼 *@${userName}* ♥️
━━━━━━━━━━━━━━━
*@${userName}*
 𝙏𝙀 𝘼𝘾𝘼𝘽𝘼𝙉 𝘿𝙀 𝘽𝙀𝙎𝘼𝙍. 🥺
        `.trim()

        // Array de videos de besos
        const kissVideos = [
            'https://telegra.ph/file/382d64b9295270f65bdc8.mp4',
            'https://telegra.ph/file/3a59074f828ac6784965e.mp4',
            'https://telegra.ph/file/f8b307542b1325f4f63e9.mp4',
            'https://telegra.ph/file/0f3ba18c0748fa9e54f1c.mp4',
            'https://telegra.ph/file/6c30ffe0b714c9990e32e.mp4'
        ]

        // Array de imágenes de respaldo
        const kissImages = [
            'https://telegra.ph/file/382d64b9295270f65bdc8.jpg', // ⚠️ Reemplaza con URLs reales
            'https://telegra.ph/file/3a59074f828ac6784965e.jpg',
            'https://telegra.ph/file/f8b307542b1325f4f63e9.jpg'
        ]

        await m.react('😘')

        try {
            // Intentar enviar video
            await conn.sendMessage(m.chat, { 
                video: { url: kissVideos[Math.floor(Math.random() * kissVideos.length)] }, 
                gifPlayback: true, 
                caption: menu, 
                mentions: [m.sender, user]  // ✅ Menciones correctas
            }, { quoted: fkontak })
        } catch (videoError) {
            console.log('Error con video, intentando con imagen:', videoError)
            try {
                // Fallback a imagen
                await conn.sendMessage(m.chat, { 
                    image: { url: kissImages[Math.floor(Math.random() * kissImages.length)] }, 
                    caption: menu, 
                    mentions: [m.sender, user]
                }, { quoted: fkontak })
            } catch (imageError) {
                console.log('Error con imagen, enviando solo texto:', imageError)
                // Fallback final: solo texto
                await conn.sendMessage(m.chat, { 
                    text: menu,
                    mentions: [m.sender, user]
                }, { quoted: fkontak })
            }
        }

    } catch (e) {
        console.log('❌ Error en el comando besar:', e)
        await m.reply(`❌ Hubo un error ejecutando el comando.`)
    }
}

handler.command = /^(beso|kiss|besar)$/i
handler.register = false
handler.group = true

export default handler
