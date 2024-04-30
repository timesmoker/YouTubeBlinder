window.onload = function() {
	console.log('------------------------');

	// get a list of Youtube videos
	var videos = this.document.getElementsByClassName('style-scope ytd-rich-item-renderer');
	console.log(videos);

	for (var i = 0; i < videos.length; i++) {
		// 3 array list for each videos
		// 1st and 2nd have title and link
		// 3rd has any 'h3' tag, so return an error
		var video = videos[i];
		console.log(video);
		try {
			// title
			title = video.getElementsByTagName('h3')[0].outerText;
			console.log(i, "-------------------");
			console.log(title);
			// naive blind
			if (title = '') {
				video.style.display='none';
			}
			// general video link
			link = video.getElementsByTagName('a')[0].href;
			id = link.split('=')[1];
			// thumbnail link
			thumbnail = ("https://img.youtube.com/vi/"+id+"/0.jpg");
			console.log(thumbnail);
		} catch (error) {
			console.log(i, "===================");
			console.log(error);
			console.log(i, "===================");
			console.log(video);
			console.log(i, "===================");
		}
	}
};
