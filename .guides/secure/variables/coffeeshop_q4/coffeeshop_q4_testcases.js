//coffeeshop_q4_testcases.js
var assert = require('chai').assert;
var data = require('/home/codio/workspace/code/variables/coffeeshop_q4.js')

describe('The variables for the coffee shop program', () => {
  it('should contain the values specified in the question', function () {
    assert.equal(data[0], "101 Coffeeway St");
    assert.equal(data[1], 1.25);
    assert.equal(data[2], 2.00);
    assert.equal(data[3], 3.25);
    assert.equal(data[4], true);
    assert.equal(data[5], undefined);
  });
});