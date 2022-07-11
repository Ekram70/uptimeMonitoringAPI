/**
 * Title: Worker Library
 * Description: Worker related files
 * Author: Ekram Ullah
 * Data: 11.07.2022
 */

// dependencies
const data = require('./data');
const url = require('url');
const http = require('http');
const https = require('https');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSms } = require('../helpers/notifications');

// workers object - module scaffolding
const workers = {};

// lookup all the checks from database
workers.gatherAllchecks = () => {
  // get all the checks
  data.list('checks', (checks, listError) => {
    if (!listError && checks && checks.length > 0) {
      checks.forEach((check) => {
        // read the checkData
        data.read('checks', check, function (readError, originalCheckData) {
          if (!readError && originalCheckData) {
            // pass the data to the check validator
            workers.validateCheckData(parseJSON(originalCheckData));
          } else {
            console.log('Error reading one of the checks data');
          }
        });
      });
    } else {
      console.log('Error could not find any checks to process');
    }
  });
};

// validata individual check data
workers.validateCheckData = (originalCheckData) => {
  if (originalCheckData && originalCheckData.checkId) {
    originalCheckData.state =
      typeof originalCheckData.state === 'string' &&
      ['up', 'down'].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : 'down';

    originalCheckData.lastChecked =
      typeof originalCheckData.lastChecked === 'number' &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;

    // pass to the next process
    workers.performCheck(originalCheckData);
  } else {
    console.log('Error: check was invalid or not properly formatted');
  }
};

// perform check
workers.performCheck = (originalCheckData) => {
  // prepare the initial check outcome
  let checkOutcome = {
    error: false,
    responseCode: false,
  };

  // mark the outcome has not been send yet
  let outcomeSent = false;

  // parse the hostname & full url from originalCheckData
  let parsedUrl = url.parse(
    originalCheckData.protocol + '://' + originalCheckData.url,
    true
  );
  const hostname = parsedUrl.hostname;
  const path = parsedUrl.path;

  //   construct the request
  const requestDetails = {
    protocol: originalCheckData.protocol + ':',
    hostname: hostname,
    method: originalCheckData.method.toUpperCase(),
    path: path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };

  const protocolToUse = originalCheckData.protocol === 'http' ? http : https;

  let req = protocolToUse.request(requestDetails, (res) => {
    // grab the status of the response
    const status = res.statusCode;

    // update the outcome and pass to the next process
    checkOutcome.responseCode = status;

    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on('error', (error) => {
    checkOutcome = {
      error: true,
      value: error,
    };

    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on('timeout', () => {
    checkOutcome = {
      error: true,
      value: 'timeout',
    };

    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.end();
};

// save check outcome to database and send to next process
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {
  // check if checkoutcome is up or down
  let state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? 'up'
      : 'down';

  // decide whether we should alert the user or not
  let alertWanted = !!(
    originalCheckData.lastChecked && originalCheckData.state !== state
  );

  // update the check data
  let newCheckdata = originalCheckData;
  newCheckdata.state = state;
  newCheckdata.lastChecked = Date.now();

  // update teh check to disk
  data.update(
    'checks',
    newCheckdata.checkId,
    newCheckdata,
    function (updateError) {
      if (!updateError) {
        // send the check data to next process
        if (alertWanted) {
          workers.alertUserToStatusChange(newCheckdata);
        } else {
          console.log('Alert is not needed as state is not changed');
        }
      } else {
        console.log('Error trying to save data of one of the checks');
      }
    }
  );
};

// sned notification to user if state changes
workers.alertUserToStatusChange = (newCheckdata) => {
  let msg = `Alert: Your check for ${newCheckdata.method} ${newCheckdata.protocol}://${newCheckdata.url} is currently ${newCheckdata.state}`;

  sendTwilioSms(newCheckdata.userPhone, msg, function (smsError) {
    if (!smsError) {
      console.log(`User was alerted toa a status change via sms:${msg}`);
    } else {
      console.log('There was a problem sending sms to one of the user');
    }
  });
};

// timer to execute the worker process once per minute
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllchecks();
  }, 8000);
};

// start the server
workers.init = () => {
  // execute all the checks
  workers.gatherAllchecks();

  // call the loop so that checks continue
  workers.loop();
};

// export the module
module.exports = workers;
