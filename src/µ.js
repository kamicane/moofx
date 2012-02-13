/*
---
provides: µ
author: "[Valerio Proietti](http://mad4milk.net)"
license: "[MIT](http://mootools.net/license.txt)"
...
*/

(function(){

var instances = {}, UID = 0, µi = function(node){
	if (typeof node == 'string') node = µi.querySelector(node);
	if (!node || node.nodeType != 1) return null;
	var uid = node.µid || (node.µid = (UID++).toString(36));
	return instances[uid] || (instances[uid] = new µ(node));
}, µ = function(node){
	this.valueOf = function(){
		return node;
	};
};

µi.prototype = µ.prototype;

µi.querySelector = function(selector){
	return document.querySelector(selector);
};

µi.version = '2.8.7';

window.µ = µi;

})();
