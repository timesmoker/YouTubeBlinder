const ip = "3.37.177.6.sslip.io";
const port = "2018";
const socket = new WebSocket(`wss://${ip}:${port}`);

socket.onopen = function(event) {
	console.log('WebSocket is connected.');
};

socket.onmessage = function(event) {
	console.log('Message from server ', event.data);
	// 메시지를 팝업 또는 다른 컴포넌트에 전달
	chrome.runtime.sendMessage({type: "websocket_message", key: "send", value: event.data}, function(response) {
		console.log(`event.data: ${event.data}`);
		if (chrome.runtime.lastError) {
			console.error("Error sending message: ", chrome.runtime.lastError);
		}
		console.log(`response: ${response}`); // "success"
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
			socket.send(message.data);
		}
        sendResponse({value: message.data});
    }
});
