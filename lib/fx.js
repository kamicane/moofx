/*
fx
*/"use strict"

var prime        = require("prime"),
    requestFrame = require("./frame").request,
    bezier       = require("cubic-bezier")

var map = require("prime/array/map")

var sDuration    = "([\\d.]+)(s|ms)?",
    sCubicBezier = "cubic-bezier\\(([-.\\d]+),([-.\\d]+),([-.\\d]+),([-.\\d]+)\\)"

var rDuration     = RegExp(sDuration),
    rCubicBezier  = RegExp(sCubicBezier),
    rgCubicBezier = RegExp(sCubicBezier, "g")

    // equations collection

var equations = {
    "default"     : "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
    "linear"      : "cubic-bezier(0, 0, 1, 1)",
    "ease-in"     : "cubic-bezier(0.42, 0, 1.0, 1.0)",
    "ease-out"    : "cubic-bezier(0, 0, 0.58, 1.0)",
    "ease-in-out" : "cubic-bezier(0.42, 0, 0.58, 1.0)"
}

equations.ease = equations["default"]

var compute = function(from, to, delta){
    return (to - from) * delta + from
}

var divide = function(string){
    var numbers = []
    var template = (string + "").replace(/[-.\d]+/g, function(number){
        numbers.push(+number)
        return "@"
    })
    return [numbers, template]
}

var Fx = prime({

    constructor: function Fx(render, options){

        // set options

        this.setOptions(options)

        // renderer

        this.render = render || function(){}

        // bound functions

        var self = this

        this.bStep = function(t){
            return self.step(t)
        }

        this.bExit = function(time){
            self.exit(time)
        }

    },

    setOptions: function(options){
        if (options == null) options = {}

        if (!(this.duration = this.parseDuration(options.duration || "500ms"))) throw new Error("invalid duration")
        if (!(this.equation = this.parseEquation(options.equation || "default"))) throw new Error("invalid equation")
        this.callback = options.callback || function(){}

        return this
    },

    parseDuration: function(duration){
        if (duration = (duration + "").match(rDuration)){
            var time = +duration[1],
                unit = duration[2] || "ms"

            if (unit === "s")  return time * 1e3
            if (unit === "ms") return time
        }
    },

    parseEquation: function(equation, array){
        var type = typeof equation

        if (type === "function"){ // function
            return equation
        } else if (type === "string"){ // cubic-bezier string
            equation = equations[equation] || equation
            var match = equation.replace(/\s+/g, "").match(rCubicBezier)
            if (match){
                equation = map(match.slice(1), function(v){return +v})
                if (array) return equation
                if (equation.toString() === "0,0,1,1") return function(x){return x}
                type = "object"
            }
        }

        if (type === "object"){ // array
            return bezier(equation[0], equation[1], equation[2], equation[3], 1e3 / 60 / this.duration / 4)
        }
    },

    cancel: function(to){
        this.to = to
        this.cancelExit = requestFrame(this.bExit)
    },

    exit: function(time){
        this.render(this.to)
        delete this.cancelExit
        this.callback(time)
    },

    start: function(from, to){

        this.stop()

        if (this.duration === 0){
            this.cancel(to)
            return this
        }

        this.isArray = false
        this.isNumber = false

        var fromType = typeof from,
            toType   = typeof to

        if (fromType === "object" && toType === "object"){
            this.isArray = true
        } else if (fromType === "number" && toType === "number"){
            this.isNumber = true
        }

        var from_ = divide(from),
            to_   = divide(to)

        this.from = from_[0]
        this.to = to_[0]
        this.templateFrom = from_[1]
        this.templateTo = to_[1]

        if (this.from.length !== this.to.length || this.from.toString() === this.to.toString()){
            this.cancel(to)
            return this
        }

        delete this.time
        this.length = this.from.length
        this.cancelStep = requestFrame(this.bStep)

        return this

    },

    stop: function(){

        if (this.cancelExit){
            this.cancelExit()
            delete this.cancelExit
        } else if (this.cancelStep){
            this.cancelStep()
            delete this.cancelStep
        }

        return this
    },

    step: function(now){

        this.time || (this.time = now)

        var factor = (now - this.time) / this.duration

        if (factor > 1) factor = 1

        var delta = this.equation(factor),
            from  = this.from,
            to    = this.to,
            tpl   = this.templateTo

        for (var i = 0, l = this.length; i < l; i++){
            var f = from[i], t = to[i]
            tpl = tpl.replace("@", t !== f ? compute(f, t, delta) : t)
        }

        this.render(this.isArray ? tpl.split(",") : this.isNumber ? +tpl : tpl, factor)

        if (factor !== 1){
            this.cancelStep = requestFrame(this.bStep)
        } else {
            delete this.cancelStep
            this.callback(now)
        }

    }

})

var fx = function(render){

    var ffx = new Fx(render)

    return {

        start: function(from, to, options){
            var type = typeof options
            ffx.setOptions((type === "function") ? {
                callback: options
            } : (type === "string" || type === "number") ? {
                duration: options
            } : options).start(from, to)
            return this
        },

        stop: function(){
            ffx.stop()
            return this
        }

    }

}

fx.prototype = Fx.prototype

module.exports = fx
