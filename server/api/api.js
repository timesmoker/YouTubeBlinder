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

async function chatgpt(word_relation) {

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "제시된 단어와 연관된 단어 3가지를 고를것. 단, 단어에 대한 설명은 하지마. 단어만 알려줘, 연관성 순서로 골라줘.",
        },
        { role: "user", content: word_relation }
      ]
    });
    let responseText = completion.choices[0].message.content;


    //출력하는 부분
    // 아래 코드는 출력하는 코드라 임이
    // console.log(responseText);
  } catch (error) {
    if (error.code === 'insufficient_quota') {
      console.error("Rate limit exceeded. Please try again later.");
    } else {
      console.error("Error calling OpenAI API:", error);
    }
  }
}
async function detectTextFromImageUrl(imageUrl) {
  const request = {
    image: {
      source: { imageUri: imageUrl }
    }
  };

  try {
    const [result] = await client.textDetection(request);
    const detections = result.textAnnotations;

    //출력하는 부분
    console.log('Text:');
    if (detections.length > 0) {
      console.log(detections[0].description); // 전체 텍스트를 출력
    } else {
      console.log('No text detected');
    }
  } catch (error) {
    console.error('Failed to detect text from image URL:', error);
  }
}

async function main() {
  await detectTextFromImageUrl(imageUrl);
  await chatgpt(word_relation);
}



// 이미지 URL
let imageUrl = 'https://img.youtube.com/vi/fvopu4WWcfo/0.jpg';

let word_relation = '나무';


main();

