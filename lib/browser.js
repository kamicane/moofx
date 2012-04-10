/*
MooFx
*/"use strict"

// requires

var color  = require("./color"),
    frame  = require("./frame")

var cancelFrame = frame.cancel,
    requestFrame = frame.request

/*(css3)?*/
var bezier = require("cubic-bezier")/*:*/

var prime  = require("prime/prime"),
    array  = require("prime/es5/array"),
    string = require("prime/types/string")

var camelize   = string.camelize,
    clean      = string.clean,
    capitalize = string.capitalize

var map     = array.map,
    each    = array.forEach,
    indexOf = array.indexOf

var nodes  = require("nodes/lib/nodes")

// util

var hyphenated = {}
var hyphenate = function(self){
    return hyphenated[self] || (hyphenated[self] = string.hyphenate(self))
}

var round = function(n){
    return Math.round(n * 1000) / 1000
}

// compute > node > property

var compute = global.getComputedStyle ? function(node){
    var cts = getComputedStyle(node)
    return function(property){
        return cts ? cts.getPropertyValue(hyphenate(property)) : ""
    }
} : /*(css3)?*/function(node){
    var cts = node.currentStyle
    return function(property){
        return cts ? cts[camelize(property)] : ""
    }
}/*:null*/

// pixel ratio retriever

var test = document.createElement("div")

var cssText = "border:none;margin:none;padding:none;visibility:hidden;position:absolute;height:0;";

// returns the amount of pixels that takes to make one of the unit

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
    sLengthNum   = sLength + "?",
    sBorderStyle = "none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit",
    sCubicBezier = "cubic-bezier\\(([-.\\d]+),([-.\\d]+),([-.\\d]+),([-.\\d]+)\\)",
    sDuration    = "([\\d.]+)(s|ms)?"

// regular expressions

var rgLength      = RegExp(sLength, "g"),
    rLengthNum    = RegExp(sLengthNum),
    rgLengthNum   = RegExp(sLengthNum, "g"),
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
    var black = "rgba(0,0,0,1)", c
    if (!value || !(c = color(value, true))) return normalize ? black : ""
    if (normalize) return "rgba(" + c + ")"

    var alpha = c[3]
    if (alpha === 0) return "transparent"
    return (!rgba || alpha === 1) ? "rgb(" + c.slice(0, 3) + ")" : "rgba(" + c + ")"
}

var parseLength = function(value, normalize){
    if (value == null || value === "") return normalize ? "0px" : ""
    var match = string.match(value, rLengthNum)
    return match ? match[1] + (match[2] || "px") : value // cannot be parsed. probably "auto"
}

var parseBorderStyle = function(value, normalize){
    if (value == null || value === "") return normalize ? "none" : ""
    var match = value.match(rBorderStyle)
    return match ? value : normalize ? "none" : ""
}

var parseBorder = function(value, normalize){
    var normalized = "0px none rgba(0,0,0,1)"
    if (value == null || value === "")     return normalize ? normalized : ""
    if (value === 0   || value === "none") return normalize ? normalized : value + ""

    var c
    value = value.replace(color.x, function(match){
        c = match
        return ""
    })

    var s = value.match(rBorderStyle),
        l = value.match(rgLengthNum)

    return clean([
        parseLength(l ? l[0] : "", normalize),
        parseBorderStyle(s ? s[0] : "", normalize),
        parseColor(c, normalize)
    ].join(" "))
}

var parseShort4 = function(value, normalize){
    if (value == null || value === "") return normalize ? "0px 0px 0px 0px" : ""
    return clean(mirror4(map(clean(value).split(" "), function(v){
        return parseLength(v, normalize)
    })).join(" "))
}

var parseShadow = function(value, normalize, len){
    var transparent = "rgba(0,0,0,0)",
        normalized  = (len === 3) ? transparent + " 0px 0px 0px" : transparent + " 0px 0px 0px 0px"

    if (value ==  null || value === "") return normalize ? normalized : ""
    if (value === "none") return normalize ? normalized : value

    var colors = [], value = clean(value).replace(color.x, function(match){
        colors.push(match)
        return ""
    })

    return map(value.split(","), function(shadow, i){

        var c       = parseColor(colors[i], normalize),
            inset   = /inset/.test(shadow),
            lengths = shadow.match(rgLengthNum) || ["0px"]

        lengths = map(lengths, function(m){
            return parseLength(m, normalize)
        })

        while (lengths.length < len) lengths.push("0px")

        var ret = inset ? ["inset", c] : [c]

        return ret.concat(lengths).join(" ")

    }).join(", ")
}

