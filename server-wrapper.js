const http = require('http');
const { parse } = require('url');

// Create a proxy server that adds Connection: close to responses
const target = 'http://localhost:3001'; // Next.js will run on 3001
const PROXY_PORT = 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  
  const options = {
    hostname: '127.0.0.1',
    port: 3001,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      'Connection': 'close',
    },
  };
  
  const proxy = http.request(options, (proxyRes) => {
    // Add Connection: close to response headers
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'Connection': 'close',
    });
    proxyRes.pipe(res, { end: true });
  });
  
  proxy.on('error', (err) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) {
      res.writeHead(502);
      res.end('Bad Gateway');
    }
  });
  
  req.pipe(proxy, { end: true });
});

server.timeout = 30000;
server.keepAliveTimeout = 1000;  // Very short keep-alive timeout
server.headersTimeout = 35000;

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on port ${PROXY_PORT}, forwarding to ${target}`);
});
