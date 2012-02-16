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

var computedStyle = (window.getComputedStyle) ? function(element){
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

var getter = function(key){
	if (!getters[key]){
		var fn = parsers[key] || function(x){return x;};
		getters[key] = function(){
			return fn(computedStyle(this)(key));
		};
	}
	return getters[key];
}, setter = function(key){
	if (!setters[key]){
		var fn = parsers[key] || function(x){return x;};
		setters[key] = function(value){
			return this.style[key] = fn(value);
		};
	}
	return setters[key];
};

(function(){

var test = document.createElement('div');
test.style.cssText = 'border: none; margin: 0; padding: 0; visibility: hidden; position: absolute; height: 0;';

var pixel = function(element, n, u){
	var parent = element.parentNode, ratio = 1;
	if (parent){
		test.style.width = 10 + u;
		parent.appendChild(test);
		ratio = test.offsetWidth / 10;
		parent.removeChild(test);
	};
	return n * ratio;
};

var mirror4 = function(values){
	var length = values.length;
	if (length == 1) values.push(values[0], values[0], values[0]);
	else if (length == 2) values.push(values[0], values[1]);
	else if (length == 3) values.push(values[1]);
	return values;
};

var length = function(value){
	var match = clean(string(value)).match(/^([-\d.]+)(%|px|em|pt)?$/);
	if (!match) return null;
	var n = number(match[1]), u = (n == 0 || !match[2]) ? 'px' : match[2], parent;
	if (this.nodeType == 1 && u != 'px') return pixel(this, n, u) + 'px';
	return n + u;
}, lengths = function(value){
	return mirror4(clean(value).split(' ').map(length, this)).join(' ');
}, rgba = function(value){
	if (!value) value = '#000';
	else if (value == 'transparent') value = '#00000000';
	var c = moo.color(value, true);
	if (!c) c = [0, 0, 0, 1];
	return 'rgba('+ [c[0], c[1], c[2], c[3]]/*.join(',')*/ + ')';
};

var lengthKeys = [], colorKeys = [], opacity = 'opacity', border = 'border', margin = 'margin', padding = 'padding',
	trbl = ['Top', 'Right', 'Bottom', 'Left'], tlbl = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'];

//marginDIR, paddingDIR, borderDIRWidth, borderDIRstyle, borderDIRColor

trbl.forEach(function(d){
	[margin + d, padding + d, border + d + 'Width', d.toLowerCase()].forEach(function(name){
		lengthKeys.push(name);
	});
	
	colorKeys.push(border + d + 'Color');
	
	parsers[border + d + 'Style'] = function(value){
		return value.match(/none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit/) ? value : null;
	};
});

//borderDIRRadius

tlbl.forEach(function(d){
	lengthKeys.push(border + d + 'Radius');
});

//width, height, fontSize, zIndex

lengthKeys.push('width', 'height', 'fontSize', 'backgroundSize');

parsers['zIndex'] = function(value){
	return (value == 'auto') ? null : number(value);
};

//margin, padding

[margin, padding].forEach(function(name){
	parsers[name] = lengths; //sh
	getters[name] = function(){
		return trbl.map(function(d){
			return getter(name + d).call(this);
		}, this).join(' ');
	};
});

//borderRadius
var br = border + 'Radius';
parsers[br] = lengths; //sh
getters[br] = function(){
	return tlbl.map(function(d){
		return getter(border + d + 'Radius').call(this);
	}, this).join(' ');
};

//borderWidth, borderStyle, BorderColor

parsers[border + 'Width'] = lengths; //sh

parsers[border + 'Style'] = function(value){
	return mirror4(clean(value).split(' ')).join(' ');
}; //sh
parsers[border + 'Color'] = function(colors){
	colors = colors.match(/rgb(a)?\([\d,\s]+\)|hsl(a)?\([\d,\s]+\)|#[a-f0-9]+|\w+/g);
	if (!colors) colors = ["#000"];
	return mirror4(colors.map(rgba)).join(' ');
}; //sh

['Width', 'Style', 'Color'].forEach(function(t){
	getters[border + t] = function(){
		return trbl.map(function(d){
			return getter(border + d + t).call(this);
		}, this).join(' ');
	};
});

//borderDIR

trbl.forEach(function(d){
	var bd = border + d;
	parsers[bd] = function(value){
		value = clean(value).match(/((?:[\d.]+)(?:px|em|pt)?)\s(\w+)\s(rgb(?:a)?\([\d,\s]+\)|hsl(?:a)?\([\d,\s]+\)|#[a-f0-9]+|\w+)/);
		if (!value) value = [null, '0px'];
		return [parsers[bd + 'Width'].call(this, value[1]), parsers[bd + 'Style'](value[2]), parsers[bd + 'Color'](value[3])].join(' ');
	}; //sh
	getters[border + d] = function(){
		return [getters(bd + 'Width').call(this), getter(bd + 'Style').call(this), getter(bd + 'Color').call(this)].join(' ');
	};
});

//color, backgroundColor

colorKeys.push('color', 'backgroundColor');

//border

parsers[border] = parsers[border + 'Top']; //sh

getters[border] = function(){
	var value, pvalue;
	for (var i = 0; i < 4; i++){
		var bd = border + trbl[i];
		value = getter(bd).call(this);
		if (pvalue && value != pvalue) return null;
		pvalue = value;
	}
	return value;
};

//opacity

var filterName = (html.style.MsFilter != null) ? 'MsFilter' : (html.style.filter != null) ? 'filter' : null;

parsers[opacity] = string;

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

parsers['backgroundPosition'] = function(value){
	return clean(value).split(' ').map(length, this).join(' ');
};

var CSSTransform, transform = 'transform', transforms = ['MozTransform', 'WebkitTransform', 'OTransform', 'msTransform', transform];

for (var i = 0, item; item = transforms[i]; i++) if (html.style[item] != null){
	CSSTransform = item;
	break;
}

var transformOrigin = transform + 'Origin';

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
				transforms[name] = values.map(length, this)/*.join(',')*/;
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
	}, this);

	return ['translate', 'rotate', 'scale', 'skew'].map(function(name){
		return name + '(' + transforms[name] + ')';
	}).join(' ');
};

if (CSSTransform){
	
	var CSSTransformOrigin = CSSTransform + 'Origin';
	
	browserTable[transform] = CSSTransform;
	
	setters[transform] = function(value){
		this.style[CSSTransform] = parsers[transform](value);
	};

	getters[transform] = function(){
		return parsers[transform](this.style[CSSTransform]);
	};
	
	setters[transformOrigin] = function(v){
		this.style[CSSTransformOrigin] = string(v);
	};

	getters[transformOrigin] = function(){
		return computedStyle(this)(CSSTransformOrigin);
	};

} else {

	setters[transform] = function(){};
	getters[transform] = function(){
		return parsers[transform]('');
	};
	setters[transformOrigin] = function(){};
	getters[transformOrigin] = function(){};

}

//misc

lengthKeys.forEach(function(name){
	parsers[name] = length;
	setters[name] = function(v){
		this.style[name] = length(v);
	};
	getters[name] = function(){
		return length.call(this, computedStyle(this)(name));
	};
});

colorKeys.forEach(function(name){
	parsers[name] = rgba;
	setters[name] = function(v){
		this.style[name] = moo.color(v);
	};
});

//TODO: [boxShadow, textShadow, clip]
	
})();

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
		setter(property).call(element, tpl);
		(factor != 1) ? moo.frame.request(step) : callback();
	}, from, to, template, time;

	var start = this.start = function(_from, _to){
		stop();
		time = 0;
		if (_from != _to){
			var from_ = numbers(_from), to_ = numbers(_to);
			if (from_[0].length != to_[0].length) throw 'mismatch from and to lengths for the ' + property + ' property.';
			from = from_[0]; to = to_[0]; template = to_[1];
			moo.frame.request(step);
		} else moo.frame.request(callback);
	}, stop = this.stop = function(){
		moo.frame.cancel(step);
	}, options = this.options = function(d, e, c){
		duration = d; callback = c;
		var es = e.toString(), bd = es + '@' + duration;
		equation = (es == [0,0,1,1].toString()) ? function(x){
			return x;
		} : beziers[bd] || (beziers[bd] = bezier(e[0], e[1], e[2], e[3], duration * 2, (1000 / 60 / duration) / 4));
	};

};

