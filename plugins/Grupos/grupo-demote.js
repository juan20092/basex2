let handler = async (m, { conn, usedPrefix, text, command }) => {

let number = null
let user = null

let fkontak = { 
  key: { 
    participants: "0@s.whatsapp.net", 
    remoteJid: "status@broadcast", 
    fromMe: false, 
    id: "Halo" 
  }, 
  message: { 
    contactMessage: { 
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
    } 
  }, 
  participant: "0@s.whatsapp.net" 
}

// ✅ Detectar usuario estilo Baileys
user = m.mentionedJid[0] 
   ? m.mentionedJid[0] 
   : m.quoted 
     ? m.quoted.sender 
     : null

// ✅ Si no hubo mention → intentar número manual
if (!user && text) {
  let cleaned = text.replace(/[^0-9]/g, '')
  if (cleaned.length >= 11 && cleaned.length <= 13) {
    number = cleaned
    user = number + '@s.whatsapp.net'
  }
}

// ✅ Validación
if (!user) 
  return conn.reply(
    m.chat,
    lenguajeGB.smsMalused3() + `\n*${usedPrefix + command} @${global.owner[0][0]}*`,
    fkontak,
    m
  )

// ✅ Validar longitud si es número manual
if (number && (number.length > 13 || number.length < 11)) 
  return conn.reply(
    m.chat,
    lenguajeGB.smsDemott() + `\n*${usedPrefix + command} @${global.owner[0][0]}*`,
    fkontak,
    m
  )

// ✅ Demote seguro
await conn.groupParticipantsUpdate(m.chat, [user], 'demote')

conn.reply(
  m.chat,
  lenguajeGB.smsAvisoEG() + lenguajeGB.smsDemott3(),
  fkontak,
  m
)

}

handler.command = /^(demote|quitaradmi|quitaradmin)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
