let handler = async (m, { conn, usedPrefix, command, text }) => {

let number = null
let user = null

// ✅ Detectar usuario correctamente (ESTILO BAILEYS)
user = m.mentionedJid[0] 
   ? m.mentionedJid[0] 
   : m.quoted 
     ? m.quoted.sender 
     : null

// ✅ Si no mencionaron, intentar extraer número manual
if (!user && text) {
  let cleaned = text.replace(/[^0-9]/g, '')
  if (cleaned.length >= 11 && cleaned.length <= 13) {
    number = cleaned
    user = number + '@s.whatsapp.net'
  }
}

// ✅ Validación
if (!user) 
  return conn.reply(m.chat, lenguajeGB.smsMalused3(), m)

// ✅ Validar longitud si es número manual
if (number && (number.length > 13 || number.length < 11)) 
  return conn.reply(m.chat, lenguajeGB.smsDemott(), m)

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
