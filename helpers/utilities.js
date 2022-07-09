/**
 * Title: Utilities
 * Description: Important utilities function
 * Author: Ekram Ullah
 * Data: 09.07.2022
 */

// dependencies
const crypto = require('crypto');
const { type } = require('os');
const environments = require('./environments');

// module scaffolding
const utilities = {};

// parse JSON string to Object
utilities.parseJSON = (jsonString) => {
  let output;
  try {
    output = JSON.parse(jsonString);
  } catch (error) {
    output = {};
  }
  return output;
};

// hash string
utilities.hash = (string) => {
  if (typeof string === 'string' && string.length > 0) {
    let hash = crypto
      .createHmac('sha256', environments.secretKey)
      .update(string)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

// create random string
utilities.createRandomString = (stringLength) => {
  let length = stringLength;
  length =
    typeof stringLength === 'number' && stringLength > 0 ? stringLength : false;
  if (length) {
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let output = '';
    for (let i = 0; i < stringLength; i++) {
      let randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      output += randomCharacter;
    }
    return output;
  } else {
    return false;
  }
};

// export
module.exports = utilities;
