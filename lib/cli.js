/*
* CLI related tasks
*
*/

// Dependancies
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
class _events extends events{};
const e = new _events();

// Instantiate the CLI module object
let cli = {};

//Input handlers
e.on('man',(str)=>{
  cli.responders.help();
});

e.on('help',(str)=>{
  cli.responders.help();
});

e.on('exit',(str)=>{
  cli.responders.exit();
});

e.on('stats',(str)=>{
  cli.responders.stats();
});

e.on('list users',(str)=>{
  cli.responders.listUsers();
});

e.on('more user info',(str)=>{
  cli.responders.moreUserInfo(str);
});
e.on('list checks',(str)=>{
  cli.responders.listChecks(str);
});
e.on('more check info',(str)=>{
  cli.responders.moreCheckInfo(str);
});
e.on('list logs',(str)=>{
  cli.responders.listLogs();
});
e.on('more log info',(str)=>{
  cli.responders.moreLogInfo(str);
});

//Responders object
cli.responders = {};

// Help / man
cli.responders.help = () => {
  console.log("You asked for help");
};

// exit
cli.responders.exit = () => {
  console.log("You asked for exit");
};

// stats
cli.responders.stats = () => {
  console.log("You asked for stats");
};

// list users
cli.responders.listUsers = () => {
  console.log("You asked for list users");
};
// more user info
cli.responders.moreUserInfo = (str) => {
  console.log("You asked for more user info",str);
};

// list checks
cli.responders.listChecks = () => {
  console.log("You asked for list checks");
};

// more check info
cli.responders.moreCheckInfo = (str) => {
  console.log("You asked for more check info",str);
};

// list logs
cli.responders.listLogs = () => {
  console.log("You asked for list logs");
};

// more log info
cli.responders.moreLogInfo = (str) => {
  console.log("You asked for more log info",str);
};

//Input processor
cli.processInput = (str) => {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;
  // only process the input if the user actually wrote something. Otherwise ignore
  if(str) {
    // Codify the unique string that codify the unique questions allowed to be asked
    let uniqueInputs = [
      'man',
      'help',
      'stats',
      'exit',
      'list users',
      'more user info',
      'more check info',
      'list checks',
      'list logs',
      'more log info'
    ];
    // Go throuh the possible input, emit an event when match is found
    let matchFound = false;
    let counter = 0;
    uniqueInputs.some((input)=>{
      if(str.toLowerCase().indexOf(input) > -1 ) {
        matchFound = true;
        // Emit an event matching the unique inputs and include the full string given
        e.emit(input,str);
        return true;
      }
    });
    // If no match is found tell the user to try again
    if(!matchFound) {
      console.log("Sorry, try again");
    }
  }
};


// Init script
cli.init = () => {
  // Send the start message to te console in dark blue
  console.log('\x1b[34m%s\x1b[0m',"The CLI is running");

  // Start the Interface
  let _insterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  });

  // create an initial prompt
  _insterface.prompt();

  // Handle each line of input separatly

  _insterface.on('line', (str) => {
      // Send to the inout processor
      cli.processInput(str);

      // Reinitialais the prompt afterwards
      _insterface.prompt();

  });

// If the user stops the CLI kill the associated process
_insterface.on('close', () => {
  process.exit(0);
});

};


// Export the module
module.exports = cli;
