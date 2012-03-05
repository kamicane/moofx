/*
---
provides: moofx
version: 3.0.4
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
        var color = require("1"), frame = require("2"), moofx = typeof document != "undefined" ? require("3") : {};
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
        }, RGBtoRGB = function(r, g, b, a) {
            a == null && (a = 1);
            r = parseInt(r, 10);
            g = parseInt(g, 10);
            b = parseInt(b, 10);
            a = parseFloat(a);
            return r <= 255 && r >= 0 && g <= 255 && g >= 0 && b <= 255 && b >= 0 && a <= 1 && a >= 0 ? [ Math.round(r), Math.round(g), Math.round(b), a ] : null;
        }, HEXtoRGB = function(hex) {
            hex.length === 3 && (hex += "f");
            if (hex.length === 4) {
                var h0 = hex.charAt(0), h1 = hex.charAt(1), h2 = hex.charAt(2), h3 = hex.charAt(3);
                hex = h0 + h0 + h1 + h1 + h2 + h2 + h3 + h3;
            }
            hex.length === 6 && (hex += "ff");
            var rgb = [];
            for (var i = 0, l = hex.length; i <= l; i += 2) rgb.push(parseInt(hex.substr(i, 2), 16) / (i === 6 ? 255 : 1));
            return rgb;
        }, HUEtoRGB = function(p, q, t) {
            t < 0 && (t += 1);
            t > 1 && (t -= 1);
            return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
        }, HSLtoRGB = function(h, s, l, a) {
            var r, b, g;
            a == null && (a = 1);
            h /= 360;
            s /= 100;
            l /= 100;
            a /= 1;
            if (h > 1 || h < 0 || s > 1 || s < 0 || l > 1 || l < 0 || a > 1 || a < 0) return null;
            if (s === 0) r = b = g = l; else {
                var q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
                r = HUEtoRGB(p, q, h + 1 / 3);
                g = HUEtoRGB(p, q, h);
                b = HUEtoRGB(p, q, h - 1 / 3);
            }
            return [ r * 255, g * 255, b * 255, a ];
        };
        module.exports = function(input, array) {
            var match;
            if (typeof input != "string") return null;
            input = colors[input = input.replace(/\s+/g, "")] || input;
            if (input.match(/^#[a-f0-9]{3,8}/)) input = HEXtoRGB(input.replace("#", "")); else {
                if (!(match = input.match(/([\d.])+/g))) return null;
                if (input.match(/^rgb/)) input = match; else {
                    if (!input.match(/^hsl/)) return null;
                    input = HSLtoRGB.apply(null, match);
                }
            }
            if (!input || !(input = RGBtoRGB.apply(null, input))) return null;
            if (array) return input;
            input[3] === 1 && input.splice(3, 1);
            return "rgb" + (input.length > 3 ? "a" : "") + "(" + input + ")";
        };
    },
    "2": function(require, module, exports, global) {
        var callbacks = [], running = !1, iterator = function(time) {
            time == null && (time = +(new Date));
            running = !1;
            var i = callbacks.length;
            while (i) callbacks.splice(--i, 1)[0](time);
        }, requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame || global.msRequestAnimationFrame || function(callback) {
            return setTimeout(callback, 1e3 / 60);
        };
        exports.request = function(callback) {
            callbacks.push(callback);
            if (!running) {
                running = !0;
                requestFrame(iterator);
            }
            return this;
        };
        exports.cancel = function(match) {
            for (var i = 0, l = callbacks.length; i < l; i++) {
                var callback = callbacks[i];
                callback === match && callbacks.splice(i, 1);
            }
            return this;
        };
    },
    "3": function(require, module, exports, global) {
        var bezier = require("4"), color = require("1"), frame = require("2"), inherits = function(parent, child) {
            var C = function() {
                this.constructor = parent;
            };
            C.prototype = parent.prototype;
            child.prototype = new C;
            return child;
        }, cancelFrame = frame.cancel, requestFrame = frame.request, string = String, number = parseFloat, camelize = function(self) {
            return self.replace(/-\D/g, function(match) {
                return match.charAt(1).toUpperCase();
            });
        }, hyphenate = function(self) {
            return self.replace(/[A-Z]/g, function(match) {
                return "-" + match.charAt(0).toLowerCase();
            });
        }, clean = function(self) {
            return string(self).replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
        }, map = Array.map || Array.prototype.map ? function(array, fn, context) {
            return Array.prototype.map.call(array, fn, context);
        } : function(array, fn, context) {
            var result = [];
            for (var i = 0, l = array.length; i < l; i++) result.push(fn.call(context, array[i], i, array));
            return result;
        }, each = Array.prototype.forEach ? function(array, fn, context) {
            Array.prototype.forEach.call(array, fn, context);
            return array;
        } : function(array, fn, context) {
            for (var i = 0, l = array.length; i < l; i++) fn.call(context, array[i], i, array);
            return array;
        }, mirror4 = function(values) {
            var length = values.length;
            length === 1 ? values.push(values[0], values[0], values[0]) : length === 2 ? values.push(values[0], values[1]) : length === 3 && values.push(values[1]);
            return values;
        }, computedStyle = global.getComputedStyle ? function(node) {
            var cts = getComputedStyle(node);
            return function(property) {
                return cts ? cts.getPropertyValue(hyphenate(property)) : "";
            };
        } : function(node) {
            var cts = node.currentStyle;
            return function(property) {
                return cts ? cts[camelize(property)] : "";
            };
        }, Parser = function() {};
        Parser.prototype.extract = function() {
            return [ this ];
        };
        Parser.prototype.toString = function() {
            return string(this.value);
        };
        var StringParser = inherits(Parser, function(value) {
            value == null && (value = "");
            this.value = string(value);
        }), NumberParser = inherits(Parser, function(value) {
            value == null && (value = "");
            var n = number(value);
            this.value = isFinite(n) ? n : value;
        }), Parsers = function() {};
        Parsers.prototype.extract = function() {
            return this.parsed;
        };
        Parsers.prototype.toString = function(normalize, node) {
            return clean(map(this.parsed, function(parsed) {
                return parsed.toString(normalize, node);
            }, this).join(" "));
        };
        var LengthParser = inherits(Parser, function(value) {
            var match;
            value == null && (value = "");
            if (value === "auto") this.value = "auto"; else if (match = clean(string(value)).match(/^([-\d.]+)(%|cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vm)?$/)) {
                this.value = number(match[1]);
                this.unit = this.value === 0 || !match[2] ? "px" : match[2];
            } else this.value = "";
        });
        LengthParser.prototype.toString = function(normalize, node) {
            return this.value === "auto" ? this.value : this.value === "" ? normalize ? "0px" : "" : node && this.unit !== "px" ? "" + pixelRatio(node, this.unit) * this.value + "px" : this.value + this.unit;
        };
        var ColorParser = inherits(Parser, function(value) {
            value === "transparent" && (value = "#00000000");
            this.value = value ? color(value, !0) : "";
        });
        ColorParser.prototype.toString = function(normalize) {
            return this.value ? !!normalize || this.value !== "transparent" && this.value[3] !== 0 ? normalize || this.value[3] !== 1 ? "rgba(" + this.value + ")" : "rgb(" + this.value[0] + "," + this.value[1] + "," + this.value[2] + ")" : "transparent" : normalize ? "rgba(0,0,0,1)" : "";
        };
        var LengthsParser = inherits(Parsers, function(value) {
            value == null && (value = "");
            this.parsed = map(mirror4(clean(value).split(" ")), function(v) {
                return new LengthParser(v);
            });
        }), BorderStyleParser = inherits(Parser, function(value) {
            value == null && (value = "");
            var match = (value = clean(value)).match(/none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit/);
            this.value = match ? value : "";
        });
        BorderStyleParser.prototype.toString = function(normalize) {
            return normalize && !this.value ? "none" : this.value;
        };
        var BorderParser = inherits(Parsers, function(value) {
            value == null ? value = "" : value === "none" && (value = "0 none #000");
            var match = value = clean(value).match(/((?:[\d.]+)(?:[\w%]+)?)\s(\w+)\s(rgb(?:a)?\([\d,\s]+\)|hsl(?:a)?\([\d,\s]+\)|#[a-f0-9]+|\w+)/) || [], matchedWidth = match[1], matchedStyle = match[2], matchedColor = match[3];
            this.parsed = [ new LengthParser(matchedWidth != null ? matchedWidth : ""), new BorderStyleParser(matchedStyle != null ? matchedStyle : ""), new ColorParser(matchedColor != null ? matchedColor : "") ];
        }), BorderColorParser = inherits(Parsers, function(colors) {
            colors == null && (colors = "");
            colors = mirror4(colors.match(/rgb(a)?\([\d,\s]+\)|hsl(a)?\([\d,\s]+\)|#[a-f0-9]+|\w+/g) || [ "" ]);
            this.parsed = map(colors, function(c) {
                return new ColorParser(c);
            });
        }), ZIndexParser = inherits(Parser, function(value) {
            this.value = value === "auto" ? value : number(value);
        }), parsers = {}, getters = {}, setters = {}, translations = {}, html = document.documentElement, get = function(key) {
            return getters[key] || (getters[key] = function() {
                var parser = parsers[key] || StringParser;
                return function() {
                    return (new parser(computedStyle(this)(key))).toString(!0, this);
                };
            }());
        }, set = function(key) {
            return setters[key] || (setters[key] = function() {
                var parser = parsers[key] || StringParser;
                return function(value) {
                    return this.style[key] = (new parser(value)).toString();
                };
            }());
        }, test = document.createElement("div"), cssText = "border:none;margin:none;padding:none;visibility:hidden;position:absolute;height:0;", pixelRatio = function(element, u) {
            var parent = element.parentNode, ratio = 1;
            if (parent) {
                test.style.cssText = cssText + ("width:100" + u + ";");
                parent.appendChild(test);
                ratio = test.offsetWidth / 100;
                parent.removeChild(test);
            }
            return ratio;
        }, trbl = [ "Top", "Right", "Bottom", "Left" ], tlbl = [ "TopLeft", "TopRight", "BottomRight", "BottomLeft" ];
        parsers.color = parsers.backgroundColor = ColorParser;
        parsers.width = parsers.height = parsers.fontSize = parsers.backgroundSize = LengthParser;
        each(trbl, function(d) {
            var bd = "border" + d;
            each([ "margin" + d, "padding" + d, bd + "Width", d.toLowerCase() ], function(n) {
                parsers[n] = LengthParser;
            });
            parsers[bd + "Color"] = ColorParser;
            parsers[bd + "Style"] = BorderStyleParser;
            parsers[bd] = BorderParser;
            getters[bd] = function() {
                return [ get(bd + "Width").call(this), get(bd + "Style").call(this), get(bd + "Color").call(this) ].join(" ");
            };
        });
        each(tlbl, function(d) {
            parsers["border" + d + "Radius"] = LengthParser;
        });
        parsers.zIndex = ZIndexParser;
        each([ "margin", "padding" ], function(name) {
            parsers[name] = LengthsParser;
            return getters[name] = function() {
                return map(trbl, function(d) {
                    return get(name + d).call(this);
                }, this).join(" ");
            };
        });
        parsers.borderRadius = LengthsParser;
        getters.borderRadius = function() {
            return map(trbl, function(d) {
                return get("border" + d + "Radius").call(this);
            }).join(" ");
        };
        parsers.borderWidth = LengthsParser;
        parsers.borderColor = BorderColorParser;
        each([ "Width", "Style", "Color" ], function(t) {
            getters["border" + t] = function() {
                return map(trbl, function(d) {
                    return get("border" + d + t).call(this);
                }, this).join(" ");
            };
        });
        parsers.border = BorderParser;
        getters.border = function() {
            var pvalue;
            for (var i = 0; i < trbl.length; i++) {
                var value = get("border" + trbl[i]).call(this);
                if (pvalue && value !== pvalue) return null;
                pvalue = value;
            }
            return value;
        };
        var filterName = html.style.MsFilter != null ? "MsFilter" : html.style.filter != null ? "filter" : null;
        parsers.opacity = NumberParser;
        if (filterName && html.style.opacity == null) {
            matchOp = /alpha\(opacity=([\d.]+)\)/i;
            setters.opacity = function(value) {
                value = (value = number(value) === 1) ? "" : "alpha(opacity=" + value * 100 + ")";
                var filter = computedStyle(this)(filterName);
                return this.style[filterName] = matchOp.test(filter) ? filter.replace(matchOp, value) : filter + value;
            };
            getters.opacity = function() {
                var match;
                return string((match = computedStyle(this)(filterName).match(matchOp)) ? match[1] / 100 : 1);
            };
        }
        var transitionName;
        each([ "WebkitTransition", "MozTransition", "transition" ], function(transition) {
            html.style[transition] != null && (transitionName = transition);
        });
        var transitionEndName = transitionName === "MozTransition" ? "transitionend" : transitionName === "WebkitTransition" ? "webkitTransitionEnd" : "transitionEnd", transformName;
        each([ "MozTransform", "WebkitTransform", "OTransform", "msTransform", "transform" ], function(transform) {
            html.style[transform] != null && (transformName = transform);
        });
        parsers.transform = transitionName ? StringParser : inherits(Parser, function() {
            return "none";
        });
        if (transformName) {
            translations.transform = transformName;
            setters.transform = function(value) {
                return this.style[transformName] = value;
            };
            getters.transform = function() {
                return computedStyle(this)(transformName);
            };
        } else {
            setters.transform = function() {};
            getters.transform = function() {
                return "none";
            };
        }
        var equations = {
            "default": "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
            linear: "cubic-bezier(0, 0, 1, 1)",
            "ease-in": "cubic-bezier(0.42, 0, 1.0, 1.0)",
            "ease-out": "cubic-bezier(0, 0, 0.58, 1.0)",
            "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1.0)"
        };
        equations.ease = equations["default"];
        var BrowserAnimation = function(node, property) {
            this.node = node;
            this.property = property;
            this.setter = set(property);
            this.getter = get(property);
        };
        BrowserAnimation.prototype.setOptions = function(options) {
            options == null && (options = {});
            var duration = options.duration;
            typeof duration == "number" && (duration += "ms");
            if (!(this.duration = this.parseDuration(duration || "500ms"))) throw new Error(this.duration + " is not a valid duration");
            if (!(this.equation = this.parseEquation(options.equation || "default"))) throw new Error(this.equation + " is not a valid equation");
            this.callback = options.callback || function() {};
            return this;
        };
        BrowserAnimation.prototype.parseDuration = function(duration) {
            if (duration = string(duration).match(/([\d.]+)(s|ms)/)) {
                var time = number(duration[1]), unit = duration[2];
                if (unit === "s") return time * 1e3;
                if (unit === "ms") return time;
            }
            return null;
        };
        BrowserAnimation.prototype.parseEquation = function(equation) {
            equation = equations[equation] || equation;
            var match = equation.replace(/\s+/g, "").match(/^cubic-bezier\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)$/);
            return match ? map(match.slice(1), number) : null;
        };
        var JSAnimation = inherits(BrowserAnimation, function(node, property) {
            BrowserAnimation.prototype.constructor.call(this, node, property);
            var self = this;
            this.bstep = function(t) {
                return self.step(t);
            };
        }), numbers = function(string) {
            var ns = [], replaced = string.replace(/[-\d.]+/g, function(n) {
                ns.push(number(n));
                return "@";
            });
            return [ ns, replaced ];
        }, compute = function(from, to, delta) {
            return (to - from) * delta + from;
        };
        JSAnimation.prototype.start = function(from, to) {
            if (from != to && this.duration !== 0) {
                this.time = 0;
                from = numbers(from);
                to = numbers(to);
                if (from[0].length !== to[0].length) throw new Error("length mismatch");
                this.from = from[0];
                this.to = to[0];
                this.template = to[1];
                requestFrame(this.bstep);
            } else {
                this.duration == 0 && this.setter.call(this.node, to);
                requestFrame(this.callback);
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
            factor > 1 && (factor = 1);
            var delta = this.equation(factor), tpl = this.template, from = this.from, to = this.to;
            for (var i = 0, l = from.length; i < l; i++) {
                var f = from[i], t = to[i];
                tpl = tpl.replace("@", t !== f ? compute(f, t, delta) : t);
            }
            this.setter.call(this.node, tpl);
            factor !== 1 ? requestFrame(this.bstep) : this.callback(t);
        };
        JSAnimation.prototype.parseEquation = function(equation) {
            var equation = BrowserAnimation.prototype.parseEquation.call(this, equation);
            return equation == [ 0, 0, 1, 1 ] ? function(x) {
                return x;
            } : bezier(equation[0], equation[1], equation[2], equation[3], 1e3 / 60 / this.duration / 4);
        };
        var CSSAnimation = inherits(BrowserAnimation, function(node, property) {
            BrowserAnimation.prototype.constructor.call(this, node, property);
            var self = this;
            this.hproperty = hyphenate(translations[this.property] || this.property);
            this.bdefer = function(t) {
                return self.defer(t);
            };
            this.bcomplete = function(e) {
                return self.complete(e);
            };
        });
        CSSAnimation.prototype.start = function(from, to) {
            if (from != to && this.duration != 0) {
                this.to = to;
                requestFrame(this.bdefer);
            } else {
                this.duration == 0 && this.setter.call(this.node, to);
                requestFrame(this.callback);
            }
            return this;
        };
        CSSAnimation.prototype.stop = function(hard) {
            if (this.running) {
                this.running = !1;
                hard && this.setter.call(this.node, this.getter.call(this.node));
                this.clean();
            } else cancelFrame(this.bdefer);
            return this;
        };
        CSSAnimation.prototype.defer = function() {
            this.running = !0;
            this.modCSS(!0);
            this.node.addEventListener(transitionEndName, this.bcomplete, !1);
            this.setter.call(this.node, this.to);
            return null;
        };
        CSSAnimation.prototype.clean = function() {
            this.modCSS();
            this.node.removeEventListener(transitionEndName, this.bcomplete);
            return null;
        };
        CSSAnimation.prototype.complete = function(e) {
            if (e && e.propertyName === this.hproperty) {
                this.running = !1;
                this.clean();
                requestFrame(this.callback);
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
            var rules = computedStyle(this.node), p = rules(transitionName + "Property").replace(/\s+/g, "").split(","), d = rules(transitionName + "Duration").replace(/\s+/g, "").split(","), e = rules(transitionName + "TimingFunction").replace(/\s+/g, "").match(/cubic-bezier\(([\d.,]+)\)/g);
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
                var animation, _base, _uid, uid = (_uid = node["µid"]) != null ? _uid : node["µid"] = (this.uid++).toString(36);
                animation = (_base = this.animations)[uid] || (_base[uid] = {});
                return animation[property] || (animation[property] = transitionName ? new CSSAnimation(node, property) : new JSAnimation(node, property));
            },
            starts: function(nodes, styles, options) {
                options == null && (options = {});
                var type = typeof options;
                options = type === "function" ? {
                    callback: options
                } : type === "string" || type === "number" ? {
                    duration: options
                } : options;
                var callback = options.callback || function() {}, completed = 0, length = 0;
                options.callback = function(t) {
                    ++completed === length && callback(t);
                };
                for (var property in styles) {
                    var value = styles[property], parser = parsers[property = camelize(property)];
                    if (!parser) throw new Error("no parser for " + property);
                    var setter = set(property), getter = get(property);
                    for (var i = 0, l = nodes.length; i < l; i++) {
                        length++;
                        var node = nodes[i], instance = this.retrieve(node, property), parsedFrom = new parser(getter.call(node)), parsedTo = new parser(value), fromParsers = parsedFrom.extract(), toParsers = parsedTo.extract(), enforce = !1;
                        for (var j = 0, k = fromParsers.length; j < k; j++) {
                            var fp = fromParsers[j], tp = toParsers[j];
                            if ("auto" === tp.value || "auto" === fp.value) throw new Error("cannot animate " + property + " from or to `auto`");
                            if (tp.unit && fp.unit) {
                                enforce = !0;
                                if (tp.unit !== "px") {
                                    fp.value = fp.value / pixelRatio(node, tp.unit);
                                    fp.unit = tp.unit;
                                }
                            }
                        }
                        var fs = parsedFrom.toString(!0), ts = parsedTo.toString(!0);
                        enforce && setter.call(node, fs);
                        instance.setOptions(options).start(fs, ts);
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
                    var value = styles[property], setter = set(property = camelize(property));
                    for (var i = 0, l = nodes.length; i < l; i++) {
                        var node = nodes[i], aid, apid;
                        (aid = this.animations[node["µid"]]) != null && (apid = aid[property]) != null && apid.stop(!0);
                        setter.call(node, value);
                    }
                }
                return this;
            },
            set: function(nodes, property, value) {
                var styles = {};
                styles[property] = value;
                return this.sets(nodes, styles);
            }
        }, mu = function(nod) {
            this.valueOf = function() {
                return nod;
            };
            return this;
        };
        moofx = function(nod) {
            return nod ? new mu(nod.length != null ? nod : nod.nodeType === 1 ? [ nod ] : []) : null;
        };
        moofx.prototype = mu.prototype;
        moofx.prototype.animate = function(A, B, C) {
            typeof A != "string" ? animations.starts(this.valueOf(), A, B) : animations.start(this.valueOf(), A, B, C);
            return this;
        };
        moofx.prototype.style = function(A, B) {
            typeof A != "string" ? animations.sets(this.valueOf(), A) : animations.set(this.valueOf(), A, B);
            return this;
        };
        moofx.prototype.compute = function(A) {
            return get(camelize(A)).call(this.valueOf()[0]);
        };
        moofx.parse = function(property, value, normalize, node) {
            return parsers[property = camelize(property)] ? (new parsers[property](value)).toString(normalize, node) : null;
        };
        module.exports = moofx;
    },
    "4": function(require, module, exports, global) {
        module.exports = function(x1, y1, x2, y2, epsilon) {
            var curveX = function(t) {
                var v = 1 - t;
                return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
            }, curveY = function(t) {
                var v = 1 - t;
                return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
            }, derivativeCurveX = function(t) {
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
                    t2 -= x2 / d2;
                }
                t0 = 0, t1 = 1, t2 = x;
                if (t2 < t0) return curveY(t0);
                if (t2 > t1) return curveY(t1);
                while (t0 < t1) {
                    x2 = curveX(t2);
                    if (Math.abs(x2 - x) < epsilon) return curveY(t2);
                    x > x2 ? t0 = t2 : t1 = t2;
                    t2 = (t1 - t0) * .5 + t0;
                }
                return curveY(t2);
            };
        };
    }
});