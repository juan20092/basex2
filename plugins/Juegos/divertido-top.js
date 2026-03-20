async function handler(m, { conn, text, usedPrefix }) {

    if (!m.isGroup) return m.reply('❌ Solo en grupos')

    if (!text) {
        return m.reply(`🎮 Uso:\n${usedPrefix}top <texto>\nEjemplo:\n${usedPrefix}top feos`)
    }

    // ✅ obtener metadata real del grupo (NO la del handler)
    let metadata = await conn.groupMetadata(m.chat)

    if (!metadata || !metadata.participants) {
        return m.reply('❌ No se pudo obtener el grupo')
    }

    // ✅ ids reales
    let members = metadata.participants
        .map(p => p.id)
        .filter(id => id && id.endsWith('@s.whatsapp.net'))

    // ✅ quitar repetidos
    members = [...new Set(members)]

    if (members.length < 10) {
        return m.reply(`🚫 Solo hay ${members.length} miembros, no se puede hacer top 10`)
    }

    // ✅ mezclar sin bug
    let shuffled = members
        .map(x => ({ x, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map(a => a.x)

    let winners = shuffled.slice(0, 10)

    let user = id => '@' + id.split('@')[0]

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

    let emoji = pickRandom(['🏆','🔥','💀','👀','🤡','🎮','👑','💩','🍑','😂'])

    let groupName = metadata.subject || "GRUPO"

    const frasesTop = {
        1: ["¡El nº1! 👑","¡Leyenda!","¡Imparable!"],
        2: ["¡Casi gana!","Buen puesto","Muy cerca"],
        3: ["Bronce","Top 3","Nada mal"]
    }

    let top = `*${emoji} TOP 10 ${text.toUpperCase()}*
*DE ${groupName.toUpperCase()} ${emoji}*

*_1.- 👑 ${user(winners[0])}_* ${pickRandom(frasesTop[1])}
*_2.- 🥈 ${user(winners[1])}_* ${pickRandom(frasesTop[2])}
*_3.- 🥉 ${user(winners[2])}_* ${pickRandom(frasesTop[3])}
*_4.- 🔥 ${user(winners[3])}_*
*_5.- 🔥 ${user(winners[4])}_*
*_6.- 🔥 ${user(winners[5])}_*
*_7.- 🔥 ${user(winners[6])}_*
*_8.- 🔥 ${user(winners[7])}_*
*_9.- 🔥 ${user(winners[8])}_*
*_10.- 🔥 ${user(winners[9])}_*

*Ranking oficial* 🎮`

    await conn.sendMessage(
        m.chat,
        { text: top, mentions: winners },
        { quoted: m }
    )
}

handler.command = ['top']
handler.group = true
handler.tags = ['fun']
handler.help = ['top <texto>']

export default handler
