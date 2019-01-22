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
const os = require('os');
const v8 = require('v8');
const _data = require('./data');
const _logs = require('./logs');
const helpers = require('./helpers');
const childProcess = require('child_process');

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
  let commands = {
    'exit' : 'Kill the CLI (and the rest of the application)',
    'man' : 'Show this help page',
    'help' : 'Alias of the "man" command',
    'stats' : 'Get statistics on the underlying operationg system ansd ressource utilization',
    'list users' : 'Show a list of all the registered (undeleted) users in the system',
    'more user info --{userId}' : 'Show details of specific user',
    'list checks --up --down' : 'Show a list of all te active checks in the system, including their state. The "--up" and "--down" flag are both optional',
    'more check info --{checkId}' : 'Show details of a specified check',
    'list logs' : 'Show a list of all te log files availale to be read (compressed only)',
    'more log info --{filename}' : 'Show details of a specified log file'
  };

  // Show a header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered('CLI MANUAL');
  cli.horizontalLine();
  cli.verticalSpace(2);

  //Show each command, followed by its explaination, in white and yellow respectively
  for(let key in commands) {
    if(commands.hasOwnProperty(key)) {
      let value = commands[key];
      let line = '\x1b[33m'+key+'\x1b[0m';
      let padding = 60 - line.length;
      for(let i=0;i< padding; i++){
        line+=' ';
      }
      line+=value;
      console.log(line);
      cli.verticalSpace(1);
    }
  }
  cli.verticalSpace(1);
  //End with an other horizontal line
  cli.horizontalLine();
};

// create a vertical verticalSpace
cli.verticalSpace = (lines) => {
  lines = typeof(lines)=='number' && lines>0 ? lines : 1;
  for(let i = 0;i < lines;i++) {
    console.log('');
  }
};

// Create a horizontal lne accross the screen
cli.horizontalLine = () => {
  // Get the avalaible screensize
  let width = process.stdout.columns;
  let line = '';
  for(let i=0;i<width;i++) {
    line+='-';
  }
  console.log(line);
};

//Create centered texte on the screensize
cli.centered = (str) => {
  str = typeof(str)=='string' && str.trim().length > 0 ? str.trim() : '';
  // Get the avalaible screensize
  let width = process.stdout.columns;
  //calculate the left padding
  let leftPadding = Math.floor((width - str.length)/2);
  // Put in left padding spaces before the string itself
  let line = '';
  for(let i=0;i<leftPadding;i++) {
    line+=' ';
  }
  line+=str;
  console.log(line);
};
// exit
cli.responders.exit = () => {
  process.exit(0);
};

// stats
cli.responders.stats = () => {
  // compile an object of status
  let stats  = {
    'Load Average' : os.loadavg().join(' '),
    'CPU Count' : os.cpus().length,
    'Free Memory' : os.freemem(),
    'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
    'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
    'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
    'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
    'Uptime' : os.uptime()+' Seconds'
  };
  // Show a header for the stats page that is as wide as the screen
  cli.horizontalLine();
  cli.centered('SYSTEM STATISTICS');
  cli.horizontalLine();
  cli.verticalSpace(2);

  //Show each command, followed by its explaination, in white and yellow respectively
  for(let key in stats) {
    if(stats.hasOwnProperty(key)) {
      let value = stats[key];
      let line = '\x1b[33m'+key+'\x1b[0m';
      let padding = 60 - line.length;
      for(let i=0;i< padding; i++){
        line+=' ';
      }
      line+=value;
      console.log(line);
      cli.verticalSpace(1);
    }
  }
  cli.verticalSpace(1);
  cli.horizontalLine();
};

