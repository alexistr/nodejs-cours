/*
 *
 * Server-related tasks
 *
 */

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
    chosenHandlers(data, (statusCode, payload) => {
      //use statuscode called back by the handler or default to 202
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      //use payload called back by the handler or default to an empty object
      payload = typeof(payload) === 'object' ? payload : {};
      //convert the payload to a string_decoder
      let payloadString = JSON.stringify(payload);

      //Return the response
      res.setHeader('Content-Type','application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      //Logs
      console.log(`Returning this response: ${statusCode} , ${payload}`);
    });



  });

};

//Define a request router
server.router = {
  'users' : handlers.users,
  'ping' : handlers.ping,
  'tokens' : handlers.tokens,
  'checks' : handlers.checks
};
//Init script
server.init = () => {
  //start the http httpServer
  server.httpServer.listen(config.httpPort, () => {
    console.log(`httpServer is listening on port ${config.httpPort} in ${config.envName} mode`);
  });

  //start the https httpServer
  server.httpsServer.listen(config.httpsPort, () => {
    console.log(`httpsServer is listening on port ${config.httpsPort} in ${config.envName} mode`);
  });
};

module.exports = server;