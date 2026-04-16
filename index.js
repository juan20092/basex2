import { dirname, join } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { fork, setupMaster } from 'cluster'
import { unwatchFile, watchFile } from 'fs'
import cfonts from 'cfonts'
import { createInterface } from 'readline'
import yargs from 'yargs'
import express from 'express'
import chalk from 'chalk'
import path from 'path'
import os from 'os'
import { promises as fsPromises } from 'fs'

// https://stackoverflow.com/a/50052194
const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname) //Incorpora la capacidad de crear el método 'requerir'
const {name, author} = require(join(__dirname, './package.json')) //https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
const {say} = cfonts
const rl = createInterface(process.stdin, process.stdout)

//const app = express()
//const port = process.env.PORT || 8080;

say('vip\nBot\nMD', {
font: 'chrome',
align: 'center',
gradient: ['cyan', 'magenta']
})
say('✦ V I P   E D I T I O N ✦', {
font: 'console',
align: 'center',
gradient: ['magenta', 'cyan']
})
say('Powered By GataDios', {
font: 'console',
align: 'center',
gradient: ['red', 'magenta']
})

var isRunning = false

process.on('uncaughtException', (err) => {
if (err.code === 'ENOSPC') {
console.error('Se ha detectado ENOSPC (sin espacio o límite de watchers alcanzado), reiniciando....')
} else {
console.error('Error no capturado:', err)
}
process.exit(1)
})

async function start(file) {
if (isRunning) return
isRunning = true
const currentFilePath = new URL(import.meta.url).pathname
let args = [join(__dirname, file), ...process.argv.slice(2)]
say([process.argv[0], ...args].join(' '), {
font: 'console',
align: 'center',
gradient: ['red', 'magenta']
})
setupMaster({exec: args[0], args: args.slice(1)})
let p = fork()
p.on('message', (data) => {
switch (data) {
case 'reset':
p.process.kill()
isRunning = false
start.apply(this, arguments)
break
case 'uptime':
p.send(process.uptime())
break
}
})

p.on('exit', (_, code) => {
isRunning = false
console.error('⚠️ ERROR ⚠️ >> ', code)
start('main.js') //

if (code === 0) return
watchFile(args[0], () => {
unwatchFile(args[0])
start(file)
})
})

const ramInGB = os.totalmem() / (1024 * 1024 * 1024)
const freeRamInGB = os.freemem() / (1024 * 1024 * 1024)
const packageJsonPath = path.join(path.dirname(currentFilePath), './package.json')
try {
const packageJsonData = await fsPromises.readFile(packageJsonPath, 'utf-8')
const packageJsonObj = JSON.parse(packageJsonData)
const currentTime = new Date().toLocaleString()
const cpuModel = os.cpus()[0]?.model ?? 'Desconocido'
const cpuCount = os.cpus().length
const platform = os.platform()
let lineM = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
let lineS = '┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅'
console.log(
chalk.magenta(`
╭${lineM}╮
${chalk.bold.cyanBright('  ✦ ✦ ✦ V I P   E D I T I O N  ✦ ✦ ✦')}
╰${lineM}╯`) +
chalk.cyan(`
╭${lineM}╮
┊  ${chalk.bold.magenta('🖥️  SISTEMA')}
┊  ${chalk.dim(lineS)}
┊  ${chalk.yellow('💻 OS       : ')}${chalk.white(`${os.type()} ${os.release()} (${os.arch()})`)}
┊  ${chalk.yellow('🧩 CPU      : ')}${chalk.white(`${cpuModel} × ${cpuCount} cores`)}
┊  ${chalk.yellow('📦 Platform : ')}${chalk.white(platform)}
┊  ${chalk.yellow('💾 RAM Total: ')}${chalk.white(`${ramInGB.toFixed(2)} GB`)}
┊  ${chalk.yellow('💽 RAM Libre: ')}${chalk.greenBright(`${freeRamInGB.toFixed(2)} GB`)}
╰${lineM}╯`) +
chalk.cyan(`
╭${lineM}╮
┊  ${chalk.bold.magenta('🤖 BOT INFO')}
┊  ${chalk.dim(lineS)}
┊  ${chalk.yellow('📛 Nombre   : ')}${chalk.bold.white(packageJsonObj.name)}
┊  ${chalk.yellow('🔖 Versión  : ')}${chalk.bold.greenBright(`v${packageJsonObj.version}`)}
┊  ${chalk.yellow('📝 Desc     : ')}${chalk.white(packageJsonObj.description)}
┊  ${chalk.yellow('😺 Autor    : ')}${chalk.bold.magentaBright(`${packageJsonObj.author.name} (@gata_dios)`)}
┊  ${chalk.yellow('💜 Colab    : ')}${chalk.white('juanwz7 (juan ofc)')}
╰${lineM}╯`) +
chalk.cyan(`
╭${lineM}╮
┊  ${chalk.bold.magenta('⏰ INICIO')}
┊  ${chalk.dim(lineS)}
┊  ${chalk.yellow('📅 Fecha/Hora: ')}${chalk.bold.cyanBright(currentTime)}
╰${lineM}╯`)
)
setInterval(() => {}, 1000)
} catch (err) {
console.error(chalk.red(`❌ No se pudo leer el archivo package.json: ${err}`))
}

let opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
if (!opts['test'])
if (!rl.listenerCount())
rl.on('line', (line) => {
p.emit('message', line.trim())
})
}

start('main.js')
