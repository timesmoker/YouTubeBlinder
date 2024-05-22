document.addEventListener('DOMContentLoaded', () => {
	chrome.storage.local.get("htmlContent", function(data) {
		if (data.htmlContent) {
			document.body.innerHTML = data.htmlContent;
			console.log("HTML is loaded and applied");
<<<<<<< HEAD
<<<<<<< HEAD
			document.getElementById('btnSettings').style.display = 'none';
=======
			document.getElementById('btnSettings').remove();
>>>>>>> dee3602 (popup and options sync)
=======
			document.getElementById('btnSettings').style.display = 'none';
>>>>>>> 1df4c3d (fix settings)
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
								// console.log(document.body.innerHTML);
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
							// console.log(document.body.innerHTML);
						});
					}

					if (event.target.classList.contains('container-minus')) {
						event.target.parentNode.parentNode.remove();
=======
								console.log(document.body.innerHTML);
=======
								// console.log(document.body.innerHTML);
>>>>>>> d244c07 (draft UI)
							});
						}
<<<<<<< HEAD
>>>>>>> dee3602 (popup and options sync)
=======
						else {
							event.target.parentNode.parentNode.remove();
						}
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
>>>>>>> d244c07 (draft UI)
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
=======
>>>>>>> d244c07 (draft UI)
					event.target.setAttribute('value', event.target.value);

					chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
						// console.log(document.body.innerHTML);
					});
				}
			});

<<<<<<< HEAD
=======
=======

					chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
						console.log(document.body.innerHTML);
					});
>>>>>>> 3fcc778 (popup)
				}
			});

			document.getElementById('btnSubmit').addEventListener('click', submitForm);
>>>>>>> dee3602 (popup and options sync)
=======
>>>>>>> d244c07 (draft UI)
			document.getElementById('btnSettings').addEventListener('click', function() {
				chrome.tabs.create({url: 'options.html'});
			});


			// list plus button
			document.getElementById('cloneButton').addEventListener('click', function() {
<<<<<<< HEAD
<<<<<<< HEAD
				var textFieldValue = document.getElementById('textField').value;
=======
>>>>>>> dee3602 (popup and options sync)
=======
				var textFieldValue = document.getElementById('textField').value;
>>>>>>> d244c07 (draft UI)
				// 기존의 버튼 컨테이너를 선택
				const originalContainer = document.querySelector('.keyword-container');

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
				tempButton[1].className = "oval-button red-oval";
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

				chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
					console.log(document.body.innerHTML);
				});

				// 문서에 새로운 컨테이너 추가
				originalContainer.insertAdjacentElement('afterend', newContainer);
			});
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

>>>>>>> dee3602 (popup and options sync)
=======
>>>>>>> d244c07 (draft UI)
