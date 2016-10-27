'use strict';

/**
 * private npm registry
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const rootRouter = $.data.get('router.root');

  // replace package CDN
  if ($.config.has('npm.cdn')) {

    $.logger.info('enable package dist CDN replacement');

    const npmUrl = $.config.get('npm.url');
    const npmCdn = $.config.get('npm.cdn');
    const replaceCDN = (url) => {
      return url.replace(npmUrl, npmCdn);
    };

    rootRouter.put('/@:package', $.data.get('middleware.auth'), function (req, res, next) {
      const s = req.params.package.split('/');
      const scope = s[0];
      const packageName = s[1];
      $.logger.log('publish: %s', req.params.package);
      $.service.call('registry.publish', { user: req.npmUser, data: req.body }, (err, ret) => {
        if (err) return res.json($.utils.npmError(err.message));
        res.json({ ok: true });
      });
    });

    rootRouter.get('/:package', co.wrap(function* (req, res, next) {
      try {
        const ret = yield $.utils.proxyModify({ req, res });
        if (ret.res.statusCode !== 200) return res.end(ret.body);

        let data;
        try {
          data = JSON.parse(ret.body.toString());
        } catch (err) {
          $.logger.warn('parse JSON error: [%s] %s', err, ret.body);
          return res.end(ret.body);
        }
        if (data.versions) {
          for (const v in data.versions) {
            if (data.versions[v].dist && data.versions[v].dist.tarball) {
              data.versions[v].dist.tarball = replaceCDN(data.versions[v].dist.tarball);
            }
          }
        }
        res.json(data);
      } catch (err) {
        res.json($.utils.npmError(err.message))
      }
    }));

  }

  done();

};
