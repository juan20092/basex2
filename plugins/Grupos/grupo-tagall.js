import fs from 'fs'

let handler = async (m, { conn, text, participants, command }) => {
  // Obtener metadatos del grupo
  const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {}
  const groupAdmins = groupMetadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // Comprobar si el usuario es admin o el bot es admin
  const isBotAdmin = groupAdmins.includes(conn.user.jid)
  const isUserAdmin = groupAdmins.includes(m.sender)

  if (!m.isGroup) return m.reply('❗ Este comando solo puede usarse en grupos.')
  if (!isUserAdmin) return m.reply('👮 Este comando solo puede usarlo un *administrador* del grupo.')

  // Crear el mensaje mencionando a todos
  let mensaje = text ? text : '👋 ¡Atención a todos!'
  let mencionados = participants.map(u => u.id)

  conn.sendMessage(m.chat, {
    text: `${mensaje}\n\n${mencionados.map(v => `@${v.split('@')[0]}`).join(' ')}`,
    mentions: mencionados
  }, { quoted: m })
}

handler.help = ['todos']
handler.tags = ['grupo']
handler.command = /^(todos|tagall|invocar)$/i
handler.admin = true
handler.group = true

export default handler
