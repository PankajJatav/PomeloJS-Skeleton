/**
 *  0.1
 *  toobusyFilter, Filter for toobusy, if the process is toobusy, just skip the new request
 *
 *  @ Pankaj Jatav All Rights Reserved.
 *  Date: 3 Feb, 2017
 *  programmer: Pankaj Jatav <pankajjatav7777@gmail.com>
 *  Javascript file toobusyFilter.js
 */
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var config = require('../util/config');
var toobusy = null;
var DEFAULT_MAXLAG = 70;


module.exports = function() {
  return new Filter( config.get("handler.maxLag") || DEFAULT_MAXLAG);
};

var Filter = function(maxLag) {
  try {
    toobusy = require('toobusy');
  } catch(e) {
  }
  if(!!toobusy) {
    toobusy.maxLag(maxLag);
  }
};

Filter.prototype.before = function(msg, session, next) {
  if (!!toobusy && toobusy()) {
    logger.error('[TOOBUSY] LAG LIMIT ' + toobusy.maxLag() + 'ms. Reject Request msg: ' + msg);
    next({code: 503, message: 'SERVER TOO BUSY! PLEASE TRY AGAIN LATER!'});
  } else {
    next();
  }
};

Filter.prototype.after = function(err, msg, session, response, next) {
  next();
};