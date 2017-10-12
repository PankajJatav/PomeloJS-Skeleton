/**
 *  0.1
 *  LogicHandler, Perform different type of logical operation operation
 *
 *  @ Pankaj Jatav All Rights Reserved.
 *  Date: 09 Feb, 2017
 *  programmer: Pankaj Jatav <pankajjatav7777@gmail.com>
 *  Javascript file gateHandler.js
 */

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
* Call to get current user profile
* 
* @param  next    callback take the response form the fuction
* @param  session object   session object of user
* @param  data    object   data of user
* 
* @return  current user profile in callback
*
*/
handler.ownProfile = function(data, session, next) {
	this.UserService.getProfile(data,function(res){
		next(null, res);
	});
}