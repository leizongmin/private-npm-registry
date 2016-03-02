'use strict';

/**
 * npm mirror server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const debug = $.utils.debug('method.user');

  $.method('user.create').register(function (params, callback) {
    if (!params.name) return callback($.utils.missingParameterError('name'));
    if (!params.password) return callback($.utils.missingParameterError('password'));
    if (!params.email) return callback($.utils.missingParameterError('email'));

    const item = new $.model.User(params);
    item.password = $.utils.encryptPassword(item.password);
    item.save(callback);
  });

  done();

};
