#!/usr/bin/env node

/**
 * Module
**/
var sacloud = require('../');
var opt     = require('tav').set();
var fs      = require('fs');
var path    = require('path');

/**
 * Config
**/
var config = {};

var configFilePath = path.resolve(
	opt.config ||
	path.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], '.sacloudcfg.json')
);

if (fs.existsSync(configFilePath) === true) config = require(configFilePath);

if (!!opt.accessToken)       config.accessToken = opt.accessToken;
if (!!opt.accessTokenSecret) config.accessTokenSecret = opt.accessTokenSecret;
if (!!opt.apiRoot)           config.apiRoot = opt.apiRoot;

if (opt.args.length !== 0 && opt.args[0] === 'config') {
	fs.writeFileSync(configFilePath, JSON.stringify(config, null, '  '));
	
	console.log(configFilePath + ':', fs.readFileSync(configFilePath, 'ascii'));
	
	process.exit(0);
}

if (!config.apiRoot) config.apiRoot = 'https://secure.sakura.ad.jp/cloud/api/cloud/1.0/';

/**
 * Request
**/

var client = sacloud.createClient({
	accessToken      : config.accessToken,
	accessTokenSecret: config.accessTokenSecret,
	apiRoot          : config.apiRoot
});

client.createRequest(opt.args).setOption(opt).send(function(err, response) {
	
});
