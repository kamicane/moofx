// requestFrame impementation, supports frame canceling, and the time argument, 100% cross platform.

var requestFrame = global.requestAnimationFrame ||
                   global.webkitRequestAnimationFrame ||
                   global.mozRequestAnimationFrame ||
                   global.oRequestAnimationFrame ||
                   global.msRequestAnimationFrame


// requestFrame is only used on 60fps timers
var sixty = 1000 / 60

var Timer = function(delay){

    var callbacks = [],
        running   = false

    var countDown = (delay === sixty && requestFrame) ? function(){
        requestFrame(loop)
    } : function(){
        setTimeout(loop, delay)
    }

    var loop = function(){
        running = false
        var time = +(new Date)
        for (var i = callbacks.length; i--;){
            var callback = callbacks.shift()
            if (callback) callback(time)
        }
    }

    this.push = function(callback){
        callbacks.push(callback)
        if (!running){
            running = true
            countDown()
        }
        return this
    }

    this.pull = function(callback){
        for (var i = callbacks.length; i--;) if (callbacks[i] === callback){
            callbacks.splice(i, 1)
            break
        }
        return this
    }

}

var timers = {}

// the exported function caches timers, and uses sixty as default delay
module.exports = function(delay){
    if (delay == null) delay = sixty
    return timers[delay] || (timers[delay] = new Timer(delay))
}
