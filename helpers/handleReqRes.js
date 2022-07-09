/**
 * Title: Handle Request Resqponse
 * Description: Handle Request Resqponse
 * Author: Ekram Ullah
 * Data: 09.07.2022
 */

// dependencies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const {
  notFoundHandler,
} = require('../handlers/routeHandlers/notFoundHandler');
const { parseJSON } = require('../helpers/utilities');

// module scaffolding
const handler = {};

// handle request response
handler.handleReqRes = (req, res) => {
  // request handle
  // get the url and parse it
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/|\/+$/g, '');
  const method = req.method.toLowerCase();
  const queryStringObject = parsedUrl.query;
  const headersObject = req.headers;

  const requestProperties = {
    parsedUrl,
    path,
    trimmedPath,
    method,
    queryStringObject,
    headersObject,
  };

  const decoder = new StringDecoder('utf-8');
  let realData = '';

  const chosenHandler = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler;

  req.on('data', (buffer) => {
    realData += decoder.write(buffer);
  });
  req.on('end', () => {
    realData += decoder.end();

    requestProperties.body = parseJSON(realData);

    // chosen handler
    chosenHandler(requestProperties, (statusCode, payLoad) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      payLoad = typeof payLoad === 'object' ? payLoad : {};

      const payLoadString = JSON.stringify(payLoad);

      // return the final response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payLoadString);
    });
  });
};

// export
module.exports = handler;
