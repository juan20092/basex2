const handler = async (m, { conn, args }) => {
  const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {}
  const participants = m.isGroup ? groupMetadata.participants : []
  const groupAdmins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  const isAdmin = groupAdmins.includes(m.sender)
  const isBotAdmin = groupAdmins.includes(conn.user.jid)
  const isOwner = global.owner?.map?.(([number]) => number + '@s.whatsapp.net').includes(m.sender)

  if (!(isAdmin || isOwner)) {
    await conn.reply(m.chat, '*🚫 Este comando solo puede ser usado por administradores del grupo.*', m)
    return
  }

  let chat = global.db.data.chats[m.chat]
  let emoji = chat.emojiTag || '┃'

  const pesan = args.join` `
  const groupName = groupMetadata.subject

  const countryFlags = {
    '34': '🇪🇸','51': '🇵🇪','52': '🇲🇽','54': '🇦🇷','55': '🇧🇷','56': '🇨🇱','57': '🇨🇴','58': '🇻🇪','593': '🇪🇨'
  }

  const getCountryFlag = (jid) => {
    const phone = jid.split('@')[0]
    const prefix = Object.keys(countryFlags).find(p => phone.startsWith(p))
    return countryFlags[prefix] || '🏳️'
  }

  let teks = `*╭━* 𝘼𝘾𝙏𝙄𝙑𝙀𝙉𝙎𝙀𝙉 乂\n\n*${groupName}*\n👤 𝙄𝙉𝙏𝙀𝙂𝙍𝘼𝙉𝙏𝙀𝙎: *${participants.length}*\n${pesan ? pesan + '\n' : ''}`

  for (const user of participants) {
    teks += `${emoji} ${getCountryFlag(user.id)} @${user.id.split('@')[0]}\n`
  }

  teks += `\n*╰━* 𝙀𝙇𝙄𝙏𝙀 𝘽𝙊𝙏 𝙂𝙇𝙊𝘽𝘼𝙇\n▌│█║▌║▌║║▌║▌║▌║█`

  await conn.sendMessage(m.chat, {
    text: teks,
    mentions: participants.map(a => a.id)
  })
}

handler.help = ['todos']
handler.tags = ['group']
handler.command = /^(tagall|invocar|marcar|todos|invocación)$/i
handler.group = true

export default handler
