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

// Export the modules
module.exports = helpers;
