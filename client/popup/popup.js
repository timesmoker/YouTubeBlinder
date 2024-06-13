document.addEventListener('DOMContentLoaded', () => {
	const adjacentButton = document.getElementsByClassName('word-plus')[0];
	var id, video;
	chrome.storage.local.get("id", function(data) {
		id = data.id;
	})
	chrome.storage.local.get("vidArr", function(data) {
		const vidArr = data.vidArr;
		for (var i = 0; i < vidArr.length; i++) {
			if (vidArr[i].link.split('=')[1].split('&')[0] == id) {
				video = vidArr[i];
				document.querySelector('h3').textContent = `제목: ${vidArr[i].title}`;
			}
		}
	})
	chrome.storage.local.get("wordList", function(data) {
		const wordList = data.wordList
		for (var i = 0; i < wordList.length; i++) {
			const newButton = document.createElement('button');
			newButton.textContent = wordList[i];
			newButton.className = 'oval-button red-oval toggle-button';
			adjacentButton.parentNode.appendChild(newButton);
		}
	});

	document.addEventListener('click', function(event) {
		if (event.target && event.target.nodeName === 'BUTTON') {
			if (event.target.classList.contains('toggle-button')) {
				event.target.classList.toggle('active');
			}
			if (event.target.id === 'cancel') {
				window.close();
			}
			if (event.target.id === 'block') {
				const topic = document.getElementsByClassName('active')[0].textContent;
				json = JSON.stringify({path: "/notBanned", title: video.title, topic: topic, video_id: id});
				chrome.runtime.sendMessage({type: "send_websocket", value: json}, function(response) {
					if (chrome.runtime.lastError) {
						console.error("Error sending message: ", chrome.runtime.lastError);
					}
					console.log(`/notBanned send response: ${response}`); // "success"
				});
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					tabs.forEach(function(tab) {
						if (tab.url.includes("youtube.com")) {
							json = JSON.stringify({title: video.title, banned: true});
							console.log(`${json}`);
							chrome.tabs.sendMessage(tab.id, json, function(response) {
								console.log("send tab");
							});
						}
					});
				});
				window.close();
			}
		}
	});
});
