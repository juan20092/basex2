let handler = async (m, { conn, text, usedPrefix }) => {

    if (!m.isGroup) return

    if (!text) {
        return m.reply(`Uso:\n${usedPrefix}top feos`)
    }

    let chat = conn.chats[m.chat]

    if (!chat || !chat.metadata || !chat.metadata.participants) {
        return m.reply('Error obteniendo miembros del grupo')
    }

    let members = chat.metadata.participants.map(p => p.id)

    members = [...new Set(members)]

    if (members.length < 10) {
        return m.reply(`Solo hay ${members.length} miembros`)
    }

    // mezclar
    let shuffled = members.sort(() => Math.random() - 0.5)

    let winners = shuffled.slice(0, 10)

    let user = id => '@' + id.split('@')[0]

    let txt = `🔥 TOP 10 ${text.toUpperCase()}\n\n`

    for (let i = 0; i < winners.length; i++) {
        txt += `${i + 1}. ${user(winners[i])}\n`
    }

    await conn.sendMessage(
        m.chat,
        { text: txt, mentions: winners },
        { quoted: m }
    )
}

handler.command = ['topp']
handler.group = true

export default handler
