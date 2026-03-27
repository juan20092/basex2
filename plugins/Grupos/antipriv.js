import fs from 'fs'

const ARCHIVO = './bloqueados.json'

export async function before(m, { isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.message) return true
  if (m.isGroup) return false

  // Evitar errores con texto
  const text = m.text || ''

  // Evitar bloquear comandos internos o juegos
  if (
    text.includes('PIEDRA') ||
    text.includes('PAPEL') ||
    text.includes('TIJERA') ||
    text.includes('serbot') ||
    text.includes('jadibot')
  ) return true

  // ⚙️ CONFIG GATABOT
  let bot = global.db.data.settings[this.user.jid] || {}

  if (!bot.antiPrivate) return false
  if (isOwner || isROwner) return false

  let user = m.sender
  let numero = user.split('@')[0]

  // 📩 RESPUESTA
  await this.sendMessage(m.chat, {
    text: `🚫 *ACCESO DENEGADO*

Hola @${numero}, no puedes escribir al privado del bot.

Serás bloqueado automáticamente.

📢 Usa comandos en grupos.
`,
    mentions: [user]
  }, { quoted: m })

  // ⏳ Espera pequeña (evita bug de bloqueo)
  await new Promise(res => setTimeout(res, 1500))

  // 🔥 BLOQUEO REAL
  try {
    await this.updateBlockStatus(user, "block")
    console.log("✅ Usuario bloqueado:", user)
  } catch (e) {
    console.log("❌ Error al bloquear:", e)
  }

  // 💾 GUARDAR REGISTRO
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
