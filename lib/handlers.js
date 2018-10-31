/*
 *
 * Request handlers
 *
 */

 //Depndancies


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
  let lasttName = typeof(data.payload.lasttName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone : false;
  let password = typeof(data.payload.password) == 'string'  && data.payload.lastName.trim().length > 0 ? data.payload.password : false;
  let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && tosAgreement) {
    // Make sure that the user dosent already exist
  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }
}
//Users - get
handlers._users.get = (data,callback) =>
{

}
//Users - put
handlers._users.put = (data,callback) =>
{

}
//Users - delete
handlers._users.delete = (data,callback) =>
{

}

// Ping handlers
handlers.ping = (data,callback) => {
  callback(200);
};

handlers.notFound = (data,callback) => {
callback(404);
};

module.exports = handlers;
