import fetch from 'node-fetch';

let toM = a => '@' + a.split('@')[0]

// Función para obtener nombre real del participante
function getRealName(conn, jid, participants) {
    if (!jid) return 'Desconocido'
    
    // Buscar en participantes del grupo
    let member = participants?.find(p => p.id === jid)
    if (member?.name) return member.name
    
    // Intentar obtener de WhatsApp
    try {
        let name = conn.getName(jid)
        if (name && name !== jid.split('@')[0]) return name
    } catch (e) {}
    
    // Fallback: mostrar solo últimos 8 dígitos del número
    let number = jid.split('@')[0].replace(/[^0-9]/g, '')
    return number.length > 8 ? '...' + number.slice(-8) : number
}

// Función para obtener participantes únicos aleatorios
function getUniqueRandomParticipants(participants, count, exclude = []) {
    if (!participants || participants.length === 0) return []
    
    let available = participants.filter(p => 
        p.id && 
        !exclude.includes(p.id) && 
        !p.id.includes('newsletter') &&
        !p.id.includes('broadcast') &&
        p.id !== 'status@broadcast'
    )
    
    if (available.length === 0) return []
    
    // Mezclar Fisher-Yates
    for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]]
    }
    
    return available.slice(0, Math.min(count, available.length)).map(p => p.id)
}

