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
	
	this.req = {};
	this.opt = {};
	
	this._req = req;
	
	this.byArray  = req instanceof Array;
	this.byString = typeof req === 'string';
	
	if (this.byArray) {
		this.byArray = true;
		this.req = this._arrayToRequest(req);
	}
	
	if (this.byString) {
		this.byString = true;
		this.req = this._stringToRequest(req);
	}
	
	if (!this.byArray && !this.byString) {
		this.req = req;
	}
	
	this.req.method = this.req.method || 'get';
	//
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
	
	if (!this.req.url) {
		throw new Error('req.url is required');
	}
	
	var xhr = new XMLHttpRequest();
	
	xhr.onreadystatechange = function _onReadyStateChangeOnXHR() {
		
		if (xhr.readyState === 4) {
			var err = null;
			var res = {};
			
			try {
				res = JSON.parse(xhr.responseText);
			} catch (e) {
				err = e;
			}
			
			if (xhr.status >= 200 && xhr.status < 300 && res.is_ok === true) {
				var isSuccess = true;
			} else {
				var isFailure = true;
			}
			
			if (isFailure) {
				if (xhr.getResponseHeader('X-Sakura-Error-Message')) {
					err = new Error(xhr.status + ': ' + xhr.getResponseHeader('x-sakura-error-message'));
				} else {
					err = new Error(xhr.status + ': ' + (xhr.statusText || '?'));
				}
			}
			
			callback(err, res);
		}
	};
	
	xhr.open(
		this.req.method,
		this.opt.apiRoot + this.req.url,
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
	
	xhr.send(this.req.body);
	
	console.log('Request', util.inspect(this, false, null, true));
	
	return this;
};

Request.prototype._arrayToRequest = function __arrayToRequest(array) {
	
	var req = {};
	
	var resource = array[0];
	
	req.url = resource;
	
	return req;
};

Request.prototype._stringToRequest = function __stringToRequest(string) {
	
	var req = {};
	
	return req;
};

exports.create = function _createRequest(req) {
	
	return new Request(req);
};