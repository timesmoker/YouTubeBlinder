import OpenAI from "openai";
import dotenv from 'dotenv';
import vision from '@google-cloud/vision';

dotenv.config();


// 환경변수 설정: 서비스 계정 키 파일 위치
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'key\\daring-octane-421708-fdef89be9b20.json';

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
    return completion.choices[0].message.content;
    
    //console.log(completion.choices[0].message.content);
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

export async function check_api(title,url) {
    let total_sum = 0;

    //아직 키워드 데이터를 받기 전이니 항상 새롭게 시작된다고 하고
    //chatgpt로부터 데이터를 받아온 값이 이거라고 침.
    //음식이란 데이터를 받아옴
    let relation_keywords = '음식/100, 레스토랑/90, 요리/95, 식재료/85, 저녁/80, 점심/80, 아침식사/80, 뷔페/75, 다이어트/70, 맛/90';
    let startTimeChatGpt = Date.now(); // 걸린시간 측정하려고   
    
    let vision_api = await detectTextFromImageUrl(url);
    //vision_api 확인차
    //console.log(vision_api);
    let endTimeChatGpt = Date.now();
    //console.log('VISION API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');

    //키워드 해체기
    let keywords = relation_keywords.split(', ').map(item => {
        let parts = item.split('/');
        return { keyword: parts[0], score: parseInt(parts[1], 10) };
      });
      

      //title에 포함된 키워드의 점수를 합산
      keywords.forEach(item => {
        // 제목에서 키워드 출현 횟수 계산
        let count = title.split(item.keyword).length - 1;
        if (count > 0) {
        total_sum += item.score * count;  // 키워드 출현 횟수에 따라 점수를 계산
        //console.log(`Title Keyword: ${item.keyword}, Title Score: ${item.score}, Count: ${count}`);
    }
});

      //vision에 포함된 키워드의 점수를 합산
      keywords.forEach(item => {
        // 제목에서 키워드 출현 횟수 계산
        let count = vision_api.split(item.keyword).length - 1;
        if (count > 0) {
        total_sum += item.score * count;  // 키워드 출현 횟수에 따라 점수를 계산
        //console.log(`Vision Keyword: ${item.keyword}, Vision Score: ${item.score}, Count: ${count}`);
    }
});

      //total_sum 확인차
      //console.log(total_sum);

    // 예시 강도는 4로 초큼 강하게
    if (total_sum > 399) {
        console.log('Title:', title, 'banned');
        return { title: title };
    }
}

/*async function main() {
  await detectTextFromImageUrl(imageUrl);
  await chatgpt(word_relation);
}



// 이미지 URL
let imageUrl = 'https://img.youtube.com/vi/fvopu4WWcfo/0.jpg';

let word_relation = '나무';


main();
*/


/*
async function test1() {
    let title = '[스페인 일상] 호주 음식 맛없다고 불평하는 호주 거주 스페인 친구에게 떡볶이를 해줬어요 음식';
    let url = 'https://img.youtube.com/vi/QPi8I_wIHCw/0.jpg';
    let startTimeChatGpt = Date.now(); // 걸린시간 측정하려고
    await check_api(title,url);
    let endTimeChatGpt = Date.now();
    console.log('API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');

    title = '신세계의 음식 맛을 본ᆢ제니의 일기 105';
    url = 'https://img.youtube.com/vi/1n0xDJwDKU8/0.jpg';
    startTimeChatGpt = Date.now(); // 걸린시간 측정하려고
    await check_api(title,url);
    endTimeChatGpt = Date.now();
    console.log('API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');

    title = '정동원 할머니 음식 맛 짱!👍손님맞이에 바쁘시네요~하동 산마루 식당 5월11일';
    url = 'https://img.youtube.com/vi/r-ISiIdEhnE/0.jpg';
    startTimeChatGpt = Date.now(); // 걸린시간 측정하려고
    await check_api(title,url);
    endTimeChatGpt = Date.now();
    console.log('API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');
}

test1();
*/