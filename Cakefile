{print} = require 'util'
{spawn} = require 'child_process'
{request} = require('http')
{stringify} = require('querystring')
fs = require 'fs'

# google closure compiler service api

compile = (code, next) ->
	
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

option('-f', '--file', 'file name')

task 'test', 'compiles lib/ from src/', () ->
	print("compiling lib/ from src/ …\n")
	coffee = spawn('coffee', ['--bare', '--compile', '--output', 'lib/', 'src/'])
	
	coffee.stdout.on('data', (data) -> print data.toString())
	coffee.on('exit', (code) -> print("src/ was compiled on lib/\n") if code is 0)

task 'watch', 'compiles lib/ from src/ and watches src', ->
	print("watching /src for changes …\n")
	coffee = spawn('coffee', ['--bare', '--watch', '--compile', '--output', 'lib/', 'src/'])
	
	coffee.stdout.on('data', (data) -> print(data.toString()))
	
task 'build', 'compiles a single file from src/', (options) ->
	file = options.file or 'moofx'
	print("compiling javascript code from src/ …\n")
	coffee = spawn('coffee', ['--bare', '--print', '--join', '--compile', 'src/moofx.coffee', 'src/frame.coffee', 'src/color.coffee', 'src/animation.coffee'])

	data = "!(function(){\n\n"

	comment = "/*\n
		---\n
		provides: moofx\n
		description: a css3-enabled javascript animation library on caffeine\n
		author: Valerio Proietti (@kamicane) http://mad4milk.net http://mootools.net\n
		website: http://moofx.it\n
		license: MIT\n
		...\n
		*/\n\n".replace(/\t/g, "")

	coffee.stdout.on('data', (d) -> data += d.toString())

	coffee.on 'exit', (code) ->
		data += "\n})();"
		nicedata = data.replace(`/  /g`, '\t').replace(`/\) \{/g`, '){')
		fs.writeFileSync("#{file}.js", "#{comment}#{nicedata}")
		print("finished writing #{file}.js\n")
		print("sending javascript code to google closure REST API …\n")
		compile data, (compiled) ->
			if compiled
				fs.writeFileSync("#{file}-min.js", "#{comment}#{compiled}")
				print("finished writing #{file}-min.js\n")
			else print("error writing #{file}.js\n")
