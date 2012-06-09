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
  'root': String, //where was this project cloned from?
  'namespace': String, //either null or userId
  'framework': String,
  'restricted': Boolean, 
  'keepAlive': Boolean,
  'oauth': String,
  'tags': [String],
  'userId': {type: String, index: true},
  'authorName': {type: String},
  'url': {type: String, index: true},
  'namespaceUrl': {type: String}
});


Project.virtual('path').get(function() {
  return config.workspaceDir + (this.projectId);
});


Project.virtual('projectUrl').get(function() {
  return (this.projectId + "/" + this.projectTitle.replace(/\s/gi, "-").toLowerCase());
});

Project.virtual('ideBase').get(function() {
  return this.projectId;   
});

Project.virtual('ideBase').get(function() {
  return this.projectId;   
});

Project.pre('save', function(next) {
    if (!this.projectId) {
        this.projectId = 1 + randomString(5, "0123456789"); //TODO check for collisions
	 this.url = this.projectId + "." + config.projDomain;
    }
    if (!this.projectTitle) {
	 this.projectTitle = "Untitled";
    }
    if (!this.subTitle) {
	 this.projectTitle = "Please add a description";
    }
    if (this.namespace && !this.namespaceUrl) {
	 this.namespaceUrl = this.projectTitle.replace(/\s/gi, "-").toLowerCase();
    }
    next();
});

mongoose.model('Project', Project);
