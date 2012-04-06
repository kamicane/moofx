/*
MooFx
*/"use strict"

// requires

var color  = require("./color"),
    frame  = require("./frame")

var cancelFrame = frame.cancel,
    requestFrame = frame.request


var bezier = require("cubic-bezier")

var prime  = require("prime/prime"),
    array  = require("prime/es5/array"),
    string = require("prime/types/string")

var camelize   = string.camelize,
    hyphenate  = string.hyphenate,
    clean      = string.clean,
    capitalize = string.capitalize

var map     = array.map,
    each    = array.forEach,
    indexOf = array.indexOf

var nodes  = require("nodes/lib/nodes")

// util

var round = function(number){
    return +(+number).toPrecision(3)
}

// compute > node > property

var compute = global.getComputedStyle ? function(node){
    var cts = getComputedStyle(node)
    return function(property){
        return cts ? cts.getPropertyValue(hyphenate(property)) : ""
    }
} : function(node){
    var cts = node.currentStyle
    return function(property){
        return cts ? cts[camelize(property)] : ""
    }
}

// pixel ratio retriever

var test = document.createElement("div")

var cssText = "border:none;margin:none;padding:none;visibility:hidden;position:absolute;height:0;";

var pixelRatio = function(element, u){
    var parent = element.parentNode, ratio = 1
    if (parent){
        test.style.cssText = cssText + ("width:100" + u + ";")
        parent.appendChild(test)
        ratio = test.offsetWidth / 100
        parent.removeChild(test)
    }
    return ratio
}

// mirror 4 values

var mirror4 = function(values){
    var length = values.length
    if      (length === 1) values.push(values[0], values[0], values[0])
    else if (length === 2) values.push(values[0], values[1])
    else if (length === 3) values.push(values[1])
    return values
}

// regular expressions strings

var sLength      = "([-.\\d]+)(%|cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vm)",
    sLengthLax   = "([-.\\d]+)([\\w%]+)?",
    sBorderStyle = "none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit",
    sCubicBezier = "cubic-bezier\\(([-.\\d]+),([-.\\d]+),([-.\\d]+),([-.\\d]+)\\)",
    sDuration    = "([\\d.]+)(s|ms)?"

// regular expressions

var rgLength      = RegExp(sLength, "g"),
    rLengthLax    = RegExp(sLengthLax),
    rgLengthLax   = RegExp(sLengthLax, "g"),
    rBorderStyle  = RegExp(sBorderStyle),
    rCubicBezier  = RegExp(sCubicBezier),
    rgCubicBezier = RegExp(sCubicBezier, "g"),
    rDuration     = RegExp(sDuration)

// normalize > css

var parseString = function(value){
    return (value == null) ? "" : value + ""
}

var parseOpacity = function(value, normalize){
    if (value == null || value === "") return normalize ? "1" : ""
    var number = +value
    return isFinite(number) ? number + "" : "1"
}

try {test.style.color = "rgba(0,0,0,0.5)"} catch(e){}
var rgba = /^rgba/.test(test.style.color)

var parseColor = function(value, normalize){
    if (!value) return normalize ? "rgba(0,0,0,1)" : ""
    if (value === "transparent") return normalize ? "rgba(0,0,0,0)" : value
    var c = color(value, true)
    if (!c) return normalize ? "rgba(0,0,0,1)" : ""
    if (c[3] === 0 && !normalize) return "transparent"
    return (!normalize && (!rgba || c[3] === 1)) ? "rgb(" + c.slice(0, 3) + ")" : "rgba(" + c + ")"
}

var parseLength = function(value, normalize, node){
    if (value == null || value === "") return normalize ? "0px" : ""
    var match = string.match(value, rLengthLax)
    if (!match) return value // auto
    var value = +match[1],
        unit  = match[2] || 'px'

    if (value === 0) return value + unit
    return (node && unit !== "px") ? round(pixelRatio(node, unit) * value) + "px" : value + unit
}

var parseBorderStyle = function(value, normalize){
    if (value == null || value === "") return normalize ? "none" : ""
    var match = value.match(rBorderStyle)
    return match ? value : normalize ? "none" : ""
}

