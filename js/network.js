export class NetworkController {
    constructor(game) {
        this.game = game;
        this.peer = null;
        this.hostConnection = null;
        this.clientConnections = [];
        this.isHost = false;
        this.isClient = false;
        this.peerId = null;
        this.clientFactions = new Map();
        this.availableSlots = [
            { id: 2, faction: 'enemy' },
            { id: 3, faction: 'player3' },
            { id: 4, faction: 'player4' }
        ];
        this.lobbyState = {
            1: { type: 'host', faction: 'player' },
            2: { type: 'pc', faction: 'enemy' },
            3: { type: 'empty', faction: 'player3' },
            4: { type: 'empty', faction: 'player4' }
        };
        this.updateRate = 1000 / 15; // 15 ticks per second is enough for RTS
        this.lastUpdate = 0;
    }

    initHost(onReady) {
        this.isHost = true;
        this.game.localFaction = 'player';
        
        const peerConfig = {
            debug: 2,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        };
        this.peer = new Peer(peerConfig);
        this.peer.on('disconnected', () => {
            console.log('Host disconnected from PeerServer. Reconnecting...');
            this.peer.reconnect();
        });
        this.peer.on('open', (id) => {
            this.peerId = id;
            this.lobbyState[1].peerId = id;
            if (onReady) onReady(id);
            this.setupVoiceListeners();
        });

        this.peer.on('connection', (conn) => {
            if (this.availableSlots.length === 0) {
                conn.send({ type: 'ERROR', message: 'Game is full.' });
                setTimeout(() => conn.close(), 500);
                return;
            }

            const slot = this.availableSlots.shift();
            this.clientFactions.set(conn.peer, slot);
            this.clientConnections.push(conn);
            
            this.lobbyState[slot.id].type = 'player';
            this.lobbyState[slot.id].peerId = conn.peer;
            this.broadcastLobbyState();

            conn.on('open', () => {
                console.log(`Client ${conn.peer} connected as ${slot.faction}`);
                if (this.game.gameStarted) {
                    conn.send({
                        type: 'START_GAME',
                        seedX: this.game.world.seedX,
                        seedZ: this.game.world.seedZ,
                        mapSize: this.game.world.mapSize,
                        lobbyState: this.lobbyState,
                        mapType: this.game.world.mapType,
                        yourFaction: slot.faction
                    });
                }
                // Send current lobby state to the new client
                conn.send({
                    type: 'LOBBY_STATE',
                    state: this.lobbyState,
                    yourFaction: slot.faction
                });
            });

            conn.on('data', (data) => {
                if (data.type === 'COMMAND') {
                    this.handleClientCommand(data.cmd, slot.faction);
                }
            });

            conn.on('close', () => {
                this.clientConnections = this.clientConnections.filter(c => c !== conn);
                const s = this.clientFactions.get(conn.peer);
                if (s) {
                    this.availableSlots.push(s);
                    this.availableSlots.sort((a, b) => a.id - b.id);
                    this.clientFactions.delete(conn.peer);
                    this.lobbyState[s.id].type = 'empty';
                    this.broadcastLobbyState();
                }
            });
        });
    }

    togglePC(slotId) {
        if (!this.isHost) return;
        if (this.lobbyState[slotId].type === 'empty') {
            this.lobbyState[slotId].type = 'pc';
        } else if (this.lobbyState[slotId].type === 'pc') {
            this.lobbyState[slotId].type = 'empty';
        }
        this.broadcastLobbyState();
    }

    broadcastLobbyState() {
        const payload = { type: 'LOBBY_STATE', state: this.lobbyState };
        for (let conn of this.clientConnections) {
            conn.send(payload);
        }
        if (this.game.updateLobbyUI) {
            this.game.updateLobbyUI(this.lobbyState);
        }
        this.callPeers();
    }

    startGameplay(difficulty = 'normal', mapType = 'random') {
        if (!this.isHost) return;
        
        // Disable AI for the enemy faction if it's assigned to a player
        if (this.lobbyState[2].type === 'player') {
            this.game.enemyIsPlayer = true;
        } else {
            this.game.enemyIsPlayer = false; // PC or empty handles AI normally (though empty might just do nothing)
        }

        const payload = {
            type: 'START_GAME',
            seedX: this.game.world.seedX,
            seedZ: this.game.world.seedZ,
            mapSize: this.game.world.mapSize,
            lobbyState: this.lobbyState,
            difficulty: difficulty,
            mapType: mapType
        };
        for (let conn of this.clientConnections) {
            const slot = this.clientFactions.get(conn.peer);
            conn.send({ ...payload, yourFaction: slot ? slot.faction : 'enemy' });
        }
    }

    initClient(hostId, onInit, onError) {
        this.isClient = true;
        
        const peerConfig = {
            debug: 2,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        };
        this.peer = new Peer(peerConfig);
        
        this.peer.on('disconnected', () => {
            console.log('Client disconnected from PeerServer. Reconnecting...');
            this.peer.reconnect();
        });
        this.peer.on('open', (id) => {
            this.peerId = id;
            this.setupVoiceListeners();
            this.hostConnection = this.peer.connect(hostId, { reliable: true });

            this.hostConnection.on('open', () => {
                console.log("Connected to host.");
            });

            this.hostConnection.on('data', (data) => {
                if (data.type === 'LOBBY_STATE') {
                    if (data.yourFaction) this.game.localFaction = data.yourFaction;
                    this.lobbyState = data.state;
                    if (this.game.updateLobbyUI) this.game.updateLobbyUI(this.lobbyState);
                    this.callPeers();
                    if (onInit) onInit(); // Call onInit just to signal successful connection
                } else if (data.type === 'START_GAME') {
                    if (this.game.startMultiplayerMatch) {
                        this.game.startMultiplayerMatch(data);
                    }
                } else if (data.type === 'STATE') {
                    this.applyStateUpdate(data);
                } else if (data.type === 'PROJECTILE') {
                    const target = this.game.entities.find(e => e.id === data.tid);
                    if (target) {
                        const startPos = new THREE.Vector3(data.sx, data.sy, data.sz);
                        this.game.spawnArrow(startPos, target, data.dmg, data.ptype, true);
                    }
                }
            });

            this.hostConnection.on('close', () => {
                if (onError) onError("Connection to host lost.");
            });
            this.hostConnection.on('error', (err) => {
                if (onError) onError(err);
            });
        });
        
        this.peer.on('error', (err) => {
            if (onError) onError(err.message);
        });
    }

    broadcastState() {
        if (!this.isHost || this.clientConnections.length === 0) return;
        
        const now = performance.now();
        if (now - this.lastUpdate < this.updateRate) return;
        this.lastUpdate = now;

        // Serialize units and buildings
        const state = this.game.entities
            .filter(e => e.faction && !e.isLoaded) // only sync units/buildings (not trees/gold)
            .map(e => ({
                id: e.id,
                t: e.type,
                f: e.faction,
                x: Math.round(e.position.x * 100) / 100, // compress floats
                z: Math.round(e.position.z * 100) / 100,
                h: e.health,
                s: e.state,
                c: e.isCompleted ? 1 : 0,
                p: e.buildProgress ? Math.round(e.buildProgress) : 0,
                r: e.mesh ? Math.round(e.mesh.rotation.y * 100) / 100 : 0
            }));

        const payload = { type: 'STATE', state, resources: this.game.factionResources };
        for (let conn of this.clientConnections) {
            conn.send(payload);
        }
    }

    broadcastProjectile(startPos, targetId, damage, type) {
        if (!this.isHost || this.clientConnections.length === 0) return;
        const payload = {
            type: 'PROJECTILE',
            sx: startPos.x, sy: startPos.y, sz: startPos.z,
            tid: targetId,
            dmg: damage,
            ptype: type
        };
        for (let conn of this.clientConnections) {
            conn.send(payload);
        }
    }

    applyStateUpdate(data) {
        if (!this.game.gameStarted || !this.game.world) return;

        const state = data.state;
        if (data.resources && data.resources[this.game.localFaction]) {
            this.game.playerResources = data.resources[this.game.localFaction];
            if (this.game.updateTopBar) this.game.updateTopBar();
        }

        // Client receives state from host
        const stateIds = new Set(state.map(s => s.id));
        
        // Build map for O(1) lookups instead of O(N^2) find() iterations
        const entityMap = new Map();
        for (let e of this.game.entities) {
            entityMap.set(e.id, e);
        }
        
        const BUILDINGS = new Set(['towncenter', 'house', 'barracks', 'farm', 'lumbercamp', 'miningcamp', 'tower', 'fishmarket', 'stable', 'market', 'blacksmith', 'castle', 'siege_workshop', 'siegeworkshop', 'monastery', 'university', 'factory', 'airport', 'fortress', 'treasury', 'temple', 'titanforge', 'wonder', 'roboticlab', 'woodwall', 'stonewall']);

        for (let s of state) {
            let entity = entityMap.get(s.id);
            
            // 1. Spawn missing entities
            if (!entity) {
                if (BUILDINGS.has(s.t)) {
                    entity = this.game.spawnBuilding(s.f, s.t, s.x, s.z, s.id);
                    
                    // Center camera on my first Town Center instantly
                    if (s.t === 'towncenter' && s.f === this.game.localFaction && !this.game.initialCameraCentered) {
                        this.game.initialCameraCentered = true;
                        this.game.cameraTarget.copy(entity.position);
                        this.game.camera.position.set(entity.position.x, 35, entity.position.z + 40);
                    }
                } else {
                    entity = this.game.spawnUnit(s.f, s.t, s.x, s.z, s.id);
                }
                if (entity) entityMap.set(entity.id, entity);
            }
            
            // 2. Update existing entities
            if (entity) {
                const dx = s.x - entity.position.x;
                const dz = s.z - entity.position.z;
                if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
                    entity.velocity = { x: dx, z: dz };
                } else {
                    entity.velocity = { x: 0, z: 0 };
                }

                entity.networkTargetPos = { x: s.x, z: s.z };
                entity.networkTargetRot = s.r;
                entity.health = s.h;
                entity.state = s.s;
                
                if (s.c === 1 && entity.isBuilding && !entity.isCompleted) {
                    entity.completeConstruction();
                }
                
                if (entity.isBuilding && !entity.isCompleted) {
                    entity.buildProgress = s.p;
                }
            }
        }
        
        // 3. Remove deleted entities (died on host)
        for (let i = this.game.entities.length - 1; i >= 0; i--) {
            const e = this.game.entities[i];
            if (e.faction && !stateIds.has(e.id)) {
                if (e.mesh && e.mesh.parent) e.mesh.parent.remove(e.mesh);
                this.game.entities.splice(i, 1);
            }
        }
    }

    sendCommand(cmd) {
        // cmd should look like: { type: 'MOVE', faction: 'player2', unitIds: [1,2], target: {x, z} }
        if (this.isHost || (!this.isHost && !this.isClient)) {
            this.game.processCommand(cmd);
        } else if (this.isClient && this.hostConnection) {
            this.hostConnection.send({ type: 'COMMAND', cmd });
        }
    }

    handleClientCommand(cmd, expectedFaction) {
        if (cmd.faction !== expectedFaction) {
            console.warn(`Anti-cheat: Faction ${expectedFaction} tried to issue command for ${cmd.faction}`);
            return;
        }
        this.game.processCommand(cmd);
    }

    // --- Voice Chat Methods ---

    setupVoiceListeners() {
        this.activeCalls = {};
        this.localStream = null;
        this.isMicMuted = true; // Mic is off by default
        
        this.peer.on('call', (call) => {
            // Answer the call with our local stream (or undefined if mic is off)
            call.answer(this.localStream || undefined);
            
            call.on('stream', (remoteStream) => {
                this.playRemoteStream(call.peer, remoteStream);
            });
            
            this.activeCalls[call.peer] = call;
        });
    }

    toggleMic() {
        if (!this.localStream) {
            // First time clicking mic
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                    this.localStream = stream;
                    this.isMicMuted = false;
                    this.updateMicUI();
                    this.callPeers(); // Call everyone now that we have a mic
                }).catch(err => {
                    console.error("Mic access denied:", err);
                    alert("Microphone access was denied or not found.");
                });
            } else {
                alert("Microphone access is not supported on this browser/context.");
            }
        } else {
            // Toggle existing tracks
            this.isMicMuted = !this.isMicMuted;
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = !this.isMicMuted;
            });
            this.updateMicUI();
        }
    }
    
    updateMicUI() {
        const btn = document.getElementById('btn-toggle-mic');
        if (btn) {
            if (this.isMicMuted) {
                btn.textContent = '🔇';
                btn.style.background = 'rgba(239, 68, 68, 0.8)';
            } else {
                btn.textContent = '🎤';
                btn.style.background = 'rgba(16, 185, 129, 0.8)';
            }
        }
    }

    callPeers() {
        if (!this.localStream) return; // Only call out if we have a stream to send
        
        for (let key in this.lobbyState) {
            const slot = this.lobbyState[key];
            if ((slot.type === 'player' || slot.type === 'host') && slot.peerId && slot.peerId !== this.peerId) {
                // To avoid overlapping duplicate calls, we only call if we haven't already initiated a call to them 
                // in this session that has a stream
                if (!this.activeCalls[slot.peerId + '_out']) {
                    const call = this.peer.call(slot.peerId, this.localStream);
                    if (call) {
                        call.on('stream', (remoteStream) => {
                            this.playRemoteStream(slot.peerId, remoteStream);
                        });
                        this.activeCalls[slot.peerId + '_out'] = call;
                    }
                }
            }
        }
    }

    playRemoteStream(peerId, remoteStream) {
        let container = document.getElementById('voice-streams');
        if (!container) return;
        
        // Ensure we don't add duplicate audio tags for the same peer
        let audioEl = document.getElementById('audio-' + peerId);
        if (!audioEl) {
            audioEl = document.createElement('audio');
            audioEl.id = 'audio-' + peerId;
            audioEl.autoplay = true;
            container.appendChild(audioEl);
        }
        audioEl.srcObject = remoteStream;
    }
}
