//             .-   3
// .-.-..-..-.-|-._.
// ' ' '`-'`-' ' ' '

// color and frame
var color = require("./color"), frame = require("./frame")

// if we're in a browser we need ./browser, otherwise no
var moofx = (typeof document !== "undefined") ? require("./browser") : {}

// attach properties

moofx.requestFrame = frame.request
moofx.cancelFrame = frame.cancel
moofx.color = color

// and export moofx

module.exports = moofx
