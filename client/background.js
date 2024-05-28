const ip = "3.37.177.6.sslip.io";
const port = "2018";
const socket = new WebSocket(`wss://${ip}:${port}`);

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

socket.onmessage = function(event) {
	// 메시지를 팝업 또는 다른 컴포넌트에 전달
	chrome.runtime.sendMessage({type: "websocket_message", key: "send", value: event.data}, function(response) {
		console.log(`from Server: ${event.data}`);
		if (chrome.runtime.lastError) {
			console.error("Error sending message: ", chrome.runtime.lastError);
		}
		console.log(`receive response: ${response}`); // "success"
	});
};

socket.onerror = function(event) {
	console.error('WebSocket error observed:', event);
};

socket.onclose = function(event) {
	console.log('WebSocket is closed now.');
};

// 메시지 송신 함수
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === "send_websocket") {
		if (socket && socket.readyState === WebSocket.OPEN) {
			console.log(`to Server: ${message.value}`);
			socket.send(message.value);
		}
        sendResponse({value: message.value});
    }
});
