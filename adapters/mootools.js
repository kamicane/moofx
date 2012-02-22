/*
---
name: mootools
description: mootools adapter for moofx
provides: mootools
requires: [Core/Element, moofx]
...
*/

(function(){
	
var animate = function(){
	var mu = moofx(this);
	mu.animate.apply(mu, arguments);
	return this;
}, design = function(){
	var mu = moofx(this);
	mu.style.apply(mu, arguments);
	return this;
}, compute = function(property){
	return moofx(this).compute(property);
};

Element.implement({
	animate: animate,
	design: design,
	compute: compute
});

Elements.implement({
	animate: animate,
	design: design
});
	
})();
