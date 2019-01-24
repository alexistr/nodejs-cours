/*
* Example VM
* Runnig somme arbitrary commands
*/

//Dependencies
const vm = require('vm');

// Define a context fot the scriot to run in
const context = {
  'foo': 25
};

// Define the script
let script = new vm.Script(`
var foo = foo * 2;
bar = foo + 1;
fizz = 52;

  `);

// Run the script
script.runInNewContext(context);
console.log(context);
