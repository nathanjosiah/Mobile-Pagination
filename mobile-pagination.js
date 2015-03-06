<?php
$banners = $this->banners;
?>
<link rel="stylesheet" href="<?=HORG_AUTO_URL?>/includes/partials/home-feature-banners/banners.css" />
<script src="<?=HORG_AUTO_URL?>/includes/js/calc-polyfill.min.js"></script>
<!--[if lte IE 8]>
<style>
#container-pusher {
	display: none;
}
#feature-banner-container {
	position: relative;
	top: 0;
	margin-top: -160px;
}
#feature-banner-nav {
	margin-top: 16px;
}
#feature-banners {
	margin: 0 auto;
	width: 960px;
	height: 368px;
	padding-top: 0;
}
</style>
<![endif]-->
<!--CONTENT_AREA_MARKER-->
<section id="feature-banners-wrapper">
	<div id="feature-banner-container" class="feature-banner-1-selected">
		<ul id="banner-indicator-wrapper">
			<li class="dot feature-banner-1-dot"></li>
			<li class="dot feature-banner-2-dot"></li>
			<li class="dot feature-banner-3-dot"></li>
			<li class="dot feature-banner-4-dot"></li>
		</ul>
		<ul id="feature-banners">
<?php
foreach($banners as $index => $banner) {
	$srcset = '';
	foreach($banner['images'] as $width => $url) {
		$srcset .= $url . ' ' . $width . 'w,';
	}
	$srcset = substr($srcset,0,-1);
?>
			<li class="feature-banner <?if($index==0) echo'current';?>" id="feature-banner-<?=$index+1?>">
<?	if(isset($banner['video'])) { ?>
				<div id="feature-banner-<?=$index+1?>-video" class="feature-banner-video"></div>
<?	} ?>
				<img class="feature-banner-image" <?=($index > 0 ? 'data-' : '')?>srcset="<?=$srcset?>" sizes="(max-width: 479px) 100vw,(min-width: 480px) and (max-width: 767px) 480px, 100vw" />
				<div class="feature-banner-content">
					<a href="<?=$banner['button_url']?>" class="right hui-button feature-banner-button"><?=$banner['button_text']?></a>
					<div class="feature-banner-text"><?=$banner['text']?></div>
				</div>
			</li>
<? } ?>
		</ul>
	</div>
	<nav id="feature-banner-nav">
		<ul>
<?php
foreach($banners as $index => $banner) {
	$srcset = '';
	foreach($banner['thumbnail_images'] as $width => $url) {
		$srcset .= $url . ' ' . $width . 'w,';
	}
	$srcset = substr($srcset,0,-1);
?>
			<li>
				<a href="#feature-banner-<?=$index+1?>" class="feature-banner-nav-item">
					<img class="feature-banner-nav-image"
						srcset="<?=$srcset?>"
						sizes="(max-width: 479px) 25vw, 24.25vw"
					/>
					<div class="feature-banner-nav-text"><?=$banner['thumbnail_text']?></div>
				</a>
			</li>
<? } ?>
		</ul>
		<div class="clear"></div>
	</nav>
</section>
<!--FOOTER_SCRIPT_MARKER-->
<script src="<?=HORG_AUTO_URL?>/includes/js/plugins/simple-pagination.js"></script>
<script src="<?=HORG_AUTO_URL?>/includes/partials/home-feature-banners/banners.js"></script>
<script>
try {
<?php
foreach($banners as $index => $banner) {
	if(!isset($banner['video'])) continue;
	$video = $banner['video'];
?>
	jwplayer('feature-banner-<?=$index+1?>-video').setup({
		width: '100%',
		height: '100%',
		aspectratio: '16:9',
		wmode: 'transparent',
		bgcolor: '#000000',
		skin: 'glow',
		primary: 'flash',
		androidhls: true,
		ga: {},
		autostart: <?=(isset($video['autoplay']) && $video['autoplay'] ? 'true' : 'false')?>,
		playlist: [{
			sources: [{
				file: '<?=$video['m3u8']?>'
			},{
				file: '<?=$video['mp4']?>'
			}]
		}],
		events: {
			onBeforePlay: function() {
				$('#feature-banner-<?=$index+1?>').addClass('video-playing');
				$('body').addClass('feature-banner-video-playing').removeClass('feature-banner-video-paused');
			},
			onComplete: function() {
				$('#feature-banner-<?=$index+1?>').removeClass('video-playing video-paused');
				$('body').removeClass('feature-banner-video-playing feature-banner-video-paused');
			},
			onPause: function() {
				$('#feature-banner-<?=$index+1?>').removeClass('video-playing').addClass('video-paused');
				$('body').removeClass('feature-banner-video-playing').addClass('feature-banner-video-paused');
			}
		}
	});
<? } ?>
}
catch(e){}
</script>