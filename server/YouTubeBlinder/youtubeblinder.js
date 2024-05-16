
//import collapse from "bootstrap/js/src/collapse";
import {blindSim, chatgpt, detectTextFromImageUrl} from '../api/api.js';
import net from 'net';
import axios from 'axios';
//const mysql = require('mysql');
let connectionId = 0;

const apiurl = 'http://127.0.0.1:5000/apiData';  // Flask 서버의 URL 및 포트 (적절하게 변경 가능)
/*
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

global.db = db;

// Store topics by user IP
const topics = {};
*/
const server = net.createServer((socket) => {
    let thisid=connectionId++;
    let threshold = [0.5,0.4,0.3]; // 이거 이제 설정하는 이벤트 만들어야함
    let blockType = true;
    let topics = ["음악", "게임", "정치"];

    socket.on('data', (data) => {
        const req = JSON.parse(data);
        //const ip = socket.remoteAddress;
        /*  if (req.path === '/topic') {
              const topic = req.body.topic;

              topics[ip] = topic;

              // Send response
              socket.write(JSON.stringify({ message: 'Topic received' }));
          } else */
        /*
        if (req.path === '/data') {
            console.log('Request from client', thisid);
            const { title,URL } = req.body; //안쓰는 상수 오류 떠서 제목이랑 URL만 남김, 받아서 썸네일 이미지에서 제목 뽑을거임
            const startTimeChatGpt = Date.now(); // 걸린시간 측정하려고

            console.log('연관어:');
            console.log(chatgpt(title)); // 연관 주제 확인


            const endTimeChatGpt = Date.now();
            console.log('chatGPT API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');

            const startTimeDetectText = Date.now();
            console.log('썸네일 내 제목:');
            console.log(detectTextFromImageUrl(URL)); // 썸네일 이미지에서 제목 확인
            const endTimeDetectText = Date.now();
            console.log('vision API call 소요시간: ', endTimeDetectText - startTimeDetectText, 'ms');

            let response = {};

            // 30% chance to send the title back
            if (Math.random() <= 0.3) {
                response = { title: title };
                console.log('Title:', title, 'banned');
            }

            socket.write(JSON.stringify(response));
        }
        */

        if( req.path === '/data'){
            //임시
              const title = req.body.title;
              const apiData = {
                  title: title,  // 클라이언트로부터 받은 title 추출
                  topic: topics
              };

              axios.post(apiurl, apiData)
                      .then(response => {

                          console.log('Server response:', response.data);
                          //  데이터 추출
                          const maxSim = response.data.maxSim;
                          const totalSim = response.data.totalSim;

                          // 조건 함수 호출
                          let banned = false;  // 조건을 만족하는지 추적하는 플래그

                          for (let i = 0; i < maxSim.length; i++) {
                              if (blindSim(maxSim[i], totalSim[i], threshold[i], blockType)) {
                                  banned = true;
                                  break;  // 하나라도 조건을 만족하면 반복 종료
                              }
                          }
                          // 조건만족 -> 차단됨
                          if (banned) {
                              console.log('Title:', title, 'banned');
                              socket.write(JSON.stringify(title));
                          }
                          else{// 안만족 -> 암것도 안 보냄(실은 빈거 보냄)
                              socket.write(JSON.stringify({}));
                          }

                      })
                      .catch(error => {
                          console.error('Error:', error);
                      });

        }

    });

    socket.on('end', () => {
        console.log('Client',thisid,' disconnected');
    });
});

server.listen(2018, () => {
    console.log('2018포트 열려있음');
});