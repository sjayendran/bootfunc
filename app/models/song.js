/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema;

/**
 * Song Schema
 */

var SongSchema = new mongoose.Schema({
  _id: String,
  dataSource: { type: String, default: ''},
  using: { type: String, default: '' },
  type: { type: String, default: '' },
  sa: { type: String, default: '' },
  st: { type: String, default: '' },
  album: { type: String, default: '' },
  genre: { type: String, default: '' },
  year: Number,
  mediumAlbumArt: { type: String, default: '' },
  largeAlbumArt: { type: String, default: '' },
  aeCount: { type: Number, default: 0 }, //auto error count - directly erroneous through content provider
  meCount: { type: Number, default: 0 }, //manual error count - identified as erroneous through user input
  listenCount: { type: Number, default: 1 },
  sharedBy: [String]
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


mongoose.model('Song', SongSchema);

