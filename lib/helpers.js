/*
 * Helpers for various tasks
 *
 *
  */

// Dependencies
const crypto = require('crypto');
const config = require('./config');
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
helpers.createRandomString = function(strLength) {
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
}
// Export the modules
module.exports = helpers;
