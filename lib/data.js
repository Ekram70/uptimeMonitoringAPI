/**
 * Title: Data
 * Description: Handling all data
 * Author: Ekram Ullah
 * Data: 09.07.2022
 */

// dependencies
const { error } = require('console');
const fs = require('fs');
const path = require('path');

// module scaffloding
const lib = {};

// base directory of the data folder
lib.basedir = path.join(__dirname, '/../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
  // open file for writing
  fs.open(
    lib.basedir + dir + '/' + file + '.json',
    'wx',
    function (openError, fileDescriptor) {
      if (!openError && fileDescriptor) {
        // convert data to string
        const stringData = JSON.stringify(data);

        // write data to file and then close it
        fs.writeFile(fileDescriptor, stringData, function (writeError) {
          if (!writeError) {
            fs.close(fileDescriptor, function (CloseError) {
              if (!CloseError) {
                callback(false);
              } else {
                callback('error closing the new file');
              }
            });
          } else {
            callback('error writing to new file');
          }
        });
      } else {
        callback('could not create new file, it may already exist');
      }
    }
  );
};

// read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(
    lib.basedir + dir + '/' + file + '.json',
    'utf-8',
    function (readError, data) {
      callback(readError, data);
    }
  );
};

// updata existing file
lib.update = (dir, file, data, callback) => {
  // file open for writing
  fs.open(
    lib.basedir + dir + '/' + file + '.json',
    'r+',
    function (openError, fileDescriptor) {
      if (!openError && fileDescriptor) {
        // convert data to string
        const stringData = JSON.stringify(data);

        // truncate the file
        fs.ftruncate(fileDescriptor, function (trancateError) {
          if (!trancateError) {
            // write to the file and close it
            fs.writeFile(fileDescriptor, stringData, function (writeError) {
              if (!writeError) {
                // close the file
                fs.close(fileDescriptor, function (CloseError) {
                  if (!CloseError) {
                    callback(false);
                  } else {
                    callback('error closing file');
                  }
                });
              } else {
                callback('error writing file');
              }
            });
          } else {
            callback('error truncating file');
          }
        });
      } else {
        callback('error updating. file may not exist');
      }
    }
  );
};

// delete existing file
lib.delete = (dir, file, callback) => {
  // unlink file
  fs.unlink(lib.basedir + dir + '/' + file + '.json', function (unlinkError) {
    if (!unlinkError) {
      callback(false);
    } else {
      callback('Error deleting file');
    }
  });
};

// list all the items in a directory
lib.list = (dir, callback) => {
  fs.readdir(lib.basedir + dir, function (readdirError, fileNames) {
    if (!readdirError && fileNames && fileNames.length > 0) {
      let trimmedFileNames = [];
      fileNames.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace('.json', ''));
      });

      callback(trimmedFileNames);
    } else {
      callback('Error reading directory');
    }
  });
};

// export module
module.exports = lib;
