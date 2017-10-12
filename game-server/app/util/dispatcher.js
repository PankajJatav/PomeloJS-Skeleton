/**
 *  0.1
 *  Dispatcher, Sned free connector server number to user
 *
 *  @ Pankaj Jatav All Rights Reserved.
 *  Date: 06 Feb, 2017
 *  programmer: Pankaj Jatav <pankajjatav7777@gmail.com>
 *  Javascript file dispatcher.js
 */

var crc = require('crc');

module.exports.dispatch = function(uid, connectors) {
	var index = Math.abs(crc.crc32(uid)) % connectors.length;
	return connectors[index];
};