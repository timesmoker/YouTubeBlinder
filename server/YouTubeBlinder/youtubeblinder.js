
//import collapse from "bootstrap/js/src/collapse";
import WebSocket from 'ws';
import { chatgpt, detectTextFromImageUrl } from '../api/api.js';
//const mysql = require('mysql');
let connectionId = 0;
const wss = new WebSocket.Server({ port: 2018 });
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

    ws.on('message', (data) => {
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

        console.log('Request from client', thisid);
        const { title, URL } = req;

        const startTimeChatGpt = Date.now();
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

        ws.send(JSON.stringify(response));
    });

    ws.on('close', () => {
        console.log('Client', thisid, ' disconnected');
    });
});

console.log('WebSocket server is running on port 2018');