// Función pickRandom
function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = async (m, { conn, metadata, command, text, participants, usedPrefix }) => {
    try {
        // Validar que hay participantes en el grupo
        if (!metadata?.participants || metadata.participants.length === 0) {
            return m.reply('❌ No se pudo obtener la lista de participantes.')
        }
        
        // Obtener participantes únicos para tops (evitando duplicados)
        let uniqueParticipants = getUniqueRandomParticipants(metadata.participants, 10, [m.sender])
        
        // Si no hay suficientes participantes, usar los que hay
        let [a, b, c, d, e, f, g, h, i, j] = uniqueParticipants
        
        // Si faltan participantes, completar con el sender o repetir
        let fillMissing = (arr, needed) => {
            while (arr.length < needed) arr.push(m.sender)
            return arr
        }
        
        [a, b, c, d, e, f, g, h, i, j] = fillMissing([a, b, c, d, e, f, g, h, i, j], 10)
        
        // ============================================================
        // COMANDO: amistad / amigorandom
        // ============================================================
        if (command == 'amistad' || command == 'amigorandom') {
            let nameA = getRealName(conn, a, metadata.participants)
            let nameB = getRealName(conn, b, metadata.participants)
            
            m.reply(`*🔰 Vamos a hacer algunas amistades 🔰*\n\n*Oye ${nameA} hablale al privado a ${nameB} para que jueguen y se haga una amistad 🙆*\n\n*Las mejores amistades empiezan con un juego 😉*`, null, {
                mentions: [a, b]
            })
        }
        
        // ============================================================
        // COMANDO: formarpareja / formarparejas
        // ============================================================
        if (command == 'formarpareja' || command == 'formarparejas') {
            let nameA = getRealName(conn, a, metadata.participants)
            let nameB = getRealName(conn, b, metadata.participants)
            
            m.reply(`*${nameA}, 𝙔𝙖 𝙚𝙨 𝙝𝙤𝙧𝙖 𝙙𝙚 𝙦𝙪𝙚 𝙩𝙚 💍 𝘾𝙖𝙨𝙚𝙨 𝙘𝙤𝙣 ${nameB}, 𝙇𝙞𝙣𝙙𝙖 𝙋𝙖𝙧𝙚𝙟𝙖 😉💓*`, null, {
                mentions: [a, b]
            })
        }
        
        // ============================================================
        // COMANDO: personalidad
        // ============================================================
        if (command == 'personalidad') {
            let target = m.mentionedJid[0] || m.quoted?.sender || m.sender
            let targetName = getRealName(conn, target, metadata.participants)
            
            let personalidad = `┏━━°❀❬ *PERSONALIDAD* ❭❀°━━┓
*┃*
*┃• Nombre* : ${targetName}
*┃• Buena Moral* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}
*┃• Mala Moral* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}
*┃• Tipo de persona* : ${pickRandom(['De buen corazón','Arrogante','Tacaño','Generoso','Humilde','Tímido','Cobarde','Entrometido','Cristal','No binarie XD', 'Pendejo'])}
*┃• Siempre* : ${pickRandom(['Pesado','De malas','Distraido','De molestoso','Chismoso','Pasa jalandosela','De compras','Viendo anime','Chatea en WhatsApp porque esta soltero','Acostado bueno para nada','De mujeriego','En el celular'])}
*┃• Inteligencia* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}
*┃• Morosidad* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}
*┃• Coraje* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}
*┃• Miedo* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}
*┃• Fama* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}
*┃• Género* : ${pickRandom(['Hombre', 'Mujer', 'Homosexual', 'Bisexual', 'Pansexual', 'Feminista', 'Heterosexual', 'Macho alfa', 'Mujerzona', 'Marimacha', 'Palosexual', 'PlayStationSexual', 'Sr. Manuela', 'Pollosexual'])}
┗━━━━━━━━━━━━━━━━`
            
            conn.reply(m.chat, personalidad, m, { mentions: [target] })
        }
        
        // ============================================================
        // COMANDO: ship / shippear
        // ============================================================
        if (command == 'ship' || command == 'shippear') {
            if (!text) return m.reply(`⚠️ 𝐄𝐬𝐜𝐫𝐢𝐛𝐚 𝐞𝐥 𝐧𝐨𝐦𝐛𝐫𝐞 𝐝𝐞 𝐝𝐨𝐬 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐬 𝐩𝐚𝐫𝐚 𝐜𝐚𝐥𝐜𝐮𝐥𝐚𝐫 𝐬𝐮𝐬 𝐚𝐦𝐨𝐫`)
            
            let [text1, ...text2] = text.split(' ')
            text2 = (text2 || []).join(' ')
            if (!text2) throw `⚠️ 𝐅𝐚𝐥𝐭𝐚 𝐞𝐥 𝐧𝐨𝐦𝐛𝐫𝐞 𝐝𝐞 𝐥𝐚 𝐬𝐞𝐠𝐮𝐧𝐝𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚`
            
            let love = `_❤️ *${text1}* tu oportunidad de enamorarte de *${text2}* es de *${Math.floor(Math.random() * 100)}%* 👩🏻‍❤️‍👨🏻_ `.trim()
            m.reply(love, null, { mentions: conn.parseMention(love) })
        }
        
        // ============================================================
        // COMANDO: love
        // ============================================================
        if (command == 'love') {
            if (!text && !m.mentionedJid[0] && !m.quoted) 
                return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag`)
            
            let target = m.mentionedJid[0] || m.quoted?.sender || m.sender
            let targetName = getRealName(conn, target, metadata.participants)
            
            conn.reply(m.chat, ` *❤️❤️ MEDIDOR DE AMOR ❤️❤️* \n*El amor de ${targetName} por ti es de* *${Math.floor(Math.random() * 100)}%* *de un 100%*\n*Deberias pedirle que sea tu novia/o ?*`.trim(), m, {
                mentions: [target]
            })
        }
        
        // ============================================================
        // COMANDOS DE PORCENTAJE (gay2, lesbiana, pajero, etc.)
        // ============================================================
        const percentageCommands = ['gay2', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituto', 'prostituta']
        
        if (percentageCommands.includes(command)) {
            if (!text && !m.mentionedJid[0] && !m.quoted) 
                return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag`)
            
            let target = m.mentionedJid[0] || m.quoted?.sender || m.sender
            let targetName = getRealName(conn, target, metadata.participants)
            let percentage = Math.floor(Math.random() * 100) + 1
            
            let emoji = {
                'gay2': '🏳️‍🌈',
                'lesbiana': '🏳️‍🌈',
                'pajero': '😏💦',
                'pajera': '😏💦',
                'puto': '🔥🥵',
                'puta': '🔥🥵',
                'manco': '💩',
                'manca': '💩',
                'rata': '🐁',
                'prostituto': '🫦👅',
                'prostituta': '🫦👅'
            }
            
            let extraText = {
                'puto': ', MÁS INFORMACIÓN A SU PRIVADO 🔥🥵 XD',
                'puta': ', MÁS INFORMACIÓN A SU PRIVADO 🔥🥵 XD',
                'rata': ' COME QUESO 🧀',
                'prostituto': ', QUIEN QUIERE DE SUS SERVICIOS? XD',
                'prostituta': ', QUIEN QUIERE DE SUS SERVICIOS? XD'
            }
            
            let message = `_*${targetName.toUpperCase()}* *ES* *${percentage}%* *${command.toUpperCase()}* ${emoji[command] || ''}${extraText[command] || ''}_`
            
            await conn.reply(m.chat, message, m, { mentions: [target] })
        }
        
        // ============================================================
        // COMANDO: gay (con imagen y audio)
        // ============================================================
        if (command == 'gay') {
            let vn = 'https://qu.ax/HfeP.mp3'
            let target = m.mentionedJid[0] || m.quoted?.sender || m.sender
            let targetName = getRealName(conn, target, metadata.participants)
            let randomPercent = Math.floor(Math.random() * 100) + 1
            
            let messageText
            if (randomPercent <= 20) messageText = 'Usted es hetero 🤪🤙'
            else if (randomPercent <= 40) messageText = 'Mas o menos 🤔'
            else if (randomPercent <= 60) messageText = 'Tengo mis dudas 😑'
            else if (randomPercent <= 80) messageText = 'Tengo razón? 😏'
            else messageText = 'Usted es gay 🥸'
            
            let jawab = `@${target.split("@")[0]} Es 🏳️‍🌈 ${randomPercent}% Gay\n\n${messageText}`
            
            try {
                const avatar = await conn.profilePictureUrl(target, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
                const imageRes = await fetch(`https://some-random-api.com/canvas/gay?avatar=${encodeURIComponent(avatar)}`)
                const buffer = await imageRes.buffer()
                
                await conn.sendMessage(m.chat, {
                    image: buffer,
                    caption: jawab,
                    contextInfo: {
                        mentionedJid: [target],
                        forwardingScore: 9999999,
                        isForwarded: false
                    }
                }, { quoted: m })
                
                await conn.sendFile(m.chat, vn, 'gay.mp3', null, m, true, {
                    type: 'audioMessage',
                    ptt: true
                })
            } catch (e) {
                console.log('Error en comando gay:', e)
                await m.reply(jawab)
            }
        }
        
        // ============================================================
        // COMANDO: DOXXEO (simulado)
        // ============================================================
        if (command == 'doxxeo' || command == 'doxxear' || command == 'doxeo' || command == 'doxear') {
            if (!text && !m.mentionedJid[0] && !m.quoted) 
                return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag`)
            
            let target = m.mentionedJid[0] || m.quoted?.sender || m.sender
            let targetName = getRealName(conn, target, metadata.participants)
            
            let start = `*😱 ¡¡𝙀𝙢𝙥𝙚𝙯𝙖𝙣𝙙𝙤 𝙙𝙤𝙭𝙭𝙚𝙤 𝙙𝙚 ${targetName}!! 😱*`
            
            const boostSteps = [
                '*20%*',
                '*40%*',
                '*60%*',
                '*80%*',
                '*100%*'
            ]
            
            const { key } = await conn.sendMessage(m.chat, { text: start }, { quoted: m })
            
            for (let step of boostSteps) {
                await delay(800)
                await conn.sendMessage(m.chat, { text: step, edit: key })
            }
            
            await delay(500)
            
            let doxeo = `*✅ 𝐏𝐞𝐫𝐬𝐨𝐧𝐚 𝐡𝐚𝐜𝐤𝐞𝐚𝐝𝐚 𝐜𝐨𝐧 𝐞𝐱𝐢𝐭𝐨 🤣*\n\n*𝐑𝐞𝐬𝐮𝐥𝐭𝐚𝐝𝐨𝐬 𝐝𝐞 ${targetName}:*\n\n*Nombre:* ${targetName}\n*Ip:* 192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}\n*Teléfono:* ${target.split('@')[0]}\n*MAC:* ${Array(6).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase()}\n*ISP:* TORNADO SLK PRODUCTION\n*DNS:* 8.8.8.8\n*WAN:* 100.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}\n*${Math.random() > 0.5 ? '⚠️ Este usuario tiene virus en su dispositivo' : '🔒 Dispositivo seguro'}*`
            
            await conn.sendMessage(m.chat, { text: doxeo, edit: key })
        }
        
        // ============================================================
        // COMANDOS TOP (con nombres reales)
        // ============================================================
        
        // Función auxiliar para generar tops
        const generateTop = (title, entries) => {
            let text = `*${title}*\n\n`
            entries.forEach((entry, idx) => {
                let name = getRealName(conn, entry.jid, metadata.participants)
                text += `*${idx + 1}.- ${entry.emoji} ${name} ${entry.emoji}*\n`
            })
            return text
        }
        
        // Top Gays
        if (command == 'topgays') {
            let vn = 'https://qu.ax/HfeP.mp3'
            let participantsList = [a, b, c, d, e, f, g, h, i, j]
            let topText = `*🌈 TOP 10 GAYS/LESBIANAS DEL GRUPO 🌈*\n\n`
            
            participantsList.forEach((jid, idx) => {
                let name = getRealName(conn, jid, metadata.participants)
                let emoji = idx % 2 === 0 ? '🏳️‍🌈' : (idx % 3 === 0 ? '🪂' : '🪁')
                topText += `*${idx + 1}.- ${emoji} ${name} ${emoji}*\n`
            })
            
            m.reply(topText, null, { mentions: participantsList })
            
            try {
                await conn.sendFile(m.chat, vn, 'gay.mp3', null, m, true, {
                    type: 'audioMessage',
                    ptt: true
                })
            } catch (e) {}
        }
        
        // Top Otakus
        if (command == 'topotakus') {
            let vn = 'https://qu.ax/ZgFZ.mp3'
            let participantsList = [a, b, c, d, e, f, g, h, i, j]
            let topText = `*🌸 TOP 10 OTAKUS DEL GRUPO 🌸*\n\n`
            
            participantsList.forEach((jid, idx) => {
                let name = getRealName(conn, jid, metadata.participants)
                let emoji = idx % 2 === 0 ? '💮' : '🌷'
                topText += `*${idx + 1}.- ${emoji} ${name} ${emoji}*\n`
            })
            
            m.reply(topText, null, { mentions: participantsList })
            
            try {
                await conn.sendFile(m.chat, vn, 'otaku.mp3', null, m, true, {
                    type: 'audioMessage',
                    ptt: true
                })
            } catch (e) {}
        }
        
        // Top Integrantes
        if (command == 'topintegrantes' || command == 'topintegrante') {
            let participantsList = [a, b, c, d, e, f, g, h, i, j]
            let topText = `*💎 TOP 10 L@S MEJORES INTEGRANTES 👑*\n\n`
            
            participantsList.forEach((jid, idx) => {
                let name = getRealName(conn, jid, metadata.participants)
                let emoji = idx % 2 === 0 ? '💎' : '👑'
                topText += `*${idx + 1}.- ${emoji} ${name} ${emoji}*\n`
            })
            
            m.reply(topText, null, { mentions: participantsList })
        }
        
        // Top Grasa
        if (command == 'toplagrasa' || command == 'topgrasa') {
            let participantsList = [a, b, c, d, e, f, g, h, i, j]
            let emojis = ['Bv', ':v', ':D', 'Owo', 'U.u', '>:v', ':\'v', '._.', ':V', 'XD']
            let topText = `*Uwu TOP 10 LA GRASA Uwu*\n\n`
            
            participantsList.forEach((jid, idx) => {
                let name = getRealName(conn, jid, metadata.participants)
                topText += `*${idx + 1}.- ${emojis[idx]} ${name} ${emojis[idx]}*\n`
            })
            
            m.reply(topText, null, { mentions: participantsList })
        }
        
        // Top Panafrescos
        if (command == 'toppanafrescos' || command == 'toppanafresco') {
            let participantsList = [a, b, c, d, e, f, g, h, i, j]
            let emojis = ['🤑', '🤙', '😎', '👌', '🧐', '😃', '😋', '🤜', '💪', '😉']
            let topText = `*👊 TOP 10 PANAFRESCOS 👊*\n\n`
            
            participantsList.forEach((jid, idx) => {
                let name = getRealName(conn, jid, metadata.participants)
                topText += `*${idx + 1}.- ${emojis[idx]} ${name} ${emojis[idx]}*\n`
            })
            
            m.reply(topText, null, { mentions: participantsList })
        }
        
        // Top Shiposters
        if (command == 'topshiposters' || command == 'topshipost') {
            let participantsList = [a, b, c, d, e, f, g, h, i, j]
            let emojis = ['😈', '🤙', '🥶', '🤑', '🥵', '🤝', '😟', '😨', '😇', '🤠']
            let topText = `*😱 TOP 10 SHIPOSTERS DEL GRUPO 😱*\n\n`
            
            participantsList.forEach((jid, idx) => {
                let name = getRealName(conn, jid, metadata.participants)
                topText += `*${idx + 1}.- ${emojis[idx]} ${name} ${emojis[idx]}*\n`
            })
            
            m.reply(topText, null, { mentions: participantsList })
        }
        
        // Top Pajeros
        if (command == 'toppajer@s' || command == 'toppajeros') {
            let participantsList = [a, b, c, d, e, f, g, h, i, j]
            let topText = `*😏 TOP L@S MAS PAJEROS/AS DEL GRUPO 💦*\n\n`
            
            participantsList.forEach((jid, idx) => {
                let name = getRealName(conn, jid, metadata.participants)
                topText += `*${idx + 1}.- 🥵 ${name} 💦*\n`
            })
            
            m.reply(topText, null, { mentions: participantsList })
        }
        
        // Top Lindos
        if (command == 'toplind@s' || command == 'toplindos') {
            let participantsList = [a, b, c, d, e, f, g, h, i, j]
            let topText = `*😳 TOP L@S MAS LIND@S Y SEXIS DEL GRUPO 😳*\n\n`
            
            participantsList.forEach((jid, idx) => {
                let name = getRealName(conn, jid, metadata.participants)
                topText += `*${idx + 1}.- ✨ ${name} ✨*\n`
            })
            
            m.reply(topText, null, { mentions: participantsList })
        }
        
        // Top Putos
        if (command == 'topput@s') {
            let participantsList = [a, b, c, d, e, f, g, h, i, j]
            let topText = `*😏 TOP L@S MAS PUT@S DEL GRUPO 🔥*\n\n`
            
            participantsList.forEach((jid, idx) => {
                let name = getRealName(conn, jid, metadata.participants)
                topText += `*${idx + 1}.- 👉 ${name} 👌*\n`
            })
            
            m.reply(topText, null, { mentions: participantsList })
        }
        
        // Top Famosos
        if (command == 'topfamosos' || command == 'topfamos@s') {
            let participantsList = [a, b, c, d, e, f, g, h, i, j]
            let emojis = ['🛫', '🥂', '🤩', '🛫', '🥂', '🤩', '🛫', '🥂', '🤩', '🛫']
            let topText = `*🌟 TOP PERSONAS FAMOSAS EN EL GRUPO 🌟*\n\n`
            
            participantsList.forEach((jid, idx) => {
                let name = getRealName(conn, jid, metadata.participants)
                topText += `*${idx + 1}.- ${emojis[idx]} ${name} ${emojis[idx]}*\n`
            })
            
            m.reply(topText, null, { mentions: participantsList })
        }
        
        // Top Parejas
        if (command == 'topparejas' || command == 'top5parejas') {
            let pairs = [
                [a, b], [c, d], [e, f], [g, h], [i, j]
            ]
            
            let topText = `*😍 Las 5 maravillosas parejas del grupo 😍*\n\n`
            
            pairs.forEach((pair, idx) => {
                let name1 = getRealName(conn, pair[0], metadata.participants)
                let name2 = getRealName(conn, pair[1], metadata.participants)
                topText += `*${idx + 1}.- ${name1} 💘 ${name2}*\n`
                
                if (idx === 0) topText += `Que hermosa pareja 💖, me invitan a su Boda 🛐\n\n`
                else if (idx === 1) topText += `🌹 Ustedes se merecen lo mejor del mundo 💞\n\n`
                else if (idx === 2) topText += `Tan enamorados 😍, para cuando la familia 🥰\n\n`
                else if (idx === 3) topText += `💗 Decreto que ustedes son la pareja del Año 💗\n\n`
                else topText += `Genial! 💝, están de Luna de miel 🥵✨❤️‍🔥\n\n`
            })
            
            let allMentions = pairs.flat()
            m.reply(topText, null, { mentions: allMentions })
        }
        
        // Top genérico (para cualquier categoría)
        if (command == 'top') {
            if (!text) return m.reply(`𝙔 𝙚𝙡 𝙩𝙚𝙭𝙩𝙤? 🤔\n📍 Ejemplo: ${usedPrefix}top nedro`)
            
            let participantsList = [a, b, c, d, e, f, g, h, i, j]
            let randomEmoji = pickRandom(['🤓','😅','😂','😳','😎', '🥵', '😱', '🤑', '🙄', '💩','🍑','🤨','🥴','🔥','👇🏻','😔', '👀','🌚'])
            let topText = `*${randomEmoji} Top 10 ${text} ${randomEmoji}*\n\n`
            
            participantsList.forEach((jid, idx) => {
                let name = getRealName(conn, jid, metadata.participants)
                topText += `*${idx + 1}. ${name}*\n`
            })
            
            m.reply(topText, null, { mentions: participantsList })
            
            // Intentar enviar audio aleatorio
            try {
                let k = Math.floor(Math.random() * 70)
                let vn = `https://hansxd.nasihosting.com/sound/sound${k}.mp3`
                await conn.sendFile(m.chat, vn, 'sound.mp3', null, m, true, {
                    type: 'audioMessage',
                    ptt: true
                })
            } catch (e) {}
        }
        
    } catch (e) {
        console.error('❌ Error en handler de juegos:', e)
        await m.reply(`❌ Hubo un error ejecutando el comando. Por favor intenta de nuevo.`)
    }
}

