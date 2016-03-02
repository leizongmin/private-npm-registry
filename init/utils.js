'use strict';

/**
 * private npm registry
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  $.utils.noopCallback = function (err) {
    if (err) {
      $.logger.warn('callback error from noopCallback: %s', err.stack || err);
    }
  };

  done();

};
