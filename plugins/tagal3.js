import { fileTypeFromBuffer } from 'file-type'

const handler = async (m, { conn, command, isOwner }) => {
  if (!isOwner) {
    return m.reply('❌ Solo el *owner* puede cambiar la foto del bot.')
  }

  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!mime || !/image\/(jpe?g|png)/.test(mime)) {
    return m.reply(`📸 Responde a una imagen con *.${command}*`)
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🕓', key: m.key }
    })

    const media = await q.download()
    if (!media) throw '❌ No se pudo descargar la imagen'

    const { mime: realMime } = await fileTypeFromBuffer(media) || { mime }

    await conn.updateProfilePicture(conn.user.id, media)

    await conn.sendMessage(m.chat, {
      text: '✅ Foto de perfil del bot actualizada correctamente.'
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al cambiar la foto de perfil del bot.')
  }
}

handler.help = ['setpp']
handler.tags = ['owner']
handler.command = ['setpp', 'setprofile']
handler.owner = true

export default handler
