/*
* Example HTTP2 server
*/

//Dependencies
const http2 = require('http2');

//init the server
let server = http2.createServer();

// On a stream, send back hello world html
server.on('stream', (stream,headers)=>{
  stream.respond({
    'status' : 200,
    'content-type': 'text/html'
  });
  stream.end('<html><body><p>Hello world!</p></body></html>');
});

//Listen on 6000
server.listen(6000);
