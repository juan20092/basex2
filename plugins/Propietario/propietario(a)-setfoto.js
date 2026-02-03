import { fileTypeFromBuffer } from 'file-type'

const handler = async (m, { conn, command, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando.')

  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!/image\/(jpe?g|png)/.test(mime)) {
    return m.reply(`📸 Responde a una imagen con *.${command}*`)
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🕓', key: m.key }
    })

    const img = await q.download()
    if (!img) throw 'No se pudo descargar la imagen'

    // 🔑 JID REAL DEL BOT (NO del grupo)
    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'

    await conn.updateProfilePicture(botJid, img)

    await conn.sendMessage(m.chat, {
      text: '✅ Foto de perfil del BOT actualizada correctamente.'
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al cambiar la foto del bot.')
  }
}

handler.help = ['setfotobot']
handler.tags = ['owner']
handler.command = ['setfotobot']
handler.owner = true

export default handler
