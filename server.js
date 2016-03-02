'use strict';

/**
 * npm mirror server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const path = require('path');
const ProjectCore = require('project-core');
const $ = new ProjectCore();
global.$ = $;

$.config.load('./config');

$.init.load(path.resolve(__dirname, './init/logger.js'));
$.init.load(path.resolve(__dirname, './init/utils.js'));

$.init.load(path.resolve(__dirname, './init/mongodb.js'));
$.init.load(path.resolve(__dirname, './models'));

$.init.load(path.resolve(__dirname, './methods'));

$.init.load(path.resolve(__dirname, './init/express.js'));
$.init.load(path.resolve(__dirname, './routes'));

$.init(err => {
  if (err) {
    ($.logger || console).error('init server fail: %s', err.stack || err);
    process.exit();
  }
  require('./test');
});
