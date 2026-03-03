let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Validación mejorada
    if (!text && !m.mentionedJid[0] && !m.quoted) 
        throw `🙋 *¿A quién deseas saludar?*\n\n✨ *Ejemplo:*\n\n.${command} @usuario`

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

        // ✅ Array de imágenes de saludo
        const greetImages = [
            'https://telegra.ph/file/ejemplo-saludo1.jpg', // ⚠️ Reemplaza con URLs reales de imágenes de saludos
            'https://telegra.ph/file/ejemplo-saludo2.jpg',
            'https://telegra.ph/file/ejemplo-saludo3.jpg',
            'https://telegra.ph/file/ejemplo-saludo4.jpg',
            'https://telegra.ph/file/ejemplo-saludo5.jpg'
        ]

        // ✅ Menú corregido con menciones reales
        let menu = `━━━━━━━━━━━━━━━━━━
🖐🏻 *@${senderName}* 𝘦𝘴𝘵𝘢 𝘴𝘢𝘭𝘶𝘥𝘢𝘯𝘥𝘰 𝘢 *@${userName}* 😄

💬 *¡Un saludo lleno de buena vibra!* ✨
━━━━━━━━━━━━━━━━━━
©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim()

        await m.react('🖐🏻')

        try {
            // Intentar enviar imagen con URL aleatoria
            await conn.sendMessage(m.chat, { 
                image: { url: greetImages[Math.floor(Math.random() * greetImages.length)] }, 
                caption: menu, 
                mentions: [m.sender, user]  // ✅ Menciones correctas
            }, { quoted: fkontak })
        } catch (imgError) {
            console.log('Error con imagen online, intentando con imagen local:', imgError)
            try {
                // Verificar si existe el archivo local
                try {
                    await fs.promises.access('./src/saludar.jpg')
                    await conn.sendMessage(m.chat, { 
                        image: fs.readFileSync('./src/saludar.jpg'), 
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
        console.log('❌ Error en el comando saludar:', e)
        await m.reply(`❌ Hubo un error ejecutando el comando.`)
    }
}

// ✅ Mejorado: acepta "saludar", "hola", "saludo" como comandos
handler.command = /^(saludar|hola|saludo|hellow)$/i
handler.register = false
handler.group = true

export default handler