var parseBorder = function(value, normalize, node){
    var normalized = "0px none rgba(0,0,0,1)"
    if (value == null  || value === "")     return normalize ? normalized : ""
    if (value === 0    || value === "none") return normalize ? normalized : value

    var c
    value = value.replace(color.x, function(match){
        c = match
        return ""
    })

    var s = value.match(rBorderStyle),
        l = value.match(rgLengthLax)

    return clean([parseLength(l ? l[0] : "", normalize, node), parseBorderStyle(s ? s[0] : "", normalize), parseColor(c, normalize)].join(" "))
}

var parseShort4 = function(value, normalize, node){
    if (value == null || value === "") return normalize ? "0px 0px 0px 0px" : ""
    return clean(mirror4(map(clean(value).split(" "), function(v){
        return parseLength(v, normalize, node)
    })).join(" "))
}

var parseShadow = function(value, normalize, node, len){
    var ncolor     = "rgba(0,0,0,0)",
        normalized = (len === 3) ? ncolor + " 0px 0px 0px" : ncolor + " 0px 0px 0px 0px"

    if (value ==  null || value === "") return normalize ? normalized : ""
    if (value === "none") return normalize ? normalized : value

    var colors = [], value = clean(value).replace(color.x, function(match){
        colors.push(match)
        return ""
    })

    return map(value.split(","), function(shadow, i){

        var c       = parseColor(colors[i], normalize),
            inset   = /inset/.test(shadow),
            lengths = shadow.match(rgLengthLax) || ["0px"]

        lengths = map(lengths, function(m){
            return parseLength(m, normalize, node)
        })

        while (lengths.length < len) lengths.push("0px")

        var ret = inset ? ["inset", c] : [c]

        return ret.concat(lengths).join(" ")

    }).join(", ")
}

var parse = function(value, normalize, node){
    if (value == null || value === "") return "" //cant normalize "" || null
    return value.replace(color.x, function(match){
        return parseColor(match, normalize)
    }).replace(rgLength, function(match){
        return parseLength(match, normalize, node)
    })
}

// get && set

var getters = {}, setters = {}, parsers = {}, aliases = {}

var getter = function(key){
    return getters[key] || (getters[key] = (function(){
        var alias  = aliases[key] || key,
            parser = parsers[key] || parse

        return function(){
            return parser(compute(this)(alias), true, this)
        }

    }()))
}

var setter = function(key){
    return setters[key] || (setters[key] = (function(){
        var alias  = aliases[key] || key,
            parser = parsers[key] || parse

        return function(value){
            this.style[alias] = parser(value)
        }

    }()))
}

// parsers

var trbl = ["Top", "Right", "Bottom", "Left"], tlbl = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"]

each(trbl, function(d){
    var bd = "border" + d
    each([ "margin" + d, "padding" + d, bd + "Width", d.toLowerCase()], function(n){
        parsers[n] = parseLength
    })
    parsers[bd + "Color"] = parseColor
    parsers[bd + "Style"] = parseBorderStyle

    // borderDIR
    parsers[bd] = parseBorder
    getters[bd] = function(){
        return [
            getter(bd + "Width").call(this),
            getter(bd + "Style").call(this),
            getter(bd + "Color").call(this)
        ].join(" ")
    }
})

each(tlbl, function(d){
    parsers["border" + d + "Radius"] = parseLength
})

parsers.color = parsers.backgroundColor = parseColor
parsers.width = parsers.height = parsers.fontSize = parsers.backgroundSize = parseLength

// margin + padding

each(["margin", "padding"], function(name){
    parsers[name] = parseShort4
    getters[name] = function(){
        return map(trbl, function(d){
            return getter(name + d).call(this)
        }, this).join(" ")
    }
})

// borders

// borderDIRWidth, borderDIRStyle, borderDIRColor

parsers.borderWidth = parseShort4

parsers.borderStyle = function(value, normalize, node){
    if (value == null || value === "") return normalize ? mirror4(["none"]).join(" ") : ""
    value = clean(value).split(" ")
    return clean(mirror4(map(value, function(v){
        parseBorderStyle(v, normalize)
    })).join(" "))
}

parsers.borderColor = function(value, normalize){
    if (!value || !(value = string.match(value, color.x))) return normalize ? mirror4(["rgba(0,0,0,1)"]).join(" ") : ""
    return clean(mirror4(map(value, function(v){
        return parseColor(v, normalize)
    })).join(" "))
}

each(["Width", "Style", "Color"], function(name){
    getters["border" + name] = function(){
        return map(trbl, function(d){
            return getter("border" + d + name).call(this)
        }, this).join(" ")
    }
})

// borderRadius

