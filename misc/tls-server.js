/*
* Example TLS server
* Listen to port 6000 and sends the word "pong" to client
*/

// Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Server option
const options = {
  'key': fs.readFileSync(path.join(__dirname,'../../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname,'../../https/cert.pem'))
};
// Crete the server
let server = tls.createServer(options, (connection)=>{
  // Send the world "pong"
  let outboundMessage = 'pong';
  connection.write(outboundMessage);

  // When the client write something, log it out
  connection.on('data', (inboundMessage) => {
    let messageString = inboundMessage.toString();
    console.log("I wrote "+outboundMessage+" and they said "+messageString);
  });
});


// listening
server.listen(6000);
