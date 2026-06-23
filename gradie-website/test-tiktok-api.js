const http = require('http');

const data = JSON.stringify({
  action: 'sync_orders'
});

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/tiktok',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
