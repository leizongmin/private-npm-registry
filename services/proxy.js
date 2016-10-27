'use strict';

/**
 * npm mirror server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const request = require('request');
  const debug = $.utils.debug('method.proxy');

  function proxyPass(target, req, res, callback) {
    const options = {
      method: req.method,
      url: target + req.url,
      headers: req.headers,
    };
    delete options.headers.host;
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
  }

  // params = {req, res, target}
  // result = {res, body}
  $.utils.proxyModify = function (params, callback) {
    debug('proxyModify: %s %s', params.req.method, params.req.url);
    proxyPass(params.target || $.config.get('npm.url'), params.req, params.res, (err, proxyRes, body) => {
      callback(err, { res: proxyRes, body });
    });
  };

  // params = {req, res, target}
  // result = {res, body}
  $.utils.proxyPipe = function (params, callback) {
    debug('proxyPipe: %s %s', params.req.method, params.req.url);
    proxyPass(params.target || $.config.get('npm.url'), params.req, params.res, (err, proxyRes, body) => {
      params.res.end(body);
      callback(err, { res: proxyRes, body });
    });
  };

  done();

};
