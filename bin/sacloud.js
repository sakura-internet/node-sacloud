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
			
			!!body[0].ipAddress                       && h.push('ip address');
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
			
			!!body.id   && table.push({ id  : body.id });
			!!body.name && table.push({ name: body.name });
			
			if (result.responseInfo.key === 'server') {
				table.push({ status: body.instance.status });
			}
			
			!!body.createdAt && table.push({ 'created at': body.createdAt.replace('T', ' ').replace('+09:00', '') });
			
			util.puts(table.toString());
			
			break;
	}
	
	return;
});