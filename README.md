# mobile-pagination
A simple pagination widget to add swiping capabilities to a list of items on mobile (or any) devices.

Example Use
--

> Live example can be [found here](http://jsfiddle.net/nathanjosiah/ggsmf64u/).

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