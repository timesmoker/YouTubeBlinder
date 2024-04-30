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

window.onload = function() {
	console.log('------------------------');

	var videos = this.document.getElementsByClassName('style-scope ytd-rich-item-renderer');
	console.log(videos);

	for (var i = 0; i < videos.length; i++) {
		var video = videos[i];
		console.log(video);
		try {
			title = video.getElementsByTagName('h3')[0].outerText;
			console.log(i, "-------------------");
			console.log(title);
			if (title = '') {
				video.style.display='none';
			}
			link = video.getElementsByTagName('a')[0].href;
			console.log(link);
		} catch (error) {
			console.log(i, "===================");
			console.log(error);
			console.log(i, "===================");
			console.log(video);
			console.log(i, "===================");
		}
	}
};
