<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dee3602 (popup and options sync)
document.addEventListener('DOMContentLoaded', () => {
	chrome.storage.local.get("htmlContent", function(data) {
		if (data.htmlContent) {
			console.log(data.htmlContent);
			document.body.innerHTML = data.htmlContent;
			console.log("HTML is loaded and applied");
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
			document.querySelector('script').src = './popup.js';
			chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
				console.log(document.body.innerHTML);
			});
>>>>>>> 80ad9ef (client latest)
			document.getElementById('btnSettings').style.display = 'block';
=======
>>>>>>> dee3602 (popup and options sync)
=======
			document.getElementById('btnSettings').style.display = 'block';
>>>>>>> 3fcc778 (popup)
			const buttonsArea = document.getElementById('buttons-area');
			// word plus button
			buttonsArea.addEventListener('click', function(event) {
				if (event.target && event.target.nodeName === 'BUTTON') {
					if (event.target.classList.contains('word-plus')) {
						const userInput = prompt("새 버튼의 텍스트를 입력하세요:", "새 버튼");
						if (userInput) {
							event.target.textContent = userInput;
<<<<<<< HEAD
<<<<<<< HEAD
							event.target.className = 'oval-button red-oval toggle-button';
=======
							event.target.className = 'oval-button red-oval';
>>>>>>> dee3602 (popup and options sync)
=======
							event.target.className = 'oval-button red-oval toggle-button';
>>>>>>> d244c07 (draft UI)
							const newButton = document.createElement('button');
							newButton.textContent = '+';
							newButton.className = 'oval-button word-plus';
							event.target.parentNode.appendChild(newButton);
							chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
								// console.log(document.body.innerHTML);
=======
								console.log(document.body.innerHTML);
>>>>>>> 80ad9ef (client latest)
							});
						}
						else {
							event.target.parentNode.parentNode.remove();
						}
					}
					if (event.target.classList.contains('toggle-button')) {
						event.target.classList.toggle('active');
						var isActive = this.classList.contains('active');
						console.log('토글 상태:', isActive ? '활성화' : '비활성화');
						chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
							console.log(document.body.innerHTML);
						});
					}

					if (event.target.classList.contains('container-minus')) {
						const topic = event.target.parentNode.getElementsByClassName('topic-button')[0].textContent;
						// topic/remove
						// socket.onopen = function(event) {
						// 	json = JSON.stringify({ path: '/topic/all', topic: topic });
						// 	socket.send(json);
						// }
						event.target.parentNode.parentNode.remove();
<<<<<<< HEAD
=======
								console.log(document.body.innerHTML);
=======
								// console.log(document.body.innerHTML);
>>>>>>> d244c07 (draft UI)
							});
						}
						else {
							event.target.parentNode.parentNode.remove();
						}
>>>>>>> dee3602 (popup and options sync)
					}
					if (event.target.classList.contains('toggle-button')) {
						event.target.classList.toggle('active');
						var isActive = this.classList.contains('active');
						console.log('토글 상태:', isActive ? '활성화' : '비활성화');
						chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
							// console.log(document.body.innerHTML);
						});
					}

					if (event.target.classList.contains('container-minus')) {
						event.target.parentNode.parentNode.remove();
=======
						chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
							console.log(document.body.innerHTML);
						});
>>>>>>> 80ad9ef (client latest)
					}
				}
			});
			buttonsArea.addEventListener('input', function(event) {
				if (event.target.className === 'slider') {
					// 슬라이더 값을 해당 슬라이더 바로 옆의 span 요소에 표시
					event.target.nextElementSibling.textContent = event.target.value;
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
					event.target.setAttribute('value', event.target.value);
<<<<<<< HEAD
=======
					console.log(event.target.value);
					const slider = this.getElementsByClassName('slider');
					console.log(slider[0]);
					console.log(event.target);
					slider[0].value = event.target.value;
					console.log(slider[0]);
>>>>>>> 3fcc778 (popup)
=======
					event.target.setAttribute('value', event.target.value);
>>>>>>> d244c07 (draft UI)
=======
					const buttonList = event.target.parentNode.parentNode.getElementsByClassName('red-oval');

					for (var i = 0; i <buttonList.length; i++) {
						if (i / buttonList.length < event.target.value / event.target.max) {
							buttonList[i].classList.remove('active');
							console.log(buttonList[i]);
							console.log('deactive');
						}
					}
					for (var i = 0; i <buttonList.length; i++) {
						if (i / buttonList.length > event.target.value / event.target.max) {
							buttonList[i].classList.add('active');
							console.log(buttonList[i]);
							console.log('active');
						}
					}
>>>>>>> 80ad9ef (client latest)

					chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
						console.log(document.body.innerHTML);
					});
<<<<<<< HEAD
				}
			});

=======
=======
>>>>>>> 3fcc778 (popup)
				}
			});

<<<<<<< HEAD
			document.getElementById('btnSubmit').addEventListener('click', submitForm);
>>>>>>> dee3602 (popup and options sync)
=======
>>>>>>> d244c07 (draft UI)
			document.getElementById('btnSettings').addEventListener('click', function() {
				chrome.tabs.create({url: 'options.html'});
			});

			// list plus button
