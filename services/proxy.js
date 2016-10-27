'use strict';

/**
 * npm mirror server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const request = require('request');
  const utils = require('lei-utils');
  const debug = $.utils.debug('method.proxy');

  function proxyPass(target, req, res, callback) {
    callback = callback || utils.createPromiseCallback();
    const options = {
      method: req.method,
      url: target + req.url,
      headers: req.headers,
    };
    delete options.headers['host'];
    delete options.headers['accept-encoding'];
    delete options.headers['authorization'];
    debug('proxyPass: options=%j', options);
    const proxyReq = request(options, (err, proxyRes, body) => {
      debug('proxyPass callback: err=%s, status=%s, body=%s', err, res && res.statusCode, body && body.length);
      if (!err) {
        res.statusCode = proxyRes.statusCode;
        res.headers = proxyRes.headers;
      }
      callback(err, proxyRes, body);
    });
    req.pipe(proxyReq);
    return callback.promise;
  }

  // params = {req, res, target}
  // result = {res, body}
  $.utils.proxyModify = function (params, callback) {
    callback = callback || utils.createPromiseCallback();
    debug('proxyModify: %s %s', params.req.method, params.req.url);
    proxyPass(params.target || $.config.get('npm.url'), params.req, params.res, (err, proxyRes, body) => {
      callback(err, { res: proxyRes, body });
    });
    return callback.promise;
  };

  // params = {req, res, target}
  // result = {res, body}
  $.utils.proxyPipe = function (params, callback) {
    callback = callback || utils.createPromiseCallback();
    debug('proxyPipe: %s %s', params.req.method, params.req.url);
    proxyPass(params.target || $.config.get('npm.url'), params.req, params.res, (err, proxyRes, body) => {
      params.res.end(body);
      callback(err, { res: proxyRes, body });
    });
    return callback.promise;
  };

  done();

};
