let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text && !m.mentionedJid[0] && !m.quoted) {
        m.reply(`🙋 *¿A quién deseas saludar?*\n\n✨ *Ejemplo:*\n.${command} @usuario`)
        return
    }

    try {
        let user = m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : (m.quoted ? m.quoted.sender : null)
        
        if (!user) {
            m.reply(`⚠️ No encontré a quién saludar.`)
            return
        }

        let emisor = m.sender.split('@')[0]
        let objetivo = user.split('@')[0]

        let texto = `━━━━━━━━━━━━━━━━━━
🖐🏻 Hola *@${objetivo}*, *@${emisor}* te envía un saludo! 😄

💬 *¡Que tengas un excelente día!* ✨
━━━━━━━━━━━━━━━━━━`.trim()

        await m.react('🖐🏻')

        // Array de imágenes de saludo (URLs públicas)
        const imagenes = [
            'https://telegra.ph/file/abc123.jpg',
            'https://telegra.ph/file/def456.jpg'
        ]

        try {
            await conn.sendMessage(m.chat, {
                image: { url: imagenes[Math.floor(Math.random() * imagenes.length)] },
                caption: texto,
                mentions: [user, m.sender]
            }, { quoted: m })
        } catch {
            // Si falla la imagen, solo texto
            await conn.sendMessage(m.chat, {
                text: texto,
                mentions: [user, m.sender]
            }, { quoted: m })
        }

    } catch (e) {
        console.log('Error:', e)
        m.reply('❌ Error al ejecutar el comando')
    }
}

handler.command = /^(saludar|hola|saludo)$/i
handler.group = true
export default handler
