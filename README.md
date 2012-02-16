# moofx 3 (2.8.8α)

moofx3 is a css3 enabled, small footprinted javascript animation library.

Requires an ES5 shim, such as [MooTools](http://mootools.net).

## features

 - uses css3 transitions whenever available, falls back to normal javascript animation otherwise.
 - supports hsl colors for color-based properties such as `color` (duh).
 - supports transform animations in webkit browsers, firefox and ie9+.
 - also contains a very useful computedStyle normalizer.
 - framework agnostic, is easily pluggable in your favorite js framework.
 - cross browser (not sure exactly which browsers just yet).
 - small footprint (less than 10k compressed).
 - animation state is managed internally. no more checks.

## API

Every property in moofx can either be provided camelized (`backgroundColor`) or hyphenated (`background-color`).
Colors can be provided as rbg (`rgb(20,30,40)`), rbga (`rbga(20,30,40,0.5)`), hsl (`hsl(20,30,40)`), hsla (`hsla(20,30,40,0.5)`) hex (`#ffa`, `#ffaa00`), or hexa (`#ffaa00ff`, `#fa0f`).

moofx3 can animate the following properties: `backgroundColor`, `color`, `backgroundSize`, `fontSize`, `height`, `width`, `marginTop`, `paddingTop`, `borderTopWidth`, `top`, `borderTopColor`, `borderTopStyle`, `marginRight`, `paddingRight`, `borderRightWidth`, `right`, `borderRightColor`, `borderRightStyle`, `marginBottom`, `paddingBottom`, `borderBottomWidth`, `bottom`, `borderBottomColor`, `borderBottomStyle`, `marginLeft`, `paddingLeft`, `borderLeftWidth`, `left`, `borderLeftColor`, `borderLeftStyle`, `borderTopLeftRadius`, `borderTopRightRadius`, `borderBottomRightRadius`, `borderBottomLeftRadius`, `zIndex`, `margin`, `padding`, `borderRadius`, `borderWidth`, `borderStyle`, `borderColor`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft`, `border`, `opacity`, `transform`.

### moo

The `moo` method either accepts a collection of nodes (such as the return value of `document.querySelectorAll`) an array of nodes (such as the expected return value of every dom selector library available, such as [`Slick`](https://github.com/mootools/slick), or [`Sizzle`](https://github.com/jquery/sizzle)), or a single node selected by whatever means.

```javascript

moo(document.querySelectorAll('div.box'));
moo(document.querySelector('div#box'));
moo(Slick.find('div#box'));
moo(Slick.search('div.box'));
moo(Sizzle('div.box'));
moo(document.getElementById('box'));
```

### moo:fx

The `fx` method accepts either an object made of styles, or a property and a value, followed by the optional `options` object.


```javascript

moo(nodes).fx({'background-color': '#ffa', 'color': 'black'}); //animate some styles, default options

moo(nodes).fx('background-color', '#ffa'); //animate property to value

moo(nodes).fx({'background-color': '#ffa', 'color': 'black'}, {duration: 500}); //animate styles using options (500ms duration)

moo(nodes).fx('background-color', '#ffa', {duration: 500}); //animate property to value using options (500ms duration)

moo(nodes).fx({'background-color': '#ffa'}, {duration: 5000}); //5s duration

moo(nodes).fx({'background-color': '#ffa'}, {duration: "5000ms", equation: 'cubic-bezier(0.17,0.67,0.83,0.67)'}); //5s duration, cubic-bezier easing equation

moo(nodes).fx({'background-color': '#ffa'}, {duration: "5s", equation: 'ease-in'}); //5s duration, ease-in easing equation

moo(nodes).fx({'background-color': '#ffa'}, {duration: "5s", equation: 'ease-in-out', callback: function(){ //5s duration, ease-in-out easing equation, completion callback
	console.log('animated');
}});
```

### moo:style

The `style` method accepts either an object made of styles, a property and a value, or a single property. When a single property is passed, the method `style` acts as a getter.

```javascript

moo(nodes).style({'background-color': 'red', 'color': 'black'});  //set styles

moo(nodes).style('background-color', 'rgba(0,0,0,0)'); //set style property to value

moo(node).style('background-color'); //get computed style for property
```

## build

You can build moofx3 using [packager](https://github.com/kamicane/packager):

```
./packager register /path/to/moofx
./packager build moofx/* > ~/Downloads/moofx3.js
```
