'use strict';

/**
 * private npm registry
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const createDebug = require('debug');

  $.utils.noopCallback = function (err) {
    if (err) {
      $.logger.warn('callback error from noopCallback: %s', err.stack || err);
    }
  };

  $.utils.debug = function (name) {
    return createDebug('server:' + name);
  };

  $.utils.npmError = function (reason, type, data) {
    data = data || {};
    data.reason = reason.toString();
    data.error = type || 'error';
    return data;
  };

  done();

};
