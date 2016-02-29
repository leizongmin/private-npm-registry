'use strict';

/**
 * npm mirror server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const ProjectCore = require('project-core');
const $ = new ProjectCore();



const request = require('request');
function proxyPassAndModifyResponse(target, req, res, callback) {
  const options = {
    method: req.method,
    url: target + req.url,
    headers: req.headers,
  };
  const proxyReq = request(options, (err, proxyRes, body) => {
    if (!err) {
      res.statusCode = proxyRes.statusCode;
      res.headers = proxyRes.headers;
    }
    callback(err, proxyRes, body);
  });
  req.pipe(proxyReq);
}


const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const async = require('async');
function publishPackage(data, callback) {
  async.eachSeries(Object.keys(data._attachments), (name, next) => {

    const file = path.resolve($.config.get('npm.path.data'), name);
    const buf = new Buffer(data._attachments[name].data, 'base64');
    $.logger.log('write file: %s [%sBytes]', file, buf.length);
    fsExtra.outputFile(file, buf, next);

  }, err => {
    if (err) return callback(err);

    const file = path.resolve($.config.get('npm.path.data'), data.name + '.json');
    $.logger.log('write file: %s', file);
    fs.stat(file, (err, stats) => {
      if (err) {
        save()
      } else {
        fsExtra.readJson(file, (err, old) => {
          if (err) return callback(err);
          for (const v in old.versions) {
            if (!data.versions[v]) {
              data.versions[v] = old.versions[v];
            }
          }
          save();
        });
      }
      function save() {
        delete data._attachments;
        fsExtra.outputJson(file, data, callback);
      }
    });
  });
}


$.config.load('./config');

$.init.add(next => {

  const logger = require('tracer').colorConsole({
    format: '{{timestamp}} <{{title}}> {{message}}',
    dateformat: 'HH:MM:ss.L',
  });
  $.logger = logger;

  next();
});
/*
$.init.add(next => {
  const SuperCache = require('super-cache');
});
*/
$.init.add(next => {

  const express = require('express');
  const httpProxy = require('http-proxy');
  const bodyParser = require('body-parser');
  const utils = require('lei-utils');

  const app = new express();
  const rootRouter = express.Router();
  $.data.set('express.app', app);

  app.use((req, res, next) => {
    $.logger.log('%s %s [session=%s, agent=%s, version=%s]',
      req.method, req.url, req.headers['npm-session'], req.headers['user-agent'], req.headers['version']);
    next();
  });

  const proxy = httpProxy.createProxyServer();
  $.data.set('proxy', proxy);

  proxy.on('proxyReq', (proxyReq, req, res, options) => {
    proxyReq.setHeader('host', $.config.get('npm.host'));
  });

  proxy.on('error', (err, req, res) => {
    console.log('error', err);
  });

  const dashRouter = express.Router();
  app.use('/-', dashRouter);

  // npm login
  // request body: {"_id":"org.couchdb.user:aa","name":"aa","password":"aa","email":"aa@aa.com","type":"user","roles":[],"date":"2016-02-29T14:47:45.465Z"}
  // response success: {"ok": true, "id": "org.couchdb.user:ucdok", "token": "1-d952fad58031af13ee88fd2dda7844c4"}
  // response error: {"error": "conflict","reason": "User ucdok already exists."}
  dashRouter.put('/user/org.couchdb.user*', bodyParser.json(), (req, res, next) => {
    $.logger.log('user login: %s:%s', req.body.name, req.body.password);
    if (!$.config.has('npm.user.' + req.body.name)) return res.json({error: 'error', reason: 'user does not exists'});
    const user = $.config.get('npm.user.' + req.body.name);
    if (req.body.password === user.password && req.body.email === user.email) {
      res.statusCode = 201;
      res.json({
        ok: true,
        id: 'org.couchdb.user:' + req.body.name,
        token: req.body.name + '@' + utils.encryptPassword(user.password),
      });
    } else {
      res.json({error: 'error', reason: 'invalid password'});
    }
  });

  function checkUserAuthorization(req, res, next) {
    if (!req.headers.authorization) return res.json({error: 'not_login'});
    const s = req.headers.authorization.replace(/^Bearer /i, '').split('@');
    const name = s[0];
    const password = s[1];
    if (!$.config.has('npm.user.' + name)) return res.json({error: 'error', reason: 'user_not_exists'});
    if (!utils.validatePassword($.config.get('npm.user.' + name + '.password'), password)) {
      return res.json({error: 'error', reason: 'invalid_password'});
    }
    req.npmUser = name;
    next();
  }

  // npm publish
  /*
{ _id: 'npm',
  name: 'npm',
  description: '',
  'dist-tags': { latest: '1.0.0' },
  versions:
   { '1.0.0':
      { name: 'npm',
        version: '1.0.0',
        description: '',
        main: 'index.js',
        scripts: [Object],
        author: '',
        license: 'ISC',
        readme: 'ERROR: No README data found!',
        _id: 'npm@1.0.0',
        _shasum: '65a5571980bb05c337c4a4aa011e72dd3f220da2',
        _from: '.',
        _npmVersion: '2.14.12',
        _nodeVersion: '4.3.0',
        _npmUser: {},
        dist: [Object] } },
  readme: 'ERROR: No README data found!',
  _attachments:
   { 'npm-1.0.0.tgz':
      { content_type: 'application/octet-stream',
        data: 'H4sIAAAAAAAAA+2SsWrDMBCGPfspDg2ZinuyYwWylgyZu2YR8jVRWktCUkqg5N0rWSFdujVQAv6Wn/vvdHcSclK9yz09u6LNMVhT3RlEFMslZF2JflJsS5zpcAUVb4XosefYiwp5h22X8vde5DdOIUqfVvlrn3IXuOmD8FUDMCNHYuukbmRP2fgkH7Q12eMNNljcgYLy2sVrppij1FOkzUDn9H2KWwpDSuQByYgUYi4jdbCwYxvvrV+DsZATEBwp/aZp2DFYLIDOOgJn6eRl6iZP8WD9z8wPrciEaeXt6wurL/V/P+PMzMzMw/ENIws0HAAIAAA=',
        length: 245 } } }
  */
  rootRouter.put('/@:package', checkUserAuthorization, bodyParser.json(), (req, res, next) => {
    const s = req.params.package.split('/');
    const scope = s[0];
    const packageName = s[1];
    $.logger.log('publish: %s', req.params.package);
    if (scope !== req.npmUser) return res.json({error: 'error', reason: 'not_allow_to_publish_to_scope'});
    publishPackage(req.body, err => {
      if (err) return res.json({error: 'error', reason: err.message});
      res.json({ok: true});
    });
  });

  // npm install
  rootRouter.get('/@:package', checkUserAuthorization, (req, res, next) => {
    const name = '@' + req.params.package.replace(/\%2f/ig, '/');
    $.logger.log('get package: %s', name);
    const file = path.resolve($.config.get('npm.path.data'), name + '.json');
    fs.stat(file, (err, stats) => {
      if (err) return res.json({error: 'error', reason: err.message});
      fsExtra.readJson(file, (err, data) => {
        if (err) return res.json({error: 'error', reason: err.message});
        // delete req.headers['if-none-match']; // test
        res.json(data);
      });
    });
  });

  // tgz files
  rootRouter.get('/@*/:scope/:name.tgz', checkUserAuthorization, (req, res, next) => {
    const name = '@' + req.params.scope + '/' + req.name + '.tgz';
    $.logger.log('get package tgz file: %s', name);
    const file = path.resolve($.config.get('npm.path.data'), name);
    res.sendFile(file);
  });


  // 模块名，直接替换成淘宝CDN
  if ($.config.has('npm.cdn')) {
    const replaceCDN = (url) => {
      const ret = url.replace($.config.get('npm.url'), $.config.get('npm.cdn'));
      $.logger.log('replace CDN: %s => %s', url, ret);
      return ret;
    };
    rootRouter.get('/:package', (req, res, next) => {
      $.logger.log('proxy[rewrites cdn] %s %s', req.method, req.url);
      req.headers.host = $.config.get('npm.host');
      // delete req.headers['if-none-match']; // test
      proxyPassAndModifyResponse($.config.get('npm.url'), req, res, (err, proxyRes, body) => {
        if (proxyRes.statusCode !== 200) {
          return res.end(body);
        }
        let data;
        try {
          data = JSON.parse(body.toString());
        } catch (err) {
          $.logger.error('parse JSON error: %s', body);
          return res.end(body);
        }
        for (const v in data.versions) {
          if (data.versions[v].dist && data.versions[v].dist.tarball) {
            data.versions[v].dist.tarball = replaceCDN(data.versions[v].dist.tarball);
          }
        }
        res.json(data);
      });
    });
  }

  // 其他代理
  rootRouter.get('/', (req, res, next) => {
    $.logger.log('proxy %s %s', req.method, req.url);
    proxy.web(req, res, {target: $.config.get('npm.url')});
  });

  rootRouter.all((req, res, next) => {
    $.logger.error('unknow request: %s %s', req.method, req.url);
    res.json({error: 'error', reason: 'not_found'});
  });


  app.use(rootRouter);
  app.listen($.config.get('web.port'), err => {
    if (!err) {
      $.logger.info('listening on port %s', $.config.get('web.port'));
    }
    next(err);
  });

});

$.init()