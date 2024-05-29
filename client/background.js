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
