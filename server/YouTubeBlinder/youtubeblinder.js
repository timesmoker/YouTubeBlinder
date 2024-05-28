import fs from 'fs';
import https from 'https';
import WebSocket, { WebSocketServer } from 'ws';
import express from 'express';
import { blindSim } from '../api/api.js';
import axios from 'axios';

const app = express();
app.get('/', (req, res) => {
    res.send('Hello World!');
});

const privateKey = fs.readFileSync('../Key/privkey.pem', 'utf8');
const certificate = fs.readFileSync('../Key/fullchain.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };

// HTTPS 서버 생성 및 WebSocket 서버와 연동
const httpsServer = https.createServer(credentials, app);
const wss = new WebSocketServer({ server: httpsServer });

// HTTPS 서버 리스닝 시작
httpsServer.listen(2018, () => {
    console.log('HTTPS and WebSocket server is running on port 2018');
});

let connectionId = 0;
const apiurl = 'http://13.125.145.225:9836/simCalculate';  // API 서버 주소
let topicsAll = new Map();

function addTopic(topic) {
    if (topicsAll.has(topic)) {
        topicsAll.set(topic, topicsAll.get(topic) + 1);
    } else {
        topicsAll.set(topic, 1);
    }
}

function removeTopic(topic) {
    if (topicsAll.has(topic)) {
        let currentCount = topicsAll.get(topic);
        if (currentCount > 1) {
            topicsAll.set(topic, currentCount - 1);
        } else {
            topicsAll.delete(topic);
        }
    }
}

wss.on('connection', (ws) => {
    console.log('Client', connectionId, ' connected');
    let thisid = connectionId++;
    let blockType = true;
    let userTopics = new Map();

    // 토픽 예시 설정
    userTopics.set('게임', 0.6);
    userTopics.set('발라드', 0.6);
    userTopics.set('힙합', 0.7);

    ws.on('message', async (data) => {
        try {
            if (data === undefined || data === null || data === '') {
                throw new Error('Received empty data');
            }

            let req;
            try {
                req = JSON.parse(data);
            } catch (parseError) {
                throw new Error('Invalid JSON format');
            }

            console.log('Request from client', thisid, req);

            if (!req.path) {
                throw new Error('Missing path in request');
            }

            if (req.path === '/topic/add' && !userTopics.has(req.topic)) {
                userTopics.set(req.topic, req.threshold);
            } else if (req.path === '/topic/all') {
                ws.send(JSON.stringify({ topics: Array.from(userTopics.keys()) }));
            } else if (req.path === '/topic/remove' && userTopics.has(req.topic)) {
                userTopics.delete(req.topic);
            } else if (req.path === '/video') {
                const title = req.title;
                console.log('videoId:', req.videoId);

                const apiRequest = {
                    title: title,
                    video_id: req.videoId,
                    topic: Array.from(userTopics.keys())
                };

                const response = await axios.post(apiurl, apiRequest);
                console.log('Server response:', response.data);

                const maxSim = response.data.maxSim;
                const totalSim = response.data.totalSim;

                let banned = false;

                Array.from(userTopics.keys()).forEach((topic, index) => {
                    const threshold = userTopics.get(topic);
                    if (blindSim(maxSim[index], totalSim[index], threshold, blockType)) {
                        banned = true;
                    }
                });

                if (banned) {
                    console.log('Title:', title, 'banned');
                    ws.send(JSON.stringify({ title: title, banned: true }));
                } else {
                    console.log('Title:', title, 'not banned');
                    ws.send(JSON.stringify({ title: title, banned: false }));
                }
            } else if (req.path === '/blockType') {
                blockType = req.blockType;
            } else {
                throw new Error('Invalid path in request');
            }
        } catch (error) {
            console.error('Failed to process message', error.message);
            console.error('Received data:', data);

            // 오류를 서버 콘솔에 출력
            console.log('Invalid message received from client:', data);
            console.log('Error:', error.message);
        }
    });

    ws.on('close', () => {
        console.log('Client', thisid, 'disconnected');
    });



    console.log('WebSocket server is running on port 2018');
});