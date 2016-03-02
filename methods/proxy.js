'use strict';

/**
 * npm mirror server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const httpProxy = require('http-proxy');
  const request = require('request');

  function proxyPass(target, req, res, callback) {
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
  $.method('proxy.pass').register(function (params, callback) {
    proxyPass(params.target || $.config.get('npm.url'), params.req, params.res, (err, proxyRes, body) => {
      callback(err, {res: proxyRes, body: body});
    });
  });

  const upstreamProxy = httpProxy.createProxyServer({
    target: $.config.get('npm.url'),
  });
  $.method('proxy.upstream').register(function (params, callback) {
    upstreamProxy.web(params.req, params.res, {target: params.target || $.config.get('npm.url')});
    params.res.once('end', () => {
      callback(null);
    });
  });

  done();

};
