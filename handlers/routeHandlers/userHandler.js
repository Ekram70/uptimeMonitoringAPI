/**
 * Title: User Handler
 * Description: Handler to handle user related routes
 * Author: Ekram Ullah
 * Data: 09.07.2022
 */

// dependencies
const data = require('../../lib/data');
const { hash, parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._user[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._user = {};

handler._user.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === 'string' &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === 'string' &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

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

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === 'boolean'
      ? requestProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the user doesn't already exist
    data.read('users', phone, function (readError) {
      if (readError) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };
        // store the user to db
        data.create('users', phone, userObject, function (createError) {
          if (!createError) {
            callback(200, { message: 'user was created' });
          } else {
            callback(500, { error: 'could not create user' });
          }
        });
      } else {
        callback(500, {
          error: 'There was a problem in server side',
        });
      }
    });
  } else {
    callback(400, {
      error: 'You have a problem in your request',
    });
  }
};

handler._user.get = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === 'string' &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    // verify token
    let tokenId =
      typeof requestProperties.headersObject.tokenid === 'string'
        ? requestProperties.headersObject.tokenid
        : false;

    tokenHandler._token.verify(tokenId, phone, function (tokenId) {
      if (tokenId) {
        // lookup the user
        data.read('users', phone, function (readError, user) {
          const validUser = { ...parseJSON(user) };
          if (!readError && validUser) {
            delete validUser.password;
            callback(200, validUser);
          } else {
            callback(404, {
              error: 'requested user was not found',
            });
          }
        });
      } else {
        callback(403, {
          error: 'Authentication failure',
        });
      }
    });
  } else {
    callback(404, {
      error: 'provide a valid phone number',
    });
  }
};

handler._user.put = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.body.phone === 'string' &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const firstName =
    typeof requestProperties.body.firstName === 'string' &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === 'string' &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const password =
    typeof requestProperties.body.password === 'string' &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;
  if (phone) {
    if (firstName || lastName || password) {
      // verify token
      let tokenId =
        typeof requestProperties.headersObject.tokenid === 'string'
          ? requestProperties.headersObject.tokenid
          : false;

      tokenHandler._token.verify(tokenId, phone, function (tokenId) {
        if (tokenId) {
          // lookup the user
          data.read('users', phone, function (readError, user) {
            const validUser = { ...parseJSON(user) };
            if (!readError && validUser) {
              if (firstName) {
                validUser.firstName = firstName;
              }
              if (lastName) {
                validUser.lastName = lastName;
              }
              if (password) {
                validUser.password = hash(password);
              }

              // store to database
              data.update('users', phone, validUser, function (updateError) {
                if (!updateError) {
                  callback(200, {
                    message: 'User was updated successfully',
                  });
                } else {
                  callback(500, {
                    error: 'There is problem in the server side',
                  });
                }
              });
            } else {
              callback(400, {
                error: 'Your have a problem in your request',
              });
            }
          });
        } else {
          callback(403, {
            error: 'Authentication failure',
          });
        }
      });
    } else {
      callback(400, {
        error: 'Your have a problem in your request',
      });
    }
  } else {
    callback(400, {
      error: 'Invalid phone number. Please try again',
    });
  }
};

handler._user.delete = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === 'string' &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    // verify token
    let tokenId =
      typeof requestProperties.headersObject.tokenid === 'string'
        ? requestProperties.headersObject.tokenid
        : false;

    tokenHandler._token.verify(tokenId, phone, function (tokenId) {
      if (tokenId) {
        // lookup the user
        data.read('users', phone, function (readError, user) {
          if (!readError && user) {
            data.delete('users', phone, function (deleteError) {
              if (!deleteError) {
                callback(200, {
                  message: 'User was successfully deleted',
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
        callback(403, {
          error: 'Authentication failure',
        });
      }
    });
  } else {
    callback(400, {
      error: 'There was a problem in your request',
    });
  }
};

// export
module.exports = handler;
