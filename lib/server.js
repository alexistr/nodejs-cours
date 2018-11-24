/*
 *
 * Server-related tasks
 *
 */
"use strict";
//Dependencies
 const config = require('./config');
 const http = require('http');
 const https = require('https');
 const url = require('url');
 const StringDecoder = require('string_decoder').StringDecoder;
 const fs = require('fs');
 const handlers = require('./handlers');
 const _data = require('./data');
 const helpers = require('./helpers');
 const path = require('path');
 const util = require('util');
 const debug = util.debuglog('server');

//Instantiate server module object

let server = {};

//Instantiate http server
server.httpServer = http.createServer((req,res)  => server.unifiedServer(req,res) );

//Instantiate https server
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions , (req,res)  => server.unifiedServer(req,res) );



// All the serer logic for both http and https httpServers
server.unifiedServer = (req,res) => {
  //Get the url and parseit
  let parsedUrl = url.parse(req.url,true);
  //Get the path from the url
  let path = parsedUrl.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //Get the querystring as an object
  let queryStringObject = parsedUrl.query;

  //Get the http methode
  let method = req.method.toLowerCase();

  //Get the headers as an object
  let headers = req.headers;

  //Get the payload if
  let decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    //Choose de handler thi request should go to
    let chosenHandlers = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    //Construct data object to send to the handlers
    let data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    };

    //Route the request to the handler specify in th router
    chosenHandlers(data, (statusCode, payload,contentType) => {
      // Determine the type of response (fallback to JSON)
      contentType = typeof(contentType) == 'string' ? contentType : 'json';
      //use statuscode called back by the handler or default to 202
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

      //Return the response parts that are content specific
      let payloadString = '' ;
      if(contentType == 'json') {
        res.setHeader('Content-Type','application/json');
        payload = typeof(payload) === 'object' ? payload : {};
        payloadString = JSON.stringify(payload);
      }
      if(contentType == 'html') {
        res.setHeader('Content-Type','text/html');
        payloadString = typeof(payload) == 'string' ? payload : '';
      }
      if(contentType == 'favicon') {
        res.setHeader('Content-Type','image/x-icon');
        payloadString = typeof(payload) == 'string' ? payload : '';
      }
      if(contentType == 'css') {
        res.setHeader('Content-Type','text/css');
        payloadString = typeof(payload) == 'string' ? payload : '';
      }
      if(contentType == 'png') {
        res.setHeader('Content-Type','image/png');
        payloadString = typeof(payload) == 'string' ? payload : '';
      }
      if(contentType == 'jpg') {
        res.setHeader('Content-Type','image/jpg');
        payloadString = typeof(payload) == 'string' ? payload : '';
      }
      if(contentType == 'plain') {
        res.setHeader('Content-Type','text/plain');
        payloadString = typeof(payload) == 'string' ? payload : '';
      }
      //Return the response that are common to all content types
      res.writeHead(statusCode);
      res.end(payloadString);

      //If the response is 200, print in green otherwise print in required
      if(statusCode == 200) {
        debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
            } else {
        debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
      }
    });
  });
};

//Define a request router
server.router = {
  '' : handlers.index,
  'account/create' : handlers.accountCreate,
  'account/edit' : handlers.accountEdit,
  'account/deleted' : handlers.accountDeleted,
  'session/create' : handlers.sessionCreate,
  'session/deleted' : handlers.sessionDeleted,
  'checks/all' : handlers.checksList,
  'checks/create' : handlers.checksCreate,
  'checks/edit' : handlers.checksEdit,
  'ping' : handlers.ping,
  'api/users' : handlers.users,
  'api/tokens' : handlers.tokens,
  'api/checks' : handlers.checks,
  'favicon.ico' : handlers.favicon,
  'public' : handlers.public
};
//Init script
server.init = () => {
  //start the http httpServer
  server.httpServer.listen(config.httpPort, () => {
    console.log('\x1b[36m%s\x1b[0m',`httpServer is listening on port ${config.httpPort} in ${config.envName} mode`);
  });

  //start the https httpServer
  server.httpsServer.listen(config.httpsPort, () => {
    console.log('\x1b[35m%s\x1b[0m',`httpsServer is listening on port ${config.httpsPort} in ${config.envName} mode`);
  });
};

module.exports = server;
