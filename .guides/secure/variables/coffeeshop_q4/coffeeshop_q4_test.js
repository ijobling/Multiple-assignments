//coffeeshop_q4_test.js
var fs = require('fs');
var exec = require('child_process').exec, child;
var testPasses = true;
var noErrors = true;

function runTest() {
   
  child = exec('node /home/codio/workspace/code/variables/coffeeshop_q4.js',
        function (error, stdout, stderr) {
        //console.log("Start of runtest")
          if (error != null){
            console.log("File did not meet specifications");
            process.exit(3);
          } else {
              //console.log("File ran perfectly")
              noErrors = true;
          }
        }
     );
}


function mochaTest() {
  child = exec('mocha /home/codio/workspace/.guides/secure/variables/coffeeshop_q4/coffeeshop_q4_testcases.js',
      function (error, stdout, stderr) {
        if (stdout.includes('failing')) {
          var s = stdout;
          s = s.substring(0, s.indexOf('failing') + 7);
          console.log(s + '\n');
          process.exit(1)
        } else if (stdout.includes('✓')) {
          console.log('All tests passed');
          process.exit(0)
        }  
  });
}

runTest();
mochaTest();