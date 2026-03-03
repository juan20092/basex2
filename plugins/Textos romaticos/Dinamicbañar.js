let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Validación mejorada
    if (!text && !m.mentionedJid[0] && !m.quoted) 
        throw `🛀🏻 *¡Oops! Olvidaste mencionar al usuario con el que quieres bañarte!* 🚿\n\n✨ *Ejemplo:*\n\n.${command} @usuario`

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

        // ✅ Menú corregido con las menciones correctas
        let menu = `━━━━━━━━━━━━━━━━━━
🛁 *@${senderName} está bañándose con @${userName}!* 🛀🏻🚿✨

💖 *¡Relájate y disfruten del baño!*

━━━━━━━━━━━━━━━━━━
©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim()

        // Array de imágenes de baño (URLs de Telegra.ph)
        const bathImages = [
            'https://telegra.ph/file/6b1f5e1e3b5e1c8f5a3d0.jpg', // ⚠️ Reemplaza con URLs reales
            'https://telegra.ph/file/8c2f5d4e3a5e1c8f5a3d1.jpg',
            'https://telegra.ph/file/9d3f5e1e3b5e1c8f5a3d2.jpg',
            'https://telegra.ph/file/0e4f5e1e3b5e1c8f5a3d3.jpg',
            'https://telegra.ph/file/1f5f5e1e3b5e1c8f5a3d4.jpg'
        ]

        await m.react('🛁')

        try {
            // Intentar enviar imagen con URL aleatoria
            await conn.sendMessage(m.chat, { 
                image: { url: bathImages[Math.floor(Math.random() * bathImages.length)] }, 
                caption: menu, 
                mentions: [m.sender, user]  // ✅ Menciones correctas
            }, { quoted: fkontak })
        } catch (imgError) {
            console.log('Error con imagen online, intentando con imagen local:', imgError)
            try {
                // Verificar si existe el archivo local antes de enviarlo
                try {
                    await fs.promises.access('./src/baño.jpg')
                    await conn.sendMessage(m.chat, { 
                        image: fs.readFileSync('./src/baño.jpg'), 
                        caption: menu, 
                        mentions: [m.sender, user]
                    }, { quoted: fkontak })
                } catch (fileError) {
                    throw new Error('Archivo local no encontrado')
                }
            } catch (localError) {
                console.log('Error con imagen local, enviando solo texto:', localError)
                // Fallback final: solo texto
                await conn.sendMessage(m.chat, { 
                    text: menu,
                    mentions: [m.sender, user]
                }, { quoted: fkontak })
            }
        }

    } catch (e) {
        console.log('❌ Error en el comando bañar:', e)
        await m.reply(`❌ Hubo un error ejecutando el comando.`)
    }
}

handler.command = /^(bañar|banar|duchar)$/i  // Acepta variaciones
handler.register = false
handler.group = true

export default handler
