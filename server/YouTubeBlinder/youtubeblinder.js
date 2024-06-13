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

const listInit = "            <div class=\"key-container\">\n" +
    "                <button class=\"container-minus\">🗑</button>\n" +
    "                <button class=\"oval-button red-oval topic-button\">음악</button>\n" +
    "            </div>\n" +
    "            <div class=\"slider-container\">\n" +
    "                <input type=\"range\" class=\"slider\" min=\"1\" max=\"100\" value=\"50\">\n" +
    "                <span class=\"sliderValue\">50</span>\n" +
    "                <div class=\"text\" style=\"position: relative;\">\n" +
    "                    <p style=\"position: absolute; left: 0;\">약하게</p>\n" +
    "                    <p style=\"position: absolute; right: 0;\">강하게</p>\n" +
    "                </div>\n" +
    "                <div class=\"button-container\">\n" +
    "                    <button class=\"oval-button word-plus\">연관단어</button>\n" +
    "                </div>\n" +
    "            </div>"
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
        // 없으면 1로 설정 + 연관어 추가
        topicsAll.set(topic, 1);

        // 일단 빈 배열로 초기화

        if(topicAdjacentKeywords.has(topic)&&topicAdjacentSim.has(topic)){
            return;
        }

        topicAdjacentKeywords.set(topic, []);
        const apiRequest = { topic: topic };

        try {
            const response = await axios.post(apiadjacencyURL, apiRequest);

            if (response.data && Array.isArray(response.data.topics)) {
                // 키워드와 유사도를 저장할 배열
                const keywords = [];
                const similarities = [];

                response.data.topics.forEach((topicObj) => {
                    const keyword = topicObj.keyword;
                    const similarity = topicObj.similarity;
                    const adjustedSimilarity = ( 0.45 - similarity) / 0.0008;

                    keywords.push(keyword);
                    similarities.push(adjustedSimilarity);
                });

                // 해당 주제에 대해 키워드 리스트와 유사도 리스트를 저장
                topicAdjacentKeywords.set(topic, keywords);
                topicAdjacentSim.set(topic, similarities);

                console.log('Adjacent keywords for', topic, ':', keywords);
                console.log('Adjusted similarities for', topic, ':', similarities);

            } else {
                // 예기치 않은 응답 처리
                console.warn('Unexpected response structure:', response.data);
                topicAdjacentKeywords.set(topic, []);
                topicAdjacentSim.set(topic, []);
            }
        } catch (error) {
            console.error('Error fetching adjacent keywords:', error);
            topicAdjacentKeywords.set(topic, []);
            topicAdjacentSim.set(topic, []);
        }
    }
}

function removeTopic(topicsAll, topic) {
    let currentCount = topicsAll.get(topic);
    console.log('Current count for topic', topic, 'is', currentCount);

    if (currentCount > 1) {
        console.log('Decreasing count for topic', topic, 'from', currentCount, 'to', currentCount - 1)
        topicsAll.set(topic, currentCount - 1);
    } else {
        console.log('Removing topic', topic);
        topicsAll.delete(topic);
    }
}

