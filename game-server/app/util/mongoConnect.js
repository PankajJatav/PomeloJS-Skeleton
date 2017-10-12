var genericPool = require('generic-pool');
var MongoClient = require('mongodb').MongoClient;
var mongoConfig = require('../../../shared/config/mongoConfig.json');

/**
 * Step 1 - Create pool using a factory object
 */
const factory = {
    create: function(){
         return new Promise(function(resolve, reject){
            var mongoAddress = 'mongodb://localhost:27017/gameTest';//'mongodb://' + mongoConfig.host + ':' + mongoConfig.port + '/gameTest';// + mongoConfig.database;
            MongoClient.connect(mongoAddress, function(err, db) {
              if (err) {
                  reject(reject);
                  console.error(err);
                  return;
              }
              resolve(db);
            })
        })
    },
    destroy: function(client){
        return new Promise(function(resolve){
          client.on('end', function(){
            resolve()
          })
          client.disconnect()
        })
    }
}

var opts = {
    max: 10, // maximum size of the pool
    min: 2 // minimum size of the pool
}

//var MongoPool = genericPool.createPool(factory, opts)

module.exports = genericPool.createPool(factory, opts)//MongoPool;