handler.help = ["love", "gay2", "lesbiana", "pajero", "pajera", "puto", "puta", "manco", "manca", "rata", "prostituta", "prostituto", "amigorandom", "amistad", "formarpareja", "gay", "personalidad", "ship", "topgays", "top", "topputos", "toplindos", "toppajer@s", "topshipost", "toppanafresco", "topgrasa", "topintegrantes", "topfamos@s", "top5parejas", "doxxeo", "topotakus"]
handler.tags = ['game']
handler.command = /^love|gay2|lesbiana|pajero|pajera|puto|puta|manco|manca|rata|prostituta|prostituto|amigorandom|amistad|formarpareja|formarparejas|gay|personalidad|ship|shippear|topgays|top|topputos|toplindos|toplind@s|toppajer@s|toppajeros|topshipost|topshiposters|toppanafresco|topgrasa|toppanafrescos|toplagrasa|topintegrante|topintegrantes|topotakus|topfamosos|topfamos@s|topparejas|top5parejas|doxxeo|doxxear|doxeo|doxear|toplagrasa|topgrasa|toppajeros|topintegrantes|topintegrante|topotakus|topfamosos|topfamos@s|topparejas|top5parejas$/i
handler.group = true
handler.register = false

export default handler*W:* 12.4893
*SS NUMBER:* 6979191519182016
*IPV6:* fe80::5dcd::ef69::fb22::d9888%12 
*UPNP:* Enabled
*DMZ:* 10.112.42.15
*MAC:* 5A:78:3E:7E:00
*ISP:* TORNADO SLK PRODUCTION
*DNS:* 8.8.8.8
*ALT DNS:* 1.1.1.1.1  
*DNS SUFFIX:* TORNADO WI-FI
*WAN:* 100.23.10.90
*WAN TYPE:* private nat
*GATEWAY:* 192.168.0.1
*SUBNET MASK:* 255.255.0.255
*UDP OPEN PORTS:* 8080.80
*TCP OPEN PORTS:* 443
*ROUTER VENDEDOR:* ERICCSON
*DEVICE VENDEDOR:* WIN32-X
*CONNECTION TYPE:* TORNADO SLK PRODUCTION
*ICMPHOPS:* 192.168.0.1 192.168.1.1 100.73.43.4
host-132.12.32.167.ucom.com
host-132.12.111.ucom.com
36.134.67.189 216.239.78.11
Sof02s32inf14.1e100.net
*HTTP:* 192.168.3.1:433-->92.28.211.234:80
*Http:* 192.168.625-->92.28.211.455:80
*Http:* 192.168.817-->92.28.211.8:971
*Upd:* 192.168452-->92.28.211:7265288
*Tcp:* 192.168.682-->92.28.211:62227.7
*Tcp:* 192.168.725-->92.28.211:67wu2
*Tcp:* 192.168.629-->92.28.211.167:8615
*EXTERNAL MAC:* 6U:77:89:ER:O4
*MODEM JUMPS:* 58`
await conn.sendMessage(m.chat, {text: doxeo, edit: key})
}

//------------------------------------------------------------------------------------

if (command == 'gay') {
let vn = 'https://qu.ax/HfeP.mp3'
let who
if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
else who = m.sender 
let member = participants.map(u => u.id)
let me = m.sender
let jodoh = member[Math.floor(Math.random() * member.length)]
let random = `${Math.floor(Math.random() * 100)}`
let gay = random
if (gay < 20 ) {gay = 'Usted es hetero 🤪🤙'} else if (gay == 21 ) {gay = 'Mas o menos 🤔'} else if (gay == 23 ) {gay = 'Mas o menos 🤔'} else if (gay == 24 ) {ga = 'Mas o menos 🤔'} else if (gay == 25 ) {gay = 'Mas o menos 🤔'} else if (gay == 26 ) {gay = 'Mas o menos 🤔'} else if (gay == 27 ) {gay = 'Mas o menos 🤔'} else if (gay == 28 ) {gay = 'Mas o menos 🤔'} else if (gay == 29 ) {gay = 'Mas o menos 🤔'} else if (gay == 30 ) {gay = 'Mas o menos 🤔'} else if (gay == 31 ) {gay = 'Tengo mi dudas 😑'} else if (gay == 32 ) {gay = 'Tengo mi dudas 😑'} else if (gay == 33 ) {gay = 'Tengo mi dudas 😑'} else if (gay == 34 ) {gay = 'Tengo mi dudas 😑'} else if (gay == 35 ) {gay = 'Tengo mi dudas 😑'} else if (gay == 36 ) {gay = 'Tengo mi dudas 😑'} else if (gay == 37 ) {gay = 'Tengo mi dudas 😑'} else if (gay == 38 ) {gay = 'Tengo mi dudas 😑'} else if (gay == 39 ) {gay = 'Tengo mi dudas 😑'} else if (gay == 40 ) {gay = 'Tengo mi dudas 😑'} else if (gay == 41 ) {gay = 'Tengo razon? 😏'} else if (gay == 42 ) {gay = 'Tengo razon? 😏'} else if (gay == 43 ) {gay = 'Tengo razon? 😏'} else if (gay == 44 ) {gay = 'Tengo razon? 😏'} else if (gay == 45 ) {gay = 'Tengo razon? 😏'} else if (gay == 46 ) {gay = 'Tengo razon? 😏'} else if (gay == 47 ) {gay = 'Tengo razon? 😏'} else if (gay == 48 ) {gay = 'Tengo razon? 😏'} else if (gay == 49 ) {gay = 'Tengo razon? 😏'} else if (gay == 50 ) {gay = 'Eres o no? 🧐'} else if (gay > 51) {gay = 'Usted es gay 🥸'}
//let kah = ra[Math.floor(Math.random() * ra.length)]
    let jawab = `@${who.split("@")[0]} Es 🏳️‍🌈 ${random}% Gay\n\n${gay}`;
    const avatar = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');

    const imageRes = await fetch(`https://some-random-api.com/canvas/gay?avatar=${encodeURIComponent(avatar)}`);
    const buffer = await imageRes.buffer();

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: jawab,
      contextInfo: {
        mentionedJid: [who],
        forwardingScore: 9999999,
        isForwarded: false
      }
    }, { quoted: m, ephemeralExpiration: 24 * 60 * 1000 });

    await conn.sendFile(m.chat, vn, 'gay.mp3', null, m, true, {
      type: 'audioMessage',
      ptt: true
    });
  }

