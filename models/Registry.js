'use strict';

/**
 * npm mirror server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = function (done) {

  const Schema = require('mongoose').Schema;
  const ObjectId = Schema.ObjectId;

  $.mongodb.model('Registry', new Schema({
    _id: { type: String },
    name: { type: String },
    description: { type: String },
    'dist-tags': {
      latest: { type: String },
    },
    versions: { type: Object },
    maintainers: [ Object ],
    time: { type: Object },
  }));

  $.model.Registry = $.mongodb.model('Registry');

  done();

};
