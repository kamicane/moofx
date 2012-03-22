/*
requestFrame / cancelFrame
*/"use strict"

var requestFrame = global.requestAnimationFrame ||
                   global.webkitRequestAnimationFrame ||
                   global.mozRequestAnimationFrame ||
                   global.oRequestAnimationFrame ||
                   global.msRequestAnimationFrame ||
                   function(callback){
                        return setTimeout(callback, 1e3 / 60)
                    }

var callbacks = [], running = false

var iterator = function(time){
    if (time == null) time = +(new Date)
    running = false
    for (var i = callbacks.length; i--;){
        var callback = callbacks.shift()
        if (callback) callback(time)
    }
}

var cancel = function(match){
    for (var i = callbacks.length; i--;) if (callbacks[i] === match){
        callbacks.splice(i, 1)
        break
    }
}

var request = function(callback){
    callbacks.push(callback)
    if (!running){
        running = true
        requestFrame(iterator)
    }
    return function(){
        cancel(callback)
    }
}

exports.request = request
exports.cancel = cancel
