# moofx: a css3-enabled javascript animation library on caffeine
# website: http://moofx.it
# author: Valerio Proietti (@kamicane) http://mad4milk.net http://mootools.net
# license: MIT

µ = (nod) ->
	@valueOf = () -> nod
	@

moofx = (nod) ->
	if not nod then null
	else new µ(if nod.length? then nod else if nod.nodeType? then [nod] else [])

moofx:: = µ::

# namespace: This takes advantage of coffeescript --join. When files are joined, only one global closure is used, thus making the local moofx variable available to the other scripts. If compiled files are included separately for development, then the reference to moofx in those other files will instead catch window.moofx. In CommonJS environments (or ender) window.moofx will never get written, because, instead, module.exports is used as a namespace, and the other scripts will simply reference this local moofx variable, which equals to module.exports

if typeof module isnt 'undefined' then module.exports = moofx
else @moofx = moofx
