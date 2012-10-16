```
            .-   3
.-.-..-..-.-|-._.
' ' '`-'`-' ' ' '
```

moofx (3) is a css3-enabled javascript animation library

## features

 - uses css3 transitions whenever available, falls back to normal javascript animation otherwise.
 - supports animating between different types of units, such as `em` to `px`, `px` to `%`, etc.
 - supports hsl colors for color-based properties.
 - supports transform animations in webkit browsers, firefox and ie9+.
 - includes a computedStyle normalizer.
 - framework agnostic, is easily pluggable in your favorite js framework.
 - cross browser.
 - small footprint, 6k gzipped (including dependencies).
 - simple api

## API

Every property in moofx can either be provided camelized (`backgroundColor`) or hyphenated (`background-color`).
Colors can be provided as rbg (`rgb(20,30,40)`), rbga (`rbga(20,30,40,0.5)`), hsl (`hsl(20,30,40)`), hsla (`hsla(20,30,40,0.5)`) hex (`#fa0`, `#ffaa00`), or hexa (`#ffaa00ff`, `#fa0f`).
Lengths will always be retrieved in pixels, unless they have a value of `auto`, and you are able to animate *from to whatever length unit to whatever length unit*.

moofx3 can animate and has full support for the following properties: `backgroundColor`, `color`, `backgroundSize`, `fontSize`, `height`, `width`, `marginTop`, `paddingTop`, `borderTopWidth`, `top`, `borderTopColor`, `borderTopStyle`, `marginRight`, `paddingRight`, `borderRightWidth`, `right`, `borderRightColor`, `borderRightStyle`, `marginBottom`, `paddingBottom`, `borderBottomWidth`, `bottom`, `borderBottomColor`, `borderBottomStyle`, `marginLeft`, `paddingLeft`, `borderLeftWidth`, `left`, `borderLeftColor`, `borderLeftStyle`, `borderTopLeftRadius`, `borderTopRightRadius`, `borderBottomRightRadius`, `borderBottomLeftRadius`, `zIndex`, `margin`, `padding`, `borderRadius`, `borderWidth`, `borderColor`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft`, `border`, `opacity`, `boxShadow`, `textShadow` and `transform`. Every other css property is handled automatically using getComputedStyle.

### moofx

the moofx method takes as first argument either a collection of nodes (such as the return value of `document.querySelectorAll`) an array of nodes (such as the expected return value of every dom selector library available, such as [`Slick`](https://github.com/mootools/slick), or [`Sizzle`](https://github.com/jquery/sizzle)), or a single node selected by whatever means.

It is however reccomended that you use moofx as part of a javascript library's api (see below).

```javascript
moofx(document.querySelectorAll('div.box'));
moofx(document.querySelector('div#box'));
moofx(Slick.find('div#box'));
moofx(Slick.search('div.box'));
moofx(Sizzle('div.box'));
moofx(document.getElementById('box'));
```

### moofx::animate

The `animate` method accepts either an object made of styles, or a property and a value, followed by the optional `options` object.

```javascript
moofx(nodes).animate({'background-color': '#ffa', 'color': 'black'}); //animate some styles, default options

moofx(nodes).animate('background-color', '#ffa'); //animate property to value

moofx(nodes).animate({'background-color': '#ffa', 'color': 'black'}, {duration: 500}); //animate styles using options (500ms duration)

moofx(nodes).animate('background-color', '#ffa', {duration: 500}); //animate property to value using options (500ms duration)

moofx(nodes).animate({'background-color': '#ffa'}, {duration: 5000}); //5s duration

moofx(nodes).animate({'background-color': '#ffa'}, {duration: "5000ms", equation: 'cubic-bezier(0.17,0.67,0.83,0.67)'}); //5s duration, cubic-bezier easing equation

moofx(nodes).animate({'background-color': '#ffa'}, {duration: "5s", equation: 'ease-in'}); //5s duration, ease-in easing equation

moofx(nodes).animate({'background-color': '#ffa'}, {duration: "5s", equation: 'ease-in-out', callback: function(){ //5s duration, ease-in-out easing equation, completion callback
	console.log('animated');
}});
```

### moofx::style

The `style` method accepts either an object made of styles or property and a value.

```javascript
moofx(nodes).style({'background-color': 'red', 'color': 'black'});  //set styles

moofx(nodes).style('background-color', 'rgba(0,0,0,0)'); //set style property to value
```

### moofx::compute

Computed style getter and normalizer. Note that lengths will always return in `px` (unless is `"auto"`) and colors in `rgba` for consistency.

```javascript
moofx(node).compute('background-color'); //get (normalized!) computed style of node for property
```

### moofx.requestFrame / moofx.cancelFrame

moofx also provides an advanced requestAnimationFrame shim, that supports canceling and the standard time argument.

```javascript
var callback = function(time){
	console.log(time);
};

moofx.requestFrame(callback); //sets callback to be executed on the next animationFrame
moofx.cancelFrame(callback); //whopsie, better not! callback will not get executed.

moofx.requestFrame(callback); //on second thought, let's do it
moofx.requestFrame(callback); //three
moofx.requestFrame(callback); //times

//and the time argument logged 3 times in your console will be the same, since the callbacks will get executed during the same animationFrame.
```

### moofx.color

moofx also exports a simple any-to-rgb color converter, with a very basic, very straightforward usage:

```javascript
moofx.color('#000'); //rgb(0, 0, 0)
moofx.color('#0000'); //rgba(0, 0, 0, 0)
moofx.color('#00000000'); //rgba(0, 0, 0, 0)

moofx.color('hsl(0, 0, 0)'); //rgb(0, 0, 0)
moofx.color('hsla(0, 0, 0, 0)'); //rgba(0, 0, 0, 0)
```

## installation

Include the pre-built moofx.js (or moofx-min.js) in the webpage of choice. Use it. Love it. Done.

## adapters

moofx was built to be used in conjuction with your favorite javascript framework. Some basic examples:

MooTools integration:

```javascript
Element.implement('animate', function(){
	var moo = moofx(this);
	moo.animate.apply(moo, arguments);
	return this;
});
```

jQuery integration:

```javascript
jQuery.fn.animate = function(){
	var moo = moofx(this.get());
	moo.animate.apply(moo, arguments);
	return this;
};
```

Then just get busy with your dollars.

## BIY (build-it-yourself)

You can build moofx (+dependencies) from source with [wrapup](https://github.com/kamicane/wrapup)

```
npm install wrapup -g
mkdir webdev
cd webdev
npm install moofx
wrup -r moofx moofx -o moofx.js
wrup -r moofx moofx -o moofx-min.js -c
```

Alternatively, you can use the `makejs` node executable in this repo (you still need wrapup installed).