//------------------------------------------------------------------------------------
    
if (command == 'gay2') {
if (!text) return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖𝙡 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag` ) 
let juego = `_*${text.toUpperCase()}* *ES* *${(500).getRandom()}%* *GAY*_ 🏳️‍🌈`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}

//------------------------------------------------------------------------------------
  
if (command == 'lesbiana') { 
if (!text) return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖𝙡 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag` ) 
let juego = `_*${text.toUpperCase()}* *ES* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()}*_ 🏳️‍🌈`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------
  
if (command == 'pajero') {
if (!text) return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖𝙡 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag` ) 
let juego = `_*${text.toUpperCase()}* *ES* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()}*_ 😏💦`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------
  
if (command == 'pajera') {
if (!text) return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖𝙡 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag` ) 
let juego = `_*${text.toUpperCase()}* *ES* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()}*_ 😏💦`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------
  
if (command == 'puto') {
if (!text) return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖𝙡 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag` ) 
let juego = `_*${text.toUpperCase()}* *ES* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()},* *MÁS INFORMACIÓN A SU PRIVADO 🔥🥵 XD*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------
  
if (command == 'puta') {
if (!text) return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖𝙡 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag` ) 
let juego = `_*${text.toUpperCase()}* *ES* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()},* *MÁS INFORMACIÓN A SU PRIVADO 🔥🥵 XD*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}

