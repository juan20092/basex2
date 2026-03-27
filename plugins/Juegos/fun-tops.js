import fetch from 'node-fetch';

let handler = async (m, { conn, metadata, command, text, participants, usedPrefix }) => {
    try {
        // ============================================================
        // FILTRAR PARTICIPANTES VÁLIDOS (IGUAL QUE EN EL PRIMER CÓDIGO)
        // ============================================================
        let validParticipants = metadata.participants
            .filter(p => p.id && !p.id.includes('newsletter') && !p.id.includes('broadcast') && p.id !== conn.user.jid)
            .map(p => p.id)
        
        if (validParticipants.length === 0) {
            return m.reply('❌ No hay participantes válidos en el grupo.')
        }
        
        // Función para obtener participantes aleatorios SIN duplicados
        function getRandomParticipants(count) {
            let shuffled = [...validParticipants]
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
            }
            return shuffled.slice(0, count)
        }
        
        // Obtener 10 participantes aleatorios (como en el primer código, pero sin duplicados)
        let randomParticipants = getRandomParticipants(10)
        let [a, b, c, d, e, f, g, h, i, j] = randomParticipants
        
        // Si no hay suficientes, completar con el sender
        while (randomParticipants.length < 10) {
            randomParticipants.push(m.sender)
        }
        
        // ============================================================
        // COMANDO: amistad / amigorandom
        // ============================================================
        if (command == 'amistad' || command == 'amigorandom') {
            let textMsg = `*🔰 Vamos a hacer algunas amistades 🔰*\n\n*Oye @${a.split('@')[0]} hablale al privado a @${b.split('@')[0]} para que jueguen y se haga una amistad 🙆*\n\n*Las mejores amistades empiezan con un juego 😉*`
            
            await conn.sendMessage(m.chat, {
                text: textMsg,
                mentions: [a, b]  // ✅ IGUAL QUE EL PRIMER CÓDIGO
            })
        }
        
        // ============================================================
        // COMANDO: formarpareja / formarparejas
        // ============================================================
        if (command == 'formarpareja' || command == 'formarparejas') {
            let textMsg = `*@${a.split('@')[0]}, 𝙔𝙖 𝙚𝙨 𝙝𝙤𝙧𝙖 𝙙𝙚 𝙦𝙪𝙚 𝙩𝙚 💍 𝘾𝙖𝙨𝙚𝙨 𝙘𝙤𝙣 @${b.split('@')[0]}, 𝙇𝙞𝙣𝙙𝙖 𝙋𝙖𝙧𝙚𝙟𝙖 😉💓*`
            
            await conn.sendMessage(m.chat, {
                text: textMsg,
                mentions: [a, b]  // ✅ IGUAL QUE EL PRIMER CÓDIGO
            })
        }
        
        // ============================================================
        // COMANDO: personalidad (CORREGIDO)
        // ============================================================
        if (command == 'personalidad') {
            let user = m.mentionedJid[0] || m.quoted?.sender || m.sender
            
            // Verificar que el usuario exista en el grupo
            if (!validParticipants.includes(user) && user !== m.sender) {
                return m.reply(`⚠️ El usuario @${user.split('@')[0]} no está en el grupo o no es válido.`, null, { mentions: [user] })
            }
            
            let userName = user.split('@')[0]
            
            let personalidad = `┏━━°❀❬ *PERSONALIDAD* ❭❀°━━┓
*┃*
*┃• Nombre* : @${userName}
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
            
            await conn.sendMessage(m.chat, {
                text: personalidad,
                mentions: [user]  // ✅ IGUAL QUE EL PRIMER CÓDIGO
            })
        }
        
        // ============================================================
        // COMANDOS DE PORCENTAJE (gay2, lesbiana, pajero, etc.)
        // ============================================================
        const percentageCommands = ['gay2', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituto', 'prostituta']
        
        if (percentageCommands.includes(command)) {
            if (!text && !m.mentionedJid[0] && !m.quoted) 
                return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag`)
            
            let user = m.mentionedJid[0] || m.quoted?.sender || m.sender
            let userName = user.split('@')[0]
            let percentage = Math.floor(Math.random() * 100) + 1
            
            let emoji = {
                'gay2': '🏳️‍🌈', 'lesbiana': '🏳️‍🌈', 'pajero': '😏💦', 'pajera': '😏💦',
                'puto': '🔥🥵', 'puta': '🔥🥵', 'manco': '💩', 'manca': '💩',
                'rata': '🐁', 'prostituto': '🫦👅', 'prostituta': '🫦👅'
            }
            
            let extraText = {
                'puto': ', MÁS INFORMACIÓN A SU PRIVADO 🔥🥵 XD',
                'puta': ', MÁS INFORMACIÓN A SU PRIVADO 🔥🥵 XD',
                'rata': ' COME QUESO 🧀',
                'prostituto': ', QUIEN QUIERE DE SUS SERVICIOS? XD',
                'prostituta': ', QUIEN QUIERE DE SUS SERVICIOS? XD'
            }
            
            let message = `_*@${userName}* *ES* *${percentage}%* *${command.toUpperCase()}* ${emoji[command] || ''}${extraText[command] || ''}_`
            
            await conn.sendMessage(m.chat, {
                text: message,
                mentions: [user]  // ✅ IGUAL QUE EL PRIMER CÓDIGO
            })
        }
        
        // ============================================================
        // COMANDO: love
        // ============================================================
        if (command == 'love') {
            if (!text && !m.mentionedJid[0] && !m.quoted) 
                return m.reply(`🤔 𝙋𝙚𝙣𝙙𝙚𝙟𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙨 𝙖 𝙡𝙖 𝙥𝙚𝙧𝙨𝙤𝙣𝙖 𝙘𝙤𝙣 𝙚𝙡 @Tag`)
            
            let user = m.mentionedJid[0] || m.quoted?.sender || m.sender
            let userName = user.split('@')[0]
            
            let message = ` *❤️❤️ MEDIDOR DE AMOR ❤️❤️* \n*El amor de @${userName} por ti es de* *${Math.floor(Math.random() * 100)}%* *de un 100%*\n*Deberias pedirle que sea tu novia/o ?*`
            
            await conn.sendMessage(m.chat, {
                text: message,
                mentions: [user]  // ✅ IGUAL QUE EL PRIMER CÓDIGO
            })
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
            m.reply(love)
        }
        
        // ============================================================
        // COMANDOS TOP (con menciones correctas)
        // ============================================================
        
        // Top Gays
        if (command == 'topgays') {
            let topText = `*🌈 TOP 10 GAYS/LESBIANAS DEL GRUPO 🌈*\n\n`
            let mentionsList = []
            
            let topParticipants = getRandomParticipants(10)
            topParticipants.forEach((jid, idx) => {
                let name = jid.split('@')[0]
                let emoji = idx % 2 === 0 ? '🏳️‍🌈' : (idx % 3 === 0 ? '🪂' : '🪁')
                topText += `*${idx + 1}.- ${emoji} @${name} ${emoji}*\n`
                mentionsList.push(jid)
            })
            
            await conn.sendMessage(m.chat, {
                text: topText,
                mentions: mentionsList  // ✅ IGUAL QUE EL PRIMER CÓDIGO
            })
        }
        
        // Top Otakus
        if (command == 'topotakus') {
            let topText = `*🌸 TOP 10 OTAKUS DEL GRUPO 🌸*\n\n`
            let mentionsList = []
            
            let topParticipants = getRandomParticipants(10)
            topParticipants.forEach((jid, idx) => {
                let name = jid.split('@')[0]
                let emoji = idx % 2 === 0 ? '💮' : '🌷'
                topText += `*${idx + 1}.- ${emoji} @${name} ${emoji}*\n`
                mentionsList.push(jid)
            })
            
            await conn.sendMessage(m.chat, {
                text: topText,
                mentions: mentionsList  // ✅ IGUAL QUE EL PRIMER CÓDIGO
            })
        }
        
        // Top Integrantes
        if (command == 'topintegrantes' || command == 'topintegrante') {
            let topText = `*💎 TOP 10 L@S MEJORES INTEGRANTES 👑*\n\n`
            let mentionsList = []
            
            let topParticipants = getRandomParticipants(10)
            topParticipants.forEach((jid, idx) => {
                let name = jid.split('@')[0]
                let emoji = idx % 2 === 0 ? '💎' : '👑'
                topText += `*${idx + 1}.- ${emoji} @${name} ${emoji}*\n`
                mentionsList.push(jid)
            })
            
            await conn.sendMessage(m.chat, {
                text: topText,
                mentions: mentionsList  // ✅ IGUAL QUE EL PRIMER CÓDIGO
            })
        }
        
        // Top genérico
        if (command == 'top') {
            if (!text) return m.reply(`𝙔 𝙚𝙡 𝙩𝙚𝙭𝙩𝙤? 🤔\n📍 Ejemplo: ${usedPrefix}top nedro`)
            
            let randomEmoji = pickRandom(['🤓','😅','😂','😳','😎', '🥵', '😱', '🤑', '🙄', '💩','🍑','🤨','🥴','🔥','👇🏻','😔', '👀','🌚'])
            let topText = `*${randomEmoji} Top 10 ${text} ${randomEmoji}*\n\n`
            let mentionsList = []
            
            let topParticipants = getRandomParticipants(10)
            topParticipants.forEach((jid, idx) => {
                let name = jid.split('@')[0]
                topText += `*${idx + 1}. @${name}*\n`
                mentionsList.push(jid)
            })
            
            await conn.sendMessage(m.chat, {
                text: topText,
                mentions: mentionsList  // ✅ IGUAL QUE EL PRIMER CÓDIGO
            })
        }
        
        // ============================================================
        // COMANDO: gay (con imagen y audio)
        // ============================================================
        if (command == 'gay') {
            let user = m.mentionedJid[0] || m.quoted?.sender || m.sender
            let userName = user.split('@')[0]
            let randomPercent = Math.floor(Math.random() * 100) + 1
            
            let messageText
            if (randomPercent <= 20) messageText = 'Usted es hetero 🤪🤙'
            else if (randomPercent <= 40) messageText = 'Mas o menos 🤔'
            else if (randomPercent <= 60) messageText = 'Tengo mis dudas 😑'
            else if (randomPercent <= 80) messageText = 'Tengo razón? 😏'
            else messageText = 'Usted es gay 🥸'
            
            let jawab = `@${userName} Es 🏳️‍🌈 ${randomPercent}% Gay\n\n${messageText}`
            
            try {
                const avatar = await conn.profilePictureUrl(user, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
                const imageRes = await fetch(`https://some-random-api.com/canvas/gay?avatar=${encodeURIComponent(avatar)}`)
                const buffer = await imageRes.buffer()
                
                await conn.sendMessage(m.chat, {
                    image: buffer,
                    caption: jawab,
                    mentions: [user]  // ✅ IGUAL QUE EL PRIMER CÓDIGO
                })
            } catch (e) {
                // Fallback a texto
                await conn.sendMessage(m.chat, {
                    text: jawab,
                    mentions: [user]  // ✅ IGUAL QUE EL PRIMER CÓDIGO
                })
            }
        }
        
    } catch (e) {
        console.error('❌ Error:', e)
        await m.reply(`❌ Hubo un error ejecutando el comando.`)
    }
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

handler.help = ["love", "gay2", "lesbiana", "pajero", "pajera", "puto", "puta", "manco", "manca", "rata", "prostituta", "prostituto", "amigorandom", "amistad", "formarpareja", "gay", "personalidad", "ship", "topgays", "top", "topintegrantes", "topotakus"]
handler.tags = ['game']
handler.command = /^love|gay2|lesbiana|pajero|pajera|puto|puta|manco|manca|rata|prostituta|prostituto|amigorandom|amistad|formarpareja|formarparejas|gay|personalidad|ship|shippear|topgays|top|topintegrantes|topintegrante|topotakus$/i
handler.group = true
handler.register = false

export default handler
