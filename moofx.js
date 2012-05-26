/*
---
provides: moofx
version: 3.0.11
description: A CSS3-enabled javascript animation library
homepage: http://moofx.it
author: Valerio Proietti <@kamicane> (http://mad4milk.net)
license: MIT (http://mootools.net/license.txt)
includes: cubic-bezier by Arian Stolwijk (https://github.com/arian/cubic-bezier)
...
*/

(function(modules) {
    var cache = {}, require = function(id) {
        var module = cache[id];
        if (!module) {
            module = cache[id] = {};
            var exports = module.exports = {};
            modules[id].call(exports, require, module, exports, window);
        }
        return module.exports;
    };
    window["moofx"] = require("0");
})({
    "0": function(require, module, exports, global) {
        "use strict";
        var color = require("1"), frame = require("2");
        var moofx = typeof document !== "undefined" ? require("3") : require("a");
        moofx.version = "3.0.10";
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
            if (a == null || a === "") a = 1;
            r = parseFloat(r);
            g = parseFloat(g);
            b = parseFloat(b);
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
            if (a == null || a === "") a = 1;
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
        var xhex = RegExp(shex, "i"), xrgb = RegExp(srgb + slist, "i"), xhsl = RegExp(shsl + slist, "i");
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
        var prime = require("4"), array = require("5"), string = require("7");
        var camelize = string.camelize, clean = string.clean, capitalize = string.capitalize;
        var map = array.map, each = array.forEach, indexOf = array.indexOf;
        var nodes = require("9");
        var fx = require("a");
        var hyphenated = {};
        var hyphenate = function(self) {
            return hyphenated[self] || (hyphenated[self] = string.hyphenate(self));
        };
        var round = function(n) {
            return Math.round(n * 1e3) / 1e3;
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
        var sLength = "([-.\\d]+)(%|cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vm)", sLengthNum = sLength + "?", sBorderStyle = "none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit";
        var rgLength = RegExp(sLength, "g"), rLengthNum = RegExp(sLengthNum), rgLengthNum = RegExp(sLengthNum, "g"), rBorderStyle = RegExp(sBorderStyle);
        var parseString = function(value) {
            return value == null ? "" : value + "";
        };
        var parseOpacity = function(value, normalize) {
            if (value == null || value === "") return normalize ? "1" : "";
            return isFinite(value = +value) ? value < 0 ? "0" : value + "" : "1";
        };
        try {
            test.style.color = "rgba(0,0,0,0.5)";
        } catch (e) {}
        var rgba = /^rgba/.test(test.style.color);
        var parseColor = function(value, normalize) {
            var black = "rgba(0,0,0,1)", c;
            if (!value || !(c = color(value, true))) return normalize ? black : "";
            if (normalize) return "rgba(" + c + ")";
            var alpha = c[3];
            if (alpha === 0) return "transparent";
            return !rgba || alpha === 1 ? "rgb(" + c.slice(0, 3) + ")" : "rgba(" + c + ")";
        };
        var parseLength = function(value, normalize) {
            if (value == null || value === "") return normalize ? "0px" : "";
            var match = string.match(value, rLengthNum);
            return match ? match[1] + (match[2] || "px") : value;
        };
        var parseBorderStyle = function(value, normalize) {
            if (value == null || value === "") return normalize ? "none" : "";
            var match = value.match(rBorderStyle);
            return match ? value : normalize ? "none" : "";
        };
        var parseBorder = function(value, normalize) {
            var normalized = "0px none rgba(0,0,0,1)";
            if (value == null || value === "") return normalize ? normalized : "";
            if (value === 0 || value === "none") return normalize ? normalized : value + "";
            var c;
            value = value.replace(color.x, function(match) {
                c = match;
                return "";
            });
            var s = value.match(rBorderStyle), l = value.match(rgLengthNum);
            return clean([ parseLength(l ? l[0] : "", normalize), parseBorderStyle(s ? s[0] : "", normalize), parseColor(c, normalize) ].join(" "));
        };
        var parseShort4 = function(value, normalize) {
            if (value == null || value === "") return normalize ? "0px 0px 0px 0px" : "";
            return clean(mirror4(map(clean(value).split(" "), function(v) {
                return parseLength(v, normalize);
            })).join(" "));
        };
        var parseShadow = function(value, normalize, len) {
            var transparent = "rgba(0,0,0,0)", normalized = len === 3 ? transparent + " 0px 0px 0px" : transparent + " 0px 0px 0px 0px";
            if (value == null || value === "") return normalize ? normalized : "";
            if (value === "none") return normalize ? normalized : value;
            var colors = [], value = clean(value).replace(color.x, function(match) {
                colors.push(match);
                return "";
            });
            return map(value.split(","), function(shadow, i) {
                var c = parseColor(colors[i], normalize), inset = /inset/.test(shadow), lengths = shadow.match(rgLengthNum) || [ "0px" ];
                lengths = map(lengths, function(m) {
                    return parseLength(m, normalize);
                });
                while (lengths.length < len) lengths.push("0px");
                var ret = inset ? [ "inset", c ] : [ c ];
                return ret.concat(lengths).join(" ");
            }).join(", ");
        };
        var parse = function(value, normalize) {
            if (value == null || value === "") return "";
            return value.replace(color.x, function(match) {
                return parseColor(match, normalize);
            }).replace(rgLength, function(match) {
                return parseLength(match, normalize);
            });
        };
        var getters = {}, setters = {}, parsers = {}, aliases = {};
        var getter = function(key) {
            return getters[key] || (getters[key] = function() {
                var alias = aliases[key] || key, parser = parsers[key] || parse;
                return function() {
                    return parser(compute(this)(alias), true);
                };
            }());
        };
        var setter = function(key) {
            return setters[key] || (setters[key] = function() {
                var alias = aliases[key] || key, parser = parsers[key] || parse;
                return function(value) {
                    this.style[alias] = parser(value, false);
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
        parsers.borderStyle = function(value, normalize) {
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
        parsers.opacity = parseOpacity;
        var filterName = test.style.MsFilter != null && "MsFilter" || test.style.filter != null && "filter";
        if (filterName && test.style.opacity == null) {
            var matchOp = /alpha\(opacity=([\d.]+)\)/i;
            setters.opacity = function(value) {
                value = (value = parseOpacity(value)) === "1" ? "" : "alpha(opacity=" + Math.round(value * 100) + ")";
                var filter = compute(this)(filterName);
                return this.style[filterName] = matchOp.test(filter) ? filter.replace(matchOp, value) : filter + " " + value;
            };
            getters.opacity = function() {
                var match = compute(this)(filterName).match(matchOp);
                return (!match ? 1 : match[1] / 100) + "";
            };
        }
        var parseBoxShadow = parsers.boxShadow = function(value, normalize) {
            return parseShadow(value, normalize, 4);
        };
        var parseTextShadow = parsers.textShadow = function(value, normalize) {
            return parseShadow(value, normalize, 3);
        };
        each([ "Webkit", "Moz", "ms", "O", null ], function(prefix) {
            each([ "transition", "transform", "transformOrigin", "transformStyle", "perspective", "perspectiveOrigin", "backfaceVisibility" ], function(style) {
                var cc = prefix ? prefix + capitalize(style) : style;
                if (prefix === "ms") hyphenated[cc] = "-ms-" + hyphenate(style);
                if (test.style[cc] != null) aliases[style] = cc;
            });
        });
        var transitionName = aliases.transition, transformName = aliases.transform;
        if (transitionName === "OTransition") transitionName = null;
        var parseTransform2d, Transform2d;
        if (!transitionName && transformName) (function() {
            var unmatrix = require("c");
            var v = "\\s*([-\\d\\w.]+)\\s*";
            var rMatrix = RegExp("matrix\\(" + [ v, v, v, v, v, v ] + "\\)");
            var decomposeMatrix = function(matrix) {
                var d = unmatrix.apply(null, matrix.match(rMatrix).slice(1));
                return [ "translate(" + map(d[0], function(v) {
                    return round(v) + "px";
                }) + ")", "rotate(" + round(d[1] * 180 / Math.PI) + "deg)", "skewX(" + round(d[2] * 180 / Math.PI) + "deg)", "scale(" + map(d[3], round) + ")" ].join(" ");
            };
            var def0px = function(value) {
                return value || "0px";
            }, def1 = function(value) {
                return value || "1";
            }, def0deg = function(value) {
                return value || "0deg";
            };
            var transforms = {
                translate: function(value) {
                    if (!value) value = "0px,0px";
                    var values = value.split(",");
                    if (!values[1]) values[1] = "0px";
                    return map(values, clean) + "";
                },
                translateX: def0px,
                translateY: def0px,
                scale: function(value) {
                    if (!value) value = "1,1";
                    var values = value.split(",");
                    if (!values[1]) values[1] = values[0];
                    return map(values, clean) + "";
                },
                scaleX: def1,
                scaleY: def1,
                rotate: def0deg,
                skewX: def0deg,
                skewY: def0deg
            };
            Transform2d = prime({
                constructor: function(transform) {
                    var names = this.names = [];
                    var values = this.values = [];
                    transform.replace(/(\w+)\(([-.\d\s\w,]+)\)/g, function(match, name, value) {
                        names.push(name);
                        values.push(value);
                    });
                },
                identity: function() {
                    var functions = [];
                    each(this.names, function(name) {
                        var fn = transforms[name];
                        if (fn) functions.push(name + "(" + fn() + ")");
                    });
                    return functions.join(" ");
                },
                sameType: function(transformObject) {
                    return this.names.toString() === transformObject.names.toString();
                },
                decompose: function() {
                    var transform = this.toString();
                    test.style.cssText = cssText + hyphenate(transformName) + ":" + transform + ";";
                    document.body.appendChild(test);
                    var m = compute(test)(transformName);
                    if (!m || m === "none") m = "matrix(1, 0, 0, 1, 0, 0)";
                    document.body.removeChild(test);
                    return decomposeMatrix(m);
                }
            });
            Transform2d.prototype.toString = function(clean) {
                var values = this.values, functions = [];
                each(this.names, function(name, i) {
                    var fn = transforms[name];
                    if (!fn) return;
                    var value = fn(values[i]);
                    if (!clean || value !== fn()) functions.push(name + "(" + value + ")");
                });
                return functions.length ? functions.join(" ") : "none";
            };
            Transform2d.union = function(from, to) {
                if (from === to) return;
                var fromMap, toMap;
                if (from === "none") {
                    toMap = new Transform2d(to);
                    to = toMap.toString();
                    from = toMap.identity();
                    fromMap = new Transform2d(from);
                } else if (to === "none") {
                    fromMap = new Transform2d(from);
                    from = fromMap.toString();
                    to = fromMap.identity();
                    toMap = new Transform2d(to);
                } else {
                    fromMap = new Transform2d(from);
                    from = fromMap.toString();
                    toMap = new Transform2d(to);
                    to = toMap.toString();
                }
                if (from === to) return;
                if (!fromMap.sameType(toMap)) {
                    from = fromMap.decompose();
                    to = toMap.decompose();
                }
                if (from === to) return;
                return [ from, to ];
            };
            parseTransform2d = parsers.transform = function(transform) {
                if (!transform || transform === "none") return "none";
                return (new Transform2d(rMatrix.test(transform) ? decomposeMatrix(transform) : transform)).toString(true);
            };
            getters.transform = function() {
                var s = this.style;
                return s[transformName] || (s[transformName] = parseTransform2d(compute(this)(transformName)));
            };
        })();
        var prepare = function(node, property, to) {
            var parser = parsers[property] || parse, from = getter(property).call(node), to = parser(to, true);
            if (from === to) return;
            if (parser === parseLength || parser === parseBorder || parser === parseShort4) {
                var toAll = to.match(rgLength), i = 0;
                if (toAll) from = from.replace(rgLength, function(fromFull, fromValue, fromUnit) {
                    var toFull = toAll[i++], toMatched = toFull.match(rLengthNum), toUnit = toMatched[2];
                    if (fromUnit !== toUnit) {
                        var fromPixels = fromUnit === "px" ? fromValue : pixelRatio(node, fromUnit) * fromValue;
                        return round(fromPixels / pixelRatio(node, toUnit)) + toUnit;
                    }
                    return fromFull;
                });
                if (i > 0) setter(property).call(node, from);
            } else if (parser === parseTransform2d) {
                return Transform2d.union(from, to);
            }
            return from !== to ? [ from, to ] : null;
        };
        var BrowserAnimation = prime({
            inherits: fx,
            constructor: function BrowserAnimation(node, property) {
                var _getter = getter(property), _setter = setter(property);
                this.get = function() {
                    return _getter.call(node);
                };
                this.set = function(value) {
                    return _setter.call(node, value);
                };
                BrowserAnimation.parent.constructor.call(this, this.set);
                this.node = node;
                this.property = property;
            }
        });
        var JSAnimation;
        JSAnimation = prime({
            inherits: BrowserAnimation,
            constructor: function JSAnimation() {
                return JSAnimation.parent.constructor.apply(this, arguments);
            },
            start: function(to) {
                this.stop();
                if (this.duration === 0) {
                    this.cancel(to);
                    return this;
                }
                var fromTo = prepare(this.node, this.property, to);
                if (!fromTo) {
                    this.cancel(to);
                    return this;
                }
                JSAnimation.parent.start.apply(this, fromTo);
                if (!this.cancelStep) return this;
                var parser = parsers[this.property] || parse;
                if ((parser === parseBoxShadow || parser === parseTextShadow || parser === parse) && this.templateFrom !== this.templateTo) {
                    this.cancelStep();
                    delete this.cancelStep;
                    this.cancel(to);
                }
                return this;
            },
            parseEquation: function(equation) {
                if (typeof equation === "string") return JSAnimation.parent.parseEquation.call(this, equation);
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
                if (this.duration === 0) {
                    this.cancel(to);
                    return this;
                }
                var fromTo = prepare(this.node, this.property, to);
                if (!fromTo) {
                    this.cancel(to);
                    return this;
                }
                this.to = fromTo[1];
                this.cancelSetTransitionCSS = requestFrame(this.bSetTransitionCSS);
                return this;
            },
            setTransitionCSS: function(time) {
                delete this.cancelSetTransitionCSS;
                this.resetCSS(true);
                this.cancelSetStyleCSS = requestFrame(this.bSetStyleCSS);
            },
            setStyleCSS: function(time) {
                delete this.cancelSetStyleCSS;
                var duration = this.duration;
                this.cancelComplete = setTimeout(this.bComplete, duration);
                this.endTime = time + duration;
                this.set(this.to);
            },
            complete: function() {
                delete this.cancelComplete;
                this.resetCSS();
                this.callback(this.endTime);
            },
            stop: function(hard) {
                if (this.cancelExit) {
                    this.cancelExit();
                    delete this.cancelExit;
                } else if (this.cancelSetTransitionCSS) {
                    this.cancelSetTransitionCSS();
                    delete this.cancelSetTransitionCSS;
                } else if (this.cancelSetStyleCSS) {
                    this.cancelSetStyleCSS();
                    delete this.cancelSetStyleCSS;
                    if (hard) this.resetCSS();
                } else if (this.cancelComplete) {
                    clearTimeout(this.cancelComplete);
                    delete this.cancelComplete;
                    if (hard) {
                        this.resetCSS();
                        this.set(this.get());
                    }
                }
                return this;
            },
            resetCSS: function(inclusive) {
                var rules = compute(this.node), properties = rules(transitionName + "Property").replace(/\s+/g, "").split(","), durations = rules(transitionName + "Duration").replace(/\s+/g, "").split(","), equations = rules(transitionName + "TimingFunction").replace(/\s+/g, "").match(/cubic-bezier\([\d-.,]+\)/g);
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
            },
            parseEquation: function(equation) {
                if (typeof equation === "string") return CSSAnimation.parent.parseEquation.call(this, equation, true);
            }
        });
        var BaseAnimation = transitionName ? CSSAnimation : JSAnimation;
        var moofx = function(x, y) {
            return typeof x === "function" ? fx(x) : nodes(x, y);
        };
        nodes.implement({
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
                return this;
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
                property = camelize(property);
                var node = this[0];
                if (property === "transform" && parseTransform2d) return compute(node)(transformName);
                var value = getter(property).call(node);
                return value != null ? value.replace(rgLength, function(match, value, unit) {
                    return unit === "px" ? match : pixelRatio(node, unit) * value + "px";
                }) : "";
            }
        });
        moofx.parse = function(property, value, normalize) {
            return (parsers[camelize(property)] || parse)(value, normalize);
        };
        module.exports = moofx;
    },
    "4": function(require, module, exports, global) {
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
    "5": function(require, module, exports, global) {
        "use strict";
        var shell = require("6");
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
    "6": function(require, module, exports, global) {
        "use strict";
        var prime = require("4"), slice = Array.prototype.slice;
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
    "7": function(require, module, exports, global) {
        "use strict";
        var shell = require("6");
        var string = shell({
            inherits: require("8"),
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
    "8": function(require, module, exports, global) {
        "use strict";
        var shell = require("6");
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
    "9": function(require, module, exports, global) {
        "use strict";
        var prime = require("4");
        var uniqueIndex = 0;
        var uniqueID = function(n) {
            return n === global ? "global" : n.uniqueNumber || (n.uniqueNumber = "n:" + (uniqueIndex++).toString(36));
        };
        var instances = {};
        var search, sort;
        var $ = prime({
            constructor: function nodes(n, context) {
                if (n == null) return null;
                if (n instanceof Nodes) return n;
                var self = new Nodes;
                if (n.nodeType || n === global) {
                    self[self.length++] = n;
                } else if (typeof n === "string") {
                    if (search) search(n, context, self);
                } else if (n.length) {
                    var uniques = {};
                    for (var i = 0, l = n.length; i < l; i++) {
                        var nodes = $(n[i], context);
                        if (nodes && nodes.length) for (var j = 0, k = nodes.length; j < k; j++) {
                            var node = nodes[j], uid = uniqueID(node);
                            if (!uniques[uid]) {
                                self[self.length++] = node;
                                uniques[uid] = true;
                            }
                        }
                    }
                    if (sort && self.length > 1) sort(self);
                }
                if (!self.length) return null;
                if (self.length === 1) {
                    var uid = uniqueID(self[0]);
                    return instances[uid] || (instances[uid] = self);
                }
                return self;
            }
        });
        var Nodes = prime({
            inherits: $,
            constructor: function Nodes() {
                this.length = 0;
            },
            handle: function handle(method) {
                var buffer = [], length = this.length;
                if (length === 1) {
                    var res = method.call(this, this[0], 0, buffer);
                    if (res != null && res !== false && res !== true) buffer.push(res);
                } else for (var i = 0; i < length; i++) {
                    var node = this[i], res = method.call($(node), node, i, buffer);
                    if (res === false || res === true) break;
                    if (res != null) buffer.push(res);
                }
                return buffer;
            }
        });
        $.use = function(extension) {
            $.implement(prime.create(extension.prototype));
            if (extension.search) search = extension.search;
            if (extension.sort) sort = extension.sort;
            return this;
        };
        module.exports = $;
    },
    a: function(require, module, exports, global) {
        "use strict";
        var prime = require("4"), requestFrame = require("2").request, bezier = require("b");
        var map = require("5").map;
        var sDuration = "([\\d.]+)(s|ms)?", sCubicBezier = "cubic-bezier\\(([-.\\d]+),([-.\\d]+),([-.\\d]+),([-.\\d]+)\\)";
        var rDuration = RegExp(sDuration), rCubicBezier = RegExp(sCubicBezier), rgCubicBezier = RegExp(sCubicBezier, "g");
        var equations = {
            "default": "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
            linear: "cubic-bezier(0, 0, 1, 1)",
            "ease-in": "cubic-bezier(0.42, 0, 1.0, 1.0)",
            "ease-out": "cubic-bezier(0, 0, 0.58, 1.0)",
            "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1.0)"
        };
        equations.ease = equations["default"];
        var compute = function(from, to, delta) {
            return (to - from) * delta + from;
        };
        var divide = function(string) {
            var numbers = [];
            var template = (string + "").replace(/[-.\d]+/g, function(number) {
                numbers.push(+number);
                return "@";
            });
            return [ numbers, template ];
        };
        var Fx = prime({
            constructor: function Fx(render, options) {
                this.setOptions(options);
                this.render = render || function() {};
                var self = this;
                this.bStep = function(t) {
                    return self.step(t);
                };
                this.bExit = function(time) {
                    self.exit(time);
                };
            },
            setOptions: function(options) {
                if (options == null) options = {};
                if (!(this.duration = this.parseDuration(options.duration || "500ms"))) throw new Error("invalid duration");
                if (!(this.equation = this.parseEquation(options.equation || "default"))) throw new Error("invalid equation");
                this.callback = options.callback || function() {};
                return this;
            },
            parseDuration: function(duration) {
                if (duration = (duration + "").match(rDuration)) {
                    var time = +duration[1], unit = duration[2] || "ms";
                    if (unit === "s") return time * 1e3;
                    if (unit === "ms") return time;
                }
            },
            parseEquation: function(equation, array) {
                var type = typeof equation;
                if (type === "function") {
                    return equation;
                } else if (type === "string") {
                    equation = equations[equation] || equation;
                    var match = equation.replace(/\s+/g, "").match(rCubicBezier);
                    if (match) {
                        equation = map(match.slice(1), function(v) {
                            return +v;
                        });
                        if (array) return equation;
                        if (equation.toString() === "0,0,1,1") return function(x) {
                            return x;
                        };
                        type = "object";
                    }
                }
                if (type === "object") {
                    return bezier(equation[0], equation[1], equation[2], equation[3], 1e3 / 60 / this.duration / 4);
                }
            },
            cancel: function(to) {
                this.to = to;
                this.cancelExit = requestFrame(this.bExit);
            },
            exit: function(time) {
                this.render(this.to);
                delete this.cancelExit;
                this.callback(time);
            },
            start: function(from, to) {
                this.stop();
                if (this.duration === 0) {
                    this.cancel(to);
                    return this;
                }
                this.isArray = false;
                this.isNumber = false;
                var fromType = typeof from, toType = typeof to;
                if (fromType === "object" && toType === "object") {
                    this.isArray = true;
                } else if (fromType === "number" && toType === "number") {
                    this.isNumber = true;
                }
                var from_ = divide(from), to_ = divide(to);
                this.from = from_[0];
                this.to = to_[0];
                this.templateFrom = from_[1];
                this.templateTo = to_[1];
                if (this.from.length !== this.to.length || this.from.toString() === this.to.toString()) {
                    this.cancel(to);
                    return this;
                }
                delete this.time;
                this.length = this.from.length;
                this.cancelStep = requestFrame(this.bStep);
                return this;
            },
            stop: function() {
                if (this.cancelExit) {
                    this.cancelExit();
                    delete this.cancelExit;
                } else if (this.cancelStep) {
                    this.cancelStep();
                    delete this.cancelStep;
                }
                return this;
            },
            step: function(now) {
                this.time || (this.time = now);
                var factor = (now - this.time) / this.duration;
                if (factor > 1) factor = 1;
                var delta = this.equation(factor), from = this.from, to = this.to, tpl = this.templateTo;
                for (var i = 0, l = this.length; i < l; i++) {
                    var f = from[i], t = to[i];
                    tpl = tpl.replace("@", t !== f ? compute(f, t, delta) : t);
                }
                this.render(this.isArray ? tpl.split(",") : this.isNumber ? +tpl : tpl);
                if (factor !== 1) {
                    this.cancelStep = requestFrame(this.bStep);
                } else {
                    delete this.cancelStep;
                    this.callback(now);
                }
            }
        });
        var fx = function(render) {
            var ffx = new Fx(render);
            return {
                start: function(from, to, options) {
                    var type = typeof options;
                    ffx.setOptions(type === "function" ? {
                        callback: options
                    } : type === "string" || type === "number" ? {
                        duration: options
                    } : options).start(from, to);
                    return this;
                },
                stop: function() {
                    ffx.stop();
                    return this;
                }
            };
        };
        fx.prototype = Fx.prototype;
        module.exports = fx;
    },
    b: function(require, module, exports, global) {
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
    c: function(require, module, exports, global) {
        "use strict";
        var length = function(a) {
            return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
        };
        var normalize = function(a) {
            var l = length(a);
            return l ? [ a[0] / l, a[1] / l ] : [ 0, 0 ];
        };
        var dot = function(a, b) {
            return a[0] * b[0] + a[1] * b[1];
        };
        var atan2 = Math.atan2;
        var combine = function(a, b, ascl, bscl) {
            return [ ascl * a[0] + bscl * b[0], ascl * a[1] + bscl * b[1] ];
        };
        module.exports = function(a, b, c, d, tx, ty) {
            if (a * d - b * c === 0) return false;
            var translate = [ tx, ty ];
            var m = [ [ a, b ], [ c, d ] ];
            var scale = [ length(m[0]) ];
            m[0] = normalize(m[0]);
            var skew = dot(m[0], m[1]);
            m[1] = combine(m[1], m[0], 1, -skew);
            scale[1] = length(m[1]);
            skew /= scale[1];
            var rotate = atan2(m[0][1], m[0][0]);
            return [ translate, rotate, skew, scale ];
        };
    }
});