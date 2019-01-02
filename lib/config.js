/*
 *Create and export configuration variables
 *
 */
"use strict";
 // Container for all the environments
 let environments = {};

 // Staging (default) environment
 environments.staging = {
   'httpPort' : 3000,
   'httpsPort' : 3001,
   'envName' : 'staging',
   'hashingSecret' : 'This is a secret',
   'maxChecks' : 5,
   'twilio' : {
     'accountSid': 'ACb9a489a1dfca2ce2975467ef6f69d9a7',
     'authToken': 'f31b8e1ae2097c0f03b6f87282cdd6e1',
     'fromPhone': '+15005550006'
   },
   'templateGlobals' : {
     'appName' : 'UptimeChecker',
     'compagnyName' : 'NotARealCompagny, Inc',
     'yearCreated' : '2018',
     'baseUrl' : 'http://localhost:3000/'
    }
  };

// Testing envireonnement
environments.testing = {
  'httpPort' : 4000,
  'httpsPort' : 4001,
  'envName' : 'testing',
  'hashingSecret' : 'This is a secret',
  'maxChecks' : 5,
  'twilio' : {
    'accountSid': 'ACb9a489a1dfca2ce2975467ef6f69d9a7',
    'authToken': 'f31b8e1ae2097c0f03b6f87282cdd6e1',
    'fromPhone': '+15005550006'
  },
  'templateGlobals' : {
    'appName' : 'UptimeChecker',
    'compagnyName' : 'NotARealCompagny, Inc',
    'yearCreated' : '2018',
    'baseUrl' : 'http://localhost:3000/'
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
     'accountSid': '',
     'authToken': '',
     'fromPhone': ''
   },
   'templateGlobals' : {
     'appName' : 'UptimeChecker',
     'compagny' : 'NotARealCompagny, Inc',
     'yearCreated' : '2018',
     'baseUrl' : 'http://localhost:5000/'
    }
 };

// Determine which environment was passed as a command-line argument
let currentenvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the environment is one oh those above or default to staging
let environmentToExport = typeof(environments[currentenvironment]) === 'object' ? environments[currentenvironment] : environments.staging;

//Export the module

module.exports = environmentToExport;
