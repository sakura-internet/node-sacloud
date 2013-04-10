var sacloud  = require('../sacloud');
var requests = require('./command.requests');
//var os      = require('os');
//var fs      = require('fs');

/* expose */
var command = exports;

/* resource */
var resources = command.resources = [
	'server', 'disk', 'archive', 'cdrom', 'switch', 'appliance',
	'internet', 'ipaddress', 'subnet', 'interface', 'region', 'zone',
	'product/server', 'product/disk'
];

/* structure */
var structure = command.structure = {
	/* create: {
		server : ['zone', 'id:zone', 'plan', 'id:product/server', 'name', 'p:name']
	}, */
	
	show: {
		server   : ['id:server'],
		disk     : ['id:disk'],
		archive  : ['id:archive'],
		cdrom    : ['id:cdrom'],
		'switch' : ['id:switch'],
		internet : ['id:internet'],
		ipaddress: ['id:ipaddress'],
		subnet   : ['id:subnet'],
		interface: ['id:interface'],
		region   : ['id:region'],
		zone     : ['id:zone']
	}/*,
	
	update: {
		server   : ['id:server'],
		disk     : ['id:disk'],
		archive  : ['id:archive'],
		'switch' : ['id:switch'],
		internet : ['id:internet'],
		ipaddress: ['id:ipaddress']
	}*/,
	
	'delete': {
		server   : ['id:server'],
		disk     : ['id:disk'],
		archive  : ['id:archive'],
		'switch' : ['id:switch'],
		interface: ['id:interface']
	},
	
	status: {
		server   : ['id:server']
	},
	
	start: {
		server   : ['id:server']
	},
	
	shutdown: {
		server   : ['id:server']
	},
	
	reboot: {
		server   : ['id:server']
	},
	
	stop: {
		server   : ['id:server']
	}
};

var Commander = exports.Commander = function _Commander(option) {
	
	this.opt = option;
};

exports.create = function _createCommander(option) {
	
	return new Commander(option);
};


/* complete */
Commander.prototype.complete = function _complete(client) {
	
	var complete = require('complete');
	
	var client = this.opt.client || null;
	
	//var dictPath = os.tmpDir() + '/node-sacloud-command-complete-dict';
	//var dict     = {};
	
	//if (fs.existsSync(dictPath) === true) dict = require(dictPath);
	
	complete({
		program: 'node-sacloud',
		
		commands: function(words, prev, cur) {
			
			words.shift();
			
			// action
			if (words.length === 1) {
				for (var action in structure) {
					
					if (!!cur && ((' ' + action).indexOf(' ' + cur) === -1)) continue;
					
					complete.add(action);
				}
			}
			
			// resource
			if (words.length === 2) {
				var action = words[0];
				
				if (typeof structure[action] === 'undefined') return;//abort
				
				for (var resource in structure[action]) {
					
					if (!!cur && ((' ' + resource).indexOf(' ' + cur) === -1)) continue;
					
					complete.add(resource);
				}
			}
			
			// more
			if (words.length >= 3) {
				var action   = words.shift();
				var resource = words.shift();
				
				if (
					(typeof structure[action] === 'undefined') ||
					(typeof structure[action][resource] === 'undefined')
				) {
					return;//abort
				}
				
				var target = structure[action][resource][words.length - 1];
				if (!target) return;//abort
				
				if (target.indexOf(':') === -1) {
					complete.add(target);
				} else {
					var type = target.split(':')[0];
					var name = target.split(':')[1];
					
					switch (type) {
						case 'p':
							if (!cur) complete.add('[' + name + ']');
							break;
							
						case 'id':
							if (!client || resources.indexOf(name) === -1) return;//abort
							
							// get resource id..
							client.createRequest({
								path: name
							}).send(function(err, result) {
								
								if (err) {
									util.error(err);
									return process.exit(1);
								}
								
								var resources = result.response[result.responseInfo.key];
								
								var matches = [];
								
								resources.forEach(function(resource, i) {
									
									var id = resource.id || resource[result.responseInfo.key] || '';
									id = '' + id;
									
									if (!!cur && ((' ' + id).indexOf(' ' + cur) === -1)) return;
									
									matches.push([id, resource.name || '']);
								});
								
								if (matches.length === 1) {
									complete.add(matches[0][0]);
								}
								
								if (matches.length > 1) {
									matches.forEach(function(m) {
										if (m[1] === '') {
											complete.add(m[0]);
										} else {
											complete.add(m[0] + ':' + m[1].replace(/ /g, '_'));
										}
									});
								}
							});
							
							break;
					}
				}
			}
		},
		
		options: {
			'--help': {},
			'--version': {},
			'--json': {},
			'--inspect': {},
			'--compact': {},
			'--quiet': {},
			'--config': {},
			'--accessToken': {},
			'--accessTokenSecret': {},
			'--apiRoot': {}
		}
	});
	
	return complete;
};

Commander.prototype.createRequests = function _createRequestsCommander(args) {
	
	return requests.create(args).setOption(this.opt);
};





/* action */
var action = {
	create: {
		server: {
			from: {
				server: {}
			}
		},
		disk: {
			from: {
				disk   : {},
				archive: {}
			}
		},
		archive: {
			from: {
				disk   : {},
				archive: {}
			}
		},
	},
	
	connect: {
		interface: {
			to: {
				'switch': { isRequired: true }
			}
		}
	},
	
	disconnect: {
		interface: {
			to: {
				'switch': { isRequired: true }
			}
		}
	},
	
	
	
	'show'      : null,
	'update'    : null,
	'delete'    : null,
	
	
	'attach'    : ['disk'],
	'detach'    : ['disk'],
	
	'copy'      : {
		self: ['disk', 'archive'],
		to  : ['disk', 'archive']
	},
	
	'modify'   : ['disk'],
	'ftp-open' : ['archive'],
	'ftp-close': ['archive'],
	
	'start'    : ['server', 'appliance'],
	'stop'     : ['server', 'appliance'],
	'restart'  : ['server', 'appliance'],
	'shutdown' : ['server', 'appliance'],
	
	'wslash'  : null
};
