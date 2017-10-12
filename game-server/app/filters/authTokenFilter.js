var jwt = require('jsonwebtoken');
module.exports = function () {
  return new Filter ();
}

var Filter = function () {
};

Filter.prototype.before = function (msg,  session, next) {
	console.log('Enter Connector, In Filter, In Before, Data: '+JSON.stringify(msg));
	var route = msg.__route__;
	jwt.verify(msg.authToken, 'shhhhh', function(err, decoded) {
	  if(err){
	  	next('Key Missing',{success:false, code: 404, msg:'AuthToken is not valid'});
	  } else {
	  	msg.playerId = decoded.playerId
	  	next();
	  };
	});	
}

Filter.prototype.after = function (err, msg, session, resp, next) {
	
}