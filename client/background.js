const ip = "3.37.177.6.sslip.io";
const port = "2018";
const socket = new WebSocket(`wss://${ip}:${port}`);

socket.onopen = function(event) {
	console.log('WebSocket is connected.');
};

socket.onmessage = function(event) {
	// 메시지를 팝업 또는 다른 컴포넌트에 전달
	chrome.runtime.sendMessage({type: "websocket_message", key: "receive", value: event.data}, function(response) {
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

chrome.runtime.onInstalled.addListener(() => {
	chrome.tabs.create({url: 'options.html'});
	chrome.contextMenus.create({
		title: "report to Server", // 메뉴 타이틀
		id: "sampleMenu", // 식별자
		contexts: ["all"], // 메뉴가 어떤 타입에 대해 활성화될지 결정
	});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "sampleMenu") {
		// 예를 들어, 클릭된 페이지의 URL 정보를 사용
		// console.log('Page URL:', info.pageUrl);
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
