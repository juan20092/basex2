import fs from 'fs'

export async function before(m, { isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.message) return true
  if (m.isGroup) return false

  let user = m.sender.split(':')[0]

  let bot = global.db.data.settings[this.user.jid] || {}
  if (!bot.antiPrivate) return false
  if (isOwner || isROwner) return false

  // 🔥 SI YA ESTÁ BLOQUEADO (IGNORAR)
  if (global.db.data.users[user]?.banned) return true

  let numero = user.split('@')[0]

  await this.sendMessage(m.chat, {
    text: `🚫 No puedes hablar al privado del bot.\n\nSerás ignorado automáticamente.`,
    mentions: [user]
  }, { quoted: m })

  // 🔥 "BLOQUEO REAL" (IGNORAR)
  if (!global.db.data.users[user]) {
    global.db.data.users[user] = {}
  }

  global.db.data.users[user].banned = true

  console.log("🚫 Usuario ignorado:", user)

  return true
}
