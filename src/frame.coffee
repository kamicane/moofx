# frame: A cross browser requestAnimationFrame implementation that also supports cancelling and date argument. Unlike the browser counterpart, both the cancel and request method take a callback as argument.
# author: Valerio Proietti (@kamicane) http://mad4milk.net http://mootools.net
# license: MIT

callbacks = []
running = no

iterator = (time = +(new Date)) ->
	running = no
	i = callbacks.length
	callbacks.splice(--i, 1)[0](time) while i
	null

requestAnimationFrame =
window.requestAnimationFrame or
window.webkitRequestAnimationFrame or
window.mozRequestAnimationFrame or
window.oRequestAnimationFrame or
window.msRequestAnimationFrame or (callback) ->
	setTimeout(callback, 1000 / 60)

# public

moofx.requestFrame = (callback) ->
	callbacks.push(callback)
	if not running
		running = yes
		requestAnimationFrame(iterator)
	@

moofx.cancelFrame = (match) ->
	callbacks.splice(i, 1) for callback, i in callbacks when callback is match
	@
