/*
MooFx
*/"use strict"

// requires

var color  = require("./color"),
    frame  = require("./frame")

var cancelFrame = frame.cancel,
    requestFrame = frame.request

var prime  = require("prime")

var camelCase       = require("mout/string/camelCase"),
    trim            = require("mout/string/trim"),
    properCase      = require("mout/string/properCase"),
    hyphenateString = require("mout/string/hyphenate")

var map     = require("mout/array/map"),
    forEach = require("mout/array/forEach"),
    indexOf = require("mout/array/indexOf")

var elements = require("elements")

var fx = require("./fx")

// util

var clean = function(str) {
    return trim(str).replace(/\s+/g, " ")
}

var matchString = function(s, r){
    return String.prototype.match.call(s, r)
}

var hyphenated = {}
var hyphenate = function(self){
    return hyphenated[self] || (hyphenated[self] = hyphenateString(self))
}

var round = function(n){
    return Math.round(n * 1e3) / 1e3
}

// compute > node > property

var compute = global.getComputedStyle ? function(node){
    var cts = getComputedStyle(node, null)
    return function(property){
        return cts ? cts.getPropertyValue(hyphenate(property)) : ""
    }
} : /*(css3)?*/function(node){
    var cts = node.currentStyle
    return function(property){
        return cts ? cts[camelCase(property)] : ""
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
    sBorderStyle = "none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit"

// regular expressions

var rgLength     = RegExp(sLength, "g"),
    rLengthNum   = RegExp(sLengthNum),
    rgLengthNum  = RegExp(sLengthNum, "g"),
    rBorderStyle = RegExp(sBorderStyle)

// normalize > css

var parseString = function(value){
    return (value == null) ? "" : value + ""
}

var parseOpacity = function(value, normalize){
    if (value == null || value === "") return normalize ? "1" : ""
    return (isFinite((value = +value))) ? (value < 0 ? "0" : value + "") : "1"
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
    var match = matchString(value, rLengthNum)
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

forEach(trbl, function(d){
    var bd = "border" + d
    forEach([ "margin" + d, "padding" + d, bd + "Width", d.toLowerCase()], function(n){
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

forEach(tlbl, function(d){
    parsers["border" + d + "Radius"] = parseLength
})

parsers.color = parsers.backgroundColor = parseColor
parsers.width = parsers.height = parsers.minWidth = parsers.minHeight = parsers.maxWidth = parsers.maxHeight = parsers.fontSize = parsers.backgroundSize = parseLength

// margin + padding

forEach(["margin", "padding"], function(name){
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
    if (!value || !(value = matchString(value, color.x))) return normalize ? mirror4(["rgba(0,0,0,1)"]).join(" ") : ""
    return clean(mirror4(map(value, function(v){
        return parseColor(v, normalize)
    })).join(" "))
}

forEach(["Width", "Style", "Color"], function(name){
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
        value = ((value = parseOpacity(value)) === "1") ? "" : "alpha(opacity=" + Math.round(value * 100) + ")"
        var filter = compute(this)(filterName)
        return this.style[filterName] = matchOp.test(filter) ? filter.replace(matchOp, value) : filter + " " + value
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

forEach(['Webkit', "Moz", "ms", "O", null], function(prefix){
    forEach([
        "transition", "transform", "transformOrigin", "transformStyle", "perspective", "perspectiveOrigin", "backfaceVisibility"
    ], function(style){
        var cc = prefix ? prefix + properCase(style) : style
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

        var d = unmatrix.apply(null, matrix.match(rMatrix).slice(1)) || [[0, 0], 0, 0, [0, 0]]

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
            var functions = []
            forEach(this.names, function(name){
                var fn = transforms[name]
                if (fn) functions.push(name + "(" + fn() + ")")
            })
            return functions.join(" ")
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
        forEach(this.names, function(name, i){
            var fn = transforms[name]
            if (!fn) return
            var value = fn(values[i])
            if (!clean || value !== fn()) functions.push(name + "(" + value + ")")
        })
        return functions.length ? functions.join(" ") : "none"
    }

    Transform2d.union = function(from, to){

        if (from === to) return // nothing to do

        var fromMap, toMap

        if (from === "none"){

            toMap   = new Transform2d(to)
            to      = toMap.toString()
            from    = toMap.identity()
            fromMap = new Transform2d(from)

        } else if (to === "none"){

            fromMap = new Transform2d(from)
            from    = fromMap.toString()
            to      = fromMap.identity()
            toMap   = new Transform2d(to)

        } else {

            fromMap = new Transform2d(from)
            from    = fromMap.toString()
            toMap   = new Transform2d(to)
            to      = toMap.toString()

        }

        if (from === to) return // nothing to do

        if (!fromMap.sameType(toMap)){

            from = fromMap.decompose()
            to   = toMap.decompose()

        }

        if (from === to) return // nothing to do

        return [from, to]

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

// tries to match from and to values

var prepare = function(node, property, to){

    var parser = parsers[property] || parse,
        from   = getter(property).call(node), // "normalized" by the getter
        to     = parser(to, true) // normalize parsed property

    if (from === to) return

    if (parser === parseLength || parser === parseBorder || parser === parseShort4){

        var toAll = to.match(rgLength), i = 0 // this should always match something

        if (toAll) from = from.replace(rgLength, function(fromFull, fromValue, fromUnit){

            var toFull    = toAll[i++],
                toMatched = toFull.match(rLengthNum),
                toUnit    = toMatched[2]

            if (fromUnit !== toUnit){
                var fromPixels = (fromUnit === "px") ? fromValue : pixelRatio(node, fromUnit) * fromValue
                return round(fromPixels / pixelRatio(node, toUnit)) + toUnit
            }

            return fromFull

        })

        if (i > 0) setter(property).call(node, from)

    }/*(css3)?*/else if (parser === parseTransform2d){ // IE9/Opera

        return Transform2d.union(from, to)

    }/*:*/

    return (from !== to) ? [from, to] : null

}

// BrowserAnimation

var BrowserAnimation = prime({

    inherits: fx,

    constructor: function BrowserAnimation(node, property){

        var _getter = getter(property),
            _setter = setter(property)

        this.get = function(){
            return _getter.call(node)
        }

        this.set = function(value){
            return _setter.call(node, value)
        }

        BrowserAnimation.parent.constructor.call(this, this.set)

        this.node = node
        this.property = property

    }

})

var JSAnimation

/*(css3)?*/

JSAnimation = prime({

    inherits: BrowserAnimation,

    constructor: function JSAnimation(){
        return JSAnimation.parent.constructor.apply(this, arguments)
    },

    start: function(to){

        this.stop()

        if (this.duration === 0){
            this.cancel(to)
            return this
        }

        var fromTo = prepare(this.node, this.property, to)

        if (!fromTo){
            this.cancel(to)
            return this
        }

        JSAnimation.parent.start.apply(this, fromTo)

        if (!this.cancelStep) return this

        // the animation would have started but we need additional checks

        var parser = parsers[this.property] || parse

        // complex interpolations JSAnimation can't handle
        // even CSS3 animation gracefully fail with some of those edge cases
        // other "simple" properties, such as `border` can have different templates
        // because of string properties like "solid" and "dashed"

        if ((parser === parseBoxShadow || parser === parseTextShadow || parser === parse) &&
            (this.templateFrom !== this.templateTo)){
                this.cancelStep()
                delete this.cancelStep
                this.cancel(to)
        }

        return this
    },

    parseEquation: function(equation){
        if (typeof equation === "string") return JSAnimation.parent.parseEquation.call(this, equation)
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

        if (this.duration === 0){
            this.cancel(to)
            return this
        }

        var fromTo = prepare(this.node, this.property, to)

        if (!fromTo){
            this.cancel(to)
            return this
        }

        this.to = fromTo[1]
        // setting transition styles immediately will make good browsers behave weirdly
        // because DOM changes are always deferred, so we requestFrame
        this.cancelSetTransitionCSS = requestFrame(this.bSetTransitionCSS)

        return this
    },

    setTransitionCSS: function(time){
        delete this.cancelSetTransitionCSS
        this.resetCSS(true)
        // firefox flickers if we set css for transition as well as styles at the same time
        // so, other than deferring transition styles we defer actual styles as well on a requestFrame
        this.cancelSetStyleCSS = requestFrame(this.bSetStyleCSS)
    },

    setStyleCSS: function(time){
        delete this.cancelSetStyleCSS
        var duration = this.duration
        // we use setTimeout instead of transitionEnd because some browsers (looking at you foxy)
        // incorrectly set event.propertyName, so we cannot check which animation we are canceling
        this.cancelComplete = setTimeout(this.bComplete, duration)
        this.endTime = time + duration
        this.set(this.to)
    },

    complete: function(){
        delete this.cancelComplete
        this.resetCSS()
        this.callback(this.endTime)
    },

    stop: function(hard){
        if (this.cancelExit){
            this.cancelExit()
            delete this.cancelExit
        } else if (this.cancelSetTransitionCSS){
            // if cancelSetTransitionCSS is set, means nothing is set yet
            this.cancelSetTransitionCSS() //so we cancel and we're good
            delete this.cancelSetTransitionCSS
        } else if (this.cancelSetStyleCSS){
            // if cancelSetStyleCSS is set, means transition css has been set, but no actual styles.
            this.cancelSetStyleCSS()
            delete this.cancelSetStyleCSS
            // if its a hard stop (and not another start on top of the current animation)
            // we need to reset the transition CSS
            if (hard) this.resetCSS()
        } else if (this.cancelComplete){
            // if cancelComplete is set, means style and transition css have been set, not yet completed.
            clearTimeout(this.cancelComplete)
            delete this.cancelComplete
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
            properties = (rules(transitionName + "Property").replace(/\s+/g, "") || "all").split(","),
            durations  = (rules(transitionName + "Duration").replace(/\s+/g, "") || "0s").split(","),
            equations  = (rules(transitionName + "TimingFunction").replace(/\s+/g, "") || "ease").match(/cubic-bezier\([\d-.,]+\)|([a-z-]+)/g)

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
    },

    parseEquation: function(equation){
        if (typeof equation === "string") return CSSAnimation.parent.parseEquation.call(this, equation, true)
    }

})

// elements methods

var BaseAnimation = transitionName ? CSSAnimation : JSAnimation

var moofx = function(x, y){
    return (typeof x === "function") ? fx(x) : elements(x, y)
}

elements.implement({

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
                property = camelCase(property)

            this.forEach(function(node){
                length++
                var self = elements(node), anims = self._animations || (self._animations = {})
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
                set   = setter(property = camelCase(property))

            this.forEach(function(node){
                var self = elements(node), anims = self._animations, anim
                if (anims && (anim = anims[property])) anim.stop(true)
                set.call(node, value)
            })
        }

        return this

    },

    compute: function(property){

        property = camelCase(property)
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

moofx.parse = function(property, value, normalize){
    return (parsers[camelCase(property)] || parse)(value, normalize)
}

module.exports = moofx
