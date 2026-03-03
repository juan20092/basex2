let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Validación mejorada
    if (!text && !m.mentionedJid[0] && !m.quoted) 
        throw `🎶 *¡Oops! Olvidaste mencionar al usuario con quien quieres bailar!* 💃\n\n✨ *Ejemplo:*\n\n.${command} @usuario`

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
🎉 *¡@${senderName} está bailando con @${userName}!* 💃🏻🕺🏻✨

🎶 *¡Que suene la música y a disfrutar!* 🎶

💖 *Que el ritmo los acompañe* 💖

━━━━━━━━━━━━━━━━━━
©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim()

        // Array de imágenes de baile (URLs)
        const danceImages = [
            'https://telegra.ph/file/ejemplo1.jpg', // ⚠️ Reemplaza estas URLs con imágenes reales de baile
            'https://telegra.ph/file/ejemplo2.jpg',
            'https://telegra.ph/file/ejemplo3.jpg',
            'https://telegra.ph/file/ejemplo4.jpg',
            'https://telegra.ph/file/ejemplo5.jpg'
        ]

        await m.react('💃🏻')

        try {
            // Intentar enviar imagen con URL aleatoria
            await conn.sendMessage(m.chat, { 
                image: { url: danceImages[Math.floor(Math.random() * danceImages.length)] }, 
                caption: menu, 
                mentions: [m.sender, user]  // ✅ Menciones correctas
            }, { quoted: fkontak })
        } catch (imgError) {
            console.log('Error con imagen online, intentando con imagen local:', imgError)
            try {
                // Fallback a imagen local
                await conn.sendMessage(m.chat, { 
                    image: fs.readFileSync('./src/baile.jpg'), // Cambia la ruta si es necesario
                    caption: menu, 
                    mentions: [m.sender, user]
                }, { quoted: fkontak })
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
        console.log('❌ Error en el comando bailar:', e)
        await m.reply(`❌ Hubo un error ejecutando el comando.`)
    }
}

handler.command = /^(bailar|dance)$/i
handler.register = false
handler.group = true

export default handler
