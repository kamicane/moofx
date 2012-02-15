/*
---
provides: color
requires: moo
author: "[Valerio Proietti](http://mad4milk.net)"
license: "[MIT](http://mootools.net/license.txt)"
...
*/

(function(){

var round = Math.round, colors = {
	maroon: '#800000', red: '#ff0000', orange: '#ffA500', yellow: '#ffff00', olive: '#808000',
	purple: '#800080', fuchsia: "#ff00ff", white: '#ffffff', lime: '#00ff00', green: '#008000',
	navy: '#000080', blue: '#0000ff', aqua: '#00ffff', teal: '#008080',
	black: '#000000', silver: '#c0c0c0', gray: '#808080'
}, RGBxRGB = function(r, g, b, a){
	if (a == null) a = 1;
	if ((r > 255 || r < 0) || (g > 255 || g < 0) || (b > 255 || b < 0) || (a > 255 || a < 0)) return null;
	return [round(r), round(g), round(b), a];
}, HEXxRGB = function(hex){
	if (hex.length == 3) hex += 'f';
	if (hex.length == 4){
		var h0 = hex.charAt(0), h1 = hex.charAt(1), h2 = hex.charAt(2), h3 = hex.charAt(3);
		hex = h0 + h0 + h1 + h1 + h2 + h2 + h3 + h3;
	}
	if (hex.length == 6) hex += 'ff';
	var rgb = [];
	for (var i = 0; i < hex.length; i+=2) rgb.push(parseInt(hex.substr(i, 2), 16) / ((i == 6) ? 255 : 1));
	return rgb;
}, HSLxRGB = function(h, s, l, a){ // http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
	h /= 360; s /= 100; l /= 100;
	if ((h > 1 || h < 0) || (s > 1 || s < 0) || (l > 1 || l < 0) || (a > 1 || a < 0)) return null;
	var r, g, b;

	if (s == 0){
		r = g = b = l; // achromatic
	} else {
		var hue2rgb = function(p, q, t){
			if(t < 0) t += 1;
			if(t > 1) t -= 1;
			if(t < 1/6) return p + (q - p) * 6 * t;
			if(t < 1/2) return q;
			if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		};

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}

	return [r * 255, g * 255, b * 255, a];
};
	
moo.color = function(input, array){
	input = input.replace(/\s+/g, '');
	if (colors[input]) input = colors[input];
	if (input.match(/^#[a-f0-9]{3,8}/)) input = HEXxRGB(input.replace('#', ''));
	else {
		var match = input.match(/([\d.])+/g);
		if (match){
			if (input.match(/^rgb/)) input = match;
			else if (input.match(/^hsl/)) input = HSLxRGB.apply(null, match);
			else return null; //no known color format
		}
	}
	if (!input || !(input = RGBxRGB.apply(null, input))) return null; //invalid color
	if (array) return input;
	if (input[3] == 1) input.splice(3,1);
	return 'rgb' + ((input.length > 3) ? 'a' : '') + '(' + input/*.join(',')*/ + ')';
};
	
})();
