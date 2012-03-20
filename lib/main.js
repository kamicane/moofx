//             .-   3
// .-.-..-..-.-|-._.
// ' ' '`-'`-' ' ' '

// color and timer
var color = require("./color"), timer = require("./timer")

// if we're in a browser we need ./browser, otherwise no
var moofx = (typeof document !== "undefined") ? require("./browser") : {}

// attach properties

moofx.requestFrame = function(callback, delay){
    timer(delay).push(callback)
    return this
}

moofx.cancelFrame = function(callback, delay){
    timer(delay).pull(callback)
    return this
}

moofx.color = color

// and export moofx

module.exports = moofx
