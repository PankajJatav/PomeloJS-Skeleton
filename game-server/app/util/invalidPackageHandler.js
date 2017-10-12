/**
 *  0.1
 *  invalidPackageHandler, Send resonce to client on invalid package
 *
 *  @ Pankaj Jatav All Rights Reserved.
 *  Date: 3 Feb, 2017
 *  programmer: Pankaj Jatav <pankajjatav7777@gmail.com>
 *  Javascript file invalidPackageHandler.js
 */

var logger = require('pomelo-logger').getLogger('app', __filename, 'pid:'+process.pid)

module.exports = function(socket, chunk) {
    console.log(chunk);
    if (!!chunk && chunk.toString() === '<policy-file-request/>\0') {
        socket.send('<cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>\0')
        logger.debug('flash policy request recv, the remote is %s:%s', socket._socket.remoteAddress, socket._socket.remotePort)
    }
    else {
      var chunkPart = null
      var chunkLength = -1
      if (!!chunk) {
        chunkPart = chunk.slice(0, 128)    
        chunkLength = chunk.length
      }
    
      logger.error('invalid head message recv, the remote is %s:%s && message is len=%s, %j', socket._socket.remoteAddress, socket._socket.remotePort, chunkLength, chunkPart)
    }

    socket.close()
}