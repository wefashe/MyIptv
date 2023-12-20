var url = location.search.split('url=')[1];
if(!url){
	// 默认地址
	url = "https://cdn.jsdelivr.net/gh/wefashe/MyIptv@main/iptv.m3u"
}

// 校验格式
var dotIndex = url.lastIndexOf('.');
var suffixName = url.substr(dotIndex + 1);
if(!/(m3u8|m3u|txt)$/i.test(suffixName)){
	alert("暂不支持该格式！");
	// 关闭窗口
	// window.opener=null;window.top.open('','_self','');window.close(this);
}

if(suffixName === 'm3u8'){
	videoPlay(url)
}

if(/(m3u|txt)$/i.test(suffixName)){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var content = xhr.responseText;
			if(content){
				content = content.trim();
			}
			if(!content){
				return;
			}
					
			if(suffixName === 'txt'){
				items = content.split("\n");
			}
			if(suffixName === 'm3u'){
				items = content.substring(content.indexOf("#EXTINF:")).split("#EXTINF:");
			}
			var title = document.title;
			var ul =  document.getElementById("video-list");
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if(item){
					item = item.trim();
				}
				if(!item){
					continue;
				}
				if(!item.indexOf('http')){
					continue;
				}
				if(suffixName === 'txt'){
					m3u8 = item.substring(item.indexOf(',')+1);
					name = item.substring(0, item.indexOf(','));
				}
				if(suffixName === 'm3u'){
					m3u8 = item.substring(item.lastIndexOf("\n")+1);
					logo = getValueByKey(item,'tvg-logo');
					name = getValueByKey(item,'tvg-name');
					if(typeof name === 'undefined' || name === 'undefined'){
						name = item.substring(item.lastIndexOf(",")+1,item.lastIndexOf("\n"));
					}
				}
				if(m3u8.substr(0, 4) != "http"){
					continue;
				}
				if(typeof logo === 'undefined' || logo === 'undefined'){
					logo = "https://cdn.jsdelivr.net/gh/wefashe/MyIptv@main/img/logo.png";
				}
				var li = document.createElement("li");
				li.setAttribute("value", m3u8);
				li.setAttribute("title", name);
				li.innerHTML = name;
				li.addEventListener('click',function(e){
					videoPlay(this.getAttribute('value'));
					document.title = this.getAttribute('title') +' | ' + title;	
				})
				ul.appendChild(li);
				if(ul.hidden){
					videoPlay(m3u8);
					document.title = name +' | ' + title;	
					ul.hidden = false;
				}
			}			
		}
	};
	xhr.send();
}




function getValueByKey(content, key){
	var regex = new RegExp(`${key}=".*?"`);
	if(!regex.test(key)){
		return;
	}
	content = content.match(regex)[0];
	if(content){
		content = content.substring(content.indexOf("\"") + 1, content.lastIndexOf("\""))
	}
	if(content){
		content = content.trim();
	}
	return content;
}


function videoPlay(videoSrc){
	video = document.getElementById('video');
	if (video.canPlayType('application/vnd.apple.mpegurl')) {
		video.src = videoSrc;
		video.addEventListener('loadedmetadata',function() {
			video.play();
		});
	} else if (Hls.isSupported()) { 
		if(typeof hls !== 'undefined'){
			video.pause();
			hls.destroy();
			hls = null;
		}
		hls = new Hls();
		hls.attachMedia(video);	
		hls.on(Hls.Events.MEDIA_ATTACHED, function () {
			hls.loadSource(videoSrc);
			hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
				video.play();
			});
		});
		hls.on(Hls.Events.ERROR, function (event, data) {
			if (data.fatal) {
				switch (data.type) {
					case Hls.ErrorTypes.NETWORK_ERROR:
						hls.startLoad();
						break;
					case Hls.ErrorTypes.MEDIA_ERROR:
						hls.recoverMediaError();
						break;
					default:
						hls.destroy();
						break;
				}
			}
		});	
}
}
