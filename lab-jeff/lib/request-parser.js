'use strict';

const urlModule = require('url');
const queryStringModule = require('querystring');

const winston = require('winston');
const winstonLevels = {error: 0, warn : 1, info : 2, verbose: 3 , debug: 4};
const logger = new (winston.Logger)({
  transports : [
    new (winston.transports.File)({
      filename : 'log.json',
      levels : winstonLevels,
    }),
  ],
});


const requestParser = module.exports = {};

requestParser.parse = (request) => {
  return new Promise((resolve,reject) => {
    request.url = urlModule.parse(request.url);
    request.url.query = queryStringModule.parse(request.url.query);

    if(request.method !== 'POST' && request.method !== 'PUT')
      return resolve(request);
    let sentText = '';
    request.on('data',(buffer) => {
      sentText += buffer.toString();
    });

    request.on('end',() => {
      try{
        if(!sentText) sentText = '{"error": "error"}';
        request.body = JSON.parse(sentText);
        return resolve(request);
      }catch(error){
        return reject(error);
      }
    });
  });
};
