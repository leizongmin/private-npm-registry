'use strict';

/**
 * npm mirror server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const Schema = require('mongoose').Schema
  const ObjectId = Schema.ObjectId;

  $.mongodb.model('User', new Schema({
    name: {type: String, unique: true, required: true},
    email: {type: String, index: true, required: true},
    password: {type: String},
    createdAt: {type: Date, default: Date.now},
  }));

  $.model.User = $.mongodb.model('User');

  done();

};
