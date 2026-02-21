let handler = async (m, { conn, usedPrefix, command, text }) => {

let number = null
let user = null

// ✅ Obtener número desde texto
if (text) {
  if (isNaN(text) && !text.includes('@')) 
    return conn.reply(m.chat, lenguajeGB.smsMalused3(), m)

  if (isNaN(text)) number = text.split('@')[1]
  else number = text
}

// ✅ Validación básica
if (!text && !m.quoted && !m.mentionedJid?.length) 
  return conn.reply(m.chat, lenguajeGB.smsMalused3(), m)

// ✅ Validar longitud si hay número
if (number && (number.length > 13 || number.length < 11)) 
  return conn.reply(m.chat, lenguajeGB.smsDemott(), m)

// ✅ Detectar usuario objetivo
if (number) {
  user = number + '@s.whatsapp.net'
} 
else if (m.quoted) {
  user = m.quoted.sender
} 
else if (m.mentionedJid?.length) {
  user = m.mentionedJid[0]
}

// ✅ Seguridad anti-crash
if (!user) 
  return conn.reply(m.chat, 'No se pudo identificar al usuario.', m)

// ✅ Promover
await conn.groupParticipantsUpdate(m.chat, [user], 'promote')

conn.reply(
  m.chat,
  lenguajeGB.smsAvisoEG() + lenguajeGB.smsDemott2(),
  m
)

}

handler.command = /^(promote|daradmin|darpoder)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
