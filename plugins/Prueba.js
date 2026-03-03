import * as fs from 'fs';

const handler = async (m, { conn, usedPrefix, command, text, participants }) => {
  try {
    // Validación
    if (!text && !m.mentionedJid[0] && !m.quoted) {
      throw `🙋 *¿A quién deseas saludar?*\n\n✨ *Ejemplo:*\n${usedPrefix + command} @usuario`;
    }

    // Obtener usuario mencionado o citado
    let user = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
    if (!user) throw `⚠️ No encontré a quién mencionar.`;

    // Decodificar JIDs como en hidetag
    const emisor = conn.decodeJid(m.sender);
    const objetivo = conn.decodeJid(user);

    const nombreEmisor = emisor.split('@')[0];
    const nombreObjetivo = objetivo.split('@')[0];

    const menu = `━━━━━━━━━━━━━━━━━━
🖐🏻 *@${nombreEmisor}* 𝘦𝘴𝘵𝘢 𝘴𝘢𝘭𝘶𝘥𝘢𝘯𝘥𝘰 𝘢 *@${nombreObjetivo}* 😄

💬 *¡Un saludo lleno de buena vibra!* ✨
━━━━━━━━━━━━━━━━━━
©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim();

    // Reacción como en hidetag
    await conn.sendMessage(m.chat, {
      react: {
        text: '🖐🏻',
        key: m.key
      }
    });

    // Enviar mensaje como en hidetag (solo texto)
    await conn.sendMessage(m.chat, {
      text: menu,
      mentions: [emisor, objetivo]
    }, { quoted: m });

  } catch (e) {
    console.error('Error en saludar:', e);
    await m.reply(typeof e === 'string' ? e : '❌ Error al ejecutar el comando');
  }
};

handler.command = /^(salud)$/i;
handler.group = true;
handler.register = false;

export default handler;
