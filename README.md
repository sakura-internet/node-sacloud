node-sacloud (sacloud)
=====================

A [node.js](http://nodejs.org) library for [SAKURA Internet Cloud](http://cloud.sakura.ad.jp/) API.

##  Install

```
npm install --save sacloud
```

## Getting started

#### Load and create a client instance:

```javascript
const sacloud = require("sacloud");

const client = sacloud.createClient({
  accessToken        : 'account_access_token_here',
  accessTokenSecret  : '********',
  disableLocalizeKeys: false,// (optional;default:false) false: lower-camelize the property names in response Object
  debug              : true// (optional;default:false) output debug requests to console.
});

// select zone
const zone = "tk1a";
client.opt.apiRoot = `https://secure.sakura.ad.jp/cloud/zone/${zone}/api/cloud/1.1/`;
```

* API-key manager: https://secure.sakura.ad.jp/cloud/iaas/#!/pref/apikey/

#### Get Servers:

```javascript
client.createRequest({
  method: 'GET',
  path  : 'server'
}).send((err, result) => {
  
  if (err) {
    throw new Error(err);
  }
  
  console.log( JSON.stringify(result, null, '  ') );
});
```

##### Create Server:

```javascript
const request = client.createRequest({
  method: 'POST',
  path  : 'server',
  body  : {
    Server: {
      Zone       : { ID: 31001 },
      ServerPlan : { ID: 1 },
      Name       : 'test-server',
      Description: 'blah blah blah...',
      Tags       : ['test']
    }
  }
});

request.send((err, result) => {
  
  if (err) {
    throw new Error(err);
  }
  
  console.log(`created successfully! serverId=${result.response.server.id}`);
});
```

## CLI

has been removed on `@0.1.0`. use [usacloud](https://github.com/sacloud/usacloud).

## API Documentation

see: http://developer.sakura.ad.jp/cloud/api/1.1/

