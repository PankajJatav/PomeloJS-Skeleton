/**
 *  0.1
 *  requestQueueFilter, Filter for max waiting user
 *
 *  @ Pankaj Jatav All Rights Reserved.
 *  Date: 3 Feb, 2017
 *  programmer: Pankaj Jatav <pankajjatav7777@gmail.com>
 *  Javascript file requestQueueFilter.js
 */

var config = require('../util/config');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

var apiFilterWaitCountLowLimit = 30;

module.exports = function () {
  return new Filter();
};

var Filter = function () {
  this.requestQueue = [];
  this.apiFilterWaitCountHighLimit = config.get('handler.waitingMaxCount') || Number.MAX_VALUE;
  this.apiFilterWaitCount = 0;
};

Filter.prototype.handlerQueue = function () {
  if(this.requestQueue.length <= 0){
    return;
  }
  var handlerQueueCount = apiFilterWaitCountLowLimit - this.apiFilterWaitCount;
  logger.info("waitCount : %s,handlerQueueCount : %s", this.apiFilterWaitCount, handlerQueueCount);
  for (var i = 0; i < handlerQueueCount && i < this.requestQueue.length; i++) {
    var handlerNextItem = this.requestQueue.shift();
    logger.info("requestQueue.length : %s", this.requestQueue.length);
    this.apiFilterWaitCount++;
    process.nextTick(function () {
      handlerNextItem.next();
    });
  }
};

Filter.prototype.before = function (msg, session, next) {
  if (this.apiFilterWaitCount < this.apiFilterWaitCountHighLimit) {
    this.apiFilterWaitCount++;
    logger.info("[direct]apiFilterWaitCount++ : %s", this.apiFilterWaitCount);
    next();
  } else {
    this.requestQueue.push({ next: next });
    this.handlerQueue();
  }
};

Filter.prototype.after = function (err, msg, session, resp, next) {
  this.apiFilterWaitCount--;
  this.handlerQueue();
  next(err, msg);
};