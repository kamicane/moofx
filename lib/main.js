// main

var color = require("./color"), frame = require("./frame")


var moofx = (typeof document !== "undefined") ? require("./browser") : {}

// attach properties

moofx.requestFrame = frame.request
moofx.cancelFrame = frame.cancel
moofx.color = color

// and export moofx

module.exports = moofx
