/**
 *  0.1
 *  UserService, Perfrom operation on user
 *
 *  @ Pankaj Jatav All Rights Reserved.
 *  Date: 23 Jan, 2017
 *  programmer: Pankaj Jatav <pankajjatav7777@gmail.com>
 *  Javascript file userService.js
 */

var bcrypt = require('bcrypt');
var jwt    = require('jsonwebtoken');
var code = require('../consts/code');
var messages = require('../consts/message');

var UserService = function(app) {
  this.app = app;
}

module.exports = UserService;

UserService.prototype.register = function(data, cb) {

    if(!data) {
        cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_INFO_REQ});
        return false;
    }

    var username = data.username,
        email = data.email,
        password = data.password;

    if(!username.length){
        cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_USERNAME_REQ});
        return false;
    }
    if(!email.length){
        cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_EMAIL_REQ});
        return false; 
    }
    var emailPattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/; 
    if(!email.match(emailPattern)){
        cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_EMAIL_INVALID});
        return false; 
    }
    if(!password.length){
        cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_PASS_REQ });
        return false;
    }
    if(password.length < 6 ){
        cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_PASS_INVALID});
        return false;
    }

    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return cb(err);
        };
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
                return cb(err);
            }
            var insertDate = {
            username: username,
            email: email,
            password: hash
          };
            
          Game.UserDAO.findOne({ '$or':[{email : email},{username : username}]},function(err, results) {
            console.log(err,results);
            if(err) {
                cb({success: false, code: code.MONGO_ERR, msg: messages.MONGO_ERR});  
            } else if(results) { //there was a result found, so the email address exists
                if(results.email == email){
                  cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_EMAIL_INUSE});    
                } else if(results.username == username){
                    cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_USERNAME_INUSE});
                }
            } else {
                Game.UserDAO.addOne(insertDate,function(err){
                  if(err){
                    console.log(err,err.errors);
                    if(err);
                    if( err.errors && err.errors.email && err.errors.email.message) {
                        cb({success: false, code: messages.PARAM_ERROR, msg: err.errors.email.message});
                    } else {
                      cb({success: false, code: code.MONGO_ERR, msg: messages.MONGO_ERR});      
                    }
                  } 
                  cb({success: true, code: code.OK, msg: messages.USER_REG});
                })
            }
          });
        });
    });
}

UserService.prototype.login = function(data, cb) {

    if(!data) {
        cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_INFO_REQ});
        return false;
    }

    var email = data.email,
        password = data.password;

    if(!email.length){
      cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_EMAIL_REQ});
      return false; 
    }
    if(!password.length){
      cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_PASS_REQ });
      return false;
    }

    Game.UserDAO.findOne({
    isBot:{$ne:true},
    '$or': [
      {email : email},
      {username : email}
    ]}, function(err, user) {
        if (err) {
            console.log(err);
            cb({success: false, code: code.MONGO_ERR, msg: messages.MONGO_ERR });
        }

        if (!user) {
            cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_AUTH_NOT_FOUND });
        } else {
            // check if password matches
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) {
                    return cb(err);
                }
                if (isMatch && !err) {
                  var token = jwt.sign({ playerId: user._id }, 'shhhhh');
                  var data = {
                    username: user.username,
                    email: user.email,
                    authToken:token
                    };
                  cb({success: true, code: code.OK, msg: messages.USER_LOGIN, data: data});
                } else {
                  cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_AUTH_WRONG_PASS });
                }
          });
        }
    });
};

UserService.prototype.getProfile = function(data, cb) {
    if(!data) {
        cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_INFO_REQ });
        return false;
    }

    var email = data.email;

    if(!email || !email.length) {
      cb({success: false, code: code.PARAM_ERROR, msg: messages.USER_EMAIL_REQ });
      return false; 
    }

    Game.UserDAO.findOne({
    isBot:{$ne:true},
    '$or': [
      {email : email},
      {username : email}
    ]}, function(err, user) {
        if (err) {
          console.log(err);
          cb({success: false, code: code.MONGO_ERR, msg: messages.MONGO_ERR });
        } else {
          cb({success: true, code: code.OK, msg: messages.USER_FIND, data: data});
        }
    });
}
