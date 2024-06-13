window.addEventListener('load', () => {
    // 유튜브 영상들이 나오는 부분 선택
    const contents = document.querySelector('#contents') || document.querySelector('ytd-item-section-renderer');
    console.log(contents);

    if (contents) {
      // contents 요소의 위치 스타일을 relative로 설정
      contents.style.position = 'relative';

      // 화면을 가릴 div 요소 생성
      const blockerDiv = document.createElement('div');
      blockerDiv.style.position = 'absolute';
      blockerDiv.style.top = '0';
      blockerDiv.style.left = '0';
      blockerDiv.style.width = '100%';
      blockerDiv.style.height = '100%';
      blockerDiv.style.backgroundColor = '#181818'; // 다크 모드 배경색
      blockerDiv.style.zIndex = '9999';
      blockerDiv.style.color = 'white'; // 텍스트 색상
      blockerDiv.style.display = 'flex';
      blockerDiv.style.justifyContent = 'center';
      blockerDiv.style.alignItems = 'flex-start'; // 텍스트를 상단에 위치
      blockerDiv.style.fontSize = '40px'; // 글씨 크기 설정
      blockerDiv.style.paddingTop = '70px'; // 상단 여백 설정
      blockerDiv.innerText = '로딩 중...';

      // contents 요소에 blockerDiv 추가
      contents.appendChild(blockerDiv);

      // 3초 뒤 화면 가리기 제거
      setTimeout(() => {
        blockerDiv.style.display = 'none';
      }, 3000);
    }
});
