/*
requestFrame / cancelFrame
*/"use strict"

var array = require("prime/es5/array")

var requestFrame = global.requestAnimationFrame ||
                   global.webkitRequestAnimationFrame ||
                   global.mozRequestAnimationFrame ||
                   global.oRequestAnimationFrame ||
                   global.msRequestAnimationFrame ||
                   function(callback){
                       return setTimeout(callback, 1e3 / 60)
                   }

var callbacks = []

var iterator = function(time){
    var callback
    while ((callback = callbacks.shift())) callback(time || (time = +(new Date)))
}

var cancel = function(callback){
    var io = array.indexOf(callbacks, callback)
    if (io > -1) callbacks.splice(io, 1)
}

var request = function(callback){
    var i = callbacks.push(callback)
    if (i === 1) requestFrame(iterator)
    return function(){
        cancel(callback)
    }
}

exports.request = request
exports.cancel = cancel
