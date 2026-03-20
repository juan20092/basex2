let handler = async (m, { conn, text, usedPrefix }) => {

    if (!m.isGroup) return m.reply('❌ Solo en grupos')

    if (!text) {
        return m.reply(`Uso:\n${usedPrefix}top feos`)
    }

    // ✅ obtener metadata real del grupo
    let group = await conn.groupMetadata(m.chat)

    if (!group) {
        return m.reply('❌ Error obteniendo el grupo')
    }

    let members = group.participants.map(p => p.id)

    // quitar repetidos
    members = [...new Set(members)]

    if (members.length < 10) {
        return m.reply(`Solo hay ${members.length} miembros`)
    }

    // mezclar bien
    let shuffled = members
        .map(x => ({ x, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map(a => a.x)

    let winners = shuffled.slice(0, 10)

    let user = id => '@' + id.split('@')[0]

    let emoji = ['🏆','🔥','💀','👀','🤡','🎮','👑','💩','😂'][
        Math.floor(Math.random() * 9)
    ]

    let top = `*${emoji} TOP 10 ${text.toUpperCase()}*\n\n`

    for (let i = 0; i < winners.length; i++) {
        top += `${i + 1}. ${user(winners[i])}\n`
    }

    await conn.reply(
        m.chat,
        top,
        m,
        { mentions: winners }
    )
}

handler.command = ['topp']
handler.group = true
handler.tags = ['fun']

export default handler
