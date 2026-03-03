import fs, { promises } from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text && !m.mentionedJid[0] && !m.quoted) 
    throw `🙋 *¿A quién deseas saludar?*\n\n✨ *Ejemplo:*\n\n.saludar @kevin`

  try {
    // ✅ JID CORREGIDO - Esta es la única línea importante
    let user = m.mentionedJid[0] 
      ? m.mentionedJid[0] 
      : m.quoted 
        ? m.quoted.sender 
        : false

    if (!user) throw `⚠️ No encontré a quién mencionas.`

    let fkontak = {
      "key": { "participants": "0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" },
      "message": {
        "contactMessage": {
          "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
        }
      },
      "participant": "0@s.whatsapp.net"
    }

    let menu = `━━━━━━━━━━━━━━━━━━\n🖐🏻 *@${m.sender.split("@")[0]}* 𝘦𝘴𝘵𝘢 𝘴𝘢𝘭𝘶𝘥𝘢𝘯𝘥𝘰 𝘢 *@${user.split("@")[0]}* 😄\n\n💬 *¡Un saludo lleno de buena vibra!* ✨\n━━━━━━━━━━━━━━━━━━\n©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim()

    const img = './src/saludar.jpg'

    await m.react('🖐🏻')

    try {
      await conn.sendMessage(m.chat, {
        image: { url: img },
        caption: menu,
        mentions: [m.sender, user]
      }, { quoted: fkontak })
    } catch (error) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: gataMenu.getRandom() },
          caption: menu,
          mentions: [m.sender, user]
        }, { quoted: fkontak })
      } catch (error) {
        try {
          await conn.sendMessage(m.chat, {
            image: gataImg.getRandom(),
            caption: menu,
            mentions: [m.sender, user]
          }, { quoted: fkontak })
        } catch (error) {
          try {
            await conn.sendFile(m.chat, imagen5, 'menu.jpg', menu, fkontak, false, { mentions: [m.sender, user] })
          } catch (error) {
            return
          }
        }
      }
    }

  } catch (e) {
    await m.reply(
      `${lenguajeGB['smsMalError3']()} 👋\n*Hubo un error inesperado.*\n\n💬 *Por favor repórtalo con:* ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'reporte' : 'report'}`
    )
    console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`)
    console.log(e)
  }
}

handler.command = /^(saludar)$/i
handler.register = false
handler.group = true

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

// ✅ MAGIA - Esto hace que los subbots hereden del principal
if (!global.gataMenu && conn?.gataMenu) global.gataMenu = conn.gataMenu
if (!global.gataImg && conn?.gataImg) global.gataImg = conn.gataImg
if (!global.imagen5 && conn?.imagen5) global.imagen5 = conn.imagen5
if (!global.lenguajeGB && conn?.lenguajeGB) global.lenguajeGB = conn.lenguajeGB      `${lenguajeGB['smsMalError3']()} 👋\n*Hubo un error inesperado.*\n\n💬 *Por favor repórtalo con:* ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'reporte' : 'report'}`
    )
    console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`)
    console.log(e)
  }
}

handler.command = /^(saludar)$/i
handler.register = false
handler.group = true

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
