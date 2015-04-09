# Simple Pagination

A responsive-friendly UI widget to add paginated swipable content to a page. This plugin gives you control (if 
you need it) to define just how the user can interact with it.

Installation
--

Simply include the `simple-pagination.js` file. 

This is also available as bower package `nathanjosiah-simple-pagination` (install with `bower install nathanjosiah-simple-pagination`).

_**AMD Compatible**. Make sure `jquery` and `jquery-ui` are available dependencies (`jquery-ui` need only be the widget factory)_


Example Use
--

> Live examples can be found at [nathanjosiah.github.io/Simple-Pagination](http://nathanjosiah.github.io/Simple-Pagination/)

__html__

```html
<div>
    <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
    </ul>
</div>
<span id="console"></span>
<script src="jquery.js" />
<script src="jquery-ui.js" />
<script src="mobile-pagination.js" />
```

__js__

```js
$('div').simplePagination({
    // This is to force this example to work at all sizes
    isMobile: function(){return true;},
    onChange: function(index) {
        $('#console').text('Page is now  #' + index);
    }
});
```

__css__ 

> There are no hard rules on how to style the markup. This is just some basic styles to get you up and running.

```css
div {
    width: 300px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
}
ul {
    position: relative;
    display: block;
    margin: 0;
    padding:0;
    width: 1200px;
    -webkit-backface-visibility: hidden;
	will-change: transform;
    -ms-transform: translate(0,0);
    -webkit-transform: translate(0,0);
    transform: translate(0,0);
    -webkit-transition: -webkit-transform ease-out 300ms;
    -webkit-transition: transform ease-out 300ms;
    transition: -webkit-transform ease-out 300ms;
    transition: transform ease-out 300ms;
}
ul.is_touching {
    -webkit-transition: none;
    transition: none;
}
li {
    list-style: none;
    display: block;
    padding: 0;
    margin: 0;
    float: left;
    width: 300px;
    height: 200px;
    background-color: #ff0;
}

```


Options
--

option | type | description | default
------ | ---- | ----------- | -------
enabled | function or bool | Should return whether or not the behavior should exist at the current window size. | true
touchingClass | string | The class to be added while the view is being actively interacted with. | `is_touching`
swipeThreshold | integer | The number of pixels required to be moved in `swipeTimeThreshold` amount of time to constitute a swipe. | `10 * DPR`
swipeTimeThreshold | integer | The number of milleseconds to constitute a swipe. | 300
sliderSelector | string | The selector to `.find()` within the containing element that will be used as the sliding element. | `> ul`
easingFunction | function | The easing function to be used for the elasticity of the first and final pull cancelation. | `EaseOutQuad` from [Gizma](http://gizma.com/easing/)
maxEasingPercentage | float | The maximum percentage of the width of one slide that can be pulled as part of the first and final slides. This is used in conjuction with `easingFunction`. | 0.25
onChange | function | A callback to be used when a page changed. This callback will be given a single argument containing the 1-based index of the slide that is now showing. | `null`
pageOffset | function | Should return the pixel offset of the page at the 1-based index given in the first argument. | `$container.width() * (index - 1)`
shouldUseTransforms | function or bool | Whether or not the slider should be positioned with CSS transforms or using the `left` property. | Sniffing for native transform support.
dragPageThresholdPercentage | float | The percentage of a page that must be dragged to switch between pages. Note that this is separate from the swipe thresholds. | 0.5
pageSelector | string | The selector to `.find()` within the `sliderSelector` element to get the elements that represent the pages. | `> li`

Available Methods
--

method | arguments | description
------ | --------- | -----------
gotoPage | `new_index` => The 1-based index of the page to be visible | Used to scroll to a page. All applicable callbacks will be fired.
scrollPages | `offset` => The pixel offset to scroll into visibility | Used to scroll the slider to an arbitrary offset.
getProp | `prop_name` => The internal property to retrieve. | _Advanced!_ Used to grab an internal property of the instance of the widget. For functions, `this` will be set to the internal instance. An example can be found below.


Advanced Use
--

Some of the internal properties can be accessed if needed through the use of the `getProp` method. For example, let's say you need to prevent all `touchend` events at a capture level if the touch delta is within a certain threshold, you can do that as show here:

```js
var $container = $('div').simplePagination();
var stopTouchEndPropagation = false;
var preventDefaultTouchEndThreshold = 10;
$container.on('touchmove',function(e) {
	var touches = $container.simplePagination('getProp','touches');
	if(Math.abs(touches.delta.x) > preventDefaultTouchEndThreshold) {
		stopTouchEndPropagation = true;
	}
});
$container.get(0).addEventListener('touchend',function(e) {
	if(stopTouchEndPropagation) {
		e.stopPropagation();
		e.stopImmediatePropagation();
		e.preventDefault();
		stopTouchEndPropagation = false;
		$container.simplePagination('getProp','onTouchEnd')(e);
	}
},true);
```

Browser Compatibility
--

IE | Chrome | Firefox | Safari | Opera
----- | ------ | ------- | ------ | -----
8+ | any | 16+ | any | 12.1+

Requirments
--

jQuery | jQuery UI (Widget Factory)
------ | --------------------------
1.7+ | 1.8+
