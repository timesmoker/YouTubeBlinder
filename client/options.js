document.addEventListener('DOMContentLoaded', () => {
<<<<<<< HEAD
	chrome.storage.local.get("htmlContent", function(data) {
		if (data.htmlContent) {
			document.body.innerHTML = data.htmlContent;
			console.log("HTML is loaded and applied");
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
			document.querySelector('script').src = './popup.js';
>>>>>>> 80ad9ef (client latest)
			document.getElementById('btnSettings').style.display = 'none';
=======
			document.getElementById('btnSettings').remove();
>>>>>>> dee3602 (popup and options sync)
=======
			document.getElementById('btnSettings').style.display = 'none';
>>>>>>> 1df4c3d (fix settings)
			const buttonsArea = document.getElementById('buttons-area');
			const topicList = buttonsArea.getElementsByClassName('keyword-container');
			var thresList = [];
			var wordList = [];
			for (var i = 0; i < topicList.length; i++) {
				thresList[i] = topicList[i].getElementsByClassName('slider')[0].value;
				wordList[i] = topicList[i].getElementsByClassName('topic-button')[0].textContent;
			}
			// topic/all
			json = JSON.stringify({ path: '/topic/all', topics: wordList, threshold: thresList });
			chrome.runtime.sendMessage({type: "send_websocket", key: "topic/all", value: json}, function(response) {
				if (chrome.runtime.lastError) {
					console.error("Error sending message: ", chrome.runtime.lastError);
				}
				console.log(`topicAll send response: ${response}`); // "success"
			});

			// topic/adjacency
			for (var i = 0; i < topicList.length; i++) {
				json = JSON.stringify({ path: '/topic/adjacency', topic: wordList[i]})
				chrome.runtime.sendMessage({type: "send_websocket", key: "topic/adjacency", value: json}, function(response) {
					if (chrome.runtime.lastError) {
						console.error("Error sending message: ", chrome.runtime.lastError);
					}
					console.log(`topicAll send response: ${response}`); // "success"
				})
			}

			chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
				if (message.type === 'websocket_message') {
					console.log(`receive socket receive: ${message.value}`);
					resultJson = JSON.parse(message.value);
					// word plus response
					if (message.key.split('/')[0] == "topic") {
						try {
							const resultWordList = resultJson.word;
							const resultThresList = resultJson.threshold;
							for (var i = 0; i < topicList.length; i++){
								console.log(`word: ${resultWordList[i]}///threshold: ${resultThresList[i]}`);
							}
						} catch (e) {
							console.log(e);
						}
					}
					//
				}
				sendResponse({value: message.value});
			});
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
=======
	function checkServerConnection() {
		chrome.runtime.sendMessage({type: "getStatus"}, function(response) {
			if (response.status) {
				console.log("server is connected");
					chrome.storage.local.get("htmlContent", function(data) {
						if (data.htmlContent) {
							document.body.innerHTML = data.htmlContent;
							console.log("HTML is loaded and applied");
						}
						document.querySelector('script').src = './popup.js';
						//document.getElementById('btnSettings').style.display = 'none';
						const ytButton = document.getElementById('YouTubeButton');
						ytButton.addEventListener('click', function() {
							chrome.tabs.create({url: 'https://www.youtube.com'});
						})
						const buttonsArea = document.getElementById('buttons-area');
						const topicList = buttonsArea.getElementsByClassName('keyword-container');
						var thresList = [];
						var wordList = [];
						for (var i = 0; i < topicList.length; i++) {
							thresList[i] = topicList[i].getElementsByClassName('slider')[0].value;
							wordList[i] = topicList[i].getElementsByClassName('topic-button')[0].textContent;
						}
						console.log(`init ${wordList}`);
						chrome.storage.local.set({"wordList": wordList}, function() {});
						if (topicList.length > 0) {
							// topic/all
							json = JSON.stringify({ path: '/topic/all', topics: wordList, threshold: thresList });
							chrome.runtime.sendMessage({type: "send_websocket", key: "topic/all", value: json}, function(response) {
								if (chrome.runtime.lastError) {
									console.error("Error sending message: ", chrome.runtime.lastError);
								}
								console.log(`topicAll send response: ${response}`); // "success"
							});
						}
						document.getElementsByClassName('get-adjacent')[0].addEventListener('click', function(event) {
							console.log(wordList);
							for (var i = 0; i < wordList.length; i++) {
								json = JSON.stringify({path: "/topic/adjacency", topic: wordList[i]});
								console.log(`ADJACENCY: ${wordList[i]}`);
								chrome.runtime.sendMessage({type: "send_websocket", value: json}, function(response) {
									if (chrome.runtime.lastError) {
										console.error("Error sending message: ", chrome.runtime.lastError);
									}
									console.log(`topicAdjacency send response: ${response}`); // "success"
								});
							}
						});
						json = JSON.stringify({path: "/load/list"});
						chrome.runtime.sendMessage({type: "send_websocket", "key": "send", value: json}, function(response) {
							if (chrome.runtime.lastError) {
								console.error("Error sending message: ", chrome.runtime.lastError);
							}
							console.log(`/load/list send response: ${response}`); // "success"
						});
						chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
							console.log(message.type);
							if (message.type === "/topic/adjacency") {
								const receive = JSON.parse(message.value);
								if (receive['status'] == 1) {
									alert(`${receive['topic']} 로딩 성공!`);
									var i = 0;
									while (true) {
										console.log(wordList[i]);
										if (wordList[i] == receive['topic']) {
											break;
										}
										i++;
									}
									const keywordList = receive['keywords'];
									const simList = receive['similarity'];
									// new word plus
									const adjacentButton = topicList[i].getElementsByClassName('word-plus')[0];
									for (var j = 0; j < keywordList.length; j++) {
										const newButton = document.createElement('button');
										newButton.textContent = keywordList[j];
										newButton.className = 'oval-button red-oval toggle-button';
										adjacentButton.parentNode.appendChild(newButton);
										chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
											// console.log(document.body.innerHTML);
										});
									}
									sendResponse({status: true});
								} else if (receive['status'] == 2) {
									alert(`${receive['topic']}의 연관 주제 생성중입니다. 잠시 후 다시 시도해주세요`);
									sendResponse({status: true});
								}
							}
							if (message.type === "/topic/add") {
								console.log("=============================");
								sendResponse({status: true});
							}
							if (message.type === "/load/list") {
								const receive = JSON.parse(message.value);
								chrome.storage.local.set({"loadList": receive['data']}, function() {

								});
							}
							return true
						});

						buttonsArea.addEventListener('click', function(event) {
							if (event.target && event.target.nodeName === 'BUTTON') {
								if (event.target.classList.contains('toggle-button')) {
									event.target.classList.toggle('active');
									var isActive = this.classList.contains('active');
									console.log('토글 상태:', isActive ? '활성화' : '비활성화');
									chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {});
								}

								// topic/remove
								if (event.target.classList.contains('container-minus')) {
									const topic = event.target.parentNode.getElementsByClassName('topic-button')[0].textContent;
									console.log(`topic type: ${typeof(topic)}`);
									// topic/remove
									json = JSON.stringify({ path: '/topic/remove', topic: topic });
									chrome.runtime.sendMessage({type: "send_websocket", key: "topic/remove", value: json}, function(response) {
										if (chrome.runtime.lastError) {
											console.error("Error sending message: ", chrome.runtime.lastError);
										}
										console.log(`topicRemove send response: ${response}`); // "success"
									});

									event.target.parentNode.parentNode.remove();
									const idx = wordList.indexOf(topic);
									if (idx > -1) wordList.splice(idx, 1)
									console.log(wordList);
									chrome.storage.local.set({"wordList": wordList});
									chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
										// console.log(document.body.innerHTML);
									});
								}
							}
						});
						buttonsArea.addEventListener('input', function(event) {
							if (event.target.className === 'slider') {
								// 슬라이더 값을 해당 슬라이더 바로 옆의 span 요소에 표시
								event.target.nextElementSibling.textContent = event.target.value;
								event.target.setAttribute('value', event.target.value);
								const buttonList = event.target.parentNode.parentNode.getElementsByClassName('red-oval');

								for (var i = 0; i <buttonList.length; i++) {
									if (i / buttonList.length < event.target.value / event.target.max) {
										buttonList[i].classList.add('active');
									}
								}
								for (var i = 0; i <buttonList.length; i++) {
									if (i / buttonList.length > event.target.value / event.target.max) {
										buttonList[i].classList.remove('active');
									}
								}

								chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
									// console.log(document.body.innerHTML);
								});
							}
						});

						document.getElementById('textField').addEventListener('keypress', function(e) {
							if (e.key === 'Enter') {
								submitFunc();
							}
						});
						var overfifteen = false;
						// list plus button
						document.getElementById('cloneButton').addEventListener('click', submitFunc);
						function submitFunc() {
							// 15개 넘으면 리스트 안 받음
							if (overfifteen) {
								return;
							}
							const textFieldValue = document.getElementById('textField').value;
							// 기존의 버튼 컨테이너를 선택
							const originalContainers = document.querySelectorAll('.keyword-container');
							const originalContainer = originalContainers[originalContainers.length - 1];


							// 컨테이너를 깊은 복사하여 모든 요소를 포함하여 복제
							// const tempContainer = originalContainer.cloneNode(true);
							// chrome.storage.local.set({"listPlus": tempContainer.innerHTML}, function() {

							// });

							var newContainer = document.createElement('div');
							originalNum = 0;
							console.log(originalContainer);
							if (originalContainer !== undefined) {
								originalNum = splitKeywordListNum(originalContainer.className);
							}
							newContainer.className = `keyword-container con${parseInt(originalNum)+1}`;
							// chrome.storage.local.get("listPlus", function(data) {
							// 	newContainer.innerHTML = data.listPlus;
							// 	console.log(data.listPlus);
							// 	newContainer.getElementsByClassName('topic-button')[0].textContent = textFieldValue;
							// 	json = JSON.stringify({ path: '/save/list', data: newContainer.innerHTML});
							// 	chrome.runtime.sendMessage({type: "send_websocket", "key": "send", value: json}, function(response) {
							// 		if (chrome.runtime.lastError) {
							// 			console.error("Error sending message: ", chrome.runtime.lastError);
							// 		}
							// 		console.log(`/save/list send response: ${response}`); // "success"
							// 	});
							// });
							chrome.storage.local.get("loadList", function(data) {
								newContainer.innerHTML = data.loadList.trim();
								console.log(newContainer);
								newContainer.getElementsByClassName('topic-button')[0].textContent = textFieldValue;
								if (originalNum >= 14) {
									overfifteen = true;
								}
								// chrome.storage.local.set({"listPlus": newContainer.innerHTML}, function() {
								// 	console.log(newContainer.innerHTML);
								// });

								// 문서에 새로운 컨테이너 추가
								if (originalContainer !== undefined) {
									console.log('1');
									originalContainer.insertAdjacentElement('afterend', newContainer);
								} else {
									console.log('2');
									buttonsArea.appendChild(newContainer);
								}
							});
							console.log(document.body.innerHTML);
							wordList[wordList.length] = textFieldValue;
							console.log(wordList);
							chrome.storage.local.set({"wordList": wordList}, function() {});
							// topic/add
							json = JSON.stringify({ path: '/topic/add', topic: textFieldValue, threshold: 100 });
							chrome.runtime.sendMessage({type: "send_websocket", key: "send", value: json}, function(response) {
								if (chrome.runtime.lastError) {
									console.error("Error sending message: ", chrome.runtime.lastError);
								}
								console.log(`topicAdd send response: ${response}`); // "success"
							});

<<<<<<< HEAD
>>>>>>> f36770c (naive blind)
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
					}
