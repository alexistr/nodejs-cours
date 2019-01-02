/*
* APIU tests
*
*/

// Dependencies
const app = require('./../index');
const assert = require('assert');
const http = require('http');
const config = require('./../lib/../lib/config');

// Holder for the Tests
let api = {};

// helpers
let helpers = {};
helpers.makeGetRequest = (path,callback) => {
  //Configure the request DETAILS
  let requestDetails = {
    'protocol' : 'http:',
    'hostmane' : 'localhost',
    'port' : config.httpPort,
    'method' : 'GET',
    'path' : path,
    'headers' : {
      'Content-Type' : 'application/json'
    }
  };
  // Send the request
  let req = http.request(requestDetails, (res) => {
    callback(res);
  });
  req.end();

};

// The main init() function should be able to run without throwing
api['app.init shold start without throwing'] = (done) => {
  assert.doesNotThrow(() => {
    app.init((err) => {
      done();
    });
  },TypeError);
};

// Make a request to Ping
api['/ping should respond to GET with 200'] = (done) => {
  helpers.makeGetRequest('/ping',(res) => {
      assert.equal(res.statusCode,200);
      done();
  });
};

// Make a request to /api/users
api['/api/users should respond to GET with 400'] = (done) => {
  helpers.makeGetRequest('/api/users',(res) => {
      assert.equal(res.statusCode,400);
      done();
  });
};

// Make a request to random path
api['a random path should respond to GET with 404'] = (done) => {
  helpers.makeGetRequest('/this/path/shouldnt/exists',(res) => {
      assert.equal(res.statusCode,404);
      done();
  });
};

// export the tests to the runner
module.exports = api;
