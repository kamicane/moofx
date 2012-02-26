#bezier: cubic bezier solver by Arian (https://gist.github.com/arian)

module.exports = (x1, y1, x2, y2, n, epsilon) ->
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
