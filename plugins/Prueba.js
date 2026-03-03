let toM = a => '@' + a.split('@')[0]

function handler(m, { usedPrefix, command, text, groupMetadata }) {
  // Validación
  if (!text && !m.mentionedJid?.[0] && !m.quoted) {
    throw `🙋 *¿A quién deseas saludar?*\n\n✨ *Ejemplo:*\n${usedPrefix + command} @usuario`
  }

  // Obtener usuario (mencionado o citado)
  let user = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null)
  if (!user) throw `⚠️ No encontré a quién mencionar`

  // Mensaje simple como en formarpareja
  m.reply(
    `━━━━━━━━━━━━━━━━━━\n🖐🏻 *${toM(m.sender)}* 𝘦𝘴𝘵𝘢 𝘴𝘢𝘭𝘶𝘥𝘢𝘯𝘥𝘰 𝘢 *${toM(user)}* 😄\n\n💬 *¡Un saludo lleno de buena vibra!* ✨\n━━━━━━━━━━━━━━━━━━\n©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`,
    null,
    { mentions: [m.sender, user] }
  )
}

handler.command = /^(salud)$/i
handler.group = true
handler.register = false

export default handler
