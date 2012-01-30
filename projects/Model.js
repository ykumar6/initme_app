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
  'projectId': {type: String, index: { unique: true }}, 
  'projectTitle': {type: String}, 
  'subTitle': {type: String}, 
  'projectUrl': {type: String, index: { unique: true }}, 
  'root': String, //where was this project cloned from?
  'namespace': String, //either null or userId
  'framework': String,
  'restricted': Boolean, 
  'keepAlive': Boolean,
  'oauth': String,
  'userId': {type: String, index: true},
  'authorName': {type: String},
  'url': {type: String, index: true}
});


Project.virtual('path').get(function() {
  return config.workspaceDir + (this.projectId);
});


Project.virtual('ideBase').get(function() {
  return this.projectId;   
});

Project.virtual('ideBase').get(function() {
  return this.projectId;   
});

Project.pre('save', function(next) {
    if (!this.projectId) {
        this.projectId = randomString(2, "abcdefghiklmnopqrstuvwxyz") +  randomString(2, "abcdefghiklmnopqrstuvwxyz0123456789"); //TODO check for collisions
	 this.url = this.projectId + "." + config.projDomain;
    }
    if (!this.projectTitle) {
	 this.projectTitle = this.projectId;
    }
    if (!this.projectUrl) {
	 this.projectUrl = this.projectId;
    }
    next();
});

mongoose.model('Project', Project);
