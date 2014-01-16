/*
requestFrame / cancelFrame
*/"use strict"

var indexOf = require("mout/array/indexOf")

var requestFrame = global.requestAnimationFrame ||
                   global.webkitRequestAnimationFrame ||
                   global.mozRequestAnimationFrame ||
                   global.oRequestAnimationFrame ||
                   global.msRequestAnimationFrame ||
                   function(callback){
                       return setTimeout(function(){
                           callback()
                       }, 1e3 / 60)
                   }

var callbacks = []

var iterator = function(time){
    var split = callbacks.splice(0, callbacks.length)
    for (var i = 0, l = split.length; i < l; i++) split[i](time || (time = +(new Date)))
}

var cancel = function(callback){
    var io = indexOf(callbacks, callback)
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
