/*
* Example HTTP2 Client
*/

// depandencies
const http2 = require('http2');

// Create client
let client = http2.connect('http://localhost:6000');

// Create a request
let req = client.request({
  ':path' : '/'
});

// When a message is received, add the pieces of it together until you reach the end
let str = '';
req.on('data',(chunk) => {
  str+=chunk;
});

// When the message ends, log it out
req.on('end',()=>{
  console.log(str);
});

//End the request
req.end();
