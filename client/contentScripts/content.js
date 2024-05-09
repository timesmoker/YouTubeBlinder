<<<<<<< HEAD
<<<<<<< HEAD
// document.documentElement.style.visibility = 'hidden';  // 초기에 전체 페이지를 숨깁니다.

// const customHtmlUrl = chrome.runtime.getURL("ytblock.html");
// fetch(customHtmlUrl)
// 	.then(response => response.text())
// 	.then(html => {
// 	document.write(html);

//     // YouTube 콘텐츠 로딩 완료 후 원래 콘텐츠 표시
//     window.addEventListener('load', function() {
//         customPage.style.display = 'none';  // 사용자 지정 페이지를 숨깁니다.
//         document.documentElement.style.visibility = '';  // 원래 페이지 콘텐츠를 다시 표시합니다.
//     });
// }).catch(error => {
//     console.error('Failed to fetch the custom HTML:', error);
// });

// window.addEventListener('load', function() {
	// const videoPlayer = document.getElementById('contents');
	// console.log(videoPlayer);
	// if (videoPlayer) {
	// 	// 비디오 플레이어 숨기기
	// 	videoPlayer.style.display = 'none';

	// 	// 사용자 정의 이미지 및 메시지 삽입
	// 	const blocker = document.createElement('div');
	// 	blocker.innerHTML = `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
	// 	<img src="https://upload.wikimedia.org/wikipedia/commons/4/42/Loading.gif" alt="Blocked Video" style="max-width: 100%; height: auto;">
	// 	<p>This video is blocked. Click the button below to watch the video.</p>
	// 	<button id="unblockButton">Watch Video</button>
	// 	</div>`;
	// 	videoPlayer.parentNode.insertBefore(blocker, videoPlayer);

	// 	// 버튼 클릭 이벤트 핸들러
	// 	document.getElementById('unblockButton').addEventListener('click', function() {
	// 	videoPlayer.style.display = '';
	// 	blocker.style.display = 'none';
	// 	});
	// }
// });