parsers.borderRadius = parseShort4

getters.borderRadius = function(){
    return map(tlbl, function(d){
        return getter("border" + d + "Radius").call(this)
    }, this).join(" ")
}

// border

parsers.border = parseBorder

getters.border = function(){
    var pvalue
    for (var i = 0; i < trbl.length; i++){
        var value = getter("border" + trbl[i]).call(this)
        if (pvalue && value !== pvalue) return null
        pvalue = value
    }
    return pvalue
}

// zIndex

parsers.zIndex = parseString

// opacity

var filterName = (test.style.MsFilter != null && "MsFilter") || (test.style.filter != null && "filter")

parsers.opacity = parseOpacity

if (filterName && test.style.opacity == null){

    var matchOp = /alpha\(opacity=([\d.]+)\)/i

    setters.opacity = function(value){
        value = ((value = +value) === 1) ? "" : "alpha(opacity=" + value * 100 + ")"
        var filter = compute(this)(filterName)
        return this.style[filterName] = matchOp.test(filter) ? filter.replace(matchOp, value) : filter + value
    }

    getters.opacity = function(){
        var match = compute(this)(filterName).match(matchOp)
        return (!match ? 1 : match[1] / 100) + ""
    }

}

var parseBoxShadow = parsers.boxShadow = function(value, normalize, node){
    return parseShadow(value, normalize, node, 4)
}

var parseTextShadow = parsers.textShadow = function(value, normalize, node){
    return parseShadow(value, normalize, node, 3)
}

// Aliases

each(['Webkit', "Moz", "ms"], function(prefix){
    each(["transition", "transform", "transformOrigin", "transformStyle", "perspective", "perspectiveOrigin", "backfaceVisibility"], function(style){
        var cc = prefix + capitalize(style)
        if (test.style[cc] != null) aliases[style] = cc
    })
})

var transitionName = aliases.transition || (test.style.transition != null && "transition")

// equations collection

var equations = {
    "default"     : "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
    "linear"      : "cubic-bezier(0, 0, 1, 1)",
    "ease-in"     : "cubic-bezier(0.42, 0, 1.0, 1.0)",
    "ease-out"    : "cubic-bezier(0, 0, 0.58, 1.0)",
    "ease-in-out" : "cubic-bezier(0.42, 0, 0.58, 1.0)"
}

equations.ease = equations["default"]

// BrowserAnimation

var BrowserAnimation = prime({

    constructor: function BrowserAnimation(node, property){
        var _getter = getter(property),
            _setter = setter(property)

        this.get = function(){
            return _getter.call(node)
        }

        this.set = function(value){
            return _setter.call(node, value)
        }

        this.node = node
        this.property = property
        this.parse = parsers[property] || parse

        var self = this

        this.bExit = function(time){
            self.exit(time)
        }

    },

    setOptions: function(options){
        if (options == null) options = {}
        var duration = options.duration
        if (!(this.duration = this.parseDuration(duration || "500ms"))) throw new Error(this.duration + " is not a valid duration")
        if (!(this.equation = this.parseEquation(options.equation || "default"))) throw new Error(this.equation + " is not a valid equation")
        this.callback = options.callback || function(){}
        return this
    },

    exit: function(time){
        if (this.exitValue != null) this.set(this.exitValue)
        this.cancelExit = null
        this.callback(time)
        return null
    },

    prepare: function(to){

        this.exitValue = null

        // if we start() twice, once with incorrect values and once with correct values, we need to cancel the callback

        if (this.duration === 0){

            this.exitValue = to
            this.cancelExit = requestFrame(this.bExit)

        } else {

            var node       = this.node,
                p          = this.parse,
                fromParsed = this.get(), // already "normalized" by get, always pixels lengths
                toParsed   = p(to, true) // normalize colors, but keep lengths in their passed unit

             //automatic unit conversion for these specific parsers
            if (p === parseLength || p === parseBorder || p === parseShort4){

                var toUnits = toParsed.match(rgLength), /*this should always match something*/
                    i       = 0

                if (toUnits) fromParsed = fromParsed.replace(rgLength, function(fromMatch){
                    var toMatch   = toUnits[i++],
                        fromValue = fromMatch.match(rLengthLax)[1],
                        toUnit    = toMatch.match(rLengthLax)[2]

                    return (toUnit !== "px") ? round(fromValue / pixelRatio(node, toUnit)) + toUnit : fromMatch
                })

                if (i > 0) this.set(fromParsed)

            }

            if (fromParsed === toParsed){

                this.cancelExit = requestFrame(this.bExit)

            } else {

                return [fromParsed, toParsed]

            }

        }
    },

    parseDuration: function(duration){
        if (duration = string.match(duration, rDuration)){
            var time = +duration[1],
                unit = duration[2] || "ms"

            if (unit === "s")  return time * 1e3
            if (unit === "ms") return time
        }
        return null
    },

    parseEquation: function(equation){
        equation = equations[equation] || equation
        var match = equation.replace(/\s+/g, "").match(rCubicBezier)
        return match && map(match.slice(1), function(v){
            return +v
        })
    }

})

