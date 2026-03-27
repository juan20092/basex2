import fs from 'fs'

const ARCHIVO = './bloqueados.json'

export async function before(m, { isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.message) return true
  if (m.isGroup) return false

  const text = m.text || ''

  if (
    text.includes('PIEDRA') ||
    text.includes('PAPEL') ||
    text.includes('TIJERA') ||
    text.includes('serbot') ||
    text.includes('jadibot')
  ) return true

  let bot = global.db.data.settings[this.user.jid] || {}

  if (!bot.antiPrivate) return false
  if (isOwner || isROwner) return false

  // 🔥 LIMPIAR JID (CLAVE)
  let rawUser = m.sender
  let user = rawUser.split(':')[0]

  let numero = user.split('@')[0]

  await this.sendMessage(m.chat, {
    text: `🚫 *NO PRIVADO*

Hola @${numero}, no puedes hablar al privado del bot.

❌ Serás bloqueado automáticamente.
`,
    mentions: [user]
  }, { quoted: m })

  // ⏳ Delay necesario
  await new Promise(r => setTimeout(r, 2000))

  // 🔥 BLOQUEO REAL
  try {
    await this.updateBlockStatus(user, 'block')
    console.log('✅ Bloqueado:', user)
  } catch (e) {
    console.log('❌ Error bloqueo:', e)
  }

  // 💾 Registro
  let data = []
  if (fs.existsSync(ARCHIVO)) {
    try {
      data = JSON.parse(fs.readFileSync(ARCHIVO))
    } catch {
      data = []
    }
  }

  data.push({
    numero,
    fecha: new Date().toLocaleString('es-EC'),
    mensaje: text
  })

  fs.writeFileSync(ARCHIVO, JSON.stringify(data, null, 2))

  return true
}
