import OpenAI from "openai";
import dotenv from 'dotenv';
import vision from '@google-cloud/vision';
import request from 'request';
import ExtUtil from 'koalanlp/ExtUtil';


dotenv.config();

// 환경변수 설정: 서비스 계정 키 파일 위치
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'key\\daring-octane-421708-fdef89be9b20.json';

// 클라이언트 생성
const client = new vision.ImageAnnotatorClient();

export async function etri(analysisType, text) {
  const openApiURL = analysisType === "written"
      ? "http://aiopen.etri.re.kr:8000/WiseNLU"
      : "http://aiopen.etri.re.kr:8000/WiseNLU_spoken";

  const access_key = process.env.ETRI_ACCESS_KEY; // .env 파일에서 API 키 로드
  const analysisCode = 'morp'; // 형태소 분석 코드

  const requestJson = {
      'argument': {
          'text': text,
          'analysis_code': analysisCode
      }
  };

  const options = {
      url: openApiURL,
      body: JSON.stringify(requestJson),
      headers: {
          'Content-Type': 'application/json',
          'Authorization': access_key
      }
  };

  return new Promise((resolve, reject) => {
      request.post(options, function (error, response, body) {
          if (!error && response.statusCode == 200) {
              const responseBody = JSON.parse(body);
              resolve(responseBody);
          } else {
              reject('Error : ' + response.statusCode + ', Body: ' + body);
          }
      });
  });
}

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

export async function etri_api(text) {
  try {
      const morphResult = await etri('spoken', text);
      console.log(`문장: ${morphResult.return_object.sentence[0].text}`);
      
      // 형태소 저장을 위한 집합 초기화 (중복 제거용)
      let nounSet = new Set();
      
      // 집합을 이용하여 중복 없이 명사 저장
      morphResult.return_object.sentence[0].morp.forEach(morp => {
          if (morp.type === 'NNP' || morp.type === 'NNG') {
              nounSet.add(morp.lemma);
          }
      });

      // 집합에서 명사만 추출하여 배열로 전환
      let nounList = Array.from(nounSet);

      // 배열에 저장된 모든 명사 출력
      console.log("명사 목록:", nounList.join(', '));
      console.log(nounList);
  } catch (error) {
      console.error(error);
  }
}

async function test1() {
    //check_api함수 테스트
    let title = '[스페인 일상] 호주 음식 맛없다고 불평하는 호주 거주 스페인 친구에게 떡볶이를 해줬어요 음식';
    let url = 'https://img.youtube.com/vi/QPi8I_wIHCw/0.jpg';
    let keywords = ['음식','음악'];
    let startTimeChatGpt = Date.now(); // 걸린시간 측정하려고
    await check_api(title,url,keywords);
    let endTimeChatGpt = Date.now();
    console.log('키워드 2개 API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');


    
    title = '신세계의 음식 맛을 본ᆢ제니의 일기 105';
    url = 'https://img.youtube.com/vi/1n0xDJwDKU8/0.jpg';
    keywords = ['음식','음악','치킨'];
    startTimeChatGpt = Date.now(); // 걸린시간 측정하려고
    await check_api(title,url,keywords);
    endTimeChatGpt = Date.now();
    console.log('키워드 3개 API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');

    title = '정동원 할머니 음식 맛 짱!👍손님맞이에 바쁘시네요~하동 산마루 식당 5월11일';
    url = 'https://img.youtube.com/vi/r-ISiIdEhnE/0.jpg';
    keywords = ['음식', '치킨', '먹방', '애니메이션', '피아노', '게임', '롤', '다큐멘터리', '음악', '민희진'];
    startTimeChatGpt = Date.now(); // 걸린시간 측정하려고
    await check_api(title,url,keywords);
    endTimeChatGpt = Date.now();
    console.log('키워드 10개 API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');


    title = '정동원 할머니 음식 맛 짱!👍손님맞이에 바쁘시네요~하동 산마루 식당 5월11일';
    url = 'https://img.youtube.com/vi/r-ISiIdEhnE/0.jpg';
    keywords = [];
    startTimeChatGpt = Date.now(); // 걸린시간 측정하려고
    await check_api(title,url,keywords);
    endTimeChatGpt = Date.now();
    console.log('키워드 0개 API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');
    
}

async function test2() {
  //keyword_find함수, 제대로 연관어가 나뉘어지는지 판단하기 위한 테스트
  let keywords = ['음식','음악'];
  let startTimeChatGpt = Date.now(); // 걸린시간 측정하려고
  let results = await keyword_find(keywords);
  let endTimeChatGpt = Date.now();

  console.log(results);
  console.log('키워드 함수 call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');



  keywords = [''];
  if (keywords == '') {
    console.log('키워드에 아무것도 들어있지 않습니다!');

  }
}

async function test3() {
  //그냥 또 챗지피티 하고싶어서...
  let word = '음식';
  let startTimeChatGpt = Date.now(); // 걸린시간 측정하려고
  await chatgpt(word);
  let endTimeChatGpt = Date.now();
  console.log('ChatGPT API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');
  
}

async function test4() {
  let startTimeChatGpt = Date.now(); // 걸린시간 측정하려고
  let text = '어떻게 릴스 한 번 찍어봐?오픈마이크 Ep.5발로란트 챔피언스 투어 퍼시픽 2024';
  await etri_api(text);
  let endTimeChatGpt = Date.now();
  console.log('형태소 분석기 API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');
  
}

async function test5() {
  ExtUtil.alphaToHangul("갤럭시S");

}

test2();