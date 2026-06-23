// Long-running Node watchdog that keeps `bun run dev` alive.
// Spawns dev server as a detached child, restarts on exit.
const { spawn } = require('child_process')
const fs = require('fs')

const LOG = '/home/z/my-project/dev.log'
const WLOG = '/home/z/my-project/watchdog.log'

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`
  console.log(line)
  fs.appendFileSync(WLOG, line + '\n')
}

let child = null
let restarts = 0

function start() {
  if (restarts > 200) {
    log('Max restarts reached, giving up')
    return
  }
  restarts++
  log(`Starting dev server (attempt ${restarts})`)

  child = spawn('bun', ['run', 'dev'], {
    cwd: '/home/z/my-project',
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
    env: { ...process.env },
  })

  const writeStream = fs.createWriteStream(LOG, { flags: 'a' })
  child.stdout.pipe(writeStream, { end: false })
  child.stderr.pipe(writeStream, { end: false })

  child.on('exit', (code, signal) => {
    log(`Dev server exited code=${code} signal=${signal}, restarting in 3s`)
    child = null
    setTimeout(start, 3000)
  })

  child.on('error', (err) => {
    log(`Dev server error: ${err.message}`)
    child = null
    setTimeout(start, 3000)
  })
}

// Detach this watchdog from the parent so it survives the shell exiting
process.on('SIGTERM', () => log('watchdog got SIGTERM'))
process.on('SIGINT', () => log('watchdog got SIGINT'))

start()
log('Watchdog running')
