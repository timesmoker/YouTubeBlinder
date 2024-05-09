window.onload = function() {
	console.log('------------------------');

	const ip = "3.37.177.6.sslip.io";
	const port = "2018";
	const socket = new WebSocket(`wss://${ip}:${port}`);
	socket.onopen = function(event) {
		console.log('Connection opened');
	};
	// get a list of Youtube videos
	var videos = this.document.getElementsByTagName('ytd-rich-grid-media');
	// console.log(videos.length);

	// setTimeout(() => videos[0].style.display = 'none', 1000);
	// setTimeout(() => videos[3].style.filter = "blur(5Px)", 1000);
	// if (video) {
	// 	const parent = video.parentNode;
	// 	video.remove();

	// 	const newImage = document.createElement('img');
	// 	newImage.src = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGkxeDhzMXJuZGc3dHhxbGhoZ2M5ZnI5cmI3YXVjdWViM3IyOHZnaSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7bu3XilJ5BOiSGic/giphy.gif'; // 이미지 URL 설정
	// 	newImage.alt = 'New Image';
	// 	newImage.style.width = '30%';
	// 	newImage.style.alignContent = 'center';

	// 	parent.appendChild(newImage);
	// }
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

	console.log(videos.length);
	var vidArr = [];
	for (var i = 0; i < videos.length; i++) {
		// 3 array list for each videos
		// 1st and 2nd have title and link
		// 3rd has any 'h3' tag, so return an error
		vidArr[i] = new Video(videos[i]);
		console.log(vidArr[i]);
		try {
			var thumbnail = vidArr[i].getThumbnail();
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
};

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
		this.thumbnail = video.getElementsByTagName('ytd-thumbnail')[0];
		this.thumblink = this.thumbnail.getElementsByTagName('a')[0];
		this.channel = video.getElementsByTagName('ytd-video-meta-block')[0].parentNode.parentNode;

		function getThumbnail() {
			return (this.thumbnail);
		}
	}
}
