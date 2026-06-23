// scratch/test-local-lazada.js
const lazadaHandler = require('../api/lazada.js');

const req = {
  method: 'POST',
  body: {
    action: 'sync_orders',
    appKey: '139567',
    appSecret: '9XXFtXZkH4RAtVWAcyDKnWZZFNYZlM6t',
    accessToken: '50000201a02kvz169b2a74xpebkhxgPVXfmhPIWEvSIcXFvOhyOaupR2ZJRbQ7Lx',
    baseUrl: 'https://api.lazada.vn/rest'
  }
};

const res = {
  statusCode: 200,
  headers: {},
  setHeader(key, value) {
    this.headers[key] = value;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    console.log('STATUS:', this.statusCode);
    console.log('RESPONSE:', JSON.stringify(data, null, 2));
  },
  end() {
    console.log('ENDED');
  }
};

lazadaHandler(req, res).catch(err => {
  console.error('ERROR:', err);
});
