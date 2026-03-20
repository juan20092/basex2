async function handler(m, { conn, groupMetadata, text, usedPrefix }) {

    if (!text) {
        return m.reply(`🎮 Uso:\n${usedPrefix}top <texto>\nEjemplo:\n${usedPrefix}top feos`)
    }

    if (!groupMetadata || !groupMetadata.participants) {
        return m.reply('❌ No se pudo obtener la lista del grupo')
    }

    // ✅ obtener solo ids reales del grupo
    let members = []

    for (let p of groupMetadata.participants) {
        if (p.id && p.id.endsWith('@s.whatsapp.net')) {
            members.push(p.id)
        }
    }

    // ✅ quitar repetidos
    members = [...new Set(members)]

    if (members.length < 10) {
        return m.reply('🚫 No hay suficientes miembros para hacer un top 10.')
    }

    // ✅ mezclar sin bug
    let shuffled = members
        .map(x => ({ x, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map(a => a.x)

    let winners = shuffled.slice(0, 10)

    let user = id => '@' + id.split('@')[0]

    let emojiList = ['🏆','🔥','💀','👀','🤡','🎮','👑','💩','🍑','😂']

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

    let emoji = pickRandom(emojiList)

    let groupName = groupMetadata.subject || "ESTE GRUPO"

    const frasesTop = {
        1: ["¡El nº1 indiscutible! 👑", "¡Leyenda! 🏆", "¡Imparable! 😎"],
        2: ["¡Casi gana! 🥈", "¡Muy cerca! 🔥", "Buen puesto 😎"],
        3: ["Bronce pero poderoso 🥉", "Top 3 😎", "Nada mal 😂"]
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

*Ranking oficial del grupo* 🎮`

    await conn.sendMessage(
        m.chat,
        { text: top, mentions: winners },
        { quoted: m }
    )
}

handler.help = ['top <texto>']
handler.tags = ['fun']
handler.command = ['top']
handler.group = true

export default handler
