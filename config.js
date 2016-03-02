module.exports = function (set, get, has) {

  set('web.port', 5000);
  set('web.secret', 'npm registry test');

  set('db.mongodb', 'mongodb://localhost/npm_registry');

  set('npm.host', 'registry.npmjs.com');
  set('npm.url', 'http://registry.npmjs.org');
  set('npm.cdn', 'http://registry.cnpmjs.org');

  set('npm.login.maxAge', 3600 * 24 * 365);

  set('npm.path.data', './data');

};
