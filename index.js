/**
 * Title: Project Initial File
 * Description: Initial fie to start the node server and workers
 * Author: Ekram Ullah
 * Data: 11.07.2022
 */

// dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

// app object - module scaffolding
const app = {};

app.init = () => {
  // start the server
  server.init();
  // start the workerss
  workers.init();
};

app.init();

// export the app
module.exports = app;
