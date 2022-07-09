/**
 * Title: Token Handler
 * Description: Handler to handle token related routes
 * Author: Ekram Ullah
 * Data: 09.07.2022
 */

// dependencies
const data = require('../../lib/data');
const {
  hash,
  parseJSON,
  createRandomString,
} = require('../../helpers/utilities');

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.body.phone === 'string' &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === 'string' &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone && password) {
    data.read('users', phone, function (readError, user) {
      if (!readError && user) {
        const validUser = { ...parseJSON(user) };
        let hashedPassword = hash(password);
        if (hashedPassword === validUser.password) {
          let tokenId = createRandomString(20);
          let expires = Date.now() + 60 * 60 * 1000;
          let tokenObject = {
            phone,
            tokenId,
            expires,
          };

          // store the token
          data.create('tokens', tokenId, tokenObject, function (createError) {
            if (!createError) {
              callback(200, tokenObject);
            } else {
              callback(400, {
                error: 'Token creating failed',
              });
            }
          });
        } else {
          callback(400, {
            error: 'Passoword is not valid',
          });
        }
      } else {
        callback(400, {
          error: 'User does not exist',
        });
      }
    });
  } else {
    callback(400, {
      error: 'You have a problem in your request',
    });
  }
};

handler._token.get = (requestProperties, callback) => {
  // check the tokenId is valid
  const tokenId =
    typeof requestProperties.queryStringObject.tokenId === 'string' &&
    requestProperties.queryStringObject.tokenId.trim().length === 20
      ? requestProperties.queryStringObject.tokenId
      : false;

  if (tokenId) {
    // lookup the user
    data.read('tokens', tokenId, function (readError, token) {
      const validToken = { ...parseJSON(token) };
      if (!readError && validToken) {
        callback(200, validToken);
      } else {
        callback(404, {
          error: 'requested token was not found',
        });
      }
    });
  } else {
    callback(404, {
      error: 'provide a valid tokenId',
    });
  }
};

handler._token.put = (requestProperties, callback) => {
  // check the tokenId is valid
  const tokenId =
    typeof requestProperties.body.tokenId === 'string' &&
    requestProperties.body.tokenId.trim().length === 20
      ? requestProperties.body.tokenId
      : false;

  const extend =
    typeof requestProperties.body.extend === 'boolean' &&
    requestProperties.body.extend === true
      ? true
      : false;

  console.log(requestProperties);
  if (tokenId && extend) {
    data.read('tokens', tokenId, function (readError, token) {
      if (!readError && token) {
        const validToken = { ...parseJSON(token) };
        if (validToken.expires > Date.now()) {
          validToken.expires = Date.now() + 60 * 60 * 1000;
          // store the updated token
          data.update('tokens', tokenId, validToken, function (updateError) {
            if (!updateError) {
              callback(200, {
                message: 'token updated',
              });
            } else {
              callback(400, {
                error: 'token update failed',
              });
            }
          });
        } else {
          callback(400, {
            message: 'token already expired',
          });
        }
      } else {
        callback(400, {
          error: 'token does not exist',
        });
      }
    });
  } else {
    callback(400, {
      error: 'provide a valid tokenId',
    });
  }
};

handler._token.delete = (requestProperties, callback) => {
  // check the token is valid
  const tokenId =
    typeof requestProperties.queryStringObject.tokenId === 'string' &&
    requestProperties.queryStringObject.tokenId.trim().length === 20
      ? requestProperties.queryStringObject.tokenId
      : false;

  if (tokenId) {
    // lookup the user
    data.read('tokens', tokenId, function (readError, token) {
      if (!readError && token) {
        data.delete('tokens', tokenId, function (deleteError) {
          if (!deleteError) {
            callback(200, {
              message: 'Token was successfully deleted',
            });
          } else {
            callback(500, {
              error: 'There was a server side problem',
            });
          }
        });
      } else {
        callback(500, {
          error: 'There was a server side problem',
        });
      }
    });
  } else {
    callback(400, {
      error: 'There was a problem in your request',
    });
  }
};

handler._token.verify = (tokenId, phone, callback) => {
  data.read('tokens', tokenId, function (readError, token) {
    if (!readError && token) {
      const validToken = { ...parseJSON(token) };
      if (validToken.phone === phone && validToken.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// export
module.exports = handler;
