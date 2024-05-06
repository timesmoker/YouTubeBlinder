window.onload = function() {
	console.log('------------------------');

	const ip = "54.180.135.122";
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
			console.log(json);
			// socket.current.send(json);
		} catch (error) {
			// console.log(i, "===================");
			// console.log(error);
			// console.log(i, "===================");
			// console.log(video);
			// console.log(i, "===================");
		}
	}

	// socket.onmessage = function(event) {
	// 	console.log('Message from server ', event.data);
	// };

	// socket.onclose = function(event) {
	// 	console.log('Connection closed');
	// };

	// socket.onerror = function(error) {
	// 	console.log('WebSocket Error: ' + error);
	// };
};
