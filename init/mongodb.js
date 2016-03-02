'use strict';

/**
 * npm mirror server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const mongoose = require('mongoose');

  $.logger.info('connecting to mongodb...');
  const conn = mongoose.createConnection($.config.get('db.mongodb'));
  $.mongodb = conn;
  $.model = {};

  conn.once('open', done);

};
