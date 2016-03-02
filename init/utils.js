'use strict';

/**
 * private npm registry
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const createDebug = require('debug');

  $.utils.MissingParameterError = $.utils.customError('missingParameterError', {code: 'missing_parameter'});
  $.utils.missingParameterError = function (name) {
    return new $.utils.MissingParameterError(`missing parameter "${name}"`, {name: name});
  };

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
