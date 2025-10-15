import fetch from "node-fetch";
import yts from "yt-search";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🎵 Ingresa el nombre o URL del video.\n\nEjemplo:\n${usedPrefix + command} Feid Normal`);

  await m.react('🕓');
  try {
    const search = await yts(text);
    const video = search.videos[0];
    if (!video) return m.reply("❌ No se encontraron resultados.");

    const banner = `
╭─🎶 *Sasuke Bot - Audio YouTube* 🎶─╮
│
│ 🎵 *Título:* ${video.title}
│ 👤 *Autor:* ${video.author.name}
│ ⏱️ *Duración:* ${video.timestamp}
│ 📥 *Descargando archivo de audio...*
╰──────────────────────────────────╯
`;

    // Enviar miniatura con detalles del video
    await conn.sendFile(
      m.chat,
      video.thumbnail,
      'thumb.jpg',
      banner,
      m
    );

    // Descargar con API de Sylphy
    const api = await (
      await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${video.url}&apikey=sylphy-e321`)
    ).json();

    if (!api?.res?.url) throw new Error("No se pudo obtener el enlace de descarga.");

    await conn.sendFile(
      m.chat,
      api.res.url,
      `${video.title}.mp3`,
      "",
      m
    );

    await m.react("✅");

  } catch (e) {
    console.error(e);
    m.reply(`⚠️ Error al procesar: ${e.message}`);
  }
};

handler.help = ['play'];
handler.tags = ['download'];
handler.command = ['play'];
handler.exp = 0;

export default handler;
