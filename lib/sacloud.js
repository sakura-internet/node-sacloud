/*!
 * node-sacloud
 *
 * Copyright (c) 2013 SAKURA Internet Inc and Contributors
 * https://github.com/sakura-internet/node-sacloud
**/

/**
 * Module
**/

/**
 * Expose
**/
var sacloud = exports;

sacloud.util = require('./sacloud/util');

sacloud.client       = require('./sacloud/client');
sacloud.createClient = sacloud.client.create;

//exports.resource = require('./sacloud/resource');