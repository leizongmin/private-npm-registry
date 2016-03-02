module.exports = function (set, get, has) {

  set('web.port', 5000);

  set('db.mongodb', 'mongodb://localhost/npm_registry');

  set('npm.host', 'registry.npmjs.com');
  set('npm.url', 'http://registry.npmjs.org');
  set('npm.cdn', 'http://registry.cnpmjs.org');

  set('npm.user.test1', {password: '123456', email: 'test1@npm.superid.net'});
  set('npm.user.test2', {password: '123456', email: 'test2@npm.superid.net'});
  set('npm.user.superid', {password: '123456', email: 'superid@npm.superid.net'});
  set('npm.user.isnc', {password: '123456', email: 'isnc@npm.superid.net'});

  set('npm.path.data', './data');

};
