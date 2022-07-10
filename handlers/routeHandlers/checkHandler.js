/**
 * Title: Check Handler
 * Description: Handler to handle user defined checks
 * Author: Ekram Ullah
 * Data: 10.07.2022
 */

// dependencies
const data = require('../../lib/data');
const { createRandomString, parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
  // validate input
  let protocol =
    typeof requestProperties.body.protocol === 'string' &&
    ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === 'string' &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === 'string' &&
    ['get', 'post', 'put', 'delete'].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  let successCodes = Array.isArray(requestProperties.body.successCodes)
    ? requestProperties.body.successCodes
    : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === 'number' &&
    Number.isInteger(requestProperties.body.timeoutSeconds) &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // verify token
    let tokenId =
      typeof requestProperties.headersObject.tokenid === 'string'
        ? requestProperties.headersObject.tokenid
        : false;

    // lookup the user phone by reading the tokenId
    data.read('tokens', tokenId, function (readError, token) {
      if (!readError && token) {
        let userPhone = parseJSON(token).phone;
        // lookup the user data.
        data.read('users', userPhone, function (readError2, user) {
          if (!readError2 && user) {
            tokenHandler._token.verify(
              tokenId,
              userPhone,
              function (tokenIsValid) {
                if (tokenIsValid) {
                  let validUser = parseJSON(user);
                  let userChecks = Array.isArray(validUser.checks)
                    ? validUser.checks
                    : [];

                  if (userChecks.length < maxChecks) {
                    let checkId = createRandomString(20);
                    let checkObj = {
                      checkId,
                      userPhone,
                      protocol,
                      url,
                      method,
                      successCodes,
                      timeoutSeconds,
                    };
                    //   save the boject to database
                    data.create(
                      'checks',
                      checkId,
                      checkObj,
                      function (createError) {
                        if (!createError) {
                          // add check id to the users object
                          validUser.checks = userChecks;
                          validUser.checks.push(checkId);
                          // save the new user data to database
                          data.update(
                            'users',
                            userPhone,
                            validUser,
                            function (updateError) {
                              if (!updateError) {
                                // return the data about the new check
                                callback(200, checkObj);
                              } else {
                                callback(500, {
                                  error:
                                    'There was a problem is the server side',
                                });
                              }
                            }
                          );
                        } else {
                          callback(500, {
                            error: 'There was a problem is the server side',
                          });
                        }
                      }
                    );
                  } else {
                    callback(401, {
                      error: 'User has already reached maxChecks limit',
                    });
                  }
                } else {
                  callback(403, {
                    error: 'Authentication problem.',
                  });
                }
              }
            );
          } else {
            callback(403, {
              error: 'User not found',
            });
          }
        });
      } else {
        callback(403, {
          error: 'Authentication problem.',
        });
      }
    });
  } else {
    callback(400, {
      error: 'You have a problem in your request',
    });
  }
};

handler._check.get = (requestProperties, callback) => {
  // check the checkId is valid
  const checkId =
    typeof requestProperties.queryStringObject.checkId === 'string' &&
    requestProperties.queryStringObject.checkId.trim().length === 20
      ? requestProperties.queryStringObject.checkId
      : false;

  if (checkId) {
    // lookup the check
    data.read('checks', checkId, function (readError, check) {
      if (!readError && check) {
        let validCheck = parseJSON(check);
        // verify token
        let tokenId =
          typeof requestProperties.headersObject.tokenid === 'string'
            ? requestProperties.headersObject.tokenid
            : false;

        tokenHandler._token.verify(
          tokenId,
          validCheck.userPhone,
          function (tokenIsValid) {
            if (tokenIsValid) {
              callback(200, validCheck);
            } else {
              callback(403, {
                error: 'Authentication error',
              });
            }
          }
        );
      } else {
        callback(500, {
          error: 'There is a server side problem',
        });
      }
    });
  } else {
    callback(400, {
      error: 'You have a problem in your request',
    });
  }
};