//transition detection (@kamicane)

var Property = 'Property', Duration = 'Duration', TimingFunction = 'TimingFunction',
	CSSTransition, transitions = ['WebkitTransition', 'transition'];

for (var i = 0, item; item = transitions[i]; i++) if (html.style[item] != null){
	CSSTransition = item;
	break;
}

var CSSTransitionEnd = (CSSTransition == 'MozTransition') ? 'transitionend' : 'webkitTransitionEnd';

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
		setter(property).call(element, to);
		running = true;
	}, running, to;
	
	var start = this.start = function(from, _to){
		stop();
		to = _to;
		moo.frame.request((from != to) ? defer : callback);
	}, stop = this.stop = function(){
		if (running){
			running = false;
			setter(property).call(element, getter(property).call(element));
			clean();
		} else moo.frame.cancel(defer);
	}, options = this.options = function(d, e, c){
		duration = d + 'ms'; equation = 'cubic-bezier(' + e/*.join(',')*/ + ')'; callback = c;
	};

};

// helpers

var equations = {
	'default': 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
	'linear': 'cubic-bezier(0, 0, 1, 1)',
	'ease-in': 'cubic-bezier(0.42, 0, 1.0, 1.0)',
	'ease-out': 'cubic-bezier(0, 0, 0.58, 1.0)',
	'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1.0)'
};

