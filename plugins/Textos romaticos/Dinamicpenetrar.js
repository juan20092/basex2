let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Validación mejorada
    if (!text && !m.mentionedJid[0] && !m.quoted) 
        throw `⚠️ 𝙀𝙏𝙄𝙌𝙐𝙀𝙏𝘼 𝘼 𝙇𝘼 𝙋𝙀𝙍𝙎𝙊𝙉𝘼 𝙌𝙐𝙀 𝙏𝙀 𝙌𝙐𝙄𝙀𝙍𝙀𝙎 𝙋𝙀𝙉𝙀𝙏𝙍𝘼𝙍.\n\n✨ *Ejemplo:*\n.${command} @usuario`

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
*@${senderName}* 𝙇𝙀 𝙃𝘼 𝙈𝙀𝙏𝙄𝘿𝙊 𝙀𝙇 𝙋𝙀𝙉𝙀 𝘼 *@${userName}* 𝘾𝙊𝙉 𝙏𝙊𝘿𝙊 𝙔 𝘾𝙊𝙉𝘿𝙊́𝙉 𝙃𝘼𝙎𝙏𝘼 𝙌𝙐𝙀𝘿𝘼𝙍 𝙎𝙀𝘾𝙊, 𝙔 𝙃𝘼𝙕 𝘿𝙄𝘾𝙃𝙊 "𝙋𝙤𝙧 𝙛𝙖𝙫𝙤𝙧 𝙢𝙖́𝙨 𝙙𝙪𝙧𝙤𝙤𝙤𝙤𝙤𝙤"!! , 𝙖𝙝𝙝𝙝𝙝𝙝𝙝𝙝 𝙖𝙝𝙝𝙝𝙝𝙝𝙝𝙝 , 𝙝𝙖𝙯𝙢𝙚 𝙪𝙣 𝙝𝙞𝙟𝙤 𝙦𝙪𝙚 𝙨𝙚𝙖 𝙞𝙜𝙪𝙖𝙡 𝙙𝙚 𝙥𝙞𝙩𝙪𝙙𝙤 𝙦𝙪𝙚 𝙩𝙪́ !! 𝙈𝙄𝙀𝙉𝙏𝙍𝘼𝙎 𝙏𝙀 𝙋𝙀𝙉𝙀𝙏𝙍𝘼𝘽𝘼𝙉 𝙔 𝙇𝙐𝙀𝙂𝙊 𝙏𝙀 𝙃𝘼𝙉 𝘿𝙀𝙅𝘼𝘿𝙊 𝙀𝙉 𝙎𝙄𝙇𝙇𝘼𝙎 𝘿𝙀 𝙍𝙐𝙀𝘿𝘼𝙎 .
━━━━━━━━━━━━━━━
*@${userName}*
 𝙏𝙀 𝘼𝘾𝘼𝘽𝘼𝙉 𝘿𝙀 𝙈𝙀𝙏𝙀𝙍𝙏𝙀.
 🤤🤤🔥🔥🤤🤤
        `.trim()

        // Array de videos
        const penetrarVideos = [
            'https://telegra.ph/file/0fa519399cea3d74022c3.mp4',
            'https://telegra.ph/file/0aaec457747fad13bf4bf.mp4',
            'https://telegra.ph/file/fc5dfc0bd91fc2d860dc5.mp4',
            'https://telegra.ph/file/388c4aa86e88049a9afcd.mp4'
        ]

        // Array de imágenes de respaldo
        const penetrarImages = [
            'https://telegra.ph/file/0fa519399cea3d74022c3.jpg', // ⚠️ Reemplaza con URLs reales
            'https://telegra.ph/file/0aaec457747fad13bf4bf.jpg',
            'https://telegra.ph/file/fc5dfc0bd91fc2d860dc5.jpg'
        ]

        await m.react('🔥')

        try {
            // Intentar enviar video
            await conn.sendMessage(m.chat, { 
                video: { url: penetrarVideos[Math.floor(Math.random() * penetrarVideos.length)] }, 
                gifPlayback: true, 
                caption: menu, 
                mentions: [m.sender, user]  // ✅ Menciones correctas
            }, { quoted: fkontak })
        } catch (videoError) {
            console.log('Error con video, intentando con imagen:', videoError)
            try {
                // Fallback a imagen
                await conn.sendMessage(m.chat, { 
                    image: { url: penetrarImages[Math.floor(Math.random() * penetrarImages.length)] }, 
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
        console.log('❌ Error en el comando penetrar:', e)
        await m.reply(`❌ Hubo un error ejecutando el comando.`)
    }
}

handler.command = /^(penetrar|penetra)$/i  // Acepta variaciones
handler.register = false
handler.group = true

export default handler
