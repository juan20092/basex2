import fetch from "node-fetch";
import yts from "yt-search";
import ytdl from "ytdl-core";
import { youtubedl, youtubedlv2 } from "@bochilteam/scraper";

const limitMB = 100; // límite para enviar como documento

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text)
    return m.reply(`🌀 Ingresa el nombre de un video o una URL de YouTube.\nUso: ${usedPrefix + command} nombre o link`);

  await m.react("🕓");

  // Buscar video
  const searchRes = await yts(text);
  if (!searchRes || !searchRes.all || searchRes.all.length === 0)
    return m.reply("❌ No se encontraron resultados para tu búsqueda.");

  const video = searchRes.all[0];

  // Banner info
  const banner = `
╭─🎶 *Sasuke Bot - Audio YouTube* 🎶─╮
│
│ 🎵 *Título:* ${video.title}
│ 👤 *Autor:* ${video.author.name}
│ ⏱️ *Duración:* ${video.duration.timestamp}
│ 📥 *Descargando archivo de audio...*
╰──────────────────────────────────╯
`;

  // Enviar thumbnail
  await conn.sendFile(
    m.chat,
    await (await fetch(video.thumbnail)).buffer(),
    "thumb.jpg",
    banner,
    m
  );

  try {
    // Descargar audio vía Sylphy API
    if (command === "play") {
      const apiResp = await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(video.url)}&apikey=sylphy-e321`);
      const api = await apiResp.json();

      if (!api?.res?.url)
        throw new Error("Sylphy API no devolvió URL de audio.");

      const audioUrl = api.res.url;

      // Intentar enviar directo
      await conn.sendFile(
        m.chat,
        audioUrl,
        `${video.title}.mp3`,
        "",
        m
      );

      await m.react("✅");

    } else if (command === "play5" || command === "playvid") {
      const apiResp = await fetch(`https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(video.url)}&apikey=sylphy-e321`);
      const api = await apiResp.json();

      if (!api?.res?.url)
        throw new Error("Sylphy API no devolvió URL de video.");

      const dl = api.res.url;

      // Obtener tamaño aproximado
      const res = await fetch(dl, { method: "HEAD" });
      const cont = res.headers.get("content-length");
      const bytes = cont ? parseInt(cont, 10) : 0;
      const sizemb = bytes / (1024 * 1024);
      const asDoc = sizemb >= limitMB;

      await conn.sendFile(
        m.chat,
        dl,
        `${video.title}.mp4`,
        "",
        m,
        null,
        { asDocument: asDoc, mimetype: "video/mp4" }
      );

      await m.react("✅");
    }
  } catch (err) {
    console.log("Sylphy fallo, usando fallback:", err.message);

    try {
      // Fallback 1: Bochilteam scraper
      const yt = await youtubedl(video.url).catch(async () => await youtubedlv2(video.url));
      const dl_url = yt.audio["128kbps"].download();
      const ttl = yt.title || video.title || "audio";

      await conn.sendFile(
        m.chat,
        dl_url,
        `${ttl}.mp3`,
        "",
        m
      );
      return;
    } catch (e1) {
      console.log("Fallback bochilteam falló:", e1.message);
    }

    try {
      // Fallback 2: ytdl-core
      const info = await ytdl.getInfo(video.url);
      const format = ytdl.chooseFormat(info.formats, { filter: "audioonly", quality: "highestaudio" });
      if (!format || !format.url) throw new Error("ytdl no devolvió formato válido");

      await conn.sendFile(
        m.chat,
        format.url,
        `${video.title}.mp3`,
        "",
        m
      );
      return;
    } catch (e2) {
      console.log("Fallback ytdl falló:", e2.message);
    }

    // Si todo falla
    m.reply(`⚠️ No se pudo descargar el audio ni con Sylphy ni con fallbacks.\nRevisa la consola para detalles.`);
  }
};

handler.help = ["play", "play5", "playvid"];
handler.tags = ["download"];
handler.command = ["play", "play5", "playvid"];
export default handler;
