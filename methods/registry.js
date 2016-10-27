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
  $.method('registry.publish').check({
    user: { required: true, validate: (v) => v && v.length > 0 },
    data: { required: true, validate: (v) => v.name && v._attachments },
  });
  $.method('registry.publish').register(function (params, callback) {
    const item = new $.model.Registry(params.data);
    console.log(item);
    item.save(err => callback(err));
  });

  done();

};
