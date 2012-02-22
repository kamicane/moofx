{print} = require('util')
{spawn} = require('child_process')
{request} = require('http')
{stringify} = require('querystring')
{readFileSync, writeFileSync} = require('fs')

# google closure compiler service api

closure = (code, next) ->
	
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
	
# read json for niceties

json = JSON.parse(readFileSync("./package.json"))
name = json.name

header = "/*\n
---\n
provides: #{name}\n
version: #{json.version}\n
description: #{json.description}\n
website: #{json.homepage}\n
author: #{json.author}\n
license: #{json.license}\n
...\n
*/\n"

startBoilerplate = "\n(function(){\n\n"

endBoilerplate = "\n
typeof module !== 'undefined' ? module.exports = #{name}: window.#{name} = #{name};\n\n
})();"

task 'test', 'compiles lib/ from src/', () ->
	print("compiling lib/ from src/ …\n")
	coffee = spawn('coffee', ['--bare', '--compile', '--output', 'lib/', 'src/'])
	
	coffee.stdout.on('data', (data) -> print data.toString())
	coffee.on('exit', (code) -> print("src/ was compiled on lib/\n") if code is 0)

task 'watch', 'compiles lib/ from src/ and watches src', ->
	print("watching /src for changes …\n")
	coffee = spawn('coffee', ['--bare', '--watch', '--compile', '--output', 'lib/', 'src/'])
	
	coffee.stdout.on('data', (data) -> print(data.toString()))
	
task 'build', 'compiles a single file from src/', () ->
	print("compiling javascript code from src/ …\n")
	coffee = spawn('coffee', ['--bare', '--print', '--join', '--compile'].concat(json.coffeescripts))

	data = startBoilerplate

	coffee.stdout.on('data', (d) -> data += d.toString())

	coffee.on 'exit', (code) ->
		
		data += endBoilerplate
		
		nicedata = data.replace(`/  /g`, '\t').replace(`/\) \{/g`, '){')
		writeFileSync("./#{name}.js", "#{header}#{nicedata}")
		print("finished writing #{name}.js\n")
		print("sending javascript code to google closure REST API …\n")
		closure data, (compiled) ->
			if compiled
				writeFileSync("#{name}-min.js", "#{header}#{compiled}")
				print("finished writing #{name}-min.js\n")
			else print("error writing #{name}.js\n")
