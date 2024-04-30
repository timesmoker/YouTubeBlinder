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
