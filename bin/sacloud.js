#!/usr/bin/env node

/**
 * Module
**/
var sacloud  = require('../');
var opt      = require('tav').set();
var Table    = require('cli-table');
var fs       = require('fs');
var path     = require('path');
var util     = require('util');

/**
 * Initialize
**/
var isWindows = (process.platform === 'win32');

var configFilePath = path.resolve(
	opt.config ||
	path.join(process.env[isWindows ? 'USERPROFILE' : 'HOME'], '.sacloudcfg.json')
);

var tableChar = {
	'top'         : '-',
	'top-mid'     : '+',
	'top-left'    : '+',
	'top-right'   : '+',
	'bottom'      : '-',
	'bottom-mid'  : '+',
	'bottom-left' : '+',
	'bottom-right': '+',
	'left'        : '|',
	'left-mid'    : '+',
	'mid'         : '-',
	'mid-mid'     : '+',
	'right'       : '|',
	'right-mid'   : '+'
};

/**
 * Config
**/
var config = {};

if (fs.existsSync(configFilePath) === true) config = require(configFilePath);

if (!!opt.accessToken)       config.accessToken       = opt.accessToken;
if (!!opt.accessTokenSecret) config.accessTokenSecret = opt.accessTokenSecret;
if (!!opt.apiRoot)           config.apiRoot           = opt.apiRoot;

if (opt.args.length !== 0 && opt.args[0] === 'config') {
	
	fs.writeFileSync(configFilePath, JSON.stringify(config, null, '  '));
	fs.chmodSync(configFilePath, 0600);
	
	util.puts(configFilePath + ':', fs.readFileSync(configFilePath, 'ascii'));
	
	return process.exit(0);
}

if (!config.apiRoot) config.apiRoot = sacloud.API_ROOT;

/**
 * Request
**/
var client = sacloud.createClient({
	accessToken      : config.accessToken,
	accessTokenSecret: config.accessTokenSecret,
	apiRoot          : config.apiRoot
});

/**
 * Commander
**/
var commander = sacloud.createCommander({
	client: client
});

/**
 * Complete
**/
if (!isWindows) commander.complete();

/**
 * Info
**/
if (opt.args.length === 0 || opt.version) {
	
	var package = require('../package.json');
	
	util.puts(
		[package.name, 'version', package.version].join(' ') + ', Copyright (c) 2013, SAKURA Internet Inc and Contributors.',
		'  modules: ' + util.inspect(package.dependencies, false, null, true),
		package.description,
		'*CLI mode',
		'usage: ' + 'sacloud [action] [[resource]...] [options]',
		'',
		'Use --help to get full help.'
	);
	
	return process.exit(0);
}

/**
 * Create Requests
**/
try {
	var reqs = commander.createRequests(opt.args);
} catch (e) {
	!opt.quiet && util.error(e);
	process.exit(1);
}

