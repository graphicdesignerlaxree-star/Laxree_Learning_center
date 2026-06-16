const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PROXY_PORT = 3000;
const NEXTJS_PORT = 3001;
const MAX_RESTARTS = 100;
let restartCount = 0;
let nextjsProcess = null;

function startNextJS() {
  if (restartCount >= MAX_RESTARTS) {
    console.error('Max restarts reached');
    return;
  }
  
  restartCount++;
  console.log(`[${new Date().toISOString()}] Starting Next.js (attempt ${restartCount})`);
  
  const env = {
    ...process.env,
    DATABASE_URL: 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
    PORT: String(NEXTJS_PORT),
    NODE_OPTIONS: '--max-old-space-size=4096',
  };
  
  nextjsProcess = spawn('node', [path.join(__dirname, '.next/standalone/server.js')], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });
  
  nextjsProcess.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.log(`[Next.js] ${msg}`);
  });
  
  nextjsProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.error(`[Next.js] ${msg}`);
  });
  
  nextjsProcess.on('exit', (code, signal) => {
    console.log(`[${new Date().toISOString()}] Next.js exited (code=${code}, signal=${signal}), restarting in 2s...`);
    nextjsProcess = null;
    setTimeout(startNextJS, 2000);
  });
  
  nextjsProcess.on('error', (err) => {
    console.error(`[Next.js] Process error:`, err);
    nextjsProcess = null;
    setTimeout(startNextJS, 2000);
  });
}

// Start Next.js
startNextJS();

// Wait a bit for Next.js to start, then start proxy
setTimeout(() => {
  const proxy = http.createServer((req, res) => {
    const options = {
      hostname: '127.0.0.1',
      port: NEXTJS_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, 'Connection': 'close' },
      timeout: 30000,
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        ...proxyRes.headers,
        'Connection': 'close',
      });
      proxyRes.pipe(res, { end: true });
    });
    
    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Connection': 'close' });
        res.end('Bad Gateway - Server Starting...');
      }
    });
    
    proxyReq.setTimeout(30000, () => {
      proxyReq.destroy();
      if (!res.headersSent) {
        res.writeHead(504, { 'Connection': 'close' });
        res.end('Gateway Timeout');
      }
    });
    
    req.pipe(proxyReq, { end: true });
  });
  
  proxy.timeout = 60000;
  proxy.keepAliveTimeout = 1000;
  proxy.headersTimeout = 65000;
  
  proxy.listen(PROXY_PORT, '0.0.0.0', () => {
    console.log(`[${new Date().toISOString()}] Smart proxy running on port ${PROXY_PORT}`);
  });
  
  proxy.on('error', (err) => {
    console.error(`[Proxy] Server error:`, err);
  });
  
  // Keep process alive
  process.on('uncaughtException', (err) => {
    console.error('[Proxy] Uncaught exception:', err);
  });
  
  process.on('unhandledRejection', (reason) => {
    console.error('[Proxy] Unhandled rejection:', reason);
  });
}, 3000);
