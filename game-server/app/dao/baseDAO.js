'use strict';

var assert = require('assert');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

// var MongoClient = require('mongodb').MongoClient;

var BaseDAO = function(collectionName, mongodb) {
    assert.ok(typeof(collectionName) === 'string', 'Error BaseDAO: collectionName is invalid');

    // TODO: check mongodb

    this.mongodb = mongodb;
    this.collectionName = collectionName;
    this.collection = this.mongodb.collection(this.collectionName);
    
    return this;
};

/**
 * insert an plain object or an array of objects to collection. This function does not check object's format,
 *  it should be checked outside of this function.
 * @param {Array|Object} object
 * @param cb
 * @returns {*}
 */
BaseDAO.prototype.add = function(object, cb) {
    var self = this;
    
    if (!_.isArray(object)) {
        return cb(new Error(self.collectionName + 'DAO.add: Invalid object: ' + object));
    }

    this.collection.insert(
        object,
        { safe: true },
        function(err, insertedDocs) {
            if (err) {
                logger.error(self.collectionName + 'DAO.add: insert error: ' + JSON.stringify(err));
                return cb(err);
            }

            if (!_.isArray(insertedDocs.ops)) {
                var msg = 'insert failed: ' + util.inspect(insertedDocs);
                logger.error(msg);
                return cb(new Error(msg));
            }
            cb(null, insertedDocs);
        }
    )
}

/**
 * 添加一条数据到DB
 * @param object
 * @param cb
 * @returns {*}
 */
BaseDAO.prototype.addOne = function(object, cb) {
    var self = this;

    if (!_.isObject(object) || object.length > 1) {
        return cb(new Error(self.collectionName + "DAO.addOne: Invalid object: " + object));
    }

    this.add([object], function(err, insertedDocs) {
        if (err) {
            logger.error(self.collectionName + "DAO.addOne: insert error:" + JSON.stringify(err));
            return cb(err);
        }
        cb(null, insertedDocs[0]);
    })
}

/**
 * remove records from collection. It does not check condition. Conditions should be checked before the function
 * @param condition
 * @param [option]
 * @param cb
 */
BaseDAO.prototype.remove = function(condition, option, cb) {
    var args = Array.prototype.slice.call(arguments);
    cb = args.pop();
    condition = args.shift();
    option = (args.length) ? args.shift() : {};
    logger.info('BaseDAO > remove, with condition: ' + util.inspect(condition) + ', option:'+ util.inspect(option));
    var self = this;
    this.collection.remove(condition, option, function(err) {
        if (err) {
            logger.error(self.collectionName + "DAO.remove: " + util.inspect(err));
            return cb(new Error(err));
        }

        cb(null);
    })
};

/**
 * apply updates to the record in collection. It does not check condition and updates, should check them before the function.
 * @param condition
 * @param updates
 * @param cb
 */
BaseDAO.prototype.update = function(condition, updates, cb) {
    if (_.isEmpty(updates)) {
        return cb(null); // no updatedDoc return
    }
    var self = this;
    this.collection.findAndModify(condition, [], updates, {
        'safe': true,
        'new': true
    }, function(err, updatedDoc) {
        if (err) return cb(err);

        if (!_.isObject(updatedDoc)) {
            cb(new Error(self.collectionName + "DAO.applyUpdates updated failed. condition=" + JSON.stringify(condition)));
            return;
        }

        cb(null, updatedDoc);
    });
};

/**
 * apply updates to the record in collection. It does not check condition and updates, should check them before the function.
 * @param id
 * @param updates
 * @param cb
 */
BaseDAO.prototype.updateById = function(id, updates, cb) {
    // logger.debug('BaseDAO > updateById, updates: '+JSON.stringify(updates));
    id = parseInt(id);
    if (!isFinite(id))
        return cb(new TFError(ErrorCodes.MONGO_DB_ERROR, this.collectionName + 'DAO.updateById failed, id invalid:' + id));

    this.update({
        _id: id
    }, updates, cb);
};

