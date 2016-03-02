'use strict';

/**
 * private npm registry
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const express = require('express');
  const bodyParser = require('body-parser');

  const app = express();

  $.data.set('middleware.body', bodyParser.json());

  function checkUserAuthorization(req, res, next) {
    if (!req.headers.authorization) return res.json({error: 'not_login'});
    const s = req.headers.authorization.replace(/^Bearer /i, '').split('@');
    const name = s[0];
    const password = s[1];
    if (!$.config.has('npm.user.' + name)) return res.json({error: 'error', reason: 'user_not_exists'});
    if (!$.utils.validatePassword($.config.get('npm.user.' + name + '.password'), password)) {
      return res.json({error: 'error', reason: 'invalid_password'});
    }
    req.npmUser = name;
    next();
  }
  $.data.set('middleware.auth', checkUserAuthorization);

  // router /-/
  const dashRouter = express.Router();
  $.data.set('router.dash', dashRouter);

  // router /
  const rootRouter = express.Router();
  $.data.set('router.root', rootRouter);

  app.use((req, res, next) => {
    $.logger.log('%s %s [session=%s, agent=%s, version=%s]',
      req.method, req.url, req.headers['npm-session'], req.headers['user-agent'], req.headers['version']);
    next();
  });

  // router /
  const lastRouter = express.Router();
  $.data.set('router.last', lastRouter);

  app.use('/-', dashRouter);
  app.use('/', rootRouter);
  app.use('/', lastRouter);

  app.listen($.config.get('web.port'), err => {
    if (!err) {
      $.logger.info('listening on port %s', $.config.get('web.port'));
    }
    done(err);
  });

};
