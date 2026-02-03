const handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) {
    return m.reply('❌ Este comando es solo para el *creador del bot*.')
  }

  if (!text) {
    return m.reply('📢 Uso correcto:\n\n.comunicar <mensaje>')
  }

  // 📊 Contadores
  let botTotal = 0
  let botOk = 0

  let subTotal = 0
  let subOk = 0

  // 📌 función para enviar a grupos de una conexión
  const enviarAGrupos = async (conexion, tipo = 'bot') => {
    const chats = conexion.chats || {}

    const grupos = Object.keys(chats)
      .filter(jid => jid.endsWith('@g.us'))

    for (const jid of grupos) {
      try {
        await conexion.sendMessage(jid, { text })

        if (tipo === 'bot') botOk++
        else subOk++
      } catch (e) {
        // error silencioso
      }
    }

    if (tipo === 'bot') botTotal = grupos.length
    else subTotal += grupos.length
  }

  // 🟢 BOT PRINCIPAL
  await enviarAGrupos(conn, 'bot')

  // 🟣 SUBBOTS
  if (global.conns && Array.isArray(global.conns)) {
    for (const subbot of global.conns) {
      try {
        await enviarAGrupos(subbot, 'sub')
      } catch (e) {
        // ignora subbot caído
      }
    }
  }

  // 📊 Cálculos
  const botPorcentaje = botTotal
    ? Math.round((botOk / botTotal) * 100)
    : 0

  const subPorcentaje = subTotal
    ? Math.round((subOk / subTotal) * 100)
    : 0

  const totalGrupos = botTotal + subTotal
  const totalOk = botOk + subOk
  const totalPorcentaje = totalGrupos
    ? Math.round((totalOk / totalGrupos) * 100)
    : 0

  // 📣 REPORTE FINAL
  const reporte =
`📢 *COMUNICADO GENERAL ENVIADO*

🟢 *Bot principal*
• Grupos: ${botOk}/${botTotal}
• Efectividad: ${botPorcentaje}%

🟣 *Subbots*
• Grupos: ${subOk}/${subTotal}
• Efectividad: ${subPorcentaje}%

📊 *TOTAL GENERAL*
• Grupos: ${totalOk}/${totalGrupos}
• Efectividad: ${totalPorcentaje}%
`

  m.reply(reporte)
}

handler.help = ['comunicar <mensaje>']
handler.tags = ['owner']
handler.command = ['comunicar']
handler.owner = true

export default handler