document.addEventListener('DOMContentLoaded', () => {
	console.log(document.innerHTML);
	const videoPlayer = document.getElementById('contents');
	console.log(videoPlayer);
	if (videoPlayer) {
		// 비디오 플레이어 숨기기
		videoPlayer.style.display = 'none';

		// 사용자 정의 이미지 및 메시지 삽입
		const blocker = document.createElement('div');
		blocker.innerHTML = `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
		<img src="https://upload.wikimedia.org/wikipedia/commons/4/42/Loading.gif" alt="Blocked Video" style="max-width: 100%; height: auto;">
		<p>This video is blocked. Click the button below to watch the video.</p>
		<button id="unblockButton">Watch Video</button>
		</div>`;
		videoPlayer.parentNode.insertBefore(blocker, videoPlayer);

		// 버튼 클릭 이벤트 핸들러
		document.getElementById('unblockButton').addEventListener('click', function() {
		videoPlayer.style.display = '';
		blocker.style.display = 'none';
		});
	}
	console.log('------------------------');

	const ip = "3.37.177.6.sslip.io";
	const port = "2018";
	const socket = new WebSocket(`wss://${ip}:${port}`);
	// get a list of Youtube videos
	var videos = this.document.getElementsByTagName('ytd-rich-grid-media');
	// console.log(videos.length);

	// setTimeout(() => videos[0].style.display = 'none', 1000);
	// setTimeout(() => videos[3].style.filter = "blur(5Px)", 1000);
	var video = videos[0];
	// console.log(getVideoTitle(videos[68]));
	// setTimeout(() => video = videos[68], 3000);

	//video[0].style.display='none';

	// videos[0].getElementsByTagName('h3')[0].outerText = videos[68].getElementsByTagName('h3')[0].outerText;
	// videos[0].getElementsByTagName('a')[0].href = videos[68].getElementsByTagName('a')[0].href;

	/*
	if (videos.length > 30) { // videos[68]이 존재하는지 확인
        var firstVideoTitle = videos[0].querySelector('h3');
        var firstVideoLink = videos[0].querySelector('a');
        var targetVideoTitle = videos[30].querySelector('h3');
        var targetVideoLink = videos[30].querySelector('a');

		console.log('-------------------------');
        if (firstVideoTitle && firstVideoLink && targetVideoTitle && targetVideoLink) {
            // 제목 교환
			console.log('change Title');
            var tempTitle = firstVideoTitle.textContent;
            firstVideoTitle.textContent = targetVideoTitle.textContent;
            targetVideoTitle.textContent = tempTitle;

            // 링크 교환
			console.log('change Link');
            var tempHref = firstVideoLink.href;
            firstVideoLink.href = targetVideoLink.href;
            targetVideoLink.href = tempHref;
        }
    }
	*/

	// console.log(videos[0]);
	// temp = videos[0].getElementsByTagName('ytd-thumbnail')[0];
	// console.log(temp);
	// temp.getElementsByTagName('a')[0].href = videos[1].getElementsByTagName('ytd-thumbnail')[0].getElementsByTagName('a')[0].href;
	// console.log(temp.getElementsByTagName('a')[0].href);

	console.log(videos.length);
	var vidArr = [];
	for (var i = 0; i < videos.length; i++) {
		// 3 array list for each videos
		// 1st and 2nd have title and link
		// 3rd has any 'h3' tag, so return an error
		vidArr[i] = new Video(videos[i]);
		// console.log(vidArr[i]);
		try {
			var thumbnail = vidArr[i].thumbnail;
			var channel = vidArr[i].channel;
			// console.log(thumbnail);
			// console.log(channel);
			// console.log(i, "-------------------");
			if (title == '') {
				// invisible
				// video.style.display='none';
				// blur
				vidArr[i].style.filter = "blur(5Px)";
			}
			// general video link
			link = getVideoLink(vidArr[i]);
			id = link.split('=')[1];
			// thumbnail link
			thumbnail = ("https://img.youtube.com/vi/"+id+"/0.jpg");
			// console.log(thumbnail);
			json = JSON.stringify({ title: title, URL: thumbnail });
			// console.log(json);
			socket.send(json);
		} catch (error) {
			// console.log(i, "===================");
			// console.log(error);
			// console.log(i, "===================");
			// console.log(video);
			// console.log(i, "===================");
		}
	}

	socket.onopen = function(event) {
		console.log('Connection opened');
		for (var i = 0; i < videos.length; i++) {
			title = vidArr[i].title;
			link = vidArr[i].thumblink;
			id = link.split('=')[1];
			// thumbnail link
			thumbnail = ("https://img.youtube.com/vi/"+id+"/0.jpg");
			// console.log(thumbnail);
			json = JSON.stringify({ title: title, URL: thumbnail });
			// console.log(json);
			socket.send(json);
			// console.log('--------------');
		}
	};

	socket.onmessage = function(event) {
		var title = JSON.parse(event.data)["title"];
		if (title) {
			console.log(title);
		}
	}

	socket.onclose = function(event) {
		console.log('close: ', event);
	}

	// socket.onmessage = function(event) {
	// 	var title = JSON.parse(event.data)["title"];
	// 	if (title) {
	// 		for (var i = 0; i < videos.length; i++) {
	// 			if (vidArr[i].title == title) {
	// 				const parent = videos[i].parentNode;
	// 				tempWidth = parent.style.width;
	// 				tempHeight = parent.style.height;
	// 				console.log(tempHeight, tempWidth);
	// 				videos[i].remove();

	// 				const itemDiv = document.createElement('div');
	// 				itemDiv.className = 'style-scope';
	// 				itemDiv.style.flexDirection = "column";
	// 				itemDiv.style.display = 'flex';
	// 				itemDiv.style.justifyContent = "center";
	// 				itemDiv.style.alignItems = "center";
	// 				const newImage = document.createElement('img');
	// 				newImage.src = 'https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif'; // 이미지 URL 설정
	// 				newImage.alt = 'New Image';
	// 				newImage.style.width = '70%';
	// 				newImage.style.alignContent = 'center';
	// 				const br = document.createElement('br');
	// 				const newText = document.createElement('h3');
	// 				newText.textContent = '서버에서 영상을 받아오는 중입니다...';
	// 				newText.style.textAlign = 'center';
	// 				newText.style.color = 'white';

	// 				itemDiv.appendChild(newImage);
	// 				itemDiv.appendChild(newText);
	// 				itemDiv.style.width = tempWidth;
	// 				itemDiv.style.height = tempHeight;
	// 				parent.appendChild(itemDiv);
	// 			}
	// 		}
	// 	}
	// };

	// socket.onclose = function(event) {
	// 	console.log('Connection closed');
	// };

	// socket.onerror = function(error) {
	// 	console.log('WebSocket Error: ' + error);
	// };
});

