/*
 *
 * Request handlers
 *
 */
"use strict";

 //Depndancies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

//Define the handlers
let handlers = {};

/*
* HTML handlers
*
*/

// Index handlers
handlers.index = (data,callback) => {
  //Reject any request tha isn't a GET
  if(data.method == 'get') {

    // prepare data for interpolation
    let templateData = {
      'head.title' : 'Uptime Monistoring - Made Simple',
      'head.description' : 'We ofer free, simple monitoring for HTTP/HTTPS sites of all kinds. When your site goes down, we\'ll send you a text to let you know.',
      'body.class' : 'index'
    };
    // Read in a template as a string
    helpers.getTemplate('index',templateData,(err,str) => {
      if(!err && str) {
        helpers.addUniversalTemplates(str , templateData,(err,str) =>{
          if(!err && str) {
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }

};

// Create account handler
handlers.accountCreate = (data,callback) => {
  //Reject any request tha isn't a GET
  if(data.method == 'get') {

    // prepare data for interpolation
    let templateData = {
      'head.title' : 'Create an account',
      'head.description' : 'Sign up is easy and only takes a few seconds',
      'body.class' : 'accountCreate'
    };
    // Read in a template as a string
    helpers.getTemplate('accountCreate',templateData,(err,str) => {
      if(!err && str) {
        helpers.addUniversalTemplates(str , templateData,(err,str) =>{
          if(!err && str) {
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Create new session
handlers.sessionCreate = (data,callback) => {
  //Reject any request tha isn't a GET
  if(data.method == 'get') {

    // prepare data for interpolation
    let templateData = {
      'head.title' : 'Login to your account',
      'head.description' : 'Please enter your phone number and your password to access your account.',
      'body.class' : 'sessionCreate'
    };
    // Read in a template as a string
    helpers.getTemplate('sessionCreate',templateData,(err,str) => {
      if(!err && str) {
        helpers.addUniversalTemplates(str , templateData,(err,str) =>{
          if(!err && str) {
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Session has been deleted
handlers.sessionDeleted = (data,callback) => {
  //Reject any request tha isn't a GET
  if(data.method == 'get') {

    // prepare data for interpolation
    let templateData = {
      'head.title' : 'Logged Out',
      'head.description' : 'You have been logged out of your accout.',
      'body.class' : 'sessionDeleted'
    };
    // Read in a template as a string
    helpers.getTemplate('sessionDeleted',templateData,(err,str) => {
      if(!err && str) {
        helpers.addUniversalTemplates(str , templateData,(err,str) =>{
          if(!err && str) {
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};




// favicon
handlers.favicon = (data,callback)=>{
  //Reject any request tha isn't a GET
  if(data.method == 'get') {
    // Read in the favicon's data
    helpers.getStaticAsset('favicon.ico',(err,data) => {
      if(!err && data) {
        callback(200,data,'favicon');
      } else {
        callback(500);
      }
    });
  } else {
    callback(405);
  }
};

  // Public assests
  handlers.public = (data,callback) => {
    //Reject any request tha isn't a GET
    if(data.method == 'get') {
      // get the file name being requested
      let trimmedAssetName = data.trimmedPath.replace('public/','').trim();
      if(trimmedAssetName.length > 0) {
        //Read in the asset's data
        helpers.getStaticAsset(trimmedAssetName, (err,data) => {
          if(!err && data) {
            //determine the conenet type default to plain text
            let contentType = 'plain';
            if(trimmedAssetName.indexOf('.css') > -1) {
              contentType = 'css';
            }
            if(trimmedAssetName.indexOf('.png') > -1) {
              contentType = 'png';
            }
            if(trimmedAssetName.indexOf('.jpg') > -1) {
              contentType = 'jpg';
            }
            if(trimmedAssetName.indexOf('.ico') > -1) {
              contentType = 'favicon';
            }

            // Callback the data
            callback(200,data,contentType);


          } else {
            callback(404);
          }
        });
      } else {
        callback(404);
      }

  } else {
    callback(405);
  }
};




/*
* JSON API handlers
*
*/

// User
handlers.users = (data,callback) => {
  let acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1 ) {
    handlers._users[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for users submethods
handlers._users = {};

// Users - POST
// Reqıired data: firstName, lastName, phone, password, tosAgreement
handlers._users.post = (data,callback) => {
  // Check that all the required fields are filled out
  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 12 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string'  && data.payload.lastName.trim().length > 0 ? data.payload.password : false;
  let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user dosent already exist
    _data.read('users',phone,(err,data) => {
        if(err) {
            // Hash the password
            let hashedPassword = helpers.hash(password);
            // Create the user object
            if(hashedPassword) {
            let userObject = {
              'firstName' : firstName,
              'lastName' : lastName,
              'phone' : phone,
              'hashedPassword' : hashedPassword,
              'tosAgreement' : true
            };
            // Store the user
            _data.create('users',phone,userObject,(err) => {
              if(!err) {
                callback(200);
              } else {
                console.log(err);
                callback(400,{'Error' : 'Could not create the new user'});
              }
            });
         } else {
           callback(500,{'Error' : 'Could not hash the users\'s password' } );
         }
      } else {
        // User already exists
        callback(400,{'Error' : 'A user with that phone number already exists'});
      }
    });

  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }
};
//Users - get
//Required data: phone
//Optional data: none

handlers._users.get = (data,callback) => {
  //Check that the phone number is valide
  let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 12 ? data.queryStringObject.phone.trim() : false;
  if(phone) {
    // Get token from the headers
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given tokens is valid for the phone number
    handlers._tokens.verifyToken(token,phone,(tokenIsValid) => {
      if(tokenIsValid) {
        // Lookup the user
        _data.read('users',phone,(err,data) => {
          if(!err && data) {
            // Remove the hashedpassword befor returning de data
            delete data.hashedPassword;
            callback(200,data);

          } else {
            callback(404);
          }
        });

      } else {

          callback(403,{'Error' : 'Missing required token in header, or token is invalide'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }
};
//Users - put
//Required data : phone
//Optional data: firstName,lastName,passwordupdate their object.Don't let them access anyone elses
handlers._users.put = (data,callback) => {
//check required fields
let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;
let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 12 ? data.payload.phone.trim() : false;
let password = typeof(data.payload.password) == 'string'  && data.payload.lastName.trim().length > 0 ? data.payload.password : false;
if(phone) {
  // Get token from the headers
  let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  // Verify that the given tokens is valid for the phone number
  handlers._tokens.verifyToken(token,phone,(tokenIsValid) => {
    if(tokenIsValid) {
      //check optional fields
      if(firstName || lastName || password) {
        // Lookup the user
        _data.read('users',phone,(err,userData) => {
          if(!err && userData) {
            // Update the
            if(firstName) {
              userData.firstName = firstName;
            };
            if(lastName) {
              userData.lastName = lastName;
            };
            if(password) {
              userData.hashedPassword = helpers.hash(password);
            }

            //Store data
            _data.update('users',phone,userData, (err,data) => {
              if(!err) {
                callback(200);
              } else {
                console.log(err);
                callback(500,{'Error' : 'Could not update the user data'});
              }
            });
          } else {
            callback(400,{'Error' : 'The specified user does not exists'});
          }
        });

      } else {
        callback(400,{'Error' : 'Missing required fields'});
      }

    } else {
      callback(403,{'Error' : 'Missing required token in header, or token is invalide'});
    }
  });

} else {
  callback(400,{'Error' : 'Missing required fields'});
 }
};


//Users - delete
//Required data : phone
//Optional data: none
handlers._users.delete = (data,callback) => {
  //Checl that the phone number is valide
  let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 12 ? data.queryStringObject.phone.trim() : false;
  if(phone) {
    // Get token from the headers
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given tokens is valid for the phone number
    handlers._tokens.verifyToken(token,phone,(tokenIsValid) => {
      if(tokenIsValid) {
        // Lookup the user
        _data.read('users',phone,(err,userData) => {
          if(!err && userData) {
            _data.delete('users',phone,(err) => {
              if(!err) {
                // Delete each of the checks associate with the user
                let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                let checkToDelete = userChecks.length;
                if(checkToDelete > 0) {
                  let checksDeleted = 0;
                  let deletionErrors = false;
                  // loop through the checks
                  userChecks.forEach((checkId) => {
                    //Delete the check
                    _data.delete('checks',checkId,(err) => {
                      if(err) {
                        deletionErrors = true;
                      } else {
                        checksDeleted++;
                        if(checksDeleted == checkToDelete) {
                          if(!deletionErrors) {
                            callback(200);
                          } else {
                            callback(500,{"Error":"Error encountered while attempting to delete all of the user\'s checks. All check may not have been deleted from the system successfully"});
                          }
                        }
                      }

                    });

                  });

                } else {
                  callback(200);
                }



              } else {
                callback(500,{'Error' : 'Could not delete the specified user'});
              }
            });
          } else {
            callback(400,{'Error' : 'Could not find the specified user'});
          }
        });
      } else {
        callback(403,{'Error' : 'Missing required token in header, or token is invalide'});
      }
    });

  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }
};



handlers.notFound = (data,callback) => {
callback(404);
};

// Tokens
handlers.tokens = (data,callback) => {
  let acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1 ) {
    handlers._tokens[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for tokenss submethods
handlers._tokens = {};

// Verify if a given token id is currently valid for a given users
handlers._tokens.verifyToken = (id,phone,callback) => {
  //Lookup the token
  _data.read('tokens',id, (err,tokenData) => {
    if(!err && tokenData) {
      // Check that te token is for the given user and has not expired
        if(tokenData.phone == phone && tokenData.expires > Date.now()) {
          callback(true);
        } else {
          callback(false);
        }
      } else {
        callback(false);
      }
    });
 };

// Tokens POST
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  // Check phone and password are valide
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 12 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string'  && data.payload.password.trim().length > 0 ? data.payload.password : false;
  if(phone && password) {
    //Lookup users
    _data.read('users',phone,(err,userData) => {
      if(!err && userData) {
        //Hash password and compare to the stored one
        let hashedPassword = helpers.hash(password);
        if(hashedPassword === userData.hashedPassword) {
          //If valide create random token + expiration date 1h later
          let tokenId = helpers.createRandomString(20);
          let expires = Date.now() + 1000 * 60 * 60;
          //Create token
          let tokenObject = {
            'phone' : phone,
            'id' : tokenId,
            'expires' : expires,
          };

          //Store tokens
          _data.create('tokens',tokenId,tokenObject, (err)=> {
             if(!err) {
               callback(200, tokenObject);
             } else {
               callback(500,{'Error' : 'Could not create token'});
             }
          });

        } else {
          callback(400,{'Error' : 'password did not match the specified user store password'});
        }
      } else {
        callback(400,{'Error' : 'Could not find the specified user'});
      }
    });
    //Create tokens
}
   else {
     callback(400,{'Error' : 'Missing required fields'});
   }

};

// Tokens GET
// Required data: id
// Optional: none
handlers._tokens.get = (data, callback) => {
  // Check id is valid
  let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id) {
    // Lookup the token
    _data.read('tokens',id,(err,tokenData) => {
      if(!err && tokenData) {
        // Remove the hashedpassword befor returning de data
        callback(200,tokenData);

      } else {
        callback(404);
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }

};

// Tokens PUT
// required: id,extend
// optional: none
handlers._tokens.put = (data, callback) => {
  let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
  let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  if(id && extend) {
    //lookup the token
    _data.read('tokens',id,(err,tokenData) => {
      if(!err && tokenData) {
        // Check token is not expired
        if(tokenData.expires > Date.now()) {
          //Extend the token 60min
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          //Store
          _data.update('tokens',id,tokenData,(err) => {
            if(!err) {
              callback(200);
            } else {
              callback(500,{'Error':'Error could not update token expiration'});
            }

          });
        } else {
          callback(400,{'Error':'The token has already expires and can not be extended'});
        }
      } else {
        callback(400,{'Error':'Specified token does not exists'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required fields or fields are invalid'});
  }


};

// Tokens DELETE
// Required data: id
// Optional data: none

handlers._tokens.delete = (data, callback) => {
  //Checl that the id is valide
  let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id) {
    // Lookup the token
    _data.read('tokens',id,(err,data) => {
      if(!err && data) {
        _data.delete('tokens',id,(err) => {
          if(!err) {
            callback(200);
          } else {
            callback(500,{'Error' : 'Could not delete the specified token'});
          }
        });
      } else {
        callback(400,{'Error' : 'Could not find the specified token'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }
};

// Tokens
handlers.checks = (data,callback) => {
  let acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1 ) {
    handlers._checks[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for checks submethods
handlers._checks = {};

// checks - POST
// Required data:  protocol,url,method,successCodes, timeoutSecond
// Optional data: none
handlers._checks.post = (data , callback) => {
  let protocol = typeof(data.payload.protocol) == 'string' && ['http','https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  let url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url : false;
  let method = typeof(data.payload.method) == 'string' && ['get','post','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
  let successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
  let timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

  if(protocol && url && method && successCodes && timeoutSeconds) {
    //Get token from headers
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    //Get the user by reading the user
    _data.read('tokens',token,(err,tokenData) => {
      if(!err && tokenData) {
        let userPhone = tokenData.phone;
        // lookup the user data
        _data.read('users',userPhone, (err,userData) => {
          if(!err && userData) {
            let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
            // Verify that the user has less than max check configure
            if(userChecks.length < config.maxChecks) {
              // Create random id for the check, and include the users phone
              let checkId = helpers.createRandomString(20);
              // Create the check object and include the user's phone (id)
              let checkObject = {
                "id" : checkId,
                "userPhone" : userPhone,
                "protocol" : protocol,
                "url" : url,
                "method" : method,
                "successCodes" : successCodes,
                "timeoutSeconds" : timeoutSeconds
              };

              //Save the object
              _data.create("checks",checkId,checkObject, (err) => {
                if(!err) {
                  // Add the checkId to the user object
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  //Save the new user data
                  _data.update('users',userPhone,userData, (err) => {
                    if(!err) {
                      // Return the data about the new check
                      callback(200,checkObject);
                    } else {
                      callback(500,{"Error":"Could not update the user data with new check"});
                    }
                  });

                } else {
                  callback(500, {"Error":"Could not create the new checks"});
                }
              });


            } else {
              callback(400,{"Error" : "The user already has the maximum number of check (" + config.maxChecks + ")"});
            }
          } else {
            callback(403);
          }
        });
      } else {
        callback(403);
      }
    });

  } else {
    callback(400,{"Error" : "Missing Required inputs or inputs invalide"});
  }



};

//checks - GET
//required data: id
//optional data: none
handlers._checks.get = (data,callback) => {
  //Checl that the id is valide
  let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id) {
    //lookup the check
    _data.read('checks',id, (err,checkData) => {
      if(!err && checkData) {
        // Get token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        //Verify token is valid and belongs to the uses who created the check
        handlers._tokens.verifyToken(token,checkData.userPhone,(tokenIsValid) => {
          if(tokenIsValid) {
            // Return the check data
            callback(200, checkData);
             } else {
                callback(403);
              }
            });

          } else {

              callback(403,{'Error' : 'Missing required token in header, or token is invalide'});
          }
        });
      } else {
        callback(404);
      }
  };

//checks - PUT
//Required data: id
//optional data: protocol,url,method,successCodes, timeoutSeconds (one must be set)
handlers._checks.put = (data,callback) => {
  //Check required field
  let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  //Check optional fields
  let protocol = typeof(data.payload.protocol) == 'string' && ['http','https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  let url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url : false;
  let method = typeof(data.payload.method) == 'string' && ['get','post','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
  let successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
  let timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;
  //Check to be sure id is valide
  if(id) {
    //Check to be sure one or more optional field has been strLength
    if(protocol || url || method || successCodes || timeoutSeconds) {
      //Looking up the Check
      _data.read('checks',id,(err,checkData) =>{
        if(!err && checkData) {
          // Get token from the headers
          let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
          //Verify token is valid and belongs to the uses who created the check
          handlers._tokens.verifyToken(token,checkData.userPhone,(tokenIsValid) => {
            if(tokenIsValid) {
              // update the  check where necesssary
              if(protocol) {
                checkData.protocol = protocol;
              }
              if(url) {
                checkData.url = url;
              }
              if(method) {
                checkData.method = method;
              }
              if(successCodes) {
                checkData.successCodes = successCodes;
              }
              if(timeoutSeconds) {
                checkData.timeoutSeconds = timeoutSeconds;
              }
              _data.update('checks',id,checkData,(err) => {
                  if(!err) {
                      callback(200);
                  } else {
                    callback(500,{"Error":"Could not update the check"});
                  }
                });
              } else {
                  callback(403);
                }
              });


        } else {
          callback(400, {"Error":".check ID is invalid"});
        }
      });
    } else {
      callback(400, {"Error" : "Missing field to update"});
    }
  } else {
    callback(400, {"Error":"Missing required field"});
  }


};

//checks - DELETE
//Required data: id
//optional data: none
handlers._checks.delete = (data,callback) => {
  //Checl that the phone number is valide
  let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id) {

    //Lookup the checks
    _data.read('checks',id,(err,checkData) =>{
      if(!err && checkData) {
        // Get token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given tokens is valid for the phone number
        handlers._tokens.verifyToken(token,checkData.userPhone,(tokenIsValid) => {
          if(tokenIsValid) {
            // Delete the check _data
            _data.delete('checks',id , (err) => {
              if(!err) {
                // Lookup the user
                _data.read('users',checkData.userPhone,(err,userData) => {
                  if(!err && userData) {

                    let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                    // Remove the deleted check from their list of _checks
                    console.log(userData);
                    let checkPosition = userChecks.indexOf(id);
                    if(checkPosition > -1) {
                      userChecks.splice(checkPosition,1);
                      // Re-save user data
                      _data.update('users',checkData.userPhone,userData,(err) => {
                        if(!err) {
                          callback(200);
                        } else {
                          callback(500,{'Error' : 'Could not update the user'});
                        }
                      });
                    } else {
                      callback(500,{'Error' : 'Could not find the check on the user object, so coul not remove it'});
                    }



                  } else {
                    callback(500,{'Error' : 'Could not find the user who created the check, so could not remove the check from the list of check of the user object'});
                  }
                });
              } else {
                callback(500,{"Error": "Could not delete check data"});
              }
            });

          } else {
            callback(403,{'Error' : 'Missing required token in header, or token is invalide'});
          }
        });

      } else {
        callback(400,{"Error":"The specified check ID does not exist"});
      }
    });


  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }


};



// Ping handlers
handlers.ping = (data,callback) => {
  callback(200);
};


module.exports = handlers;
