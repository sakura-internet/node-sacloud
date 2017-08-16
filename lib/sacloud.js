/*!
 * node-sacloud
 *
 * Copyright (c) 2013 SAKURA Internet Inc and Contributors
 * https://github.com/sakura-internet/node-sacloud
**/

/**
 * Expose
**/
var sacloud = exports;

sacloud.API_ROOT = 'https://secure.sakura.ad.jp/cloud/api/cloud/1.0/';

sacloud.util = require('./sacloud/util');

sacloud.client       = require('./sacloud/client');
sacloud.createClient = sacloud.client.create;
