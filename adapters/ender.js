// ender adapter

(function($){

	var moofx = require('moofx'),
		color = moofx.color,
		requestFrame = moofx.requestFrame,
		cancelFrame = moofx.cancelFrame
		
	$.ender({
		
		animate: function(){
			var mu = moofx(this);
			mu.animate.apply(mu, arguments);
			return this;
		},
		
		style: function(z){
			var mu = moofx(this);
			if (arguments.length == 1 && typeof z == 'string') return mu.compute(z);
			mu.style.apply(mu, arguments);
			return this;
		}
		
	}, true);
	
	$.ender({
		requestFrame: requestFrame,
		cancelFrame: cancelFrame
	});
	
})(ender);
