/**
 * Module
**/
var sacloud        = require('../sacloud');
var XMLHttpRequest = require('xhr2');
var util           = require('util');

/**
 * Request
**/
var Request = exports.Request = function _Request(req) {
	
	this.req = req;
	this.opt = {};
	
	this.req.method = this.req.method || 'get';
	this.req.body   = this.req.body   || {};
	//
};

exports.create = function _createRequest(req) {
	
	return new Request(req);
};

Request.prototype.setOption = function _setOptionToRequest(option) {
	
	for (var k in option) {
		this.opt[k] = option[k];
	}
	
	return this;
};

Request.prototype.send = function _sendRequest(callback) {
	
	if (!callback || typeof callback !== 'function') {
		throw new Error('callback is required');
	}
	
	if (!this.req.path) {
		throw new Error('req.path is required');
	}
	
	var xhr = new XMLHttpRequest();
	
	xhr.onreadystatechange = function _onReadyStateChangeOnXHR() {
		
		if (xhr.readyState === 4) {
			var err = null;
			var res = {};
			
			res.requestInfo = {
				time    : this.req.time,
				method  : this.req.method,
				url     : this.req.url,
				path    : this.req.path
			};
			
			res.request = this.req.body || {};
			
			res.responseInfo = {
				time      : new Date().getTime(),
				latency   : new Date().getTime() - this.req.time,
				length    : parseInt(xhr.getResponseHeader('X-Sakura-Content-Length') || 0, 10),
				serial    : xhr.getResponseHeader('X-Sakura-Serial') || null,
				status    : xhr.status,
				statusText: xhr.statusText
			};
			
			try {
				res.response = JSON.parse(xhr.responseText);
				
				if (typeof res.response.From === 'undefined') {
					if (typeof res.response.ID === 'undefined') {
						res.responseInfo.type = 'resource';
					} else {
						res.responseInfo.type = 'property';
					}
				} else {
					res.responseInfo.type = 'resources';
				}
				
				if (!this.opt.disableLocalizeKeys) {
					res.response = sacloud.util.localizeKeys(res.response);
				}
				
				res.responseInfo.key = null;
				
				if (res.responseInfo.type === 'resource') {
					res.responseInfo.key = Object.keys(res.response)[0];
					
					if (res.responseInfo.key === 'success') res.responseInfo.type = 'result';
				}
				
				if (res.responseInfo.type === 'resources') {
					for (var k in res.response) {
						if (res.response[k] instanceof Array) {
							res.responseInfo.key = k;
							break;
						}
					}
				}
			} catch (e) {
				err = e;
			}
			
			if (xhr.status >= 200 && xhr.status < 300 && res.response.is_ok === true) {
				var isSuccess = true;
			} else {
				var isFailure = true;
			}
			
			if (isFailure) {
				if (xhr.getResponseHeader('X-Sakura-Error-Message')) {
					err = new Error(xhr.status + ': ' + xhr.getResponseHeader('X-Sakura-Error-Message'));
				} else {
					err = new Error(xhr.status + ': ' + (xhr.statusText || '?'));
				}
			}
			
			if (this.opt.debug) util.puts('#Result', util.inspect(res, false, null, true));
			
			callback(err, res);
		}
	}.bind(this);
	
	this.req.url = this.opt.apiRoot + this.req.path + '.json';
	
	if (this.req.method === 'get') this.req.url += '?' + JSON.stringify(this.req.body);
	
	xhr.open(
		this.req.method,
		this.req.url,
		true,
		this.opt.accessToken,
		this.opt.accessTokenSecret
	);
	
	xhr.setRequestHeader('X-Sakura-Cloud-Client-Version', '3.node-sacloud');
	xhr.setRequestHeader('X-Sakura-HTTP-Method', this.req.method.toUpperCase());
	xhr.setRequestHeader('X-Sakura-No-Authenticate-Header', '1');
	xhr.setRequestHeader('X-Sakura-API-Request-Format', 'json');
	xhr.setRequestHeader('X-Sakura-API-Response-Format', 'json');
	xhr.setRequestHeader('X-Sakura-Error-Level', 'none');
	
	if (this.req.method === 'get') {
		xhr.send();
	} else {
		xhr.send(JSON.stringify(this.req.body));
	}
	
	this.req.time = new Date().getTime();
	
	if (this.opt.debug) util.puts('#Request', util.inspect(this, false, null, true));
	
	return this;
};