var parse = function(value, normalize){
    if (value == null || value === "") return "" // cant normalize "" || null
    return value.replace(color.x, function(match){
        return parseColor(match, normalize)
    }).replace(rgLength, function(match){
        return parseLength(match, normalize)
    })
}

// get && set

var getters = {}, setters = {}, parsers = {}, aliases = {}

var getter = function(key){
    return getters[key] || (getters[key] = (function(){
        var alias  = aliases[key] || key,
            parser = parsers[key] || parse

        return function(){
            return parser(compute(this)(alias), true)
        }

    }()))
}

var setter = function(key){
    return setters[key] || (setters[key] = (function(){
        var alias  = aliases[key] || key,
            parser = parsers[key] || parse

        return function(value){
            this.style[alias] = parser(value, false)
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

parsers.borderStyle = function(value, normalize){
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

parsers.opacity = parseOpacity

/*(css3)?*/

var filterName = (test.style.MsFilter != null && "MsFilter") || (test.style.filter != null && "filter")

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

}/*:*/

var parseBoxShadow = parsers.boxShadow = function(value, normalize){
    return parseShadow(value, normalize, 4)
}

var parseTextShadow = parsers.textShadow = function(value, normalize){
    return parseShadow(value, normalize, 3)
}

// Aliases

each(['Webkit', "Moz", "ms", "O", null], function(prefix){
    each(["transition", "transform", "transformOrigin", "transformStyle", "perspective", "perspectiveOrigin", "backfaceVisibility"], function(style){
        var cc = prefix ? prefix + capitalize(style) : style
        if (prefix === "ms") hyphenated[cc] = "-ms-" + hyphenate(style)
        if (test.style[cc] != null) aliases[style] = cc
    })
})

var transitionName = aliases.transition,
    transformName  = aliases.transform

// manually disable css3 transitions in Opera, because they do not work properly.

if (transitionName === "OTransition") transitionName = null


// this takes care of matrix decomposition on browsers that support only 2d transforms but no CSS3 transitions.
// basically, IE9 (and Opera as well, since we disabled CSS3 transitions manually)

var parseTransform2d, Transform2d

/*(css3)?*/

if (!transitionName && transformName) (function(){

    var unmatrix = require("./unmatrix2d")

    var v = "\\s*([-\\d\\w.]+)\\s*"

    var rMatrix = RegExp("matrix\\(" + [v, v, v, v, v, v] + "\\)")

    var decomposeMatrix = function(matrix){

        var d = unmatrix.apply(null, matrix.match(rMatrix).slice(1))

        return [

            "translate(" + map(d[0], function(v){return round(v) + "px"}) + ")",
            "rotate(" + round(d[1] * 180 / Math.PI) + "deg)",
            "skewX(" + round(d[2] * 180 / Math.PI) + "deg)",
            "scale(" + map(d[3], round) + ")"

        ].join(" ")

    }

    var def0px  = function(value){return value || "0px"},
        def1    = function(value){return value || "1"},
        def0deg = function(value){return value || "0deg"}

    var transforms = {

        translate: function(value){
            if (!value) value = "0px,0px"
            var values = value.split(",")
            if (!values[1]) values[1] = "0px"
            return map(values, clean) + ""
        },
        translateX: def0px,
        translateY: def0px,
        scale: function(value){
            if (!value) value = "1,1"
            var values = value.split(",")
            if (!values[1]) values[1] = values[0]
            return map(values, clean) + ""
        },
        scaleX: def1,
        scaleY: def1,
        rotate: def0deg,
        skewX: def0deg,
        skewY: def0deg

    }

    Transform2d = prime({

        constructor: function(transform){

            var names = this.names = []
            var values = this.values = []

            transform.replace(/(\w+)\(([-.\d\s\w,]+)\)/g, function(match, name, value){
                names.push(name)
                values.push(value)
            })

        },

        identity: function(){
            return map(this.names, function(name){
                return name + "(" + transforms[name]() + ")"
            }).join(" ")
        },

        sameType: function(transformObject){
            return this.names.toString() === transformObject.names.toString()
        },

        // this is, basically, cheating.
        // retrieving the matrix value from the dom, rather than calculating it

        decompose: function(){
            var transform = this.toString()

            test.style.cssText = cssText + hyphenate(transformName) + ":" + transform + ";"
            document.body.appendChild(test)
            var m = compute(test)(transformName)
            if (!m || m === "none") m = "matrix(1, 0, 0, 1, 0, 0)"
            document.body.removeChild(test)
            return decomposeMatrix(m)
        }

    })

    Transform2d.prototype.toString = function(clean){
        var values = this.values, functions = []
        each(this.names, function(name, i){
            var value = transforms[name](values[i])
            if (!clean || value !== transforms[name]()) functions.push(name + "(" + value + ")")
        })
        return functions.length ? functions.join(" ") : "none"
    }

    // this parser makes sure it never gets "matrix"

    parseTransform2d = parsers.transform = function(transform){
        if (!transform || transform === "none") return "none"
        return new Transform2d(rMatrix.test(transform) ? decomposeMatrix(transform) : transform).toString(true)

    }

    // this getter makes sure we read from the dom only the first time
    // this way we save the actual transform and not "matrix"
    // setting matrix() will use parseTransform2d as well, thus setting the decomposed matrix

    getters.transform = function(){
        var s = this.style
        return s[transformName] || (s[transformName] = parseTransform2d(compute(this)(transformName)))
    }


})()/*:*/

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
            return
        }

        var node       = this.node,
            p          = this.parse,
            fromParsed = this.get(), // already "normalized" by get
            toParsed   = p(to, true, node) // normalize parsed property

        // automatic unit conversion for these specific parsers
        // this is needed for both css transitions and js transitions

        if (p === parseLength || p === parseBorder || p === parseShort4){

            var toUnits = toParsed.match(rgLength), i = 0 // this should always match something

            if (toUnits) fromParsed = fromParsed.replace(rgLength, function(fromFull, fromValue, fromUnit){

                var toFull    = toUnits[i++],
                    toMatched = toFull.match(rLengthNum),
                    toUnit    = toMatched[2]

                if (fromUnit !== toUnit){
                    var fromPixels = (fromUnit === "px") ? fromValue : pixelRatio(node, fromUnit) * fromValue
                    return round(fromPixels / pixelRatio(node, toUnit)) + toUnit
                }

                return fromFull

            })

            if (i > 0) this.set(fromParsed)

        }/*(css3)?*/else if (p === parseTransform2d) (function(){ // IE9/Opera

            if (fromParsed === toParsed) return // nothing to do

            var fromMap, toMap

            if (fromParsed === "none"){

                toMap      = new Transform2d(toParsed)
                toParsed   = toMap.toString()
                fromParsed = toMap.identity()
                fromMap    = new Transform2d(fromParsed)

            } else if (toParsed === "none"){

                fromMap    = new Transform2d(fromParsed)
                fromParsed = fromMap.toString()
                toParsed   = fromMap.identity()
                toMap      = new Transform2d(toParsed)

            } else {

                fromMap    = new Transform2d(fromParsed)
                fromParsed = fromMap.toString()
                toMap      = new Transform2d(toParsed)
                toParsed   = toMap.toString()

            }

            if (fromParsed === toParsed) return // nothing to do

            if (!fromMap.sameType(toMap)){

                fromParsed = fromMap.decompose()
                toParsed = toMap.decompose()

            }

        })()/*:*/

        if (fromParsed === toParsed){

            this.cancelExit = requestFrame(this.bExit)

        } else {

            return [fromParsed, toParsed]

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

var JSAnimation

/*(css3)?*/

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

JSAnimation = prime({

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

            if ((from_[0].length !== to_[0].length) || (
                (p === parseBoxShadow || p === parseTextShadow || p === parse) &&
                (from_[1] !== to_[1])
            )){
                this.exitValue = to
                this.cancelExit = requestFrame(this.bExit)
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
        if (equation.toString() === "0,0,1,1") return function(x){
            return x
        }
        return bezier(equation[0], equation[1], equation[2], equation[3], 1e3 / 60 / this.duration / 4)
    }


})/*:*/

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

        return this

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

        property = camelize(property)
        var node = this[0]

        // return default matrix for transform, instead of parsed (for consistency)

        if (property === "transform" && parseTransform2d) return compute(node)(transformName)

        var value = getter(property).call(node)

        // unit conversion to `px`

        return (value != null) ? value.replace(rgLength, function(match, value, unit){
            return (unit === "px") ? match : pixelRatio(node, unit) * value + "px"
        }) : ''

    }

})

moofx.version = "%version%"

moofx.parse = function(property, value, normalize){
    return (parsers[camelize(property)] || parse)(value, normalize)
}

module.exports = moofx
