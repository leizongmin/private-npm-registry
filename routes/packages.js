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

    rootRouter.get('/:package', function (req, res, next) {
      $.method('proxy.modify').call({req: req, res: res}, (err, params) => {
        if (err) return res.json($.utils.npmError(err.message));
        if (params.res.statusCode !== 200) return res.end(params.body);

        let data;
        try {
          data = JSON.parse(params.body.toString());
        } catch (err) {
          $.logger.warn('parse JSON error: [%s] %s', err, params.body);
          return res.end(params.body);
        }
        if (data.versions) {
          for (const v in data.versions) {
            if (data.versions[v].dist && data.versions[v].dist.tarball) {
              data.versions[v].dist.tarball = replaceCDN(data.versions[v].dist.tarball);
            }
          }
        }
        res.json(data);
      });
    });

  }

  done();

};
