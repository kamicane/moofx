# moofx: a css3-enabled javascript animation library on caffeine
# provides: moofx
# website: http://moofx.it
# author: Valerio Proietti (@kamicane) http://mad4milk.net http://mootools.net
# license: MIT

µ = (nod) ->
	@valueOf = () -> nod
	@

moofx = (nod) ->
	if not nod then null
	else new µ(if nod.length? then nod else if nod.nodeType is 1 then [nod] else [])

moofx:: = µ::
