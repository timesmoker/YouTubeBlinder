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

const currentURL = window.location.href;
const pageStatus = currentURL.includes('watch'); //
var timeout = 0;
if (pageStatus) {
	timeout = 1000;
	injectScript('injected-script-2.js');
} else {
    injectScript('injected-script.js');
}
window.addEventListener('pageshow', () => {
	setTimeout(() => {
		console.log(document.innerHTML);
		const videoPlayer = document.getElementById('contents');
		console.log(videoPlayer);
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
		// get a list of Youtube videos
		var videoTag;
		if (pageStatus) {
			// watching videos, should block side thumbnail
			videoTag = 'ytd-compact-video-renderer';
		} else {
			// in main page, block only videos
			videoTag = 'ytd-rich-grid-media';
		}
		var videos = this.document.getElementsByTagName(videoTag);
		console.log(videos);
		// var rows = this.document.getElementsByTagName('ytd-rich-grid-row');
		// var rowNums = rows[0].getElementsByTagName('ytd-rich-item-renderer').length;
		// console.log(rowNums);
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


		console.log('Connection opened');

		console.log(videos.length);
		var vidArr = [];
		for (var i = 0; i < videos.length; i++) {
			// 3 array list for each videos
			// 1st and 2nd have title and link
			// 3rd has any 'h3' tag, so return an error
			vidArr[i] = new Video(videos[i]);
			// console.log(vidArr[i]);
			try {
				// console.log(thumbnail);
				// console.log(channel);
				// console.log(i, "-------------------");
				// general video link
				console.log(vidArr[i]);
				id = vidArr[i].link.split('=')[1].split('&')[0];
				// thumbnail link
				thumbnail = ("https://img.youtube.com/vi/"+id+"/0.jpg");
				// console.log(thumbnail);
				// video
				json = JSON.stringify({ path: '/video', title: vidArr[i].title, video_id: id, whiteList: [] });
				// console.log(json);
				chrome.runtime.sendMessage({type: "send_websocket", value: json}, function(response) {
					if (chrome.runtime.lastError) {
						console.error("Error sending message: ", chrome.runtime.lastError);
					}
					console.log(`video send response: ${response}`); // "success"
				});
				console.log(json);
			} catch (error) {
				console.log(i, "===================");
				console.log(error);
				console.log(i, "===================");
				console.log(video);
				console.log(i, "===================");
			}
			json = JSON.stringify({ path: '/topic/debug'});
				// console.log(json);
			chrome.runtime.sendMessage({type: "send_websocket", value: json}, function(response) {
				if (chrome.runtime.lastError) {
					console.error("Error sending message: ", chrome.runtime.lastError);
				}
				console.log(`video send response: ${response}`); // "success"
			});

			// document.addEventListener('contextmenu', event => {
			// 	const clickedElement = event.target.parentNode;
			// 	console.log(event);
			// 	let elementText = clickedElement.href;
			// 	const userInput = prompt("주제를 입력하세요", "주제");
			// 	if (userInput) {
			// 		for (var i = 0; i < vidArr.length; i++) {
			// 			if (vidArr[i].link === elementText) {
			// 				json = JSON.stringify({path: "/notBanned", topic: userInput, title: vidArr[i].title, video_id: vidArr[i].link.split("=")[1]})
			// 				chrome.runtime.sendMessage({
			// 					type: 'updateContextMenu',
			// 					value: json
			// 				}, function(response) {
			// 					if (chrome.runtime.lastError) {
			// 						console.error("Error sending message: ", chrome.runtime.lastError);
			// 					}
			// 					console.log(`updateContextMenu response: ${response}`); // "success"
			// 				});
			// 			}
			// 		}
			// 	}
			// });
		}
		chrome.storage.local.set({"vidArr": vidArr}, function() {});

		const observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
					mutation.addedNodes.forEach(node => {
						if (node.nodeType === 1 && node.matches('ytd-rich-grid-media')) { // 새 비디오 요소 확인
							const addVidIndex = vidArr.length;
							vidArr[addVidIndex] = new Video(node);
							videos[addVidIndex] = node;
							const id = vidArr[addVidIndex].link.split('=')[1].split('&')[0];
							// video
							json = JSON.stringify({ path: '/video', title: vidArr[addVidIndex].title, video_id: id, whiteList: [] });
							// console.log(json);
							chrome.runtime.sendMessage({type: "send_websocket", value: json}, function(response) {
								if (chrome.runtime.lastError) {
									console.error("Error sending message: ", chrome.runtime.lastError);
								}
								console.log(`video send response: ${response}`); // "success"
							});
							console.log(json);
							console.log(`MutationObserver ${vidArr}`);
							console.log(`MutationObserver ${videos}`);
						}
					});
				}
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
			console.log(`receive socket receive: ${message}`);
			resultJson = JSON.parse(message);
			// word plus response
			// try {
			// 	const resultWordList = resultJson.word;
			// 	const resultThresList = resultJson.threshold;
			// 	for (var i = 0; i < topicList.length; i++){
			// 		console.log(`word: ${resultWordList[i]}///threshold: ${resultThresList[i]}`);
			// 	}
			// } catch (e) {
			// 	console.log(e);
			// }
			// console.log(resultJson);

			//blind videos
			var title = resultJson['title'];
			if (title === "") {
				//notBanned rightClick
				for (var i = 0; i < vidArr.length; i++) {
					if (vidArr[i].link === resultJson['link']) {
						console.log(`${i}: ${vidArr[i].title}`);
						videos[i].style.display = 'none';
						vidArr[i].banned = true;
					}
				}
			} else {
				// blind videos
				for (var i = 0; i < vidArr.length; i++) {
					if (vidArr[i].title === title) {
						if (resultJson['banned']) {
							console.log(`${i}: ${vidArr[i].title}`);
							videos[i].style.display='none';
							vidArr[i].banned = true;
						}
					}
				}
				var j = 0;
				for (var i = 0; i < vidArr.length; i++) {
					if (!vidArr[i].banned) {
						rows[0];
					}
				}
			}
			sendResponse({value: resultJson});
			return true;
		});
	}, timeout);


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


function injectScript(src) {
	const s = document.createElement('script');
	s.src = chrome.runtime.getURL(src);
	s.type = "module"; // ESM 모듈 지원
	s.onload = () => s.remove();
	(document.head || document.documentElement).append(s);
}

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
		this.link = getVideoLink(video);
		this.banned = false;
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
