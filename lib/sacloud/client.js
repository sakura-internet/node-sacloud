/**
 * Module
**/
var sacloud = require('../sacloud');
var request = require('./client.request');

/**
 * Client
**/
var Client = exports.Client = function _Client(option) {
	
	this.opt = option;
};

Client.prototype.createRequest = function _createRequestClient(req) {
	
	return request.create(req).setOption(this.opt);
};

exports.create = function _createClient(option) {
	
	return new Client(option);
};