handler._check.put = (requestProperties, callback) => {
  // check the checkId is valid
  const checkId =
    typeof requestProperties.body.checkId === 'string' &&
    requestProperties.body.checkId.trim().length === 20
      ? requestProperties.body.checkId
      : false;

  // validate inputs
  let protocol =
    typeof requestProperties.body.protocol === 'string' &&
    ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === 'string' &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === 'string' &&
    ['get', 'post', 'put', 'delete'].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  let successCodes = Array.isArray(requestProperties.body.successCodes)
    ? requestProperties.body.successCodes
    : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === 'number' &&
    Number.isInteger(requestProperties.body.timeoutSeconds) &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (checkId) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read('checks', checkId, function (readError, check) {
        if (!readError && check) {
          let validCheck = parseJSON(check);
          // verify token
          let tokenId =
            typeof requestProperties.headersObject.tokenid === 'string'
              ? requestProperties.headersObject.tokenid
              : false;
          tokenHandler._token.verify(
            tokenId,
            validCheck.userPhone,
            function (tokenIsValid) {
              if (tokenIsValid) {
                if (protocol) {
                  validCheck.protocol = protocol;
                }
                if (url) {
                  validCheck.url = url;
                }
                if (method) {
                  validCheck.method = method;
                }
                if (successCodes) {
                  validCheck.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  validCheck.timeoutSeconds = timeoutSeconds;
                }

                // store the updated check
                data.update(
                  'checks',
                  checkId,
                  validCheck,
                  function (updateError) {
                    if (!updateError) {
                      callback(200);
                    } else {
                      callback(500, {
                        error: 'There was a server side error',
                      });
                    }
                  }
                );
              } else {
                callback(403, {
                  error: 'Authentication error',
                });
              }
            }
          );
        } else {
          callback(500, {
            error: 'There was a server side problem',
          });
        }
      });
    } else {
      callback(400, {
        error: 'Must provide at least one field to update',
      });
    }
  } else {
    callback(400, {
      error: 'You have a problem in your request',
    });
  }
};

handler._check.delete = (requestProperties, callback) => {
  // check the checkId is valid
  const checkId =
    typeof requestProperties.queryStringObject.checkId === 'string' &&
    requestProperties.queryStringObject.checkId.trim().length === 20
      ? requestProperties.queryStringObject.checkId
      : false;

  if (checkId) {
    // lookup the check
    data.read('checks', checkId, function (readError, check) {
      if (!readError && check) {
        let validCheck = parseJSON(check);
        // verify token
        let tokenId =
          typeof requestProperties.headersObject.tokenid === 'string'
            ? requestProperties.headersObject.tokenid
            : false;

        tokenHandler._token.verify(
          tokenId,
          validCheck.userPhone,
          function (tokenIsValid) {
            if (tokenIsValid) {
              // delete the check data
              data.delete('checks', checkId, function (deleteError) {
                if (!deleteError) {
                  data.read(
                    'users',
                    validCheck.userPhone,
                    function (readError, user) {
                      let validUser = parseJSON(user);
                      if (!readError && user) {
                        let userChecks = Array.isArray(validUser.checks)
                          ? validUser.checks
                          : [];

                        //   delete checkid from user
                        let checkPosition = userChecks.indexOf(checkId);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          // resave the user data
                          validUser.checks = userChecks;
                          data.update(
                            'users',
                            validUser.phone,
                            validUser,
                            function (updateError) {
                              if (!updateError) {
                                callback(200);
                              } else {
                                callback(500, {
                                  error: 'There is a server side problem',
                                });
                              }
                            }
                          );
                        } else {
                          callback(500, {
                            error:
                              'The checkId that you are trying to remove is not found in user',
                          });
                        }
                      } else {
                        callback(500, {
                          error: 'There is a server side problem',
                        });
                      }
                    }
                  );
                } else {
                  callback(500, {
                    error: 'There is a server side problem',
                  });
                }
              });
            } else {
              callback(403, {
                error: 'Authentication error',
              });
            }
          }
        );
      } else {
        console.log(readError);
        callback(500, {
          error: 'There is a server side problem',
        });
      }
    });
  } else {
    callback(400, {
      error: 'You have a problem in your request',
    });
  }
};

// export
module.exports = handler;
