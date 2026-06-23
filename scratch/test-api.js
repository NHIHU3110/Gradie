const crypto = require('crypto');

function generateSign(apiPath, params, secret) {
  const keys = Object.keys(params).sort();
  let stringToSign = apiPath;
  for (const key of keys) {
    stringToSign += key + params[key];
  }
  return crypto.createHmac('sha256', secret).update(stringToSign).digest('hex').toUpperCase();
}

const appKey = '139567';
const appSecret = '9XXFtXZkH4RAtVWAcyDKnWZZFNYZlM6t';

const apiPath = '/system/time/get';
const paramsObj = {
  app_key: appKey,
  timestamp: Date.now().toString(),
  sign_method: 'sha256'
};

paramsObj.sign = generateSign(apiPath, paramsObj, appSecret);

const urlParams = new URLSearchParams();
for (const key in paramsObj) {
  urlParams.append(key, paramsObj[key]);
}

const apiUrl = `https://api.lazada.vn/rest${apiPath}?${urlParams.toString()}`;

fetch(apiUrl, { method: 'GET' })
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
