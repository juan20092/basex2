import fs from 'fs'
import fetch from 'node-fetch'

let handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return

  const FOTO_PREDETERMINADA = './src/sinfoto2.jpg'

  const STICKERS_DESPEDIDA = [
    'https://files.catbox.moe/0boonh.webp',
    'https://files.catbox.moe/o58tbw.webp'
  ]

  const AUDIOS_BIENVENIDA = [
    'https://files.catbox.moe/kgykxt.ogg',
    'https://files.catbox.moe/kgykxt.ogg'
  ]

  const AUDIOS_DESPEDIDA = [
    'https://files.catbox.moe/2olqg1.ogg',
    'https://files.catbox.moe/k8znal.ogg',
    'https://files.catbox.moe/oj61hq.ogg'
  ]

  let userId = m.messageStubParameters?.[0]
  if (!userId) return

  // 🔥 OBTENER IMAGEN SIN ERRORES
  let img
  try {
    let pp = await conn.profilePictureUrl(userId, 'image')
    let res = await fetch(pp, { timeout: 5000 }) // ⏱️ límite
    img = await res.buffer()
  } catch {
    img = null
  }

  // 📷 FOTO POR DEFECTO SI FALLA
  if (!img) {
    try {
      img = fs.readFileSync(FOTO_PREDETERMINADA)
    } catch {
      img = null
    }
  }

  let chat = global.db.data.chats[m.chat]
  let subject = groupMetadata.subject
  let descs = groupMetadata.desc || "Sin descripción"

  let userName = `${userId.split('@')[0]}`
  let mentionUser = `@${userName}`

  // ================== BIENVENIDA ==================
  if (chat.welcome && m.messageStubType == 27) {

    let defaultWelcome = `*╔══════════════*
*╟* 𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢/𝗔
*╠══════════════*
*╟*🛡️ *${subject}*
*╟*👤 *${mentionUser}*
*╟* 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗖𝗜𝗢́𝗡 

${descs}

*╟* ¡🇼‌🇪‌🇱‌🇨‌🇴‌🇲‌🇪!
*╚══════════════*`

    let textWel = chat.sWelcome ? chat.sWelcome
      .replace(/@user/g, mentionUser)
      .replace(/@group/g, subject)
      .replace(/@desc/g, descs)
      : defaultWelcome

    await conn.sendMessage(m.chat, {
      image: img,
      caption: textWel,
      mentions: [userId]
    }, { quoted: m })

    // 🔊 AUDIO BIENVENIDA
    setTimeout(async () => {
      try {
        let audioUrl = AUDIOS_BIENVENIDA[Math.floor(Math.random() * AUDIOS_BIENVENIDA.length)]
        let audio = await (await fetch(audioUrl)).buffer()
        await conn.sendMessage(m.chat, {
          audio,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        })
      } catch {}
    }, 2000)
  }

  // ================== DESPEDIDA ==================
  else if (chat.welcome && (m.messageStubType == 28 || m.messageStubType == 32)) {

    let defaultBye = `*╔══════════════*
*╟* *SE FUE UNA BASURA*
*╟*👤 ${mentionUser}
*╚══════════════*`

    let textBye = chat.sBye ? chat.sBye
      .replace(/@user/g, mentionUser)
      .replace(/@group/g, subject)
      : defaultBye

    await conn.sendMessage(m.chat, {
      image: img,
      caption: textBye,
      mentions: [userId]
    }, { quoted: m })

    // 🎲 STICKER O AUDIO
    setTimeout(async () => {
      try {
        if (Math.random() < 0.5) {
          let stickerUrl = STICKERS_DESPEDIDA[Math.floor(Math.random() * STICKERS_DESPEDIDA.length)]
          let sticker = await (await fetch(stickerUrl)).buffer()
          await conn.sendMessage(m.chat, { sticker })
        } else {
          let audioUrl = AUDIOS_DESPEDIDA[Math.floor(Math.random() * AUDIOS_DESPEDIDA.length)]
          let audio = await (await fetch(audioUrl)).buffer()
          await conn.sendMessage(m.chat, {
            audio,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          })
        }
      } catch {}
    }, 2000)
  }
}

export default handler
