const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 9000;

const server = app.listen(PORT, () => {
    console.log(`Age of Now Signaling Server running on port ${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/myapp'
});

app.use('/peerjs', peerServer);

let connectedClients = 0;

peerServer.on('connection', (client) => {
    connectedClients++;
    console.log(`Client connected. Total active players: ${connectedClients}`);
});

peerServer.on('disconnect', (client) => {
    connectedClients = Math.max(0, connectedClients - 1);
    console.log(`Client disconnected. Total active players: ${connectedClients}`);
});

app.get('/api/player-count', (req, res) => {
    res.json({ count: connectedClients });
});

app.get('/', (req, res) => {
    res.send('Age of Now Signaling Server is online. Active players: ' + connectedClients);
});
