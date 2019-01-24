/*
* Example tcp (Net) client
* Connect to port 6000 and sends the world "ping" to the server
*/

// Dependencies
const net =require('net');

// Define the message to sender
let outboundMessage = 'ping';
// Crete client
let client = net.createConnection({'port':6000},()=> {
  // Send the message
  client.write(outboundMessage);
});

// When the server rites back, log what is says then kill the client
client.on('data', (inboundMessage) => {
  messageString = inboundMessage.toString();
  console.log("I wrote "+outboundMessage+" and they said "+messageString);
  client.end();
});
