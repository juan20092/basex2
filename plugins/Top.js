async function handler(m, { conn, text, participants, usedPrefix }) {

    if (!m.isGroup) return m.reply('❌ Solo en grupos')

    if (!text) {
        return m.reply(`Uso:\n${usedPrefix}top feos`)
    }

    if (!participants) {
        return m.reply('❌ No hay participantes')
    }

    // ✅ ids reales del grupo
    let members = participants
        .map(p => p.id || p.jid)
        .filter(v => v && v.endsWith('@s.whatsapp.net'))

    // quitar repetidos
    members = [...new Set(members)]

    if (members.length < 10) {
        return m.reply(`Solo hay ${members.length} miembros`)
    }

    // mezclar seguro
    let shuffled = members
        .map(x => ({ x, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map(a => a.x)

    let winners = shuffled.slice(0, 10)

    let user = id => '@' + id.split('@')[0]

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

    let emoji = pickRandom(['🏆','🔥','💀','👀','🤡','🎮','👑','💩','😂'])

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
