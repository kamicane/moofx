//             .-   3
// .-.-..-..-.-|-._.
// ' ' '`-'`-' ' ' '

// color and timer
var color = require("./color"), frame = require("./frame")

// if we're in a browser we need ./browser, otherwise no
var moofx = (typeof document !== "undefined") ? require("./browser") : {}

// attach properties
moofx.requestFrame = function(){
    frame.request(callback)
    return this
}

moofx.cancelFrame = function(){
    frame.cancel(callback)
    return this
}

moofx.color = color

// and export moofx

module.exports = moofx