wss.on('connection', (ws) => {
    console.log('Client', connectionId, ' connected');
    let thisID = connectionId++;
    let blockType = true;
    let userTopics = new Map();
    let topicWhiteList = new Map();
    let htmlContent = '';
    let listContent = listInit;
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
                case '/save/html':
                    htmlContent = req.data;
                    break;
                case '/load/html':
                    ws.send(JSON.stringify({ path: req.path, data: htmlContent }));
                    break;
                case '/save/list':
                    listContent = req.data;
                    break;
                case '/load/list':
                    ws.send(JSON.stringify({ path: req.path, data: listContent }));
                    break;
                case '/notBanned':
                    const notBannedRequest = {
                        topic: req.topic,
                        title: req.title,
                        video_id: req.video_id
                    };
                    axios.post(apiNotBannedURL, notBannedRequest);
                    break;

                case '/topic/adjacency':

                    let topicAdjacency = req.topic;

                    if (topicAdjacentKeywords.has(topicAdjacency)) {
                        // Send the cached data
                        if(topicsAll.has(topicAdjacency)){
                            if (topicAdjacentKeywords.has(topicAdjacency) && topicAdjacentSim.has(topicAdjacency)) {

                                const keywords = topicAdjacentKeywords.get(topicAdjacency);
                                const sim = topicAdjacentSim.get(topicAdjacency);
                                ws.send(JSON.stringify({ path: '/topic/adjacency', topic:req.topic, keywords: keywords , similarity: sim, status: 1}));
                            }
                            else{
                                ws.send(JSON.stringify({ path: '/topic/adjacency',topic:req.topic, keywords: [], similarity: [], status: 2}));
                            }
                        }
                        else{
                            ws.send(JSON.stringify({ path: '/topic/adjacency', topic:req.topic, keywords: [], similarity: [], status: 3}));
                        }
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

                case '/topic/whiteList':
                    let topicToWhite = req.topic;   // 화이트리스트 할 토픽
                    if (!topicWhiteList.has(topicToWhite)) {
                        topicWhiteList.set(topicToWhite, []); // 새로운 토픽을 빈 배열로 초기화
                    }
                    if (req.whiteList && Array.isArray(req.whiteList)) { // req.whiteList가 정의되어 있고 배열인지 확인
                        for (let i = 0; i < req.whiteList.length; i++) {
                            topicWhiteList.get(topicToWhite).push(req.whiteList[i]);
                        }
                    } else {
                        console.error("Invalid whiteList provided");
                    }
                    break;

                case '/topic/all':
                    for (let topic of userTopics.keys()) {
                        removeTopic(topicsAll, topic);
                    }
                    for (let i = 0; i < req.topics.length; i++) {
                        userTopics.set(req.topics[i], (0.45-(req.threshold[i] *0.0008)));
                        topicWhiteList.set(req.topic,[])
                        addTopic(topicsAll, req.topics[i]);

                    }
                    break;

                case '/topic/add':
                    if (!userTopics.has(req.topic)) {
                        userTopics.set(req.topic, (0.45-(req.threshold *0.0008)));
                        topicWhiteList.set(req.topic,[])
                        addTopic(topicsAll, req.topic);
                    }
                    break;

                case '/topic/remove':
                    if (userTopics.has(req.topic)) {
                        userTopics.delete(req.topic);
                        topicWhiteList.delete(req.topic);
                        removeTopic(topicsAll, req.topic);
                    }
                    break;

                case '/topic/debug':
                    console.log('All topics:', topicsAll);
                    console.log('User topics:', userTopics);
                    console.log('Topic white list:', topicWhiteList);
                    break;

                case '/video':
                    const title = req.title;
                    console.log('video_id:', req.video_id);

                    const apiRequest = {
                        title: title,
                        video_id: req.video_id,
                        topic: Array.from(userTopics.keys()),
                        whiteList: Array.from(userTopics.keys()).reduce((acc, topic) => {
                            acc[topic] = topicWhiteList.get(topic) || [];
                            return acc;
                        }, {})
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
                        let bannedTopics = [];

                        Array.from(userTopics.keys()).forEach((topic, index) => {
                            const threshold = userTopics.get(topic);
                            if (blindSim(maxSim[index], avgSim[index], threshold, blockType)) {
                                banned = true;
                                bannedTopics.push(topic);
                            }
                        });

                        if (banned) {
                            console.log('Title:', title, 'banned');
                            console.log("banned topics: ",bannedTopics);
                            ws.send(JSON.stringify({ path: req.path, title: title, banned: true , bannedTopics: bannedTopics}));
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
        for (let topic of userTopics.keys()) {
            removeTopic(topicsAll, topic);
        }
        console.log('Client', thisID, 'disconnected');
    });

    console.log('WebSocket server is running on port 2018');
});
