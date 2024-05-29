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
const httpsServer= https.createServer(credentials, app);
const wss= new WebSocketServer({ server: httpsServer });

// HTTPS 서버 리스닝 시작
httpsServer.listen(2018, () => {
    console.log('HTTPS and WebSocket server is running on port 2018');
});

let connectionId = 0;
const apiURL = 'http://13.125.145.225:9836/simCalculate';  // API 서버 주소
let topicsAll = new Map();

function addTopic(topicsAll, topic) {
    if (topicsAll.has(topic)) {
        topicsAll.set(topic, topicsAll.get(topic) + 1);
    } else {
        topicsAll.set(topic, 1);
    }
}

function removeTopic(topicsAll, topic) {
    let currentCount = topicsAll.get(topic);
    if (currentCount > 1) {
        topicsAll.set(topic, currentCount - 1);
    } else {
        topicsAll.delete(topic);
    }

}

wss.on('connection', (ws) => {
    console.log('Client', connectionId, ' connected');
    let thisID = connectionId++;
    let blockType = true;
    let userTopics = new Map();

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

            console.log('Request from client', thisID, req);

            if (!req.path) {
                throw new Error('Missing path in request');
            }

            switch (req.path) {

                case  '/notBanned':
                    const notBannedRequest ={
                        topic : req.topic,
                        title : req.title,
                        video_id : req.video_id
                    }
                    axios.post(apiURL, notBannedRequest);
                    break;

                case '/topic/adjacency':
                    const adjacencyRequest = {
                        topic: req.topic
                    };
                    try {
                        const response = await axios.post(apiURL, adjacencyRequest);
                        ws.send(JSON.stringify(response.data));
                    } catch (error) {
                        console.error('Failed to process adjacency request:', error);
                        ws.send(JSON.stringify({ error: 'Failed to process adjacency request', details: error.message }));
                    }
                    break;

                case '/topic/adjacencyTopic':
                    const adjacencyTopicRequest = {
                        topicsAll: topicsAll
                    };
                    try {
                        const response = await axios.post(apiURL, adjacencyTopicRequest);
                        ws.send(JSON.stringify(response.data));
                    } catch (error) {
                        console.error('Failed to process adjacency topic request:', error);
                        ws.send(JSON.stringify({ error: 'Failed to process adjacency topic request', details: error.message }));
                    }
                    break;

                case '/topic/all':
                    for (let topic of userTopics.keys()) {
                        removeTopic(topicsAll, topic);
                    }
                    for (let i = 0; i < req.topics.length; i++) {
                        userTopics.set(req.topics[i], (req.threshold[i] / 100));
                        addTopic(topicsAll, req.topics[i]);
                    }
                    break;

                case '/topic/add':
                    if (!userTopics.has(req.topic)) {
                        userTopics.set(req.topic, (req.threshold / 100));
                        addTopic(topicsAll, req.topic);
                    }
                    break;

                case '/topic/remove':
                    if (userTopics.has(req.topic)) {
                        userTopics.delete(req.topic);
                        removeTopic(topicsAll, req.topic);
                    }
                    break;

                case '/video':
                    const title = req.title;
                    console.log('videoId:', req.videoId);

                    const apiRequest = {
                        title: title,
                        video_id: req.videoId,
                        topic: Array.from(userTopics.keys())
                    };

                    try {
                        const response = await axios.post(apiURL, apiRequest);
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
                            ws.send(JSON.stringify({ path: req.path, title: title, banned: true }));
                        } else {
                            console.log('Title:', title, 'not banned');
                            ws.send(JSON.stringify({ path: req.path, title: title, banned: false }));
                        }
                    } catch (error) {
                        console.error('Failed to process video request:', error);
                        ws.send(JSON.stringify({ error: 'Failed to process video request', details: error.message }));
                    }
                    break;

                case '/blockType':
                    blockType = req.blockType;
                    break;

                default:
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
        console.log('Client', thisID, 'disconnected');
    });

    console.log('WebSocket server is running on port 2018');
});