//------------------------------------------------------------------------------------
  
if (command == 'manco') {
if (!text) return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖𝙡 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag` ) 
let juego = `_*${text.toUpperCase()}* *ES* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()} 💩*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------ 
  
if (command == 'manca') {
if (!text) return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖𝙡 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag` ) 
let juego = `_*${text.toUpperCase()}* *ES* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()} 💩*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------
  
if (command == 'rata') {
if (!text) return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖𝙡 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag` ) 
let juego = `_*${text.toUpperCase()}* *ES* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()} 🐁 COME QUESO 🧀*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------ 
  
if (command == 'prostituto') {
if (!text) return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖𝙡 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag` ) 
let juego = `_*${text.toUpperCase()}* *ES* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()} 🫦👅, QUIEN QUIERE DE SUS SERVICIOS? XD*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------  
  
if (command == 'prostituta') {
if (!text) return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖𝙡 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag` ) 
let juego = `_*${text.toUpperCase()}* *ES* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()} 🫦👅, QUIEN QUIERE DE SUS SERVICIOS? XD*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------

if (command == 'love') {
if (!text) return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖𝙡 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag` ) 
conn.reply(m.chat, ` *❤️❤️ MEDIDOR DE AMOR ❤️❤️* 
*El amor de ${text} por ti es de* *${Math.floor(Math.random() * 100)}%* *de un 100%*
*Deberias pedirle que sea tu  novia/o ?*`.trim(), m, m.mentionedJid ? {
 mentions: m.mentionedJid
 } : {})} 

//------------------------------------------------------------------------------------    
if (command == 'top') {
if (!text) return m.reply(`𝙔 𝙚𝙡 𝙩𝙚𝙭𝙩𝙤? 🤔\n📍 Ejemplo: ${usedPrefix}top nedro`)
let ps = metadata.participants.map(v => v.id)
let a = ps.getRandom()
let b = ps.getRandom()
let c = ps.getRandom()
let d = ps.getRandom()
let e = ps.getRandom()
let f = ps.getRandom()
let g = ps.getRandom()
let h = ps.getRandom()
let i = ps.getRandom()
let j = ps.getRandom()
let k = Math.floor(Math.random() * 70);
let x = `${pickRandom(['🤓','😅','😂','😳','😎', '🥵', '😱', '🤑', '🙄', '💩','🍑','🤨','🥴','🔥','👇🏻','😔', '👀','🌚'])}`
let l = Math.floor(Math.random() * x.length);
let vn = `https://hansxd.nasihosting.com/sound/sound${k}.mp3`
let top = `*${x} Top 10 ${text} ${x}*
    
*1. ${user(a)}*
*2. ${user(b)}*
*3. ${user(c)}*
*4. ${user(d)}*
*5. ${user(e)}*
*6. ${user(f)}*
*7. ${user(g)}*
*8. ${user(h)}*
*9. ${user(i)}*
*10. ${user(j)}*`
m.reply(top, null, { mentions: [a, b, c, d, e, f, g, h, i, j]})
conn.sendFile(m.chat, vn, 'error.mp3', null, m, true, {
type: 'audioMessage',
ptt: true })}