<<<<<<< HEAD
					if (event.target.classList.contains('toggle-button')) {
						event.target.classList.toggle('active');
						var isActive = this.classList.contains('active');
						console.log('토글 상태:', isActive ? '활성화' : '비활성화');
						chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
							console.log(document.body.innerHTML);
						});
					}

					// topic/remove
					if (event.target.classList.contains('container-minus')) {
						const topic = event.target.parentNode.getElementsByClassName('topic-button')[0].textContent;
						console.log(`topic type: ${typeof(topic)}`);
						// topic/remove
						json = JSON.stringify({ path: '/topic/remove', topic: topic });
						chrome.runtime.sendMessage({type: "send_websocket", key: "topic/remove", value: json}, function(response) {
							if (chrome.runtime.lastError) {
								console.error("Error sending message: ", chrome.runtime.lastError);
							}
							console.log(`topicAdd send response: ${response}`); // "success"
						});

						event.target.parentNode.parentNode.remove();
<<<<<<< HEAD
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
=======
						chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
							// console.log(document.body.innerHTML);
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
=======
>>>>>>> d244c07 (draft UI)
					event.target.setAttribute('value', event.target.value);
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

					chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
						console.log(document.body.innerHTML);
					});
				}
			});

<<<<<<< HEAD
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
=======
			document.getElementById('textField').addEventListener('keypress', function(e) {
				if (e.key === 'Enter') {
					submitFunc();
				}
>>>>>>> 80ad9ef (client latest)
			});
			// list plus button
