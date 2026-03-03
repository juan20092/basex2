let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Validación mejorada
    if (!text && !m.mentionedJid[0] && !m.quoted) 
        throw `⚠️ 𝙀𝙏𝙄𝙌𝙐𝙀𝙏𝘼 𝘼 𝙇𝘼 𝙋𝙀𝙍𝙎𝙊𝙉𝘼 𝙌𝙐𝙀 𝙏𝙀 𝙌𝙐𝙄𝙀𝙍𝙀𝙎 𝘾𝙊𝙂𝙀𝙍.\n\n✨ *Ejemplo:*\n.${command} @usuario`

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
*@${senderName}* 𝙏𝙀 𝘼𝘾𝘼𝘽𝘼𝙎 𝘿𝙀 𝘾𝙊𝙂𝙀𝙍 𝘼 𝙇𝘼 𝙋𝙐𝙏𝙄𝙏𝘼 𝘿𝙀 *@${userName}* 𝙈𝙄𝙀𝙉𝙏𝙍𝘼𝙎 𝙏𝙀 𝘿𝙀𝘾𝙄𝘼 "𝙢𝙚𝙩𝙚𝙢𝙚𝙡𝙖 𝙙𝙪𝙧𝙤𝙤𝙤 𝙢𝙖́𝙨 𝙙𝙪𝙧𝙤𝙤𝙤 𝙦𝙪𝙚 𝙧𝙞𝙘𝙤 𝙥𝙞𝙩𝙤𝙩𝙚"...
𝙏𝙚𝙣𝙚𝙢𝙤𝙨 𝙦𝙪𝙚 𝙫𝙤𝙡𝙫𝙚𝙧 𝙖 𝙨𝙪𝙙𝙖𝙧 𝙟𝙪𝙣𝙩𝙤𝙨!!
━━━━━━━━━━━━━━━
*@${userName}*
 𝙏𝙀 𝘼𝘾𝘼𝘽𝘼𝙉 𝘿𝙀 𝘾𝙊𝙂𝙀𝙍.
 💦💦🍆🍆💦💦
        `.trim()

        // Array de videos explícitos
        const adultVideos = [
            'https://telegra.ph/file/fab2b6db04085256bfd63.mp4',
            'https://telegra.ph/file/d164d846965838a33c04a.mp4',
            'https://telegra.ph/file/67f2d7c486afa90895d07.mp4',
            'https://telegra.ph/file/6f57e5130cf58fb3b9e98.mp4'
        ]

        // Array de imágenes de respaldo
        const adultImages = [
            'https://telegra.ph/file/fab2b6db04085256bfd63.jpg', // ⚠️ Reemplaza con URLs reales
            'https://telegra.ph/file/d164d846965838a33c04a.jpg',
            'https://telegra.ph/file/67f2d7c486afa90895d07.jpg'
        ]

        await m.react('🍆')

        try {
            // Intentar enviar video
            await conn.sendMessage(m.chat, { 
                video: { url: adultVideos[Math.floor(Math.random() * adultVideos.length)] }, 
                gifPlayback: true, 
                caption: menu, 
                mentions: [m.sender, user]  // ✅ Menciones correctas
            }, { quoted: fkontak })
        } catch (videoError) {
            console.log('Error con video, intentando con imagen:', videoError)
            try {
                // Fallback a imagen
                await conn.sendMessage(m.chat, { 
                    image: { url: adultImages[Math.floor(Math.random() * adultImages.length)] }, 
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
        console.log('❌ Error en el comando coger:', e)
        await m.reply(`❌ Hubo un error ejecutando el comando.`)
    }
}

// ✅ Acepta variaciones del comando
handler.command = /^(coger|cojer|follar|sexo)$/i
handler.register = false
handler.group = true

export default handler