//------------------------------------------------------------------------------------
 
 if (command == 'topgays') {
let vn = 'https://qu.ax/HfeP.mp3'
let top = `*🌈TOP 10 GAYS/LESBIANAS DEL GRUPO🌈*
    
*_1.- 🏳️‍🌈 ${user(a)}_* 🏳️‍🌈
*_2.- 🪂 ${user(b)}_* 🪂
*_3.- 🪁 ${user(c)}_* 🪁
*_4.- 🏳️‍🌈 ${user(d)}_* 🏳️‍🌈
*_5.- 🪂 ${user(e)}_* 🪂
*_6.- 🪁 ${user(f)}_* 🪁
*_7.- 🏳️‍🌈 ${user(g)}_* 🏳️‍🌈
*_8.- 🪂 ${user(h)}_* 🪂
*_9.- 🪁 ${user(i)}_* 🪁
*_10.- 🏳️‍🌈 ${user(j)}_* 🏳️‍🌈`
m.reply(top, null, { mentions: conn.parseMention(top) })
conn.sendFile(m.chat, vn, 'error.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true })}
    
//------------------------------------------------------------------------------------ 
     
if (command == 'topotakus') {
let vn = 'https://qu.ax/ZgFZ.mp3'
let top = `*🌸 TOP 10 OTAKUS DEL GRUPO 🌸*
    
*_1.- 💮 ${user(a)}_* 💮
*_2.- 🌷 ${user(b)}_* 🌷
*_3.- 💮 ${user(c)}_* 💮
*_4.- 🌷 ${user(d)}_* 🌷
*_5.- 💮 ${user(e)}_* 💮
*_6.- 🌷 ${user(f)}_* 🌷
*_7.- 💮 ${user(g)}_* 💮
*_8.- 🌷 ${user(h)}_* 🌷
*_9.- 💮 ${user(i)}_* 💮
*_10.- 🌷 ${user(j)}_* 🌷`
m.reply(top, null, { mentions: conn.parseMention(top) })
conn.sendFile(m.chat, vn, 'otaku.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true 
})}
   
//------------------------------------------------------------------------------------
    
if (command == 'topintegrantes' || command == 'topintegrante') {
let top = `*_💎TOP 10 L@S MEJORES INTEGRANTES👑_*
    
*_1.- 💎 ${user(a)}_* 💎
*_2.- 👑 ${user(b)}_* 👑
*_3.- 💎 ${user(c)}_* 💎
*_4.- 👑 ${user(d)}_* 👑
*_5.- 💎 ${user(e)}_* 💎
*_6.- 👑 ${user(f)}_* 👑
*_7.- 💎 ${user(g)}_* 💎
*_8.- 👑 ${user(h)}_* 👑
*_9.- 💎 ${user(i)}_* 💎
*_10.- 👑 ${user(j)}_* 👑`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------   
   
if (command == 'toplagrasa' || command == 'topgrasa') {
let top = `*_Uwu TOP 10 LA GRASA Uwu_* 
    
*_1.- Bv ${user(a)} Bv_*
*_2.- :v ${user(b)} :v_*
*_3.- :D ${user(c)} :D_*
*_4.- Owo ${user(d)} Owo_*
*_5.- U.u ${user(e)} U.u_*
*_6.- >:v ${user(f)} >:v_*
*_7.- :'v ${user(g)} :'v_*
*_8.- ._. ${user(h)} ._._*
*_9.- :V ${user(i)} :V_*
*_10.- XD ${user(j)} XD_*`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------
   
if (command == 'toppanafrescos' || command == 'toppanafresco') {
let top = `*_👊TOP 10 PANAFRESCOS👊_* 
    
*_1.- 🤑 ${user(a)}_* 🤑
*_2.- 🤙 ${user(b)}_* 🤙
*_3.- 😎 ${user(c)}_* 😎
*_4.- 👌 ${user(d)}_* 👌
*_5.- 🧐 ${user(e)}_* 🧐
*_6.- 😃 ${user(f)}_* 😃
*_7.- 😋 ${user(g)}_* 😋
*_8.- 🤜 ${user(h)}_* 🤜
*_9.- 💪 ${user(i)}_* 💪
*_10.- 😉 ${user(j)}_* 😉`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------
   
if (command == 'topshiposters' || command == 'topshipost') {
let top = `*_😱TOP 10 SHIPOSTERS DEL GRUPO😱_* 
    
*_1.- 😈 ${user(a)}_* 😈
*_2.- 🤙 ${user(b)}_* 🤙
*_3.- 🥶 ${user(c)}_* 🥶
*_4.- 🤑 ${user(d)}_* 🤑
*_5.- 🥵 ${user(e)}_* 🥵
*_6.- 🤝 ${user(f)}_* 🤝
*_7.- 😟 ${user(g)}_* 😟
*_8.- 😨 ${user(h)}_* 😨
*_9.- 😇 ${user(i)}_* 😇
*_10.- 🤠 ${user(j)}_* 🤠`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------  
   
if (command == 'toppajer@s') {
let top = `*_😏TOP L@S MAS PAJEROS/AS DEL GRUPO💦_* 
    
*_1.- 🥵 ${user(a)}_* 💦
*_2.- 🥵 ${user(b)}_* 💦
*_3.- 🥵 ${user(c)}_* 💦
*_4.- 🥵 ${user(d)}_* 💦
*_5.- 🥵 ${user(e)}_* 💦
*_6.- 🥵 ${user(f)}_* 💦
*_7.- 🥵 ${user(g)}_* 💦
*_8.- 🥵 ${user(h)}_* 💦
*_9.- 🥵 ${user(i)}_* 💦
*_10.- 🥵 ${user(j)}_* 💦`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------  
   
if (command == 'toplind@s' || command == 'toplindos') {
let top = `*_😳TOP L@S MAS LIND@S Y SEXIS DEL GRUPO😳_*
    
*_1.- ✨ ${user(a)}_* ✨
*_2.- ✨ ${user(b)}_* ✨
*_3.- ✨ ${user(c)}_* ✨
*_4.- ✨ ${user(d)}_* ✨
*_5.- ✨ ${user(e)}_* ✨
*_6.- ✨ ${user(f)}_* ✨
*_7.- ✨ ${user(g)}_* ✨
*_8.- ✨ ${user(h)}_* ✨
*_9.- ✨ ${user(i)}_* ✨
*_10.- ✨ ${user(j)}_* ✨`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------
   
if (command == 'topput@s') {
let top = `*_😏TOP L@S MAS PUT@S DEL GRUPO SON🔥_* 
    
*_1.- 👉 ${user(a)}_* 👌
*_2.- 👉 ${user(b)}_* 👌
*_3.- 👉 ${user(c)}_* 👌
*_4.- 👉 ${user(d)}_* 👌
*_5.- 👉 ${user(e)}_* 👌
*_6.- 👉 ${user(f)}_* 👌
*_7.- 👉 ${user(g)}_* 👌
*_8.- 👉 ${user(h)}_* 👌
*_9.- 👉 ${user(i)}_* 👌
*_10.- 👉 ${user(j)}_* 👌`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------   
   
if (command == 'topfamosos' || command == 'topfamos@s') {
let top = `*_🌟TOP PERSONAS FAMOSAS EN EL GRUPO🌟_* 
    
*_1.- 🛫 ${user(a)}_* 🛫
*_2.- 🥂 ${user(b)}_* 🥂
*_3.- 🤩 ${user(c)}_* 🤩
*_4.- 🛫 ${user(d)}_* 🛫
*_5.- 🥂 ${user(e)}_* 🥂
*_6.- 🤩 ${user(f)}_* 🤩
*_7.- 🛫 ${user(g)}_* 🛫
*_8.- 🥂 ${user(h)}_* 🥂
*_9.- 🤩 ${user(i)}_* 🤩
*_10.- 🛫 ${user(j)}_* 🛫`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------ 
   
if (command == 'topparejas' || command == 'top5parejas') {
let top = `*_😍 Las 5 maravillosas parejas del grupo 😍_*
    
*_1.- ${user(a)} 💘 ${user(b)}_* 
Que hermosa pareja 💖, me invitan a su Boda 🛐

*_2.- ${user(c)} 💘 ${user(d)}_*  
🌹 Ustedes se merecen lo mejor del mundo 💞

*_3.- ${user(e)} 💘 ${user(f)}_* 
Tan enamorados 😍, para cuando la familia 🥰

*_4.- ${user(g)} 💘 ${user(h)}_* 
💗 Decreto que ustedes son la pareja del Año 💗 

*_5.- ${user(i)} 💘 ${user(j)}_* 
Genial! 💝, están de Luna de miel 🥵✨❤️‍🔥`
m.reply(top, null, { mentions: conn.parseMention(top) })}
} catch (e) {
//await conn.reply(m.chat, `${lenguajeGB['smsMalError3']()}#report ${lenguajeGB['smsMensError2']()} ${usedPrefix + command}\n\n${wm}`, fkontak, m)
//console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`)
console.log(e)}}
handler.help = ["love", "gay2", "lesbiana", "pajero", "pajera", "puto", "puta", "manco", "manca", "rata", "prostituta", "prostituto", "amigorandom", "amistad", "regalar", "formarpareja", "gay", "personalidad", "pregunta", "ship", "topgays", "top", "topputos", "toplindos", "toppajer@s", "topshipost", "toppanafresco", "topgrasa", "topintegrantes", "topfamos@s", "topsostero", "top5parejas", "Doxxeo", "doxxeo", "follar"];
handler.tags = ['game'];
handler.command = /^love|gay2|lesbiana|pajero|pajera|puto|puta|manco|manca|rata|prostituta|prostituto|amigorandom|amistad|regalar|dar|enviar|meter|chupar|metersela|retar|formarpareja|formarparejas|gay|personalidad|pregunta|preguntas|apakah|ship|shippear|topgays|top|topputos|toplindos|toplind@s|toppajer@s|toppajeros|topshipost|topshiposters|toppanafresco|topgrasa|toppanafrescos|toplagrasa|topintegrante|topintegrantes|topotakus|topfamosos|topfamos@s|topsostero|topparejas|top5parejas|Doxxeo|doxxeo|doxxear|Doxxear|doxeo|doxear|doxxeame|doxeame|ruletas|ruleta|suerte|violar|follar/i
handler.register = true
export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
hours = (hours < 10) ? "0" + hours : hours
minutes = (minutes < 10) ? "0" + minutes : minutes
seconds = (seconds < 10) ? "0" + seconds : seconds
return hours + " Hora(s) " + minutes + " Minuto(s)"}

//conn.sendHydrated(m.chat, juego, wm, null, md, '𝙂𝙖𝙩𝙖𝘽𝙤𝙩-𝙈𝘿', null, null, [
//['𝙈𝙚𝙣𝙪 𝙅𝙪𝙚𝙜𝙤𝙨 | 𝙂𝙖𝙢𝙚𝙨 𝙈𝙚𝙣𝙪 🎡', '#juegosmenu'],
//['𝙊𝙩𝙧𝙖 𝙫𝙚𝙯 | 𝘼𝙜𝙖𝙞𝙣 🤭', `${usedPrefix + command} ${text.toUpperCase()}`],
//['𝙑𝙤𝙡𝙫𝙚𝙧 𝙖𝙡 𝙈𝙚𝙣𝙪́ | 𝘽𝙖𝙘𝙠 𝙩𝙤 𝙈𝙚𝙣𝙪 ☘️', '/menu']
//], m, m.mentionedJid ? {
//mentions: m.mentionedJid
//} : {})} *_9.- :V @${i.split('@')[0]} :V_*
*_10.- XD @${j.split('@')[0]} XD_*`

      m.reply(top, null, { mentions })
   }


   if (command == 'toppanafrescos' || command == 'toppanafresco') {
      let top = `*_👊TOP 10 PANAFRESCOS👊_* 
    
*_1.- 🤑 @${a.split('@')[0]}_* 🤑
*_2.- 🤙 @${b.split('@')[0]}_* 🤙
*_3.- 😎 @${c.split('@')[0]}_* 😎
*_4.- 👌 @${d.split('@')[0]}_* 👌
*_5.- 🧐 @${e.split('@')[0]}_* 🧐
*_6.- 😃 @${f.split('@')[0]}_* 😃
*_7.- 😋 @${g.split('@')[0]}_* 😋
*_8.- 🤜 @${h.split('@')[0]}_* 🤜
*_9.- 💪 @${i.split('@')[0]}_* 💪
*_10.- 😉 @${j.split('@')[0]}_* 😉`

      m.reply(top, null, { mentions })
   }


   if (command == 'topshiposters' || command == 'topshipost') {
      let top = `*_😱TOP 10 SHIPOSTERS DEL GRUPO😱_* 
    
*_1.- 😈 @${a.split('@')[0]}_* 😈
*_2.- 🤙 @${b.split('@')[0]}_* 🤙
*_3.- 🥶 @${c.split('@')[0]}_* 🥶
*_4.- 🤑 @${d.split('@')[0]}_* 🤑
*_5.- 🥵 @${e.split('@')[0]}_* 🥵
*_6.- 🤝 @${f.split('@')[0]}_* 🤝
*_7.- 😟 @${g.split('@')[0]}_* 😟
*_8.- 😨 @${h.split('@')[0]}_* 😨
*_9.- 😇 @${i.split('@')[0]}_* 😇
*_10.- 🤠 @${j.split('@')[0]}_* 🤠`

      m.reply(top, null, { mentions })
   }

}

handler.help = ['topgays','topotakus','topintegrantes','topintegrante','toplagrasa','topgrasa','toppanafrescos','toppanafresco','topshiposters','topshipost']
handler.tags = ['games']
handler.command = ['topgays','topotakus','topintegrantes','topintegrante','toplagrasa','topgrasa','toppanafrescos','toppanafresco','topshiposters','topshipost']
handler.group = true

export default handler
