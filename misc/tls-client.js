/*
* Example TLS client
* Connect to port 6000 and sends the world "ping" to the server
*/

// Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Server option
const options = {
  'ca': fs.readFileSync(path.join(__dirname,'../https/cert.pem')) // Only require for self ign certificate
};

// Define the message to sender
let outboundMessage = 'ping';
// Crete client
let client = tls.connect(6000,options,()=> {
  // Send the message
  client.write(outboundMessage);
});

// When the server rites back, log what is says then kill the client
client.on('data', (inboundMessage) => {
  messageString = inboundMessage.toString();
  console.log("I wrote "+outboundMessage+" and they said "+messageString);
  client.end();
});
