import fetch from "node-fetch";
import yts from "yt-search";
import ytdl from "ytdl-core";
import { youtubedl, youtubedlv2 } from "@bochilteam/scraper";

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text || !text.trim())
    throw `⭐ 𝘌𝘯𝘷𝘪𝘢 𝘦𝘭 𝘯𝘰𝘮𝘣𝘳𝘦 𝘥𝘦 𝘭𝘢 𝘤𝘢𝘯𝘤𝘪ó𝘯\n\n» 𝘌𝘫𝘦𝘮𝘱𝘭𝘰: ${usedPrefix + command} Bad Bunny - Monaco`;

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    // 🔹 Búsqueda rápida en YouTube
    const searchResults = await yts({ query: text.trim(), hl: "es", gl: "ES" });
    const video = searchResults.videos[0];
    if (!video) throw new Error("No se encontró el video");

    // 🔹 Enviar miniatura + info del video
    await conn.sendMessage(
      m.chat,
      {
        image: { url: video.thumbnail },
        caption: `🎵 ${video.title}\n🔗 ${video.url}`
      },
      { quoted: m }
    );

    const v = video.url;

    // 🔹 Intentar descarga con Sanka Vollerei
    let audioUrl;
    try {
      const sanka = await getFromSanka(v);
      audioUrl = sanka.download;

      // Enviar audio
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${sanitizeFilename(sanka.title || video.title)}.mp3`,
          ptt: false
        },
        { quoted: m }
      );
    } catch (e) {
      console.log("❌ Error Sanka Vollerei:", e.message || e);
      // 🔹 Fallback 1 — Bochilteam Scraper
      try {
        const yt = await youtubedl(v).catch(async () => await youtubedlv2(v));
        const dl_url = await yt.audio["128kbps"].download();
        const ttl = yt.title;

        await conn.sendMessage(
          m.chat,
          { audio: { url: dl_url }, mimetype: "audio/mpeg", fileName: `${ttl}.mp3` },
          { quoted: m }
        );
      } catch {
        // 🔹 Fallback 2 — ytdl-core
        try {
          const info = await ytdl.getInfo(v);
          const format = ytdl.chooseFormat(info.formats, { filter: "audioonly" });

          await conn.sendMessage(
            m.chat,
            { audio: { url: format.url }, mimetype: "audio/mpeg" },
            { quoted: m }
          );
        } catch (err) {
          m.reply(`⚠️ Error final: ${err.message}`);
        }
      }
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    const errorMsg =
      typeof error === "string"
        ? error
        : `❌ *Error:* ${error.message || "Ocurrió un problema"}\n\n🔸 *Posibles soluciones:*\n• Verifica el nombre de la canción\n• Intenta con otro tema\n• Prueba más tarde`;
    await conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m });
  }
};

handler.command = ["play", "playaudio", "ytmusic"];
handler.exp = 0;
export default handler;

function sanitizeFilename(name = "audio") {
  return String(name).replace(/[\\/:*?"<>|]/g, "").slice(0, 200);
}

// 🔹 Función para usar Sanka Vollerei
async function getFromSanka(youtubeUrl) {
  const endpoint = `https://www.sankavollerei.com/download/ytmp3?apikey=planaai&url=${encodeURIComponent(
    youtubeUrl
  )}`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json().catch(() => null);
  if (!json?.status || !json?.result?.download) {
    throw new Error("Respuesta inválida de Sanka Vollerei");
  }

  return {
    download: json.result.download,
    title: json.result.title,
    duration: json.result.duration,
    thumbnail: json.result.thumbnail
  };
}
