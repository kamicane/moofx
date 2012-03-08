// requestFrame impementation, supports frame canceling, and the time argument, 100% cross platform.

var callbacks = [], running = false

var iterator = function(time){
	if (time == null) time = +(new Date)
	running = false
	var i = callbacks.length
	while (i) callbacks.splice(--i, 1)[0](time)
}


var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame || global.msRequestAnimationFrame || function(callback){
	return setTimeout(callback, 1e3 / 60)
}

exports.request = function requestFrame(callback){
	callbacks.push(callback)
	if (!running){
		running = true
		requestFrame(iterator)
	}
	return this
}

exports.cancel = function cancelFrame(match){
	for (var i = 0, l = callbacks.length; i < l; i++){
		var callback = callbacks[i]
		if (callback === match) callbacks.splice(i, 1)
	}
	return this
}
