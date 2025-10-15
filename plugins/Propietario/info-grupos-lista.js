import PhoneNumber from 'awesome-phonenumber'

let handler = async (m, { conn, isOwner, isRowner }) => {
  const fkontak = {
    key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: "0@s.whatsapp.net"
  }

  // Obtener el objeto (map) de grupos participando: { "jid1@g.us": { ...meta }, "jid2@g.us": { ... } }
  const participating = await conn.groupFetchAllParticipating() || {}
  const groupIds = Object.keys(participating)

  if (groupIds.length === 0) {
    return m.reply('🤖 El bot no está en ningún grupo actualmente.')
  }

  let txt = `📋 *LISTA DE GRUPOS DONDE ESTÁ EL BOT*\n\n`
  txt += `📦 Total de grupos: *${groupIds.length}*\n\n`

  for (let id of groupIds) {
    // metadata que pudo venir en groupFetchAllParticipating()
    let meta = participating[id] || {}

    // intenta obtener subject del objeto meta; si no existe, pide metadata explícita
    let subject = meta.subject
    let participants = (meta.participants && Array.isArray(meta.participants)) ? meta.participants.length : null

    if (!subject) {
      try {
        const gm = await conn.groupMetadata(id)
        subject = gm.subject || subject || '— (sin nombre)'
        participants = participants || (gm.participants ? gm.participants.length : 0)
      } catch (e) {
        // fallback por si falla la petición
        subject = subject || '— (sin nombre)'
        participants = participants || 0
      }
    }

    txt += `🏷️ *Nombre:* ${subject}\n`
    txt += `🆔 *ID:* ${id}\n`
    txt += `👥 *Miembros:* ${participants || 0}\n\n`
  }

  // enviar como reply con contacto (igual que tu estructura)
  await conn.reply(m.chat, txt.trim(), fkontak)
}

handler.help = ['groups', 'grouplist']
handler.tags = ['info']
handler.command = /^(groups|grouplist|listadegrupo|gruposlista|listagrupos|listadegrupos|grupolista|listagrupo)$/i
handler.rowner = true
handler.exp = 30

export default handler
