'use strict';

/**
 * private npm registry
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const lastRouter = $.data.get('router.last');

  lastRouter.get('*', function (req, res, next) {
    $.method('proxy.pipe').call({req: req, res: res}, $.utils.noopCallback);
  });

  done();

};
