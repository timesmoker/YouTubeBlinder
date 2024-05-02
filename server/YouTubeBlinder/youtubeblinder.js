
//import collapse from "bootstrap/js/src/collapse";
//const mysql = require('mysql');
import express from 'express';
import WebSocket,{ WebSocketServer } from 'ws';
import { chatgpt, detectTextFromImageUrl } from '../api/api.js';
let connectionId = 0;

const app = express();
const server = app.listen(2018, () => {
    console.log('HTTP server is running on port 2018');
});
const server2 = app.listen(3000, () => {
    console.log('HTTP server is running on port 3000');
});


const wss = new WebSocketServer({ port: 2018 });

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

wss.on('connection', (ws) => {
    console.log('Client', connectionId, ' connected');
    let thisid = connectionId++;

    ws.on('message', async (data) => {  // async 키워드 추가
        let req;
        try {
            req = JSON.parse(data);
        } catch (error) {
            console.error('JSON 형식오류', data);
            return;
        }

        console.log('Request from client', thisid);
        const { title, URL } = req;

        try {
            const startTimeChatGpt = Date.now();
            console.log('연관어:');
            const chatGptResponse = await chatgpt(title);  // await 추가
            console.log(chatGptResponse);  // 연관 주제 확인
            const endTimeChatGpt = Date.now();
            console.log('chatGPT API call 소요시간: ', endTimeChatGpt - startTimeChatGpt, 'ms');

            const startTimeDetectText = Date.now();
            console.log('썸네일 내 제목:');
            const detectTextResponse = await detectTextFromImageUrl(URL);  // await 추가
            console.log(detectTextResponse);  // 썸네일 이미지에서 제목 확인
            const endTimeDetectText = Date.now();
            console.log('vision API call 소요시간: ', endTimeDetectText - startTimeDetectText, 'ms');
        } catch (apiError) {
            console.error('API Error:', apiError);
            ws.send(JSON.stringify({ error: "Error processing your request" }));
        }

        let response = {};
        if (Math.random() <= 0.3) {
            response = { title: title };
            console.log('Title:', title, 'banned');
        }
        ws.send(JSON.stringify(response));
    });

    ws.on('close', () => {
        console.log('Client', thisid, ' disconnected');
    });
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

console.log('WebSocket server is running on port 2018');