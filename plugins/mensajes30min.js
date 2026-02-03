let rutinaIniciada = false

// 🧠🔥 FRASES GOD (IA + RUTINA + FREE FIRE)
const frases = [
  // Mentalidad & disciplina
  '🧠 La disciplina es hacer lo correcto incluso cuando nadie te mira.',
  '🔥 No siempre ganas, pero siempre aprendes.',
  '⏳ El tiempo no vuelve, aprovéchalo.',
  '💡 Tu mente es tu mejor arma, entrénala.',
  '🚀 El progreso lento sigue siendo progreso.',
  '📈 La constancia construye lo que la motivación no puede.',
  '🧘 Respira, enfócate y ejecuta.',
  '🛠️ El éxito es rutina, no suerte.',
  '✨ Hoy duele, mañana agradeces.',
  '🧠 Si tu mente se rinde, el cuerpo la sigue.',

  // Free Fire mindset
  '🎮 En Free Fire como en la vida: si no te mueves, te eliminan.',
  '🔥 No campees tus sueños, rushea por ellos.',
  '💥 Cada derrota es práctica encubierta.',
  '🎯 Headshot mental primero, lo demás cae solo.',
  '🧠 El mejor jugador no es el que más mata, sino el que mejor decide.',
  '⚡ No siempre ganas la partida, pero ganas experiencia.',
  '🎮 Juega inteligente, no desesperado.',
  '🔥 El que abandona temprano nunca llega a Heroico.',
  '💣 Aprende de cada caída, no del rage quit.',
  '🏆 Heroico no es rango, es mentalidad.',

  // Rutina diaria
  '⏰ Lo que haces todos los días define quién eres.',
  '📚 Entrena tu mente como entrenas tus skills.',
  '🔥 La rutina vence al talento sin disciplina.',
  '🧠 Un día flojo se vuelve hábito si lo repites.',
  '🚀 Mejora 1% diario y serás imparable.',
  '🛠️ El hábito correcto en silencio crea resultados ruidosos.',
  '💡 Nadie ve el proceso, todos ven el resultado.',
  '⏳ Si esperas motivación, ya perdiste tiempo.',
  '🔥 La constancia siempre gana la partida.',
  '✨ Hoy es un buen día para no rendirse.',

  // Mentalidad GOD
  '👑 El verdadero poder es el autocontrol.',
  '🔥 No compitas con otros, supérate a ti mismo.',
  '🧠 El silencio también es estrategia.',
  '🎯 Enfócate, ejecuta, repite.',
  '🚀 La diferencia entre pros y casuales es la disciplina.',
  '💥 El miedo se elimina con acción.',
  '🛠️ Los hábitos ganan batallas que la motivación pierde.',
  '✨ No todos entienden tu proceso, sigue igual.',
  '⏳ Cada minuto cuenta, úsalo.',
  '👑 La mentalidad correcta te lleva más lejos que el talento.'
]

// ⏱️ Rutina global automática
const iniciarRutinaGlobal = (conn) => {
  if (rutinaIniciada) return
  rutinaIniciada = true

  setInterval(async () => {
    try {
      // Obtener todos los grupos (activos o no)
      const grupos = Object.keys(conn.chats || {})
        .filter(jid => jid.endsWith('@g.us'))

      if (!grupos.length) return

      const frase = frases[Math.floor(Math.random() * frases.length)]

      for (const jid of grupos) {
        try {
          await conn.sendMessage(jid, { text: frase })
        } catch (e) {
          console.error('Error enviando a grupo:', jid)
        }
      }
    } catch (e) {
      console.error('Error rutina global:', e)
    }
  }, 30 * 60 * 1000) // ⏰ 30 minutos
}

// ⚙️ Hook automático (se ejecuta una sola vez)
const handler = async (m, { conn }) => {
  iniciarRutinaGlobal(conn)
}

handler.all = true
export default handler
