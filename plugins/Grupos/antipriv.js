import fs from 'fs';

const NUMERO_EXCLUIDO = '573114427210@s.whatsapp.net';
const GRUPO_NOTIFICACION = '120363355566757025@g.us';
const ARCHIVO_REGISTRO = './bloqueados.json';

export async function before(m, { isOwner, isROwner, conn }) {
  if (m.isBaileys && m.fromMe) return !0;
  if (m.isGroup) return !1;
  if (!m.message) return !0;

  const text = m.text || '';

  if (text.includes("PIEDRA") || text.includes("PAPEL") || text.includes("TIJERA")) return !0;

  // Excluir bot
  if (this.user.jid === NUMERO_EXCLUIDO) return !0;

  let bot = global.db.data.settings[this.user.jid] || {};

  if (bot.antiPrivate && !isOwner && !isROwner) {
    const userMention = '@' + m.sender.split('@')[0];
    const numero = m.sender.split('@')[0];

    const now = new Date();
    const fecha = now.toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const hora = now.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const videos = [
      'https://files.catbox.moe/tpmd88.mp4',
      'https://files.catbox.moe/yo93u0.mp4'
    ];
    const videoRandom = videos[Math.floor(Math.random() * videos.length)];

    await conn.sendMessage(m.chat, {
      video: { url: videoRandom },
      caption: `*¡HOLA¡ 👋🏻* ${userMention}

Por ordenes de mi creador no está permitido mensajes a mi privado por la cuál tendré que bloquearte. 

*Si quieres adquirir Elite Bot Global ingresa al siguiente link.*
🎁 https://sites.google.com/view/elitebotglobal?usp=sharing

*GRUPO OFC:*
> https://chat.whatsapp.com/GzqYw7fK9CADEWEtfL6804

*CHANNEL:*
> https://whatsapp.com/channel/0029VasDCR97dmeWOvPNlY45
••••••••••••••••••••••••••••••
© 2023 EliteBotGlobal`,
      gifPlayback: true,
      mentions: [m.sender]
    }, { quoted: m });

    // ✅ FIX REAL (AQUÍ ESTABA EL ERROR)
    await this.updateBlockStatus(m.chat, 'block');

    const nombre = conn.getName ? await conn.getName(m.sender) : 'Usuario';
    const mensajeTexto = text || '(Mensaje no disponible)';

    // Notificación al grupo
    await conn.sendMessage(GRUPO_NOTIFICACION, {
      text: `*USUARIO BLOQUEADO* 📵

👤 Nombre: ${nombre}
📱 Número: @${numero}
🔗 enlace: wa.me/${numero}
📆 Fecha: ${fecha}

📩 Mensaje:
${mensajeTexto}`,
      mentions: [m.sender]
    });

    // Registro en JSON
    const registro = {
      nombre,
      numero,
      fecha,
      hora,
      mensaje: mensajeTexto
    };

    let datos = [];
    if (fs.existsSync(ARCHIVO_REGISTRO)) {
      try {
        datos = JSON.parse(fs.readFileSync(ARCHIVO_REGISTRO));
      } catch {
        datos = [];
      }
    }

    datos.push(registro);
    fs.writeFileSync(ARCHIVO_REGISTRO, JSON.stringify(datos, null, 2));

    return !0;
  }

  return !1;
}
