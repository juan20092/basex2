import fetch from "node-fetch"
import yts from "yt-search"

let handler = async (m, { conn, text }) => {

  if (!text) throw '✦ Escribe una canción\nEjemplo:\n.play mirame blessd'

  await m.react('🕓')

  try {
    const search = await yts(text)
    const vid = search.videos[0]

    if (!vid) throw 'No se encontró la canción'

    await conn.sendMessage(m.chat, {
      text: `🎵 *${vid.title}*\n⏱ ${vid.timestamp}\n⬇️ Descargando...`
    }, { quoted: m })

    // ================= API DV-YER =================
    let api = `https://dv-yer-api.online/ytdlmp3?mode=link&url=${encodeURIComponent(vid.url)}&quality=128k`

    let res = await fetch(api)
    let json = await res.json()

    if (!json?.ok) throw 'API caída o sin respuesta válida'

    let audioUrl = json.download_url_full || json.url || json.direct_url

    if (audioUrl && audioUrl.startsWith('/')) {
      audioUrl = `https://dv-yer-api.online${audioUrl}`
    }

    if (!audioUrl) throw 'La API no devolvió audio'

    // 🔥 VALIDAR QUE EL LINK SÍ FUNCIONA
    let test = await fetch(audioUrl, { method: 'HEAD' })

    if (!test.ok) throw 'El link del audio está roto'

    // ✅ ENVIAR AUDIO
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${vid.title}.mp3`,
      ptt: false
    }, { quoted: m })

    await m.react('✅')

  } catch (err) {
    console.error(err)

    await conn.sendMessage(m.chat, {
      text: `❌ Error: ${err}\n\n💡 La API dv-yer está fallando ahora mismo`
    }, { quoted: m })

    await m.react('❌')
  }
}

handler.command = ['play']
export default handler
