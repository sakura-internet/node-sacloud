/**
 * Module
**/
var sacloud = require('../sacloud');
var _       = require('underscore');
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
				var path = resource;
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
					
					case 'archive':
						
						var res = {};
						
						if (args.shift() === 'zone') res.Zone = { ID: args.shift() };
						if (args.shift() === 'size') res.SizeMB = parseInt(args.shift(), 10) * 1024;//GB
						if (args.shift() === 'name') res.Name = args.shift();
						if (args.shift() === 'description') res.Description = args.shift();
						
						body.Archive = res;
						
						break;
					
					case 'cdrom':
						
						var res = {};
						
						if (args.shift() === 'zone') res.Zone = { ID: args.shift() };
						if (args.shift() === 'size') res.SizeMB = parseInt(args.shift(), 10) * 1024;//GB
						if (args.shift() === 'name') res.Name = args.shift();
						if (args.shift() === 'description') res.Description = args.shift();
						
						body.CDROM = res;
						
						break;
					
					case 'switch':
						
						var res = {};
						
						if (args.shift() === 'zone') res.Zone = { ID: args.shift() };
						if (args.shift() === 'name') res.Name = args.shift();
						
						body.Switch = res;
						
						break;
					
					case 'internet':
						
						var res = {};
						
						if (args.shift() === 'zone')      res.Zone = { ID: args.shift() };
						if (args.shift() === 'prefix')    res.NetworkMaskLen = parseInt(args.shift(), 10);
						if (args.shift() === 'bandwidth') res.BandWidthMbps = parseInt(args.shift(), 10);
						if (args.shift() === 'name')      res.Name = args.shift();
						
						body.Internet = res;
						
						break;
					
					case 'interface':
						
						body.Interface = { Server: { ID: _.last(args) } };
						
						break;
					
					case 'sshkey':
						
						var res = {};
						
						if (args.shift() === 'publickey') res.PublicKey = args.shift();
						if (args.shift() === 'name') res.Name = args.shift();
						if (args.shift() === 'description') res.Description = args.shift();
						
						body.SSHKey = res;
						
						break;
				}
				
				reqs.push({
					method: 'post',
					path  : path,
					body  : body
				});
			}
			
			break;
			
		case 'update':
			
			if (args.length < 3) {
				throw new Error(
					'parameters is invalid' + '\n' +
					'usage: ' + sacloud.command.structure[action][resource].join(' ')
				);
			}
			
			var r = {};
			
			args.forEach(function(arg, i) {
				if (arg === 'name')                        r.Name        = args[i + 1];
				if (arg === 'description')                 r.Description = args[i + 1];
				if (arg === 'desc')                        r.Description = args[i + 1];
				if (arg === 'tags')                        r.Tags        = args[i + 1].split(',');
				if (arg === 'connection')                  r.Connection  = args[i + 1];
				if (resource === 'disk' && arg === 'type') r.Connection  = args[i + 1];
			});
			
			var k = resource;
			
			if (resource === 'server')    k = 'Server';
			if (resource === 'disk')      k = 'Disk';
			if (resource === 'archive')   k = 'Archive';
			if (resource === 'cdrom')     k = 'CDROM';
			if (resource === 'sshkey')    k = 'SSHKey';
			if (resource === 'switch')    k = 'Switch';
			if (resource === 'ipaddress') k = 'IPAddress';
			
			var body = {};
			body[k] = r;
			
			reqs.push({
				method: 'PUT',
				path  : [resource, args[0]].join('/'),
				body  : body
			});
			
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
				if (resource === 'server' || resource === 'appliance') {
					reqs.push({
						method: 'get',
						path  : [resource, args[0], 'power'].join('/')
					});
				} else {
					reqs.push({
						method: 'get',
						path  : [resource, args[0]].join('/'),
						body  : {
							Include: ['Availability', 'MigratedMB', 'SizeMB']
						}
					});
				}
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
		
		case 'ftp-open':
		case 'ftp-reset':
		case 'ftp-close':
			
			if (args.length === 0) {
				throw new Error('resource id is required');
			} else {
				var body = {};
				
				if (action === 'ftp-reset') body.ChangePassword = true;
				
				reqs.push({
					method: (action === 'ftp-close') ? 'DELETE' : 'PUT',
					path  : [resource, args[0], 'ftp'].join('/'),
					body  : body
				});
			}
			
			break;
			
		case 'insert':
			
			if (args.length !== 4) {
				throw new Error(
					'parameters is invalid' + '\n' +
					'usage: ' + sacloud.command.structure[action][resource].join(' ')
				);
			} else {
				var body = {};
				var q    = resource;
				
				if (resource === 'cdrom') q = 'CDROM';
				
				body[q] = { ID: args[0] };
				
				reqs.push({
					method: 'PUT',
					path  : [args[2], args[3], resource].join('/'),
					body  : body
				});
			}
			
			break;
			
		case 'eject':
			
			if (args.length !== 3) {
				throw new Error(
					'parameters is invalid' + '\n' +
					'usage: ' + sacloud.command.structure[action][resource].join(' ')
				);
			} else {
				var q    = resource;
				
				if (resource === 'cdrom') q = 'CDROM';
				
				reqs.push({
					method: 'DELETE',
					path  : [args[1], args[2], resource].join('/')
				});
			}
			
			break;
			
		case 'attach':
		case 'detach':
			
			if ((action === 'attach' && args.length !== 4) || (action === 'detach' && args.length !== 3)) {
				throw new Error(
					'parameters is invalid' + '\n' +
					'usage: ' + sacloud.command.structure[action][resource].join(' ')
				);
			} else {
				reqs.push({
					method: (action === 'attach') ? 'PUT' : 'DELETE',
					path  : _.compact([resource, args[0], 'to', args[2], args[3] || null]).join('/')
				});
			}
			
			break;
			
		case 'connect':
		case 'disconnect':
			
			if ((action === 'connect' && args.length !== 4) || (action === 'disconnect' && args.length !== 3)) {
				throw new Error(
					'parameters is invalid' + '\n' +
					'usage: ' + sacloud.command.structure[action][resource].join(' ')
				);
			} else {
				reqs.push({
					method: (action === 'connect') ? 'PUT' : 'DELETE',
					path  : _.compact([resource, args[0], 'to', args[2], args[3] || null]).join('/')
				});
			}
			
			break;
			
		case 'copy':
			
			if (args.length < 3 || args.length > 4) {
				throw new Error(
					'parameters is invalid' + '\n' +
					'usage: ' + sacloud.command.structure[action][resource].join(' ')
				);
			}
			
			if (args.length === 3) {
				reqs.push({
					path       : [resource, args[0]].join('/'),
					onRequested: function(err, res) {
						
						if (err) {
							throw new Error(err);
						}
						
						r.Name        = res.response[res.responseInfo.key].name;
						r.Description = 'Copy of `' + res.response[res.responseInfo.key].name + '`';
						r.Zone        = { ID: res.response[res.responseInfo.key].storage.zone.id };
						r.Plan        = { ID: res.response[res.responseInfo.key].plan.id };
						r.SizeMB      = res.response[res.responseInfo.key].sizeMB;
						r.Connection  = res.response[res.responseInfo.key].connection;
					}
				});
				
				var body = {};
				var r    = {};
				
				if (resource === 'disk')    r.SourceDisk    = { ID: args[0] };
				if (resource === 'archive') r.SourceArchive = { ID: args[0] };
				
				if (_.last(args) === 'disk')    body.Disk    = r;
				if (_.last(args) === 'archive') body.Archive = r;
				
				reqs.push({
					method: 'POST',
					path  : _.last(args),
					body  : body
				});
			}
			
			if (args.length === 4) {
				var body = {};
				var r    = {};
				
				if (resource === 'disk')    r.SourceDisk    = { ID: args[0] };
				if (resource === 'archive') r.SourceArchive = { ID: args[0] };
				
				if (args[2] === 'disk')    body.Disk    = r;
				//if (args === 'archive') body.Archive = r;
				
				reqs.push({
					method: 'PUT',
					path  : [args[2], args[3], 'install'].join('/'),
					body  : body
				});
			}
			
			break;
			
		case 'modify':
			
			if (args.length < 3) {
				throw new Error(
					'parameters is invalid' + '\n' +
					'usage: ' + sacloud.command.structure[action][resource].join(' ')
				);
			}
			
			var r = {};
			
			args.forEach(function(arg, i) {
				if (arg === 'password')  r.Password       = args[i + 1];
				if (arg === 'pw')        r.Password       = args[i + 1];
				if (arg === 'hostname')  r.HostName       = args[i + 1];
				if (arg === 'publickey') r.SSHKey         = { PublicKey: args[i + 1] };
				if (arg === 'ipaddress') r.UserIPAddress  = args[i + 1];
				if (arg === 'ipv4')      r.UserIPAddress  = args[i + 1];
				if (arg === 'prefix' || arg === 'gw' || arg === 'gateway') {
					if (!r.UserSubnet) r.UserSubnet = {};
					
					if (arg === 'prefix')  r.UserSubnet.NetworkMaskLen = args[i + 1];
					if (arg === 'gw')      r.UserSubnet.DefaultRoute   = args[i + 1];
					if (arg === 'gateway') r.UserSubnet.DefaultRoute   = args[i + 1];
				}
			});
			
			reqs.push({
				method: 'PUT',
				path  : [resource, args[0], 'config'].join('/'),
				body  : r
			});
			
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
	
	//var reqs = [];
	
	//this.reqs.forEach(function(req) {
	//	reqs.push(req);
	//});
	
	var count = 0;
	var total = this.reqs.length;
	
	var r = function _r() {
		
		if (this.reqs.length === 0) return;
		
		var req = this.reqs.shift();
		
		this.opt.client.createRequest(req).send(function(err, result) {
			
			!!req.onRequested && req.onRequested(err, result, count || null);
			
			callback(err, result, ++count, total);
			
			r();
		}.bind(this));
	}.bind(this);
	
	r();
	
	return this;
};