// #browser animation logic

// {requires}

var bezier = require("cubic-bezier"),
	color = require("./color"),
	frame = require("./frame")

// {util}

var inherits = function(parent, child){
	var C = function(){
		this.constructor = parent
	}
	C.prototype = parent.prototype
	child.prototype = new C
	return child
}

var cancelFrame = frame.cancel,
	requestFrame = frame.request

var string = String, number = parseFloat

var camelize = function(self){
	return self.replace(/-\D/g, function(match){
		return match.charAt(1).toUpperCase()
	})
}

var hyphenate = function(self){
	return self.replace(/[A-Z]/g, function(match){
		return "-" + match.charAt(0).toLowerCase()
	})
}

var clean = function(self){
	return string(self).replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "")
}

var map = Array.map || Array.prototype.map ? function(array, fn, context){
	return Array.prototype.map.call(array, fn, context)
} : function(array, fn, context){
	var result = []
	for (var i = 0, l = array.length; i < l; i++) result.push(fn.call(context, array[i], i, array))
	return result
}

var each = Array.prototype.forEach ? function(array, fn, context){
	Array.prototype.forEach.call(array, fn, context)
	return array
} : function(array, fn, context){
	for (var i = 0, l = array.length; i < l; i++) fn.call(context, array[i], i, array)
	return array
}

var mirror4 = function(values){
	var length = values.length
	if (length === 1) values.push(values[0], values[0], values[0])
	else if (length === 2) values.push(values[0], values[1])
	else if (length === 3) values.push(values[1])
	return values
}

var computedStyle = global.getComputedStyle ? function(node){
	var cts = getComputedStyle(node)
	return function(property){
		return cts ? cts.getPropertyValue(hyphenate(property)) : ""
	}
} : function(node){
	var cts = node.currentStyle
	return function(property){
		return cts ? cts[camelize(property)] : ""
	}
}

// {Parser}

var Parser = function(){}

Parser.prototype.extract = function(){
	return [this]
}

Parser.prototype.toString = function(){
	return string(this.value)
}

// {StringParser}

var StringParser = inherits(Parser, function(value){
	if (value == null) value = ""
	this.value = string(value)
})

var NumberParser = inherits(Parser, function(value){
	if (value == null) value = ""
	var n = number(value)
	this.value = isFinite(n) ? n : value
})

// {Parsers}

var Parsers = function(){}

Parsers.prototype.extract = function(){
	return this.parsed
}

Parsers.prototype.toString = function(normalize, node){
	return clean(map(this.parsed, function(parsed){
		return parsed.toString(normalize, node)
	}, this).join(" "))
}

// {LengthParser}

var LengthParser = inherits(Parser, function(value){
	var match
	if (value == null) value = ""
	if (value === "auto"){
		this.value = "auto"
	} else if (match = clean(string(value)).match(/^([-\d.]+)(%|cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vm)?$/)){
		this.value = number(match[1])
		this.unit = this.value === 0 || !match[2] ? "px" : match[2]
	} else {
		this.value = ""
	}
})

LengthParser.prototype.toString = function(normalize, node){
	if (this.value === "auto") return this.value
	if (this.value === "") return normalize ? "0px" : ""
	if (node && this.unit !== "px") return "" + pixelRatio(node, this.unit) * this.value + "px"
	return this.value + this.unit
}

// {ColorParser}

var ColorParser = inherits(Parser, function(value){
	if (value === "transparent") value = "#00000000"
	this.value = value ? color(value, true) : ""
})

ColorParser.prototype.toString = function(normalize){
	if (!this.value) return normalize ? "rgba(0,0,0,1)" : ""
	if (!normalize && (this.value === "transparent" || this.value[3] === 0)) return "transparent"
	if (normalize || this.value[3] !== 1) return "rgba(" + this.value + ")"
	return "rgb(" + this.value[0] + "," + this.value[1] + "," + this.value[2] + ")"
}

// {LengthsParser}

var LengthsParser = inherits(Parsers, function(value){
	if (value == null) value = ""
	this.parsed = map(mirror4(clean(value).split(" ")), function(v){
		return new LengthParser(v)
	})
})

