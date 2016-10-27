'use strict';

/**
 * private npm registry
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const dashRouter = $.data.get('router.dash');

  // npm login
  // request body: {"_id":"org.couchdb.user:aa","name":"aa","password":"aa","email":"aa@aa.com","type":"user","roles":[],"date":"2016-02-29T14:47:45.465Z"}
  // response success: {"ok": true, "id": "org.couchdb.user:ucdok", "token": "1-d952fad58031af13ee88fd2dda7844c4"}
  // response error: {"error": "conflict","reason": "User ucdok already exists."}
  dashRouter.put('/user/org.couchdb.user*', $.data.get('middleware.body'), (req, res, next) => {
    $.logger.log('user login: %s', req.body.name);
    $.service.call('user.get', { name: req.body.name }, (err, user) => {
      if (err) return res.json($.utils.npmError(err.message));

      function responseOK(user) {
        $.service.call('user.generateLoginToken', {
          name: user.name,
          maxAge: $.config.get('npm.login.maxAge'),
        }, (err, token) => {
          if (err) return res.json($.utils.npmError(err.message));
          res.statusCode = 201;
          res.json({ ok: true, id: `org.couchdb.user:${ user.name }`, token });
        });
      }

      if (user) {

        // login
        if (!$.utils.validatePassword(req.body.password, user.password)) {
          return res.json($.utils.npmError(`invalid password for user "${ user.name }"`));
        }
        responseOK(user);

      } else {

        // sign up
        $.service.call('user.create', req.body, (err, newUser) => {
          if (err) return res.json($.utils.npmError(err.message));
          responseOK(newUser);
        });

      }
    });

  });

  dashRouter.get('/user/name', $.data.get('middleware.auth'), function (req, res, next) {
    res.json({ name: req.npmUser });
  });

  done();

};
