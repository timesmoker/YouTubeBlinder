
//import collapse from "bootstrap/js/src/collapse";
import { chatgpt, detectTextFromImageUrl } from '../api/api.js';
import net from 'net';
//const mysql = require('mysql');
let connectionId = 0;
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
    //const currentConnectionId =connectionId++;
    let thisid=connectionId++;
    socket.on('data', (data) => {
        let req;
        try {
            req = JSON.parse(data);
        } catch (error) {
            if (error instanceof SyntaxError) {
                console.error('JSON 형식오류', data);
                return;
            } else {
                throw error; // re-throw the error unchanged
            }
        }
        //const ip = socket.remoteAddress;

        /*  if (req.path === '/topic') {
              const topic = req.body.topic;

              topics[ip] = topic;

              // Send response
              socket.write(JSON.stringify({ message: 'Topic received' }));
          } else */
        console.log('Request from client', thisid);
        const { title,URL } = req; //안쓰는 상수 오류 떠서 제목이랑 URL만 남김, 받아서 썸네일 이미지에서 제목 뽑을거임
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


    });

    socket.on('end', () => {
        console.log('Client',thisid,' disconnected');
    });
});

server.listen(2018, () => {
    console.log('2018포트 열려있음');
});