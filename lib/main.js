/*          .-   3
.-.-..-..-.-|-._.
' ' '`-'`-' ' ' '
*/"use strict"

// color and timer
var color = require("./color"),
    frame = require("./frame")

// if we're in a browser we need ./browser, otherwise no
var moofx = (typeof document !== "undefined") ? require("./browser") : {}

// attach properties
moofx.requestFrame = function(callback){
    frame.request(callback)
    return this
}

moofx.cancelFrame = function(callback){
    frame.cancel(callback)
    return this
}

moofx.color = color

// and export moofx

module.exports = moofx
