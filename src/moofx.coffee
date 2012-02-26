# moofx: a css3-enabled javascript animation library on caffeine
# author: Valerio Proietti (@kamicane) http://mad4milk.net http://mootools.net
# license: MIT

color = require("./color")
frame = require("./frame")
bezier = require("./bezier")

cancelFrame = frame.cancel
requestFrame = frame.request

# document polyfill (for tests)

# utils

string = String
number = parseFloat

camelize = (self) ->
	self.replace(/-\D/g, (match) -> match.charAt(1).toUpperCase())

hyphenate = (self) ->
	self.replace(/[A-Z]/g, (match) -> '-' + match.charAt(0).toLowerCase())

clean = (self) ->
	string(self).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '')
	
mirror4 = (values) ->
	length = values.length
	if length is 1 then values.push(values[0], values[0], values[0])
	else if length is 2 then values.push(values[0], values[1])
	else if length is 3 then values.push(values[1])
	return values
	
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

class Parser
	extract: () -> [@]
	toString: () -> string(@value)

class StringParser extends Parser
	constructor: (value = '') -> @value = string(value)

class NumberParser extends Parser
	constructor: (value = '') -> @value = if isFinite(n = number(value)) then n else value

class Parsers
	extract: () -> @parsed
	toString: (normalize, node) ->
		clean((parser.toString(normalize, node) for parser in @parsed).join(' '))
	
class LengthParser extends Parser
	constructor: (value = '') ->
		if value is 'auto' then @value = 'auto'
		else if match = clean(string(value)).match(/^([-\d.]+)(%|cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vm)?$/)
			@value = number(match[1])
			@unit = if @value is 0 or not match[2] then 'px' else match[2]
		else @value = ''
	toString: (normalize, node) ->
		return @value if @value is 'auto'
		return '0px' if normalize and @value is ''
		return '' if @value is ''
		return "#{pixelRatio(node, @unit) * @value}px" if node and @unit != 'px'
		@value + @unit

class ColorParser extends Parser
	constructor: (value) ->
		value = '#00000000' if value is 'transparent'
		@value = if value then color(value, yes) else ''
	toString: (normalize) ->
		return "rgba(0,0,0,1)" if normalize and not @value
		return '' unless @value
		return 'transparent' if not normalize and (@value is 'transparent' or @value[3] is 0)
		return "rgba(#{@value})" if normalize or @value[3] isnt 1
		"rgb(#{@value[0]},#{@value[1]},#{@value[2]})"

class LengthsParser extends Parsers
	constructor: (value = '') ->
		values = mirror4(clean(value).split(' '))
		@parsed = (new LengthParser(v) for v, i in values)

# border-specific parsers

class BorderStyleParser extends Parser
	constructor: (value = '') ->
		match = (value = clean(value)).match(/none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit/)
		@value = if match then value else ''
	toString: (normalize) ->
		return 'none' if normalize and not @value
		return @value

