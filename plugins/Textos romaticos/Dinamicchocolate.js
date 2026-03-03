let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Validación mejorada
    if (!text && !m.mentionedJid[0] && !m.quoted) 
        throw `🌟 *¡Oops! Olvidaste mencionar al usuario!*\n➡️ *Etiqueta al usuario que le quieres dar un chocolate* 🍫\n\n✨ *Ejemplo:*\n\n.${command} @usuario`

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

        // ✅ Array de imágenes de chocolate
        const chocolateImages = [
            'https://telegra.ph/file/ejemplo-chocolate1.jpg', // ⚠️ Reemplaza con URLs reales de imágenes de chocolate
            'https://telegra.ph/file/ejemplo-chocolate2.jpg',
            'https://telegra.ph/file/ejemplo-chocolate3.jpg',
            'https://telegra.ph/file/ejemplo-chocolate4.jpg',
            'https://telegra.ph/file/ejemplo-chocolate5.jpg'
        ]

        // ✅ Menú corregido con menciones reales
        let menu = `━━━━━━━━━━━━━━━━━━
🎉 *¡Felicidades, @${senderName}!* 🎉

🍫 *¡Le diste un delicioso chocolate a @${userName}!* 🤩

💖 *Disfrútenlo con mucho amor* 💖

✨ *¡Qué dulce momento!* ✨

━━━━━━━━━━━━━━━━━━
©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim()

        await m.react('🍫')

        try {
            // Intentar enviar imagen con URL aleatoria
            await conn.sendMessage(m.chat, { 
                image: { url: chocolateImages[Math.floor(Math.random() * chocolateImages.length)] }, 
                caption: menu, 
                mentions: [m.sender, user]  // ✅ Menciones correctas
            }, { quoted: fkontak })
        } catch (imgError) {
            console.log('Error con imagen online, intentando con imagen local:', imgError)
            try {
                // Verificar si existe el archivo local
                try {
                    await fs.promises.access('./src/chocolate.jpg')
                    await conn.sendMessage(m.chat, { 
                        image: fs.readFileSync('./src/chocolate.jpg'), 
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
        console.log('❌ Error en el comando darchocolate:', e)
        await m.reply(`❌ Hubo un error ejecutando el comando.`)
    }
}

// ✅ Corregido: "dar chocolate" separado o junto
handler.command = /^(darchocolate|dar(chocolate)?|chocolate)$/i
handler.register = false
handler.group = true

export default handler
