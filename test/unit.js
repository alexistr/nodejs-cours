/*
* Unit tests
*
*/

"use strict";
//Dependencies
const helpers = require('./../lib/helpers');
const assert = require('assert');
const logs = require('./../lib/logs');
const exampleDebuggingProblem = require('./../lib/../lib/exampleDebuggingProblem');

//Holder for the tests
let unit = {};

// Assert that the getANumber function is returning a number
unit['helpers.getANumber should return a number'] = (done) => {
  let val = helpers.getANumber();
  assert.equal(typeof(val),'number');
  done();
};

// Assert that the getANumber function is returning 1
unit['helpers.getANumber should return 1'] = (done) => {
  let val = helpers.getANumber();
  assert.equal(val,1);
  done();
};

// Assert that the getANumber function is returning a number
unit['helpers.getANumber should return 2'] = (done) => {
  let val = helpers.getANumber();
  assert.equal(val,2);
  done();
};

// logs.list should callback an array and a false errors
unit['logs.list should callback a false error and an array of log names'] = (done) => {
  logs.list(true,(err,logFileNames) => {
    assert.equal(err,false);
    assert.ok(logFileNames instanceof Array);
    assert.ok(logFilesNames.length > 1);
    done();
  });
};

// logs.truncate should not throw if th log id doesnt exists
unit['logs.truncate should not throw if the logId does not exists. It should callback an error instead'] = (done) => {
  assert.doesNotThrow(() => {
    logs.truncate('I do not exist',(err) => {
      assert.ok(err);
      done();
    });

  },TypeError);
};

// exampleDebuggingProblem.init should not throw but it does
unit['exampleDebuggingProblem.init should not throw when called'] = (done) => {
  assert.doesNotThrow(() => {
    exampleDebuggingProblem.init();
    done();
  },TypeError);
};

// Export the tests to the runner
module.exports = unit;
