import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from 'ytdl-core'
import axios from 'axios'
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) throw `¿Qué canción quieres descargar?\n\nUso:\n${usedPrefix + command} nombre del video o artista`

  try {
    await m.react('🕓')

    // 🔹 Búsqueda en YouTube
    const yt_play = await search(args.join(" "))
    const video = yt_play[0]
    if (!video) throw "No se encontró ningún video con ese término."

    const v = video.url

    // 🔹 ENVÍO DE MINIATURA CON BARRA DE PROGRESO (como en tu código)
    await conn.sendMessage(m.chat, {
      text: `01:27 ━━━━━⬤──── 05:48\n*⇄ㅤ   ◁   ㅤ  ❚❚ㅤ     ▷ㅤ   ↻*\n𝙀𝙡𝙞𝙩𝙚 𝘽𝙤𝙩 𝙂𝙡𝙤𝙗𝙖𝙡`,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: "Descargando audio...",
          thumbnailUrl: video.thumbnail,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    await m.react('✅')

    // 🔹 DESCARGA PRINCIPAL CON SANKA VOLLEREI (del primer código)
    try {
      const sanka = await getFromSanka(v)
      const fileName = `${sanitizeFilename(sanka.title || video.title)}.mp3`
      
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: sanka.download },
          mimetype: 'audio/mpeg',
          fileName: fileName
        },
        { quoted: m }
      )
      
    } catch (sankaError) {
      console.log("❌ Error en Sanka, intentando método alternativo...")
      
      // 🔹 MÉTODOS ALTERNATIVOS (de tu segundo código)
      try {
        // Método 1 - Bochilteam Scraper
        let q = '128kbps'
        const yt = await youtubedl(v).catch(async _ => await youtubedlv2(v))
        const dl_url = await yt.audio[q].download()
        const ttl = await yt.title
        
        await conn.sendMessage(
          m.chat, 
          { 
            audio: { url: dl_url }, 
            mimetype: 'audio/mpeg',
            fileName: `${ttl}.mp3`
          }, 
          { quoted: m }
        )
        
      } catch {
        try {
          // Método 2 - API Akuari
          const dataRE = await fetch(`https://api.akuari.my.id/downloader/youtube?link=${v}`)
          const dataRET = await dataRE.json()
          
          await conn.sendMessage(
            m.chat, 
            { 
              audio: { url: dataRET.mp3[1].url }, 
              mimetype: 'audio/mpeg' 
            }, 
            { quoted: m }
          )
          
        } catch {
          try {
            // Método 3 - API Lolhuman (búsqueda)
            let humanLol = await fetch(`https://api.lolhuman.xyz/api/ytplay?apikey=${global.lolkeysapi}&query=${video.title}`)
            let humanRET = await humanLol.json()
            
            await conn.sendMessage(
              m.chat, 
              { 
                audio: { url: humanRET.result.audio.link }, 
                mimetype: 'audio/mpeg' 
              }, 
              { quoted: m }
            )
            
          } catch {
            try {
              // Método 4 - API Lolhuman (URL directa)
              let lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytaudio2?apikey=${global.lolkeysapi}&url=${v}`)
              let lolh = await lolhuman.json()
              
              await conn.sendMessage(
                m.chat, 
                { 
                  audio: { url: lolh.result.link }, 
                  mimetype: 'audio/mpeg' 
                }, 
                { quoted: m }
              )
              
            } catch {
              try {
                // Método 5 - ytdl-core directo (último recurso)
                let searchh = await yts(v)
                let __res = searchh.all.map(v => v).filter(v => v.type == "video")
                let infoo = await ytdl.getInfo('https://youtu.be/' + __res[0].videoId)
                let ress = await ytdl.chooseFormat(infoo.formats, { filter: 'audioonly' })
                
                await conn.sendMessage(
                  m.chat, 
                  { 
                    audio: { url: ress.url }, 
                    mimetype: 'audio/mpeg' 
                  }, 
                  { quoted: m }
                )
                
              } catch (finalError) {
                await m.reply(`⚠️ Error en todos los métodos: ${finalError.message}`)
              }
            }
          }
        }
      }
    }

  } catch (error) {
    console.error(error)
    await m.reply(`❌ Error general: ${error.message}`)
  }
}

handler.command = ['play2']
handler.exp = 0
export default handler

// 🔹 FUNCIONES AUXILIARES

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: "es", gl: "ES", ...options })
  return search.videos
}

function sanitizeFilename(name = "audio") {
  return String(name).replace(/[\\/:*?"<>|]/g, "").slice(0, 200)
}

// 🔹 Función para usar Sanka Vollerei (del primer código)
async function getFromSanka(youtubeUrl) {
  const endpoint = `https://www.sankavollerei.com/download/ytmp3?apikey=planaai&url=${encodeURIComponent(youtubeUrl)}`
  const res = await fetch(endpoint)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const json = await res.json().catch(() => null)
  if (!json?.status || !json?.result?.download) {
    throw new Error("Respuesta inválida de Sanka Vollerei")
  }

  return {
    download: json.result.download,
    title: json.result.title,
    duration: json.result.duration,
    thumbnail: json.result.thumbnail
  }
}

// 🔹 Funciones adicionales de utilidad (de tu segundo código)
function MilesNumber(number) {
  const exp = /(\d)(?=(\d{3})+(?!\d))/g
  const rep = "$1."
  let arr = number.toString().split(".")
  arr[0] = arr[0].replace(exp, rep)
  return arr[1] ? arr.join(".") : arr[0]
}

function secondString(seconds) {
  seconds = Number(seconds)
  var d = Math.floor(seconds / (3600 * 24))
  var h = Math.floor((seconds % (3600 * 24)) / 3600)
  var m = Math.floor((seconds % 3600) / 60)
  var s = Math.floor(seconds % 60)
  var dDisplay = d > 0 ? d + (d == 1 ? " día, " : " días, ") : ""
  var hDisplay = h > 0 ? h + (h == 1 ? " hora, " : " horas, ") : ""
  var mDisplay = m > 0 ? m + (m == 1 ? " minuto, " : " minutos, ") : ""
  var sDisplay = s > 0 ? s + (s == 1 ? " segundo" : " segundos") : ""
  return dDisplay + hDisplay + mDisplay + sDisplay
}

function bytesToSize(bytes) {
  return new Promise((resolve, reject) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return 'n/a'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
    if (i === 0) resolve(`${bytes} ${sizes[i]}`)
    resolve(`${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`)
  })
    }
