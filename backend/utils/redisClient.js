const Redis = require('ioredis');
const redis = new Redis({ port: 6380, host: '127.0.0.1' });
module.exports = redis;
