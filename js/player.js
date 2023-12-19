var ul =  document.getElementById("video-list");
var url = location.search.split('url=')[1];
var title = document.title
if(!url){
	var li = ul.querySelector('li');
	url = li.getAttribute('value');
	document.title = li.getAttribute('title') +' | ' + title	
}

changeVideo(url)

loadM3u("https://cdn.jsdelivr.net/gh/wefashe/MyIptv@main/iptv.m3u");

function loadM3u(m3uPath){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", m3uPath, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var content = xhr.responseText;
			var contents = content.substring(content.indexOf("#EXTINF:")).split("#EXTINF:");
			for (var i = 0; i < contents.length; i++) {
				var c = contents[i].replace(/^\s+|\s+$/g,'');
				if(!c){
					continue
				}
				var m3nuUrl = c.substring(c.lastIndexOf("\n")+1)
				if(m3nuUrl.substr(0, 4) != "http"){
					continue
				}
				var logo = getValue(c,'tvg-logo')
				var name = getValue(c,'tvg-name')
				if(!name){
					name = c.substring(c.lastIndexOf(",")+1,c.lastIndexOf("\n"))
				}
				var title = getValue(c,'group-title')
				var li = document.createElement("li");
				li.setAttribute("value", m3nuUrl);
				li.setAttribute("title", name);
				li.innerHTML = name;
				li.onclick =  function (){
					changeVideo(this.getAttribute('value'))
					history.replaceState(null, null, window.location.href.split('?')[0]);
					document.title = this.getAttribute('title') +' | ' + title	
				}
				ul.appendChild(li);
			}			
		}
	};
	xhr.send();
}

function getValue(content, key){
	content = content.match(new RegExp(`${key}=".*?"`))[0];
	return content.substring(content.indexOf("\"") + 1,content.lastIndexOf("\""));
}

function changeVideo(videoSrc){
	console.log(videoSrc);
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

var list = ul.querySelectorAll('li');
for (var i = 0; i < list.length; i++) {
	list[i].onclick =  function (){
		changeVideo(this.getAttribute('value'))
		history.replaceState(null, null, window.location.href.split('?')[0]);	
		document.title = this.getAttribute('title') +' | ' + title
	}
}
