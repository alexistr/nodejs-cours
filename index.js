/*
 *
 * Premier fichier pour API
 *
 */
"use strict";
//Dependencies
const server = require('./lib/server.js');
const workers = require('./lib/workers.js');

//Declare the app
let app = {};

//Init function
app.init = () => {
  //Start the server
  server.init();

  //Start the workers
  workers.init();

};

// Execute

app.init();

//Export the app
module.exports = app;
