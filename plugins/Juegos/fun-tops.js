import util from 'util'
import path from 'path' 

function handler(m, { groupMetadata, command, usedPrefix, conn }) {

   // ✅ Obtener participantes reales
   let participants = groupMetadata.participants
   let ps = participants.map(v => v.id)

   // ✅ quitar duplicados
   ps = [...new Set(ps)]

   // ✅ mezclar lista
   ps = ps.sort(() => Math.random() - 0.5)

   // ✅ tomar 10 sin repetir
   let a = ps[0]
   let b = ps[1]
   let c = ps[2]
   let d = ps[3]
   let e = ps[4]
   let f = ps[5]
   let g = ps[6]
   let h = ps[7]
   let i = ps[8]
   let j = ps[9]

   let mentions = [a,b,c,d,e,f,g,h,i,j].filter(Boolean)


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

}

handler.help = ['topgays','topotakus','topintegrantes','topintegrante','toplagrasa','topgrasa','toppanafrescos','toppanafresco','topshiposters','topshipost']
handler.tags = ['games']
handler.command = ['topgays','topotakus','topintegrantes','topintegrante','toplagrasa','topgrasa','toppanafrescos','toppanafresco','topshiposters','topshipost']
handler.group = true

export default handler
