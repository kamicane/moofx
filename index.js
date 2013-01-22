/*          .-   3
.-.-..-..-.-|-._.
' ' '`-'`-' ' ' '
*/"use strict"

// color and timer
var color = require("./lib/color"),
    frame = require("./lib/frame")

// if we're in a browser we need ./browser, otherwise ./fx
var moofx = (typeof document !== "undefined") ? require("./lib/browser") : require("./lib/fx")

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
