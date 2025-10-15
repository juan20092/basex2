import fetch from "node-fetch";
import yts from "yt-search";

// Lista de APIs prioritarias (Sanka Vollerei primero)
const APIS = [
  {
    name: "sanka",
    url: (videoUrl) => `https://www.sankavollerei.com/download/ytmp3?apikey=planaai&url=${encodeURIComponent(videoUrl)}`,
    extract: (data) => data?.result?.download
  },
  {
    name: "vreden",
    url: (videoUrl) => `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}&quality=64`,
    extract: (data) => data?.result?.download?.url
  },
  {
    name: "zenkey",
    url: (videoUrl) => `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${encodeURIComponent(videoUrl)}&quality=64`,
    extract: (data) => data?.result?.download?.url
  },
  {
    name: "yt1s",
    url: (videoUrl) => `https://yt1s.io/api/ajaxSearch?q=${encodeURIComponent(videoUrl)}`,
    extract: async (data) => {
      const k = data?.links?.mp3?.auto?.k;
      return k ? `https://yt1s.io/api/ajaxConvert?vid=${data.vid}&k=${k}&quality=64` : null;
    }
  }
];

// Función mejorada para obtener audio
const getAudioUrl = async (videoUrl) => {
  let lastError = null;
  
  for (const api of APIS) {
    try {
      console.log(`Probando API: ${api.name}`);
      const apiUrl = api.url(videoUrl);
      const response = await fetch(apiUrl, { timeout: 8000 }); // Timeout aumentado a 8 segundos
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const audioUrl = await api.extract(data);
      
      if (audioUrl) {
        console.log(`Éxito con API: ${api.name}`);
        return audioUrl;
      }
    } catch (error) {
      console.error(`Error con API ${api.name}:`, error.message);
      lastError = error;
      continue; // Intentar con la siguiente API
    }
  }
  
  throw lastError || new Error("Todas las APIs fallaron");
};

// Función para sanitizar nombres de archivo
const sanitizeFilename = (name = "audio") => {
  return String(name).replace(/[\\/:*?"<>|]/g, "").slice(0, 200);
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.trim()) {
    throw `⭐ 𝘌𝘯𝘷𝘪𝘢 𝘦𝘭 𝘯𝘰𝘮𝘣𝘳𝘦 𝘥𝘦 𝘭𝘢 𝘤𝘢𝘯𝘤𝘪ó𝘯\n\n» 𝘌𝘫𝘦𝘮𝘱𝘭𝘰: ${usedPrefix + command} Bad Bunny - Monaco`;
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    // Búsqueda rápida con límite de resultados
    const searchResults = await yts({ query: text.trim(), hl: 'es', gl: 'ES' });
    const video = searchResults.videos[0];
    if (!video) throw new Error("No se encontró el video");

    // Verificar duración (max 10 minutos para evitar audios largos)
    if (video.seconds > 600) {
      throw "❌ El audio es muy largo (máximo 10 minutos)";
    }

    // Enviar información del video (mismo diseño)
    await conn.sendMessage(m.chat, {
      text: `01:27 ━━━━━⬤────── 05:48\n*⇄ㅤ      ◁        ❚❚        ▷        ↻*\n╴𝗘𝗹𝗶𝘁𝗲 𝗕𝗼𝘁 𝗚𝗹𝗼𝗯𝗮𝗹`,
      contextInfo: {
        externalAdReply: {
          title: video.title.slice(0, 60),
          body: "",
          thumbnailUrl: video.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
          sourceUrl: video.url
        }
      }
    }, { quoted: m });

    // Obtener audio (con reintentos usando Sanka primero)
    let audioUrl;
    try {
      audioUrl = await getAudioUrl(video.url);
    } catch (e) {
      console.error("Error al obtener audio:", e);
      throw "⚠️ Error al procesar el audio. Intenta con otra canción";
    }

    // Enviar audio optimizado con nombre sanitizado
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      fileName: `${sanitizeFilename(video.title)}.mp3`,
      ptt: false
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    
    const errorMsg = typeof error === 'string' ? error : 
      `❌ *Error:* ${error.message || 'Ocurrió un problema'}\n\n` +
      `🔸 *Posibles soluciones:*\n` +
      `• Verifica el nombre de la canción\n` +
      `• Intenta con otro tema\n` +
      `• Prueba más tarde`;
      
    await conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m });
  }
};

handler.command = ['play', 'playaudio', 'ytmusic'];
handler.exp = 0;
export default handler;
