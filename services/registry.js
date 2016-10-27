'use strict';

/**
 * npm mirror server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const debug = $.utils.debug('method.registry');

  // params = {user, data}
  // result = data
  $.service.register('registry.publish', function (ctx) {
    if (!ctx.params.user) return ctx.error(new Error(`missing user`));
    if (!ctx.params.data) return ctx.error(new Error(`missing data.name`));
    if (!ctx.params.data.name) return ctx.error(new Error(`missing data._attachments`));
    if (!ctx.params.data._attachments) return ctx.error(new Error(`missing data`));
    const item = new $.model.Registry(ctx.params.params.data);
    console.log(item);
    item.save(err => ctx.callback(err));
  });

  done();

};
