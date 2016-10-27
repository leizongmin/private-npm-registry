'use strict';

/**
 * npm mirror server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const debug = $.utils.debug('method.user');

  // params = {name, password, email}
  // result = user
  $.method('user.create').register(function (params, callback) {
    if (!params.name) return callback($.utils.missingParameterError('name'));
    if (!params.password) return callback($.utils.missingParameterError('password'));
    if (!params.email) return callback($.utils.missingParameterError('email'));

    const item = new $.model.User({ name: params.name, email: params.email });
    item.password = $.utils.encryptPassword(params.password);
    item.save(callback);
  });

  // params = {name}
  // result = user
  $.method('user.get').register(function (params, callback) {
    if (!params.name) return callback($.utils.missingParameterError('name'));
    $.model.User.findOne({ name: params.name }, callback);
  });

  // params = {name, maxAge}
  // result = token
  $.method('user.generateLoginToken').register(function (params, callback) {
    if (!params.name) return callback($.utils.missingParameterError('name'));
    if (!params.maxAge) return callback($.utils.missingParameterError('maxAge'));

    const expire = (parseInt(Date.now() / 1000, 10) + params.maxAge).toString(32);
    const str = $.utils.randomString(6);
    const token = $.utils.encryptData([ expire, str, params.name ].join(' '), $.config.get('web.secret'));
    callback(null, `${ str }-${ token }`);
  });

  // params = {token}
  // result = {name, expire}
  $.method('user.decryptLoginToken').register(function (params, callback) {
    if (!params.token) return callback($.utils.missingParameterError('token'));

    const s = params.token.split('-');
    const str = s[0];
    const token = s[1];
    let data = $.utils.decryptData(token, $.config.get('web.secret'));
    if (!data) return callback(new Error('invalid login token'));

    data = data.split(' ');
    if (data.length !== 3) return callback(new Error('invalid login token'));
    const expire = Number(data[0]);
    const str2 = data[1];
    const name = data[2];
    if (str2 !== str) return callback(new Error('invalid login token'));
    if (expire * 1000 < Date.now()) return callback(new Error('login token expired'));

    callback(null, { expire, name });
  });

  done();

};
