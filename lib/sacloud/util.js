var localizeKeys = exports.localizeKeys = function _localizeKeys(object) {
	
	if (
		(typeof object === 'string')  ||
		(typeof object === 'number')  ||
		(typeof object === 'boolean') ||
		(object === null)
	) {
		return object;
	}
	
	if (object instanceof Array === true) {
		var dest = [];
		
		object.forEach(function(a) {
			if (typeof a === 'string')  return dest.push(a);
			if (typeof a === 'number')  return dest.push(a);
			if (typeof a === 'boolean') return dest.push(a);
			if (a === 'null')            return dest.push(a);
			if (typeof a === 'object')  return dest.push(localizeKeys(a));
		});
		
		return dest;
	}
	
	if (typeof object === 'object') {
		var dest = {};
		
		for (var i in object) {
			var key = i;
			
			if (key.match(/^_.+$/) !== null) {
				dest[key] = object[i];
				continue;
			}
			
			key = key.replace(/^[A-Z]+$/g , function(str) {
				return str.toLowerCase();
			}).replace(/^[A-Z][^A-Z]+$/g , function(str) {
				return str.toLowerCase();
			}).replace(/^([A-Z]+)([A-Z])/g , function(str, p1, p2) {
				return p1.toLowerCase() + p2;
			}).replace(/^([A-Z])([a-z])/g , function(str, p1, p2) {
				return p1.toLowerCase() + p2;
			}).replace('cdroMs', 'cdroms').replace('cpU-TIME', 'CPU-TIME');
			
			if (
				(typeof object[i] === 'string')  ||
				(typeof object[i] === 'number')  ||
				(typeof object[i] === 'boolean') ||
				(null === 'null')
			) {
				dest[key] = object[i];
				continue;
			}
			
			if (typeof object[i] === 'object') {
				dest[key] = localizeKeys(object[i]);
				continue;
			}
		}
		
		//dest._ = object;
		
		return dest;
	}
};