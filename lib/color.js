// color conversion from any to rgb

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
	if (a == null) a = 1;
	r = parseInt(r, 10);
	g = parseInt(g, 10);
	b = parseInt(b, 10);
	a = parseFloat(a);
	if (!(r <= 255 && r >= 0 && g <= 255 && g >= 0 && b <= 255 && b >= 0 && a <= 1 && a >= 0)) {
		return null;
	}
	return [ Math.round(r), Math.round(g), Math.round(b), a ];
};

HEXtoRGB = function(hex) {
	var h0, h1, h2, h3, i, _ref, _results;
	if (hex.length === 3) hex += "f";
	if (hex.length === 4) {
		h0 = hex.charAt(0);
		h1 = hex.charAt(1);
		h2 = hex.charAt(2);
		h3 = hex.charAt(3);
		hex = h0 + h0 + h1 + h1 + h2 + h2 + h3 + h3;
	}
	if (hex.length === 6) hex += "ff";
	_results = [];
	for (i = 0, _ref = hex.length; i <= _ref; i += 2) {
		_results.push(parseInt(hex.substr(i, 2), 16) / (i === 6 ? 255 : 1));
	}
	return _results;
};

HUEtoRGB = function(p, q, t) {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	return p;
};

HSLtoRGB = function(h, s, l, a) {
	var b, g, p, q, r;
	if (a == null) a = 1;
	h /= 360;
	s /= 100;
	l /= 100;
	a /= 1;
	if (h > 1 || h < 0 || s > 1 || s < 0 || l > 1 || l < 0 || a > 1 || a < 0) {
		return null;
	}
	if (s === 0) {
		r = b = g = l;
	} else {
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
	if (typeof input !== "string") return null;
	input = colors[input = input.replace(/\s+/g, "")] || input;
	if (input.match(/^#[a-f0-9]{3,8}/)) {
		input = HEXtoRGB(input.replace("#", ""));
	} else if (match = input.match(/([\d.])+/g)) {
		if (input.match(/^rgb/)) {
			input = match;
		} else if (input.match(/^hsl/)) {
			input = HSLtoRGB.apply(null, match);
		} else {
			return null;
		}
	} else {
		return null;
	}
	if (!(input && (input = RGBtoRGB.apply(null, input)))) return null;
	if (array) return input;
	if (input[3] === 1) input.splice(3, 1);
	return "rgb" + (input.length > 3 ? "a" : "") + "(" + input + ")";
};
