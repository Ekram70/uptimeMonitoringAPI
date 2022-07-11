/**
 * Title: Uptime Monitoring Application
 * Description: A RESTFul API to monitor up or down time of user defined links
 * Author: Ekram Ullah
 * Data: 09.07.2022
 */

// dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const { sendTwilioSms } = require('./helpers/notifications');

// app object - module scaffolding
const app = {};

// @todo delete this
sendTwilioSms(
  '01867939463',
  'I am Ekram. This sms is generated from my NodeJs project.',
  function (error) {
    console.log(`Error was ${error}`);
  }
);

// handle request response
app.handleReqRes = handleReqRes;

// create server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environment.port, () => {
    console.log(`listening to port ${environment.port}`);
  });
};

// start the server
app.createServer();
