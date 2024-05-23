import fs from 'fs';
import https from 'https';
import WebSocket, { WebSocketServer } from 'ws';
import express from 'express';
import { blindSim, chatgpt } from '../api/api.js';


const app = express();

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

    ws.on('message', async (data) => {  // async 키워드 추가
        let req;
        try {
            req = JSON.parse(data);
        } catch (error) {
            console.error('JSON 형식 오류', data);
            ws.send(JSON.stringify({ error: "Invalid JSON format" }));
            return;
        }

        console.log('Request from client', thisid);

        if (req.path === '/topic/add' && !userTopics.has(req.topic)) {
            userTopics.set(req.topic, req.threshold);
        }

        if (req.path === '/topic/all') {
            ws.send(JSON.stringify({ topics: Array.from(userTopics.keys()) }));
        }

        if (req.path === '/topic/remove' && userTopics.has(req.topic)) {
            userTopics.delete(req.topic);
        }

        if (req.path === '/video') {
            const { title, videoId } = req;

            // 유사도 계산 로직 대체 (예시로 처리)
            const maxSim = [0.9, 0.8]; // 예시 값
            const totalSim = [0.9, 0.8]; // 예시 값
            let threshold = [0.7, 0.7]; // 예시 값

            let banned = false;

            for (let i = 0; i < maxSim.length; i++) {
                if (blindSim(maxSim[i], totalSim[i], threshold[i], blockType)) {
                    banned = true;
                    break;
                }
            }

            if (banned) {
                console.log('Title:', title, 'banned');
                ws.send(JSON.stringify({ title: title, banned: true }));
            } else {
                console.log('Title:', title, 'not banned');
                ws.send(JSON.stringify({ title: title, banned: false }));
            }
        }

        if (req.path === '/blockType') {
            blockType = req.blockType;
        }
    });

    ws.on('close', () => {
        console.log('Client', thisid, ' disconnected');
    });
});

console.log('WebSocket server is running on port 2018');
