/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema;

/**
 * Share Schema
 */

var ShareSchema = new mongoose.Schema({
  _id: String,
  uid: { type: String, default: '' },
  ntw: { type: String, default: '' },
  using: { type: String, default: '' },
  msg: { type: String, default: '' },
  sl: { type: String, default: '' },
  st: { type: String, default: '' },
  dt: String,
  humandt: Date,
  ytCheck: { type: String, default: 'PENDING' },
  lastfmCheck: { type: String, default: 'PENDING' },
  valid: { type: String, default: 'PENDING' }
});

/**
 * Statics
 */
/*ShareSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).populate('user', 'name username').exec(cb);
    }
};*/


mongoose.model('Share', ShareSchema);
