{compile} = require('coffee-script')
{parser, uglify} = require('uglify-js')
semver = require('semver')

# native requires
{spawn} = require('child_process')
{readFileSync, writeFileSync, watch} = require('fs')
{request} = require('http')
{stringify} = require('querystring')
{print} = require('util')
path = require('path')

# local requires
closurize = require('./closurize')
packager = require('./packager')

# sources

sources = ['./src/color.coffee', './src/frame.coffee', './src/bezier.coffee', './src/index.coffee']

# helpers

bump = () ->
	json = JSON.parse(readFileSync('./package.json'))
	json.version = semver.inc(json.version, 'build')
	print "version bumped to #{json.version}\n"
	writeFileSync('./package.json', JSON.stringify(json, null, "\t"))
	
coffeize = (src, emsg) ->
	try
		src = compile(src, bare: true)
		return src
	catch error
		print "#{error} #{emsg}\n"
		return null
		
unspace = (src) ->
	return src.replace(`/    /g`, "\t");
	
makecoffee = (coffee) ->
	newfile = './lib/' + path.basename(coffee, '.coffee') + '.js'
	src = readFileSync(coffee).toString()
	js = coffeize(src, "while compiling #{coffee}")

	if js isnt null	
		ast = parser.parse(js)
		js = uglify.gen_code(ast, beautify: true)
		writeFileSync(newfile, unspace(js))
		print "compiled #{coffee} to #{newfile}\n"
		return true
		
	return false
	
makelib = () ->
	makecoffee(coffee) for coffee in sources
	return null
	
makebrowser = (nomin) ->

	pkg = new packager('./package.json')
	js = pkg.build()
	
	ast = parser.parse(js)
	
	niceast = uglify.ast_squeeze(ast, make_seqs: false)
	nicejs = uglify.gen_code(niceast, beautify: true)
	writeFileSync('./moofx.js', unspace("#{pkg.header}\n#{nicejs}"))
	print "packaged ./moofx.js\n"
	
	return if nomin
	
	badast = uglify.ast_mangle(ast)
	badast = uglify.ast_lift_variables(badast)
	badast = uglify.ast_squeeze(badast)
	badjs = uglify.gen_code(badast)

	writeFileSync('./moofx-min.js', unspace("#{pkg.header}\n#{badjs}"))
	print "packaged ./moofx-min.js\n"

makewatch = () ->

	makelib()
	makebrowser()
	
	print "watching ...\n"

	for coffee in sources
		do (coffee) ->
			filedata = readFileSync(coffee).toString()
			watch coffee, (event) ->
				newfiledata = readFileSync(coffee).toString()
				if newfiledata isnt filedata
					if makecoffee(coffee) then makebrowser()
					filedata = newfiledata

module.exports =
	watch: () ->
		bump()
		makewatch()
	browser: () ->
		bump()
		makelib()
		makebrowser()
	lib: () ->
		bump()
		makelib()
