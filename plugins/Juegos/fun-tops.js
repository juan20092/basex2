import util from 'util'
import path from 'path' 

function handler(m, { groupMetadata, command, usedPrefix, conn }) {
   // ✅ Obtener participantes como en tagall
   let participants = groupMetadata.participants
   let ps = participants.map(v => v.id)
   
   // ✅ Seleccionar 10 ALEATORIOS (como en tagall pero con random)
   let getRandomParticipant = () => ps[Math.floor(Math.random() * ps.length)]
   
   let a = getRandomParticipant()
   let b = getRandomParticipant()
   let c = getRandomParticipant()
   let d = getRandomParticipant()
   let e = getRandomParticipant()
   let f = getRandomParticipant()
   let g = getRandomParticipant()
   let h = getRandomParticipant()
   let i = getRandomParticipant()
   let j = getRandomParticipant()

   // ✅ Array de menciones con los JIDs reales (como en tagall)
   let mentions = [a, b, c, d, e, f, g, h, i, j].filter(Boolean)

   if (command == 'topgays') {
      let vn = './media/gay2.mp3'
      let top = `*🌈TOP 10 GAYS/LESBIANAS DEL GRUPO🌈*
    
*_1.- 🏳️‍🌈 @${a.split('@')[0]}_* 🏳️‍🌈
*_2.- 🪂 @${b.split('@')[0]}_* 🪂
*_3.- 🪁 @${c.split('@')[0]}_* 🪁
*_4.- 🏳️‍🌈 @${d.split('@')[0]}_* 🏳️‍🌈
*_5.- 🪂 @${e.split('@')[0]}_* 🪂
*_6.- 🪁 @${f.split('@')[0]}_* 🪁
*_7.- 🏳️‍🌈 @${g.split('@')[0]}_* 🏳️‍🌈
*_8.- 🪂 @${h.split('@')[0]}_* 🪂
*_9.- 🪁 @${i.split('@')[0]}_* 🪁
*_10.- 🏳️‍🌈 @${j.split('@')[0]}_* 🏳️‍🌈`
      m.reply(top, null, { mentions })
      conn.sendFile(m.chat, vn, 'error.mp3', null, m, true, {
         type: 'audioMessage', 
         ptt: true 
      })
   }
    
   if (command == 'topotakus') {
      let vn = './media/otaku.mp3'
      let top = `*🌸 TOP 10 OTAKUS DEL GRUPO 🌸*
    
*_1.- 💮 @${a.split('@')[0]}_* 💮
*_2.- 🌷 @${b.split('@')[0]}_* 🌷
*_3.- 💮 @${c.split('@')[0]}_* 💮
*_4.- 🌷 @${d.split('@')[0]}_* 🌷
*_5.- 💮 @${e.split('@')[0]}_* 💮
*_6.- 🌷 @${f.split('@')[0]}_* 🌷
*_7.- 💮 @${g.split('@')[0]}_* 💮
*_8.- 🌷 @${h.split('@')[0]}_* 🌷
*_9.- 💮 @${i.split('@')[0]}_* 💮
*_10.- 🌷 @${j.split('@')[0]}_* 🌷`
      m.reply(top, null, { mentions })
      conn.sendFile(m.chat, vn, 'otaku.mp3', null, m, true, {
         type: 'audioMessage', 
         ptt: true 
      })
   }
   
   if (command == 'topintegrantes' || command == 'topintegrante') {
      let top = `*_💎TOP 10 L@S MEJORES INTEGRANTES👑_*
    
*_1.- 💎 @${a.split('@')[0]}_* 💎
*_2.- 👑 @${b.split('@')[0]}_* 👑
*_3.- 💎 @${c.split('@')[0]}_* 💎
*_4.- 👑 @${d.split('@')[0]}_* 👑
*_5.- 💎 @${e.split('@')[0]}_* 💎
*_6.- 👑 @${f.split('@')[0]}_* 👑
*_7.- 💎 @${g.split('@')[0]}_* 💎
*_8.- 👑 @${h.split('@')[0]}_* 👑
*_9.- 💎 @${i.split('@')[0]}_* 💎
*_10.- 👑 @${j.split('@')[0]}_* 👑`
      m.reply(top, null, { mentions })
   }
   
   if (command == 'toplagrasa' || command == 'topgrasa') {
      let top = `*_Uwu TOP 10 LA GRASA Uwu_* 
    
*_1.- Bv @${a.split('@')[0]} Bv_*
*_2.- :v @${b.split('@')[0]} :v_*
*_3.- :D @${c.split('@')[0]} :D_*
*_4.- Owo @${d.split('@')[0]} Owo_*
*_5.- U.u @${e.split('@')[0]} U.u_*
*_6.- >:v @${f.split('@')[0]} >:v_*
*_7.- :'v @${g.split('@')[0]} :'v_*
*_8.- ._. @${h.split('@')[0]} ._._*
*_9.- :V @${i.split('@')[0]} :V_*
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
   
   if (command == 'toppajer@s') {
      let top = `*_😏TOP L@S MAS PAJEROS/AS DEL GRUPO💦_* 
    
*_1.- 🥵 @${a.split('@')[0]}_* 💦
*_2.- 🥵 @${b.split('@')[0]}_* 💦
*_3.- 🥵 @${c.split('@')[0]}_* 💦
*_4.- 🥵 @${d.split('@')[0]}_* 💦
*_5.- 🥵 @${e.split('@')[0]}_* 💦
*_6.- 🥵 @${f.split('@')[0]}_* 💦
*_7.- 🥵 @${g.split('@')[0]}_* 💦
*_8.- 🥵 @${h.split('@')[0]}_* 💦
*_9.- 🥵 @${i.split('@')[0]}_* 💦
*_10.- 🥵 @${j.split('@')[0]}_* 💦`
      m.reply(top, null, { mentions })
   }
   
   if (command == 'toplind@s' || command == 'toplindos') {
      let top = `*_😳TOP L@S MAS LIND@S Y SEXIS DEL GRUPO😳_*
    
*_1.- ✨ @${a.split('@')[0]}_* ✨
*_2.- ✨ @${b.split('@')[0]}_* ✨
*_3.- ✨ @${c.split('@')[0]}_* ✨
*_4.- ✨ @${d.split('@')[0]}_* ✨
*_5.- ✨ @${e.split('@')[0]}_* ✨
*_6.- ✨ @${f.split('@')[0]}_* ✨
*_7.- ✨ @${g.split('@')[0]}_* ✨
*_8.- ✨ @${h.split('@')[0]}_* ✨
*_9.- ✨ @${i.split('@')[0]}_* ✨
*_10.- ✨ @${j.split('@')[0]}_* ✨`
      m.reply(top, null, { mentions })
   }
   
   if (command == 'topput@s') {
      let top = `*_😏TOP L@S MAS PUT@S DEL GRUPO SON🔥_* 
    
*_1.- 👉 @${a.split('@')[0]}_* 👌
*_2.- 👉 @${b.split('@')[0]}_* 👌
*_3.- 👉 @${c.split('@')[0]}_* 👌
*_4.- 👉 @${d.split('@')[0]}_* 👌
*_5.- 👉 @${e.split('@')[0]}_* 👌
*_6.- 👉 @${f.split('@')[0]}_* 👌
*_7.- 👉 @${g.split('@')[0]}_* 👌
*_8.- 👉 @${h.split('@')[0]}_* 👌
*_9.- 👉 @${i.split('@')[0]}_* 👌
*_10.- 👉 @${j.split('@')[0]}_* 👌`
      m.reply(top, null, { mentions })
   }
   
   if (command == 'topfamosos' || command == 'topfamos@s') {
      let top = `*_🌟TOP PERSONAS FAMOSAS EN EL GRUPO🌟_* 
    
*_1.- 🛫 @${a.split('@')[0]}_* 🛫
*_2.- 🥂 @${b.split('@')[0]}_* 🥂
*_3.- 🤩 @${c.split('@')[0]}_* 🤩
*_4.- 🛫 @${d.split('@')[0]}_* 🛫
*_5.- 🥂 @${e.split('@')[0]}_* 🥂
*_6.- 🤩 @${f.split('@')[0]}_* 🤩
*_7.- 🛫 @${g.split('@')[0]}_* 🛫
*_8.- 🥂 @${h.split('@')[0]}_* 🥂
*_9.- 🤩 @${i.split('@')[0]}_* 🤩
*_10.- 🛫 @${j.split('@')[0]}_* 🛫`
      m.reply(top, null, { mentions })
   }
   
   if (command == 'topparejas' || command == 'top5parejas' || command == 'top2parejas') {
      let top = `*_😍 Las 5 maravillosas parejas del grupo 😍_*
    
*_1.- @${a.split('@')[0]} 💘 @${b.split('@')[0]}_* 
Que hermosa pareja 💖, me invitan a su Boda 🛐

*_2.- @${c.split('@')[0]} 💘 @${d.split('@')[0]}_*  
🌹 Ustedes se merecen lo mejor del mundo 💞

*_3.- @${e.split('@')[0]} 💘 @${f.split('@')[0]}_* 
Tan enamorados 😍, para cuando la familia 🥰

*_4.- @${g.split('@')[0]} 💘 @${h.split('@')[0]}_* 
💗 Decreto que ustedes son la pareja del Año 💗 

*_5.- @${i.split('@')[0]} 💘 @${j.split('@')[0]}_* 
Genial! 💝, están de Luna de miel 🥵✨❤️‍🔥`
      
      if (command == 'top2parejas') {
         top = `*_😍 Las 2 maravillosas parejas del grupo 😍_*
    
*_1.- @${a.split('@')[0]} 💘 @${b.split('@')[0]}_* 
Que hermosa pareja 💖, me invitan a su Boda 🛐

*_2.- @${c.split('@')[0]} 💘 @${d.split('@')[0]}_*  
🌹 Ustedes se merecen lo mejor del mundo 💞`
      }
      
      m.reply(top, null, { mentions })
   }
}

handler.help = ['topgays', 'topotakus', 'topintegrantes', 'topintegrante', 'toplagrasa', 'topgrasa', 'toppanafrescos', 'toppanafresco', 'topshiposters', 'topshipost', 'toppajer@s', 'toplindos', 'toplind@s', 'topput@s', 'topfamosos', 'topfamos@s', 'topparejas', 'top5parejas']
handler.tags = ['games']
handler.command = ['topgays', 'topotakus', 'topintegrantes', 'topintegrante', 'toplagrasa', 'topgrasa', 'toppanafrescos', 'toppanafresco', 'topshiposters', 'topshipost', 'toppajer@s', 'toplindos', 'toplind@s', 'topput@s', 'topfamosos', 'topfamos@s', 'topparejas', 'top5parejas']
handler.group = true

export default handler   if (command == 'topshiposters' || command == 'topshipost') {
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
   
   if (command == 'toppajer@s') {
      let top = `*_😏TOP L@S MAS PAJEROS/AS DEL GRUPO💦_* 
    
*_1.- 🥵 @${a.split('@')[0]}_* 💦
*_2.- 🥵 @${b.split('@')[0]}_* 💦
*_3.- 🥵 @${c.split('@')[0]}_* 💦
*_4.- 🥵 @${d.split('@')[0]}_* 💦
*_5.- 🥵 @${e.split('@')[0]}_* 💦
*_6.- 🥵 @${f.split('@')[0]}_* 💦
*_7.- 🥵 @${g.split('@')[0]}_* 💦
*_8.- 🥵 @${h.split('@')[0]}_* 💦
*_9.- 🥵 @${i.split('@')[0]}_* 💦
*_10.- 🥵 @${j.split('@')[0]}_* 💦`
      m.reply(top, null, { mentions })
   }
   
   if (command == 'toplind@s' || command == 'toplindos') {
      let top = `*_😳TOP L@S MAS LIND@S Y SEXIS DEL GRUPO😳_*
    
*_1.- ✨ @${a.split('@')[0]}_* ✨
*_2.- ✨ @${b.split('@')[0]}_* ✨
*_3.- ✨ @${c.split('@')[0]}_* ✨
*_4.- ✨ @${d.split('@')[0]}_* ✨
*_5.- ✨ @${e.split('@')[0]}_* ✨
*_6.- ✨ @${f.split('@')[0]}_* ✨
*_7.- ✨ @${g.split('@')[0]}_* ✨
*_8.- ✨ @${h.split('@')[0]}_* ✨
*_9.- ✨ @${i.split('@')[0]}_* ✨
*_10.- ✨ @${j.split('@')[0]}_* ✨`
      m.reply(top, null, { mentions })
   }
   
   if (command == 'topput@s') {
      let top = `*_😏TOP L@S MAS PUT@S DEL GRUPO SON🔥_* 
    
*_1.- 👉 @${a.split('@')[0]}_* 👌
*_2.- 👉 @${b.split('@')[0]}_* 👌
*_3.- 👉 @${c.split('@')[0]}_* 👌
*_4.- 👉 @${d.split('@')[0]}_* 👌
*_5.- 👉 @${e.split('@')[0]}_* 👌
*_6.- 👉 @${f.split('@')[0]}_* 👌
*_7.- 👉 @${g.split('@')[0]}_* 👌
*_8.- 👉 @${h.split('@')[0]}_* 👌
*_9.- 👉 @${i.split('@')[0]}_* 👌
*_10.- 👉 @${j.split('@')[0]}_* 👌`
      m.reply(top, null, { mentions })
   }
   
   if (command == 'topfamosos' || command == 'topfamos@s') {
      let top = `*_🌟TOP PERSONAS FAMOSAS EN EL GRUPO🌟_* 
    
*_1.- 🛫 @${a.split('@')[0]}_* 🛫
*_2.- 🥂 @${b.split('@')[0]}_* 🥂
*_3.- 🤩 @${c.split('@')[0]}_* 🤩
*_4.- 🛫 @${d.split('@')[0]}_* 🛫
*_5.- 🥂 @${e.split('@')[0]}_* 🥂
*_6.- 🤩 @${f.split('@')[0]}_* 🤩
*_7.- 🛫 @${g.split('@')[0]}_* 🛫
*_8.- 🥂 @${h.split('@')[0]}_* 🥂
*_9.- 🤩 @${i.split('@')[0]}_* 🤩
*_10.- 🛫 @${j.split('@')[0]}_* 🛫`
      m.reply(top, null, { mentions })
   }
   
   if (command == 'topparejas' || command == 'top5parejas' || command == 'top2parejas') {
      let top = `*_😍 Las 5 maravillosas parejas del grupo 😍_*
    
*_1.- @${a.split('@')[0]} 💘 @${b.split('@')[0]}_* 
Que hermosa pareja 💖, me invitan a su Boda 🛐

*_2.- @${c.split('@')[0]} 💘 @${d.split('@')[0]}_*  
🌹 Ustedes se merecen lo mejor del mundo 💞

*_3.- @${e.split('@')[0]} 💘 @${f.split('@')[0]}_* 
Tan enamorados 😍, para cuando la familia 🥰

*_4.- @${g.split('@')[0]} 💘 @${h.split('@')[0]}_* 
💗 Decreto que ustedes son la pareja del Año 💗 

*_5.- @${i.split('@')[0]} 💘 @${j.split('@')[0]}_* 
Genial! 💝, están de Luna de miel 🥵✨❤️‍🔥`
      if (command == 'top2parejas') {
         top = `*_😍 Las 5 maravillosas parejas del grupo 😍_*
    
*_1.- @${a.split('@')[0]} 💘 @${b.split('@')[0]}_* 
Que hermosa pareja 💖, me invitan a su Boda 🛐

*_2.- @${c.split('@')[0]} 💘 @${d.split('@')[0]}_*  
🌹 Ustedes se merecen lo mejor del mundo 💞`
      }
      m.reply(top, null, { mentions })
   }
}

handler.help = handler.command = ['topgays', 'topotakus', 'topintegrantes', 'topintegrante', 'toplagrasa', 'topgrasa', 'toppanafrescos', 'toppanafresco', 'topshiposters', 'topshipost', 'toppajer@s', 'toplindos', 'toplind@s', 'topput@s', 'topfamosos', 'topfamos@s', 'topparejas', 'top5parejas' ]
handler.tags = ['games']
handler.group = true
export default handler