var divide = function(string){
    var numbers = []
    string = string.replace(/[-.\d]+/g, function(number){
        numbers.push(+number)
        return "@"
    })
    return [numbers, string]
}

var calc = function(from, to, delta){
    return (to - from) * delta + from
}

var JSAnimation = prime({

    inherits: BrowserAnimation,

    constructor: function JSAnimation(node, property){
        JSAnimation.parent.constructor.call(this, node, property)
        var self = this
        this.bStep = function(t){
            return self.step(t)
        }
    },

    start: function(to){

        this.stop()

        var prepared = this.prepare(to),
            p        = this.parse

        if (prepared){
            this.time = 0
            var from_ = divide(prepared[0]),
                to_   = divide(prepared[1])

            // complex interpolations JSAnimation can't handle
            // even CSS3 animation gracefully fail with some of those edge cases
            // other "simple" properties, such as `border` can have different templates
            // because of string properties like "solid" and "dashed"
            if ((from_[0].length !== to_[0].length) || ((p === parseBoxShadow || p === parseTextShadow || p === parse) && (from_[1] !== to_[1]))){
                this.exit(to)
            } else {
                this.from = from_[0]
                this.to = to_[0]
                this.template = to_[1]
                this.cancelStep = requestFrame(this.bStep)
            }
        }

        return this
    },

    stop: function(){
        if (this.cancelExit) this.cancelExit = this.cancelExit()
        else if (this.cancelStep) this.cancelStep = this.cancelStep()
        return this
    },

    step: function(now){
        this.time || (this.time = now)

        var factor = (now - this.time) / this.duration

        if (factor > 1) factor = 1

        var delta = this.equation(factor),
            tpl   = this.template,
            from  = this.from,
            to    = this.to

        for (var i = 0, l = from.length; i < l; i++){
            var f = from[i],
                t = to[i]

            tpl = tpl.replace("@", t !== f ? calc(f, t, delta) : t)
        }

        this.set(tpl)
        if (factor !== 1) this.cancelStep = requestFrame(this.bStep)
        else {
            this.cancelStep = null
            this.callback(now)
        }
    },

    parseEquation: function(equation){
        var equation = JSAnimation.parent.parseEquation.call(this, equation)
        if (equation == [0, 0, 1, 1]) return function(x){
            return x
        }
        return bezier(equation[0], equation[1], equation[2], equation[3], 1e3 / 60 / this.duration / 4)
    }


})

// CSSAnimation

var remove3 = function(value, a, b, c){
    var index = indexOf(a, value)
    if (index !== -1){
        a.splice(index, 1)
        b.splice(index, 1)
        c.splice(index, 1)
    }
}

