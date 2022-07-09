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
};

environments.production = {
  port: 5000,
  envName: 'production',
  secretKey: 'ersfsdflkjsadlfj',
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
