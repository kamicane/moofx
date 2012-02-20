# moofx: A CSS3-enabled javascript animation library on caffeine
# author: Valerio Proietti (@kamicane) http://mad4milk.net http://mootools.net
# license: MIT

# utils

{cancelFrame, requestFrame, color} = moofx
string = String
number = parseFloat

camelize = (self) ->
	self.replace(/-\D/g, (match) -> match.charAt(1).toUpperCase())

hyphenate = (self) ->
	self.replace(/[A-Z]/g, (match) -> '-' + match.charAt(0).toLowerCase())

clean = (self) ->
	string(self).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '')
	
# computedStyle
	
computedStyle = if typeof getComputedStyle isnt 'undefined' then (node) ->
	cts = getComputedStyle(node)
	(property) ->
			if cts then cts.getPropertyValue(hyphenate(property)) else ''
else (node) ->
	cts = node.currentStyle
	(property) ->
		if cts then cts[camelize(property)] else ''

# css parsers

parsers = {}
getters = {}
setters = {}
html = document.documentElement
browser = {}

getter = (key) ->
	getters[key] or= do ->
		parser = parsers[key] or CSSStringParser
		() ->
			new parser(computedStyle(@)(key)).toString(@)
	
setter = (key) ->
	setters[key] or= do ->
		parser = parsers[key] or CSSStringParser
		(value) ->
			@style[key] = new parser(value).toString()
			

test = document.createElement('div')
cssText = "border:none;margin:none;padding:none;visibility:hidden;position:absolute;height:0;"

pixelRatio = (element, u) ->
	parent = element.parentNode
	ratio = 1
	if (parent)
		test.style.cssText = cssText + "width:100#{u};"
		parent.appendChild(test)
		ratio = test.offsetWidth / 100
		parent.removeChild(test)
	ratio
	
class CSSParser
	constructor: (value) ->
		@value = string(value)
	extract: () ->
		[@]
	toString: () ->
		string(@value)

class CSSParsers
	constructor: (parsers) ->
		@parsers = parsers
	extract: () ->
		@parsers
	toString: (x) ->
		(parser.toString(x) for parser in @parsers).join(' ')
		#!map map(@parsers, (parser)-> parser.toString(x)).join(' ')

class CSSNumberParser extends CSSParser
	constructor: (value) ->
		@value = number(value)
		
class CSSStringParser extends CSSParser
		
class CSSNumberParser extends CSSParser
	constructor: (value) ->
		@value = number(value)
	
class CSSLengthParser extends CSSParser
	constructor: (value) ->
		if value is 'auto'
			@value = 'auto'
		else if match = clean(string(value)).match(/^([-\d.]+)(%|px|em|pt)?$/)
			@value = number(match[1])
			@unit = if @value is 0 or not match[2] then 'px' else match[2]
		else
			@value = 0
			@unit = 'px'
	toString: (node) ->
		if not @value? then null
		else if @value is 'auto' then @value
		else if node and node.nodeType is 1 and @unit != 'px' then (pixelRatio(node, @unit) * @value) + 'px'
		else @value + @unit

class CSSColorParser extends CSSParser
	constructor: (value = '#000') ->
		value = '#00000000' if value is 'transparent'
		@value = color(value, yes) or [0, 0, 0, 1]
	toString: (forceAlpha) ->
		if not forceAlpha and @value[3] is 1 then "rgb(#{@value[0]}, #{@value[1]}, #{@value[2]})"
		else "rgba(#{@value})"
		

mirror4 = (values) ->
	length = values.length
	if length is 1 then values.push(values[0], values[0], values[0])
	else if length is 2 then values.push(values[0], values[1])
	else if length is 3 then values.push(values[1])
	return values


class CSSLengthParsers extends CSSParsers
	constructor: (value) ->
		@parsers = mirror4(new CSSLengthParser(v) for v in value.split(' '))
		#!map @parsers = mirror4(map(value.split(' '), (v) -> new CSSLengthParser(v)))

class CSSBorderStyleParser extends CSSParser
	constructor: (value) ->
		@value = if value.match(/none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit/) then value else 'none'

trbl = ['Top', 'Right', 'Bottom', 'Left']
tlbl = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft']

# color, backgroundColor

parsers.color = parsers.backgroundColor = CSSColorParser

# width, height, fontSize, backgroundSize

parsers.width = parsers.height = parsers.fontSize = parsers.backgroundSize = CSSLengthParser

