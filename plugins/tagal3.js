const handler = async (m, { isOwner, isAdmin, conn, args, participants }) => {
  let chat = global.db.data.chats[m.chat],
      emoji = chat.emojiTag || '┃';

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  const pesan = args.join` `,
        groupMetadata = await conn.groupMetadata(m.chat),
        groupName = groupMetadata.subject;

  // 🧠 FUNCIÓN PARA SACAR TAG INTELIGENTE DEL GRUPO
  const getGroupTag = (name) => {
    if (!name) return 'GR';
    const words = name.trim().split(/\s+/);

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      const word = words[0];
      if (word.length >= 2) {
        return (word[0] + word[word.length - 1]).toUpperCase();
      } else {
        return word.toUpperCase();
      }
    }
  };

  const groupTag = getGroupTag(groupName);

  const countryFlags = {
    '51': '🇵🇪','52': '🇲🇽','53': '🇨🇺','54': '🇦🇷','55': '🇧🇷','56': '🇨🇱',
    '57': '🇨🇴','58': '🇻🇪','591': '🇧🇴','593': '🇪🇨','595': '🇵🇾','598': '🇺🇾'
  };

  const getCountryPrefix = (jid) => {
    const phone = jid.split('@')[0].replace(/^0+/, '');
    const prefixes = Object.keys(countryFlags).sort((a, b) => b.length - a.length);
    for (let p of prefixes) {
      if (phone.startsWith(p)) return p;
    }
    return 'other';
  };

  let teks = `*╭━* 𝘼𝘾𝙏𝙄𝙑𝙀𝙉𝙎𝙀𝙉 ✘
│ *[${groupTag}]* 
│ *${groupName}*
│ 👤 𝙄𝙉𝙏𝙀𝙂𝙍𝘼𝙉𝙏𝙀𝙎: *${participants.length}*
${pesan}\n`;

  let grouped = {};

  for (const mem of participants) {
    let jid = mem.jid || mem.id;
    let prefix = getCountryPrefix(jid);
    if (!grouped[prefix]) grouped[prefix] = [];
    grouped[prefix].push(jid);
  }

  // 🇪🇨 Ecuador primero
  if (grouped['593']) {
    for (const jid of grouped['593']) {
      teks += `${emoji} 🇪🇨 @${jid.split('@')[0]}\n`;
    }
    delete grouped['593'];
  }

  // 🌍 Resto de países
  for (const prefix of Object.keys(grouped)) {
    for (const jid of grouped[prefix]) {
      teks += `${emoji} ${countryFlags[prefix] || '🏳️'} @${jid.split('@')[0]}\n`;
    }
  }

  teks += `\n*╰━* 𝙀𝙇𝙄𝙏𝙀 𝘽𝙊𝙏 𝙂𝙇𝙊𝘽𝘼𝙇
▌│█║▌║▌║║▌║▌║▌║█`;

  await conn.sendMessage(m.chat, {
    text: teks,
    mentions: participants.map(p => p.jid || p.id)
  });
};

handler.help = ['todos'];
handler.tags = ['group'];
handler.command = /^(tagall|invocar|marcar|todos2|invocación)$/i;
handler.admin = true;
handler.group = true;

export default handler;
