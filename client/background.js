let serverOpen = false;

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3fcc778 (popup)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (tab.url.includes("youtube.com") && changeInfo.status === 'loading') {
		chrome.scripting.executeScript({
		target: {tabId: tabId},
		function: redirectToCustomPage
		});
	}
});

function redirectToCustomPage() {
	window.location.href = 'ytblock.html';
}

<<<<<<< HEAD
=======
>>>>>>> 619b15b (15:12 cannot connect)
=======
>>>>>>> 3fcc778 (popup)
window.onload = function() {
	console.log('------------------------');

	const ip = "3.35.220.73";
	const port = "2018";
	const socket = new WebSocket(`wss://${ip}:${port}`);
	socket.onopen = function(event) {
		console.log('Connection opened');
	};
	// get a list of Youtube videos
	var videos = this.document.getElementsByClassName('style-scope ytd-rich-item-renderer');
	// console.log(videos.length);

	setTimeout(() => videos[0].style.display='none', 1000);
	setTimeout(() => videos[3].style.filter = "blur(5Px)", 1000);

	for (var i = 0; i < videos.length; i++) {
		// 3 array list for each videos
		// 1st and 2nd have title and link
		// 3rd has any 'h3' tag, so return an error
		var video = videos[i];
		// console.log(video);
		try {
			// title
			title = video.getElementsByTagName('h3')[0].outerText;
			// console.log(i, "-------------------");
			if (title == '') {
				// invisible
				// video.style.display='none';
				// blur
				video.style.filter = "blur(5Px)";
			}
			// general video link
			link = video.getElementsByTagName('a')[0].href;
			id = link.split('=')[1];
			// thumbnail link
			thumbnail = ("https://img.youtube.com/vi/"+id+"/0.jpg");
			// console.log(thumbnail);
			json = JSON.stringify({ title: title, URL: thumbnail });
			// console.log(json);
			socket.current.send(json);
		} catch (error) {
			// console.log(i, "===================");
			// console.log(error);
			// console.log(i, "===================");
			// console.log(video);
			// console.log(i, "===================");
		}
	}

	socket.onmessage = function(event) {
		console.log('Message from server ', event.data);
	};

	socket.onclose = function(event) {
		console.log('Connection closed');
	};

	socket.onerror = function(error) {
		console.log('WebSocket Error: ' + error);
	};
=======
socket.onopen = function(event) {
	console.log('WebSocket is connected.');
>>>>>>> 80ad9ef (client latest)
};
=======
function connectToServer() {
	const ip = "3.37.177.6.sslip.io";
	const port = "2018";
	const socket = new WebSocket(`wss://${ip}:${port}`);
>>>>>>> f36770c (naive blind)

	socket.onopen = function(event) {
		console.log('WebSocket is connected.');
		serverOpen = true;
	};

	socket.onmessage = function(event) {
		// 메시지를 팝업 또는 다른 컴포넌트에 전달
		const receive = JSON.parse(event.data);
		const path = receive['path'];
		console.log(`------------from Server--------------${event.data}`);
		if (path == '/video') {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				var activeTab = tabs[0];
				json = JSON.stringify({title: receive['title'], banned: receive['banned']});
				console.log(`${json}`);
				chrome.tabs.sendMessage(activeTab.id, json, function(response) {
					console.log("send tab")
				});
			});
		} else {
			chrome.runtime.sendMessage({type: receive['path'], value: event.data}, function(response) {
				if (chrome.runtime.lastError) {
					console.log(receive['path']);
					console.error("Error sending message: ", chrome.runtime.lastError);
				}
				console.log(`receive ${receive['path']}`);
				console.log(`receive response: ${response}`); // "success"
			});
		}
	};

	socket.onerror = function(event) {
		console.error('WebSocket error observed:', event);
	};

	socket.onclose = function(event) {
		console.log('WebSocket is closed now.');
		serverOpen = false;
	};

	return (socket);
}

let socket = connectToServer();

// 메시지 송신 함수
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.type === "getStatus") {
		sendResponse({status: serverOpen});
	} else if (serverOpen) {
		if (message.type === "send_websocket") {
			if (socket && socket.readyState === WebSocket.OPEN) {
				console.log(`to Server: ${message.value}`);
				socket.send(message.value);
			}
			sendResponse({value: message.value});
		}
		if (message.type === "updateContextMenu") {
			if (socket && socket.readyState === WebSocket.OPEN) {
				console.log(`to Server: ${message.value}`);
				socket.send(message.value);
			}
			sendResponse({value: message.value});
		}
	}
});


chrome.runtime.onInstalled.addListener(() => {
	chrome.tabs.create({url: 'options.html'});
	chrome.contextMenus.create({
		title: "report to Server", // 메뉴 타이틀
		id: "sampleMenu", // 식별자
		contexts: ["all"], // 메뉴가 어떤 타입에 대해 활성화될지 결정
	});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	console.log(info);
	if (info.menuItemId === "sampleMenu") {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var activeTab = tabs[0];
			json = JSON.stringify({title: "", link: info.linkUrl});
			chrome.tabs.sendMessage(activeTab.id, json, function(response) {
				console.log("send tab rightClick");
			});
		});
	}
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'updateContextMenu') {
		chrome.contextMenus.update("sampleMenu", {
			title: `report to Server: ${message.text}`
		});
		sendResponse({status: 'Menu updated'});
	}
});
