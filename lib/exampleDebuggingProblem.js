/*
* Library that deonstrates something throwing when it's init() is called
*/

let example = {};

//Init function
example.init = () => {
  // this is an error created intentionnaly (bar is not defined)
  let foo = bar;
};

// Export the module
module.exports = example;
