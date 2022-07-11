/**
 * Title: Notifications Library
 * Description: Important functions to notify users
 * Author: Ekram Ullah
 * Data: 11.07.2022
 */

// dependencies
const https = require('https');
const querystring = require('querystring');
const { twilio } = require('./environments');

// notifications object - module scaffolding
const notifications = {};

// send sms to user using twilio api
notifications.sendTwilioSms = (phone, msg, callback) => {
  // input validation
  const userPhone =
    typeof phone === 'string' && phone.trim().length === 11
      ? phone.trim()
      : false;

  const userMsg =
    typeof msg === 'string' &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userPhone && userMsg) {
    // configure the request payload
    const payload = {
      Body: userMsg,
      From: twilio.fromPhone,
      To: `+88${userPhone}`,
    };

    // stringify the payload
    const stringifyPayload = querystring.stringify(payload);

    // configure the request details
    const requestDetails = {
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    // instantiate the request object
    const req = https.request(requestDetails, (res) => {
      // get the status code
      const status = res.statusCode;

      // callback successful if the request wen trought
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    req.on('error', (error) => {
      callback(error);
    });

    req.write(stringifyPayload);
    req.end();
  } else {
    callback('Given paramenters were missing or invalid');
  }
};

// export the module
module.exports = notifications;