// list users
cli.responders.listUsers = () => {
_data.list('users',(err,userIds) => {
  if(!err && userIds && userIds.length > 0) {
    cli.verticalSpace();
    userIds.forEach((userId) => {
      _data.read('users',userId,(err,userData) => {
        if(!err && userData) {
          let line = `Name: ${userData.firstName} ${userData.lastName} Phone: ${userData.phone} Checks: `;
          let numberOfChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;
          line+=numberOfChecks;
          console.log(line);
          cli.verticalSpace();
        }
      });
    });
  }
});
};
// more user info
cli.responders.moreUserInfo = (str) => {
  // Get the id from the String
  let arr = str.split('--');
  let userId = typeof(arr[1])=='string' && arr[1].trim().length>0 ? arr[1] : false;
  if(userId) {
    // Lookup the user
    _data.read('users',userId,(err,userData) =>{
      if(!err && userData) {
        // Remove the hashed password
        delete userData.hashedPassword;

        // Print the JSON with text highlighting
        cli.verticalSpace();
        console.dir(userData,{'colors' : true});
        cli.verticalSpace();
      }
    });
  }
};

// list checks
cli.responders.listChecks = (str) => {
  _data.list('checks',(err,checkIds)=>{
    if(!err && checkIds && checkIds.length > 0) {
      cli.verticalSpace();
      checkIds.forEach((checkId)=>{
        _data.read('checks',checkId,(err,checkData)=>{
          let includeCheck = false;
          let lowerString = str.toLowerCase();

          //Get the state, default to down
          let state = typeof(checkData.state) == 'string' ? checkData.state : 'down';
          //Get the state, default to unknown
          let stateOrUnknown = typeof(checkData.state) == 'string' ? checkData.state : 'unknown';
          // if the user has specified the state, or hasn't specified any state include the current state accordingly
          if(lowerString.indexOf('--'+state)> -1 || (lowerString.indexOf('--up')==-1 && lowerString.indexOf('--down')==-1 )) {
              let line = `ID: ${checkData.id} ${checkData.method.toUpperCase()} ${checkData.protocol}://${checkData.url} ${stateOrUnknown}`;
              console.log(line);
              cli.verticalSpace();
          }


        });
      });
    }
  });
};

// more check info
cli.responders.moreCheckInfo = (str) => {
  // Get the id from the String
  let arr = str.split('--');
  let checkId = typeof(arr[1])=='string' && arr[1].trim().length>0 ? arr[1] : false;
  if(checkId) {
    // Lookup the check
    _data.read('checks',checkId,(err,checkData) => {
      if(!err && checkData) {
        // Print the JSON with text highlighting
        cli.verticalSpace();
        console.dir(checkData,{'colors' : true});
        cli.verticalSpace();
      }
    });
  }

};

// list logs
cli.responders.listLogs = () => {
  let ls = childProcess.spawn('ls',['./.logs/']);
  ls.stdout.on('data', (dataObject)=> {
    //Explode into seoarate lines
    let dataStr = dataObject.toString();
    let logFileNames = dataStr.split('\n');
    cli.verticalSpace();
    logFileNames.forEach((logFileName)=> {
      if(typeof(logFileName)=='string' && logFileName.length > 0 && logFileName.indexOf('-') > -1) {
        console.log(logFileName.trim().split('.')[0]);
        cli.verticalSpace();
      }
    });
  });
};

// more log info
cli.responders.moreLogInfo = (str) => {
  // Get the logFİleName from the String
  let arr = str.split('--');
  let logFileName = typeof(arr[1])=='string' && arr[1].trim().length>0 ? arr[1] : false;
  if(logFileName) {
    cli.verticalSpace();
    //Decompress the log file
    _logs.decompress(logFileName,(err,strData) => {
      if(!err && strData) {
        // split into logFileNames
        let arr = strData.split('\n');
        arr.forEach((jsonString)=>{
          let logObject = helpers.parseJsonToObject(jsonString);
          if(logObject && JSON.stringify(logObject) !== '{}') {
            console.dir(logObject,{'colors': true});
            cli.verticalSpace();
          }
        });
      }
    });
  }
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

      // Reinitialise the prompt afterwards
      _insterface.prompt();

  });

// If the user stops the CLI kill the associated process
_insterface.on('close', () => {
  process.exit(0);
});

};


// Export the module
module.exports = cli;
