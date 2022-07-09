/**
 * Title: Routes
 * Description: Application Routes
 * Author: Ekram Ullah
 * Data: 09.07.2022
 */

// dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');
const { userHandler } = require('./handlers/routeHandlers/userHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');

const routes = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
};

// exports
module.exports = routes;
