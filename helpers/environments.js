/**
 * Title: Environment
 * Description: Handle all environment related things
 * Author: Ekram Ullah
 * Data: 09.07.2022
 */

// dependencies

// module scaffolding
const environments = {};

environments.staging = {
  port: 3000,
  envName: 'staging',
  secretKey: 'adsfdsawertsxcv',
  maxChecks: 5,
  twilio: {
    fromPhone: '+19854647836',
    accountSid: 'ACfb46ee4da1fecf9f187d17f29ee6bc1b',
    authToken: '856c4f5820f554881bbcf74b73d721ea',
    // updata the auth token because it changes after sometimes
  },
};

environments.production = {
  port: 5000,
  envName: 'production',
  secretKey: 'ersfsdflkjsadlfj',
  maxChecks: 5,
  twilio: {
    fromPhone: '+19854647836',
    accountSid: 'ACfb46ee4da1fecf9f187d17f29ee6bc1b',
    authToken: '1d518abe7e27d80dc8b72025e3d42807',
    // updata the auth token because it changes after sometimes
  },
};

// determine which environment was passed
const currentEnvironment =
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentToExport =
  typeof environments[currentEnvironment] === 'object'
    ? environments[currentEnvironment]
    : environments.staging;

// export module
module.exports = environmentToExport;
