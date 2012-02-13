/*
---
provides: fx
requires: [frame, color]
author: "[Valerio Proietti](http://mad4milk.net)"
license: "[MIT](http://mootools.net/license.txt)"
...
*/

(function(){

// utilities (@mootools)

var camelize = function(self){
	return self.replace(/-\D/g, function(match){
		return match.charAt(1).toUpperCase();
	});
}, hyphenate = function(self){
	return self.replace(/[A-Z]/g, function(match){
		return ('-' + match.charAt(0).toLowerCase());
	});
}, clean = function(self){
	return string(self).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
}, number = parseFloat, string = String;

// computedStyle (@kamicane)

var computedStyle = (this.getComputedStyle) ? function(element){
	var computedStyle = getComputedStyle(element);
	return function(property){
		return (computedStyle) ? computedStyle.getPropertyValue(hyphenate(property)) : '';
	};
} : function(element){
	var currentStyle = element.currentStyle;
	return function(property){
		return (currentStyle) ? currentStyle[camelize(property)] : '';
	};
};

// CSS (@kamicane)

var parsers = {}, getters = {}, setters = {}, html = document.documentElement, browserTable = {};

var parser = function(key, fn, shorthand){
	parsers[key] = fn;
	basic(key, fn);
}, setter = function(key, fn){
	setters[key] = fn;
}, getter = function(key, fn){
	getters[key] = fn;
}, basic = function(key, fn){
	fn = fn || function(x){return x;};
	getters[key] = function(){
		return fn(computedStyle(this)(key));
	};
	setters[key] = function(value){
		this.style[key] = fn(value);
	};
};

(function(){

var mirror4 = function(values){
	var length = values.length;
	if (length == 1) values.push(values[0], values[0], values[0]);
	else if (length == 2) value.push(values[0], values[1]);
	else if (length == 3) value.push(values[1]);
	return values;
};

var px = function(value){
	var match = clean(string(value)).match(/^([-\d.]+)(%|px|em|pt)?$/);
	if (!match) return null;
	var n = number(match[1]), u = (n == 0) ? 'px' : match[2];
	return n + (u || 'px');
}, pxs = function(value){
	return mirror4(clean(value).split(' ').map(px)).join(' ');
}, rgba = function(value){
	if (!value) value = '#000';
	else if (value == 'transparent') value = '#00000000';
	var c = µ.color(value, true);
	if (!c) c = [0, 0, 0, 1];
	return 'rgba('+ [c[0], c[1], c[2], c[3]]/*.join(',')*/ + ')';
};

var opacity = 'opacity', border = 'border', margin = 'margin', padding = 'padding',
	trbl = ['Top', 'Right', 'Bottom', 'Left'], tlbl = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'];

//marginDIR, paddingDIR, borderDIRWidth, borderDIRstyle, borderDIRColor

trbl.forEach(function(d){
	[margin + d, padding + d, border + d + 'Width', d.toLowerCase()].forEach(function(name){
		parser(name, px);
	});
	
	var bdc = border + d + 'Color';

	parser(bdc, rgba);
	setters[bdc] = function(v){
		this.style[bdc] = µ.color(v);
	};
	
	parser(border + d + 'Style', function(value){
		return value.match(/none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit/) ? value : null;
	});
});

//borderDIRRadius

tlbl.forEach(function(d){
	parser(border + d + 'Radius', px);
});

//width, height, fontSize, zIndex

parser('width', px);
parser('height', px);
parser('fontSize', px);
parser('zIndex', function(value){
	return (value == 'auto') ? null : number(value);
});

//margin, padding

[margin, padding].forEach(function(name){
	parser(name, pxs); //sh
	getters[name] = function(){
		var rules = computedStyle(this);
		return trbl.map(function(d){
			return getters[name + d].call(this);
		}, this).join(' ');
	};
});

//borderRadius

parser(border + 'Radius', pxs); //sh
getters.borderRadius = function(){
	return tlbl.map(function(d){
		return getters[border + d + 'Radius'].call(this);
	}, this).join(' ');
};

//borderWidth, borderStyle, BorderColor

parser(border + 'Width', pxs); //sh
parser(border + 'Style', function(value){
	return mirror4(clean(value).split(' ')).join(' ');
}); //sh
parser(border + 'Color', function(colors){
	colors = colors.match(/rgb(a)?\([\d,\s]+\)|hsl(a)?\([\d,\s]+\)|#[a-f0-9]+|\w+/g);
	if (!colors) colors = ["#000"];
	return mirror4(colors.map(rgba)).join(' ');
}); //sh

['Width', 'Style', 'Color'].forEach(function(t){
	getters[border + t] = function(){
		return trbl.map(function(d){
			return getters[border + d + t].call(this);
		}, this).join(' ');
	};
});

//borderDIR

trbl.forEach(function(d){
	parser(border + d, function(value){
		value = clean(value).match(/((?:[\d.]+)(?:px|em|pt)?)\s(\w+)\s(rgb(?:a)?\([\d,\s]+\)|hsl(?:a)?\([\d,\s]+\)|#[a-f0-9]+|\w+)/);
		if (!value) value = [null, '0px'];
		return [parsers[border + d + 'Width'](value[1]), parsers[border + d + 'Style'](value[2]), parsers[border + d + 'Color'](value[3])].join(' ');
	}); //sh
	getters[border + d] = function(){
		return [getters[border + d + 'Width'].call(this), getters[border + d + 'Style'].call(this), getters[border + d + 'Color'].call(this)].join(' ');
	};
});

//color, backgroundColor

['color', 'backgroundColor'].forEach(function(name){
	parser(name, rgba);
	setters[name] = function(v){
		this.style[name] = µ.color(v);
	};
});

//border

parser(border, parsers[border + 'Top']); //sh

getters[border] = function(){
	var value, pvalue;
	for (var i = 0; i < 4; i++){
		var bd = border + trbl[i];
		value = getters[bd].call(this);
		if (pvalue && value != pvalue) return null;
		pvalue = value;
	}
	return value;
};

//opacity

var filterName = (html.style.MsFilter != null) ? 'MsFilter' : (html.style.filter != null) ? 'filter' : null;

parser(opacity, function(v){
	return string(v);
});

if (html.style[opacity] == null && filterName){

	var matchOp = /alpha\(opacity=([\d.]+)\)/i;
	
	setters[opacity] = function(value){
		value = number(value);
		value = (value == 1) ? '' : 'alpha(' + opacity + '=' + (value * 100) + ')';
		var filter = computedStyle(this)(filterName);
		this.style[filterName] = matchOp.test(filter) ? filter.replace(matchOp, value) : filter + value;
	};
	
	getters[opacity] = function(){
		var match = computedStyle(this)(filterName).match(matchOp);
		return string((!match) ? 1 : match[1] / 100);
	};

}

//backgroundPosition

parser('backgroundPosition', function(value){
	return clean(value).split(' ').map(px).join(' ');
});

var CSSTransform, transform = 'transform', transforms = ['MozTransform', 'WebkitTransform', 'OTransform', 'msTransform', transform];

for (var i = 0; i < transforms.length; i++){
	var t = transforms[i];
	if (html.style[t] != null){
		CSSTransform = t;
		break;
	}
}

if (CSSTransform){

	var CSSTransformOrigin = CSSTransform + 'Origin', transformOrigin = transform + 'Origin';
	
	browserTable[transform] = CSSTransform;
	
	parsers[transform] = function(value){
		value = value.match(/\w+\s?\([-,.\w\s]+\)/g);
		var transforms = {translate: '0px,0px', rotate: '0deg', scale: '1,1', skew: '0deg,0deg'};
		if (value) value.forEach(function(v){
			v = v.replace(/\s+/g, '').match(/^(translate|scale|rotate|skew)\((.*)\)$/);
			if (!v) return;
			var name = v[1], values = v[2].split(',');
			switch(name){
				case 'translate':
					if (values.length < 2) return;
					transforms[name] = values.map(px)/*.join(',')*/;
				break;
				case 'scale':
					if (values.length == 1) values = [values[0], values[0]];
					transforms[name] = values.map(number)/*.join(',')*/;
				break;
				case 'rotate': transforms[name] = number(values[0]) + 'deg'; break;
				case 'skew':
					if (values.length == 1) return;
					transforms[name] = values.map(function(v){
						return number(v) + 'deg';
					})/*.join(',')*/; 
				break;
			}
		});
		
		return ['translate', 'rotate', 'scale', 'skew'].map(function(name){
			return name + '(' + transforms[name] + ')';
		}).join(' ');
	};
	
	setters[transform] = function(value){
		this.style[CSSTransform] = parsers[transform](value);
	};

	getters[transform] = function(){
		return parsers[transform](this.style[CSSTransform]);
	};

	getters[transformOrigin] = function(){
		return computedStyle(this)(CSSTransformOrigin);
	};

	setters[transformOrigin] = function(v){
		this.style[CSSTransformOrigin] = string(v);
	};
};

//misc

basic('visibility'); basic('display'); basic('backgroundImage'); basic('position');

parser('backgroundSize', px);

// parser('clip', function(value){
// 	value = value.replace(/\s+/g, '').match(/rect\((.*)\))/);
// });

//TODO: [boxShadow, textShadow, clip]
	
})();

//transition detection (@kamicane)

var Property = 'Property', Duration = 'Duration', TimingFunction = 'TimingFunction',
	CSSTransition, transitions = ['WebkitTransition', 'transition'];

for (var i = 0; i < transitions.length; i++){
	
	var p = transitions[i];
	if (html.style[p] != null){
		CSSTransition = p;
		break;
	}
}

var CSSTransitionEnd = (CSSTransition == 'MozTransition') ? 'transitionend' : 'webkitTransitionEnd';

// bezier solver (@arian)

var bezier = function(x1, y1, x2, y2, n, epsilon){
	var xs = [0], ys = [0], x = 0;
	for (var i = 1; i < (n - 1); i++){
		var u = 1 / n * i,
			a = Math.pow(1 - u, 2) * 3 * u,
			b = Math.pow(u, 2) * 3 * (1 - u),
			c = Math.pow(u, 3);
		var _x = x1 * a + x2 * b + c;
		var _y = y1 * a + y2 * b + c;
		if ((_x - x) > epsilon){
			x = _x;
			xs.push(_x);
			ys.push(_y);
		}
	}
	xs.push(1); ys.push(1);
	return function(t){
		var left = 0, right = xs.length - 1;
		while (left <= right){
			var middle = Math.floor((left + right) / 2);
			if (xs[middle] == t) break;
			else if (xs[middle] > t) right = middle - 1;
			else left = middle + 1;
		}
		return ys[middle];
	};
}, beziers = {};

var numbers = function(s){
	var numbers = [], replaced = s.replace(/[-\d.]+/g, function(n){
		numbers.push(number(n));
		return '@';
	});
	return [numbers, replaced];
};

var parseDuration = function(value){
	var match = value.toString().match(/([\d.]+)(s|ms)/);
	if (!match) return null;
	var time = number(match[1]), unit = match[2];
	if (unit == 's') return time * 1000;
	else if (unit == 'ms') return time;
}, parseEquation = function(equation){
	equation = equations[equation] || equation;
	var match = equation.replace(/\s+/g, '').match(/^cubic-bezier\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)$/);
	return (match) ? match.slice(1).map(number) : null;
};

var equations = {
	'default': 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
	'linear': 'cubic-bezier(0, 0, 1, 1)',
	'ease-in': 'cubic-bezier(0.42, 0, 1.0, 1.0)',
	'ease-out': 'cubic-bezier(0, 0, 0.58, 1.0)',
	'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1.0)'
};

equations.ease = equations['default'];

// jsAnimation (@kamicane)

var jsAnimation = function(element, property){
	
	var duration, equation, callback, compute = function(from, to, delta){
		return (to - from) * delta + from;
	}, step = function(now){
		if (!time) time = now;
		var factor = (now - time) / duration;
		if (factor > 1) factor = 1;
		var delta = equation(factor), tpl = template;
		from.forEach(function(f, i){
			var t = to[i];
			tpl = tpl.replace('@', (t != f) ? compute(f, t, delta) : t);
		});
		setters[property].call(element, tpl);
		(factor != 1) ? µ.frame.request(step) : callback();
	}, from, to, template, time;

	var start = this.start = function(_from, _to){
		stop();
		time = 0;
		if (_from != _to){
			var from_ = numbers(_from), to_ = numbers(_to);
			if (from_[0].length != to_[0].length) throw 'mismatch from and to lengths for the ' + property + ' property.';
			from = from_[0]; to = to_[0]; template = to_[1];
			µ.frame.request(step);
		} else callback();
	}, stop = this.stop = function(){
		µ.frame.cancel(step);
	}, options = this.options = function(d, e, c){
		duration = d; callback = c;
		var es = e.toString(), bd = es + '@' + duration;
		equation = (es == [0,0,1,1].toString()) ? function(x){
			return x;
		} : beziers[bd] || (beziers[bd] = bezier(e[0], e[1], e[2], e[3], duration * 2, (1000 / 60 / duration) / 4));
	};

};

// cssAnimation (@kamicane)

var cssAnimation = function(element, property){
	
	var hproperty = hyphenate(browserTable[property] || property);
	
	var duration, equation, callback, cleanTransitionCSS = function(include){
		var rules = computedStyle(element);
		
		var p = rules(CSSTransition + Property).replace(/\s+/g, '').split(','),
			d = rules(CSSTransition + Duration).replace(/\s+/g, '').split(','),
			e = rules(CSSTransition + TimingFunction).replace(/\s+/g, '').match(/cubic-bezier\(([\d.,]+)\)/g);

		var io = p.indexOf(hproperty);
		if (io != -1){
			p.splice(io, 1);
			d.splice(io, 1);
			e.splice(io, 1);
		}
		
		if (include){
			p.push(hproperty);
			d.push(duration);
			e.push(equation);
		}

		element.style[CSSTransition + Property] = p/*.join(', ')*/;
		element.style[CSSTransition + Duration] = d/*.join(', ')*/;
		element.style[CSSTransition + TimingFunction] = e/*.join(', ')*/;
		
	}, clean = function(){
		cleanTransitionCSS();
		element.removeEventListener(CSSTransitionEnd, complete);
	}, complete = function(e){
		if (e && e.propertyName == hproperty){
			running = false;
			callback();
			clean();
		}
	}, defer = function(){
		cleanTransitionCSS(true);
		element.addEventListener(CSSTransitionEnd, complete, false);
		setters[property].call(element, to);
		running = true;
	}, running, to;
	
	var start = this.start = function(from, _to){
		stop();
		to = _to;
		(from != to) ? µ.frame.request(defer) : callback();
	}, stop = this.stop = function(){
		if (running){
			running = false;
			setters[property].call(element, getters[property].call(element));
			clean();
		} else µ.frame.cancel(defer);
	}, options = this.options = function(d, e, c){
		duration = d + 'ms'; equation = 'cubic-bezier(' + e/*.join(',')*/ + ')'; callback = c;
	};

};

var animations = {}, animation = function(element){
	var uid = element.µid, self = animations[uid];
	if (self) return self;
	else animations[uid] = this;
	
	var instances = {}, parseOptions = function(options){
		options = options || {};
		
		var duration = parseDuration(options.duration || '500ms'),
			equation = parseEquation(options.equation || 'default'),
			callback = options.callback || function(){};
			
		if (!equation) throw 'invalid equation supplied';
		if (!duration) throw 'invalid duration supplied';

		return [duration, equation, callback];
	}, retrieve = function(property){
		var propertyName = browserTable[property] || property,
			instance = instances[propertyName] || (instances[propertyName] = (CSSTransition) ? new cssAnimation(element, property) : new jsAnimation(element, property));
		return instance;
	};

	this.start = function(property, value, options, parsed){
		property = camelize(property);
		
		var parser = parsers[property];
		if (!parser) throw 'the ' + property + ' property has no parser';
		
		if (!parsed) options = parseOptions(options);
		if (options[0] == 0){ //duration zero check;
			this.set(property, value);
			options[2](); //manual callback
			return;
		}

		var instance = retrieve(property);

		from = getters[property].call(element); to = parsers[property](value);
		if (from == null) throw 'could not read the ' + property + ' property';
		if (to == null) throw 'no valid value supplied for the ' + property + ' property';

		instance.options.apply(null, options);
		instance.start(from, to);
	};
	
	this.stop = function(property){
		retrieve(property).stop();
	};
	
	this.starts = function(styles, options){
		options = parseOptions(options);
		var p, callback = options[2], completed = 0, length = 0, check = function(){
			if (++completed == length) callback();
		};
		options[2] = check;
		for (p in styles) length++;
		for (p in styles) this.start(p, styles[p], options, true);
	};
	
	this.set = function(property, value){
		property = camelize(property);
		retrieve(property).stop();
		setters[property].call(element, value);
	};
	
	this.sets = function(styles){
		for (var property in styles) this.set(property, styles[property]);
	};
	
	this.get = function(property){
		property = camelize(property);
		return getters[property].call(element);
	};

};

µ.prototype.fx = function(A, B, C){
	var anim = new animation(this.valueOf());
	if (typeof A != 'string') anim.starts(A, B);
	else anim.start(A, B, C);
	return this;
};

µ.prototype.style = function(A, B){
	var anim = new animation(this.valueOf());
	if (typeof A != 'string') anim.sets(A);
	else if (arguments.length == 2) anim.set(A, B);
	else if (arguments.length == 1) return anim.get(A);
	return this;
};

})();
