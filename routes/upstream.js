'use strict';

/**
 * private npm registry
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const lastRouter = $.data.get('router.last');

  lastRouter.get('*', function (req, res, next) {
    $.service.call('proxy.pipe', { req, res }, $.utils.noopCallback);
  });

  done();

};
