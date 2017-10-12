var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.logic = function(session, msg, app, cb) {
	var logicServers = app.getServersByType('logic');
	if(!logicServers || logicServers.length === 0) {
		cb(new Error('can not find logic servers.'));
		return;
	}
	var res = dispatcher.dispatch(session.get('playerId'), logicServers);
	cb(null, res.id);
};

exp.connector = function(session, msg, app, cb) {
	if(!session) {
		cb(new Error('fail to route to connector server for session is empty'));
		return;
	}

	if(!session.frontendId) {
		cb(new Error('fail to find frontend id in session'));
		return;
	}

	cb(null, session.frontendId);
};