equations.ease = equations['default'];

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
}, parseOptions = function(options){
	options = options || {};

	var duration = parseDuration(options.duration || '500ms'),
		equation = parseEquation(options.equation || 'default'),
		callback = options.callback || function(){};
	
	if (!equation) throw 'invalid equation supplied';
	if (duration == null) throw 'invalid duration supplied';

	return [duration, equation, callback];
};

var UID = 0, animations = {}, retrieveAnimation = function(node, property){
	var uid = node.µid || (node.µid = UID++), animation = animations[uid] || (animations[uid] = {});
	return animation[property] || (animation[property] = (CSSTransition) ? new cssAnimation(node, property) : new jsAnimation(node, property));
}, stopAnimation = function(node, property){
	var animation = animations[node.µid], instance;
	if (animation && (instance = animation[property])) instance.stop();
};

var startAnimationStyles = function(nodes, styles, options){
	options = parseOptions(options);
	var duration = options[0], callback = options[2], equation = options[1];

	if (duration == 0){ //duration zero check;
		this.set(styles);
		callback(); //manual callback
		return;
	}

	var completed = 0, length = 0, check = function(){
		if (++completed == length) callback();
	};
	
	var clean = {};
	
	for (var property in styles){
		var value = styles[property], parser = parsers[property = camelize(property)];
		if (!parser) throw 'no parser found for ' + property;
		clean[property] = value;
	}

	for (var i = 0, node; node = nodes[i]; i++) (function(node){
		
		for (var property in clean) (function(property, value){

			length++;

			var instance = retrieveAnimation(node, property),
				from = getter(property).call(node), to = parsers[property].call(node, value);
			if (from == null) throw 'could not read ' + property;
			if (to == null) throw 'no valid value for ' + property;
			
			instance.stop();
			instance.options(duration, equation, function(){
				setter(property).call(node, value);
				check();
			});
			instance.start(from, to);
			
		})(property, clean[property]);
		
	})(node);

};

var startAnimationProperty = function(nodes, property, value, options){
	var styles = {};
	styles[property] = value;
	return startAnimationStyles(nodes, styles, options);
};

var setStyles = function(nodes, styles){
	for (var i = 0, node; node = nodes[i]; i++){
		for (var property in styles){
			var value = styles[property], s = setter(property = camelize(property));
			stopAnimation(node, property);
			s.call(node, value);
		}
	}
};

var setStyle = function(nodes, property, value){
	var styles = {};
	styles[property] = value;
	return setStyles(nodes, styles);
};

var getStyle = function(node, property){
	return getter(camelize(property)).call(node);
};

// public interface

moo.prototype.fx = function(A, B, C){
	var nodes = this.valueOf();
	if (typeof A != 'string') startAnimationStyles(nodes, A, B);
	else startAnimationProperty(nodes, A, B, C);
	return this;
};

moo.prototype.style = function(A, B){
	var nodes = this.valueOf();
	if (typeof A != 'string') setStyles(nodes, A);
	else if (arguments.length == 2) setStyle(nodes, A, B);
	else if (arguments.length == 1) return getStyle(nodes[0], A);
	return this;
};

})();
