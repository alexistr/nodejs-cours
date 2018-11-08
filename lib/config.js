/*
 *Create and export configuration variables
 *
 */

 // Container for all the environments
 let environments = {};

 // Staging (default) environment
 environments.staging = {
   'httpPort' : 3000,
   'httpsPort' : 3001,
   'envName' : 'staging',
   'hashingSecret' : 'This is a secret',
   'maxChecks' : 5,
   'twilioperso' : {
     'accountSid': 'ACb9a489a1dfca2ce2975467ef6f69d9a7',
     'authToken': 'f31b8e1ae2097c0f03b6f87282cdd6e1',
     'fromPhone': '+905378149525'
   },
   'twilio' : {
     'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
     'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
     'fromPhone' : '+15005550006'
 }
};


 // Production environment
 environments.production = {
   'httpPort' : 5000,
   'httpsPort' : 5001,
   'envName' : 'production',
   'hashingSecret' : 'This is a secret',
   'maxChecks' : 5,
   'twilio' : {
     'accountSid': 'AC5bf46a48df35c633f6aed99a7c6da2b5',
     'authToken': '046593c1f8d282d69aa536ef4f371613',
     'fromPhone': '+905378149525'
   }
 };

// Determine which environment was passed as a command-line argument
let currentenvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the environment is one oh those above or default to staging
let environmentToExport = typeof(environments[currentenvironment]) === 'object' ? environments[currentenvironment] : environments.staging;

//Export the module

module.exports = environmentToExport;