/**
 * apply updates to the record in collection or add a record to collection. It does not check condition and updates, should check them before the function.
 * 注意: updates参数中必须使用$操作，否则会覆盖原doc数据
 * @param condition
 * @param updates
 * @param cb
 */
BaseDAO.prototype.addOrUpdate = function(condition, updates, cb) {
    if (_.isEmpty(updates)) {
        return cb(null); // no updatedDoc return
    }
    var self = this;
    this.collection.findAndModify(condition, [], updates, {
        'safe': true,
        'new': true,
        'upsert': true
    }, function(err, updatedDoc) {
        if (err) return cb(err);

        if (!_.isObject(updatedDoc)) {
            cb(new Error(self.collectionName + "DAO.addOrUpdate failed. condition=" + JSON.stringify(condition)));
            return;
        }

        cb(null, updatedDoc);
    });
};

/**
 * apply updates to the record in collection or add a record to collection. It does not check condition and updates, should check them before the function.
 * 注意: updates参数中必须使用$操作，否则会覆盖原doc数据
 * @param id
 * @param updates
 * @param cb
 */
BaseDAO.prototype.addOrUpdateById = function(id, updates, cb) {
    id = parseInt(id);
    if (!isFinite(id))
        return cb(new TFError(ErrorCodes.MONGO_DB_ERROR, this.collectionName + 'DAO.addOrUpdateById failed, id invalid:' + id));

    this.addOrUpdate({
        _id: id
    }, updates, cb);
};

/**
 * apply updates to all records in condition.
 * @param condition
 * @param updates
 * @param cb
 */
BaseDAO.prototype.updateMulti = function(condition, updates, cb) {
    this.collection.update(condition, updates, {multi:true}, cb);
};

/**
 * find by condition and field. returns the plain objects
 * @param condition
 * @param [field]
 * @param cb
 */
BaseDAO.prototype.find = function(condition, field, cb) {
    var self = this;
    if ('function' === typeof(field)) {
        cb = field;
        field = {};
    }
    this.collection.find(condition, field).toArray(function(err, foundDocs) {
        if (err) {
            logger.error(self.collectionName + "DAO.find: error: " + JSON.stringify(err));
            return cb(err);
        }

        if (!_.isArray(foundDocs)) {
            logger.warn(self.collectionName + "DAO.find nothing conditions: " + JSON.stringify(condition));
            return cb();
        }
        return cb(null, foundDocs);
    })
};

/**
 * findOne by condition and field. returns one plain object.
 * @param condition
 * @param field (option)
 * @param cb
 */
BaseDAO.prototype.findOne = function(condition, field, cb) {
    var self = this;
    if ('function' === typeof(field)) {
        cb = field;
        field = {};
    }
    this.collection.findOne(condition, field, function(err, foundDoc) {
        if (err) {
            logger.error("BaseDAO > findOne, " + self.collectionName + "DAO.findOne, error: " + JSON.stringify(err));
            return cb(err);
        }

        logger.debug("BaseDAO > findOne, doc: " + JSON.stringify(foundDoc));
        return cb(null, foundDoc);
    })
};

BaseDAO.prototype.checkExistence = function(condition, cb) {
    var self = this;
    this.collection.find(condition, {_id:1}).limit(1).toArray(function(err, foundDoc) {
        if (err) {
            logger.error(self.collectionName+'DAO > checkExistence, '+'checkExistence, err:'+err);
            return cb(err);
        }
        return cb(null, (foundDoc.length>0))
    });
};

BaseDAO.prototype.count = function(cb) {
    var self = this;
    this.collection.count(function(err, count) {
        if (err) {
            logger.error("BaseDAO > count, " + self.collectionName + "DAO.findOne, error: " + JSON.stringify(err));
            return cb(err);
        }
        return cb(null, count);
    });
};

BaseDAO.prototype.drop = function(cb) {
    var self = this;
    this.collection.drop(function(err, res) {
        if (err) {
            logger.error("BaseDAO > drop, " + self.collectionName + "DAO.Drop, error: " + JSON.stringify(err));
            return cb(err);
        }
        return cb(null, res);
    });
};


module.exports = BaseDAO;
