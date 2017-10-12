module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

var handler = Handler.prototype;
/**
*
* Call to create new session of user
* 
* @param  next    callback take the response form the fuction
* @param  session object   session object of user
* @param  data    object   data of user
* 
* @return  status of session creation in callback
*
*/
handler.entry = function(msg, session, next) {
	var that = this;
  	var playerId = msg.playerId;
	session.bind(playerId);
	session.set('playerId', playerId);
	session.push('playerId', function(err) {
		if(err) {
			next(null,{success: false, code: 409, msg: 'Unable to process request.'});
			console.error('set playerId for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', onUserLeave.bind(null, that.app));
	next(null,{success: true, code: 200, msg: 'Session Created'});
};

/**
*
* Call to error route
* 
* @param  next    callback take the response form the fuction
* @param  session object   session object of user
* @param  data    object   data of user
* 
* @return  error route in callback
*
*/
handler.errRoute = function(msg, session, next){
  next(null,'No Route Found');
  //next(null,{code:Code.API_ROUTE_NOT_FOUND});
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	console.log('session closed');
	if(!session || !session.uid) {
		return;
	}
};