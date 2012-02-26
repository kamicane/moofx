{request} = require('http')
{stringify} = require('querystring')

# google closure compiler service api

module.exports = (code, next) ->

	data = stringify
		compilation_level : 'SIMPLE_OPTIMIZATIONS'
		# formatting: 'pretty_print'
		output_format: 'text'
		output_info: 'compiled_code'
		warning_level : 'QUIET'
		js_code : code
		
	options =
		host: 'closure-compiler.appspot.com'
		port: '80'
		path: '/compile'
		method: 'POST'
		headers:
			'Content-Type': 'application/x-www-form-urlencoded'
			'Content-Length': data.length
			
	req = request options, (res) ->
		res.setEncoding('utf8')
		data = ""
		res.on('data', (chunk) -> data += chunk)
		res.on('end', () -> next?(data))
		
	req.write(data)
	req.end()
