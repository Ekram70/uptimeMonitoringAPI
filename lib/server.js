/**
 * Title: Server Library
 * Description: Server related files
 * Author: Ekram Ullah
 * Data: 11.07.2022
 */

// dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');

// server object - module scaffolding
const server = {};

// handle request response
server.handleReqRes = handleReqRes;

// create server
server.createServer = () => {
  const serverVariable = http.createServer(server.handleReqRes);
  serverVariable.listen(environment.port, () => {
    console.log(`listening to port ${environment.port}`);
  });
};

// start the server
server.init = () => {
  server.createServer();
};

// export the module
module.exports = server;
