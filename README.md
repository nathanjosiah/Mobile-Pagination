# mobile-pagination
A simple pagination widget to add swiping capabilities to a list of items on mobile (or any) devices.

Example Use
--

> Basic example show can be [found here](http://jsfiddle.net/nathanjosiah/ggsmf64u/).
> Example with pagination can be [found here](http://jsfiddle.net/nathanjosiah/ggsmf64u/4/).

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
$('div').mobilePagination({
    // This is to force this example to work at all sizes
    isMobile: function(){return true;},
    onChange: function(index) {
        $('#console').text('Banner is now  #' + index);
    }
});
```

__css__

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
isMobile| function | Should return whether or not the behavior should exist at the current window size. | `$(window).width() < 768`
touchingClass | string | The class to be added while the view is being actively interacted with. | `is_touching`
swipeThreshold | integer | The number of pixels required to be moved in `swipeTimeThreshold` amount of time to constitute a swipe. | `10 * DPR`
swipeTimeThreshold | integer | The number of milleseconds to constitute a swipe. | 300
sliderSelector | string | The selector to `.find()` within the containing element that will be used as the sliding element. | `> ul`
easingFunction | function | The easing function to be used for the elasticity of the first and final pull cancelation. | `EaseOutQuad` from [Gizma](http://gizma.com/easing/)
maxEasingPercentage | float | The maximum percentage of the width of one slide that can be pulled as part of the first and final slides. This is used in conjuction with `easingFunction`. | 0.25
onChange | function | A callback to be used when a banner changed. This callback will be given a single argument containing the 1-based index of the slide that is now showing. | `null`
bannerOffset | function | Should return the pixel offset of the banner at the 1-based index given in the first argument. | `$container.width() * (index - 1)`

Available Methods
--

method | arguments | description
------ | --------- | -----------
gotoBanner | `new_index` => The 1-based index of the slide to be visible | Used to scroll to a banner. All applicable callbacks will be fired.
scrollBanners | `offset` => The pixel offset to scroll into visibility | Used to scroll the slider to an arbitrary offset.
getProp | `prop_name` => The internal property to retrieve. | _Advanced!_ Used to grab an internal property of the instance of the widget. For functions, `this` will be set to the internal instance. An example can be found below.


Advanced Use
--

Some of the internal properties can be accessed if needed through the use of the `getProp` method. For example, let's say you need to prevent all `touchend` events at a capture level if the touch delta is within a certain threshold, you can do that as show here:

```js
var $container = $('div').mobilePagination();
var stopTouchEndPropagation = false;
var preventDefaultTouchEndThreshold = 10;
$container.on('touchmove',function(e) {
	var touches = $container.mobilePagination('getProp','touches');
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
		$container.mobilePagination('getProp','onTouchEnd')(e);
	}
},true);
```

Browser Compatibility
--

While there are plans of expanding support, currently, without a polyfill for transforms in IE < 9 this plugin requires:

IE | Chrome | Firefox | Safari | Opera
-- | ------ | ------- | ------ | -----
9+ | any | 16+ | any | 12.1+