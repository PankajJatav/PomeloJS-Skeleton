global.Game = {};
global.util = require('util');
global._ = require('underscore');

var MongoClient = require('mongodb').MongoClient;
var should = require('should');
var userService = require('../../app/services/userService.js');
var MongoPool = require('../../app/util/mongoConnect.js');
var UserService;
describe("User Service", function(){
  before(function(done) {
		var mongoAddress = 'mongodb://localhost:27017/gameTest';
    	MongoClient.connect(mongoAddress, function(err, db) {
	        if (err) {
	            console.error(err);
	            return;
	        }
	        Game.mongodb = db;


	        // load mongodb base dao
	        Game.MongoBaseDAO = require('../../app/dao/baseDAO.js');

	        // load mongodb other dao
	        var UserDAO = require('../../app/dao/userDAO.js');
	        Game.UserDAO = new UserDAO();
	        UserService = new userService({});
	        done();
	    });
  	});

  	beforeEach(function(done){
  		Game.UserDAO.remove({}, function(res){});
  		done();
  	});

  	it("register", function(done){
  		var registerData = {
  			username: 'username',
            email: 'test@email.com',
            password: 'password'
  		};
  	  	UserService.register(registerData, function(res){
  	  		if(res.success){
  	  			done();	
  	  		} else {
  	  			done(res);
  	  		}
  	  		
  	  	});
  	});

  	it("invalid-register-1", function(done){
  		var registerData = {
  			username: 'username',
            email: 'test@.com',
            password: 'password'
  		};
  	  	UserService.register(registerData, function(res){
  	  		if(res.success){
  	  			done(res);
  	  		} else {
  	  			done();
  	  		}
  	  		
  	  	});
  	});

  	it("invalid-register-2", function(done){
  		var registerData = {
  			username: 'username',
            email: 'test@email.com',
            password: 'password'
  		};
  	  	UserService.register(registerData, function(res){
  	  		if(res.success){
  	  			UserService.register(registerData, function(res){
  	  				if(res.success){
  	  					done(res);
  	  				} else {
  	  					done();		
  	  				}
  	  			});
  	  		} else {
  	  			done(res);
  	  		}
  	  	});
  	});

  	it("login", function(done){
  		var registerData = {
  			username: 'username',
            email: 'test@email.com',
            password: 'password'
  		};
  	  	UserService.register(registerData, function(res){
  	  		if(res.success){
  	  			UserService.login(registerData, function(res){
  	  				if(res.success){
  	  					done();	
  	  				} else {
  	  					done(res);
  	  				}
  	  			});
  	  		} else {
  	  			done(res);
  	  		}
  	  		
  	  	});
  	});

  	it("invalid-login-1", function(done){
  		var registerData = {
  			username: 'username',
            email: 'test@email.com',
            password: 'password'
  		};
  	  	UserService.register(registerData, function(res){
  	  		if(res.success){
  	  			registerData.email = 'test1@email.com',
  	  			UserService.login(registerData, function(res){
  	  				if(res.success){
  	  					done(res);	
  	  				} else {
  	  					done();
  	  				}
  	  			});
  	  		} else {
  	  			done(res);
  	  		}
  	  		
  	  	});
  	});

  	it("invalid-login-2", function(done){
  		var registerData = {
  			username: 'username',
            email: 'test@email.com',
            password: 'password'
  		};
  	  	UserService.register(registerData, function(res){
  	  		if(res.success){
  	  			registerData.password = 'wrongPassword',
  	  			UserService.login(registerData, function(res){
  	  				if(res.success){
  	  					done(res);
  	  				} else {
  	  					done();
  	  				}
  	  			});
  	  		} else {
  	  			done(res);
  	  		}
  	  		
  	  	});
  	});

  	it("getProfile", function(done){
  		var registerData = {
  			username: 'username',
            email: 'test@email.com',
            password: 'password'
  		};
  	  	UserService.register(registerData, function(res){
  	  		if(res.success){
  	  			UserService.getProfile(registerData, function(res){
  	  				if(res.success){
  	  					done();
  	  				} else {
  	  					done(res);
  	  				}
  	  			});
  	  		} else {
  	  			done(res);
  	  		}
  	  		
  	  	});
  	});

});