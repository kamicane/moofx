/*
---
provides: moofx
version: 3.0.6-1
description: A CSS3-enabled javascript animation library
homepage: http://moofx.it
author: Valerio Proietti <@kamicane> (http://mad4milk.net)
license: MIT (http://mootools.net/license.txt)
includes: cubic-bezier by Arian Stolwijk (https://github.com/arian/cubic-bezier)
...
*/

(function(modules) {
    "use strict";
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
    window["moofx"] = require("0");
})({
    "0": function(require, module, exports, global) {
        "use strict";
        var color = require("1"), frame = require("2");
        var moofx = typeof document !== "undefined" ? require("3") : {};
        moofx.requestFrame = function(callback) {
            frame.request(callback);
            return this;
        };
        moofx.cancelFrame = function(callback) {
            frame.cancel(callback);
            return this;
        };
        moofx.color = color;
        module.exports = moofx;
    },
    "1": function(require, module, exports, global) {
        "use strict";
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
            gray: "#808080",
            transparent: "#0000"
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
            for (var i = 0, l = hex.length; i < l; i += 2) rgb.push(parseInt(hex.substr(i, 2), 16) / (i === 6 ? 255 : 1));
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
        var keys = [];
        for (var c in colors) keys.push(c);
        var shex = "(?:#([a-f0-9]{3,8}))", sval = "\\s*([.\\d%]+)\\s*", sop = "(?:,\\s*([.\\d]+)\\s*)?", slist = "\\(" + [ sval, sval, sval ] + sop + "\\)", srgb = "(?:rgb)a?", shsl = "(?:hsl)a?", skeys = "(" + keys.join("|") + ")";
        var xhex = RegExp(shex,"i"), xrgb = RegExp(srgb + slist,"i"), xhsl = RegExp(shsl + slist,"i");
        var color = function(input, array) {
            if (input == null) return null;
            input = (input + "").replace(/\s+/, "");
            var match = colors[input];
            if (match) {
                return color(match, array);
            } else if (match = input.match(xhex)) {
                input = HEXtoRGB(match[1]);
            } else if (match = input.match(xrgb)) {
                input = match.slice(1);
            } else if (match = input.match(xhsl)) {
                input = HSLtoRGB.apply(null, match.slice(1));
            } else return null;
            if (!(input && (input = RGBtoRGB.apply(null, input)))) return null;
            if (array) return input;
            if (input[3] === 1) input.splice(3, 1);
            return "rgb" + (input.length === 4 ? "a" : "") + "(" + input + ")";
        };
        color.x = RegExp([ skeys, shex, srgb + slist, shsl + slist ].join("|"), "gi");
        module.exports = color;
    },
    "2": function(require, module, exports, global) {
        "use strict";
        var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame || global.msRequestAnimationFrame || function(callback) {
            return setTimeout(callback, 1e3 / 60);
        };
        var callbacks = [], running = false;
        var iterator = function(time) {
            if (time == null) time = +(new Date);
            running = false;
            for (var i = callbacks.length; i--; ) {
                var callback = callbacks.shift();
                if (callback) callback(time);
            }
        };
        var cancel = function(match) {
            for (var i = callbacks.length; i--; ) if (callbacks[i] === match) {
                callbacks.splice(i, 1);
                break;
            }
        };
        var request = function(callback) {
            callbacks.push(callback);
            if (!running) {
                running = true;
                requestFrame(iterator);
            }
            return function() {
                cancel(callback);
            };
        };
        exports.request = request;
        exports.cancel = cancel;
    },
    "3": function(require, module, exports, global) {
        "use strict";
        var color = require("1"), frame = require("2");
        var cancelFrame = frame.cancel, requestFrame = frame.request;
        var bezier = require("4");
        var prime = require("5"), array = require("6"), string = require("8");
        var camelize = string.camelize, hyphenate = string.hyphenate, clean = string.clean, capitalize = string.capitalize;
        var map = array.map, each = array.forEach, indexOf = array.indexOf;
        var nodes = require("a");
        var round = function(number) {
            return +(+number).toPrecision(3);
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
        var sLength = "([-.\\d]+)(%|cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vm)", sLengthLax = "([-.\\d]+)([\\w%]+)?", sBorderStyle = "none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit", sCubicBezier = "cubic-bezier\\(([-.\\d]+),([-.\\d]+),([-.\\d]+),([-.\\d]+)\\)", sDuration = "([\\d.]+)(s|ms)?";
        var rgLength = RegExp(sLength, "g"), rLengthLax = RegExp(sLengthLax), rgLengthLax = RegExp(sLengthLax, "g"), rBorderStyle = RegExp(sBorderStyle), rCubicBezier = RegExp(sCubicBezier), rgCubicBezier = RegExp(sCubicBezier, "g"), rDuration = RegExp(sDuration);
        var parseString = function(value) {
            return value == null ? "" : value + "";
        };
        var parseOpacity = function(value, normalize) {
            if (value == null || value === "") return normalize ? "1" : "";
            var number = +value;
            return isFinite(number) ? number + "" : "1";
        };
        try {
            test.style.color = "rgba(0,0,0,0.5)";
        } catch (e) {}
        var rgba = /^rgba/.test(test.style.color);
        var parseColor = function(value, normalize) {
            if (!value) return normalize ? "rgba(0,0,0,1)" : "";
            if (value === "transparent") return normalize ? "rgba(0,0,0,0)" : value;
            var c = color(value, true);
            if (!c) return normalize ? "rgba(0,0,0,1)" : "";
            if (c[3] === 0 && !rgba) return "transparent";
            return !normalize && (!rgba || c[3] === 1) ? "rgb(" + c.slice(0, 3) + ")" : "rgba(" + c + ")";
        };
        var parseLength = function(value, normalize, node) {
            if (value == null || value === "") return normalize ? "0px" : "";
            var match = string.match(value, rLengthLax);
            if (!match) return value;
            var value = +match[1], unit = match[2] || "px";
            if (value === 0) return value + unit;
            return node && unit !== "px" ? round(pixelRatio(node, unit) * value) + "px" : value + unit;
        };
        var parseBorderStyle = function(value, normalize) {
            if (value == null || value === "") return normalize ? "none" : "";
            var match = value.match(rBorderStyle);
            return match ? value : normalize ? "none" : "";
        };
        var parseBorder = function(value, normalize, node) {
            var normalized = "0px none rgba(0,0,0,1)";
            if (value == null || value === "") return normalize ? normalized : "";
            if (value === 0 || value === "none") return normalize ? normalized : value;
            var c;
            value = value.replace(color.x, function(match) {
                c = match;
                return "";
            });
            var s = value.match(rBorderStyle), l = value.match(rgLengthLax);
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
            var colors = [], value = clean(value).replace(color.x, function(match) {
                colors.push(match);
                return "";
            });
            return map(value.split(","), function(shadow, i) {
                var c = parseColor(colors[i], normalize), inset = /inset/.test(shadow), lengths = shadow.match(rgLengthLax) || [ "0px" ];
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
            return value.replace(color.x, function(match) {
                return parseColor(match, normalize);
            }).replace(rgLength, function(match) {
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
            if (value == null || value === "") return normalize ? mirror4([ "none" ]).join(" ") : "";
            value = clean(value).split(" ");
            return clean(mirror4(map(value, function(v) {
                parseBorderStyle(v, normalize);
            })).join(" "));
        };
        parsers.borderColor = function(value, normalize) {
            if (!value || !(value = string.match(value, color.x))) return normalize ? mirror4([ "rgba(0,0,0,1)" ]).join(" ") : "";
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
            return pvalue;
        };
        parsers.zIndex = parseString;
        var filterName = test.style.MsFilter != null ? "MsFilter" : test.style.filter != null ? "filter" : null;
        parsers.opacity = parseOpacity;
        if (filterName && test.style.opacity == null) {
            var matchOp = /alpha\(opacity=([\d.]+)\)/i;
            setters.opacity = function(value) {
                value = (value = +value) === 1 ? "" : "alpha(opacity=" + value * 100 + ")";
                var filter = compute(this)(filterName);
                return this.style[filterName] = matchOp.test(filter) ? filter.replace(matchOp, value) : filter + value;
            };
            getters.opacity = function() {
                var match = compute(this)(filterName).match(matchOp);
                return (!match ? 1 : match[1] / 100) + "";
            };
        }
        var parseBoxShadow = parsers.boxShadow = function(value, normalize, node) {
            return parseShadow(value, normalize, node, 4);
        };
        var parseTextShadow = parsers.textShadow = function(value, normalize, node) {
            return parseShadow(value, normalize, node, 3);
        };
        each([ "Webkit", "Moz", "O", "ms", null ], function(prefix) {
            each([ "transition", "transform", "transformOrigin", "transformStyle", "perspective", "perspectiveOrigin", "backfaceVisibility" ], function(style) {
                var cc = prefix ? prefix + capitalize(style) : style;
                if (test.style[cc] != null) aliases[style] = cc;
            });
        });
        var transitionName = aliases.transition;
        var equations = {
            "default": "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
            linear: "cubic-bezier(0, 0, 1, 1)",
            "ease-in": "cubic-bezier(0.42, 0, 1.0, 1.0)",
            "ease-out": "cubic-bezier(0, 0, 0.58, 1.0)",
            "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1.0)"
        };
        equations.ease = equations["default"];
        var BrowserAnimation = prime({
            constructor: function BrowserAnimation(node, property) {
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
                var self = this;
                this.bExit = function(time) {
                    self.exit(time);
                };
            },
            setOptions: function(options) {
                if (options == null) options = {};
                var duration = options.duration;
                if (!(this.duration = this.parseDuration(duration || "500ms"))) throw new Error(this.duration + " is not a valid duration");
                if (!(this.equation = this.parseEquation(options.equation || "default"))) throw new Error(this.equation + " is not a valid equation");
                this.callback = options.callback || function() {};
                return this;
            },
            exit: function(time) {
                if (this.exitValue != null) this.set(this.exitValue);
                this.cancelExit = null;
                this.callback(time);
                return null;
            },
            prepare: function(to) {
                this.exitValue = null;
                if (this.duration === 0) {
                    this.exitValue = to;
                    this.cancelExit = requestFrame(this.bExit);
                } else {
                    var node = this.node, p = this.parse, fromParsed = this.get(), toParsed = p(to, true);
                    if (p === parseLength || p === parseBorder || p === parseShort4) {
                        var toUnits = toParsed.match(rgLength), i = 0;
                        if (toUnits) fromParsed = fromParsed.replace(rgLength, function(fromMatch) {
                            var toMatch = toUnits[i++], fromValue = fromMatch.match(rLengthLax)[1], toUnit = toMatch.match(rLengthLax)[2];
                            return toUnit !== "px" ? round(fromValue / pixelRatio(node, toUnit)) + toUnit : fromMatch;
                        });
                        if (i > 0) this.set(fromParsed);
                    }
                    if (fromParsed === toParsed) {
                        this.cancelExit = requestFrame(this.bExit);
                    } else {
                        return [ fromParsed, toParsed ];
                    }
                }
            },
            parseDuration: function(duration) {
                if (duration = string.match(duration, rDuration)) {
                    var time = +duration[1], unit = duration[2] || "ms";
                    if (unit === "s") return time * 1e3;
                    if (unit === "ms") return time;
                }
                return null;
            },
            parseEquation: function(equation) {
                equation = equations[equation] || equation;
                var match = equation.replace(/\s+/g, "").match(rCubicBezier);
                return match ? map(match.slice(1), function(v) {
                    return +v;
                }) : null;
            }
        });
        var divide = function(string) {
            var numbers = [];
            string = string.replace(/[-.\d]+/g, function(number) {
                numbers.push(+number);
                return "@";
            });
            return [ numbers, string ];
        };
        var calc = function(from, to, delta) {
            return (to - from) * delta + from;
        };
        var JSAnimation = prime({
            inherits: BrowserAnimation,
            constructor: function JSAnimation(node, property) {
                JSAnimation.parent.constructor.call(this, node, property);
                var self = this;
                this.bStep = function(t) {
                    return self.step(t);
                };
            },
            start: function(to) {
                this.stop();
                var prepared = this.prepare(to), p = this.parse;
                if (prepared) {
                    this.time = 0;
                    var from_ = divide(prepared[0]), to_ = divide(prepared[1]);
                    if (from_[0].length !== to_[0].length || (p === parseBoxShadow || p === parseTextShadow || p === parse) && from_[1] !== to_[1]) {
                        this.exit(to);
                    } else {
                        this.from = from_[0];
                        this.to = to_[0];
                        this.template = to_[1];
                        this.cancelStep = requestFrame(this.bStep);
                    }
                }
                return this;
            },
            stop: function() {
                if (this.cancelExit) this.cancelExit = this.cancelExit(); else if (this.cancelStep) this.cancelStep = this.cancelStep();
                return this;
            },
            step: function(now) {
                this.time || (this.time = now);
                var factor = (now - this.time) / this.duration;
                if (factor > 1) factor = 1;
                var delta = this.equation(factor), tpl = this.template, from = this.from, to = this.to;
                for (var i = 0, l = from.length; i < l; i++) {
                    var f = from[i], t = to[i];
                    tpl = tpl.replace("@", t !== f ? calc(f, t, delta) : t);
                }
                this.set(tpl);
                if (factor !== 1) this.cancelStep = requestFrame(this.bStep); else {
                    this.cancelStep = null;
                    this.callback(now);
                }
            },
            parseEquation: function(equation) {
                var equation = JSAnimation.parent.parseEquation.call(this, equation);
                if (equation == [ 0, 0, 1, 1 ]) return function(x) {
                    return x;
                };
                return bezier(equation[0], equation[1], equation[2], equation[3], 1e3 / 60 / this.duration / 4);
            }
        });
        var remove3 = function(value, a, b, c) {
            var index = indexOf(a, value);
            if (index !== -1) {
                a.splice(index, 1);
                b.splice(index, 1);
                c.splice(index, 1);
            }
        };
        var CSSAnimation = prime({
            inherits: BrowserAnimation,
            constructor: function CSSAnimation(node, property) {
                CSSAnimation.parent.constructor.call(this, node, property);
                this.hproperty = hyphenate(aliases[property] || property);
                var self = this;
                this.bSetTransitionCSS = function(time) {
                    self.setTransitionCSS(time);
                };
                this.bSetStyleCSS = function(time) {
                    self.setStyleCSS(time);
                };
                this.bComplete = function() {
                    self.complete();
                };
            },
            start: function(to) {
                this.stop();
                var prepared = this.prepare(to);
                if (prepared) {
                    this.to = prepared[1];
                    this.cancelSetTransitionCSS = requestFrame(this.bSetTransitionCSS);
                }
                return this;
            },
            setTransitionCSS: function() {
                this.cancelSetTransitionCSS = null;
                this.resetCSS(true);
                this.cancelSetStyleCSS = requestFrame(this.bSetStyleCSS);
            },
            setStyleCSS: function(time) {
                this.cancelSetStyleCSS = null;
                var duration = this.duration;
                this.cancelComplete = setTimeout(this.bComplete, duration);
                this.endTime = time + duration;
                this.set(this.to);
            },
            complete: function() {
                this.cancelComplete = null;
                this.resetCSS();
                this.callback(this.endTime);
                return null;
            },
            stop: function(hard) {
                if (this.cancelExit) this.cancelExit = this.cancelExit(); else if (this.cancelSetTransitionCSS) {
                    this.cancelSetTransitionCSS = this.cancelSetTransitionCSS();
                } else if (this.cancelSetStyleCSS) {
                    this.cancelSetStyleCSS = this.cancelSetStyleCSS();
                    if (hard) this.resetCSS();
                } else if (this.cancelComplete) {
                    this.cancelComplete = clearTimeout(this.cancelComplete);
                    if (hard) {
                        this.resetCSS();
                        this.set(this.get());
                    }
                }
                return this;
            },
            resetCSS: function(inclusive) {
                var rules = compute(this.node), properties = rules(transitionName + "Property").replace(/\s+/g, "").split(","), durations = rules(transitionName + "Duration").replace(/\s+/g, "").split(","), equations = rules(transitionName + "TimingFunction").replace(/\s+/g, "").match(rgCubicBezier);
                remove3("all", properties, durations, equations);
                remove3(this.hproperty, properties, durations, equations);
                if (inclusive) {
                    properties.push(this.hproperty);
                    durations.push(this.duration + "ms");
                    equations.push("cubic-bezier(" + this.equation + ")");
                }
                var nodeStyle = this.node.style;
                nodeStyle[transitionName + "Property"] = properties;
                nodeStyle[transitionName + "Duration"] = durations;
                nodeStyle[transitionName + "TimingFunction"] = equations;
            }
        });
        var BaseAnimation = transitionName ? CSSAnimation : JSAnimation;
        var UID = 0;
        var animations = {};
        var moofx = nodes.implement({
            animate: function(A, B, C) {
                var styles = A, options = B;
                if (typeof A === "string") {
                    styles = {};
                    styles[A] = B;
                    options = C;
                }
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
                    this.handle(function(node) {
                        length++;
                        var anims = this._animations || (this._animations = {});
                        var anim = anims[property] || (anims[property] = new BaseAnimation(node, property));
                        anim.setOptions(options).start(value);
                    });
                }
            },
            style: function(A, B) {
                var styles = A;
                if (typeof A === "string") {
                    styles = {};
                    styles[A] = B;
                }
                for (var property in styles) {
                    var value = styles[property], set = setter(property = camelize(property));
                    this.handle(function(node) {
                        var anims = this._animations, anim;
                        if (anims && (anim = anims[property])) anim.stop(true);
                        set.call(node, value);
                    });
                }
                return this;
            },
            compute: function(property) {
                return getter(camelize(property)).call(this.node());
            }
        });
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
    },
    "5": function(require, module, exports, global) {
        "use strict";
        var has = function(self, key) {
            return Object.hasOwnProperty.call(self, key);
        };
        var each = function(object, method, context) {
            for (var key in object) if (method.call(context, object[key], key, object) === false) break;
            return object;
        };
        var create = Object.create || function(self) {
            var F = function() {};
            F.prototype = self;
            return new F;
        };
        var mutator = function(key, value) {
            this.prototype[key] = value;
        };
        var implement = function(obj) {
            each(obj, function(value, key) {
                if (key !== "constructor" && key !== "inherits" && key !== "mutator") this.mutator(key, value);
            }, this);
            return this;
        };
        var prime = function(proto) {
            var superprime = proto.inherits, superproto;
            if (superprime) superproto = superprime.prototype;
            var constructor = has(proto, "constructor") ? proto.constructor : superprime ? function() {
                return superproto.constructor.apply(this, arguments);
            } : function() {};
            if (superprime) {
                var cproto = constructor.prototype = create(superproto);
                constructor.parent = superproto;
                cproto.constructor = constructor;
            }
            constructor.mutator = proto.mutator || superprime && superprime.mutator || mutator;
            constructor.implement = implement;
            return constructor.implement(proto);
        };
        prime.each = each;
        prime.has = has;
        prime.create = create;
        module.exports = prime;
    },
    "6": function(require, module, exports, global) {
        "use strict";
        var shell = require("7");
        var proto = Array.prototype;
        var array = shell({
            filter: proto.filter,
            indexOf: proto.indexOf || function(item, from) {
                for (var l = this.length >>> 0, i = from < 0 ? Math.max(0, l + from) : from || 0; i < l; i++) {
                    if (i in this && this[i] === item) return i;
                }
                return -1;
            },
            map: proto.map || function(fn, context) {
                var length = this.length >>> 0, results = Array(length);
                for (var i = 0, l = length; i < l; i++) {
                    if (i in this) results[i] = fn.call(context, this[i], i, this);
                }
                return results;
            },
            forEach: proto.forEach || function(fn, context) {
                for (var i = 0, l = this.length >>> 0; i < l; i++) {
                    if (i in this) fn.call(context, this[i], i, this);
                }
            },
            every: proto.every,
            some: proto.some
        });
        array.isArray = Array.isArray;
        var methods = {};
        var names = "pop,push,reverse,shift,sort,splice,unshift,concat,join,slice,lastIndexOf,reduce,reduceRight".split(",");
        for (var i = 0, name, method; name = names[i++]; ) if (method = proto[name]) methods[name] = method;
        array.implement(methods);
        module.exports = array;
    },
    "7": function(require, module, exports, global) {
        "use strict";
        var prime = require("5"), slice = Array.prototype.slice;
        var shell = prime({
            mutator: function(key, method) {
                this[key] = function(self) {
                    var args = arguments.length > 1 ? slice.call(arguments, 1) : [];
                    return method.apply(self, args);
                };
                this.prototype[key] = method;
            },
            constructor: {
                prototype: {}
            }
        });
        module.exports = function(proto) {
            var inherits = proto.inherits || (proto.inherits = shell);
            proto.constructor = prime.create(inherits);
            return prime(proto);
        };
    },
    "8": function(require, module, exports, global) {
        "use strict";
        var shell = require("7");
        var string = shell({
            inherits: require("9"),
            clean: function() {
                return string.trim((this + "").replace(/\s+/g, " "));
            },
            camelize: function() {
                return (this + "").replace(/-\D/g, function(match) {
                    return match.charAt(1).toUpperCase();
                });
            },
            hyphenate: function() {
                return (this + "").replace(/[A-Z]/g, function(match) {
                    return "-" + match.toLowerCase();
                });
            },
            capitalize: function() {
                return (this + "").replace(/\b[a-z]/g, function(match) {
                    return match.toUpperCase();
                });
            }
        });
        module.exports = string;
    },
    "9": function(require, module, exports, global) {
        "use strict";
        var shell = require("7");
        var proto = String.prototype;
        var string = shell({
            trim: proto.trim || function() {
                return (this + "").replace(/^\s+|\s+$/g, "");
            }
        });
        var methods = {};
        var names = "charAt,charCodeAt,concat,indexOf,lastIndexOf,match,quote,replace,search,slice,split,substr,substring,toLowerCase,toUpperCase".split(",");
        for (var i = 0, name, method; name = names[i++]; ) if (method = proto[name]) methods[name] = method;
        string.implement(methods);
        module.exports = string;
    },
    a: function(require, module, exports, global) {
        "use strict";
        var prime = require("5");
        var uniqueIndex = 0;
        var uniqueID = function(n) {
            return n === global ? "global" : n.uniqueNumber || (n.uniqueNumber = "n:" + (uniqueIndex++).toString(36));
        };
        var key = "n:" + Math.floor(Math.random() * (1295 - 36 + 1) + 36).toString(36);
        var instances = {};
        var $ = prime({
            constructor: function(n, context) {
                if (n == null) return null;
                if (n.nodeType || n === global) {
                    var uid = uniqueID(n);
                    return instances[uid] || (instances[uid] = new Node(n));
                }
                if (n[key]) return n;
                var clean;
                if (typeof n === "string") {
                    n = $.select(n, context);
                    clean = true;
                }
                if (n && n.length) {
                    if (!clean) {
                        var a = [], u = {};
                        for (var i = 0, l = n.length; i < l; i++) {
                            var instance = $(n[i]), nodes;
                            if (instance && (nodes = instance[key])) {
                                for (var j = 0, k = nodes.length; j < k; j++) {
                                    var node = nodes[j], uid = uniqueID(node);
                                    if (!u[uid]) {
                                        a.push(node);
                                        u[uid] = true;
                                    }
                                }
                            }
                        }
                        if (!a.length) return null;
                        n = a;
                    }
                    return n.length === 1 ? $(n[0]) : new Nodes(n);
                }
                return null;
            }
        });
        $.select = function(expression, context) {
            if (!context) context = document;
            var results, length;
            if (context.querySelectorAll && (results = context.querySelectorAll(expression)) && (length = results && results.length)) {
                var nodes = [];
                for (var i = 0; i < length; i++) nodes[i] = results[i];
                return nodes;
            }
            return null;
        };
        var Node = prime({
            inherits: $,
            constructor: function Node(node) {
                this[key] = [ node ];
            },
            node: function(i) {
                var node = this[key][i || 0];
                return node || null;
            },
            nodes: function(begin, end) {
                return this[key].slice(begin, end);
            },
            count: function() {
                return this[key].length;
            },
            handle: function(method) {
                var buffer = [], node = this[key][0];
                var res = method.call(this, node, 0, buffer);
                if (res != null && res !== false && res !== true) buffer.push(res);
                return buffer;
            }
        });
        var Nodes = prime({
            inherits: Node,
            constructor: function Nodes(nodes) {
                this[key] = nodes;
            },
            handle: function(method) {
                var buffer = [], nodes = this[key];
                for (var i = 0, l = nodes.length; i < l; i++) {
                    var node = nodes[i], res = method.call($(node), node, i, buffer);
                    if (res === false || res === true) break;
                    if (res != null) buffer.push(res);
                }
                return buffer;
            }
        });
        module.exports = $;
    }
});