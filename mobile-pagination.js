/**
 * @author Nathan Smith <nathanjosiah@gmail.com>
 * @link https://github.com/nathanjosiah/mobile-pagination
 */
$.widget('nathanjosiah.mobilePagination',{
	options: {
		touchingClass: 'is_touching',
		swipeThreshold: 10 * (window.devicePixelRatio || 1),
		swipeTimeThreshold: 300,
		sliderSelector: '> ul',

		//EaseOutQuad http://gizma.com/easing/
		easingFunction: function (t,b,c,d) {
			t /= d;
			return -c * t*(t-2) + b;
		},
		maxEasingPercentage: 0.25,
		isMobile: function() {
			return $(window).width() < 768;
		},
		onChange: null,
		bannerOffset: function(index) {
			var container_width = this.$container.width();
			return (container_width * (index - 1));
		}
	},
	$window: $(window),
	$container: null,
	$slider: null,
	bannerCount: null,
	ignoreTouch: false,
	id: null,
	namespace: 'mobilePagination',
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

		// Detect a swipe
		if(duration < this.options.swipeTimeThreshold && Math.abs(this.touches.delta.x) > this.options.swipeThreshold) {
			var slide_direction = (this.touches.delta.x < 0 ? 1 : -1);
			var new_index = (slide_direction === -1 ? this.fb.slide_index - 1 : this.fb.slide_index + 1);

			if(new_index === 0) this.gotoBanner(1);
			else if(new_index === this.bannerCount+1) this.gotoBanner(this.bannerCount);
			else this.gotoBanner(new_index);
		}
		// Normal drag
		else {
			var container_width = this.$container.width();
			var total_width = this.$slider.width();
			var half_slide_width = (container_width * 0.5);
			var percentage = parseInt((((this.fb.current.scroll * -1) + half_slide_width) / total_width) * 100);
			var slide_index = Math.ceil(percentage/((container_width / total_width) * 100));

			if(slide_index > this.bannerCount) slide_index = this.bannerCount;
			else if(slide_index < 1) slide_index = 1;
			this.gotoBanner(slide_index);
		}
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
			// The user is trying to pull the first or last banner
			if(this.fb.slide_index === this.bannerCount && this.touches.delta.x < 0) {
				scroll_to = this.fb.start.scroll - this.options.easingFunction(this.touches.delta.x * -1,0,max_elastic_pull,container_width);
			}
			else if(this.fb.slide_index === 1 && this.touches.delta.x > 0) {
				scroll_to = this.fb.start.scroll + this.options.easingFunction(this.touches.delta.x,0,max_elastic_pull,container_width);
			}
		}
		this.scrollBanners(scroll_to);
	},
	onTouchStart: function(e) {
		if(!this.options.isMobile()) {
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
		if(this.options.isMobile()) {
			this.gotoBanner(this.fb.slide_index);
		}
		else {
			this.$slider.css('-webkit-transform','');
			this.$slider.css('transform','');
		}
	},
	getProp: function(what) {
		var prop = this[what];
		if(typeof prop === 'function') {
			prop = $.proxy(prop,this);
		}
		return prop;
	},
	_create: function() {
		this.$container = $(this.element);
		this.$slider = this.$container.find(this.options.sliderSelector);
		this.bannerCount = this.$slider.children().length;
		this.id = Math.random() * 10000;
		var that = this;

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
	gotoBanner: function(new_index) {
		this.fb.slide_index = new_index;
		if(this.options.onChange) {
			this.options.onChange.call(this.$container,new_index);
		}
		if(this.options.isMobile()) {
			this.scrollBanners($.proxy(this.options.bannerOffset,this)(this.fb.slide_index) * -1);
		}
		else {
			this.$slider.css('-webkit-transform','');
			this.$slider.css('transform','');
		}
	},
	scrollBanners: function(offset) {
		this.$slider.css('-webkit-transform','translate(' + offset + 'px,0)');
		this.$slider.css('transform','translate(' + offset + 'px,0)');
		this.fb.current.scroll = offset;
	}
});