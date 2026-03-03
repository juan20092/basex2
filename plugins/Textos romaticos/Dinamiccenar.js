let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Validación mejorada
    if (!text && !m.mentionedJid[0] && !m.quoted) 
        throw `🍽️ *¡Ups! Olvidaste mencionar al usuario con el que quieres cenar!* 🌹\n\n✨ *Ejemplo:*\n\n.${command} @usuario`

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
        let menu = `━━━━━━━━━━━━━━━━━━
🍕 *@${senderName}* 𝘵𝘪𝘦𝘯𝘦 𝘶𝘯𝘢 𝘤𝘦𝘯𝘢 𝘳𝘰𝘮𝘢𝘯𝘵𝘪𝘤𝘢 𝘤𝘰𝘯 *@${userName}* 🍷

💖 *¡Que la cena sea deliciosa y romántica!* ✨

━━━━━━━━━━━━━━━━━━
©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim()

        // Array de imágenes de cena romántica
        const dinnerImages = [
            'https://telegra.ph/file/ejemplo-cena1.jpg', // ⚠️ Reemplaza con URLs reales de imágenes de cenas románticas
            'https://telegra.ph/file/ejemplo-cena2.jpg',
            'https://telegra.ph/file/ejemplo-cena3.jpg',
            'https://telegra.ph/file/ejemplo-cena4.jpg',
            'https://telegra.ph/file/ejemplo-cena5.jpg'
        ]

        await m.react('🍽️')

        try {
            // Intentar enviar imagen con URL aleatoria
            await conn.sendMessage(m.chat, { 
                image: { url: dinnerImages[Math.floor(Math.random() * dinnerImages.length)] }, 
                caption: menu, 
                mentions: [m.sender, user]  // ✅ Menciones correctas
            }, { quoted: fkontak })
        } catch (imgError) {
            console.log('Error con imagen online, intentando con imagen local:', imgError)
            try {
                // Verificar si existe el archivo local antes de enviarlo
                try {
                    await fs.promises.access('./src/cenar.jpg')
                    await conn.sendMessage(m.chat, { 
                        image: fs.readFileSync('./src/cenar.jpg'), 
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
        console.log('❌ Error en el comando cenar:', e)
        await m.reply(`❌ Hubo un error ejecutando el comando.`)
    }
}

handler.command = /^(cenar|cena)$/i  // Acepta "cenar" y "cena"
handler.register = false
handler.group = true

export default handler
