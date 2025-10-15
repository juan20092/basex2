
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

    // Obtener audio (con reintentos usando Sanka primero)
    let audioUrl;
    try {
      audioUrl = await getAudioUrl(video.url);
    } catch (e) {
      console.error("Error al obtener audio:", e);
      throw "⚠️ Error al procesar el audio. Intenta con otra canción";
    }

    // Enviar SOLO el audio optimizado con nombre sanitizado
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
    throw new Error("Respuesta inválida de Sanka Vollerei")
  }

  return {
    download: json.result.download,
    title: json.result.title,
    duration: json.result.duration,
    thumbnail: json.result.thumbnail
  }
}    throw new Error("Respuesta inválida de Sanka Vollerei")
  }

  return {
    download: json.result.download,
    title: json.result.title,
    duration: json.result.duration,
    thumbnail: json.result.thumbnail
  }
}  const downloadUrl = await yt.audio["128kbps"].download()
  
  return {
    url: downloadUrl,
    filename: `${sanitizeFilename(yt.title || title)}.mp3`,
    title: yt.title
  }
}

// 🔹 ytdl-core mejorado
async function getFromYtdlCore(url, title) {
  const info = await ytdlCore.getInfo(url)
  const format = ytdlCore.chooseFormat(info.formats, { 
    filter: "audioonly",
    quality: "highestaudio"
  })
  
  if (!format) throw new Error("No se encontró formato de audio")
  
  return {
    url: format.url,
    filename: `${sanitizeFilename(info.videoDetails.title || title)}.mp3`,
    title: info.videoDetails.title
  }
}

// 🔹 Búsqueda con manejo de errores
async function search(query, options = {}) {
  try {
    const search = await yts.search({ 
      query, 
      hl: "es", 
      gl: "ES", 
      ...options 
    })
    return search.videos || []
  } catch (error) {
    throw new Error(`Error en búsqueda: ${error.message}`)
  }
}

// 🔹 Sanitización mejorada
function sanitizeFilename(name = "audio") {
  return String(name)
    .replace(/[\\/:*?"<>|]/g, "")
    .trim()
    .slice(0, 100) // Límite más conservador
}

handler.command = ["play", "musica", "song"]
handler.exp = 0
export default handler
