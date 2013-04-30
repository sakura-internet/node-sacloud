node-sacloud (sacloud)
=====================

A [node.js](http://nodejs.org) based command line interface and module for [SAKURA Internet Cloud](http://cloud.sakura.ad.jp/) APIs.

## Usage

### Installation

see: https://github.com/sakura-internet/node-sacloud/wiki/Installation

### Configuration

see: https://github.com/sakura-internet/node-sacloud/wiki/Configuration

## Getting started

##### Load the module:

```javascript
var sacloud = require('sacloud');
```

##### Then create a new client:

```javascript
var client = sacloud.createClient({
  accessToken        : 'account_access_token_here',
  accessTokenSecret  : '********',
  disableLocalizeKeys: false,// (optional;default:false) false: lower-camelize the property names in response Object
  debug              : true// (optional;default:false) output debug requests to console.
});
```

* API-key manager: https://secure.sakura.ad.jp/cloud/#!/pref/apikey/

##### Let's get list of server.

```javascript
client.createRequest({
  method: 'GET',
  path  : 'server'
}).send(function(err, result) {
  
  if (err) throw new Error(err);
  
  console.log( JSON.stringify(result, null, '  ') );
});
```

##### new server creation

```javascript
var request = client.createRequest({
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

request.send(function(err, result) {
  
  if (!err) console.log('created successfully! serverId=' + result.response.server.id);
});
```

### CLI?

see: https://github.com/sakura-internet/node-sacloud/wiki/Getting-started-Guide

### API?

see: http://developer.sakura.ad.jp/cloud/api/1.0/

## Comments / Questions

Please feel free to send any messages: ```@kanreisa``` / ```y-kan at sakura.ad.jp```

Or just open github issues.
