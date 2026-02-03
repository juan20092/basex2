import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'qs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`✦ ¡Hey! Parece que olvidaste ingresar un enlace de YouTube.\n💫 Ejemplo:\n\n> .spotify feid inocente `);
  }

  const spotifyDownloader = {
    getData: async (query) => {
      // Primero buscar en Spotify
      const spotifyResults = await searchSpotify(query);
      if (!spotifyResults || spotifyResults.length === 0) {
        return { success: false, message: "No se encontraron resultados en Spotify." };
      }
      
      const track = spotifyResults[0];
      return {
        success: true,
        name: track.name,
        albumname: track.album,
        artist: track.artists.join(', '),
        thumb: track.image,
        duration: track.duration,
        url: track.url
      };
    },
    
    download: async (query) => {
      const musicData = await spotifyDownloader.getData(query);
      if (!musicData.success) {
        return musicData;
      }

      // Intentar diferentes APIs para descargar
      const downloadUrl = await getDownloadFromAPIs(musicData.url);
      
      if (!downloadUrl) {
        return { success: false, message: "No se pudo obtener el enlace de descarga." };
      }

      return {
        success: true,
        name: musicData.name,
        albumname: musicData.albumname,
        artist: musicData.artist,
        thumb: musicData.thumb,
        duration: musicData.duration,
        download: downloadUrl,
        url: musicData.url
      };
    }
  };

  conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

  const musicData = await spotifyDownloader.download(text);
  if (!musicData.success) {
    return m.reply(`Error: ${musicData.message}`);
  }

  const { name, albumname, artist, url, thumb, duration, download } = musicData;

  const doc = {
    audio: { url: download },
    mimetype: 'audio/mp4',
    fileName: `${name}.mp3`,
    contextInfo: {
      externalAdReply: {
        showAdAttribution: true,
        mediaType: 2,
        mediaUrl: url,
        title: name,
        sourceUrl: url,
        thumbnail: await (await conn.getFile(thumb)).data
      }
    }
  };

  await conn.sendMessage(m.chat, doc, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

handler.help = ['spotify'];
handler.tags = ['downloader'];
handler.command = /^(spotify|song)$/i;

export default handler;

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// 🔍 Buscar en Spotify
async function searchSpotify(query) {
  try {
    const token = await getSpotifyToken();
    
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data.tracks || !response.data.tracks.items.length) {
      return [];
    }
    
    return response.data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(artist => artist.name),
      album: track.album.name,
      duration: formatDuration(track.duration_ms),
      url: track.external_urls.spotify,
      image: track.album.images[0]?.url || '',
      popularity: track.popularity,
      release_date: track.album.release_date
    }));
    
  } catch (error) {
    console.error("Error en searchSpotify:", error.message);
    return [];
  }
}

// 🔑 Obtener token de Spotify
async function getSpotifyToken() {
  try {
    const clientId = '5c0986c5a6184288b2f4e5668e90c3a6';
    const clientSecret = '7f78b15b6bdd4fe3a5ad7d31e1895698';
    
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error("Error obteniendo token Spotify:", error.message);
    return 'BQCl0mWCEjw_kbTmBw-Wj5Om4kP4r69F-9jKlOCwVlRj9dNR-N_VBUVf48D3eTOlOlnD8yV8BdMsqVH2zRx29MGDnW5U9IZ8UeIzFQN79XHEnTtJ7cY';
  }
}

// ⬇️ Obtener enlace de descarga de APIs funcionales
async function getDownloadFromAPIs(spotifyUrl) {
  const apis = [
    // API 1: Siputzx (funcional)
    {
      name: "Siputzx",
      url: `https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(spotifyUrl)}`,
      parser: (data) => data?.data?.download || data?.download
    },
    // API 2: SpotiDL
    {
      name: "SpotiDL",
      url: `https://spotidl.vercel.app/download?url=${encodeURIComponent(spotifyUrl)}`,
      parser: (data) => data?.download_url || data?.url
    },
    // API 3: SpotifyDL
    {
      name: "SpotifyDL",
      url: `https://spotifydl-api.vercel.app/?url=${encodeURIComponent(spotifyUrl)}`,
      parser: (data) => data?.result?.download_link || data?.downloadLink
    },
    // API 4: AllMedia
    {
      name: "AllMedia",
      url: `https://api.allmediadata.com/download/spotify?url=${encodeURIComponent(spotifyUrl)}`,
      parser: (data) => data?.url || data?.download
    },
    // API 5: MusicDL
    {
      name: "MusicDL",
      url: `https://musicdl.vercel.app/api/spotify?url=${encodeURIComponent(spotifyUrl)}`,
      parser: (data) => data?.downloadUrl || data?.url
    }
  ];

  for (const api of apis) {
    try {
      console.log(`Intentando API: ${api.name}`);
      const response = await axios.get(api.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      const downloadUrl = api.parser(response.data);
      if (downloadUrl && downloadUrl.startsWith('http')) {
        // Verificar que el enlace funcione
        const headRes = await axios.head(downloadUrl, { timeout: 5000 });
        if (headRes.status === 200) {
          console.log(`✅ ${api.name} funcionó!`);
          return downloadUrl;
        }
      }
    } catch (error) {
      console.log(`❌ ${api.name} falló:`, error.message);
      continue;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return null;
}

// ⏱️ Formatear duración
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// 🧹 Limpiar nombre de archivo
function cleanFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, '').trim();
}
