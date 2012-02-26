/*
---
provides: moofx
version: 3.0.0-20-y
description: A CSS3-enabled javascript animation library on caffeine
homepage: http://moofx.it
author: Valerio Proietti <@kamicane> (http://mad4milk.net)
license: MIT (http://mootools.net/license.txt)
...
*/
(function(packages) {
	var require = function(name) {
		var bits = name.split("/"), ns = bits.splice(0, 1)[0], pkg = packages[ns], local, module, exports;
		if (!pkg) return null;
		if (!pkg || !(module = pkg.modules[name = bits.join("/") || pkg.main])) return null;
		if ((exports = module.exports) != null) return exports;
		packages[ns].modules[name] = local = {
			exports: {}
		};
		module(local, require, local.exports, window);
		return local.exports;
	};
	window.moofx = require("moofx");
})({
	moofx: {
		main: "moofx",
		modules: {
			moofx: function(module, require, exports, global) {
				var Animation, Animations, BorderColorParser, BorderParser, BorderStyleParser, CSSAnimation, ColorParser, JSAnimation, LengthParser, LengthsParser, NumberParser, Parser, Parsers, StringParser, TransformParser, ZIndexParser, animations, bd, bezier, beziers, camelize, cancelFrame, clean, color, computedStyle, cssText, d, equations, filterName, frame, get, getters, html, hyphenate, item, matchOp, mirror4, moofx, mu, name, number, parsers, pixelRatio, requestFrame, set, setters, string, t, test, tlbl, transformName, transitionEndName, transitionName, translations, trbl, _fn, _fn2, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _len7, _m, _n, _o, _ref, _ref2, _ref3, _ref4, _ref5, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
					for (var key in parent) __hasProp.call(parent, key) && (child[key] = parent[key]);
					function ctor() {
						this.constructor = child;
					}
					ctor.prototype = parent.prototype;
					child.prototype = new ctor;
					child.__super__ = parent.prototype;
					return child;
				};
				color = require("moofx/color");
				frame = require("moofx/frame");
				bezier = require("moofx/bezier");
				cancelFrame = frame.cancel;
				requestFrame = frame.request;
				string = String;
				number = parseFloat;
				camelize = function(self) {
					return self.replace(/-\D/g, function(match) {
						return match.charAt(1).toUpperCase();
					});
				};
				hyphenate = function(self) {
					return self.replace(/[A-Z]/g, function(match) {
						return "-" + match.charAt(0).toLowerCase();
					});
				};
				clean = function(self) {
					return string(self).replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
				};
				mirror4 = function(values) {
					var length;
					length = values.length;
					length === 1 ? values.push(values[0], values[0], values[0]) : length === 2 ? values.push(values[0], values[1]) : length === 3 && values.push(values[1]);
					return values;
				};
				computedStyle = typeof getComputedStyle != "undefined" ? function(node) {
					var cts;
					cts = getComputedStyle(node);
					return function(property) {
						return cts ? cts.getPropertyValue(hyphenate(property)) : "";
					};
				} : function(node) {
					var cts;
					cts = node.currentStyle;
					return function(property) {
						return cts ? cts[camelize(property)] : "";
					};
				};
				Parser = function() {
					function Parser() {}
					Parser.prototype.extract = function() {
						return [ this ];
					};
					Parser.prototype.toString = function() {
						return string(this.value);
					};
					return Parser;
				}();
				StringParser = function(_super) {
					__extends(StringParser, _super);
					function StringParser(value) {
						value == null && (value = "");
						this.value = string(value);
					}
					return StringParser;
				}(Parser);
				NumberParser = function(_super) {
					__extends(NumberParser, _super);
					function NumberParser(value) {
						var n;
						value == null && (value = "");
						this.value = isFinite(n = number(value)) ? n : value;
					}
					return NumberParser;
				}(Parser);
				Parsers = function() {
					function Parsers() {}
					Parsers.prototype.extract = function() {
						return this.parsed;
					};
					Parsers.prototype.toString = function(normalize, node) {
						var parser;
						return clean(function() {
							var _i, _len, _ref, _results;
							_ref = this.parsed;
							_results = [];
							for (_i = 0, _len = _ref.length; _i < _len; _i++) {
								parser = _ref[_i];
								_results.push(parser.toString(normalize, node));
							}
							return _results;
						}.call(this).join(" "));
					};
					return Parsers;
				}();
				LengthParser = function(_super) {
					__extends(LengthParser, _super);
					function LengthParser(value) {
						var match;
						value == null && (value = "");
						if (value === "auto") this.value = "auto"; else if (match = clean(string(value)).match(/^([-\d.]+)(%|cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vm)?$/)) {
							this.value = number(match[1]);
							this.unit = this.value === 0 || !match[2] ? "px" : match[2];
						} else this.value = "";
					}
					LengthParser.prototype.toString = function(normalize, node) {
						return this.value === "auto" ? this.value : normalize && this.value === "" ? "0px" : this.value === "" ? "" : node && this.unit !== "px" ? "" + pixelRatio(node, this.unit) * this.value + "px" : this.value + this.unit;
					};
					return LengthParser;
				}(Parser);
				ColorParser = function(_super) {
					__extends(ColorParser, _super);
					function ColorParser(value) {
						value === "transparent" && (value = "#00000000");
						this.value = value ? color(value, !0) : "";
					}
					ColorParser.prototype.toString = function(normalize) {
						return normalize && !this.value ? "rgba(0,0,0,1)" : this.value ? !!normalize || this.value !== "transparent" && this.value[3] !== 0 ? normalize || this.value[3] !== 1 ? "rgba(" + this.value + ")" : "rgb(" + this.value[0] + "," + this.value[1] + "," + this.value[2] + ")" : "transparent" : "";
					};
					return ColorParser;
				}(Parser);
				LengthsParser = function(_super) {
					__extends(LengthsParser, _super);
					function LengthsParser(value) {
						var i, v, values;
						value == null && (value = "");
						values = mirror4(clean(value).split(" "));
						this.parsed = function() {
							var _len, _results;
							_results = [];
							for (i = 0, _len = values.length; i < _len; i++) {
								v = values[i];
								_results.push(new LengthParser(v));
							}
							return _results;
						}();
					}
					return LengthsParser;
				}(Parsers);
				BorderStyleParser = function(_super) {
					__extends(BorderStyleParser, _super);
					function BorderStyleParser(value) {
						var match;
						value == null && (value = "");
						match = (value = clean(value)).match(/none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit/);
						this.value = match ? value : "";
					}
					BorderStyleParser.prototype.toString = function(normalize) {
						return normalize && !this.value ? "none" : this.value;
					};
					return BorderStyleParser;
				}(Parser);
				BorderParser = function(_super) {
					__extends(BorderParser, _super);
					function BorderParser(value) {
						var match, _ref, _ref2, _ref3;
						value == null && (value = "");
						value === "none" && (value = "0 none #000");
						match = (value = clean(value)).match(/((?:[\d.]+)(?:[\w%]+)?)\s(\w+)\s(rgb(?:a)?\([\d,\s]+\)|hsl(?:a)?\([\d,\s]+\)|#[a-f0-9]+|\w+)/) || [];
						this.parsed = [ new LengthParser((_ref = match[1]) != null ? _ref : ""), new BorderStyleParser((_ref2 = match[2]) != null ? _ref2 : ""), new ColorParser((_ref3 = match[3]) != null ? _ref3 : "") ];
					}
					return BorderParser;
				}(Parsers);
				BorderColorParser = function(_super) {
					__extends(BorderColorParser, _super);
					function BorderColorParser(colors) {
						var c;
						colors == null && (colors = "");
						colors = mirror4(colors.match(/rgb(a)?\([\d,\s]+\)|hsl(a)?\([\d,\s]+\)|#[a-f0-9]+|\w+/g) || [ "" ]);
						this.parsed = function() {
							var _i, _len, _results;
							_results = [];
							for (_i = 0, _len = colors.length; _i < _len; _i++) {
								c = colors[_i];
								_results.push(new ColorParser(c));
							}
							return _results;
						}();
					}
					return BorderColorParser;
				}(Parsers);
				ZIndexParser = function(_super) {
					__extends(ZIndexParser, _super);
					function ZIndexParser(value) {
						this.value = value === "auto" ? value : number(value);
					}
					return ZIndexParser;
				}(Parser);
				TransformParser = function(_super) {
					__extends(TransformParser, _super);
					function TransformParser(value) {
						var transforms, v, _fn, _i, _len;
						transforms = {
							translate: "0px,0px",
							rotate: "0deg",
							scale: "1,1",
							skew: "0deg,0deg"
						};
						if (value = clean(value).match(/\w+\s?\([-,.\w\s]+\)/g)) {
							_fn = function(v) {
								var name, values, _j, _k, _l, _len2, _len3, _len4, _results, _results2, _results3;
								if (!(v = v.replace(/\s+/g, "").match(/^(translate|scale|rotate|skew)\((.*)\)$/))) return;
								name = v[1];
								values = v[2].split(",");
								switch (name) {
								  case "translate":
									if (values.length < 2) return;
									_results = [];
									for (_j = 0, _len2 = values.length; _j < _len2; _j++) {
										v = values[_j];
										_results.push(transforms[name] = number(v) + "px");
									}
									return _results;
								  case "rotate":
									return transforms[name] = number(values[0]) + "deg";
								  case "scale":
									values.length === 1 && (values = [ values[0], values[0] ]);
									_results2 = [];
									for (_k = 0, _len3 = values.length; _k < _len3; _k++) {
										v = values[_k];
										_results2.push(transforms[name] = number(v));
									}
									return _results2;
								  case "skew":
									if (values.length === 1) return;
									_results3 = [];
									for (_l = 0, _len4 = values.length; _l < _len4; _l++) {
										v = values[_l];
										_results3.push(transforms[name] = number(v) + "deg");
									}
									return _results3;
								}
							};
							for (_i = 0, _len = value.length; _i < _len; _i++) {
								v = value[_i];
								_fn(v);
							}
						}
						this.transforms = transforms;
					}
					TransformParser.prototype.toString = function() {
						var name;
						return function() {
							var _i, _len, _ref, _results;
							_ref = [ "translate", "rotate", "scale", "skew" ];
							_results = [];
							for (_i = 0, _len = _ref.length; _i < _len; _i++) {
								name = _ref[_i];
								_results.push("" + name + "(" + this.transforms[name] + ")");
							}
							return _results;
						}.call(this).join(" ");
					};
					return TransformParser;
				}(Parser);
				parsers = {};
				getters = {};
				setters = {};
				translations = {};
				html = document.documentElement;
				get = function(key) {
					return getters[key] || (getters[key] = function() {
						var parser;
						parser = parsers[key] || StringParser;
						return function() {
							return (new parser(computedStyle(this)(key))).toString(!0, this);
						};
					}());
				};
				set = function(key) {
					return setters[key] || (setters[key] = function() {
						var parser;
						parser = parsers[key] || StringParser;
						return function(value) {
							return this.style[key] = (new parser(value)).toString();
						};
					}());
				};
				test = document.createElement("div");
				cssText = "border:none;margin:none;padding:none;visibility:hidden;position:absolute;height:0;";
				pixelRatio = function(element, u) {
					var parent, ratio;
					parent = element.parentNode;
					ratio = 1;
					if (parent) {
						test.style.cssText = cssText + ("width:100" + u + ";");
						parent.appendChild(test);
						ratio = test.offsetWidth / 100;
						parent.removeChild(test);
					}
					return ratio;
				};
				trbl = [ "Top", "Right", "Bottom", "Left" ];
				tlbl = [ "TopLeft", "TopRight", "BottomRight", "BottomLeft" ];
				parsers.color = parsers.backgroundColor = ColorParser;
				parsers.width = parsers.height = parsers.fontSize = parsers.backgroundSize = LengthParser;
				for (_i = 0, _len = trbl.length; _i < _len; _i++) {
					d = trbl[_i];
					bd = "border" + d;
					_ref = [ "margin" + d, "padding" + d, bd + "Width", d.toLowerCase() ];
					for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
						name = _ref[_j];
						parsers[name] = LengthParser;
					}
					parsers[bd + "Color"] = ColorParser;
					parsers[bd + "Style"] = BorderStyleParser;
					parsers[bd] = BorderParser;
					getters[bd] = function() {
						return [ get(bd + "Width").call(this), get(bd + "Style").call(this), get(bd + "Color").call(this) ].join(" ");
					};
				}
				for (_k = 0, _len3 = tlbl.length; _k < _len3; _k++) {
					d = tlbl[_k];
					parsers["border" + d + "Radius"] = LengthParser;
				}
				parsers.zIndex = ZIndexParser;
				_ref2 = [ "margin", "padding" ];
				_fn = function(name) {
					parsers[name] = LengthsParser;
					return getters[name] = function() {
						var d;
						return function() {
							var _len5, _m, _results;
							_results = [];
							for (_m = 0, _len5 = trbl.length; _m < _len5; _m++) {
								d = trbl[_m];
								_results.push(get(name + d).call(this));
							}
							return _results;
						}.call(this).join(" ");
					};
				};
				for (_l = 0, _len4 = _ref2.length; _l < _len4; _l++) {
					name = _ref2[_l];
					_fn(name);
				}
				parsers.borderRadius = LengthsParser;
				getters.borderRadius = function() {
					var d;
					return function() {
						var _len5, _m, _results;
						_results = [];
						for (_m = 0, _len5 = trbl.length; _m < _len5; _m++) {
							d = trbl[_m];
							_results.push(get("border" + d + "Radius").call(this));
						}
						return _results;
					}.call(this).join(" ");
				};
				parsers.borderWidth = LengthsParser;
				parsers.borderColor = BorderColorParser;
				_ref3 = [ "Width", "Style", "Color" ];
				_fn2 = function(t) {
					return getters["border" + t] = function() {
						var d;
						return function() {
							var _len6, _n, _results;
							_results = [];
							for (_n = 0, _len6 = trbl.length; _n < _len6; _n++) {
								d = trbl[_n];
								_results.push(get("border" + d + t).call(this));
							}
							return _results;
						}.call(this).join(" ");
					};
				};
				for (_m = 0, _len5 = _ref3.length; _m < _len5; _m++) {
					t = _ref3[_m];
					_fn2(t);
				}
				parsers.border = BorderParser;
				getters.border = function() {
					var d, pvalue, value, _len6, _n;
					for (_n = 0, _len6 = trbl.length; _n < _len6; _n++) {
						d = trbl[_n];
						value = get(bd = "border" + d).call(this);
						if (pvalue && value !== pvalue) return null;
						pvalue = value;
					}
					return value;
				};
				filterName = html.style.MsFilter != null ? "MsFilter" : html.style.filter != null ? "filter" : null;
				parsers.opacity = NumberParser;
				if (filterName && html.style.opacity == null) {
					matchOp = /alpha\(opacity=([\d.]+)\)/i;
					setters.opacity = function(value) {
						var filter;
						value = (value = number(value) === 1) ? "" : "alpha(opacity=" + value * 100 + ")";
						filter = computedStyle(this)(filterName);
						return this.style[filterName] = matchOp.test(filter) ? filter.replace(matchOp, value) : filter + value;
					};
					getters.opacity = function() {
						var match;
						return string((match = computedStyle(this)(filterName).match(matchOp)) ? match[1] / 100 : 1);
					};
				}
				_ref4 = [ "MozTransform", "WebkitTransform", "OTransform", "msTransform", "transform" ];
				for (_n = 0, _len6 = _ref4.length; _n < _len6; _n++) {
					item = _ref4[_n];
					if (html.style[item] == null) continue;
					transformName = item;
					break;
				}
				parsers.transform = TransformParser;
				if (transformName) {
					translations.transform = transformName;
					setters.transform = function(value) {
						return this.style[transformName] = (new TransformParser(value)).toString();
					};
					getters.transform = function() {
						return (new TransformParser(this.style[transformName])).toString();
					};
				} else {
					setters.transform = function() {};
					getters.transform = function() {
						return (new TransformParser).toString();
					};
				}
				_ref5 = [ "WebkitTransition", "MozTransition", "transition" ];
				for (_o = 0, _len7 = _ref5.length; _o < _len7; _o++) {
					item = _ref5[_o];
					if (html.style[item] == null) continue;
					transitionName = item;
					break;
				}
				transitionEndName = transitionName === "MozTransition" ? "transitionend" : "webkitTransitionEnd";
				equations = {
					"default": "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
					linear: "cubic-bezier(0, 0, 1, 1)",
					"ease-in": "cubic-bezier(0.42, 0, 1.0, 1.0)",
					"ease-out": "cubic-bezier(0, 0, 0.58, 1.0)",
					"ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1.0)"
				};
				Animation = function() {
					function Animation(node, property) {
						this.node = node;
						this.property = property;
						this.setter = set(property);
						this.getter = get(property);
					}
					Animation.prototype.setOptions = function(options) {
						var _ref6;
						options == null && (options = {});
						if (!(this.duration = this.parseDuration((_ref6 = options.duration) != null ? _ref6 : "500ms"))) throw new Error("" + options.duration + " is not a valid duration");
						if (!(this.equation = this.parseEquation(options.equation || "default"))) throw new Error("" + options.equation + " is not a valid equation");
						this.callback = options.callback || function() {};
						return this;
					};
					Animation.prototype.start = function(from, to) {
						var pass;
						this.stop();
						pass = !0;
						from === to && (pass = !1);
						if (this.duration === 0) {
							this.setter.call(this.node, to);
							pass = !1;
						}
						pass || requestFrame(this.callback);
						return pass;
					};
					Animation.prototype.parseDuration = function(duration) {
						var match, time, unit;
						if (!(match = string(duration).match(/([\d.]+)(s|ms)/))) return null;
						time = number(match[1]);
						unit = match[2];
						if (unit === "s") return time * 1e3;
						if (unit === "ms") return time;
					};
					Animation.prototype.parseEquation = function(equation) {
						var m, match, _len8, _p, _ref6, _results;
						equation = equations[equation] || equation;
						match = equation.replace(/\s+/g, "").match(/^cubic-bezier\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)$/);
						if (match) {
							_ref6 = match.slice(1);
							_results = [];
							for (_p = 0, _len8 = _ref6.length; _p < _len8; _p++) {
								m = _ref6[_p];
								_results.push(number(m));
							}
							return _results;
						}
						return null;
					};
					return Animation;
				}();
				beziers = {};
				JSAnimation = function(_super) {
					__extends(JSAnimation, _super);
					function JSAnimation(node, property) {
						var _this = this;
						JSAnimation.__super__.constructor.call(this, node, property);
						this.bstep = function(t) {
							return _this.step(t);
						};
					}
					JSAnimation.prototype.start = function(from, to) {
						if (JSAnimation.__super__.start.call(this, from, to)) {
							this.time = 0;
							from = this.numbers(from);
							to = this.numbers(to);
							if (from[0].length !== to[0].length) throw new Error("property length mismatch");
							this.from = from[0];
							this.to = to[0];
							this.template = to[1];
							requestFrame(this.bstep);
						}
						return this;
					};
					JSAnimation.prototype.stop = function() {
						cancelFrame(this.bstep);
						return this;
					};
					JSAnimation.prototype.step = function(now) {
						var delta, f, factor, i, tpl, _len8, _ref6;
						this.time || (this.time = now);
						factor = (now - this.time) / this.duration;
						factor > 1 && (factor = 1);
						delta = this.equation(factor);
						tpl = this.template;
						_ref6 = this.from;
						for (i = 0, _len8 = _ref6.length; i < _len8; i++) {
							f = _ref6[i];
							t = this.to[i];
							tpl = tpl.replace("@", t !== f ? this.compute(f, t, delta) : t);
						}
						this.setter.call(this.node, tpl);
						factor !== 1 ? requestFrame(this.bstep) : this.callback(t);
						return this;
					};
					JSAnimation.prototype.parseEquation = function(equation) {
						var ID, es;
						equation = JSAnimation.__super__.parseEquation.call(this, equation);
						es = equation.toString();
						ID = "" + es + ":" + this.duration + "ms";
						return es === [ 0, 0, 1, 1 ].toString() ? function(x) {
							return x;
						} : beziers[ID] || (beziers[ID] = bezier(equation[0], equation[1], equation[2], equation[3], this.duration * 2, 1e3 / 60 / this.duration / 4));
					};
					JSAnimation.prototype.compute = function(from, to, delta) {
						return (to - from) * delta + from;
					};
					JSAnimation.prototype.numbers = function(s) {
						var ns, replaced;
						ns = [];
						replaced = s.replace(/[-\d.]+/g, function(n) {
							ns.push(number(n));
							return "@";
						});
						return [ ns, replaced ];
					};
					return JSAnimation;
				}(Animation);
				CSSAnimation = function(_super) {
					__extends(CSSAnimation, _super);
					function CSSAnimation(node, property) {
						var _this = this;
						CSSAnimation.__super__.constructor.call(this, node, property);
						this.hproperty = hyphenate(translations[this.property] || this.property);
						this.bdefer = function(t) {
							return _this.defer(t);
						};
						this.bcomplete = function(e) {
							return _this.complete(e);
						};
					}
					CSSAnimation.prototype.start = function(from, to) {
						if (CSSAnimation.__super__.start.call(this, from, to)) {
							this.to = to;
							requestFrame(this.bdefer);
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
							this.callback();
						}
						return null;
					};
					CSSAnimation.prototype.removeProp = function(prop, a, b, c) {
						var i, io, p, _len8;
						for (i = 0, _len8 = a.length; i < _len8; i++) {
							p = a[i];
							if (p !== prop) continue;
							io = i;
							break;
						}
						if (io != null) {
							a.splice(io, 1);
							b.splice(io, 1);
							c.splice(io, 1);
						}
						return null;
					};
					CSSAnimation.prototype.modCSS = function(inclusive) {
						var e, p, rules;
						rules = computedStyle(this.node);
						p = rules(transitionName + "Property").replace(/\s+/g, "").split(",");
						d = rules(transitionName + "Duration").replace(/\s+/g, "").split(",");
						e = rules(transitionName + "TimingFunction").replace(/\s+/g, "").match(/cubic-bezier\(([\d.,]+)\)/g);
						this.removeProp("all", p, d, e);
						this.removeProp(this.hproperty, p, d, e);
						if (inclusive) {
							p.push(this.hproperty);
							d.push(this.duration);
							e.push(this.equation);
						}
						this.node.style[transitionName + "Property"] = p;
						this.node.style[transitionName + "Duration"] = d;
						this.node.style[transitionName + "TimingFunction"] = e;
						return null;
					};
					CSSAnimation.prototype.parseDuration = function(duration) {
						return "" + CSSAnimation.__super__.parseDuration.call(this, duration) + "ms";
					};
					CSSAnimation.prototype.parseEquation = function(equation) {
						return "cubic-bezier(" + CSSAnimation.__super__.parseEquation.call(this, equation) + ")";
					};
					return CSSAnimation;
				}(Animation);
				Animations = function() {
					function Animations() {
						this.uid = 0;
						this.animations = {};
					}
					Animations.prototype.retrieve = function(node, property) {
						var animation, uid, _base, _ref6;
						uid = (_ref6 = node["µid"]) != null ? _ref6 : node["µid"] = (this.uid++).toString(36);
						animation = (_base = this.animations)[uid] || (_base[uid] = {});
						return animation[property] || (animation[property] = transitionName ? new CSSAnimation(node, property) : new JSAnimation(node, property));
					};
					Animations.prototype.starts = function(nodes, styles, options) {
						var callback, completed, enforce, fp, fromParsers, fs, getter, i, instance, length, node, parsedFrom, parsedTo, parser, property, setter, toParsers, tp, ts, type, value, _len8, _len9, _p;
						options == null && (options = {});
						type = typeof options;
						options = type === "function" ? {
							callback: options
						} : type === "string" ? {
							duration: options
						} : options;
						callback = options.callback || function() {};
						completed = 0;
						length = 0;
						options.callback = function() {
							if (++completed === length) return callback();
						};
						for (property in styles) {
							value = styles[property];
							property = camelize(property);
							parser = parsers[property];
							if (!parser) throw new Error("no parser for " + property);
							setter = set(property);
							getter = get(property);
							for (_p = 0, _len8 = nodes.length; _p < _len8; _p++) {
								node = nodes[_p];
								length++;
								instance = this.retrieve(node, property);
								parsedFrom = new parser(getter.call(node));
								parsedTo = new parser(value);
								fromParsers = parsedFrom.extract();
								toParsers = parsedTo.extract();
								for (i = 0, _len9 = fromParsers.length; i < _len9; i++) {
									fp = fromParsers[i];
									tp = toParsers[i];
									if ("auto" === tp.value || "auto" === fp.value) throw new Error("cannot animate " + property + " from or to `auto`");
									if (tp.unit && fp.unit) {
										enforce = !0;
										if (tp.unit !== "px") {
											fp.value = fp.value / pixelRatio(node, tp.unit);
											fp.unit = tp.unit;
										}
									}
								}
								fs = parsedFrom.toString(!0);
								ts = parsedTo.toString(!0);
								enforce && setter.call(node, fs);
								instance.setOptions(options).start(fs, ts);
							}
						}
						return this;
					};
					Animations.prototype.start = function(nodes, property, value, options) {
						var styles;
						styles = {};
						styles[property] = value;
						return this.starts(nodes, styles, options);
					};
					Animations.prototype.sets = function(nodes, styles) {
						var node, property, setter, value, _len8, _p, _ref6, _ref7;
						for (property in styles) {
							value = styles[property];
							setter = set(property = camelize(property));
							for (_p = 0, _len8 = nodes.length; _p < _len8; _p++) {
								node = nodes[_p];
								(_ref6 = this.animations[node["µid"]]) != null && (_ref7 = _ref6[property]) != null && _ref7.stop(!0);
								setter.call(node, value);
							}
						}
						return this;
					};
					Animations.prototype.set = function(nodes, property, value) {
						var styles;
						styles = {};
						styles[property] = value;
						return this.sets(nodes, styles);
					};
					return Animations;
				}();
				animations = new Animations;
				mu = function(nod) {
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
				moofx.cancelFrame = cancelFrame;
				moofx.requestFrame = requestFrame;
				moofx.color = color;
				module.exports = moofx;
			},
			color: function(module, require, exports, global) {
				var HEXtoRGB, HSLtoRGB, HUEtoRGB, RGBtoRGB, colors;
				colors = {
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
				RGBtoRGB = function(r, g, b, a) {
					a == null && (a = 1);
					r = parseInt(r, 10);
					g = parseInt(g, 10);
					b = parseInt(b, 10);
					a = parseFloat(a);
					return r <= 255 && r >= 0 && g <= 255 && g >= 0 && b <= 255 && b >= 0 && a <= 1 && a >= 0 ? [ Math.round(r), Math.round(g), Math.round(b), a ] : null;
				};
				HEXtoRGB = function(hex) {
					var h0, h1, h2, h3, i, _ref, _results;
					hex.length === 3 && (hex += "f");
					if (hex.length === 4) {
						h0 = hex.charAt(0);
						h1 = hex.charAt(1);
						h2 = hex.charAt(2);
						h3 = hex.charAt(3);
						hex = h0 + h0 + h1 + h1 + h2 + h2 + h3 + h3;
					}
					hex.length === 6 && (hex += "ff");
					_results = [];
					for (i = 0, _ref = hex.length; i <= _ref; i += 2) _results.push(parseInt(hex.substr(i, 2), 16) / (i === 6 ? 255 : 1));
					return _results;
				};
				HUEtoRGB = function(p, q, t) {
					t < 0 && (t += 1);
					t > 1 && (t -= 1);
					return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
				};
				HSLtoRGB = function(h, s, l, a) {
					var b, g, p, q, r;
					a == null && (a = 1);
					h /= 360;
					s /= 100;
					l /= 100;
					a /= 1;
					if (h > 1 || h < 0 || s > 1 || s < 0 || l > 1 || l < 0 || a > 1 || a < 0) return null;
					if (s === 0) r = b = g = l; else {
						q = l < .5 ? l * (1 + s) : l + s - l * s;
						p = 2 * l - q;
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
			frame: function(module, require, exports, global) {
				var callbacks, iterator, requestAnimationFrame, running;
				callbacks = [];
				running = !1;
				iterator = function(time) {
					var i;
					time == null && (time = +(new Date));
					running = !1;
					i = callbacks.length;
					while (i) callbacks.splice(--i, 1)[0](time);
					return null;
				};
				typeof window != "undefined" && (requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame);
				requestAnimationFrame || (requestAnimationFrame = function(callback) {
					return setTimeout(callback, 1e3 / 60);
				});
				module.exports = {
					request: function(callback) {
						callbacks.push(callback);
						if (!running) {
							running = !0;
							requestAnimationFrame(iterator);
						}
						return this;
					},
					cancel: function(match) {
						var callback, i, _len;
						for (i = 0, _len = callbacks.length; i < _len; i++) {
							callback = callbacks[i];
							callback === match && callbacks.splice(i, 1);
						}
						return this;
					}
				};
			},
			bezier: function(module, require, exports, global) {
				module.exports = function(x1, y1, x2, y2, n, epsilon) {
					var a, b, c, i, u, x, xs, ys, _x, _y;
					xs = [ 0 ];
					ys = [ 0 ];
					x = 0;
					i = 1;
					while (i < n - 1) {
						u = 1 / n * i;
						a = Math.pow(1 - u, 2) * 3 * u;
						b = Math.pow(u, 2) * 3 * (1 - u);
						c = Math.pow(u, 3);
						_x = x1 * a + x2 * b + c;
						_y = y1 * a + y2 * b + c;
						if (_x - x > epsilon) {
							x = _x;
							xs.push(_x);
							ys.push(_y);
						}
						i++;
					}
					xs.push(1);
					ys.push(1);
					return function(t) {
						var left, middle, right;
						left = 0;
						right = xs.length - 1;
						while (left <= right) {
							middle = Math.floor((left + right) / 2);
							if (xs[middle] === t) break;
							xs[middle] > t ? right = middle - 1 : left = middle + 1;
						}
						return ys[middle];
					};
				};
			}
		}
	}
});