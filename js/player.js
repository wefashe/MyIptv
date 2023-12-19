var ul =  document.getElementById("video-list");
var url = location.search.split('url=')[1];
if(!url){
	var li = ul.querySelector('li');
	url = li.getAttribute('value');
}
changeVideo(url)

var list = ul.querySelectorAll('li');
for (var i = 0; i < list.length; i++) {
list[i].onclick =  function (){
	changeVideo(this.getAttribute('value'))
	history.replaceState(null, null, window.location.href.split('?')[0]);
}
}

function changeVideo(videoSrc){
	video = document.getElementById('video');
	// 检查浏览器是否支持hls
	if (video.canPlayType('application/vnd.apple.mpegurl')) {
		video.src = videoSrc;
	// 如不支持则调用hls.min.js
	} else if (Hls.isSupported()) { 
		if(typeof hls !== 'undefined'){
			hls.destroy();
		}
		hls = new Hls();
		hls.loadSource(videoSrc);
		hls.attachMedia(video);		
		hls.on(Hls.Events.MANIFEST_PARSED, function () {
			 video.play();
		});
	}
}
