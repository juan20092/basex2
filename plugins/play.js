import fetch from "node-fetch"
import yts from "yt-search"

let handler = async (m, { conn, text }) => {

  if (!text) throw '✦ Escribe una canción\nEjemplo:\n.play feid normal'

  await m.react('🕓')

  try {
    const search = await yts(text)
    const vid = search.videos[0]

    if (!vid) throw 'No se encontró la canción'

    await conn.sendMessage(m.chat, {
      text: `🎵 *${vid.title}*\n⏱ ${vid.timestamp}\n⬇️ Descargando...`
    }, { quoted: m })

    // ================= 1️⃣ DV-YER =================
    try {
      let api = `https://dv-yer-api.online/ytdlmp3?mode=link&url=${encodeURIComponent(vid.url)}&quality=128k`
      let res = await fetch(api)
      let json = await res.json()

      let url = json.download_url_full || json.url || json.direct_url

      if (url && url.startsWith('/')) {
        url = `https://dv-yer-api.online${url}`
      }

      if (!url) throw 'Sin link dv-yer'

      // validar link
      let test = await fetch(url, { method: 'HEAD' })
      if (!test.ok) throw 'Link roto dv-yer'

      await conn.sendMessage(m.chat, {
        audio: { url: url },
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`
      }, { quoted: m })

      return await m.react('✅')

    } catch (e) {
      console.log('DV-YER FALLÓ:', e.message)
    }

    // ================= 2️⃣ COBALT (EL BUENO) =================
    try {
      let res = await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: vid.url,
          isAudioOnly: true,
          aFormat: "mp3"
        })
      })

      let json = await res.json()

      if (!json?.url) throw 'Cobalt falló'

      await conn.sendMessage(m.chat, {
        audio: { url: json.url },
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`
      }, { quoted: m })

      return await m.react('✅')

    } catch (e) {
      console.log('COBALT FALLÓ:', e.message)
    }

    // ================= ❌ TODO FALLÓ =================
    throw 'Todas las APIs fallaron'

  } catch (err) {
    await conn.sendMessage(m.chat, {
      text: `❌ Error: ${err}`
    }, { quoted: m })

    await m.react('❌')
  }
}

handler.command = ['play']
export default handler
