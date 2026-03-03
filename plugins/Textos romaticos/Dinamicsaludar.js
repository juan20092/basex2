import fs, { promises } from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text, participants }) => {
  if (!text && !m.mentionedJid[0] && !m.quoted) 
    throw `🙋 *¿A quién deseas saludar?*\n\n✨ *Ejemplo:*\n\n.saludar @kevin`

  try {
    // ✅ JID CORREGIDO
    let user = m.mentionedJid[0] 
      ? m.mentionedJid[0] 
      : m.quoted 
        ? m.quoted.sender 
        : false

    if (!user) throw `⚠️ No encontré a quién mencionas.`

    // ✅ Obtener metadata del grupo como en tu tagall
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupName = groupMetadata.subject

    let fkontak = {
      "key": { "participants": "0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" },
      "message": {
        "contactMessage": {
          "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
        }
      },
      "participant": "0@s.whatsapp.net"
    }

    // ✅ Mensaje con menciones
    let menu = `━━━━━━━━━━━━━━━━━━
🖐🏻 *@${m.sender.split("@")[0]}* 𝘦𝘴𝘵𝘢 𝘴𝘢𝘭𝘶𝘥𝘢𝘯𝘥𝘰 𝘢 *@${user.split("@")[0]}* 😄

💬 *¡Un saludo lleno de buena vibra!* ✨
━━━━━━━━━━━━━━━━━━
${groupName}
©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim()

    await m.react('🖐🏻')

    // ✅ Usar el método de envío del tagall - SIN IMAGEN
    await conn.sendMessage(m.chat, {
      text: menu,
      mentions: [m.sender, user]
    }, { quoted: fkontak })

  } catch (e) {
    await m.reply(`❌ Error: ${e.message}`)
    console.log(e)
  }
}

handler.command = /^(saludar)$/i
handler.register = false
handler.group = true

export default handler
