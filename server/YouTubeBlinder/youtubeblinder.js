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
const apiVideoURL = 'http://13.125.145.225:9836/simCalculate';  // API 서버 주소 => 비디오
const apiadjacencyURL = 'http://13.125.145.225:9836/adjacency';  // API 서버 주소 => 연관어
const apiadjacencyTopicURL = 'http://13.125.145.225:9836/adjacencyTopic';  // API 서버 주소 => 연관주제
const apiNotBannedURL = 'http://13.125.145.225:9836/notBanned';  // API 서버 주소 => 차단안됨
let topicsAll = new Map();
let topicAdjacentKeywords = new Map();
let topicAdjacentSim = new Map();

async function addTopic(topicsAll, topic) {
    if (topicsAll.has(topic)) {
        // 있으면 1 증가
        topicsAll.set(topic, topicsAll.get(topic) + 1);
    } else {
        // 없으면 1로 설정
        topicsAll.set(topic, 1);

        // 일단 빈 배열로 초기화
        topicAdjacentKeywords.set(topic, []);

        const apiRequest = { topic: topic };

        try {

            const response = await axios.post(apiadjacencyURL, apiRequest);

            if (response.data && Array.isArray(response.data.topics)) {
                response.data.topics.forEach((topicObj) => {
                    const keyword = topicObj.keyword;
                    const similarity = topicObj.similarity;
                    const adjustedSimilarity = (0.45 - similarity) / 0.0008;

                    topicAdjacentKeywords.set(topic, keyword);
                    console.log('Adjacent keywords for', topic, ':', keyword);
                    topicAdjacentSim.set(topic, adjustedSimilarity);
                });
            } else {
                // 예기치 않은 응답 처리
                console.warn('Unexpected response structure:', response.data);
                topicAdjacentKeywords.set(topic, []);
            }
        } catch (error) {
            console.error('Error fetching adjacent keywords:', error);
            topicAdjacentKeywords.set(topic, []);
        }
    }
}

function removeTopic(topicsAll, topic) {
    let currentCount = topicsAll.get(topic);
    if (currentCount > 1) {
        topicsAll.set(topic, currentCount - 1);
    } else {
        topicsAll.delete(topic);
        topicAdjacentKeywords.delete(topic);
        topicAdjacentSim.delete(topic);
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
                case '/notBanned':
                    const notBannedRequest = {
                        topic: req.topic,
                        title: req.title,
                        video_id: req.video_id
                    };
                    axios.post(apiNotBannedURL, notBannedRequest);
                    break;

                case '/topic/adjacency':
                    const topic = req.topic;

                    if (topicAdjacentKeywords.has(topic)) {
                        // Send the cached data
                        const keywords = topicAdjacentKeywords.get(topic);
                        const sim = topicAdjacentSim.get(topic);
                        ws.send(JSON.stringify({ path: '/topic/adjacency', keywords: keywords , similarity: sim}));
                    }
                    break;

                case '/topic/adjacencyTopic':
                    const adjacencyTopicRequest = {
                        topic: req.topic,
                        topicsAll: topicsAll
                    };
                    try {
                        const response = await axios.post(apiadjacencyTopicURL, adjacencyTopicRequest);
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
                        userTopics.set(req.topics[i], (0.45-(req.threshold *0.0008)));
                        addTopic(topicsAll, req.topics[i]);
                    }
                    break;

                case '/topic/add':
                    if (!userTopics.has(req.topic)) {
                        userTopics.set(req.topic, (0.45-(req.threshold *0.0008)));
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
                    console.log('video_id:', req.video_id);

                    const apiRequest = {
                        title: title,
                        video_id: req.video_id,
                        topic: Array.from(userTopics.keys())
                    };

                    if (apiRequest.topic.length === 0) {
                        console.log('No topics available for video analysis.');
                        ws.send(JSON.stringify({ path: req.path, title: title, error: 'No topics available for video analysis' }));
                        break;
                    }

                    try {
                        const response = await axios.post(apiVideoURL, apiRequest);
                        console.log('Server response:', response.data);

                        const maxSim = response.data.maxSim;
                        const avgSim = response.data.avg_sim;

                        let banned = false;

                        Array.from(userTopics.keys()).forEach((topic, index) => {
                            const threshold = userTopics.get(topic);
                            if (blindSim(maxSim[index], avgSim[index], threshold, blockType)) {
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

                case '/topic/topTopics':
                    const topTopics = Array.from(topicsAll.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
                    ws.send(JSON.stringify({ path: req.path, topTopics: topTopics }));
                    break;

                default:
                    throw new Error('Invalid path in request');
            }
        } catch (error) {
            console.error('Failed to process message:', error.message);
            console.error('Received data:', data);
            ws.send(JSON.stringify({ error: 'Failed to process message', details: error.message }));
        }
    });

    ws.on('close', () => {
        console.log('Client', thisID, 'disconnected');
    });

    console.log('WebSocket server is running on port 2018');
});
