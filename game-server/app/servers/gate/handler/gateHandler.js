/**
 *  0.1
 *  GateHandler, Assign connector port and address to user
 *
 *  @ Pankaj Jatav All Rights Reserved.
 *  Date: 09 Feb, 2017
 *  programmer: Pankaj Jatav <pankajjatav7777@gmail.com>
 *  Javascript file gateHandler.js
 */

var dispatcher = require('undot')('app/util/dispatcher.js');
var userService = require('undot')('app/services/userService.js');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
	this.UserService = new userService(app);
};

var handler = Handler.prototype;

/**
*
* Call to register a user
* 
* @param  next    callback take the response form the fuction
* @param  session object   session object of user
* @param  data    object   Data of user register
* 
* @return  status of user registeration
*
*/
handler.register = function(data, session, next) {
	var that = this;
	this.UserService.register(data,function(res){
		next(null, res);
	});
}

/**
*
* Call to login a user
* 
* @param  next    callback take the response form the fuction
* @param  session object   session object of user
* @param  data    object   Data of user login
* 
* @return  status of user registeration also send host and port of connector
*
*/
handler.login = function(data, session, next) {
	var that = this;
	var uid = data.email;
	var connectors = this.app.getServersByType('connector');
	this.UserService.login(data,function(res){
		if(res.success){
			var connector= dispatcher.dispatch(uid, connectors);
	  		if(!connector){
				next(null,{success: false, code: 404, msg: 'There is no server to log in, please wait'});
	  		}
	  		res.data.host = connector.host;
			res.data.port = connector.clientPort;
			next(null, res);
		} else {
			next(null, res);
		}
	});
}