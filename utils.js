function fastRound(num){
	return ~~ (num + (num > 0 ? .5 : -.5));
}


function extendObj(target, extender){
	if (null == target || 'object' != typeof target) return extender;
	var object = cloneObj(target);
	alert(prettyPrintObj(target));
	for (var key in extender){
		if(extender.hasOwnProperty(key)) {
			if(object[key] == undefined) {object[key] = extender[key]};
		}
	}
	return object;
}


function intBetween(n, x, y){
	return (n >= x && n  <= y);
}


function prettyPrintObj(obj){
	var prettyString = '';
	for(var key in obj){
		prettyString += key + ' : '; + obj[key];
		if (typeof obj[key] == 'object'){
			prettyString += prettyPrintObj(obj[key]);
		} else {
			prettyString += obj[key];
		}
		prettyString +='/n'
	}
	return prettyString;
}


function rand(from, to) {
	return Math.random() * to + from
}


function randInt(from, to) {
	return Math.floor(Math.random() * to) + from
}


function cloneObj(obj) {
	if (null == obj || 'object' != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}
