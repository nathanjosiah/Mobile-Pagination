/**
 * @author Nathan Smith <nathanjosiah@gmail.com>
 * @link https://github.com/nathanjosiah/Simple-Pagination
 */
;(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery','jquery-ui'],factory);
	}
	else {
		factory(jQuery);
	}
}(function ($) {

$.widget('nathanjosiah.simplePagination',{
	options: {
		touchingClass: 'is_touching',
		swipeThreshold: 10 * (window.devicePixelRatio || 1),
		swipeTimeThreshold: 300,
		dragPageThresholdPercentage: 0.5,
		sliderSelector: '> ul',

		//EaseOutQuad http://gizma.com/easing/
		easingFunction: function (t,b,c,d) {
			t /= d;
			return -c * t*(t-2) + b;
		},
		maxEasingPercentage: 0.25,
		enabled: true,
		onChange: null,
		pageOffset: function(index) {
			var container_width = this.$container.width();
			return (container_width * (index - 1));
		},
		pageSelector: '> li',
		shouldUseTransforms: function() {
			var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
			var div = document.createElement('div');
			for(var i = 0; i < prefixes.length; i++) {
				if(div && div.style[prefixes[i]] !== undefined) {
					return prefixes[i];
				}
			}
			return false;
		}
	},
	isEnabled: function() {
		if(typeof this.options.enabled === 'function') {
			return this.options.enabled.call(this);
		}
		return !!this.options.enabled;
	},
	shouldUseTransforms: null,
	$window: $(window),
	$container: null,
	$slider: null,
	pages: null,
	pageCount: null,
	ignoreTouch: false,
	id: null,
	namespace: 'simplePagination',
	touches: {
		start_time: null,
		start: {},
		start_relative: {},
		delta: {}
	},
	fb: {
		start: {
			scroll: 0,
			container_offset: {}
		},
		slide_index: 1,
		current: {
			scroll: 0
		}
	},
	onTouchEnd: function(e) {
		if(this.ignoreTouch) {
			this.ignoreTouch = false;
			return true;
		}
		this.$slider.removeClass(this.options.touchingClass);
		var now = new Date();
		var start_time = this.touches.start_time.getTime();
		var duration = now.getTime() - start_time;
		var new_slide_index;

		// Detect a swipe
		if(duration < this.options.swipeTimeThreshold && Math.abs(this.touches.delta.x) > this.options.swipeThreshold) {
			var slide_direction = (this.touches.delta.x < 0 ? 1 : -1);
			new_slide_index = (slide_direction === -1 ? this.fb.slide_index - 1 : this.fb.slide_index + 1);

			if(new_slide_index === 0) new_slide_index = 1;
			else if(new_slide_index === this.pageCount+1) new_slide_index = this.pageCount;
		}
		// Normal drag
		else {
			var container_width = this.$container.width();
			var total_width = this.$slider.width();
			var half_slide_width = (container_width * this.options.dragPageThresholdPercentage);
			var percentage = parseInt((((this.fb.current.scroll * -1) + half_slide_width) / total_width) * 100);
			new_slide_index = Math.ceil(percentage/((container_width / total_width) * 100));

			if(new_slide_index > this.pageCount) new_slide_index = this.pageCount;
			else if(new_slide_index < 1) new_slide_index = 1;
		}

		this.gotoPage(new_slide_index);
	},
	onTouchMove: function(e) {
		if(this.ignoreTouch) return true;
		var touch = e.originalEvent.touches[0];
		this.touches.delta = {
			x: touch.clientX - this.touches.start.x,
			y: touch.clientY - this.touches.start.y
		};
		// User is trying to scroll vertically
		if(Math.abs(this.touches.delta.x) < Math.abs(this.touches.delta.y)) {
			return true;
		}
		e.preventDefault();

		var scroll_to = this.fb.start.scroll + this.touches.delta.x;

		if(this.options.easingFunction) {
			var container_width = this.$container.width();
			var max_elastic_pull = container_width * this.options.maxEasingPercentage;
			// The user is trying to pull the first or last page
			if(this.fb.slide_index === this.pageCount && this.touches.delta.x < 0) {
				scroll_to = this.fb.start.scroll - this.options.easingFunction(this.touches.delta.x * -1,0,max_elastic_pull,container_width);
			}
			else if(this.fb.slide_index === 1 && this.touches.delta.x > 0) {
				scroll_to = this.fb.start.scroll + this.options.easingFunction(this.touches.delta.x,0,max_elastic_pull,container_width);
			}
		}
		this.scrollPages(scroll_to);
	},
	onTouchStart: function(e) {
		if(!this.isEnabled()) {
			this.ignoreTouch = true;
			return true;
		}
		this.$slider.addClass(this.options.touchingClass);
		var touch = e.originalEvent.touches[0];
		this.touches.start = {
			x: touch.clientX,
			y: touch.clientY
		};
		this.fb.start.container_offset = this.$container.offset();
		this.fb.start.scroll = this.fb.current.scroll;
		this.touches.start_relative = {
			x: touch.clientX - this.fb.start.container_offset.left + this.fb.start.scroll,
			y: touch.clientY - this.fb.start.container_offset.top
		}
		this.touches.start_time = new Date();
	},
	onResize: function() {
		if(this.isEnabled()) {
			this.gotoPage(this.fb.slide_index);
		}
		else {
			var val = '';
			this.$slider.css({
				'-ms-transform': val,
				'-webkit-transform': val,
				transform: val
			});
		}
	},
	getProp: function(what) {
		var prop = this[what];
		if(typeof prop === 'function') {
			prop = $.proxy(prop,this);
		}
		return prop;
	},
	_refresh: function() {
		this.$slider = this.$container.find(this.options.sliderSelector);
		this.$pages = this.$slider.find(this.options.pageSelector);
		this.pageCount = this.$pages.length;
	},
	_create: function() {
		this.$container = $(this.element);
		this.id = Math.random() * 10000;
		this._refresh();
		var that = this;

		if(typeof this.options.shouldUseTransforms === 'function') {
			this.shouldUseTransforms = this.options.shouldUseTransforms.call(this);
		}
		else {
			this.shouldUseTransforms = !!this.options.shouldUseTransforms;
		}

		this.$container
		.on('touchstart.' + this.namespace,this.getProp('onTouchStart'))
		.on('touchmove.' + this.namespace,this.getProp('onTouchMove'))
		.on('touchend.' + this.namespace + ' touchcancel.' + this.namespace,this.getProp('onTouchEnd'));
		this.$window.on('resize.' + this.namespace + this.id + ' orientationchange.' + this.namespace + this.id,this.getProp('onResize'));
	},
	_destroy: function() {
		this.$window.off('resize.' + this.namespace + this.id + ' orientationchange.' + this.namespace + this.id);
		this.$container.off('.' + this.namespace);
	},
	gotoPage: function(new_index) {
		this.fb.slide_index = new_index;
		if(this.isEnabled()) {
			this.scrollPages($.proxy(this.options.pageOffset,this)(this.fb.slide_index) * -1);
		}
		else {
			var val = '';
			this.$slider.css({
				'-ms-transform': val,
				'-webkit-transform': val,
				transform: val
			});
		}
		if(this.options.onChange) {
			this.options.onChange.call(this.$container,this.fb.slide_index);
		}
	},
	scrollPages: function(offset) {
		if(this.shouldUseTransforms) {
			var val = 'translate(' + offset + 'px,0)';
			this.$slider.css({
				'-ms-transform': val,
				'-webkit-transform': val,
				transform: val
			});
		}
		else {
			this.$slider.css('left',offset + 'px');
		}
		this.fb.current.scroll = offset;
	}
});


}));
