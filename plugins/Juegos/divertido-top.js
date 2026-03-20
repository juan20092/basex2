let handler = async (m, { conn, text, usedPrefix }) => {

    if (!m.isGroup) return

    if (!text) {
        return m.reply(`🎮 Uso:\n${usedPrefix}top <texto>\nEjemplo:\n${usedPrefix}top feos`)
    }

    let chat = conn.chats[m.chat]

    if (!chat || !chat.metadata || !chat.metadata.participants) {
        return m.reply('Error obteniendo miembros del grupo')
    }

    let participants = chat.metadata.participants.map(p => p.id)

    participants = [...new Set(participants)]

    if (participants.length < 10) {
        return m.reply(`🚫 No hay suficientes miembros para hacer un top 10`)
    }

    // mezclar
    let shuffled = participants.sort(() => Math.random() - 0.5)

    let winners = shuffled.slice(0, 10)

    let user = id => '@' + id.split('@')[0]

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

    let emoji = pickRandom(['🏆','🔥','💀','👀','🤡','🎮','👑','💩','🍑','😂'])

    let groupName = chat.metadata.subject || "ESTE GRUPO"

    const frasesTop = {
        1: ["¡El nº1 indiscutible! 👑", "¡Leyenda viviente! 🏆", "¡Imparable! 😎"],
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

*¡Ranking oficial del grupo!* 🎮`

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