<<<<<<< HEAD
			document.getElementById('cloneButton').addEventListener('click', function() {
<<<<<<< HEAD
<<<<<<< HEAD
=======
			document.getElementById('cloneButton').addEventListener('click', submitFunc);
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

				sliderContainer[0].getElementsByClassName('slider')[0].setAttribute('value', 100);
				sliderContainer[0].getElementsByClassName('sliderValue')[0].textContent = 100;

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

				// topic/add
				json = JSON.stringify({ path: '/topic/add', topic: textFieldValue, threshold: 100 });
				chrome.runtime.sendMessage({type: "send_websocket", key: "send", value: json}, function(response) {
					if (chrome.runtime.lastError) {
						console.error("Error sending message: ", chrome.runtime.lastError);
					}
					console.log(`topicAdd send response: ${response}`); // "success"
				});

				chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {
					console.log(document.body.innerHTML);
=======
>>>>>>> f36770c (naive blind)
=======
							chrome.storage.local.set({'htmlContent': document.body.innerHTML}, function() {});

						}
<<<<<<< HEAD
				// 	}
>>>>>>> a6672ef (demo try)
=======
				// // 	}
>>>>>>> aa8fa55 (demo try)
				});
				//////////////
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
			} else {
				console.log("waiting for server connection...");
				setTimeout(() => {
					checkServerConnection();
				}, 1000);
			}
		});
	}
	checkServerConnection();
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
