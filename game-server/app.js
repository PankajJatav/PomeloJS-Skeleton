var pomelo = require('pomelo');
var util = require('util');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var config = require('./app/util/config');
var blacklist = require('./app/util/blacklist');
var invalidPackageHandler = require('./app/util/invalidPackageHandler')
var routeUtil = require('./app/util/routeUtil');

//Application Filters
var handlerLogFilter = require('./app/filters/handlerLogFilter');
var tooBusyFilter = require('./app/filters/toobusyFilter.js');
var requestQueueFilter = require('./app/filters/requestQueueFilter.js');
var authTokenFilter = require('./app/filters/authTokenFilter.js');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'pomeloTestSkeleton');

config.init(app.get('env'), { path: './config/config.json'})
blacklist.init(app.get('env'), app.getServerType(), {path: './config/blacklist.json'})


// app configuration
app.configure('production|development', 'connector', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 3,
      useDict : true,
      useProtobuf : true,
      defaultRoute: 'connector.entryHandler.entry',//must set for query route list, default default.defaultHandler.defaultRoute
      defaultErrRoute: 'connector.entryHandler.errRoute',//must set for unknown route path, default default.defaultHandler.defaultError
      blacklistFun: blacklist.get,
      invalidPackageHandler: invalidPackageHandler
    });
  app.filter(handlerLogFilter(app, 'connector'));
  app.before(authTokenFilter());
});

app.configure('production|development', 'logic', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 3,
      useDict : true,
      useProtobuf : true,
      blacklistFun: blacklist.get,
      invalidPackageHandler: invalidPackageHandler
    });
  app.filter(handlerLogFilter(app, 'connector'));
  app.before(authTokenFilter());
});

// app configuration
app.configure('production|development', 'gate', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 3,
      useDict : true,
      useProtobuf : true,
      blacklistFun: blacklist.get,
      invalidPackageHandler: invalidPackageHandler
    });
  app.filter(handlerLogFilter(app, 'gate'));
});

app.configure('production|development', function() {
  app.route('logic', routeUtil.logic);
  app.route('connector', routeUtil.connector);

  //Trun on the system monitor
	//app.enable('systemMonitor')
    //if server busy, return 503
	app.before(tooBusyFilter(100));//40ms 60-70%cpu, 70ms 90-100% cpu
	// if request>=100 to queue
	app.filter(requestQueueFilter());

  app.loadConfig('mongoConfig', app.getBase() + '/../shared/config/mongoConfig.json');
    // app.loadConfig('code', app.getBase() + '/../shared/config/code.json');
});

// set modules global
global.util = util;
global._ = _;
global.Game = {};

process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});

//var timeReport = require('./app/modules/timeReport');
//app.registerAdmin(timeReport, {app: app});

appStart(app.get('mongoConfig').Game);


function appStart(mongoConfig) {
    var mongoAddress = 'mongodb://' + mongoConfig.host + ':' + mongoConfig.port + '/' + mongoConfig.database;
    MongoClient.connect(mongoAddress, function(err, db) {
        if (err) {
            console.error(err);
            return;
        }
        Game.mongodb = db;

        // load mongodb base dao
        Game.MongoBaseDAO = require('./app/dao/baseDAO.js');

        // load mongodb other dao
        var UserDAO = require('./app/dao/userDAO.js');
        Game.UserDAO = new UserDAO();

        app.start();
    });
}
