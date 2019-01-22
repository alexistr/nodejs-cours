/*
 *
 * Premier fichier pour API
 *
 */
"use strict";
//Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const cluster = require('cluster');
const os = require('os');


//Declare the app
let app = {};

//Init function
app.init = (callback) => {
if(cluster.isMaster) {
  //Start the workers
  workers.init();

  // Start the CLI but make sure it starts last
  setTimeout(() => {
    cli.init();
    callback();
  },50);
  for( let i=0; i< os.cpus().length;i++) {
    cluster.fork();
  }
} else {

    //Start the server
    server.init();

}



};

// Self invoking only if required directly
if(require.main === module) {
  app.init(() => {});
}

//Export the app
module.exports = app;
