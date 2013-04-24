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
	
	switch (action) {
		
		case 'create':
			
			if (args.length === 0) {
				throw new Error(
					'parameter is required' + '\n' +
					'usage: ' + sacloud.command.structure[action][resource].join(' ')
				);
			} else {
				var body = {};
				
				switch (resource) {
					
					case 'server':
						
						var res = {};
						
						if (args.shift() === 'zone') res.Zone = { ID: args.shift() };
						if (args.shift() === 'plan') res.ServerPlan = { ID: args.shift() };
						if (args.shift() === 'name') res.Name = args.shift();
						if (args.shift() === 'description') res.Description = args.shift();
						
						body.Server = res;
						
						break;
					
					case 'disk':
						
						var res = {};
						
						if (args.shift() === 'zone') res.Zone = { ID: args.shift() };
						if (args.shift() === 'plan') res.Plan = { ID: args.shift() };
						if (args.shift() === 'size') res.SizeMB = parseInt(args.shift(), 10) * 1024;//GB
						if (args.shift() === 'type') res.Connection = args.shift();
						if (args.shift() === 'name') res.Name = args.shift();
						if (args.shift() === 'description') res.Description = args.shift();
						
						body.Disk = res;
						
						break;
				}
				
				reqs.push({
					method: 'post',
					path  : resource,
					body  : body
				});
			}
			
			break;
		
		case 'show':
			
			if (args.length === 0) {
				reqs.push({
					path: resource
				});
			} else {
				reqs.push({
					path: [resource, args[0]].join('/')
				});
			}
			
			break;
			
		case 'delete':
			
			if (args.length === 0) {
				throw new Error('resource id is required');
			} else {
				reqs.push({
					method: 'delete',
					path  : [resource, args[0]].join('/')
				});
			}
			
			break;
			
		case 'status':
			
			if (args.length === 0) {
				throw new Error('resource id is required');
			} else {
				reqs.push({
					method: 'get',
					path  : [resource, args[0], 'power'].join('/')
				});
			}
			
			break;
			
		case 'start':
		case 'shutdown':
		case 'reboot':
		case 'stop':
			
			if (args.length === 0) {
				throw new Error('resource id is required');
			} else {
				var q = 'power';
				
				if (action === 'reboot') q = 'reset';
				
				reqs.push({
					method: (action === 'start' || action === 'reboot') ? 'PUT' : 'DELETE',
					path  : [resource, args[0], q].join('/'),
					body  : { Force: (action === 'stop') }
				});
			}
			
			break;
		
		default:
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