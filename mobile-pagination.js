/**
 * @author Nathan Smith <nathanjosiah@gmail.com>
 * @link https://github.com/nathanjosiah/mobile-pagination
 */
$.widget('nathanjosiah.mobilePagination',{
	options: {
		touchingClass: 'is_touching',
		swipeThreshold: 10,
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
		onChange: null
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
	_create: function() {
		this.$container = $(this.element);
		this.$slider = this.$container.find(this.options.sliderSelector);
		this.bannerCount = this.$slider.children().length;
		this.id = Math.random() * 10000;
		var that = this;

		that.$container
		.on('touchstart.' + this.namespace,function(e) {
			if(!that.options.isMobile()) {
				that.ignoreTouch = true;
				return true;
			}
			that.$slider.addClass(that.options.touchingClass);
			var touch = e.originalEvent.touches[0];
			that.touches.start = {
				x: touch.clientX,
				y: touch.clientY
			};
			that.fb.start.container_offset = that.$container.offset();
			that.fb.start.scroll = that.fb.current.scroll;
			that.touches.start_relative = {
				x: touch.clientX - that.fb.start.container_offset.left + that.fb.start.scroll,
				y: touch.clientY - that.fb.start.container_offset.top
			}
			that.touches.start_time = new Date();
		})
		.on('touchmove.' + this.namespace,function(e) {
			if(that.ignoreTouch) return true;
			var touch = e.originalEvent.touches[0];
			that.touches.delta = {
				x: touch.clientX - that.touches.start.x,
				y: touch.clientY - that.touches.start.y
			};
			// User is trying to scroll vertically
			if(Math.abs(that.touches.delta.x) < Math.abs(that.touches.delta.y)) {
				return true;
			}
			e.preventDefault();
			var scroll_to = that.fb.start.scroll + that.touches.delta.x;

			if(that.options.easingFunction) {
				var container_width = that.$container.width();
				var max_elastic_pull = container_width * that.options.maxEasingPercentage;
				// The user is trying to pull the first or last banner
				if(that.fb.slide_index === that.bannerCount && that.touches.delta.x < 0) {
					scroll_to = that.fb.start.scroll - that.options.easingFunction(that.touches.delta.x * -1,0,max_elastic_pull,container_width);
				}
				else if(that.fb.slide_index === 1 && that.touches.delta.x > 0) {
					scroll_to = that.fb.start.scroll + that.options.easingFunction(that.touches.delta.x,0,max_elastic_pull,container_width);
				}
			}
			that.scrollBanners(scroll_to);
		})
		.on('touchend.mobilePagination touchcancel.' + this.namespace,function() {
			if(that.ignoreTouch) {
				that.ignoreTouch = false;
				return true;
			}
			that.$slider.removeClass(that.options.touchingClass);
			var now = new Date();
			var start_time = that.touches.start_time.getTime();
			var duration = now.getTime() - start_time;

			// Detect a swipe
			if(duration < that.options.swipeTimeThreshold && Math.abs(that.touches.delta.x) > that.options.swipeThreshold) {
				var slide_direction = (that.touches.delta.x < 0 ? 1 : -1);
				var new_index = (slide_direction === -1 ? that.fb.slide_index - 1 : that.fb.slide_index + 1);

				if(new_index === 0) that.gotoBanner(1);
				else if(new_index === that.bannerCount+1) that.gotoBanner(that.bannerCount);
				else that.gotoBanner(new_index);
			}
			// Normal drag
			else {
				var container_width = that.$container.width();
				var total_width = that.$slider.width();
				var half_slide_width = (container_width * 0.5);
				var percentage = parseInt((((that.fb.current.scroll * -1) + half_slide_width) / total_width) * 100);
				var slide_index = Math.ceil(percentage/((container_width / total_width) * 100));

				if(slide_index > that.bannerCount) slide_index = that.bannerCount;
				else if(slide_index < 1) slide_index = 1;
				that.gotoBanner(slide_index);
			}
		});
		this.$window.on('resize.' + this.namespace + this.id + ' orientationchange.' + this.namespace + this.id,function() {
			if(that.options.isMobile()) {
				that.gotoBanner(that.fb.slide_index);
			}
			else {
				that.$slider.css('-webkit-transform','');
				that.$slider.css('transform','');
			}
		});
	},
	_destroy: function() {
		this.$window.off('resize.' + this.namespace + this.id + ' orientationchange.' + this.namespace + this.id);
		this.$container.off('.' + this.namespace);
	},
	gotoBanner: function(new_index) {
		var container_width = this.$container.width();
		this.fb.slide_index = new_index;
		if(this.options.onChange) {
			this.options.onChange.call(this.$container,new_index);
		}
		if(this.options.isMobile()) {
			this.scrollBanners((container_width * (this.fb.slide_index - 1)) * -1);
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