<<<<<<< HEAD
			document.getElementById('cloneButton').addEventListener('click', function() {
<<<<<<< HEAD
<<<<<<< HEAD
=======
			document.getElementById('cloneButton').addEventListener('click', submitFunc);
			document.getElementById('textField').addEventListener('keypress', function(e) {
				if (e.key === 'Enter') {
					submitFunc();
				}
			});
			function submitFunc() {
>>>>>>> 80ad9ef (client latest)
				var textFieldValue = document.getElementById('textField').value;
=======
>>>>>>> dee3602 (popup and options sync)
=======
				var textFieldValue = document.getElementById('textField').value;
>>>>>>> d244c07 (draft UI)
				// 기존의 버튼 컨테이너를 선택
				const originalContainers = document.querySelectorAll('.keyword-container');
				const originalContainer = originalContainers[originalContainers.length - 1];

				// 컨테이너를 깊은 복사하여 모든 요소를 포함하여 복제
				const newContainer = originalContainer.cloneNode(true);

				originalNum = splitKeywordListNum(originalContainer.className);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> d244c07 (draft UI)
				newContainer.className = `keyword-container con${parseInt(originalNum)+1}`;
				const sliderContainer = newContainer.getElementsByClassName('slider-container');
				const buttonContainer = newContainer.getElementsByClassName('button-container');

				const tempButton = sliderContainer[0].querySelectorAll('button');
				tempButton[0].className = "container-minus";
				tempButton[0].textContent = "-";
				tempButton[1].className = "oval-button red-oval topic-button";
				tempButton[1].textContent = textFieldValue;
<<<<<<< HEAD

				// 복제된 컨테이너에서 모든 버튼 요소 찾기
				const buttons = buttonContainer[0].querySelectorAll('button');
=======
				newContainer.className = `keyword-container con${originalNum+1}`;

				// 복제된 컨테이너에서 모든 버튼 요소 찾기
				const buttons = newContainer.querySelectorAll('button');
>>>>>>> dee3602 (popup and options sync)
=======

				// 복제된 컨테이너에서 모든 버튼 요소 찾기
				const buttons = buttonContainer[0].querySelectorAll('button');
>>>>>>> d244c07 (draft UI)

				if (buttons.length > 1) {
					for (let i = 0; i < buttons.length - 1; i++) {
						buttons[i].remove();
					}
				}

				// 문서에 새로운 컨테이너 추가
				originalContainer.insertAdjacentElement('afterend', newContainer);

				chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
					console.log(document.body.innerHTML);
				});
			}
		}
	});
	//////////////
	// chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
	// 	console.log(document.body.innerHTML);
	// });
	// chrome.storage.local.get('keywordList', function(result) {
	// 	var removeList = buttonsArea.getElementsByClassName('keyword-container');
	// 	for (var i = 0; i < removeList.length; i++) {
	// 		removeList[i].remove();
	// 	}
	// 	for (var i = 0; i < result.keywordList.length; i++) {
	// 		const newKewCont = document.createElement('container');
	// 		newKewCont.className = `keyword-container con${i+1}`;
	// 		newKewCont.appendChild(document.createElement('hr'));
	// 		const newButCont = document.createElement('div');
	// 		newButCont.classList = 'button-container';
	// 		for (var j = 0; j < result.keywordList[i].length; j++) {
	// 			newButCont.appendChild
	// 		}
	// 		buttonsArea.appendChild()
	// 	}
	// });
	////////////////
	// const tempKeywordList = document.getElementsByClassName('keyword-container');
	// for (var i = 0; i <tempKeywordList.length; i++) {
	// 	console.log(tempKeywordList.length);
	// 	var tempWordList = tempKeywordList[i].getElementsByClassName('red-oval');
	// 	keywordList[i] = [];
	// 	for (var j = 0; j < tempWordList.length; j++) {
	// 		keywordList[i][j] = tempWordList[j].textContent;
	// 	}
	// }
	// chrome.storage.local.set({'keywordList': keywordList}, function() {
	// 	console.log(keywordList);
	// });
});

function addButton(buttonText) {
    const buttonContainer = document.querySelector('.button-container');
    const newButton = document.createElement('button');
    newButton.textContent = buttonText; // 새 버튼의 텍스트를 설정
    newButton.className = 'oval-button red-oval'; // 새 버튼에 클래스 이름을 할당
    buttonContainer.appendChild(newButton); // 버튼 컨테이너에 새 버튼을 추가
}

function setKeyword(keyword) {
	console.log(keyword);
	var text = document.getElementById('textField').value;
	if (text) {
		document.getElementById('textField').value += ', ' + keyword;
	} else {
		document.getElementById('textField').value = keyword;
	}
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> d244c07 (draft UI)
// function submitForm() {
// 	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
// 		// `tabs[0]`은 현재 활성화된 탭을 가리킵니다.
// 		if (tabs.length > 0) {
// 			chrome.tabs.reload(tabs[0].id);
// 		}
// 	});
// }
<<<<<<< HEAD
=======
function submitForm() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		// `tabs[0]`은 현재 활성화된 탭을 가리킵니다.
		if (tabs.length > 0) {
			chrome.tabs.reload(tabs[0].id);
		}
	});
}
>>>>>>> dee3602 (popup and options sync)
=======
>>>>>>> d244c07 (draft UI)

function splitKeywordListNum(str) {
	const name = str.split(' ')[1];
	const matches = name.match(/[0-9]+$/);
	const numKeywordList = matches ? matches[0] : null;
	return (numKeywordList);
}
<<<<<<< HEAD
<<<<<<< HEAD
=======
// document.addEventListener('DOMContentLoaded', function() {
//   chrome.storage.local.get(['videos'], function(result) {
//     if (result.videos) {
//       result.videos.forEach(video => {
//         const content = `<div>
//           <img src="${video.thumbnail}" alt="${video.title}">
//           <p>${video.title}</p>
//           <a href="${video.link}" target="_blank">Watch</a>
//         </div>`;
//         document.body.innerHTML += content;
//       });
//     }
//   });
// });
>>>>>>> 144f325 (get title and link)
=======

>>>>>>> dee3602 (popup and options sync)
=======
>>>>>>> 3fcc778 (popup)
