/**
 * Title: Sample Handler
 * Description: Sample Handler
 * Author: Ekram Ullah
 * Data: 09.07.2022
 */

// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
  callback(200, {
    message: 'this is a sample url',
  });
};

// export
module.exports = handler;
