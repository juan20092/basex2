let toM = a => '@' + a.split('@')[0]

function handler(m, { usedPrefix, command, text, groupMetadata }) {
  try {
    // Validación
    if (!text && !m.mentionedJid?.[0] && !m.quoted) {
      throw `🙋 *¿A quién deseas saludar?*\n\n✨ *Ejemplo:*\n${usedPrefix + command} @usuario`
    }

    // Obtener el JID de la persona mencionada o citada
    let targetJid = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null)
    
    if (!targetJid) {
      // Si no hay mención directa, buscar en el texto (para usuarios que nunca han escrito)
      let mentionInText = text?.match(/@(\d+)/)
      if (mentionInText) {
        targetJid = mentionInText[1] + '@s.whatsapp.net'
      }
    }
    
    if (!targetJid) throw `⚠️ No encontré a quién mencionar`

    // Verificar que el usuario existe en el grupo USANDO groupMetadata (como formarpareja)
    let existsInGroup = groupMetadata.participants.some(p => p.id === targetJid)
    
    if (!existsInGroup) {
      throw `❌ El usuario no está en el grupo`
    }

    // Mensaje usando toM como formarpareja
    m.reply(
      `━━━━━━━━━━━━━━━━━━\n🖐🏻 *${toM(m.sender)}* 𝘦𝘴𝘵𝘢 𝘴𝘢𝘭𝘶𝘥𝘢𝘯𝘥𝘰 𝘢 *${toM(targetJid)}* 😄\n\n💬 *¡Un saludo lleno de buena vibra!* ✨\n━━━━━━━━━━━━━━━━━━\n©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`,
      null,
      { mentions: [m.sender, targetJid] }
    )

  } catch (e) {
    m.reply(typeof e === 'string' ? e : '❌ Error')
  }
}

handler.command = /^(saludar)$/i
handler.group = true
handler.register = false

export default handler