// {BorderStyleParser}

var BorderStyleParser = inherits(Parser, function(value){
	if (value == null) value = ""
	var match = (value = clean(value)).match(/none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit/)
	this.value = match ? value : ""
})

BorderStyleParser.prototype.toString = function(normalize){
	return (normalize && !this.value) ? "none" : this.value
}

// {BorderParser}

var BorderParser = inherits(Parsers, function(value){
	if (value == null) value = ""
	else if (value === "none") value = "0 none #000"
	var match = (value = clean(value).match(/((?:[\d.]+)(?:[\w%]+)?)\s(\w+)\s(rgb(?:a)?\([\d,\s]+\)|hsl(?:a)?\([\d,\s]+\)|#[a-f0-9]+|\w+)/) || [])
	var matchedWidth = match[1], matchedStyle = match[2], matchedColor = match[3]
	this.parsed = [
		new LengthParser(matchedWidth != null ? matchedWidth : ""),
		new BorderStyleParser(matchedStyle != null ? matchedStyle : ""),
		new ColorParser(matchedColor != null ? matchedColor : "")
	]
})

// {BorderColorParser}

var BorderColorParser = inherits(Parsers, function(colors){
	if (colors == null) colors = ""
	colors = mirror4(colors.match(/rgb(a)?\([\d,\s]+\)|hsl(a)?\([\d,\s]+\)|#[a-f0-9]+|\w+/g) || [""])
	this.parsed = map(colors, function(c){
		return new ColorParser(c)
	})
})

// {ZIndexParser}

var ZIndexParser = inherits(Parser, function(value){
	this.value = value === "auto" ? value : number(value)
})

// parsers, getters, setters

var parsers = {}, getters = {}, setters = {}

var translations = {}

var html = document.documentElement

// {get && set}

var get = function(key){
	return getters[key] || (getters[key] = function(){
		var parser = parsers[key] || StringParser
		return function(){
			return (new parser(computedStyle(this)(key))).toString(true, this)
		}
	}())
}

var set = function(key){
	return setters[key] || (setters[key] = function(){
		var parser = parsers[key] || StringParser
		return function(value){
			return this.style[key] = (new parser(value)).toString()
		}
	}())
}

// {pixel ratio retriever}

var test = document.createElement("div")

var cssText = "border:none;margin:none;padding:none;visibility:hidden;position:absolute;height:0;";

var pixelRatio = function(element, u){
	var parent = element.parentNode, ratio = 1
	if (parent){
		test.style.cssText = cssText + ("width:100" + u + ";")
		parent.appendChild(test)
		ratio = test.offsetWidth / 100
		parent.removeChild(test)
	}
	return ratio
}

// {parsers, getters, setters}

var trbl = ["Top", "Right", "Bottom", "Left"], tlbl = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"]

parsers.color = parsers.backgroundColor = ColorParser

parsers.width = parsers.height = parsers.fontSize = parsers.backgroundSize = LengthParser

each (trbl, function(d){
	var bd = "border" + d
	each([ "margin" + d, "padding" + d, bd + "Width", d.toLowerCase()], function(n){
		parsers[n] = LengthParser
	})
	parsers[bd + "Color"] = ColorParser
	parsers[bd + "Style"] = BorderStyleParser
	parsers[bd] = BorderParser
	getters[bd] = function(){
		return [get(bd + "Width").call(this), get(bd + "Style").call(this), get(bd + "Color").call(this)].join(" ")
	}
})

each(tlbl, function(d){
	parsers["border" + d + "Radius"] = LengthParser
})

parsers.zIndex = ZIndexParser

each(["margin", "padding"], function(name){
	parsers[name] = LengthsParser
	return getters[name] = function(){
		return map(trbl, function(d){
			return get(name + d).call(this)
		}, this).join(" ")
	}
})

parsers.borderRadius = LengthsParser

getters.borderRadius = function(){
	return map(trbl, function(d){
		return get("border" + d + "Radius").call(this)
	}).join(" ")
}

parsers.borderWidth = LengthsParser
parsers.borderColor = BorderColorParser

each(["Width", "Style", "Color"], function(t){
	getters["border" + t] = function(){
		return map(trbl, function(d){
			return get("border" + d + t).call(this)
		}, this).join(" ")
	}
})

parsers.border = BorderParser

getters.border = function(){
	var pvalue
	for (var i = 0; i < trbl.length; i++){
		var value = get("border" + trbl[i]).call(this)
		if (pvalue && value !== pvalue) return null
		pvalue = value
	}
	return value
}

var filterName = html.style.MsFilter != null ? "MsFilter" : html.style.filter != null ? "filter" : null

parsers.opacity = NumberParser

if (filterName && html.style.opacity == null){
	matchOp = /alpha\(opacity=([\d.]+)\)/i
	setters.opacity = function(value){
		value = (value = number(value) === 1) ? "" : "alpha(opacity=" + value * 100 + ")"
		var filter = computedStyle(this)(filterName)
		return this.style[filterName] = matchOp.test(filter) ? filter.replace(matchOp, value) : filter + value
	}
	getters.opacity = function(){
		var match
		return string(!(match = computedStyle(this)(filterName).match(matchOp)) ? 1 : match[1] / 100)
	}
}

var transformName

each(["MozTransform", "WebkitTransform", "OTransform", "msTransform", "transform"], function(transform){
	if (html.style[transform] != null) transformName = transform
})

// transform animations only available on browsers with css3 transitions

parsers.transform = transitionName ? StringParser : inherits(Parser, function(){
	return "none"
})

if (transformName){
	translations.transform = transformName
	setters.transform = function(value){
		return this.style[transformName] = value
	}
	getters.transform = function(){
		return computedStyle(this)(transformName)
	}
} else {
	setters.transform = function(){}
	getters.transform = function(){
		return "none"
	}
}

var transitionName

each(["WebkitTransition", "MozTransition", "transition"], function(transition){
	if (html.style[transition] != null) transitionName = transition
})

var transitionEndName = transitionName === "MozTransition" ? "transitionend" : transitionName === "WebkitTransition" ? "webkitTransitionEnd" : "transitionEnd"

// equations collection

var equations = {
	"default": "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
	"linear": "cubic-bezier(0, 0, 1, 1)",
	"ease-in": "cubic-bezier(0.42, 0, 1.0, 1.0)",
	"ease-out": "cubic-bezier(0, 0, 0.58, 1.0)",
	"ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1.0)"
}

equations.ease = equations["default"]

// {BrowserAnimation}

var BrowserAnimation = function(node, property){
	this.node = node
	this.property = property
	this.setter = set(property)
	this.getter = get(property)
}

BrowserAnimation.prototype.setOptions = function(options){
	if (options == null) options = {}
	var duration = options.duration
	if (typeof duration === 'number') duration = duration + "ms"
	if (!(this.duration = this.parseDuration(duration || "500ms"))) throw new Error(this.duration + " is not a valid duration")
	if (!(this.equation = this.parseEquation(options.equation || "default"))) throw new Error(this.equation + " is not a valid equation")
	this.callback = options.callback || function(){}
	return this
}

BrowserAnimation.prototype.parseDuration = function(duration){
	if (duration = string(duration).match(/([\d.]+)(s|ms)/)){
		var time = number(duration[1]), unit = duration[2]
		if (unit === "s") return time * 1e3
		if (unit === "ms") return time
	}
	return null
}

BrowserAnimation.prototype.parseEquation = function(equation){
	equation = equations[equation] || equation
	var match = equation.replace(/\s+/g, "").match(/^cubic-bezier\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)$/)
	return match ? map(match.slice(1), number) : null
}

// {JSAnimation}

var JSAnimation = inherits(BrowserAnimation, function(node, property){
	BrowserAnimation.prototype.constructor.call(this, node, property)
	var self = this
	this.bstep = function(t){
		return self.step(t)
	}
})

var numbers = function(string){
	var ns = [], replaced = string.replace(/[-\d.]+/g, function(n){
		ns.push(number(n))
		return "@"
	})
	return [ns, replaced]
}

var compute = function(from, to, delta){
	return (to - from) * delta + from
}

JSAnimation.prototype.start = function(from, to){
	if (from != to && this.duration !== 0){
		this.time = 0
		from = numbers(from)
		to = numbers(to)
		if (from[0].length !== to[0].length) throw new Error("length mismatch")
		this.from = from[0]
		this.to = to[0]
		this.template = to[1]
		requestFrame(this.bstep)
	} else {
		if (this.duration == 0) this.setter.call(this.node, to)
		requestFrame(this.callback)
	}
	return this
}

JSAnimation.prototype.stop = function(){
	cancelFrame(this.bstep)
	return this
}

JSAnimation.prototype.step = function(now){
	this.time || (this.time = now)
	var factor = (now - this.time) / this.duration
	if (factor > 1) factor = 1
	var delta = this.equation(factor)
	var tpl = this.template
	var from = this.from, to = this.to
	for (var i = 0, l = from.length; i < l; i++){
		var f = from[i], t = to[i]
		tpl = tpl.replace("@", t !== f ? compute(f, t, delta) : t)
	}
	this.setter.call(this.node, tpl)
	if (factor !== 1) requestFrame(this.bstep)
	else this.callback(t)
}

JSAnimation.prototype.parseEquation = function(equation){
	var equation = BrowserAnimation.prototype.parseEquation.call(this, equation)
	if (equation ==  [0, 0, 1, 1]) return function(x){
		return x
	}
	return bezier(equation[0], equation[1], equation[2], equation[3], 1e3 / 60 / this.duration / 4)
}

// {CSSAnimation}

var CSSAnimation = inherits(BrowserAnimation, function(node, property){
	BrowserAnimation.prototype.constructor.call(this, node, property)
	var self = this
	this.hproperty = hyphenate(translations[this.property] || this.property)
	this.bdefer = function(t){
		return self.defer(t)
	}
	this.bcomplete = function(e){
		return self.complete(e)
	}
})

CSSAnimation.prototype.start = function(from, to){
	if (from != to && this.duration != 0){
		this.to = to
		requestFrame(this.bdefer)
	} else {
		if (this.duration == 0) this.setter.call(this.node, to)
		requestFrame(this.callback)
	}

	return this
}

CSSAnimation.prototype.stop = function(hard){
	if (this.running){
		this.running = false
		if (hard) this.setter.call(this.node, this.getter.call(this.node))
		this.clean()
	} else {
		cancelFrame(this.bdefer)
	}
	return this
}

CSSAnimation.prototype.defer = function(){
	this.running = true
	this.modCSS(true)
	this.node.addEventListener(transitionEndName, this.bcomplete, false)
	this.setter.call(this.node, this.to)
	return null
}

CSSAnimation.prototype.clean = function(){
	this.modCSS()
	this.node.removeEventListener(transitionEndName, this.bcomplete)
	return null
}

CSSAnimation.prototype.complete = function(e){
	if (e && e.propertyName === this.hproperty){
		this.running = false
		this.clean()
		requestFrame(this.callback)
	}
	return null
}

var removeProp = function(prop, a, b, c){
	var indexOf
	for (var i = 0, l = a.length; i < l; i++){
		if (a[i] !== prop) continue
		indexOf = i
		break
	}
	if (indexOf != null){
		a.splice(indexOf, 1)
		b.splice(indexOf, 1)
		c.splice(indexOf, 1)
	}
}

CSSAnimation.prototype.modCSS = function(inclusive){
	var rules = computedStyle(this.node),
		p = rules(transitionName + "Property").replace(/\s+/g, "").split(","),
		d = rules(transitionName + "Duration").replace(/\s+/g, "").split(","),
		e = rules(transitionName + "TimingFunction").replace(/\s+/g, "").match(/cubic-bezier\(([\d.,]+)\)/g)

	removeProp("all", p, d, e)
	removeProp(this.hproperty, p, d, e)
	if (inclusive){
		p.push(this.hproperty)
		d.push(this.duration)
		e.push(this.equation)
	}

	this.node.style[transitionName + "Property"] = p
	this.node.style[transitionName + "Duration"] = d
	this.node.style[transitionName + "TimingFunction"] = e
}

CSSAnimation.prototype.parseDuration = function(duration){
	return BrowserAnimation.prototype.parseDuration.call(this, duration) + "ms"
}

CSSAnimation.prototype.parseEquation = function(equation){
	return "cubic-bezier(" + BrowserAnimation.prototype.parseEquation.call(this, equation) + ")"
}

// animations collector

var animations = {

	uid: 0,

	animations: {},

	retrieve: function(node, property){
		var animation, _base, _uid
		var uid = (_uid = node["µid"]) != null ? _uid : node["µid"] = (this.uid++).toString(36)
		animation = (_base = this.animations)[uid] || (_base[uid] = {})
		return animation[property] || (animation[property] = transitionName ? new CSSAnimation(node, property) : new JSAnimation(node, property))
	},

	starts: function(nodes, styles, options){
		if (options == null) options = {}

		var type = typeof options

		options = type === "function" ? {
			callback: options
		} : (type === "string" || type === "number") ? {
			duration: options
		} : options

		var callback = options.callback || function(){}

		var completed = 0, length = 0

		options.callback = function(t){
			if (++completed === length) callback(t)
		}

		for (var property in styles){
			var value = styles[property], parser = parsers[property = camelize(property)]
			if (!parser) throw new Error("no parser for " + property)
			var setter = set(property)
			var getter = get(property)
			for (var i = 0, l = nodes.length; i < l; i++){
				length++
				var node = nodes[i],
					instance = this.retrieve(node, property),
					parsedFrom = new parser(getter.call(node)),
					parsedTo = new parser(value),
					fromParsers = parsedFrom.extract(),
					toParsers = parsedTo.extract(),
					enforce = false

				for (var j = 0, k = fromParsers.length; j < k; j++){
					var fp = fromParsers[j], tp = toParsers[j]

					if ("auto" === tp.value || "auto" === fp.value) throw new Error("cannot animate " + property + " from or to `auto`")

					if (tp.unit && fp.unit){
						enforce = true
						if (tp.unit !== "px"){
							fp.value = fp.value / pixelRatio(node, tp.unit)
							fp.unit = tp.unit
						}
					}
				}
				var fs = parsedFrom.toString(true), ts = parsedTo.toString(true)

				if (enforce) setter.call(node, fs)
				instance.setOptions(options).start(fs, ts)
			}
		}
	},

	start: function(nodes, property, value, options){
		var styles = {}
		styles[property] = value
		return this.starts(nodes, styles, options)
	},

	sets: function(nodes, styles){
		for (var property in styles){
			var value = styles[property], setter = set(property = camelize(property))
			for (var i = 0, l = nodes.length; i < l; i++){
				var node = nodes[i], aid, apid
				if ((aid = this.animations[node["µid"]]) != null){
					if ((apid = aid[property]) != null) apid.stop(true)
				}
				setter.call(node, value)
			}
		}
		return this
	},

	set: function(nodes, property, value){
		var styles = {}
		styles[property] = value
		return this.sets(nodes, styles)
	}

}

var mu = function(nod){
	this.valueOf = function(){
		return nod
	}
	return this
}

// moofx!

moofx = function(nod){
	if (!nod) return null
	return new mu(nod.length != null ? nod : nod.nodeType === 1 ? [nod] : [])
}

moofx.prototype = mu.prototype

moofx.prototype.animate = function(A, B, C){
	if (typeof A !== "string") animations.starts(this.valueOf(), A, B)
	else animations.start(this.valueOf(), A, B, C)
	return this
}

moofx.prototype.style = function(A, B){
	if (typeof A !== "string") animations.sets(this.valueOf(), A)
	else animations.set(this.valueOf(), A, B)
	return this
}

moofx.prototype.compute = function(A){
	return get(camelize(A)).call(this.valueOf()[0])
}

// this is for testing

moofx.parse = function(property, value, normalize, node){
	if (!parsers[property = camelize(property)]) return null
	return new parsers[property](value).toString(normalize, node)
}

module.exports = moofx