var CSSAnimation = prime({

    inherits: BrowserAnimation,

    constructor: function CSSAnimation(node, property){
        CSSAnimation.parent.constructor.call(this, node, property)

        this.hproperty = hyphenate(aliases[property] || property)

        var self = this

        this.bSetTransitionCSS = function(time){
            self.setTransitionCSS(time)
        }

        this.bSetStyleCSS = function(time){
            self.setStyleCSS(time)
        }

        this.bComplete = function(){
            self.complete()
        }
    },

    start: function(to){

        this.stop()

        var prepared = this.prepare(to)

        if (prepared){
            this.to = prepared[1]
            // setting transition styles immediately will make good browsers behave weirdly
            // because DOM changes are always deferred, so we requestFrame
            this.cancelSetTransitionCSS = requestFrame(this.bSetTransitionCSS)
        }

        return this
    },

    setTransitionCSS: function(){
        this.cancelSetTransitionCSS = null
        this.resetCSS(true)
        // firefox flickers if we set css for transition as well as styles at the same time
        // so, other than deferring transition styles we defer actual styles as well on a requestFrame
        this.cancelSetStyleCSS = requestFrame(this.bSetStyleCSS)
    },

    setStyleCSS: function(time){
        this.cancelSetStyleCSS = null
        var duration = this.duration
        // we use setTimeout instead of transitionEnd because some browsers (looking at you foxy)
        // incorrectly set event.propertyName, so we cannot check which animation we are canceling
        this.cancelComplete = setTimeout(this.bComplete, duration)
        this.endTime = time + duration
        this.set(this.to)
    },

    complete: function(){
        this.cancelComplete = null
        this.resetCSS()
        this.callback(this.endTime)
        return null
    },

    stop: function(hard){
        if (this.cancelExit) this.cancelExit = this.cancelExit()

        else if (this.cancelSetTransitionCSS){
            // if cancelSetTransitionCSS is set, means nothing is set yet
            this.cancelSetTransitionCSS = this.cancelSetTransitionCSS() //so we cancel and we're good
        } else if (this.cancelSetStyleCSS){
            // if cancelSetStyleCSS is set, means transition css has been set, but no actual styles.
            this.cancelSetStyleCSS = this.cancelSetStyleCSS()
            // if its a hard stop (and not another start on top of the current animation)
            // we need to reset the transition CSS
            if (hard) this.resetCSS()
        } else if (this.cancelComplete){
            // if cancelComplete is set, means style and transition css have been set, not yet completed.
            this.cancelComplete = clearTimeout(this.cancelComplete)
            // if its a hard stop (and not another start on top of the current animation)
            // we need to reset the transition CSS set the current animation styles
            if (hard){
                this.resetCSS()
                this.set(this.get())
            }
        }
        return this
    },

    resetCSS: function(inclusive){
        var rules      = compute(this.node),
            properties = rules(transitionName + "Property").replace(/\s+/g, "").split(","),
            durations  = rules(transitionName + "Duration").replace(/\s+/g, "").split(","),
            equations  = rules(transitionName + "TimingFunction").replace(/\s+/g, "").match(rgCubicBezier)

        remove3("all",          properties, durations, equations)
        remove3(this.hproperty, properties, durations, equations)

        if (inclusive){
            properties.push(this.hproperty)
            durations.push(this.duration + "ms")
            equations.push("cubic-bezier(" + this.equation + ")")
        }

        var nodeStyle = this.node.style

        nodeStyle[transitionName + "Property"]       = properties
        nodeStyle[transitionName + "Duration"]       = durations
        nodeStyle[transitionName + "TimingFunction"] = equations
    }

})

// nodes methods

var BaseAnimation = transitionName ? CSSAnimation : JSAnimation
// var BaseAnimation = JSAnimation

var moofx = function(x, y){
    return nodes(x, y)
}

nodes.implement({

    // {properties}, options or
    // property, value options
    animate: function(A, B, C){

        var styles = A, options = B

        if (typeof A === "string"){
            styles = {}
            styles[A] = B
            options = C
        }

        if (options == null) options = {}

        var type = typeof options

        options = type === "function" ? {
            callback: options
        } : (type === "string" || type === "number") ? {
            duration: options
        } : options

        var callback  = options.callback || function(){},
            completed = 0,
            length    = 0

        options.callback = function(t){
            if (++completed === length) callback(t)
        }

        for (var property in styles){

            var value    = styles[property],
                property = camelize(property)

            this.handle(function(node){
                length++
                var anims = this._animations || (this._animations = {})
                var anim  = anims[property] || (anims[property] = new BaseAnimation(node, property))
                anim.setOptions(options).start(value)
            })
        }

    },

    // {properties} or
    // property, value
    style: function(A, B){
        var styles = A

        if (typeof A === "string"){
            styles = {}
            styles[A] = B
        }

        for (var property in styles){
            var value = styles[property],
                set   = setter(property = camelize(property))

            this.handle(function(node){
                var anims = this._animations, anim
                if (anims && (anim = anims[property])) anim.stop(true)
                set.call(node, value)
            })
        }
        return this
    },

    compute: function(property){
        return getter(camelize(property)).call(this[0])
    }

})

moofx.version = "3.0.9"

/*(moofx.test)?*/
moofx.parse = function(property, value, normalize, node){
  if (!parsers[property = camelize(property)]) return null
  return parsers[property](value, normalize, node)
}/*:*/

module.exports = moofx
