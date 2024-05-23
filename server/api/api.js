import OpenAI from "openai";
import dotenv from 'dotenv';
import vision from '@google-cloud/vision';
import request from 'request';


dotenv.config();

// 환경변수 설정: 서비스 계정 키 파일 위치
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'daring-octane-421708-fdef89be9b20.json';

// 클라이언트 생성
const client = new vision.ImageAnnotatorClient();



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatgpt(word_relation) {

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "제시된 단어에 대한 연관어 10가지를 써줘. 단, 연관어 옆에는 /가 들어가야하며 제시된 단어에 대한 연관성을 숫자로 0~100로 나타내줘. 단어를 나눌때는 ,로 구분해줘. 모든 단어에는 숫자가 들어가야 해. 제시된 단어는 꼭 포함시켜줘.",
        },
        { role: "user", content: word_relation }
      ]
    });
    //return completion.choices[0].message.content;
    
    console.log(completion.choices[0].message.content);
  } catch (error) {
    if (error.code === 'insufficient_quota') {
      console.error("Rate limit exceeded. Please try again later.");
    } else {
      console.error("Error calling OpenAI API:", error);
    }
  }
}

export async function detectTextFromImageUrl(imageUrl) {
  const request = {
    image: {
      source: { imageUri: imageUrl }
    }
  };

  try {
    const [result] = await client.textDetection(request);
    const detections = result.textAnnotations;

    //출력하는 부분
    
    if (detections.length > 0) {
      return detections[0].description; // 전체 텍스트를 출력
    } else {
      //console.log('No text detected');
    }
  } catch (error) {
    console.error('Failed to detect text from image URL:', error);
  }
}

export async function keyword_find(keyword) {
    //아직 키워드 데이터를 받기 전이니 항상 새롭게 시작된다고 하고
    //chatgpt로부터 데이터를 받아온 값이 이거라고 침.
  let relation_keywords = [
      ['음식', '음식/100, 레스토랑/90, 요리/95, 식재료/85, 저녁/80, 점심/80, 아침식사/80, 뷔페/75, 다이어트/70, 맛/90'],
      ['치킨', '치킨/100, 프라이드 치킨/95, 양념 치킨/90, 치킨 무/85, 맥주/80, 치킨 소스/75, 배달 음식/70, 치맥/65, 치킨 집/60, 후라이드/55'],
      ['먹방', '먹방/100, 음식 리뷰/95, 유튜브/90, 방송/85, 라이브 스트리밍/80, 음식 챌린지/75, ASMR/70, 인기 메뉴/65, 식사 시간/60, 먹는 즐거움/55'],
      ['애니메이션', '애니메이션/100, 만화/95, 일본/90, 영화/85, 캐릭터/80, 스토리텔링/75, 액션/70, 드라마/65, 판타지/60, 제작/55'],
      ['피아노', '피아노/100, 음악/95, 건반/90, 클래식/85, 연주/80, 콘서트/75, 작곡/70, 음표/65, 재즈/60, 교육/55'],
      ['게임', '게임/100, 비디오/95, 콘솔/90, 멀티플레이어/85, 캐릭터/80, 레벨/75, 플랫폼/70, 스토리/65, 대회/60, 개발/55'],
      ['롤', '롤/100, e스포츠/95, 챔피언/90, 소환사의 협곡/85, 토너먼트/80, 리그/75, 게임/70, 팀 전투/65, 랭크/60, 전략/55'],
      ['다큐멘터리', '다큐멘터리/100, 실화/95, 인터뷰/90, 조사/85, 역사/80, 자연/75, 사회적 이슈/70, 방송/65, 교육적/60, 감독/55'],
      ['음악', '음악/100, 악기/95, 노래/90, 음표/85, 콘서트/80, 앨범/75, 장르/70, 가수/65, 작곡/60, 라이브/55'],
      ['민희진', '민희진/100, 엔터테인먼트/95, 브랜딩/90, K-팝/85, SM엔터테인먼트/80, 아이돌/75, 마케팅/70, 비주얼 디렉터/65, 걸그룹/60, 패션/55']
  ];

  let results = keyword.map(keyword => {
      let group = relation_keywords.find(group => group[0] === keyword);
      return group ? group[1] : `${keyword} - No matching keywords found`;
  });

  return results;  // 결과 리스트 반환
  
}

// blocktype T => Max Simillarity F=> Total Simiilarity
export function blindSim(maxSim, totalSim, threshold, blockType) {
    if (blockType === true) {
        return maxSim >= threshold;
    } else {
        return totalSim >= threshold;
    }
}

export async function check_api(title,url,keyword) {
    let total_sum = 0;

    if (keyword.length == 0) {
      console.log('키워드에 아무것도 들어있지 않습니다!');
      return;

    }


    let relation_keyword = await keyword_find(keyword);

    let startTimeChatGpt = Date.now(); // 걸린시간 측정하려고    
    let vision_api = await detectTextFromImageUrl(url);
    let endTimeChatGpt = Date.now();
    console.log('VISION API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');



      for (let i = 0; i < relation_keyword.length; i++) {
        // 쉼표로 분리하여 각 키워드/점수 쌍을 처리
        let keywords = relation_keyword[i].split(', ').map(item => {
            let parts = item.split('/');
            return { keyword_split: parts[0], score: parseInt(parts[1], 10) };
        });

      // 제목과 비전 API 문자열에서 각 키워드의 출현 횟수 계산
      keywords.forEach(item => {
          let countInTitle = title.split(item.keyword_split).length - 1;
          let countInVisionApi = vision_api.split(item.keyword_split).length - 1;

          if (countInTitle > 0) {
              total_sum += item.score * countInTitle;
              
          }
          if (countInVisionApi > 0) {
              total_sum += item.score * countInVisionApi;
              
          }
    });
}
    //total_sum 확인차
    //console.log(total_sum);

    // 예시 강도는 4로 초큼 강하게
    if (total_sum > 199) {
        //console.log('Title:', title, 'banned');
        return { title: title };
    }
}


