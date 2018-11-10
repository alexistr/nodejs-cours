/*
* This is a librsry for toring and rotating logs
*
*/

//Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

//Container for the module
let lib = {};

//Base directory of te logs folder
lib.baseDir = path.join(__dirname,'/../.logs/');

//Append a string to a file Create the file if it does not exists
lib.append = (file,str,callback)=> {
  //Openig the file for appending
  fs.open(lib.baseDir+file+'.log','a',(err,fileDescriptor)=>{
    if(!err && fileDescriptor) {
      //Append to the file and close it
      fs.appendFile(fileDescriptor,str+'\n',(err)=>{
        if(!err) {
          fs.close(fileDescriptor,(err)=>{
            if(!err) {
              callback(false);
            } else {
              callback('Error closing the file that was being appending');
            }
          });

        } else {
          callback('Error appending the file');
        }
      });

    } else {
      callback('Could not open file for appending');
    }
  });
};





//Export the module
module.exports = lib;
