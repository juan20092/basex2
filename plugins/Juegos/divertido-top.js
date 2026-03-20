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
        return m.reply(`🚫 No hay suficientes miembros`)
    }

    let shuffled = participants.sort(() => Math.random() - 0.5)

    let winners = shuffled.slice(0, 10)

    let user = id => '@' + id.split('@')[0]

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

    let numeros = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"]

    let frases = [
        ["El más peligroso del grupo 💀","Modo dios activado 😎","Nadie le gana 👑"],
        ["Casi el primero pero le faltó 😂","Se quedó con ganas 🥈","Respeta al segundo 🔥"],
        ["Bronce pero con orgullo 🥉","Top 3 confirmado 😎","No está mal eh"],
        ["Casi entras al podio 🤡","Te faltó poquito 😆","Sigue intentando"],
        ["Mitad del camino 🥴","Ni bien ni mal","Sobreviviste"],
        ["Pasando raspando 😹","Te salvaste","De milagro estás aquí"],
        ["Ya casi te ibas 😭","Por poco último","No te duermas"],
        ["Uy cuidado 💀","Zona peligrosa","Estás en la cuerda floja"],
        ["Casi último 🤣","Ya huele a derrota","No te quieren"],
        ["Último pero participaste 🤡","El grupo te eligió","F en el chat"]
    ]

    let emoji = pickRandom(['🏆','🔥','💀','👀','🤡','🎮','👑','💩','😂'])

    let groupName = chat.metadata.subject || "GRUPO"

    let top = `*${emoji} TOP 10 ${text.toUpperCase()}*
*DE ${groupName.toUpperCase()} ${emoji}*

`

    for (let i = 0; i < 10; i++) {
        top += `${numeros[i]} ${user(winners[i])} → ${pickRandom(frases[i])}\n`
    }

    top += `\n🎮 Ranking oficial del grupo`

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