class BorderParser extends Parsers
	constructor: (value = '') ->
		if value is 'none' then value = '0 none #000'
		match = (value = clean(value)).match(/((?:[\d.]+)(?:[\w%]+)?)\s(\w+)\s(rgb(?:a)?\([\d,\s]+\)|hsl(?:a)?\([\d,\s]+\)|#[a-f0-9]+|\w+)/) or []
		@parsed = [new LengthParser(match[1] ? ''), new BorderStyleParser(match[2] ? ''), new ColorParser(match[3] ? '')]

class BorderColorParser extends Parsers
	constructor: (colors = '') ->
		colors = mirror4(colors.match(/rgb(a)?\([\d,\s]+\)|hsl(a)?\([\d,\s]+\)|#[a-f0-9]+|\w+/g) or [''])
		@parsed = (new ColorParser(c) for c in colors)

class ZIndexParser extends Parser
	constructor: (value) ->
		@value = if value is 'auto' then value else number(value)

class TransformParser extends Parser

	constructor: (value) ->
		transforms = translate: '0px,0px', rotate: '0deg', scale: '1,1', skew: '0deg,0deg'
		if value = clean(value).match(/\w+\s?\([-,.\w\s]+\)/g)
			for v in value then do (v) ->
				return unless v = v.replace(/\s+/g, '').match(/^(translate|scale|rotate|skew)\((.*)\)$/)
				name = v[1]
				values = v[2].split(',')
				switch name
					when 'translate'
						return if values.length < 2
						transforms[name] = number(v) + 'px' for v in values
					when 'rotate'
						transforms[name] = number(values[0]) + 'deg'
					when 'scale'
						values = [values[0], values[0]] if values.length is 1 
						transforms[name] = number(v) for v in values
					when 'skew'
						return if values.length is 1
						transforms[name] = number(v) + 'deg' for v in values

		@transforms = transforms

	toString: () ->
		("#{name}(#{@transforms[name]})" for name in ['translate', 'rotate', 'scale', 'skew']).join(' ')

# parsers, getters, setters collections

parsers = {}
getters = {}
setters = {}
translations = {}
html = document.documentElement

get = (key) ->
	getters[key] or= do ->
		parser = parsers[key] or StringParser
		() ->
			new parser(computedStyle(@)(key)).toString(true, @)
	
set = (key) ->
	setters[key] or= do ->
		parser = parsers[key] or StringParser
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

trbl = ['Top', 'Right', 'Bottom', 'Left']
tlbl = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft']

# color, backgroundColor

parsers.color = parsers.backgroundColor = ColorParser

# width, height, fontSize, backgroundSize

parsers.width = parsers.height = parsers.fontSize = parsers.backgroundSize = LengthParser
		
# marginDIR, paddingDIR, borderDIRWidth, borderDIRstyle, borderDIRColor, borderDIR

for d in trbl
	bd = 'border' + d
	parsers[name] = LengthParser for name in ['margin' + d, 'padding' + d, bd + 'Width', d.toLowerCase()]
	parsers[bd + 'Color'] = ColorParser
	parsers[bd + 'Style'] = BorderStyleParser
	
	parsers[bd] = BorderParser
	getters[bd] = () ->
		[get(bd + 'Width').call(@), get(bd + 'Style').call(@), get(bd + 'Color').call(@)].join(' ')

# borderDIRRadius

parsers['border' + d + 'Radius'] = LengthParser for d in tlbl

# zIndex

parsers.zIndex = ZIndexParser

#margin, padding

for name in ['margin', 'padding'] then do (name) ->
	parsers[name] = LengthsParser
	getters[name] = () ->
		(get(name + d).call(@) for d in trbl).join(' ')


# borderRadius

parsers.borderRadius = LengthsParser
getters.borderRadius = () ->
	(get('border' + d + 'Radius').call(@) for d in trbl).join(' ')

# borderWidth, borderStyle, borderColor

parsers.borderWidth = LengthsParser

parsers.borderColor = BorderColorParser
		
for t in ['Width', 'Style', 'Color'] then do (t) ->
	getters['border' + t] = () ->
		(get('border' + d + t).call(@) for d in trbl).join(' ')

# border

parsers.border = BorderParser

getters.border = () ->
	for d in trbl
		value = get(bd = 'border' + d).call(@)
		return null if pvalue and value isnt pvalue
		pvalue = value
	value

# opacity

filterName = if html.style.MsFilter? then 'MsFilter' else if html.style.filter? then 'filter' else null

parsers.opacity = NumberParser

if filterName and not html.style.opacity?

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
	transformName = item
	break

parsers.transform = TransformParser

if transformName

	translations.transform = transformName

	setters.transform = (value) ->
		@style[transformName] = new TransformParser(value).toString()

	getters.transform = () ->
		return new TransformParser(@style[transformName]).toString()

else

	setters.transform = () ->

	getters.transform = () ->
		return new TransformParser().toString()
		
#transition detection
		
for item in ['WebkitTransition', 'MozTransition', 'transition'] when html.style[item]?
	transitionName = item
	break

transitionEndName = if transitionName is 'MozTransition' then 'transitionend' else 'webkitTransitionEnd'

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

		@setter = set(property)
		@getter = get(property)
		
	setOptions: (options = {}) ->
		throw new Error "#{options.duration} is not a valid duration" unless @duration = @parseDuration(options.duration ? '500ms')
		throw new Error "#{options.equation} is not a valid equation" unless @equation = @parseEquation(options.equation or 'default')
		@callback = options.callback or () ->
		@
		
	start: (from, to) ->
		@stop()
		pass = yes
		if from is to then pass = no
		if @duration is 0
			@setter.call(@node, to)
			pass = no
		if not pass then requestFrame(@callback)
		pass
		
	parseDuration: (duration) ->
		if match = string(duration).match(/([\d.]+)(s|ms)/)
			time = number(match[1])
			unit = match[2]
			return time * 1000 if unit is 's'
			return time if unit is 'ms'
		else return null
		
	parseEquation: (equation) ->
		equation = equations[equation] or equation
		match = equation.replace(/\s+/g, '').match(/^cubic-bezier\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)$/)
		if match then number(m) for m in match.slice(1) else null

# JSAnimation

beziers = {}

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
		@time or= now
		factor = (now - @time) / @duration
		if factor > 1 then factor = 1
		delta = @equation(factor)
		tpl = @template
		for f, i in @from
			t = @to[i]
			tpl = tpl.replace('@', if t isnt f then @compute(f, t, delta) else t)
		@setter.call(@node, tpl)
		if factor isnt 1 then requestFrame(@bstep) else @callback(t)
		@
		
	parseEquation: (equation) ->
		equation = super(equation)
		es = equation.toString()
		ID = "#{es}:#{@duration}ms"
		if es is [0,0,1,1].toString() then (x) -> x
		else beziers[ID] or= bezier(equation[0], equation[1], equation[2], equation[3], @duration * 2, (1000 / 60 / @duration) / 4)
		
	compute: (from, to, delta) ->
		(to - from) * delta + from

	numbers: (s) ->
		ns = []
		replaced = s.replace(/[-\d.]+/g, (n) ->
			ns.push(number(n))
			return '@'
		)
		[ns, replaced]

# CSSAnimation

class CSSAnimation extends Animation

	constructor: (node, property) ->
		super(node, property)
		@hproperty = hyphenate(translations[@property] or @property)
		
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
		@node.addEventListener(transitionEndName, @bcomplete, no)
		@setter.call(@node, @to)
		null
		
	clean: () ->
		@modCSS()
		@node.removeEventListener(transitionEndName, @bcomplete)
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

		p = rules(transitionName + 'Property').replace(/\s+/g, '').split(',')
		d = rules(transitionName + 'Duration').replace(/\s+/g, '').split(',')
		e = rules(transitionName + 'TimingFunction').replace(/\s+/g, '').match(/cubic-bezier\(([\d.,]+)\)/g)

		@removeProp('all', p, d, e)
		@removeProp(@hproperty, p, d, e)

		if inclusive
			p.push(@hproperty)
			d.push(@duration)
			e.push(@equation)

		@node.style[transitionName + 'Property'] = p
		@node.style[transitionName + 'Duration'] = d
		@node.style[transitionName + 'TimingFunction'] = e
		
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
		uid = node['µid'] ?= (@uid++).toString(36)
		animation = @animations[uid] or= {}
		animation[property] or= if transitionName then new CSSAnimation(node, property) else new JSAnimation(node, property)
	
	starts: (nodes, styles, options = {}) ->
		type = typeof options
		options = if type is 'function' then callback: options else if type is 'string' then duration: options else options
		callback = options.callback or () ->
		completed = 0
		length = 0
		options.callback = () -> callback() if ++completed is length
		
		for property, value of styles
			property = camelize(property)
			parser = parsers[property]
			throw new Error "no parser for #{property}" unless parser

			setter = set(property)
			getter = get(property)
		
			for node in nodes
				length++
				instance = @retrieve(node, property)
				parsedFrom = new parser(getter.call(node))
				parsedTo = new parser(value)
				fromParsers = parsedFrom.extract()
				toParsers = parsedTo.extract()
				
				for fp, i in fromParsers
					tp = toParsers[i]
					# if CSSLengthParser, since getComputedStyle always returns pixels enforce setstyle in "to" unit.
					throw new Error "cannot animate #{property} from or to `auto`" if 'auto' in [tp.value, fp.value]
					
					if tp.unit and fp.unit
						enforce = yes
						if tp.unit isnt 'px'
							fp.value = fp.value / pixelRatio(node, tp.unit)
							fp.unit = tp.unit
					
				# true here does not trigger the pixel conversion for lengths, but does trigger the rgba enforcement
				fs = parsedFrom.toString(true)
				ts = parsedTo.toString(true)
				
				if enforce then setter.call(node, fs)
				
				instance.setOptions(options).start(fs, ts)
		@
		
	start: (nodes, property, value, options) ->
		styles = {}
		styles[property] = value
		@starts(nodes, styles, options)

	sets: (nodes, styles) ->
		for property, value of styles
			setter = set(property = camelize(property))
			for node in nodes
				@animations[node['µid']]?[property]?.stop(true)
				setter.call(node, value)
		@

	set: (nodes, property, value) ->
		styles = {}
		styles[property] = value
		@sets(nodes, styles)


animations = new Animations

mu = (nod) ->
	@valueOf = () -> nod
	@

moofx = (nod) ->
	if not nod then null
	else new mu(if nod.length? then nod else if nod.nodeType is 1 then [nod] else [])

moofx:: = mu::

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
	get(camelize(A)).call(@valueOf()[0])
	
moofx.parse = (property, value, normalize, node) ->
	if not parsers[property = camelize(property)] then null
	else new (parsers[property])(value).toString(normalize, node)

moofx.cancelFrame = cancelFrame
moofx.requestFrame = requestFrame
moofx.color = color

module.exports = moofx
