var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config');
var project;

// Project Model
function randomString(string_length, chars) {

    var chars;
    var randomstring = '';
    for (var i=0; i<string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }
    return randomstring;
}

Project = new Schema({
  'projectId': {type: String, unique: true}, 
  'projectTitle': String, 
  'root': String, //where was this project cloned from?
  'namespace': String, //either null or userId
  'framework': String,
  'restricted': Boolean, 
  'userId': {type: String, index: true},
  'url': {type: String, index: true}
});


Project.virtual('path').get(function() {
  return config.workspaceDir + this.projectId;
});


Project.virtual('ideBase').get(function() {
  return this.projectId;   
});

Project.pre('save', function(next) {
    if (!this.projectId) {
        this.projectId = randomString(5, "abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"); //TODO check for collisions
	 this.url = "mango-" + randomString(5, "abcdefghiklmnopqrstuvwxyz") + "-app." + config.appDomain;
    }
    next();
});

mongoose.model('Project', Project);