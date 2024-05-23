const net = require('net');
const mysql = require('mysql');
let connectionId = 0;

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

const server = net.createServer((socket) => {

    const currentConnectionId =connectionId++;

    socket.on('data', (data) => {
        const req = JSON.parse(data);
        const ip = socket.remoteAddress;

        if (req.path === '/topic') {
            const topic = req.body.topic;

            topics[ip] = topic;

            // Send response
            socket.write(JSON.stringify({ message: 'Topic received' }));
        } else if (req.path === '/data') {
            const { title, author } = req.body;


            const topic = topics[ip];

            // TODO: Validate the title and author based on the topic

            const response = {
                title: title
            };
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
