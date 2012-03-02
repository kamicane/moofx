// requestFrame impementation, supports frame canceling, and the time argument, 100% cross platform.

var callbacks, iterator, requestAnimationFrame, running;

callbacks = [];

running = false;

iterator = function(time) {
	var i;
	if (time == null) time = +(new Date);
	running = false;
	i = callbacks.length;
	while (i) {
		callbacks.splice(--i, 1)[0](time);
	}
	return null;
};


requestAnimationFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame || global.msRequestAnimationFrame || function(callback) {
	return setTimeout(callback, 1e3 / 60);
};

module.exports = {
	request: function(callback) {
		callbacks.push(callback);
		if (!running) {
			running = true;
			requestAnimationFrame(iterator);
		}
		return this;
	},
	cancel: function(match) {
		var callback, i, _len;
		for (i = 0, _len = callbacks.length; i < _len; i++) {
			callback = callbacks[i];
			if (callback === match) callbacks.splice(i, 1);
		}
		return this;
	}
};
