let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Validación mejorada
    if (!text && !m.mentionedJid[0] && !m.quoted) 
        throw `⚠️ 𝙀𝙏𝙄𝙌𝙐𝙀𝙏𝘼 𝘼 𝙇𝘼 𝙋𝙀𝙍𝙎𝙊𝙉𝘼 𝙌𝙐𝙀 𝙏𝙀 𝙌𝙐𝙄𝙀𝙍𝙀𝙎 𝙂𝙊𝙇𝙋𝙀𝘼𝙍.\n\n✨ *Ejemplo:*\n.${command} @usuario`

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
*@${senderName}* 𝙏𝙀 𝘼𝘾𝘼𝘽𝙊 𝘿𝙀 𝘿𝘼𝙍 𝙐𝙉 𝙂𝙊𝙇𝙋𝙀 𝘼 *@${userName}* 𝙋𝙊𝙍 𝙏𝙊𝙉𝙏𝙊 𝙔 𝙀𝙎𝙏𝙐𝙋𝙄𝘿𝙊, 𝙋𝙊𝙍𝙏𝘼𝙏𝙀 𝘽𝙄𝙀𝙉! 👊🏿
━━━━━━━━━━━━━━━
*@${userName}*
𝙏𝙀 𝘼𝘾𝘼𝘽𝘼𝙉 𝘿𝙀 𝙂𝙊𝙇𝙋𝙀𝘼𝙍. 
👊🏾👊🏾👊🏾👊🏾
        `.trim()

        // Array de videos de golpes
        const hitVideos = [
            'https://telegra.ph/file/09bcade511263b3822cb9.mp4',
            'https://telegra.ph/file/78e653eb99ae6b869d6d9.mp4',
            'https://telegra.ph/file/a51cf354202b789bd08bc.mp4',
            'https://telegra.ph/file/7c26992a620e407dce9e6.mp4',
            'https://telegra.ph/file/c66407bc09d3edffff039.mp4'
        ]

        // Array de imágenes de respaldo
        const hitImages = [
            'https://telegra.ph/file/09bcade511263b3822cb9.jpg', // ⚠️ Reemplaza con URLs reales
            'https://telegra.ph/file/78e653eb99ae6b869d6d9.jpg',
            'https://telegra.ph/file/a51cf354202b789bd08bc.jpg'
        ]

        await m.react('👊')

        try {
            // Intentar enviar video
            await conn.sendMessage(m.chat, { 
                video: { url: hitVideos[Math.floor(Math.random() * hitVideos.length)] }, 
                gifPlayback: true, 
                caption: menu, 
                mentions: [m.sender, user]  // ✅ Menciones correctas
            }, { quoted: fkontak })
        } catch (videoError) {
            console.log('Error con video, intentando con imagen:', videoError)
            try {
                // Fallback a imagen
                await conn.sendMessage(m.chat, { 
                    image: { url: hitImages[Math.floor(Math.random() * hitImages.length)] }, 
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
        console.log('❌ Error en el comando golpear:', e)
        await m.reply(`❌ Hubo un error ejecutando el comando.`)
    }
}

handler.command = /^(golpear|golpiar|golpe)$/i  // Acepta variaciones
handler.register = false
handler.group = true

export default handler