class CSSBorderDIRParsers extends CSSParsers
	constructor: (value) ->
		value = clean(value).match(/((?:[\d.]+)(?:px|em|pt)?)\s(\w+)\s(rgb(?:a)?\([\d,\s]+\)|hsl(?:a)?\([\d,\s]+\)|#[a-f0-9]+|\w+)/) or [null, '0px']
		@parsers = [new CSSLengthParser(value[1]), new CSSBorderStyleParser(value[2]), new CSSColorParser(value[3])]
		
# marginDIR, paddingDIR, borderDIRWidth, borderDIRstyle, borderDIRColor, borderDIR

for d in trbl
	bd = 'border' + d
	parsers[name] = CSSLengthParser for name in ['margin' + d, 'padding' + d, bd + 'Width', d.toLowerCase()]
	parsers[bd + 'Color'] = CSSColorParser
	parsers[bd + 'Style'] = CSSBorderStyleParser
	
	parsers[bd] = CSSBorderDIRParsers
	getters[bd] = () ->
		[getter(bd + 'Width').call(@), getter(bd + 'Style').call(@), getter(bd + 'Color').call(@)].join(' ')

# borderDIRRadius

parsers['border' + d + 'Radius'] = CSSLengthParser for d in tlbl

# zIndex

parsers.zIndex = class CSSZindexParser extends CSSParser
	constructor: (value) ->
		@value = if value is 'auto' then value else number(value)
		
#margin, padding

for name in ['margin', 'padding'] then do (name) ->
	parsers[name] = CSSLengthParsers
	getters[name] = () ->
		(getter(name + d).call(@) for d in trbl).join(' ')
	#!map map(trbl, (d) => getter(name + d).call(@)).join(' ')
			

# borderRadius

parsers.borderRadius = CSSLengthParsers
getters.borderRadius = () ->
	(getter('border' + d + 'Radius').call(@) for d in trbl).join(' ')
	#!map map(trbl, (d) => getter(border + d + 'Radius').call(@)).join(' ')

# borderWidth, borderStyle, borderColor

parsers.borderWidth = CSSLengthParsers

parsers.borderColor = class CSSColorParsers extends CSSParsers
	constructor: (colors) ->
		colors = colors.match(/rgb(a)?\([\d,\s]+\)|hsl(a)?\([\d,\s]+\)|#[a-f0-9]+|\w+/g) or ['#000']
		@parsers = mirror4(new CSSColorParser(c) for c in colors)
		#!map @parsers = mirror4(map(colors, (c) -> new CSSColorParser(c)))
		
for t in ['Width', 'Style', 'Color'] then do (t) ->
	getters['border' + t] = () ->
		(getter('border' + d + t).call(@) for d in trbl).join(' ')
	#!map map(trbl, (d) => getter(border + d + t).call(@)).join(' ')

# border

parsers.border = CSSBorderDIRParsers

getters.border = () ->
	for d in trbl
		value = getter(bd = 'border' + d).call(@)
		return null if pvalue and value isnt pvalue
		pvalue = value
	value

# opacity

filterName = if html.style.MsFilter? then 'MsFilter' else if html.style.filter? then 'filter' else null

parsers.opacity = CSSNumberParser

if not html.style.opacity? and filterName
	matchOp = /alpha\(opacity=([\d.]+)\)/i

	setters.opacity = (value) ->
		value = if value = number(value) is 1 then '' else "alpha(opacity=#{value * 100})"
		filter = computedStyle(@)(filterName)
		@style[filterName] = if matchOp.test(filter) then filter.replace(matchOp, value) else filter + value
# 	
	getters.opacity = () ->
		return string(if not match = computedStyle(@)(filterName).match(matchOp) then 1 else match[1] / 100)

# transform

for item in ['MozTransform', 'WebkitTransform', 'OTransform', 'msTransform', 'transform'] when html.style[item]?
	CSSTransform = item
	break

parsers.transform = class CSSTransformParser extends CSSParser

	constructor: (value) ->
		transforms = translate: '0px,0px', rotate: '0deg', scale: '1,1', skew: '0deg,0deg'
		if value = clean(value).match(/\w+\s?\([-,.\w\s]+\)/g)
			for v in value then do (v) ->
				return if not v = v.replace(/\s+/g, '').match(/^(translate|scale|rotate|skew)\((.*)\)$/)
				name = v[1]
				values = v[2].split(',')
				switch name
					when 'translate'
						return if values.length < 2
						transforms[name] = number(v) + 'px' for v in values
						#!map transforms[name] = map(values, number)
					when 'rotate'
						transforms[name] = number(values[0]) + 'deg'
					when 'scale'
						values = [values[0], values[0]] if values.length is 1 
						transforms[name] = number(v) for v in values
						#!map transforms[name] = map(values, number)
					when 'skew'
						return if values.length is 1
						transforms[name] = number(v) + 'deg' for v in values
						#!map transforms[name] = map(values, (v) -> number(v) + 'deg')
							
		@transforms = transforms

	toString: () ->
		("#{name}(#{@transforms[name]})" for name in ['translate', 'rotate', 'scale', 'skew']).join(' ')
		#!map map(['translate', 'rotate', 'scale', 'skew'], (name) -> "#{name}(#{@transforms[name]})").join(' ')

if CSSTransform

	browser.transform = CSSTransform

	setters.transform = (value) ->
		@style[CSSTransform] = new CSSTransformParser(value).toString()

	getters.transform = () ->
		return new CSSTransformParser(@style[CSSTransform]).toString()

else

	setters.transform = () ->

	getters.transform = () ->
		return new CSSTransformParser().toString()

# cubic-bezier solver by https://gist.github.com/arian

beziers = {}
	
bezier = (x1, y1, x2, y2, n, epsilon) ->
	xs = [0]
	ys = [0]
	x = 0
	i = 1
	while i < n-1
		u = 1 / n * i
		a = Math.pow(1 - u, 2) * 3 * u
		b = Math.pow(u, 2) * 3 * (1 - u)
		c = Math.pow(u, 3)
		_x = x1 * a + x2 * b + c
		_y = y1 * a + y2 * b + c
		if (_x - x) > epsilon
			x = _x
			xs.push(_x)
			ys.push(_y)
		i++
			
	xs.push(1)
	ys.push(1)
	
	(t) ->
		left = 0
		right = xs.length - 1
		
		while left <= right
			middle = Math.floor((left + right) / 2)
			if xs[middle] is t then break
			else if xs[middle] > t then right = middle - 1
			else left = middle + 1
		
		ys[middle]

# Animation

equations =
	'default': 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
	'linear': 'cubic-bezier(0, 0, 1, 1)'
	'ease-in': 'cubic-bezier(0.42, 0, 1.0, 1.0)'
	'ease-out': 'cubic-bezier(0, 0, 0.58, 1.0)'
	'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1.0)'

class Animation

	constructor: (node, property) ->
		@node = node
		@property = property

		@setter = setter(property)
		@getter = getter(property)
		
	start: (from, to) ->
		@stop()
		pass = yes
		if from is to then pass = no
		if @duration is 0
			@setter.call(@node, to)
			pass = no
		if not pass then requestFrame(@callback)
		return pass
		
	setOptions: (options = {}) ->
		if not @duration = @parseDuration(options.duration ? '500ms') then throw new Error "#{options.duration} is not a valid duration"
		if not @equation = @parseEquation(options.equation or 'default') then throw new Error "#{options.equation} is not a valid equation"
		@callback = options.callback or () ->
		@
		
	parseDuration: (duration) ->
		if match = string(duration).match(/([\d.]+)(s|ms)/)
			time = number(match[1])
			unit = match[2]
			if unit is 's' then return time * 1000
			else if unit is 'ms' then return time
		else return null
		
	parseEquation: (equation) ->
		equation = equations[equation] or equation
		match = equation.replace(/\s+/g, '').match(/^cubic-bezier\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)$/)
		if match then number(m) for m in match.slice(1) else null
		#!map if match then map(match.slice(1), number) else null

# JSAnimation

class JSAnimation extends Animation

	constructor: (node, property) ->
		super(node, property)
		@bstep = (t) => @step(t)
		
	start: (from, to) ->
		if super(from, to)
			@time = 0
			from = @numbers(from)
			to = @numbers(to)

			if from[0].length isnt to[0].length then throw new Error 'property length mismatch'
			@from = from[0]
			@to = to[0]
			@template = to[1]
			requestFrame(@bstep)
		@
		
	stop: () ->
		cancelFrame(@bstep)
		@

	step: (now) ->
		if not @time then @time = now
		ƒ = (now - @time) / @duration
		if ƒ > 1 then ƒ = 1
		δ = @equation(ƒ)
		tpl = @template
		for f, i in @from
			t = @to[i]
			tpl = tpl.replace('@', if t isnt f then @compute(f, t, δ) else t)
		@setter.call(@node, tpl)
		if ƒ isnt 1 then requestFrame(@bstep) else @callback(t)
		@
		
	parseEquation: (equation) ->
		equation = super(equation)
		es = equation.toString()
		ID = "#{es}:#{@duration}ms"
		if es is [0,0,1,1].toString() then (x) -> x
		else beziers[ID] or= bezier(equation[0], equation[1], equation[2], equation[3], @duration * 2, (1000 / 60 / @duration) / 4)
		
	compute: (from, to, δ) ->
		(to - from) * δ + from

	numbers: (s) ->
		ns = []
		replaced = s.replace(/[-\d.]+/g, (n) ->
			ns.push(number(n))
			return '@'
		)
		[ns, replaced]

# transition detection

for item in ['WebkitTransition', 'MozTransition', 'transition'] when html.style[item]?
	CSSTransition = item
	break
	
CSSTransitionEnd = if CSSTransition is 'MozTransition' then 'transitionend' else 'webkitTransitionEnd'

# CSSAnimation

class CSSAnimation extends Animation

	constructor: (node, property) ->
		super(node, property)
		@hproperty = hyphenate(browser[@property] or @property)
		
		@bdefer = (t) => @defer(t)
		@bcomplete = (e) => @complete(e)
		
	start: (from, to) ->
		if super(from, to)
			@to = to
			requestFrame(@bdefer)
		@
			
	stop: (hard) ->
		if @running
			@running = no
			if hard then @setter.call(@node, @getter.call(@node))
			@clean()
		else cancelFrame(@bdefer)
		@
		
	defer: () ->
		@running = yes
		@modCSS(yes)
		@node.addEventListener(CSSTransitionEnd, @bcomplete, no)
		@setter.call(@node, @to)
		null
		
	clean: () ->
		@modCSS()
		@node.removeEventListener(CSSTransitionEnd, @bcomplete)
		null
		
	complete: (e) ->
		if e and e.propertyName is @hproperty
			@running = no
			@clean()
			@callback()
		null
		
	removeProp: (prop, a, b, c) ->
		for p, i in a when p is prop
			io = i
			break
		if io?
			a.splice(io, 1)
			b.splice(io, 1)
			c.splice(io, 1)
		null
		
	modCSS: (inclusive) ->
		rules = computedStyle(@node)

		p = rules(CSSTransition + 'Property').replace(/\s+/g, '').split(',')
		d = rules(CSSTransition + 'Duration').replace(/\s+/g, '').split(',')
		e = rules(CSSTransition + 'TimingFunction').replace(/\s+/g, '').match(/cubic-bezier\(([\d.,]+)\)/g)

		@removeProp('all', p, d, e)
		@removeProp(@hproperty, p, d, e)

		if inclusive
			p.push(@hproperty)
			d.push(@duration)
			e.push(@equation)

		@node.style[CSSTransition + 'Property'] = p
		@node.style[CSSTransition + 'Duration'] = d
		@node.style[CSSTransition + 'TimingFunction'] = e
		
		null

	parseDuration: (duration) ->
		"#{super(duration)}ms"
		
	parseEquation: (equation) ->
		"cubic-bezier(#{super(equation)})"
		
# Animations

class Animations

	constructor: () ->
		@uid = 0
		@animations = {}
		
	retrieve: (node, property) ->
		uid = node.µid ?= (@uid++).toString(36)
		animation = @animations[uid] or= {}
		animation[property] or= if CSSTransition then new CSSAnimation(node, property) else new JSAnimation(node, property)
	
	starts: (nodes, styles, options = {}) ->
		callback = options.callback or () ->
		completed = 0
		length = 0
		options.callback = () -> callback() if ++completed is length
		
		for property, value of styles
			property = camelize(property)
			parser = parsers[property]
			if not parser then throw new Error "no parser for #{property}"
			
			set = setter(property)
			get = getter(property)
		
			for node in nodes
				length++
				instance = @retrieve(node, property)
				parsedFrom = new parser(get.call(node))
				parsedTo = new parser(value)
				fromParsers = parsedFrom.extract()
				toParsers = parsedTo.extract()
				
				for fp, i in fromParsers
					tp = toParsers[i]
					# if CSSLengthParser, since window.getComputedStyle always returns pixels enforce setstyle in "to" unit.
					throw new Error "cannot animate #{property} from or to `auto`" if 'auto' in [tp.value, fp.value]
					
					if tp.unit and fp.unit
						enforce = yes
						if tp.unit isnt 'px'
							fp.value = fp.value / pixelRatio(node, tp.unit)
							fp.unit = tp.unit
					
				# true here does not trigger the pixel conversion for lengths, but does trigger the rgba enforcement
				fs = parsedFrom.toString(true)
				ts = parsedTo.toString(true)
				
				if enforce then set.call(node, fs)
				
				instance.setOptions(options).start(fs, ts)
		@
		
	start: (nodes, property, value, options) ->
		styles = {}
		styles[property] = value
		@starts(nodes, styles, options)

	sets: (nodes, styles) ->
		for property, value of styles
			set = setter(property = camelize(property))
			for node in nodes
				@animations[node.µid]?[property]?.stop(true)
				set.call(node, value) 
		@

	set: (nodes, property, value) ->
		styles = {}
		styles[property] = value
		@sets(nodes, styles)
	

animations = new Animations

# public

moofx::animate = (A, B, C) ->
	if typeof A isnt 'string' then animations.starts(@valueOf(), A, B)
	else animations.start(@valueOf(), A, B, C)
	@
	
moofx::style = (A, B) ->
	if typeof A isnt 'string' then animations.sets(@valueOf(), A)
	else animations.set(@valueOf(), A, B)
	@
	
moofx::compute = (A) ->
	getter(camelize(A)).call(@valueOf()[0])
