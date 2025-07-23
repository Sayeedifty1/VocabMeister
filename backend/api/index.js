const serverless = require('serverless-http');
const app = require('../server'); // express app

module.exports.handler = serverless(app); 