/**
 * Run Requests
**/
reqs.run(function _callback(err, result, requestedCount, totalCount) {
	
	if (opt.json) {
		if (requestedCount === 1) process.stdout.write('[');
		
		process.stdout.write(JSON.stringify(result, null, '  '));
		
		if (requestedCount === totalCount) {
			process.stdout.write(']');
		} else {
			process.stdout.write(',');
		}
		
		return process.exit(0);
	}
	
	if (opt.inspect) {
		util.puts(util.inspect(result, false, null, true));
	}
	
	if (opt.quiet) {
		if (err) {
			return process.exit(1);
		}
		
		return process.exit(0);
	}
	
	// status
	console.log(
		result.requestInfo.method.toUpperCase(), result.requestInfo.url, '->',
		result.responseInfo.status, result.responseInfo.statusText,
		'(' + requestedCount + '/' + totalCount + ')',
		'~' + (result.responseInfo.latency / 1000) + 'sec'
	);
	
	if (err) {
		util.error(err);
		return process.exit(1);
	}
	
	if (opt.compact) {
		return process.exit(0);
	}
	
	var body = result.response[result.responseInfo.key];
	
	switch (result.responseInfo.type) {
		
		case 'result':
			
			util.puts(util.inspect(result.response, false, null, true));
			
			break;
		
		case 'resources':
			
			var h = [];
			
			!!body[0].id   && h.push('id');
			!!body[0].name && h.push('name');
			
			!!body[0].ipAddress                       && h.push('ipaddress');
			(result.responseInfo.key === 'ipAddress') && h.push('hostname');
			!!body[0].subnet                          && h.push('subnet id');
			typeof body[0].interface !== 'undefined' && h.push('server id');
			
			if (result.responseInfo.key === 'servers') {
				h.push('status');
			}
			
			!!body[0].createdAt && h.push('created at');
			
			var table = new Table({
				head : h,
				chars: tableChar
			});
			
			body.forEach(function(res, i) {
				var row = [];
				
				!!res.id   && row.push(res.id);
				!!res.name && row.push(res.name);
				
				typeof res.ipAddress !== 'undefined'     && row.push(res.ipAddress || '');
				(result.responseInfo.key === 'ipAddress') && row.push(res.hostName || '');
				!!res.subnet                              && row.push(res.subnet.id || '');
				typeof res.interface !== 'undefined'     && row.push(!!res.interface ? res.interface.server.id : '');
				
				if (result.responseInfo.key === 'servers') {
					row.push(res.instance.status);
				}
				
				!!res.createdAt && row.push(res.createdAt.replace('T', ' ').replace('+09:00', ''));
				
				table.push(row);
			});
			
			util.puts(table.toString());
			
			break;
		
		case 'resource':
			
			var table = new Table({ chars: tableChar });
			
			!!body.id          && table.push({ id           : body.id });
			!!body.zone        && table.push({ zone         : [body.zone.id, body.zone.name].join(':') });
			!!body.name        && table.push({ name         : body.name });
			!!body.description && table.push({ description  : body.description });
			!!body.tags        && table.push({ tags         : body.tags.join(', ') });
			!!body.status      && table.push({ status       : body.status });
			!!body.macAddress  && table.push({ 'mac address': body.macAddress });
			!!body.ipAddress   && table.push({ ipaddress    : body.ipAddress });
			!!body.subnet      && table.push({ 'subnet id'  : body.subnet.id });
			typeof body.interface !== 'undefined' && table.push({ 'interface id': !!body.interface ? body.interface.id : '' });
			typeof body.interface !== 'undefined' && table.push({ 'server id': !!body.interface ? body.interface.server.id : '' });
			
			if (result.responseInfo.key === 'server') {
				table.push({ plan  : [body.serverPlan.id, body.serverPlan.name].join(':') });
				table.push({ cpu   : body.serverPlan.cpu });
				table.push({ memory: body.serverPlan.memoryMB + 'MB' });
				table.push({ status: body.instance.status });
				
				//table.push({ 'before status'    : body.instance.beforeStatus });
				!!body.instance.statusChangedAt && table.push({ 'status changed at': body.instance.statusChangedAt.replace('T', ' ').replace('+09:00', '') });
				table.push({ 'hypervisor'       : !!body.instance.host ? body.instance.host.systemVersion : '' });
				
				!!body.instance.cdrom && table.push({ cdrom:  [body.instance.cdrom.id, body.instance.cdrom.name].join(':') });
				
				var disks = [];
				
				body.disks.forEach(function(disk, i) {
					
					disks.push([disk.id, disk.name].join(':') + [, disk.connection, disk.sizeMB + 'MB'].join(', '));
				});
				
				table.push({ disk: disks.join("\n") });
				
				var ifaces = [];
				
				body.interfaces.forEach(function(iface, i) {
					
					var connection = iface.ipAddress || (!!iface['switch'] ? ('(switch)' + [iface['switch'].id, iface['switch'].name].join(':')) : '(disconnected)');
					
					ifaces.push([iface.id, iface.macAddress].join(':') + ' -> ' + connection);
				});
				
				table.push({ interface: ifaces.join("\n") });
			}
			
			if (result.responseInfo.key === 'interface') {
				!!body.packetFilter && table.push({ 'packetfilter': [body.packetFilter.id, body.packetFilter.name].join(':') });
				
				!!body['switch'] && table.push({ 'switch': [body['switch'].id, body['switch'].name].join(':') });
			}
			
			if (result.responseInfo.key === 'ipAddress') {
				!!body.hostName   && table.push({ 'hostname'  : body.hostName });
			}
			
			!!body.createdAt && table.push({ 'created at': body.createdAt.replace('T', ' ').replace('+09:00', '') });
			
			util.puts(table.toString());
			
			break;
	}
	
	return process.exit(0);
});
