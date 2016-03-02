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

$.init.load(path.resolve(__dirname, './init/express.js'));
$.init.load(path.resolve(__dirname, './routes'));

$.init()
