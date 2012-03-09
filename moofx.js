/*
---
provides: moofx
version: 3.0.5-dev
description: A CSS3-enabled javascript animation library on caffeine
homepage: http://moofx.it
author: Valerio Proietti <@kamicane> (http://mad4milk.net)
license: MIT (http://mootools.net/license.txt)
includes: cubic-bezier by Arian Stolwijk (https://github.com/arian/cubic-bezier)
...
*/

(function(modules) {
    var cache = {}, require = function(id) {
        var module;
        if (module = cache[id]) return module.exports;
        module = cache[id] = {
            exports: {}
        };
        var exports = module.exports;
        modules[id].call(exports, require, module, exports, window);
        return module.exports;
    };
    window.moofx = require("0");
})({
    "0": function(require, module, exports, global) {
        var color = require("1"), frame = require("2");
        var moofx = typeof document !== "undefined" ? require("3") : {};
        moofx.requestFrame = frame.request;
        moofx.cancelFrame = frame.cancel;
        moofx.color = color;
        module.exports = moofx;
    },
    "1": function(require, module, exports, global) {
        var colors = {
            maroon: "#800000",
            red: "#ff0000",
            orange: "#ffA500",
            yellow: "#ffff00",
            olive: "#808000",
            purple: "#800080",
            fuchsia: "#ff00ff",
            white: "#ffffff",
            lime: "#00ff00",
            green: "#008000",
            navy: "#000080",
            blue: "#0000ff",
            aqua: "#00ffff",
            teal: "#008080",
            black: "#000000",
            silver: "#c0c0c0",
            gray: "#808080"
        };
        var RGBtoRGB = function(r, g, b, a) {
            if (a == null) a = 1;
            r = parseInt(r, 10);
            g = parseInt(g, 10);
            b = parseInt(b, 10);
            a = parseFloat(a);
            if (!(r <= 255 && r >= 0 && g <= 255 && g >= 0 && b <= 255 && b >= 0 && a <= 1 && a >= 0)) return null;
            return [ Math.round(r), Math.round(g), Math.round(b), a ];
        };
        var HEXtoRGB = function(hex) {
            if (hex.length === 3) hex += "f";
            if (hex.length === 4) {
                var h0 = hex.charAt(0), h1 = hex.charAt(1), h2 = hex.charAt(2), h3 = hex.charAt(3);
                hex = h0 + h0 + h1 + h1 + h2 + h2 + h3 + h3;
            }
            if (hex.length === 6) hex += "ff";
            var rgb = [];
            for (var i = 0, l = hex.length; i <= l; i += 2) rgb.push(parseInt(hex.substr(i, 2), 16) / (i === 6 ? 255 : 1));
            return rgb;
        };
        var HUEtoRGB = function(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        var HSLtoRGB = function(h, s, l, a) {
            var r, b, g;
            if (a == null) a = 1;
            h /= 360;
            s /= 100;
            l /= 100;
            a /= 1;
            if (h > 1 || h < 0 || s > 1 || s < 0 || l > 1 || l < 0 || a > 1 || a < 0) return null;
            if (s === 0) {
                r = b = g = l;
            } else {
                var q = l < .5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = HUEtoRGB(p, q, h + 1 / 3);
                g = HUEtoRGB(p, q, h);
                b = HUEtoRGB(p, q, h - 1 / 3);
            }
            return [ r * 255, g * 255, b * 255, a ];
        };
        module.exports = function(input, array) {
            var match;
            if (typeof input !== "string") return null;
            input = colors[input = input.replace(/\s+/g, "")] || input;
            if (input.match(/^#[a-f0-9]{3,8}/)) {
                input = HEXtoRGB(input.replace("#", ""));
            } else if (match = input.match(/([\d.])+/g)) {
                if (input.match(/^rgb/)) input = match; else if (input.match(/^hsl/)) input = HSLtoRGB.apply(null, match); else return null;
            } else {
                return null;
            }
            if (!(input && (input = RGBtoRGB.apply(null, input)))) return null;
            if (array) return input;
            if (input[3] === 1) input.splice(3, 1);
            return "rgb" + (input.length > 3 ? "a" : "") + "(" + input + ")";
        };
    },
    "2": function(require, module, exports, global) {
        var callbacks = [], running = false;
        var iterator = function(time) {
            if (time == null) time = +(new Date);
            running = false;
            for (var i = callbacks.length; i--; ) {
                var callback = callbacks.shift();
                if (callback) callback(time);
            }
        };
        var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame || global.msRequestAnimationFrame || function(callback) {
            return setTimeout(callback, 1e3 / 60);
        };
        exports.request = function(callback) {
            callbacks.push(callback);
            if (!running) {
                running = true;
                requestFrame(iterator);
            }
            return this;
        };
        exports.cancel = function(match) {
            for (var i = callbacks.length; i--; ) if (callbacks[i] === match) {
                callbacks.splice(i, 1);
                break;
            }
            return this;
        };
    },
    "3": function(require, module, exports, global) {
        var bezier = require("4"), color = require("1"), frame = require("2");
        var inherits = function(parent, child) {
            var C = function() {
                this.constructor = parent;
            };
            var proto = C.prototype = parent.prototype;
            child.prototype = new C;
            child.prototype.parent = proto;
            return child;
        };
        var cancelFrame = frame.cancel, requestFrame = frame.request;
        var string = String, number = parseFloat;
        var camelize = function(self) {
            return self.replace(/-\D/g, function(match) {
                return match.charAt(1).toUpperCase();
            });
        };
        var hyphenate = function(self) {
            return self.replace(/[A-Z]/g, function(match) {
                return "-" + match.charAt(0).toLowerCase();
            });
        };
        var clean = function(self) {
            return string(self).replace(whiteRe, " ").replace(/^\s+|\s+$/g, "");
        };
        var map = Array.map || Array.prototype.map ? function(array, fn, context) {
            return Array.prototype.map.call(array, fn, context);
        } : function(array, fn, context) {
            var result = [];
            for (var i = 0, l = array.length; i < l; i++) result.push(fn.call(context, array[i], i, array));
            return result;
        };
        var each = Array.prototype.forEach ? function(array, fn, context) {
            Array.prototype.forEach.call(array, fn, context);
            return array;
        } : function(array, fn, context) {
            for (var i = 0, l = array.length; i < l; i++) fn.call(context, array[i], i, array);
            return array;
        };
        var compute = global.getComputedStyle ? function(node) {
            var cts = getComputedStyle(node);
            return function(property) {
                return cts ? cts.getPropertyValue(hyphenate(property)) : "";
            };
        } : function(node) {
            var cts = node.currentStyle;
            return function(property) {
                return cts ? cts[camelize(property)] : "";
            };
        };
        var test = document.createElement("div");
        var cssText = "border:none;margin:none;padding:none;visibility:hidden;position:absolute;height:0;";
        var pixelRatio = function(element, u) {
            var parent = element.parentNode, ratio = 1;
            if (parent) {
                test.style.cssText = cssText + ("width:100" + u + ";");
                parent.appendChild(test);
                ratio = test.offsetWidth / 100;
                parent.removeChild(test);
            }
            return ratio;
        };
        var mirror4 = function(values) {
            var length = values.length;
            if (length === 1) values.push(values[0], values[0], values[0]); else if (length === 2) values.push(values[0], values[1]); else if (length === 3) values.push(values[1]);
            return values;
        };
        var colorRe = /(rgb[a]?\([-.\d,\s]+\))|(hsl[a]?\([-.\d,\s]+\))|(#[a-f0-9]{3,8})|(maroon|red|orange|yellow|olive|purple|fuchsia|white|lime|green|navy|blue|aqua|teal|black|silver|gray|transparent)/g, lengthRe = /([-.\d]+)(%|cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vm)/g, rLengthRe = /([-.\d]+)([\w%]+)?/, rLengthReG = /([-.\d]+)([\w%]+)?/g, borderStyleRe = /none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit/, cubicBezierRe = /cubic-bezier\(([-.\d]+),([-.\d]+),([-.\d]+),([-.\d]+)\)/, cubicBezierReG = /cubic-bezier\(([-.\d,]+)\)/g, durationRe = /([\d.]+)(s|ms)?/, whiteRe = /\s+/g;
        var parseString = function(value) {
            return value == null ? "" : value;
        };
        var parseOpacity = function(value, normalize) {
            if (value == null || value === "") return normalize ? "1" : "";
            var n = number(value);
            return isFinite(n) ? string(n) : "1";
        };
        test.style.color = "rgba(0,0,0,0.5)";
        var rgba = /^rgba/.test(test.style.color);
        var parseColor = function(value, normalize) {
            if (value == null || value === "") return normalize ? "rgba(0,0,0,1)" : "";
            if (value == "transparent") return normalize ? "rgba(0,0,0,0)" : value;
            var c = color(value, true);
            if (!c) return normalize ? "rgba(0,0,0,1)" : "";
            if (c[3] === 0 && !rgba) return "transparent";
            return !normalize && (!rgba || c[3] === 1) ? "rgb(" + c.slice(0, 3) + ")" : "rgba(" + c + ")";
        };
        var parseLength = function(value, normalize, node) {
            if (value == null || value === "") return normalize ? "0px" : "";
            var match = string(value).match(rLengthRe);
            if (!match) return value;
            var value = number(match[1]), unit = match[2] || "px";
            if (value == 0) return value + unit;
            return node && unit !== "px" ? pixelRatio(node, unit) * value + "px" : value + unit;
        };
        var parseBorderStyle = function(value, normalize) {
            if (value == null || value === "") return normalize ? "none" : "";
            var match = value.match(borderStyleRe);
            return match ? value : normalize ? "none" : "";
        };
        var parseBorder = function(value, normalize, node) {
            var normalized = "0px none rgba(0,0,0,1)";
            if (value == null || value === "") return normalize ? normalized : "";
            if (value == 0 || value === "none") return normalize ? normalized : value;
            var c;
            value = value.replace(colorRe, function(match) {
                c = match;
                return "";
            });
            var s = value.match(borderStyleRe), l = value.match(rLengthRe);
            return clean([ parseLength(l ? l[0] : "", normalize, node), parseBorderStyle(s ? s[0] : "", normalize), parseColor(c, normalize) ].join(" "));
        };
        var parseShort4 = function(value, normalize, node) {
            if (value == null || value === "") return normalize ? "0px 0px 0px 0px" : "";
            return clean(mirror4(map(clean(value).split(" "), function(v) {
                return parseLength(v, normalize, node);
            })).join(" "));
        };
        var parseShadow = function(value, normalize, node, len) {
            var ncolor = "rgba(0,0,0,0)", normalized = len === 3 ? ncolor + " 0px 0px 0px" : ncolor + " 0px 0px 0px 0px";
            if (value == null || value === "") return normalize ? normalized : "";
            if (value === "none") return normalize ? normalized : value;
            var colors = [], value = clean(value).replace(colorRe, function(match) {
                colors.push(match);
                return "";
            });
            return map(value.split(","), function(shadow, i) {
                var c = parseColor(colors[i], normalize), inset = /inset/.test(shadow), lengths = shadow.match(rLengthReG) || [ "0px" ];
                lengths = map(lengths, function(m) {
                    return parseLength(m, normalize, node);
                });
                while (lengths.length < len) lengths.push("0px");
                var ret = inset ? [ "inset", c ] : [ c ];
                return ret.concat(lengths).join(" ");
            }).join(", ");
        };
        var parse = function(value, normalize, node) {
            if (value == null || value === "") return "";
            return value.replace(colorRe, function(match) {
                return parseColor(match, normalize);
            }).replace(lengthRe, function(match) {
                return parseLength(match, normalize, node);
            });
        };
        var getters = {}, setters = {}, parsers = {}, aliases = {};
        var getter = function(key) {
            return getters[key] || (getters[key] = function() {
                var alias = aliases[key] || key, parser = parsers[key] || parse;
                return function() {
                    return parser(compute(this)(alias), true, this);
                };
            }());
        };
        var setter = function(key) {
            return setters[key] || (setters[key] = function() {
                var alias = aliases[key] || key, parser = parsers[key] || parse;
                return function(value) {
                    this.style[alias] = parser(value);
                };
            }());
        };
        var trbl = [ "Top", "Right", "Bottom", "Left" ], tlbl = [ "TopLeft", "TopRight", "BottomRight", "BottomLeft" ];
        each(trbl, function(d) {
            var bd = "border" + d;
            each([ "margin" + d, "padding" + d, bd + "Width", d.toLowerCase() ], function(n) {
                parsers[n] = parseLength;
            });
            parsers[bd + "Color"] = parseColor;
            parsers[bd + "Style"] = parseBorderStyle;
            parsers[bd] = parseBorder;
            getters[bd] = function() {
                return [ getter(bd + "Width").call(this), getter(bd + "Style").call(this), getter(bd + "Color").call(this) ].join(" ");
            };
        });
        each(tlbl, function(d) {
            parsers["border" + d + "Radius"] = parseLength;
        });
        parsers.color = parsers.backgroundColor = parseColor;
        parsers.width = parsers.height = parsers.fontSize = parsers.backgroundSize = parseLength;
        each([ "margin", "padding" ], function(name) {
            parsers[name] = parseShort4;
            getters[name] = function() {
                return map(trbl, function(d) {
                    return getter(name + d).call(this);
                }, this).join(" ");
            };
        });
        parsers.borderWidth = parseShort4;
        parsers.borderStyle = function(value, normalize, node) {
            value = clean(value).split(" ");
            return clean(mirror4(map(value, function(v) {
                parseBorderStyle(v, normalize);
            })).join(" "));
        };
        parsers.borderColor = function(value, normalize) {
            value = string(value).match(colorRe);
            if (!value) return normalize ? mirror4([ "rgba(0,0,0,1)" ]).join(" ") : "";
            return clean(mirror4(map(value, function(v) {
                return parseColor(v, normalize);
            })).join(" "));
        };
        each([ "Width", "Style", "Color" ], function(name) {
            getters["border" + name] = function() {
                return map(trbl, function(d) {
                    return getter("border" + d + name).call(this);
                }, this).join(" ");
            };
        });
        parsers.borderRadius = parseShort4;
        getters.borderRadius = function() {
            return map(tlbl, function(d) {
                return getter("border" + d + "Radius").call(this);
            }, this).join(" ");
        };
        parsers.border = parseBorder;
        getters.border = function() {
            var pvalue;
            for (var i = 0; i < trbl.length; i++) {
                var value = getter("border" + trbl[i]).call(this);
                if (pvalue && value !== pvalue) return null;
                pvalue = value;
            }
            return value;
        };
        parsers.zIndex = parseString;
        var filterName = test.style.MsFilter != null ? "MsFilter" : test.style.filter != null ? "filter" : null;
        parsers.opacity = parseOpacity;
        if (filterName && test.style.opacity == null) {
            matchOp = /alpha\(opacity=([\d.]+)\)/i;
            setters.opacity = function(value) {
                value = (value = number(value) === 1) ? "" : "alpha(opacity=" + value * 100 + ")";
                var filter = compute(this)(filterName);
                return this.style[filterName] = matchOp.test(filter) ? filter.replace(matchOp, value) : filter + value;
            };
            getters.opacity = function() {
                var match = compute(this)(filterName).match(matchOp);
                return string(!match ? 1 : match[1] / 100);
            };
        }
        parsers.boxShadow = function(value, normalize, node) {
            return parseShadow(value, normalize, node, 4);
        };
        parsers.textShadow = function(value, normalize, node) {
            return parseShadow(value, normalize, node, 3);
        };
        var transitionName;
        each([ "WebkitTransition", "MozTransition", "transition" ], function(transition) {
            if (test.style[transition] != null) transitionName = transition;
        });
        aliases.transition = transitionName;
        var transitionEndName = transitionName === "MozTransition" ? "transitionend" : transitionName === "WebkitTransition" ? "webkitTransitionEnd" : "transitionEnd";
        each([ "MozTransform", "WebkitTransform", "OTransform", "msTransform", "transform" ], function(transform) {
            if (test.style[transform] != null) aliases.transform = transform;
        });
        var equations = {
            "default": "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
            linear: "cubic-bezier(0, 0, 1, 1)",
            "ease-in": "cubic-bezier(0.42, 0, 1.0, 1.0)",
            "ease-out": "cubic-bezier(0, 0, 0.58, 1.0)",
            "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1.0)"
        };
        equations.ease = equations["default"];
        var BrowserAnimation = function(node, property) {
            var _getter = getter(property), _setter = setter(property);
            this.get = function() {
                return _getter.call(node);
            };
            this.set = function(value) {
                return _setter.call(node, value);
            };
            this.node = node;
            this.property = property;
            this.parse = parsers[property] || parse;
        };
        BrowserAnimation.prototype.setOptions = function(options) {
            if (options == null) options = {};
            var duration = options.duration;
            if (!(this.duration = this.parseDuration(duration || "500ms"))) throw new Error(this.duration + " is not a valid duration");
            if (!(this.equation = this.parseEquation(options.equation || "default"))) throw new Error(this.equation + " is not a valid equation");
            this.callback = options.callback || function() {};
            return this;
        };
        BrowserAnimation.prototype.prepare = function(to) {
            if (this.duration === 0) {
                this.set(to);
                requestFrame(this.callback);
                return null;
            } else {
                var node = this.node, p = this.parse, fromParsed = this.get(), toParsed = p(to, true);
                if (p === parseLength || p === parseBorder || p === parseShort4) {
                    var toUnits = toParsed.match(lengthRe), i = 0;
                    if (toUnits) fromParsed = fromParsed.replace(lengthRe, function(fromMatch) {
                        var toMatch = toUnits[i++], fromValue = fromMatch.match(rLengthRe)[1], toUnit = toMatch.match(rLengthRe)[2];
                        return toUnit !== "px" ? fromValue / pixelRatio(node, toUnit) + toUnit : fromMatch;
                    });
                    if (i > 0) this.set(fromParsed);
                }
                if (fromParsed === toParsed) {
                    requestFrame(this.callback);
                    return null;
                } else {
                    return [ fromParsed, toParsed ];
                }
            }
        };
        BrowserAnimation.prototype.parseDuration = function(duration) {
            if (duration = string(duration).match(durationRe)) {
                var time = number(duration[1]), unit = duration[2] || "ms";
                if (unit === "s") return time * 1e3;
                if (unit === "ms") return time;
            }
            return null;
        };
        BrowserAnimation.prototype.parseEquation = function(equation) {
            equation = equations[equation] || equation;
            var match = equation.replace(whiteRe, "").match(cubicBezierRe);
            return match ? map(match.slice(1), number) : null;
        };
        var JSAnimation = inherits(BrowserAnimation, function(node, property) {
            this.parent.constructor.call(this, node, property);
            var self = this;
            this.bstep = function(t) {
                return self.step(t);
            };
        });
        var numbers = function(string) {
            var ns = [], replaced = string.replace(/[-.\d]+/g, function(n) {
                ns.push(number(n));
                return "@";
            });
            return [ ns, replaced ];
        };
        var calc = function(from, to, delta) {
            return (to - from) * delta + from;
        };
        JSAnimation.prototype.start = function(to) {
            var prepared = this.prepare(to), p = this.parse;
            if (prepared) {
                this.time = 0;
                var fromN = numbers(prepared[0]), toN = numbers(prepared[1]);
                if (fromN[0].length !== toN[0].length || (p === parsers.boxShadow || p === parsers.textShadow || p === parse) && fromN[1] !== toN[1]) {
                    this.set(to);
                    requestFrame(this.callback);
                    return null;
                }
                this.from = fromN[0];
                this.to = toN[0];
                this.template = toN[1];
                requestFrame(this.bstep);
            }
            return this;
        };
        JSAnimation.prototype.stop = function() {
            cancelFrame(this.bstep);
            return this;
        };
        JSAnimation.prototype.step = function(now) {
            this.time || (this.time = now);
            var factor = (now - this.time) / this.duration;
            if (factor > 1) factor = 1;
            var delta = this.equation(factor), tpl = this.template, from = this.from, to = this.to;
            for (var i = 0, l = from.length; i < l; i++) {
                var f = from[i], t = to[i];
                tpl = tpl.replace("@", t !== f ? calc(f, t, delta) : t);
            }
            this.set(tpl);
            if (factor !== 1) requestFrame(this.bstep); else this.callback(now);
        };
        JSAnimation.prototype.parseEquation = function(equation) {
            var equation = this.parent.parseEquation.call(this, equation);
            if (equation == [ 0, 0, 1, 1 ]) return function(x) {
                return x;
            };
            return bezier(equation[0], equation[1], equation[2], equation[3], 1e3 / 60 / this.duration / 4);
        };
        var CSSAnimation = inherits(BrowserAnimation, function(node, property) {
            this.parent.constructor.call(this, node, property);
            var self = this;
            this.bdefer = function(t) {
                return self.defer(t);
            };
            this.bcomplete = function(e) {
                return self.complete(e);
            };
            this.hproperty = hyphenate(aliases[property] || property);
        });
        CSSAnimation.prototype.start = function(to) {
            var prepared = this.prepare(to);
            if (prepared) {
                this.to = prepared[1];
                requestFrame(this.bdefer);
            }
            return this;
        };
        CSSAnimation.prototype.stop = function(hard) {
            if (this.running) {
                this.running = false;
                if (hard) this.set(this.get());
                this.clean();
            } else {
                cancelFrame(this.bdefer);
            }
            return this;
        };
        CSSAnimation.prototype.defer = function() {
            this.running = true;
            this.modCSS(true);
            this.node.addEventListener(transitionEndName, this.bcomplete, false);
            this.set(this.to);
            return null;
        };
        CSSAnimation.prototype.clean = function() {
            this.modCSS();
            this.node.removeEventListener(transitionEndName, this.bcomplete);
            return null;
        };
        CSSAnimation.prototype.complete = function(e) {
            if (e && e.propertyName === this.hproperty) {
                this.running = false;
                this.clean();
                this.callback(+(new Date));
            }
            return null;
        };
        var removeProp = function(prop, a, b, c) {
            var indexOf;
            for (var i = 0, l = a.length; i < l; i++) {
                if (a[i] !== prop) continue;
                indexOf = i;
                break;
            }
            if (indexOf != null) {
                a.splice(indexOf, 1);
                b.splice(indexOf, 1);
                c.splice(indexOf, 1);
            }
        };
        CSSAnimation.prototype.modCSS = function(inclusive) {
            var rules = compute(this.node), p = rules(transitionName + "Property").replace(whiteRe, "").split(","), d = rules(transitionName + "Duration").replace(whiteRe, "").split(","), e = rules(transitionName + "TimingFunction").replace(whiteRe, "").match(cubicBezierReG);
            removeProp("all", p, d, e);
            removeProp(this.hproperty, p, d, e);
            if (inclusive) {
                p.push(this.hproperty);
                d.push(this.duration);
                e.push(this.equation);
            }
            this.node.style[transitionName + "Property"] = p;
            this.node.style[transitionName + "Duration"] = d;
            this.node.style[transitionName + "TimingFunction"] = e;
        };
        CSSAnimation.prototype.parseDuration = function(duration) {
            return BrowserAnimation.prototype.parseDuration.call(this, duration) + "ms";
        };
        CSSAnimation.prototype.parseEquation = function(equation) {
            return "cubic-bezier(" + BrowserAnimation.prototype.parseEquation.call(this, equation) + ")";
        };
        var animations = {
            uid: 0,
            animations: {},
            retrieve: function(node, property) {
                var _base, _uid, uid = (_uid = node["µid"]) != null ? _uid : node["µid"] = (this.uid++).toString(36), animation = (_base = this.animations)[uid] || (_base[uid] = {});
                return animation[property] || (animation[property] = transitionName ? new CSSAnimation(node, property) : new JSAnimation(node, property));
            },
            starts: function(nodes, styles, options) {
                if (options == null) options = {};
                var type = typeof options;
                options = type === "function" ? {
                    callback: options
                } : type === "string" || type === "number" ? {
                    duration: options
                } : options;
                var callback = options.callback || function() {}, completed = 0, length = 0;
                options.callback = function(t) {
                    if (++completed === length) callback(t);
                };
                for (var property in styles) {
                    var value = styles[property], property = camelize(property);
                    for (var i = 0, l = nodes.length; i < l; i++) {
                        length++;
                        this.retrieve(nodes[i], property).setOptions(options).start(value);
                    }
                }
            },
            start: function(nodes, property, value, options) {
                var styles = {};
                styles[property] = value;
                return this.starts(nodes, styles, options);
            },
            sets: function(nodes, styles) {
                for (var property in styles) {
                    var value = styles[property], set = setter(property = camelize(property));
                    for (var i = 0, l = nodes.length; i < l; i++) {
                        var node = nodes[i], aid, apid;
                        if (aid = this.animations[node["µid"]]) {
                            if (apid = aid[property]) apid.stop(true);
                        }
                        set.call(node, value);
                    }
                }
                return this;
            },
            set: function(nodes, property, value) {
                var styles = {};
                styles[property] = value;
                return this.sets(nodes, styles);
            }
        };
        var mu = function(nod) {
            this.valueOf = function() {
                return nod;
            };
            return this;
        };
        var moofx = function(nod) {
            if (!nod) return null;
            return new mu(nod.length != null ? nod : nod.nodeType === 1 ? [ nod ] : []);
        };
        moofx.prototype = mu.prototype;
        moofx.prototype.animate = function(A, B, C) {
            if (typeof A !== "string") animations.starts(this.valueOf(), A, B); else animations.start(this.valueOf(), A, B, C);
            return this;
        };
        moofx.prototype.style = function(A, B) {
            if (typeof A !== "string") animations.sets(this.valueOf(), A); else animations.set(this.valueOf(), A, B);
            return this;
        };
        moofx.prototype.compute = function(A) {
            return getter(camelize(A)).call(this.valueOf()[0]);
        };
        moofx.parse = function(property, value, normalize, node) {
            if (!parsers[property = camelize(property)]) return null;
            return parsers[property](value, normalize, node);
        };
        module.exports = moofx;
    },
    "4": function(require, module, exports, global) {
        module.exports = function(x1, y1, x2, y2, epsilon) {
            var curveX = function(t) {
                var v = 1 - t;
                return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
            };
            var curveY = function(t) {
                var v = 1 - t;
                return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
            };
            var derivativeCurveX = function(t) {
                var v = 1 - t;
                return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (-t * t * t + 2 * v * t) * x2;
            };
            return function(t) {
                var x = t, t0, t1, t2, x2, d2, i;
                for (t2 = x, i = 0; i < 8; i++) {
                    x2 = curveX(t2) - x;
                    if (Math.abs(x2) < epsilon) return curveY(t2);
                    d2 = derivativeCurveX(t2);
                    if (Math.abs(d2) < 1e-6) break;
                    t2 = t2 - x2 / d2;
                }
                t0 = 0, t1 = 1, t2 = x;
                if (t2 < t0) return curveY(t0);
                if (t2 > t1) return curveY(t1);
                while (t0 < t1) {
                    x2 = curveX(t2);
                    if (Math.abs(x2 - x) < epsilon) return curveY(t2);
                    if (x > x2) t0 = t2; else t1 = t2;
                    t2 = (t1 - t0) * .5 + t0;
                }
                return curveY(t2);
            };
        };
    }
});