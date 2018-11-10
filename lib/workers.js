 /*
*
* Workers-related tasks
*
*/

//Dependencies
const path = require('path');
const fs = require('fs');
const _data = require('./data');
const https = require('https');
const http = require('http');
const helpers = require('./helpers');
const url = require('url');
const _logs = require('./logs');

//Instantiate the worker object
let workers = {};


// lookup all checks, get their data, send to a validator
workers.gaterAllChecks = () => {
  // get all the checks
  _data.list('checks' , (err,checks) => {
    if(!err && checks && checks.length >0 ) {
      checks.forEach( (check) => {
        //read in the checks data
        _data.read('checks',check,(err,originalCheckData) => {
          if(!err && originalCheckData) {
            //Pass the data to the check validator, and then that function continue or log errors as needed
            workers.validateCheckData(originalCheckData);
          } else {
            console.log("Error reading on of the check data." + err);
          }
        });
      });

    } else {
      console.log("Error: Could not find any checks to process.");
    }

  });
};

//Sanity checking the check-data

workers.validateCheckData = (originalCheckData) => {
  originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};
  originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id : false;
  originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 12 ? originalCheckData.userPhone: false;
  originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http','https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
  originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url : false;
  originalCheckData.method = typeof(originalCheckData.method) == 'string' && ['post','get','put','delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
  originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
  originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >=1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

//Set the keys that may not be set (if the workers have never seen this check before)
originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up','down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;
//If all the checks pass, pass the data along to the next step  in the process.
if(originalCheckData.id &&
originalCheckData.userPhone &&
originalCheckData.protocol &&
originalCheckData.url &&
originalCheckData.method &&
originalCheckData.successCodes &&
originalCheckData.timeoutSeconds
) {
  workers.performCheck(originalCheckData);
} else {
  console.log("Error: One of the checks is not properly formatted. Skipping it.");
}
};

// Perform the check, send the originalCheckData and the outcome of the check process, to the next step in the process
workers.performCheck = (originalCheckData) => {
  //prepare the initial check outcome
  let checkOutcome = {
    'error' : false,
    'responseCode' : false
  };
  //Mark that the outcome has not been sent yet
  let outcomeSent = false;

  //Parse the hostname and the path out of the original check data
  let parseUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url,true);
  let hostname = parseUrl.hostname;
  let path = parseUrl.path; //path and not pathname because we went querystring

  // construct the request
  let requestDetails = {
    'protocol' : originalCheckData.protocol+':',
    'hostname' : hostname,
    'method' :  originalCheckData.method.toUpperCase(),
    'path' : path,
    'timout' : originalCheckData.timeoutSeconds * 1000
  };
  // Instantiate the requestObject using either http or https module
  let _moduleToUse = originalCheckData.protocol == 'http' ? http : https;
  let req = _moduleToUse.request(requestDetails,(res) => {
    //Grab the status of the sent request
    let status = res.statusCode;
    //Update the checkOutcome and pass the data along
    checkOutcome.responseCode = status;
    if(!outcomeSent) {
      workers.procesCheckOutcome(originalCheckData,checkOutcome);
      outcomeSent = true;
    }
  });

  //Bind to the error so it dosent get thrown
  req.on('error',(e)=>{
    //Update the checkOutcome and pass the data along
    checkOutcome.error = {
      'error' : true,
      'value' : e
    };
    if(!outcomeSent) {
      workers.procesCheckOutcome(originalCheckData,checkOutcome);
      outcomeSent = true;
    }
  });

  // Bind to time out
  req.on('timeout',(e)=>{
    //Update the checkOutcome and pass the data along
    checkOutcome.error = {
      'error' : true,
      'value' : 'timeout'
    };
    if(!outcomeSent) {
      workers.procesCheckOutcome(originalCheckData,checkOutcome);
      outcomeSent = true;
    }
  });

  //End the request
  req.end();
};

//Process the check outcome, update the check data as needed, trigger alert to the user if needed
//Special logic for accomodating a check that has never been tested before (don' alert on tha one)
workers.procesCheckOutcome = (originalCheckData,checkOutcome) => {
  //Decide if the check is onsidered up or down
  let state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';
  // Decide if an alert is wanted
  let alertWanted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;

  // Log the outcome
  let timeOfCheck = Date.now();
  workers.log(originalCheckData,checkOutcome,state,alertWanted,timeOfCheck);

  //update the check data
  let newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked =timeOfCheck;



  _data.update('checks',newCheckData.id,newCheckData,(err) => {
    if(!err) {
      //Send the new check data to the next phase in the process if needed
      if(alertWanted) {
        workers.alertUserToSatusChange(newCheckData);
      } else {
        console.log("Check stat has not changed no alert needed");
      }
    } else {
      console.log("Error: trying to save updates of the checks");
    }
  });

};

//alert the user as to a change in their check status
workers.alertUserToSatusChange = (newCheckData) => {
  let msg = "Alert: Your check to " + newCheckData.method.toUpperCase() + ' ' + newCheckData.protocol + '://' + newCheckData.url + ' is currently ' + newCheckData.state;
  helpers.sendTwilioSms(newCheckData.userPhone,msg,(err)=>{
    if(!err) {
      console.log('Success: user was alerted to a status change in their checks via sms: ' + msg);
    } else {
      console.log('Error: could not send sms alert who had a state change in their state ');
    }
  });
};

workers.log = (originalCheckData,checkOutcome,state,alertWanted,timeOfCheck) => {
  // Form the log data
let logData = {
  'check' : originalCheckData,
  'outcome' : checkOutcome,
  'state' : state,
  'alert' : alertWanted,
  'time' : timeOfCheck
};
// Convert to a string
let logString = JSON.stringify(logData);
// Determine the name of the log file
let logFileName = originalCheckData.id;

// append the log string to the file
_logs.append(logFileName,logString, (err) => {
  if(!err) {
    console.log("logging to file succeeded");
  } else {
    console.log("logging to file failed");
  }
});



};

// timer to execute the worker-process once per minute
workers.loop = () => {
    setInterval( () => {
      workers.gaterAllChecks();
    },1000 * 60);
};

// timer to execute the log rotation once per day
workers.logRotationLoop = () => {
  setInterval( ()=> {
    workers.rotateLogs();
  },1000 * 60 * 60 * 24);
};


//Init script
workers.init = () => {
  //Execute all the checks
  workers.gaterAllChecks();
  //Call the loop so the checks will exeute later on
  workers.loop();

  //Compress all the logs
  workers.rotateLogs();

  //Call the compression loop so logs will be compressed later on
  workers.logRotationLoop();
};




// exporte the module
module.exports = workers;
