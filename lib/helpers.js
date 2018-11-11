/*
 * Helpers for various tasks
 *
 *
  */
"use strict";

// Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
// Container for the helpers
let helpers = {};

// Crreate s SHA256 hashPasswors
helpers.hash = (str) => {
  if(typeof(str) == 'string' && str.length > 0) {
    let hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// parse a Json string To an Object in all cases without throwing
helpers.parseJsonToObject = (str) => {

try{
  let object = JSON.parse(str);
  return object;
} catch (e){
  return {};
}
};

// Create a string of random alphanumeric characters, of given length
helpers.createRandomString = (strLength) => {
  strLength = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;
   if(strLength) {
     // Define possible characters for the string
     let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

     // START the string
     let str = '';
     for(i = 1; i <= strLength; i++) {
       //Get a characters from possibleCharacters
       let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
       //Append this characters to the final string
       str+=randomCharacter;
     }
     return str;
   } else {
     return false;
   }
};

helpers.sendTwilioSms = function(phone,msg,callback){
  // Validate parameters
  phone = typeof(phone) == 'string' && phone.trim().length == 12 ? phone.trim() : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
  if(phone && msg){

    // Configure the request payload
    var payload = {
      'From' : config.twilio.fromPhone,
      'To' : '+'+phone,
      'Body' : msg
    };
    var stringPayload = querystring.stringify(payload);


    // Configure the request details
    var requestDetails = {
      'protocol' : 'https:',
      'hostname' : 'api.twilio.com',
      'method' : 'POST',
      'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
      'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
      'headers' : {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails,function(res){
        // Grab the status of the sent request
        var status =  res.statusCode;
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
          callback(false);
        } else {
          callback('Status code returned was '+status);
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error',function(e){
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or invalid');
  }
};
// Export the modules
module.exports = helpers;
