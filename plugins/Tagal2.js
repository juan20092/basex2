const handler = async (m, { isOwner, isAdmin, conn, participants }) => {
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  const baseTextTop = `
> →𝗖𝗛𝗜𝗠 𝗩𝗘𝗡𝗧𝗔𝗦 💰🩷💚
https://chat.whatsapp.com/KksmRPi3lUa5xrXNUoqvFq

 *𝙀𝙏𝙄𝙌𝙐𝙀𝙏𝘼𝙎:* 

➥ _*@𝗰𝗵𝗶𝗺.𝘃𝗲𝗻𝘁𝗮𝘀:*_
`;

  const baseTextBottom = `
*└Cʜɪᴍ.Bᴏᴛ*
https://www.instagram.com/chim.ventas
`;

  // Lista de corazones (tantos como quieras)
  const hearts = [
    '🩷 ⇝', '🩷 ⇝', '🩷 ⇝', '🩷 ⇝', '🩷 ⇝',
    '🩷 ⇝', '🩷 ⇝', '🩷 ⇝', '🩷 ⇝', '🩷 ⇝',
    '🩷 ⇝', '🩷 ⇝'
  ];

  const members = participants.map(p => p.id);
  let teks = baseTextTop;

  // Combina corazones + menciones
  for (let i = 0; i < hearts.length; i++) {
    if (members[i]) teks += `*${hearts[i]}* @${members[i].split('@')[0]}\n`;
    else teks += `*${hearts[i]}*\n`;
  }

  teks += baseTextBottom;

  await conn.sendMessage(m.chat, {
    text: teks,
    mentions: members
  }, { quoted: m });
};

handler.help = ['todos'];
handler.tags = ['group'];
handler.command = /^(tagall|invocar|marcar|todos|invocación)$/i;
handler.admin = true;
handler.group = true;

export default handler;
