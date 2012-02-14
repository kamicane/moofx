# moofx 3 (µ » 2.8.7α)

moofx3 is a css3 enabled javascript animation library.

Requires an ES5 shim, such as [MooTools](http://mootools.net).

## features

 - uses css3 transitions whenever available, falls back to normal javascript animation otherwise.
 - supports hsl colors for color-based properties such as `color` (duh).
 - supports transform animations in webkit browsers, firefox and ie9+.
 - also contains a very useful computedStyle normalizer.
 - framework agnostic. can be used in conjunction with your favorite js framework, which is [MooTools](http://mootools.net).
 - cross browser (not sure exactly which browsers just yet).
 - uses utf-8 characters in the source code.
 - small footprint (less than 10k compressed).
 - animation state is entirely managed by moofx.

## API

### animate

```javascript

µ(element).fx(styles); //animate styles, default options

µ(element).fx(property, value); //animate property to value

µ(element).fx(styles, options); //animate styles using options

µ(element).fx(property, value, options); //animate property to value using options

µ(element).fx(styles, {duration: 5000}); //5s duration

µ(element).fx(styles, {duration: "5000ms", equation: 'cubic-bezier(0.17,0.67,0.83,0.67)'}); //5s duration, cubic-bezier easing function

µ(element).fx(styles, {duration: "5s", equation: 'cubic-bezier(0,1,1,0)'}); //5s duration, cubic-bezier easing function

µ(element).fx(styles, {duration: "5s", equation: 'cubic-bezier(0,1,1,0)', callback: function(){ //5s duration, cubic-bezier easing function, completion callback
	console.log('animated');
}});
```
	
### style

```javascript

µ(element).style(styles);

µ(element).style({background: 'red'});  //set styles

µ(element).style(property, value); //set style property to value

µ(element).style(property); //getter
```

### copy & paste this if you don't know how to do µ (it's  ⌘+m on macs)

```javascript
var mu = µ;
```

## build

download [packager](https://github.com/kamicane/packager)

```
./packager register /path/to/moofx
./packager build µ/fx > ~/Downloads/moofx3.js
```
