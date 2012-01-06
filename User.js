var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  'email': {type: String, validate: /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i,  index: { unique: true }}, 
});

mongoose.model('User', User);
