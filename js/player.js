var url = location.search.split('url=')[1];
if(!url){
	// 默认地址
	// 默认地址
	if(location.href.substr(0, 4) != "http"){
		// 本地测试地址
		url = "https://cdn.jsdelivr.net/gh/wefashe/MyIptv@main/iptv.m3u";
	} else {
		// 线上使用地址
		url = "iptv.m3u";
	}
}

// 校验格式
var lastName1 = getSuffixName(url);
if(!/(m3u8|m3u|txt)$/i.test(lastName1)){
	alert("暂不支持该格式！");
	// 关闭窗口
	// window.opener=null;window.top.open('','_self','');window.close(this);
}
if(lastName1 === 'm3u8'){
	// 播放视频
	videoPlay(url)
}

if(/(m3u|txt)$/i.test(lastName1)){
	// 解析文件，生成视频列表
	ul =  document.getElementById("video-list");
	ajaxHttpRequestFunc(url, ul, (status, ulElement, content) => {
		if(!status){
			return;
		}
		createList(ulElement, content, lastName1);
	});
}

// 生成列表
function createList(ulElement, content, suffixName){
		if(content){
			content = content.trim();
		}
		if(!content){
			return;
		}
		ulElement.innerHTML = "";
		ulElement.hidden = true;
		if(suffixName === 'txt'){
			items = content.split("\n");
		}
		if(suffixName === 'm3u'){
			items = content.substring(content.indexOf("#EXTINF:")).split("#EXTINF:");
		}
		var title = document.title;
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
			ulElement.appendChild(li);
			if(ulElement.hidden){
				videoPlay(m3u8);
				document.title = name +' | ' + title;	
				ulElement.hidden = false;
			}
			ajaxHttpRequestFunc(m3u8, li, (status, liElement) => {
				if(!status){
					liElement.className = "lapse";
				}
			}, 1500);
		}
}

// 字符串里根据Key获取value
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

// 获取路径的后缀名
function getSuffixName(path){
	if(path){
		path = path.trim();
	}
	if(!path){
		return;
	}
	var dotIndex = path.lastIndexOf('.');
	if(!dotIndex){
		return;
	}
    return path.substr(dotIndex + 1);
}

// 发送请求
function ajaxHttpRequestFunc(URL, element, callback, time = 20000) {
    // 创建XMLHttpRequest对象，即一个用于保存异步调用对象的变量
    let xmlHttpRequest;
    // 老版本的 Internet Explorer（IE5 和 IE6）使用 ActiveX 对象
    // 所有现代浏览器（Chrom、IE7+、Firefox、Safari 以及 Opera）都有内建的 XMLHttpRequest 对象
    if (window.ActiveXObject) {
        xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
    } else if (window.XMLHttpRequest) { // Netscape浏览器中的创建方式
        xmlHttpRequest = new XMLHttpRequest();
    }
    // 设置响应http请求状态变化的事件
    xmlHttpRequest.onreadystatechange = function () {
        // console.log('请求过程', xmlHttpRequest.readyState);
        // 判断异步调用是否成功,若成功开始局部更新数据
        if (xmlHttpRequest.readyState == 4) {
            // console.log('状态码为', xmlHttpRequest.status);
            if (xmlHttpRequest.status == 200) {
                // console.log('异步调用返回的数据为：', xmlHttpRequest.responseText);
                callback(true, element, xmlHttpRequest.responseText);
                //此处可以写当前URL有效的一个操作
            } else { // 如果异步调用未成功,抛出错误,并显示错误状态码
                //此处可以写当前URL无效的一个操作
                // throw "error:HTTP状态码为:" + xmlHttpRequest.status
                callback(false, element);
                // console.error("error:HTTP状态码为:" + xmlHttpRequest.status)
                // return false
            }
        }
    }
	// 超时时间，单位是毫秒
	xmlHttpRequest.timeout = time; 
	xmlHttpRequest.onload = function () {
	  // 请求完成。在此进行处理。
	  // console.log('请求完成', URL);
	};
	xmlHttpRequest.ontimeout = function (e) {
	  // XMLHttpRequest 超时。在此做某事。
	  callback(false, element);
	  // console.log('请求超时', URL);
	};
    // 创建http请求，并指定请求得方法（get）、url（需要校验的URL）以及验证信息
	// 加随机数，解决缓存问题
    xmlHttpRequest.open("GET", URL + "?v=" + Math.random(), true);
    // 发送请求，因为是get的请求，可以不携带参数
    xmlHttpRequest.send(null);
}

// 播放视频
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

//立即执行，js css 加随机数，解决缓存问题
(function (){
	var random = Math.random();
	//处理请求JS文件缓存
	var element = document.getElementsByTagName("script");
	for (var i = 0; i < element.length; i++) {
		if (element[i].src) {
			if (element[i].src.indexOf('?') > -1) {
				element[i].src = element[i].src + '&v=' + random;
			} else {
				element[i].src = element[i].src + '?v=' + random;
			}
		}
	};
	//处理CSS文件缓存
	var link = document.getElementsByTagName("link");
	for (var i = 0; i < link.length; i++) {
		if (link[i].href) {
			link[i].href = link[i].href + '?v=' + random;
		}
	}	
})();

window.onkeydown = function(){
	var code = event.keyCode
	switch(code){
		case 13:
			if (!window.FileReader) {
				alert("你的浏览器不支持读取本地文件");
			}
			let input = document.createElement('input');
			input.value = '选择文件';
			input.type = 'file';
			input.accept=".m3u,.txt"
			input.onchange = event => {
				let file = event.target.files[0];
				var lastName2 = getSuffixName(file.name);
				if(!/(m3u|txt)$/i.test(lastName1)){
					alert("暂不支持该格式！");
				}				
				let file_reader = new FileReader();
				file_reader.onload = () => {
					let content = file_reader.result;
					// console.log(content);
					createList(ul, content, lastName2);
				};
				if(file_reader){
					file_reader.readAsText(file, 'UTF-8');
				}
			};
			input.click();
			break;
        case 32:
			if(video.currentTime > 0){
				 if(video.paused){
					video.play();
				 } else {
					video.pause();
				 }
			}
			break;
        case 37: 
			video.currentTime = video.currentTime - 5;
			break;
        case 39: 
			video.currentTime = video.currentTime + 5;
			break;
    }    
}
