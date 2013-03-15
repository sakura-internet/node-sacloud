/**
 * Module
**/
var sacloud = require('../sacloud');
//var util    = require('util');

/**
 * Requests
**/
exports.create = function _createRequests(args) {
	
	return new Requests( parseArgs(args) );
};

var parseArgs = function _parseArgsRequests(args) {
	
	var reqs = [];
	
	if (args.length === 0) {
		throw new Error('not specified argments');
	}
	
	// action
	var action = args.shift();
	
	if (!sacloud.command.structure[action]) {
		throw new Error('invalid action `' + action + '`');
	}
	
	// resource
	var resource = args.shift();
	
	if (sacloud.command.resources.indexOf(resource) === -1) {
		throw new Error('invalid resource `' + resource + '`');
	}
	
	if (!sacloud.command.structure[action][resource]) {
		throw new Error('not allowed resource `' + resource + '`');
	}
	
	var x = sacloud.command.structure[action][resource];
	
	if (action === 'show') {
		if (args.length === 0) {
			reqs.push({
				path: resource
			});
		} else {
			reqs.push({
				path: [resource, args[0]].join('/')
			});
		}
	} else if (action === 'delete') {
		if (args.length === 0) {
			throw new Error('resource id is required');
		} else {
			reqs.push({
				method: 'delete',
				path  : [resource, args[0]].join('/')
			});
		}
	} else {
		//x.forEach(function(a, i) {
		//	
		//});
	}
	
	return reqs;
};

var Requests = exports.Requests = function _Requests(reqs) {
	
	this.reqs = reqs;
	this.opt  = {};
};

Requests.prototype.setOption = function _setOptionToRequests(option) {
	
	for (var k in option) {
		this.opt[k] = option[k];
	}
	
	return this;
};

Requests.prototype.run = function _runRequests(callback) {
	
	if (!this.opt.client) {
		throw new Error('client is required');
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