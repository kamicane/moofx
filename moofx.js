/*
---
provides: moofx
description: a css3-enabled javascript animation library on caffeine
author: Valerio Proietti (@kamicane) http://mad4milk.net http://mootools.net
website: http://moofx.it
license: MIT
...
*/

!(function(){

var Animation, Animations, CSSAnimation, CSSBorderDIRParsers, CSSBorderStyleParser, CSSColorParser, CSSColorParsers, CSSLengthParser, CSSLengthParsers, CSSNumberParser, CSSParser, CSSParsers, CSSStringParser, CSSTransform, CSSTransformParser, CSSTransition, CSSTransitionEnd, CSSZindexParser, HEXtoRGB, HSLtoRGB, HUEtoRGB, JSAnimation, RGBtoRGB, animations, bd, bezier, beziers, browser, callbacks, camelize, cancelFrame, clean, color, colors, computedStyle, cssText, d, equations, filterName, getter, getters, html, hyphenate, item, iterator, matchOp, mirror4, moofx, name, number, parsers, pixelRatio, requestAnimationFrame, requestFrame, running, setter, setters, string, t, test, tlbl, trbl, µ, _fn, _fn2, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _len7, _m, _n, _o, _ref, _ref2, _ref3, _ref4, _ref5,
	__hasProp = Object.prototype.hasOwnProperty,
	__extends = function(child, parent){ for (var key in parent){ if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor(){ this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

µ = function(nod){
	this.valueOf = function(){
		return nod;
	};
	return this;
};

moofx = function(nod){
	if (!nod){
		return null;
	} else {
		return new µ(nod.length != null ? nod : nod.nodeType != null ? [nod] : []);
	}
};

moofx.prototype = µ.prototype;

if (typeof module !== 'undefined'){
	module.exports = moofx;
} else {
	this.moofx = moofx;
}

callbacks = [];

running = false;

iterator = function(time){
	var i;
	if (time == null) time = +(new Date);
	running = false;
	i = callbacks.length;
	while (i){
		callbacks.splice(--i, 1)[0](time);
	}
	return null;
};

requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback){
	return setTimeout(callback, 1000 / 60);
};

moofx.requestFrame = function(callback){
	callbacks.push(callback);
	if (!running){
		running = true;
		requestAnimationFrame(iterator);
	}
	return this;
};

moofx.cancelFrame = function(match){
	var callback, i, _len;
	for (i = 0, _len = callbacks.length; i < _len; i++){
		callback = callbacks[i];
		if (callback === match) callbacks.splice(i, 1);
	}
	return this;
};

colors = {
	maroon: '#800000',
	red: '#ff0000',
	orange: '#ffA500',
	yellow: '#ffff00',
	olive: '#808000',
	purple: '#800080',
	fuchsia: "#ff00ff",
	white: '#ffffff',
	lime: '#00ff00',
	green: '#008000',
	navy: '#000080',
	blue: '#0000ff',
	aqua: '#00ffff',
	teal: '#008080',
	black: '#000000',
	silver: '#c0c0c0',
	gray: '#808080'
};

RGBtoRGB = function(r, g, b, a){
	if (a == null) a = 1;
	if ((r > 255 || r < 0) || (g > 255 || g < 0) || (b > 255 || b < 0) || (a > 255 || a < 0)){
		return null;
	} else {
		return [Math.round(r), Math.round(g), Math.round(b), parseFloat(a)];
	}
};

HEXtoRGB = function(hex){
	var h0, h1, h2, h3, i, _ref, _results;
	if (hex.length === 3) hex += 'f';
	if (hex.length === 4){
		h0 = hex.charAt(0);
		h1 = hex.charAt(1);
		h2 = hex.charAt(2);
		h3 = hex.charAt(3);
		hex = h0 + h0 + h1 + h1 + h2 + h2 + h3 + h3;
	}
	if (hex.length === 6) hex += 'ff';
	_results = [];
	for (i = 0, _ref = hex.length; i <= _ref; i += 2){
		_results.push(parseInt(hex.substr(i, 2), 16) / (i === 6 ? 255 : 1));
	}
	return _results;
};

HUEtoRGB = function(p, q, t){
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	return p;
};

HSLtoRGB = function(h, s, l, a){
	var b, g, p, q, r;
	if (a == null) a = 1;
	h /= 360;
	s /= 100;
	l /= 100;
	if ((h > 1 || h < 0) || (s > 1 || s < 0) || (l > 1 || l < 0) || (a > 1 || a < 0)){
		return null;
	}
	if (s === 0){
		r = b = g = l;
	} else {
		q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		p = 2 * l - q;
		r = HUEtoRGB(p, q, h + 1 / 3);
		g = HUEtoRGB(p, q, h);
		b = HUEtoRGB(p, q, h - 1 / 3);
	}
	return [r * 255, g * 255, b * 255, parseFloat(a)];
};

moofx.color = function(input, array){
	var match;
	input = colors[input = input.replace(/\s+/g, '')] || input;
	if (input.match(/^#[a-f0-9]{3,8}/)){
		input = HEXtoRGB(input.replace('#', ''));
	} else if (match = input.match(/([\d.])+/g)){
		if (input.match(/^rgb/)){
			input = match;
		} else if (input.match(/^hsl/)){
			input = HSLtoRGB.apply(null, match);
		}
	}
	if (!(input && (input = RGBtoRGB.apply(null, input)))) return null;
	if (array) return input;
	if (input[3] === 1) input.splice(3, 1);
	return "rgb" + (input.length > 3 ? 'a' : '') + "(" + input + ")";
};

cancelFrame = moofx.cancelFrame, requestFrame = moofx.requestFrame, color = moofx.color;

string = String;

number = parseFloat;

camelize = function(self){
	return self.replace(/-\D/g, function(match){
		return match.charAt(1).toUpperCase();
	});
};

hyphenate = function(self){
	return self.replace(/[A-Z]/g, function(match){
		return '-' + match.charAt(0).toLowerCase();
	});
};

clean = function(self){
	return string(self).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
};

computedStyle = typeof getComputedStyle !== 'undefined' ? function(node){
	var cts;
	cts = getComputedStyle(node);
	return function(property){
		if (cts){
			return cts.getPropertyValue(hyphenate(property));
		} else {
			return '';
		}
	};
} : function(node){
	var cts;
	cts = node.currentStyle;
	return function(property){
		if (cts){
			return cts[camelize(property)];
		} else {
			return '';
		}
	};
};

parsers = {};

getters = {};

setters = {};

html = document.documentElement;

browser = {};

getter = function(key){
	return getters[key] || (getters[key] = (function(){
		var parser;
		parser = parsers[key] || CSSStringParser;
		return function(){
			return new parser(computedStyle(this)(key)).toString(this);
		};
	})());
};

setter = function(key){
	return setters[key] || (setters[key] = (function(){
		var parser;
		parser = parsers[key] || CSSStringParser;
		return function(value){
			return this.style[key] = new parser(value).toString();
		};
	})());
};

test = document.createElement('div');

cssText = "border:none;margin:none;padding:none;visibility:hidden;position:absolute;height:0;";

pixelRatio = function(element, u){
	var parent, ratio;
	parent = element.parentNode;
	ratio = 1;
	if (parent){
		test.style.cssText = cssText + ("width:100" + u + ";");
		parent.appendChild(test);
		ratio = test.offsetWidth / 100;
		parent.removeChild(test);
	}
	return ratio;
};

CSSParser = (function(){

	function CSSParser(value){
		this.value = string(value);
	}

	CSSParser.prototype.extract = function(){
		return [this];
	};

	CSSParser.prototype.toString = function(){
		return string(this.value);
	};

	return CSSParser;

})();

CSSParsers = (function(){

	function CSSParsers(parsers){
		this.parsers = parsers;
	}

	CSSParsers.prototype.extract = function(){
		return this.parsers;
	};

	CSSParsers.prototype.toString = function(x){
		var parser;
		return ((function(){
			var _i, _len, _ref, _results;
			_ref = this.parsers;
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++){
				parser = _ref[_i];
				_results.push(parser.toString(x));
			}
			return _results;
		}).call(this)).join(' ');
	};

	return CSSParsers;

})();

CSSNumberParser = (function(_super){

	__extends(CSSNumberParser, _super);

	function CSSNumberParser(value){
		this.value = number(value);
	}

	return CSSNumberParser;

})(CSSParser);

CSSStringParser = (function(_super){

	__extends(CSSStringParser, _super);

	function CSSStringParser(){
		CSSStringParser.__super__.constructor.apply(this, arguments);
	}

	return CSSStringParser;

})(CSSParser);

CSSNumberParser = (function(_super){

	__extends(CSSNumberParser, _super);

	function CSSNumberParser(value){
		this.value = number(value);
	}

	return CSSNumberParser;

})(CSSParser);

CSSLengthParser = (function(_super){

	__extends(CSSLengthParser, _super);

	function CSSLengthParser(value){
		var match;
		if (value === 'auto'){
			this.value = 'auto';
		} else if (match = clean(string(value)).match(/^([-\d.]+)(%|px|em|pt)?$/)){
			this.value = number(match[1]);
			this.unit = this.value === 0 || !match[2] ? 'px' : match[2];
		} else {
			this.value = 0;
			this.unit = 'px';
		}
	}

	CSSLengthParser.prototype.toString = function(node){
		if (!(this.value != null)){
			return null;
		} else if (this.value === 'auto'){
			return this.value;
		} else if (node && node.nodeType === 1 && this.unit !== 'px'){
			return (pixelRatio(node, this.unit) * this.value) + 'px';
		} else {
			return this.value + this.unit;
		}
	};

	return CSSLengthParser;

})(CSSParser);

CSSColorParser = (function(_super){

	__extends(CSSColorParser, _super);

	function CSSColorParser(value){
		if (value == null) value = '#000';
		if (value === 'transparent') value = '#00000000';
		this.value = color(value, true) || [0, 0, 0, 1];
	}

	CSSColorParser.prototype.toString = function(forceAlpha){
		if (forceAlpha || this.value[3] !== 1){
			return "rgba(" + this.value + ")";
		} else {
			return "rgb(" + this.value[0] + ", " + this.value[1] + ", " + this.value[2] + ")";
		}
	};

	return CSSColorParser;

})(CSSParser);

mirror4 = function(values){
	var length;
	length = values.length;
	if (length === 1){
		values.push(values[0], values[0], values[0]);
	} else if (length === 2){
		values.push(values[0], values[1]);
	} else if (length === 3){
		values.push(values[1]);
	}
	return values;
};

CSSLengthParsers = (function(_super){

	__extends(CSSLengthParsers, _super);

	function CSSLengthParsers(value){
		var v;
		this.parsers = mirror4((function(){
			var _i, _len, _ref, _results;
			_ref = value.split(' ');
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++){
				v = _ref[_i];
				_results.push(new CSSLengthParser(v));
			}
			return _results;
		})());
	}

	return CSSLengthParsers;

})(CSSParsers);

CSSBorderStyleParser = (function(_super){

	__extends(CSSBorderStyleParser, _super);

	function CSSBorderStyleParser(value){
		this.value = value.match(/none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit/) ? value : 'none';
	}

	return CSSBorderStyleParser;

})(CSSParser);

trbl = ['Top', 'Right', 'Bottom', 'Left'];

tlbl = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'];

parsers.color = parsers.backgroundColor = CSSColorParser;

parsers.width = parsers.height = parsers.fontSize = parsers.backgroundSize = CSSLengthParser;

CSSBorderDIRParsers = (function(_super){

	__extends(CSSBorderDIRParsers, _super);

	function CSSBorderDIRParsers(value){
		value = clean(value).match(/((?:[\d.]+)(?:px|em|pt)?)\s(\w+)\s(rgb(?:a)?\([\d,\s]+\)|hsl(?:a)?\([\d,\s]+\)|#[a-f0-9]+|\w+)/) || [null, '0px'];
		this.parsers = [new CSSLengthParser(value[1]), new CSSBorderStyleParser(value[2]), new CSSColorParser(value[3])];
	}

	return CSSBorderDIRParsers;

})(CSSParsers);

for (_i = 0, _len = trbl.length; _i < _len; _i++){
	d = trbl[_i];
	bd = 'border' + d;
	_ref = ['margin' + d, 'padding' + d, bd + 'Width', d.toLowerCase()];
	for (_j = 0, _len2 = _ref.length; _j < _len2; _j++){
		name = _ref[_j];
		parsers[name] = CSSLengthParser;
	}
	parsers[bd + 'Color'] = CSSColorParser;
	parsers[bd + 'Style'] = CSSBorderStyleParser;
	parsers[bd] = CSSBorderDIRParsers;
	getters[bd] = function(){
		return [getter(bd + 'Width').call(this), getter(bd + 'Style').call(this), getter(bd + 'Color').call(this)].join(' ');
	};
}

for (_k = 0, _len3 = tlbl.length; _k < _len3; _k++){
	d = tlbl[_k];
	parsers['border' + d + 'Radius'] = CSSLengthParser;
}

parsers.zIndex = CSSZindexParser = (function(_super){

	__extends(CSSZindexParser, _super);

	function CSSZindexParser(value){
		this.value = value === 'auto' ? value : number(value);
	}

	return CSSZindexParser;

})(CSSParser);

_ref2 = ['margin', 'padding'];
_fn = function(name){
	parsers[name] = CSSLengthParsers;
	return getters[name] = function(){
		var d;
		return ((function(){
			var _len5, _m, _results;
			_results = [];
			for (_m = 0, _len5 = trbl.length; _m < _len5; _m++){
				d = trbl[_m];
				_results.push(getter(name + d).call(this));
			}
			return _results;
		}).call(this)).join(' ');
	};
};
for (_l = 0, _len4 = _ref2.length; _l < _len4; _l++){
	name = _ref2[_l];
	_fn(name);
}

parsers.borderRadius = CSSLengthParsers;

getters.borderRadius = function(){
	var d;
	return ((function(){
		var _len5, _m, _results;
		_results = [];
		for (_m = 0, _len5 = trbl.length; _m < _len5; _m++){
			d = trbl[_m];
			_results.push(getter('border' + d + 'Radius').call(this));
		}
		return _results;
	}).call(this)).join(' ');
};

parsers.borderWidth = CSSLengthParsers;

parsers.borderColor = CSSColorParsers = (function(_super){

	__extends(CSSColorParsers, _super);

	function CSSColorParsers(colors){
		var c;
		colors = colors.match(/rgb(a)?\([\d,\s]+\)|hsl(a)?\([\d,\s]+\)|#[a-f0-9]+|\w+/g) || ['#000'];
		this.parsers = mirror4((function(){
			var _len5, _m, _results;
			_results = [];
			for (_m = 0, _len5 = colors.length; _m < _len5; _m++){
				c = colors[_m];
				_results.push(new CSSColorParser(c));
			}
			return _results;
		})());
	}

	return CSSColorParsers;

})(CSSParsers);

_ref3 = ['Width', 'Style', 'Color'];
_fn2 = function(t){
	return getters['border' + t] = function(){
		var d;
		return ((function(){
			var _len6, _n, _results;
			_results = [];
			for (_n = 0, _len6 = trbl.length; _n < _len6; _n++){
				d = trbl[_n];
				_results.push(getter('border' + d + t).call(this));
			}
			return _results;
		}).call(this)).join(' ');
	};
};
for (_m = 0, _len5 = _ref3.length; _m < _len5; _m++){
	t = _ref3[_m];
	_fn2(t);
}

parsers.border = CSSBorderDIRParsers;

getters.border = function(){
	var d, pvalue, value, _len6, _n;
	for (_n = 0, _len6 = trbl.length; _n < _len6; _n++){
		d = trbl[_n];
		value = getter(bd = 'border' + d).call(this);
		if (pvalue && value !== pvalue) return null;
		pvalue = value;
	}
	return value;
};

filterName = html.style.MsFilter != null ? 'MsFilter' : html.style.filter != null ? 'filter' : null;

parsers.opacity = CSSNumberParser;

if (!(html.style.opacity != null) && filterName){
	matchOp = /alpha\(opacity=([\d.]+)\)/i;
	setters.opacity = function(value){
		var filter;
		value = (value = number(value) === 1) ? '' : "alpha(opacity=" + (value * 100) + ")";
		filter = computedStyle(this)(filterName);
		return this.style[filterName] = matchOp.test(filter) ? filter.replace(matchOp, value) : filter + value;
	};
	getters.opacity = function(){
		var match;
		return string(!(match = computedStyle(this)(filterName).match(matchOp)) ? 1 : match[1] / 100);
	};
}

_ref4 = ['MozTransform', 'WebkitTransform', 'OTransform', 'msTransform', 'transform'];
for (_n = 0, _len6 = _ref4.length; _n < _len6; _n++){
	item = _ref4[_n];
	if (!(html.style[item] != null)) continue;
	CSSTransform = item;
	break;
}

parsers.transform = CSSTransformParser = (function(_super){

	__extends(CSSTransformParser, _super);

	function CSSTransformParser(value){
		var transforms, v, _fn3, _len7, _o;
		transforms = {
			translate: '0px,0px',
			rotate: '0deg',
			scale: '1,1',
			skew: '0deg,0deg'
		};
		if (value = clean(value).match(/\w+\s?\([-,.\w\s]+\)/g)){
			_fn3 = function(v){
				var values, _len10, _len8, _len9, _p, _q, _r, _results, _results2, _results3;
				if (!(v = v.replace(/\s+/g, '').match(/^(translate|scale|rotate|skew)\((.*)\)$/))){
					return;
				}
				name = v[1];
				values = v[2].split(',');
				switch (name){
					case 'translate':
						if (values.length < 2) return;
						_results = [];
						for (_p = 0, _len8 = values.length; _p < _len8; _p++){
							v = values[_p];
							_results.push(transforms[name] = number(v) + 'px');
						}
						return _results;
						break;
					case 'rotate':
						return transforms[name] = number(values[0]) + 'deg';
					case 'scale':
						if (values.length === 1) values = [values[0], values[0]];
						_results2 = [];
						for (_q = 0, _len9 = values.length; _q < _len9; _q++){
							v = values[_q];
							_results2.push(transforms[name] = number(v));
						}
						return _results2;
						break;
					case 'skew':
						if (values.length === 1) return;
						_results3 = [];
						for (_r = 0, _len10 = values.length; _r < _len10; _r++){
							v = values[_r];
							_results3.push(transforms[name] = number(v) + 'deg');
						}
						return _results3;
				}
			};
			for (_o = 0, _len7 = value.length; _o < _len7; _o++){
				v = value[_o];
				_fn3(v);
			}
		}
		this.transforms = transforms;
	}

	CSSTransformParser.prototype.toString = function(){
		var name;
		return ((function(){
			var _len7, _o, _ref5, _results;
			_ref5 = ['translate', 'rotate', 'scale', 'skew'];
			_results = [];
			for (_o = 0, _len7 = _ref5.length; _o < _len7; _o++){
				name = _ref5[_o];
				_results.push("" + name + "(" + this.transforms[name] + ")");
			}
			return _results;
		}).call(this)).join(' ');
	};

	return CSSTransformParser;

})(CSSParser);

if (CSSTransform){
	browser.transform = CSSTransform;
	setters.transform = function(value){
		return this.style[CSSTransform] = new CSSTransformParser(value).toString();
	};
	getters.transform = function(){
		return new CSSTransformParser(this.style[CSSTransform]).toString();
	};
} else {
	setters.transform = function(){};
	getters.transform = function(){
		return new CSSTransformParser().toString();
	};
}

beziers = {};

bezier = function(x1, y1, x2, y2, n, epsilon){
	var a, b, c, i, u, x, xs, ys, _x, _y;
	xs = [0];
	ys = [0];
	x = 0;
	i = 1;
	while (i < n - 1){
		u = 1 / n * i;
		a = Math.pow(1 - u, 2) * 3 * u;
		b = Math.pow(u, 2) * 3 * (1 - u);
		c = Math.pow(u, 3);
		_x = x1 * a + x2 * b + c;
		_y = y1 * a + y2 * b + c;
		if ((_x - x) > epsilon){
			x = _x;
			xs.push(_x);
			ys.push(_y);
		}
		i++;
	}
	xs.push(1);
	ys.push(1);
	return function(t){
		var left, middle, right;
		left = 0;
		right = xs.length - 1;
		while (left <= right){
			middle = Math.floor((left + right) / 2);
			if (xs[middle] === t){
				break;
			} else if (xs[middle] > t){
				right = middle - 1;
			} else {
				left = middle + 1;
			}
		}
		return ys[middle];
	};
};

equations = {
	'default': 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
	'linear': 'cubic-bezier(0, 0, 1, 1)',
	'ease-in': 'cubic-bezier(0.42, 0, 1.0, 1.0)',
	'ease-out': 'cubic-bezier(0, 0, 0.58, 1.0)',
	'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1.0)'
};

Animation = (function(){

	function Animation(node, property){
		this.node = node;
		this.property = property;
		this.setter = setter(property);
		this.getter = getter(property);
	}

	Animation.prototype.start = function(from, to){
		var pass;
		this.stop();
		pass = true;
		if (from === to) pass = false;
		if (this.duration === 0){
			this.setter.call(this.node, to);
			pass = false;
		}
		if (!pass) requestFrame(this.callback);
		return pass;
	};

	Animation.prototype.setOptions = function(options){
		var _ref5;
		if (options == null) options = {};
		if (!(this.duration = this.parseDuration((_ref5 = options.duration) != null ? _ref5 : '500ms'))){
			throw new Error("" + options.duration + " is not a valid duration");
		}
		if (!(this.equation = this.parseEquation(options.equation || 'default'))){
			throw new Error("" + options.equation + " is not a valid equation");
		}
		this.callback = options.callback || function(){};
		return this;
	};

	Animation.prototype.parseDuration = function(duration){
		var match, time, unit;
		if (match = string(duration).match(/([\d.]+)(s|ms)/)){
			time = number(match[1]);
			unit = match[2];
			if (unit === 's') return time * 1000;
			if (unit === 'ms') return time;
		} else {
			return null;
		}
	};

	Animation.prototype.parseEquation = function(equation){
		var m, match, _len7, _o, _ref5, _results;
		equation = equations[equation] || equation;
		match = equation.replace(/\s+/g, '').match(/^cubic-bezier\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)$/);
		if (match){
			_ref5 = match.slice(1);
			_results = [];
			for (_o = 0, _len7 = _ref5.length; _o < _len7; _o++){
				m = _ref5[_o];
				_results.push(number(m));
			}
			return _results;
		} else {
			return null;
		}
	};

	return Animation;

})();

JSAnimation = (function(_super){

	__extends(JSAnimation, _super);

	function JSAnimation(node, property){
		var _this = this;
		JSAnimation.__super__.constructor.call(this, node, property);
		this.bstep = function(t){
			return _this.step(t);
		};
	}

	JSAnimation.prototype.start = function(from, to){
		if (JSAnimation.__super__.start.call(this, from, to)){
			this.time = 0;
			from = this.numbers(from);
			to = this.numbers(to);
			if (from[0].length !== to[0].length){
				throw new Error('property length mismatch');
			}
			this.from = from[0];
			this.to = to[0];
			this.template = to[1];
			requestFrame(this.bstep);
		}
		return this;
	};

	JSAnimation.prototype.stop = function(){
		cancelFrame(this.bstep);
		return this;
	};

	JSAnimation.prototype.step = function(now){
		var f, i, tpl, ƒ, δ, _len7, _ref5;
		this.time || (this.time = now);
		ƒ = (now - this.time) / this.duration;
		if (ƒ > 1) ƒ = 1;
		δ = this.equation(ƒ);
		tpl = this.template;
		_ref5 = this.from;
		for (i = 0, _len7 = _ref5.length; i < _len7; i++){
			f = _ref5[i];
			t = this.to[i];
			tpl = tpl.replace('@', t !== f ? this.compute(f, t, δ) : t);
		}
		this.setter.call(this.node, tpl);
		if (ƒ !== 1){
			requestFrame(this.bstep);
		} else {
			this.callback(t);
		}
		return this;
	};

	JSAnimation.prototype.parseEquation = function(equation){
		var ID, es;
		equation = JSAnimation.__super__.parseEquation.call(this, equation);
		es = equation.toString();
		ID = "" + es + ":" + this.duration + "ms";
		if (es === [0, 0, 1, 1].toString()){
			return function(x){
				return x;
			};
		} else {
			return beziers[ID] || (beziers[ID] = bezier(equation[0], equation[1], equation[2], equation[3], this.duration * 2, (1000 / 60 / this.duration) / 4));
		}
	};

	JSAnimation.prototype.compute = function(from, to, δ){
		return (to - from) * δ + from;
	};

	JSAnimation.prototype.numbers = function(s){
		var ns, replaced;
		ns = [];
		replaced = s.replace(/[-\d.]+/g, function(n){
			ns.push(number(n));
			return '@';
		});
		return [ns, replaced];
	};

	return JSAnimation;

})(Animation);

_ref5 = ['WebkitTransition', 'MozTransition', 'transition'];
for (_o = 0, _len7 = _ref5.length; _o < _len7; _o++){
	item = _ref5[_o];
	if (!(html.style[item] != null)) continue;
	CSSTransition = item;
	break;
}

CSSTransitionEnd = CSSTransition === 'MozTransition' ? 'transitionend' : 'webkitTransitionEnd';

CSSAnimation = (function(_super){

	__extends(CSSAnimation, _super);

	function CSSAnimation(node, property){
		var _this = this;
		CSSAnimation.__super__.constructor.call(this, node, property);
		this.hproperty = hyphenate(browser[this.property] || this.property);
		this.bdefer = function(t){
			return _this.defer(t);
		};
		this.bcomplete = function(e){
			return _this.complete(e);
		};
	}

	CSSAnimation.prototype.start = function(from, to){
		if (CSSAnimation.__super__.start.call(this, from, to)){
			this.to = to;
			requestFrame(this.bdefer);
		}
		return this;
	};

	CSSAnimation.prototype.stop = function(hard){
		if (this.running){
			this.running = false;
			if (hard) this.setter.call(this.node, this.getter.call(this.node));
			this.clean();
		} else {
			cancelFrame(this.bdefer);
		}
		return this;
	};

	CSSAnimation.prototype.defer = function(){
		this.running = true;
		this.modCSS(true);
		this.node.addEventListener(CSSTransitionEnd, this.bcomplete, false);
		this.setter.call(this.node, this.to);
		return null;
	};

	CSSAnimation.prototype.clean = function(){
		this.modCSS();
		this.node.removeEventListener(CSSTransitionEnd, this.bcomplete);
		return null;
	};

	CSSAnimation.prototype.complete = function(e){
		if (e && e.propertyName === this.hproperty){
			this.running = false;
			this.clean();
			this.callback();
		}
		return null;
	};

	CSSAnimation.prototype.removeProp = function(prop, a, b, c){
		var i, io, p, _len8;
		for (i = 0, _len8 = a.length; i < _len8; i++){
			p = a[i];
			if (!(p === prop)) continue;
			io = i;
			break;
		}
		if (io != null){
			a.splice(io, 1);
			b.splice(io, 1);
			c.splice(io, 1);
		}
		return null;
	};

	CSSAnimation.prototype.modCSS = function(inclusive){
		var e, p, rules;
		rules = computedStyle(this.node);
		p = rules(CSSTransition + 'Property').replace(/\s+/g, '').split(',');
		d = rules(CSSTransition + 'Duration').replace(/\s+/g, '').split(',');
		e = rules(CSSTransition + 'TimingFunction').replace(/\s+/g, '').match(/cubic-bezier\(([\d.,]+)\)/g);
		this.removeProp('all', p, d, e);
		this.removeProp(this.hproperty, p, d, e);
		if (inclusive){
			p.push(this.hproperty);
			d.push(this.duration);
			e.push(this.equation);
		}
		this.node.style[CSSTransition + 'Property'] = p;
		this.node.style[CSSTransition + 'Duration'] = d;
		this.node.style[CSSTransition + 'TimingFunction'] = e;
		return null;
	};

	CSSAnimation.prototype.parseDuration = function(duration){
		return "" + (CSSAnimation.__super__.parseDuration.call(this, duration)) + "ms";
	};

	CSSAnimation.prototype.parseEquation = function(equation){
		return "cubic-bezier(" + (CSSAnimation.__super__.parseEquation.call(this, equation)) + ")";
	};

	return CSSAnimation;

})(Animation);

Animations = (function(){

	function Animations(){
		this.uid = 0;
		this.animations = {};
	}

	Animations.prototype.retrieve = function(node, property){
		var animation, uid, _base, _ref6;
		uid = (_ref6 = node.µid) != null ? _ref6 : node.µid = (this.uid++).toString(36);
		animation = (_base = this.animations)[uid] || (_base[uid] = {});
		return animation[property] || (animation[property] = CSSTransition ? new CSSAnimation(node, property) : new JSAnimation(node, property));
	};

	Animations.prototype.starts = function(nodes, styles, options){
		var callback, completed, enforce, fp, fromParsers, fs, get, i, instance, length, node, parsedFrom, parsedTo, parser, property, set, toParsers, tp, ts, type, value, _len8, _len9, _p;
		if (options == null) options = {};
		type = typeof options;
		options = type === 'function' ? {
			callback: options
		} : type === 'string' ? {
			duration: options
		} : options;
		callback = options.callback || function(){};
		completed = 0;
		length = 0;
		options.callback = function(){
			if (++completed === length) return callback();
		};
		for (property in styles){
			value = styles[property];
			property = camelize(property);
			parser = parsers[property];
			if (!parser) throw new Error("no parser for " + property);
			set = setter(property);
			get = getter(property);
			for (_p = 0, _len8 = nodes.length; _p < _len8; _p++){
				node = nodes[_p];
				length++;
				instance = this.retrieve(node, property);
				parsedFrom = new parser(get.call(node));
				parsedTo = new parser(value);
				fromParsers = parsedFrom.extract();
				toParsers = parsedTo.extract();
				for (i = 0, _len9 = fromParsers.length; i < _len9; i++){
					fp = fromParsers[i];
					tp = toParsers[i];
					if ('auto' === tp.value || 'auto' === fp.value){
						throw new Error("cannot animate " + property + " from or to `auto`");
					}
					if (tp.unit && fp.unit){
						enforce = true;
						if (tp.unit !== 'px'){
							fp.value = fp.value / pixelRatio(node, tp.unit);
							fp.unit = tp.unit;
						}
					}
				}
				fs = parsedFrom.toString(true);
				ts = parsedTo.toString(true);
				if (enforce) set.call(node, fs);
				instance.setOptions(options).start(fs, ts);
			}
		}
		return this;
	};

	Animations.prototype.start = function(nodes, property, value, options){
		var styles;
		styles = {};
		styles[property] = value;
		return this.starts(nodes, styles, options);
	};

	Animations.prototype.sets = function(nodes, styles){
		var node, property, set, value, _len8, _p, _ref6, _ref7;
		for (property in styles){
			value = styles[property];
			set = setter(property = camelize(property));
			for (_p = 0, _len8 = nodes.length; _p < _len8; _p++){
				node = nodes[_p];
				if ((_ref6 = this.animations[node.µid]) != null){
					if ((_ref7 = _ref6[property]) != null) _ref7.stop(true);
				}
				set.call(node, value);
			}
		}
		return this;
	};

	Animations.prototype.set = function(nodes, property, value){
		var styles;
		styles = {};
		styles[property] = value;
		return this.sets(nodes, styles);
	};

	return Animations;

})();

animations = new Animations;

moofx.prototype.animate = function(A, B, C){
	if (typeof A !== 'string'){
		animations.starts(this.valueOf(), A, B);
	} else {
		animations.start(this.valueOf(), A, B, C);
	}
	return this;
};

moofx.prototype.style = function(A, B){
	if (typeof A !== 'string'){
		animations.sets(this.valueOf(), A);
	} else {
		animations.set(this.valueOf(), A, B);
	}
	return this;
};

moofx.prototype.compute = function(A){
	return getter(camelize(A)).call(this.valueOf()[0]);
};

})();