function getVideoTitle(video) {
	if (video) {
		title = video.getElementsByTagName('h3')[0].outerText;
		return (title);
	}
	return ("");
}

function getVideoLink(video) {
	link = video.getElementsByTagName('a')[0].href;
	return (link);
}

class Video {
	constructor(video) {
		this.title = video.getElementsByTagName('h3')[0].outerText;
		this.thumbnail = video.getElementsByTagName('ytd-thumbnail')[0];
		this.thumblink = this.thumbnail.getElementsByTagName('a')[0].href;
		this.channel = video.getElementsByTagName('ytd-video-meta-block')[0].parentNode.parentNode;

		function getThumbnail() {
			return (this.thumbnail);
		}

		function getThumblink() {
			return (this.thumblink);
		}
	}
}
=======
// window.addEventListener('DOMContentLoaded', function() {
// 	this.document.getElementById
// 	console.log('------------------------');

// 	var videos = this.document.getElementsByClassName('style-scope ytd-rich-item-renderer');
// 	console.log(videos);

// 	Array.from(videos).forEach((video, index) => {
// 		console.log(`Div ${index}: `, video);
// 	});

// 	// chrome.storage.local.set({ 'videos': videos });
// });

=======
>>>>>>> cccf40f (get thumbnail link)
window.onload = function() {
	console.log('------------------------');

	const ip = "3.37.177.6.sslip.io";
	const port = "2018";
	const socket = new WebSocket(`wss://${ip}:${port}`);
	// get a list of Youtube videos
	var videos = this.document.getElementsByTagName('ytd-rich-grid-media');
	// console.log(videos.length);

	// setTimeout(() => videos[0].style.display = 'none', 1000);
	// setTimeout(() => videos[3].style.filter = "blur(5Px)", 1000);
	var video = videos[0];
	if (video) {
		const parent = video.parentNode;
		tempWidth = parent.style.width;
		tempHeight = parent.style.height;
		console.log(tempHeight, tempWidth);
		video.remove();

		const itemDiv = document.createElement('div');
        itemDiv.className = 'style-scope';
		itemDiv.style.flexDirection = "column";
        itemDiv.style.display = 'flex';
		itemDiv.style.justifyContent = "center";
		itemDiv.style.alignItems = "center";
		const newImage = document.createElement('img');
		newImage.src = 'https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif'; // 이미지 URL 설정
		newImage.alt = 'New Image';
		newImage.style.width = '70%';
		newImage.style.alignContent = 'center';
		const br = document.createElement('br');
		const newText = document.createElement('h3');
		newText.textContent = '서버에서 영상을 받아오는 중입니다...';
		newText.style.textAlign = 'center';
		newText.style.color = 'white';

		itemDiv.appendChild(newImage);
		itemDiv.appendChild(newText);
		itemDiv.style.width = tempWidth;
		itemDiv.style.height = tempHeight;
		parent.appendChild(itemDiv);
	}
	// console.log(getVideoTitle(videos[68]));
	// setTimeout(() => video = videos[68], 3000);

	//video[0].style.display='none';

	// videos[0].getElementsByTagName('h3')[0].outerText = videos[68].getElementsByTagName('h3')[0].outerText;
	// videos[0].getElementsByTagName('a')[0].href = videos[68].getElementsByTagName('a')[0].href;

	/*
	if (videos.length > 30) { // videos[68]이 존재하는지 확인
        var firstVideoTitle = videos[0].querySelector('h3');
        var firstVideoLink = videos[0].querySelector('a');
        var targetVideoTitle = videos[30].querySelector('h3');
        var targetVideoLink = videos[30].querySelector('a');

		console.log('-------------------------');
        if (firstVideoTitle && firstVideoLink && targetVideoTitle && targetVideoLink) {
            // 제목 교환
			console.log('change Title');
            var tempTitle = firstVideoTitle.textContent;
            firstVideoTitle.textContent = targetVideoTitle.textContent;
            targetVideoTitle.textContent = tempTitle;

            // 링크 교환
			console.log('change Link');
            var tempHref = firstVideoLink.href;
            firstVideoLink.href = targetVideoLink.href;
            targetVideoLink.href = tempHref;
        }
    }
	*/

	console.log(videos[0]);
	temp = videos[0].getElementsByTagName('ytd-thumbnail')[0];
	console.log(temp);
	temp.getElementsByTagName('a')[0].href = videos[1].getElementsByTagName('ytd-thumbnail')[0].getElementsByTagName('a')[0].href;
	console.log(temp.getElementsByTagName('a')[0].href);

	console.log(videos.length);
	var vidArr = [];
	for (var i = 0; i < videos.length; i++) {
		// 3 array list for each videos
		// 1st and 2nd have title and link
		// 3rd has any 'h3' tag, so return an error
		vidArr[i] = new Video(videos[i]);
		console.log(vidArr[i]);
		try {
			var thumbnail = vidArr[i].thumbnail;
			var channel = vidArr[i].channel;
			console.log(thumbnail);
			console.log(channel);
			console.log(i, "-------------------");
			if (title == '') {
				// invisible
				// video.style.display='none';
				// blur
				vidArr[i].style.filter = "blur(5Px)";
			}
			// general video link
			link = getVideoLink(vidArr[i]);
			id = link.split('=')[1];
			// thumbnail link
			thumbnail = ("https://img.youtube.com/vi/"+id+"/0.jpg");
			// console.log(thumbnail);
			json = JSON.stringify({ title: title, URL: thumbnail });
			// console.log(json);
			socket.send(json);
		} catch (error) {
			// console.log(i, "===================");
			// console.log(error);
			// console.log(i, "===================");
			// console.log(video);
			// console.log(i, "===================");
		}
	}

	socket.onopen = function(event) {
		console.log('Connection opened');
		for (var i = 0; i < videos.length; i++) {
			title = vidArr[i].title;
			link = vidArr[i].thumblink;
			id = link.split('=')[1];
			// thumbnail link
			thumbnail = ("https://img.youtube.com/vi/"+id+"/0.jpg");
			// console.log(thumbnail);
			json = JSON.stringify({ title: title, URL: thumbnail });
			console.log(json);
			socket.send(json);
			console.log('--------------');
		}
	};

	socket.onmessage = function(event) {
		var title = event.data;
		console.log('--------Message from server----------', event.data);
		for (var i = 0; i < videos.length; i++) {
			if (vidArr[i].title == title) {

			}
		}
	};

	socket.onclose = function(event) {
		console.log('Connection closed');
	};

	socket.onerror = function(error) {
		console.log('WebSocket Error: ' + error);
	};
};
<<<<<<< HEAD
>>>>>>> 144f325 (get title and link)
=======

function getVideoTitle(video) {
	if (video) {
		title = video.getElementsByTagName('h3')[0].outerText;
		return (title);
	}
	return ("");
}

function getVideoLink(video) {
	link = video.getElementsByTagName('a')[0].href;
	return (link);
}

class Video {
	constructor(video) {
		this.title = video.getElementsByTagName('h3')[0].outerText;
		this.thumbnail = video.getElementsByTagName('ytd-thumbnail')[0];
		this.thumblink = this.thumbnail.getElementsByTagName('a')[0].href;
		this.channel = video.getElementsByTagName('ytd-video-meta-block')[0].parentNode.parentNode;

		function getThumbnail() {
			return (this.thumbnail);
		}

		function getThumblink() {
			return (this.thumblink);
		}
	}
}
>>>>>>> ce9778b (create Video class)
