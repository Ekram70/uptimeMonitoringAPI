/**
 * Title: Not Found Handler
 * Description: Not Found Handler
 * Author: Ekram Ullah
 * Data: 09.07.2022
 */

// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
  callback(404, {
    message: 'Your resquested url was not found',
  });
};

// export
module.exports = handler;
