/**
 * Module
**/
var sacloud = require('../sacloud');
//var util    = require('util');

/**
 * Requests
**/
var Requests = exports.Requests = function _Requests(reqs) {
	
	this.reqs = reqs;
	this.opt  = {};
};

exports.create = function _createRequests(args) {
	
	var reqs = [];
	
	reqs.push({
		path: args[1]
	});
	
	if (args[0] !== 'create' && !!args[2]) {
		reqs[0].path += '/' + args[2];
	}
	
	return new Requests(reqs);
};

Requests.prototype.setOption = function _setOptionToRequests(option) {
	
	for (var k in option) {
		this.opt[k] = option[k];
	}
	
	return this;
};

Requests.prototype.run = function _runRequests(callback) {
	
	if (!this.opt.client) {
		throw new Errror('client is required');
	}
	
	var reqs = [];
	
	this.reqs.forEach(function(req) {
		reqs.push(req);
	});
	
	var r = function _r() {
		
		if (reqs.length === 0) return;
		
		var req = reqs.shift();
		
		this.opt.client.createRequest(req).send(function(err, result) {
			
			!!req.onRequested && req.onRequested(err, result, reqs[reqs.length] || null);
			
			callback(err, result, reqs.length + 1, this.reqs.length);
			
			r();
		}.bind(this));
	}.bind(this);
	
	r();
	
	return this;
};