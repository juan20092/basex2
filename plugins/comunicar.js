let handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo el creador puede usar este comando')
  if (!text) return m.reply('⚠️ Escribe el mensaje del comunicado')

  let mensaje = `📢 *COMUNICADO GENERAL*\n\n${text}`

  let stats = []
  let totalEnviados = 0
  let totalGrupos = 0

  // ======================
  // BOT PRINCIPAL
  // ======================
  let gruposBot = Object.entries(conn.chats)
    .filter(([id, chat]) => id.endsWith('@g.us'))

  let enviadosBot = 0
  for (let [id] of gruposBot) {
    try {
      await conn.sendMessage(id, { text: mensaje })
      enviadosBot++
      totalEnviados++
    } catch {}
  }

  totalGrupos += gruposBot.length

  stats.push(
    `🤖 *Bot principal*\n` +
    `• Grupos: ${gruposBot.length}\n` +
    `• Enviados: ${enviadosBot}\n` +
    `• Efectividad: ${((enviadosBot / gruposBot.length) * 100 || 0).toFixed(1)}%`
  )

  // ======================
  // SUBBOTS
  // ======================
  let subbots = global.conns?.filter(sb => sb.user && sb.ws.readyState === 1) || []

  let index = 1
  for (let sb of subbots) {
    let gruposSub = Object.entries(sb.chats)
      .filter(([id]) => id.endsWith('@g.us'))

    let enviadosSub = 0
    for (let [id] of gruposSub) {
      try {
        await sb.sendMessage(id, { text: mensaje })
        enviadosSub++
        totalEnviados++
      } catch {}
    }

    totalGrupos += gruposSub.length

    stats.push(
      `🧩 *Subbot ${index}*\n` +
      `• Grupos: ${gruposSub.length}\n` +
      `• Enviados: ${enviadosSub}\n` +
      `• Efectividad: ${((enviadosSub / gruposSub.length) * 100 || 0).toFixed(1)}%`
    )

    index++
  }

  // ======================
  // REPORTE FINAL
  // ======================
  let reporte =
`✅ *COMUNICADO ENVIADO*

📊 *ESTADÍSTICAS GENERALES*
• Subbots activos: ${subbots.length}
• Total de grupos: ${totalGrupos}
• Total enviados: ${totalEnviados}
• Efectividad total: ${((totalEnviados / totalGrupos) * 100 || 0).toFixed(1)}%

━━━━━━━━━━━━━━
${stats.join('\n\n')}
━━━━━━━━━━━━━━`

  await m.reply(reporte)
}

handler.command = ['comunicar']
handler.owner = true
handler.group = false

export default handler
