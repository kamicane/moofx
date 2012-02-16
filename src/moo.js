/*
---
provides: moo
description: stupid namespace / nodes wrapper
author: "[Valerio Proietti](http://mad4milk.net)"
license: "[MIT](http://mootools.net/license.txt)"
...
*/

(function(){

var m = function(nodes){
	if (nodes == null) return null;
	return new moo((nodes.length == 'number') ? nodes : [nodes]);
}, moo = function(n){
	this.valueOf = function(){
		return n;
	};
};

m.prototype = moo.prototype;
m.version = '2.8.8α';

window.moo = m;

})();
