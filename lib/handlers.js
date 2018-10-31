/*
 *
 * Request handlers
 *
 */

 //Depndancies
const _data = require('./data');
const helpers = require('./helpers');

//Define the handlers
let handlers = {};


// Usser
handlers.users = (data,callback) => {
  let acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1 ) {
    handlers._users[data.method](data,callback);
  } else {
    callback(405);
  }
}

// Container for users submethods
handlers._users = {};

// Users - post
// Reqıired data: firstname, lastName, phone, password, tosAgreement
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
           callback(500,{'Error' : 'Could not hash the users\'s password' } )
         }
      } else {
        // User already exists
        callback(400,{'Error' : 'A user with that phone number already exists'});
      }
    })

  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }
}
//Users - get
//Required data: phone
//Optional data: none
//@TODO Only let an authentcated user access their object.Don't let them access anyone elses
handlers._users.get = (data,callback) => {
//Checl that the phone number is valide
let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 12 ? data.queryStringObject.phone.trim() : false;
if(phone) {
  // Lookup the user
  _data.read('users',phone,(err,data) => {
    if(!err && data) {
      // Remove the hashedpassword befor returning de data
      delete data.hashedPassword;
      callback(200,data);

    } else {
      callback(404);
    }
  })
} else {
  callback(400,{'Error' : 'Missing required fields'});
}



}
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
  callback(400,{'Error' : 'Missing required fields'});
 }
}


//Users - delete
//Required data : phone
//Optional data: none
//@TODO Only let authenticate user delete their objet ...
//@TODO Clean everything associated to this user
handlers._users.delete = (data,callback) => {
  //Checl that the phone number is valide
  let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 12 ? data.queryStringObject.phone.trim() : false;
  if(phone) {
    // Lookup the user
    _data.read('users',phone,(err,data) => {
      if(!err && data) {
        _data.delete('users',phone,(err) => {
          if(!err) {
            callback(200);
          } else {
            callback(500,{'Error' : 'Could not delete the specified user'});
          }
        });
      } else {
        callback(400,{'Error' : 'Could not find the specified user'});
      }
    })
  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }
}
  //Lookup User



// Ping handlers
handlers.ping = (data,callback) => {
  callback(200);
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
}

// Container for tokenss submethods
handlers._tokens = {};

// Tokens POST
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  // Check phone and password are valide
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 12 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string'  && data.payload.lastName.trim().length > 0 ? data.payload.password : false;
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
          _data.create('tokens',phone,tokenObject, (err)=> {
             if(!err) {
               callback(200, tokenObject);
             } else {
               callback(500,{'Error' : 'Could not create token'});
             }
          })

        } else {
          callback(400,{'Error' : 'password did not match the specified user store password'});
        }
      } else {
        callback(400,{'Error' : 'Could not find the specified user'});
      }
    })
    //Create tokens

   else {
     callback(400,{'Error' : 'Missing required fields'});
   }

};

// Tokens GET
handlers._tokens.get = (data, callback) => {

};

// Tokens PUT
handlers._tokens.put = (data, callback) => {

};

// Tokens DELETE
handlers._tokens.delete = (data, callback) => {

};





module.exports = handlers;
