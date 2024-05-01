const net = require('net');
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

    socket.on('data', (data) => {
        const req = JSON.parse(data);
        const ip = socket.remoteAddress;

      /*  if (req.path === '/topic') {
            const topic = req.body.topic;

            topics[ip] = topic;

            // Send response
            socket.write(JSON.stringify({ message: 'Topic received' }));
        } else */
        if (req.path === '/data') {
            const { title } = req.body; //안쓰는 상수 오류 떠서 제목만 남김

            let response = {};

            // 30% chance to send the title back
            if (Math.random() <= 0.3) {
                response = { title: title };
            }

            socket.write(JSON.stringify(response));
        }


    });

    socket.on('end', () => {
        console.log('Client disconnected');
    });
});

server.listen(2018, () => {
    console.log('Server listening on port 2018');
});