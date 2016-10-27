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
  $.service.register('user.create', co.wrap(function* (ctx) {
    if (!ctx.params.name) return ctx.error($.utils.missingParameterError('name'));
    if (!ctx.params.password) return ctx.error($.utils.missingParameterError('password'));
    if (!ctx.params.email) return ctx.error($.utils.missingParameterError('email'));

    const item = new $.model.User({ name: ctx.params.name, email: ctx.params.email });
    item.password = $.utils.encryptPassword(ctx.params.password);

    ctx.result(yield item.save());
  }));

  // params = {name}
  // result = user
  $.service.register('user.get', co.wrap(function* (ctx) {
    if (!ctx.params.name) return ctx.error($.utils.missingParameterError('name'));
    ctx.result(yield $.model.User.findOne({ name: ctx.params.name }));
  }));

  // params = {name, maxAge}
  // result = token
  $.service.register('user.generateLoginToken', co.wrap(function* (ctx) {
    if (!ctx.params.name) return ctx.error($.utils.missingParameterError('name'));
    if (!ctx.params.maxAge) return ctx.error($.utils.missingParameterError('maxAge'));

    const expire = (parseInt(Date.now() / 1000, 10) + ctx.params.maxAge).toString(32);
    const str = $.utils.randomString(6);
    const token = $.utils.encryptData([ expire, str, ctx.params.name ].join(' '), $.config.get('web.secret'));
    ctx.result(`${ str }-${ token }`);
  }));

  // params = {token}
  // result = {name, expire}
  $.service.register('user.decryptLoginToken', co.wrap(function* (ctx) {
    if (!ctx.params.token) return ctx.error($.utils.missingParameterError('token'));

    const s = ctx.params.token.split('-');
    const str = s[0];
    const token = s[1];
    let data = $.utils.decryptData(token, $.config.get('web.secret'));
    if (!data) return ctx.error(new Error('invalid login token'));

    data = data.split(' ');
    if (data.length !== 3) return ctx.error(new Error('invalid login token'));
    const expire = Number(data[0]);
    const str2 = data[1];
    const name = data[2];
    if (str2 !== str) return ctx.error(new Error('invalid login token'));
    if (expire * 1000 < Date.now()) return ctx.error(new Error('login token expired'));

    ctx.result({ expire, name });
  }));

  done();

};
