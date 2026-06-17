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

app.get('/', (req, res) => {
    res.send('Age of Now Signaling Server is online.');
});
