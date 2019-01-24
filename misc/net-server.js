/*
* Example TCP (Net) server
* Listen to port 6000 and sends the word "pong" to client
*/

// Dependencies
net = require('net');

// Crete the server
let server = net.createServer((connection)=>{
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
