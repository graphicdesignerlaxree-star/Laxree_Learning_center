const { createServer } = require('http');
const { join } = require('path');
const { parse } = require('url');

// Load Next.js
const next = require('next');
const dev = false;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // Add error handling for each request
    res.on('error', (err) => {
      console.error('Response error:', err);
    });
    
    handle(req, res, parsedUrl).catch((err) => {
      console.error('Request handler error:', err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
  });
  
  // Set timeouts to be more generous
  server.timeout = 60000;
  server.keepAliveTimeout = 5000;
  server.headersTimeout = 65000;
  
  server.listen(3000, '0.0.0.0', () => {
    console.log('> Custom Next.js server ready on http://localhost:3000');
  });
  
  // Handle server errors
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
  
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection:', reason);
  });
});
