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
  if (restarts > 500) { log('Max restarts'); return; }
  restarts++
  log(`Starting dev server (attempt ${restarts})`)
  child = spawn('./node_modules/.bin/next', ['dev', '-p', '3000'], {
    cwd: '/home/z/my-project',
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
    env: {
      ...process.env,
      DATABASE_URL: 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30&pool_timeout=30',
      DIRECT_URL: 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30',
    },
  })
  const ws = fs.createWriteStream(LOG, { flags: 'a' })
  child.stdout.pipe(ws, { end: false })
  child.stderr.pipe(ws, { end: false })
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

start()
log('Watchdog running')
