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
const exampleDebuggingProblem = require('./lib/exampleDebuggingProblem');

//Declare the app
let app = {};

//Init function
app.init = () => {
  //Start the server
  debugger;
  server.init();
  debugger;
  //Start the workers
  debugger;
  workers.init();
debugger;
  // Start the CLI but make sure it starts last
  setTimeout(() => {
    cli.init();
    debugger;
  },50);

// set foo at 1
debugger;
let foo = 1;
console.log("Just assign 1 to foo");
debugger;
foo++;
console.log("Just increment foo");
debugger;
foo = foo * foo;
console.log("Just square foo");
debugger;
foo = foo.toString();
console.log("Jut convert foo to string");

debugger;
  // Call the init script that will throw
  exampleDebuggingProblem.init();
  console.log("Just called the Library");
  debugger;

};

// Execute

app.init();

//Export the app
module.exports = app;
