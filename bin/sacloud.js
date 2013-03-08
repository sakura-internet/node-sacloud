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
 * Config
**/
var config = {};

var configFilePath = path.resolve(
	opt.config ||
	path.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], '.sacloudcfg.json')
);

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
commander.complete();

/**
 * Create Requests
**/
var reqs = commander.createRequests(opt.args);

/**
 * Run Requests
**/
reqs.run(function(err, result, requestedCount, totalCount) {
	
	if (opt.json) {
		if (requestedCount === 1) process.stdout.write('[');
		
		process.stdout.write(JSON.stringify(result, null, '  '));
		
		if (requestedCount === totalCount) {
			process.stdout.write(']');
		} else {
			process.stdout.write(',');
		}
		
		return;
	}
	
	if (err) {
		util.error(err);
		return;
	}
	
	if (opt.inspect) {
		util.puts(util.inspect(result, false, null, true));
	}
	
	// status
	console.log(
		result.requestInfo.url, '->',
		result.responseInfo.status, result.responseInfo.statusText,
		'(' + requestedCount + '/' + totalCount + ')'
	);
	
	var body = result.response[result.responseInfo.key];
	
	switch (result.responseInfo.type) {
		case 'resources':
			
			var h = [];
			
			!!body[0].id   && h.push('id');
			!!body[0].name && h.push('name');
			
			!!body[0].ipAddress                       && h.push('ipaddress');
			(result.responseInfo.key === 'ipaddress') && h.push('hostname');
			!!body[0].subnet                          && h.push('subnet id');
			typeof body[0].interface !== 'undefined' && h.push('server id');
			
			if (result.responseInfo.key === 'servers') {
				h.push('status');
			}
			
			!!body[0].createdAt && h.push('created at');
			
			var table = new Table({
				head: h
			});
			
			body.forEach(function(res, i) {
				var row = [];
				
				!!res.id   && row.push(res.id);
				!!res.name && row.push(res.name);
				
				typeof res.ipAddress !== 'undefined'     && row.push(res.ipAddress || '');
				(result.responseInfo.key === 'ipaddress') && row.push(res.hostName || '');
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
			
			var table = new Table();
			
			!!body.id          && table.push({ id           : body.id });
			!!body.zone        && table.push({ zone         : [body.zone.id, body.zone.name].join(':') });
			!!body.name        && table.push({ name         : body.name });
			!!body.description && table.push({ description  : body.description });
			!!body.tags        && table.push({ tags         : body.tags.join(', ') });
			!!body.macAddress  && table.push({ 'mac address': body.macAddress });
			
			if (result.responseInfo.key === 'server') {
				table.push({ plan  : [body.serverPlan.id, body.serverPlan.name].join(':') });
				table.push({ cpu   : body.serverPlan.cpu });
				table.push({ memory: body.serverPlan.memoryMB + 'MB' });
				table.push({ status: body.instance.status });
				
				//table.push({ 'before status'    : body.instance.beforeStatus });
				table.push({ 'status changed at': body.instance.statusChangedAt.replace('T', ' ').replace('+09:00', '') });
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
			
			!!body.createdAt && table.push({ 'created at': body.createdAt.replace('T', ' ').replace('+09:00', '') });
			
			util.puts(table.toString());
			
			break;
	}
	
	return;
});