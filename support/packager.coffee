# packager.js: builds node modules for browsers.
# warning: this bundled version of packager does not support building external dependencies.

{readFileSync, writeFileSync} = require('fs')
path = require('path')

header = """/*
---
provides: @name
version: @version
description: @description
homepage: @homepage
author: @author
license: @license
...
*/
"""

boilee = """(function(packages){
var require = function(name){
	var bits = name.split('/'), ns = bits.splice(0, 1)[0], pkg = packages[ns], local, module, exports;
	if (!pkg) return null;
	if (!pkg || !(module = pkg.modules[name = bits.join('/') || pkg.main])) return null;
	if ((exports = module.exports) != null) return exports;
	packages[ns].modules[name] = local = {exports: {}};
	module(local, require, local.exports, window);
	return local.exports;
};
window.@name = require('@name');
})({
	@packages
});

"""

packs = """
@name: {
	main: '@main',
	modules: {
		@modules
	}
}
"""

mods = """
'@name': function(module, require, exports, global){
	@src
}
"""

# util

replaces = (str, obj) ->
	str = str.replace(new RegExp("@#{key}", "g"), value) for key, value of obj
	str

log = (object) -> console.log util.inspect(object, false, 10, true)

class Packager

	constructor: (jsonpath) ->
		@packages = {}
		manifest = readFileSync(path.resolve(jsonpath))
		json = JSON.parse(manifest)
		@main = path.normalize(json.main)
		@header = replaces(header, json)
		@name = json.name

		@resolve(@name, path.dirname(@main), path.basename(@main, '.js'), path.normalize(@main))
		
	resolve: (pkgname, dirname, mainname, file) ->
		entry = @packages[pkgname] or= main: mainname, modules: {}

		thispath = path.dirname(file)
		filename = path.basename(file, '.js')
		key = path.relative(dirname, path.join(thispath, filename))

		throw new Error("cannot find #{file}") unless path.existsSync(file) # there is no such file!

		modules = entry.modules

		filedata = readFileSync(file).toString()

		if modules[key] then return key #already scanned

		module = modules[key] = deps: []

		module.src = filedata.replace /require\(\s*["']([^'"\s]+)["']\s*\)/g, (match, depfile) => #thanks requirejs for the regexp
			depfile += ".js" unless path.extname(depfile)
			depfile = path.join(thispath, depfile)
			k = @resolve(pkgname, dirname, mainname, depfile)
			module.deps.push(k)
			"require('#{pkgname}/#{k}')"

		key
		
	build: () ->
		bpacks = []

		for p, package of @packages
			modules = package.modules
			pmods = []

			for m, module of modules
				mod = replaces(mods, {name: m, src: module.src})
				pmods.push("#{mod}")

			pack = replaces(packs, {name: p, main: package.main, modules: pmods.join(",")})
			bpacks.push(pack)

		js = replaces(boilee, {packages: bpacks.join(",\n"), name: @name})

		"#{js}"

module.exports = Packager
