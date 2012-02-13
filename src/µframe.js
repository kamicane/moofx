/*
---
provides: frame
requires: µ
author: "[Valerio Proietti](http://mad4milk.net)"
license: "[MIT](http://mootools.net/license.txt)"
...
*/

(function(){

var AnimationFrame = 'AnimationFrame', callbacks = [], running, loop = function(time){
	running = false;
	for (var now = time || +(new Date), i = callbacks.length; i--; i) callbacks.splice(i, 1)[0](now);
},

requestAnimationFrame =
this['request' + AnimationFrame] ||
this['webkitRequest' + AnimationFrame] ||
this['mozRequest' + AnimationFrame] ||
this['oRequest' + AnimationFrame] ||
this['msRequest' + AnimationFrame] ||
function(callback){
	return setTimeout(callback, 1000 / 60);
};

µ.frame = {
	request: function(callback){
		callbacks.push(callback);
		if (!running){
			running = true;
			requestAnimationFrame(loop);
		}
	},
	cancel: function(callback){
		for (var i = callbacks.length; i--; i) if (callbacks[i] === callback) callbacks.splice(i, 1);
	}
};

})();
