let handler = async (m, { conn, text }) => {
  if (!m.isGroup) return m.reply('*❗Este comando solo puede usarse en grupos.*')

  // Obtener metadata del grupo
  let groupMetadata = await conn.groupMetadata(m.chat)
  let participants = groupMetadata.participants
  let admins = participants.filter(p => p.admin).map(p => p.id)

  // Verificar si el usuario es admin
  const isUserAdmin = admins.includes(m.sender)
  const isBotAdmin = admins.includes(conn.user.jid)

  if (!isUserAdmin) return m.reply('*👮 Solo los administradores pueden usar este comando.*')
  if (!isBotAdmin) return m.reply('*🤖 Necesito ser administrador para mencionar a todos.*')

  let mensaje = text ? text : '👋 ¡Atención a todos!'
  let mencionados = participants.map(u => u.id)
  let texto = `${mensaje}\n\n${mencionados.map(v => `@${v.split('@')[0]}`).join(' ')}`

  await conn.sendMessage(m.chat, { text: texto, mentions: mencionados }, { quoted: m })
}

handler.help = ['n', 'todos']
handler.tags = ['grupo']
handler.command = /^(n|todos|tagall|invocar)$/i
handler.group = true

export default handler
