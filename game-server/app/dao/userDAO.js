'use strict';

var UserDAO = function() {
    UserDAO.super_.call(this, 'User', Game.mongodb);
};
util.inherits(UserDAO, Game.MongoBaseDAO);

UserDAO.prototype.findMaxId = function(cb) {
    var condition = {};
    var field = { _id: 1 }
    this.collection.find(condition, field).sort({ _id: -1 }).limit(1, function(err, foundDoc) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, foundDoc._id);
    });
};


module.exports = UserDAO;