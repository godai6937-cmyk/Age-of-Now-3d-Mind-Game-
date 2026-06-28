// Main Game Controller Module
import { meshBuilders, Unit, Villager, Soldier, Archer, Knight, Spearman, Crossbowman, SiegeRam, Monk, Paladin, Cannon, EliteArcher, Titan, WarElephant, Champion, FighterRobot, Helicopter, FighterPlane, FishBoat, WarShip, TransportBoat, Building, Tower, Projectile, Animal } from './entities.js?v=62';
import { WorldMap, NaturalResource } from './world.js?v=62';
import { InputController } from './input.js?v=62';
import { EnemyAI } from './ai.js?v=14';
import { audio } from './audio.js?v=33';
import { VFXSystem } from './vfx.js?v=14';
import { NetworkController } from './network.js?v=2';

class GameController {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.builders = meshBuilders;
        
        // Game states
        this.entities = [];
        this.selectedEntities = [];
        this.projectiles = [];
        this.playerResources = { food: 200, wood: 200, gold: 100, stone: 0 };

        // ===== AGE PROGRESSION SYSTEM =====
        this.playerAge = 1;
        this.enemyAge = 1;
        this.AGE_NAMES = ['', 'Dawn Age', 'Feudal Age', 'Castle Age', 'Imperial Age', 'Divine Age', 'Sci-Fi Age'];
        this.AGE_ICONS = ['', '🌅', '⚔️', '🏰', '👑', '✨', '🚀'];
        this.AGE_DATA = {
            1: {
                buildings: [
                    { id: 'house', label: 'House', icon: '🏠', desc: 'Adds +5 pop limit.', cost: '🪓 50', res: { food: 0, wood: 50, gold: 0, stone: 0 } },
                    { id: 'farm', label: 'Farm', icon: '🌾', desc: 'Infinite food source.', cost: '🪓 60', res: { food: 0, wood: 60, gold: 0, stone: 0 } },
                    { id: 'barracks', label: 'Barracks', icon: '⛺', desc: 'Trains soldiers & archers.', cost: '🪓 150', res: { food: 0, wood: 150, gold: 0, stone: 0 } },
                    { id: 'tower', label: 'Watchtower', icon: '🗼', desc: 'Fires arrows at enemies.', cost: '🪓 150 🪨 100', res: { food: 0, wood: 150, gold: 0, stone: 100 } },
                    { id: 'fishmarket', label: 'Fish Market', icon: '🐟', desc: 'Trains boats (must be placed on coast).', cost: '🪓 120', res: { food: 0, wood: 120, gold: 0, stone: 0 } },
                    { id: 'woodwall', label: 'Wood Wall', icon: '🪵', desc: 'Drag to build a cheap defensive wall.', cost: '🪓 1', res: { food: 0, wood: 1, gold: 0, stone: 0 } },
                    { id: 'stonewall', label: 'Stone Wall', icon: '🧱', desc: 'Drag to build a strong defensive wall.', cost: '🪨 1', res: { food: 0, wood: 0, gold: 0, stone: 1 } }
                ],
                advanceRequires: ['house', 'farm', 'barracks', 'tower'],
                advanceCost: { food: 200, wood: 0, gold: 200, stone: 0 }
            },
            2: {
                buildings: [
                    { id: 'stable', label: 'Stable', icon: '🐴', desc: 'Trains cavalry units.', cost: '🪓 200 🪙 50', res: { food: 0, wood: 200, gold: 50, stone: 0 } },
                    { id: 'market', label: 'Market', icon: '🏪', desc: 'Generates passive gold.', cost: '🪓 180 🪙 30', res: { food: 0, wood: 180, gold: 30, stone: 0 } },
                    { id: 'blacksmith', label: 'Blacksmith', icon: '⚒️', desc: 'Upgrades unit armor.', cost: '🪓 150 🪨 80', res: { food: 0, wood: 150, gold: 0, stone: 80 } }
                ],
                advanceRequires: ['stable', 'market', 'blacksmith'],
                advanceCost: { food: 400, wood: 0, gold: 400, stone: 0 }
            },
            3: {
                buildings: [
                    { id: 'castle', label: 'Castle', icon: '🏰', desc: 'Trains elite units, strong defense.', cost: '🪨 250 🪙 200', res: { food: 0, wood: 0, gold: 200, stone: 250 } },
                    { id: 'siegeworkshop', label: 'Siege Workshop', icon: '🔧', desc: 'Builds siege weapons.', cost: '🪓 250 🪙 100', res: { food: 0, wood: 250, gold: 100, stone: 0 } },
                    { id: 'monastery', label: 'Monastery', icon: '⛪', desc: 'Trains monks (healers).', cost: '🪓 200 🪙 150', res: { food: 0, wood: 200, gold: 150, stone: 0 } }
                ],
                advanceRequires: ['castle', 'siegeworkshop', 'monastery'],
                advanceCost: { food: 600, wood: 0, gold: 600, stone: 200 }
            },
            4: {
                buildings: [
                    { id: 'university', label: 'University', icon: '🎓', desc: 'Research & upgrades.', cost: '🪓 300 🪙 200', res: { food: 0, wood: 300, gold: 200, stone: 0 } },
                    { id: 'fortress', label: 'Fortress', icon: '🏯', desc: 'Trains elite cavalry & cannons.', cost: '🪨 300 🪙 400', res: { food: 0, wood: 0, gold: 400, stone: 300 } },
                    { id: 'treasury', label: 'Treasury', icon: '💰', desc: 'Generates passive gold.', cost: '🪙 500 🪨 200', res: { food: 0, wood: 0, gold: 500, stone: 200 } }
                ],
                advanceRequires: ['university', 'fortress', 'treasury'],
                advanceCost: { food: 1000, wood: 0, gold: 1000, stone: 500 }
            },
            5: {
                buildings: [
                    { id: 'temple', label: 'Temple of Gods', icon: '🛕', desc: 'Trains champions.', cost: '🪙 600 🪨 400', res: { food: 0, wood: 0, gold: 600, stone: 400 } },
                    { id: 'titanforge', label: 'Titan Forge', icon: '🔥', desc: 'Forges titans & war elephants.', cost: '🪙 800 🪨 500', res: { food: 0, wood: 0, gold: 800, stone: 500 } },
                    { id: 'wonder', label: 'Wonder', icon: '🏛️', desc: 'Legendary monument.', cost: '🌾 1000 🪓 1000 🪙 1000 🪨 1000', res: { food: 1000, wood: 1000, gold: 1000, stone: 1000 } }
                ],
                advanceRequires: ['temple', 'titanforge', 'wonder'],
                advanceCost: { food: 1500, wood: 1000, gold: 1500, stone: 1000 }
            },
            6: {
                buildings: [
                    { id: 'roboticlab', label: 'Robotic Lab', icon: '🏭', desc: 'Produces Fighter Robots.', cost: '🪙 1200 🪨 800', res: { food: 0, wood: 0, gold: 1200, stone: 800 } },
                    { id: 'airport', label: 'Airport Strip', icon: '🛫', desc: 'Produces Planes & Helicopters.', cost: '🪙 1500 🪨 1000', res: { food: 0, wood: 0, gold: 1500, stone: 1000 } }
                ],
                advanceRequires: [],
                advanceCost: null
            }
        };
        this.enemyResources = { food: 200, wood: 200, gold: 100, stone: 0 };
        
        // Factions pop limits
        this.playerPop = 0;
        this.playerPopCap = 10;
        
        // Camera orbital settings
        this.cameraTarget = new THREE.Vector3(-53, 53, 53); // Focus near player base on sphere radius 75
        this.cameraRadius = 22;
        this.cameraAngleY = Math.PI / 4; // yaw rotation around target
        this.cameraAngleX = 0.8; // pitch rotation looking down (approx 45 deg)
        
        // Systems
        this.world = null;
        this.input = null;
        this.ai = null;
        this.vfx = null;
        this.cameraShakeAmount = 0;
        
        // Keyboard movement
        this.keys = { w: false, a: false, s: false, d: false };
        // Edge‑drag configuration
        this.EDGE_DRAG_WIDTH = 30; // pixels from screen edge
        this.CAMERA_ROT_SPEED = 0.5; // radians per second
        // Store latest cursor position for edge detection
        this.mousePos = { x: 0, y: 0 };
        this.gamePaused = false;
        this.matchTime = 0;
        this.entityIdCounter = 1;
        
        // Statistics for summary
        this.stats = {
            unitsTrained: 0,
            buildingsBuilt: 0,
            enemiesKilled: 0
        };

        this.lastCombatTime = 0;
        this.inCombat = false;

        // DOM elements cache
        this.dom = {};
        
        // Hovered building for name label
        this.hoveredBuilding = null;
    }

    init() {
        // Cache DOM elements
        this.dom.startScreen = document.getElementById('start-screen');
        this.dom.gameOverScreen = document.getElementById('game-over-screen');
        this.dom.gameOverTitle = document.getElementById('game-over-title');
        this.dom.gameOverMsg = document.getElementById('game-over-msg');
        this.dom.hud = document.getElementById('hud');
        this.dom.timer = document.getElementById('game-timer');
        this.dom.audioToggle = document.getElementById('audio-settings-toggle');
        
        // Setup WebGL Scene
        try {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xc4dcf3);
            this.scene.fog = new THREE.FogExp2(0xc9dded, 0.0068);

            // Camera
            this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.updateCameraPosition();

            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;

            // Renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: !isMobile });
            this.renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.35) : Math.min(window.devicePixelRatio, 2));
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = !isMobile;
            this.renderer.shadowMap.type = isMobile ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.05;
            document.getElementById('game-container').appendChild(this.renderer.domElement);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xf4f8ff, 0.48);
            this.scene.add(ambientLight);

            const sunLight = new THREE.DirectionalLight(0xfff5de, 1.26);
            sunLight.position.set(-34, 52, -18);
            sunLight.castShadow = !isMobile;
            
            // Configure high quality shadow camera
            sunLight.shadow.mapSize.width = isMobile ? 512 : 2048;
            sunLight.shadow.mapSize.height = isMobile ? 512 : 2048;
            sunLight.shadow.camera.near = 0.5;
            sunLight.shadow.camera.far = 150;
            const shadowBound = 45;
            sunLight.shadow.camera.left = -shadowBound;
            sunLight.shadow.camera.right = shadowBound;
            sunLight.shadow.camera.top = shadowBound;
            sunLight.shadow.camera.bottom = -shadowBound;
            sunLight.shadow.bias = -0.0005;
            sunLight.shadow.normalBias = 0.02;
            this.scene.add(sunLight);
        } catch (e) {
            console.error("WebGL Setup Failed:", e);
            const errDiv = document.getElementById('error-console');
            const errMsg = document.getElementById('error-msg');
            if (errDiv && errMsg) {
                errDiv.style.display = 'block';
                errMsg.textContent += "WebGL Error: " + e.message + "\n";
            }
            throw e; // rethrow to stop execution
        }

        // Initialize modules
        this.world = null;
        this.vfx = new VFXSystem(this.scene);
        this.input = new InputController(this);
        this.aiPlayers = [];
        this.network = new NetworkController(this);
        this.localFaction = 'player'; // default

        // Handle Resizing
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Setup Event Listeners for UI
        this.setupUIEvents();

        // Start request animation frame loop
        this.lastTime = performance.now();
        this.mobileHUDTimer = 4.0;
        this.animate();
    }

    // Add utility to convert a 3D spherical position to equirectangular UV coordinates (0‑1 range)
    sphericalToUV(pos) {
        // Ensure the vector is normalized (ignoring radius/elevation)
        const norm = pos.clone().normalize();
        const u = (Math.atan2(norm.x, norm.z) + Math.PI) / (2 * Math.PI); // longitude
        const v = (Math.asin(norm.y) + Math.PI / 2) / Math.PI; // latitude
        return { u, v };
    }

    startGame(mode, joinId) {
        if (mode === 'host') {
            document.getElementById('mode-selection').style.display = 'none';
            document.getElementById('lobby-container').classList.remove('hidden');
            return;
        } else if (mode === 'demo') {
            this.network = null;
            this.localFaction = 'player';
            this.world = new WorldMap(this.scene, this, undefined, undefined, 'random');
            this.startMultiplayerMatch({ 
                seedX: this.world.seedX, 
                seedZ: this.world.seedZ, 
                lobbyState: null,
                mapType: 'random'
            });
            setTimeout(() => this.runAllAgesDemo(), 500); // Give it a short moment to spawn TC
        } else if (mode === 'join') {
            this.network = new NetworkController(this);
            document.getElementById('connection-status').textContent = "Connecting to Host...";
            document.getElementById('connection-status').classList.remove('hidden');
            
            const onInit = () => {
                document.getElementById('connection-status').classList.add('hidden');
                
                // Show Client UI
                document.getElementById('lobby-invite-link').value = window.location.href;
                document.getElementById('btn-lobby-start').style.display = 'none';
                
                const waitMsg = document.getElementById('lobby-waiting-msg');
                waitMsg.textContent = "Connecting to host...";
                waitMsg.classList.remove('hidden');
                
                Array.from(document.querySelectorAll('.host-only')).forEach(el => el.style.display = 'none');
                
                // Hide the join input section
                const joinInputEl = document.getElementById('input-join-code-menu');
                const joinInputDiv = joinInputEl ? joinInputEl.parentElement : null;
                if (joinInputDiv) joinInputDiv.classList.add('hidden');
            };

            const onError = (errorMsg) => {
                let displayMsg = errorMsg;
                const errorStr = String(errorMsg);
                if (errorStr && errorStr.includes("Could not connect to peer")) {
                    displayMsg = "Waiting for host to return... (Host might be in another app)";
                    setTimeout(() => {
                        if (!document.getElementById('connection-status').classList.contains('hidden')) {
                            this.network.initClient(joinId, onInit, onError, onHostConnected);
                        }
                    }, 3000);
                } else if (errorMsg && errorMsg.type) {
                    displayMsg = errorMsg.message || "Connection failed.";
                }
                document.getElementById('connection-status').textContent = displayMsg;
                document.getElementById('connection-status').style.color = "#ef4444";
            };
            
            const onHostConnected = () => {
                const waitMsg = document.getElementById('lobby-waiting-msg');
                waitMsg.textContent = "You joined succesfully game let host starts the game ok";
            };

            this.network.initClient(joinId, onInit, onError, onHostConnected);
        }
    }

    updateLobbyUI(state) {
        for (let i = 1; i <= 4; i++) {
            const statusEl = document.getElementById(`slot-${i}-status`);
            const btnEl = document.querySelector(`.toggle-pc-btn[data-slot="${i}"]`);
            if (!statusEl) continue;

            const s = state[i];
            if (s.type === 'host') {
                statusEl.textContent = 'Host 🟢';
                statusEl.style.color = '#10b981';
                if (btnEl) btnEl.style.display = 'none';
            } else if (s.type === 'player') {
                statusEl.textContent = 'Connected 🟢';
                statusEl.style.color = '#10b981';
                if (btnEl) btnEl.style.display = 'none';
            } else if (s.type === 'pc') {
                statusEl.textContent = 'PC Player 🤖';
                statusEl.style.color = '#3b82f6';
                if (btnEl && this.network && this.network.isHost) btnEl.style.display = 'inline-block';
            } else {
                statusEl.textContent = 'Waiting...';
                statusEl.style.color = '#9ca3af';
                if (btnEl && this.network && this.network.isHost) btnEl.style.display = 'inline-block';
            }
            
            if (btnEl) {
                btnEl.textContent = s.type === 'pc' ? 'Remove PC' : 'Add PC';
            }
        }
    }

    startMultiplayerMatch(data) {
        if (data && data.yourFaction) {
            this.localFaction = data.yourFaction;
        }
        
        if (this.dom.startScreen) this.dom.startScreen.classList.add('hidden');
        this.dom.hud.classList.remove('hidden');
        
        // Update HUD with player name and color
        const nameInput = document.getElementById('player-name-input');
        if (nameInput) {
            let defaultName = 'Player 1';
            if (this.localFaction === 'enemy') defaultName = 'Player 2';
            else if (this.localFaction === 'player3') defaultName = 'Player 3';
            else if (this.localFaction === 'player4') defaultName = 'Player 4';
            
            this.playerName = nameInput.value.trim() || defaultName;
            const hudName = document.getElementById('hud-player-name');
            if (hudName) hudName.textContent = this.playerName;
            
            const flag = document.getElementById('hud-color-flag');
            if (flag) {
                if (this.localFaction === 'player') flag.style.backgroundColor = '#2563eb';
                else if (this.localFaction === 'enemy') flag.style.backgroundColor = '#dc2626';
                else if (this.localFaction === 'player3') flag.style.backgroundColor = '#22c55e';
                else if (this.localFaction === 'player4') flag.style.backgroundColor = '#eab308';
            }
        }
        
        // Generate world
        if (!this.world || (this.network && this.network.isClient)) {
            this.world = new WorldMap(this.scene, this, data.seedX, data.seedZ, data.mapType);
        }
        this.world.generate();

        // Generate random town center locations
        this.basePositions = {};
        const factions = ['player', 'enemy', 'player3', 'player4'];
        const minSpacing = 80; // Minimum distance between any two town centers
        const mapLimit = (this.world.planeSize / 2) - 30; // Keep them away from map edges
        
        let attempts = 0;
        let placed = 0;
        
        while (placed < 4 && attempts < 1000) {
            attempts++;
            // Generate random coordinate using world's PRNG for determinism
            const x = (this.world.prng.next() * 2 - 1) * mapLimit;
            const z = (this.world.prng.next() * 2 - 1) * mapLimit;
            
            // Must be on land
            if (this.world.getElevationAtCoords(x, z) < 0.25) continue;
            
            // Check spacing with already placed factions
            let tooClose = false;
            for (let i = 0; i < placed; i++) {
                const otherPos = this.basePositions[factions[i]];
                const dist = Math.hypot(x - otherPos.x, z - otherPos.z);
                if (dist < minSpacing) {
                    tooClose = true;
                    break;
                }
            }
            
            if (!tooClose) {
                this.basePositions[factions[placed]] = { x: Math.floor(x), z: Math.floor(z) };
                placed++;
            }
        }
        
        // Fallback if we couldn't place them due to water/spacing issues
        if (placed < 4) {
            this.basePositions = {
                'player': { x: -40, z: 40 },
                'enemy': { x: 40, z: -40 },
                'player3': { x: -40, z: -40 },
                'player4': { x: 40, z: 40 }
            };
        }

        // Host handles initial spawns locally in setupStartingBases
        // Clients just rely on network state updates, but we need to create the bases for all configured factions
        this.setupStartingBases(data.lobbyState);
        this.setupAI(data.lobbyState, data.difficulty || 'normal');
        
        this.gameStarted = true;
        
        // Show mic toggle button in multiplayer
        const micBtn = document.getElementById('btn-toggle-mic');
        if (micBtn) {
            micBtn.classList.remove('hidden');
            micBtn.addEventListener('click', () => {
                if (this.network) {
                    this.network.toggleMic();
                    audio.playClick();
                }
            });
        }
    }

    setupAI(lobbyState = null, difficulty = 'normal') {
        this.aiPlayers = [];
        if (this.network && this.network.isClient) return; // Clients don't run AI

        if (!lobbyState) {
            lobbyState = {
                1: { type: 'host', faction: 'player' },
                2: { type: 'pc', faction: 'enemy' },
                3: { type: 'empty', faction: 'player3' },
                4: { type: 'empty', faction: 'player4' }
            };
        }

        const basePositions = this.basePositions || {
            'enemy': { x: 40, z: -40 },
            'player3': { x: -40, z: -40 },
            'player4': { x: 40, z: 40 }
        };

        for (let i = 2; i <= 4; i++) {
            const slot = lobbyState[i];
            if (slot.type === 'pc') {
                this.aiPlayers.push(new EnemyAI(this, slot.faction, basePositions[slot.faction], difficulty));
            }
        }
    }

    setupStartingBases(lobbyState = null) {
        const eOffsets = [[-4, 4], [4, 4], [-4, -4], [4, -4]];

        if (!lobbyState) {
            lobbyState = {
                1: { type: 'host', faction: 'player' },
                2: { type: 'pc', faction: 'enemy' },
                3: { type: 'empty', faction: 'player3' },
                4: { type: 'empty', faction: 'player4' }
            };
        }

        if (this.network && this.network.isClient) return;

        const pos = this.basePositions || {
            'player': { x: -40, z: 40 },
            'enemy': { x: 40, z: -40 },
            'player3': { x: -40, z: -40 },
            'player4': { x: 40, z: 40 }
        };

        // --- PLAYER BASE ---
        if (lobbyState[1].type !== 'empty') {
            const pt = pos['player'];
            const pTC = new Building(this.getNewEntityId(), 'player', 'towncenter', 800, pt.x, pt.z, {});
            pTC.mesh = this.builders.createTownCenter('player');
            pTC.completeConstruction();
            pTC.alignMesh();
            this.scene.add(pTC.mesh);
            this.entities.push(pTC);
            if (this.localFaction === 'player') {
                this.cameraTarget.copy(pTC.position);
                this.camera.position.set(pTC.position.x, 35, pTC.position.z + 40);
            }

            eOffsets.forEach(([dx, dz]) => this.spawnUnit('player', 'villager', pt.x + dx, pt.z + dz));
        }

        // --- ENEMY BASE ---
        if (lobbyState[2].type !== 'empty') {
            const et = pos['enemy'];
            const eTC = new Building(this.getNewEntityId(), 'enemy', 'towncenter', 800, et.x, et.z, {});
            eTC.mesh = this.builders.createTownCenter('enemy');
            eTC.completeConstruction();
            eTC.alignMesh();
            this.scene.add(eTC.mesh);
            this.entities.push(eTC);
            if (this.localFaction === 'enemy') {
                this.cameraTarget.copy(eTC.position);
                this.camera.position.set(eTC.position.x, 35, eTC.position.z + 40);
            }

            const eBarr = new Building(this.getNewEntityId(), 'enemy', 'barracks', 400, et.x + 4, et.z - 4, {});
            eBarr.mesh = this.builders.createBarracks('enemy');
            eBarr.completeConstruction();
            eBarr.alignMesh();
            this.scene.add(eBarr.mesh);
            this.entities.push(eBarr);

            eOffsets.forEach(([dx, dz]) => this.spawnUnit('enemy', 'villager', et.x + dx, et.z + dz));
            this.spawnUnit('enemy', 'soldier', et.x + 5, et.z - 5);
            this.spawnUnit('enemy', 'soldier', et.x - 5, et.z - 5);
        }

        // --- PLAYER 3 BASE ---
        if (lobbyState[3].type !== 'empty') {
            const pt = pos['player3'];
            const p3TC = new Building(this.getNewEntityId(), 'player3', 'towncenter', 800, pt.x, pt.z, {});
            p3TC.mesh = this.builders.createTownCenter('player3');
            p3TC.completeConstruction();
            p3TC.alignMesh();
            this.scene.add(p3TC.mesh);
            this.entities.push(p3TC);
            if (this.localFaction === 'player3') {
                this.cameraTarget.copy(p3TC.position);
                this.camera.position.set(p3TC.position.x, 35, p3TC.position.z + 40);
            }
            
            eOffsets.forEach(([dx, dz]) => this.spawnUnit('player3', 'villager', pt.x + dx, pt.z + dz));
        }

        // --- PLAYER 4 BASE ---
        if (lobbyState[4].type !== 'empty') {
            const pt = pos['player4'];
            const p4TC = new Building(this.getNewEntityId(), 'player4', 'towncenter', 800, pt.x, pt.z, {});
            p4TC.mesh = this.builders.createTownCenter('player4');
            p4TC.completeConstruction();
            p4TC.alignMesh();
            this.scene.add(p4TC.mesh);
            this.entities.push(p4TC);
            if (this.localFaction === 'player4') {
                this.cameraTarget.copy(p4TC.position);
                this.camera.position.set(p4TC.position.x, 35, p4TC.position.z + 40);
            }
            
            eOffsets.forEach(([dx, dz]) => this.spawnUnit('player4', 'villager', pt.x + dx, pt.z + dz));
        }
    }

    setupUIEvents() {
        const startAudioAndFullscreen = async () => {
            try { audio.init(); audio.playClick(); } catch (e) {}
            
            const attemptLock = async () => {
                try {
                    if (screen.orientation && screen.orientation.lock) {
                        await screen.orientation.lock('landscape');
                    } else if (screen.lockOrientation) {
                        screen.lockOrientation('landscape');
                    } else if (screen.mozLockOrientation) {
                        screen.mozLockOrientation('landscape');
                    } else if (screen.msLockOrientation) {
                        screen.msLockOrientation('landscape');
                    }
                } catch(e) { console.warn("Orientation lock failed:", e); }
            };

            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    await document.documentElement.webkitRequestFullscreen();
                }
                await attemptLock();
            } catch (err) {
                console.warn(err);
            }
        };

        document.getElementById('btn-mode-host').addEventListener('click', () => {
            startAudioAndFullscreen();
            this.startGame('host');
        });

        document.getElementById('btn-mode-join').addEventListener('click', () => {
            let code = document.getElementById('input-join-code-menu').value.trim();
            if (!code) {
                alert("Please enter a valid invite code or link.");
                return;
            }
            // Extract code if it's a full URL
            try {
                if (code.startsWith('http')) {
                    const url = new URL(code);
                    const joinParam = url.searchParams.get('join');
                    if (joinParam) {
                        code = joinParam;
                    }
                }
            } catch(e) {}
            
            startAudioAndFullscreen();
            this.startGame('join', code);
        });

        const btnLoad = document.getElementById('btn-mode-load');
        if (btnLoad) {
            btnLoad.addEventListener('click', () => {
                document.getElementById('file-load-game').click();
            });
        }

        const fileLoad = document.getElementById('file-load-game');
        if (fileLoad) {
            fileLoad.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        startAudioAndFullscreen();
                        this.loadGame(data);
                    } catch (err) {
                        alert("Failed to load save file: " + err.message);
                    }
                };
                reader.readAsText(file);
            });
        }

        const copyTextToClipboard = (text) => {
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(text);
            } else {
                return new Promise((resolve, reject) => {
                    try {
                        const textArea = document.createElement("textarea");
                        textArea.value = text;
                        textArea.style.position = "fixed"; // avoid scrolling
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });
            }
        };

        document.getElementById('btn-copy-invite').addEventListener('click', () => {
            const code = document.getElementById('lobby-invite-link').value;
            copyTextToClipboard(code).then(() => {
                alert("Invite link copied to clipboard!");
            }).catch(err => alert("Failed to copy link"));
        });
        
        document.getElementById('btn-copy-link').addEventListener('click', () => {
            const link = document.getElementById('lobby-invite-link').value;
            copyTextToClipboard(link).then(() => {
                alert("Link copied!");
            }).catch(err => alert("Failed to copy link"));
        });
        
        document.getElementById('btn-share-link').addEventListener('click', () => {
            const link = document.getElementById('lobby-invite-link').value;
            if (navigator.share) {
                navigator.share({
                    title: 'Age of Now',
                    text: 'Join my multiplayer match!',
                    url: link
                }).catch(err => console.warn('Share failed:', err));
            } else {
                copyTextToClipboard(link).then(() => {
                    alert("Link copied to clipboard (Web Share not supported on this browser)");
                }).catch(err => alert("Failed to copy link"));
            }
        });

        const btnAllAgesDemo = document.getElementById('btn-all-ages-demo');
        if (btnAllAgesDemo) {
            btnAllAgesDemo.addEventListener('click', () => {
                startAudioAndFullscreen();
                this.startGame('demo');
            });
        }

        document.getElementById('btn-lobby-start').addEventListener('click', () => {
            audio.playClick();
            if (this.network && this.network.isHost) {
                // Default any empty slots to PC when host starts
                for (let i = 2; i <= 4; i++) {
                    if (this.network.lobbyState[i].type === 'empty') {
                        this.network.lobbyState[i].type = 'pc';
                    }
                }
                const mapType = document.getElementById('map-type-select') ? document.getElementById('map-type-select').value : 'random';
                
                // Initialize the world so seeds are generated before sending START_GAME payload
                if (!this.world) {
                    this.world = new WorldMap(this.scene, this, undefined, undefined, mapType);
                }
                const diffSelect = document.getElementById('difficulty-select');
                const difficulty = diffSelect ? diffSelect.value : 'normal';
                
                this.network.startGameplay(difficulty, mapType);
                this.startMultiplayerMatch({ seedX: this.world.seedX, seedZ: this.world.seedZ, lobbyState: this.network.lobbyState, difficulty: difficulty, mapType: mapType });
            }
        });

        const lobbyLoadBtn = document.getElementById('btn-lobby-load-save');
        const lobbyLoadInput = document.getElementById('file-lobby-load-save');
        if (lobbyLoadBtn && lobbyLoadInput) {
            lobbyLoadBtn.addEventListener('click', () => {
                audio.playClick();
                lobbyLoadInput.click();
            });
            lobbyLoadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (this.network && this.network.isHost) {
                            this.network.broadcastSavedGame(data);
                        }
                        startAudioAndFullscreen();
                        this.loadGame(data, true);
                    } catch (err) {
                        alert("Failed to load save file: " + err.message);
                    }
                };
                reader.readAsText(file);
            });
        }

        document.querySelectorAll('.toggle-pc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slot = e.target.getAttribute('data-slot');
                if (this.network && this.network.isHost) {
                    this.network.togglePC(parseInt(slot));
                }
            });
        });

        // Check for ?join= code on page load
        const urlParams = new URLSearchParams(window.location.search);
        const joinCode = urlParams.get('join') || urlParams.get('room');
        if (joinCode) {
            const joinInputEl = document.getElementById('input-join-code-menu');
            if (joinInputEl) joinInputEl.value = joinCode;
            const joinBtn = document.getElementById('btn-mode-join');
            if (joinBtn) {
                joinBtn.textContent = 'JOIN SHARED ROOM';
                joinBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            }
            document.getElementById('lobby-host-controls').style.display = 'none';
            document.getElementById('btn-lobby-start').style.display = 'none';
            Array.from(document.querySelectorAll('.client-only')).forEach(el => el.classList.remove('hidden'));
            document.getElementById('lobby-waiting-msg').classList.add('hidden'); // don't show until connected
        } else {
            // Auto Host Mode on page load
            this.network = new NetworkController(this);
            document.getElementById('connection-status').textContent = "Starting Local Room...";
            document.getElementById('connection-status').classList.remove('hidden');
            this.network.initHost((id) => {
                document.getElementById('connection-status').classList.add('hidden');
                const link = window.location.origin + window.location.pathname + "?join=" + id;
                document.getElementById('lobby-invite-link').value = link;
                document.getElementById('btn-lobby-start').style.display = 'block';
                Array.from(document.querySelectorAll('.host-only')).forEach(el => el.style.display = 'inline-block');
            });
        }

        document.getElementById('btn-play-again').addEventListener('click', () => {
            window.location.reload();
        });

        this.dom.audioToggle.addEventListener('click', () => {
            const isMuted = audio.toggleMute();
            this.dom.audioToggle.textContent = isMuted ? '🔇' : '🔊';
            audio.playClick();
        });

        const saveBtn = document.getElementById('btn-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                audio.playClick();
                this.saveGame();
            });
        }

        document.getElementById('btn-pause').addEventListener('click', () => {
            this.gamePaused = !this.gamePaused;
            document.getElementById('btn-pause').textContent = this.gamePaused ? '▶️' : '⏸️';
            audio.playClick();
        });

        const btnLobbyMic = document.getElementById('btn-lobby-mic');
        if (btnLobbyMic) {
            btnLobbyMic.addEventListener('click', () => {
                if (this.network) {
                    this.network.toggleMic();
                }
            });
        }

        document.getElementById('btn-restart').addEventListener('click', () => {
            audio.playClick();
            window.location.reload();
        });

        document.getElementById('btn-recalibrate').addEventListener('click', () => {
            audio.playClick();
            if (this.input && typeof this.input.toggleSensors === 'function') {
                this.input.toggleSensors();
            }
        });

        const minimap = document.getElementById('minimap-canvas');
        if (minimap) {
            const handleMinimapInteraction = (e) => {
                if (!this.world) return;
                const rect = minimap.getBoundingClientRect();
                const size = rect.width;
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const half = this.world.mapSize / 2;
                const worldX = (x / size) * this.world.mapSize - half;
                const worldZ = ((y / size) * this.world.mapSize - half);
                const elevation = this.world.getElevationAtCoords(worldX, worldZ);
                
                const hasPlayerUnitsSelected = this.selectedEntities.some(ent => ent.isUnit && ent.faction === this.localFaction && !ent.dead);

                if (e.button === 2) {
                    // Right click: Move units
                    if (hasPlayerUnitsSelected && this.network) {
                        this.network.sendCommand({
                            type: 'MOVE',
                            faction: this.localFaction,
                            x: worldX,
                            z: worldZ,
                            unitIds: this.selectedEntities.filter(ent => ent.isUnit && ent.faction === this.localFaction).map(ent => ent.id)
                        });
                    }
                } else {
                    // Left click / Touch: Move camera
                    this.cameraTarget.set(worldX, elevation, worldZ);
                }
            };

            minimap.addEventListener('pointerdown', (e) => {
                handleMinimapInteraction(e);
                audio.playClick();
                // To allow dragging the camera on the minimap:
                const onPointerMove = (moveEvent) => {
                    if (e.button === 0 || e.pointerType === 'touch') {
                        handleMinimapInteraction(moveEvent);
                    }
                };
                const onPointerUp = () => {
                    document.removeEventListener('pointermove', onPointerMove);
                    document.removeEventListener('pointerup', onPointerUp);
                };
                document.addEventListener('pointermove', onPointerMove);
                document.addEventListener('pointerup', onPointerUp);
            });
            minimap.addEventListener('contextmenu', e => e.preventDefault());
        }
    }

    getNewEntityId() {
        return this.entityIdCounter++;
    }

    spawnUnit(faction, type, x, z, forceId = null) {
        let unit;
        const id = forceId !== null ? forceId : this.getNewEntityId();
        const UNIT_MAP = {
            'villager':     { Class: Villager,     mesh: 'createVillager' },
            'soldier':      { Class: Soldier,      mesh: 'createSoldier' },
            'archer':       { Class: Archer,       mesh: 'createArcher' },
            'knight':       { Class: Knight,       mesh: 'createKnight' },
            'spearman':     { Class: Spearman,     mesh: 'createSpearman' },
            'crossbowman':  { Class: Crossbowman,  mesh: 'createCrossbowman' },
            'siegeram':     { Class: SiegeRam,      mesh: 'createSiegeRam' },
            'monk':         { Class: Monk,         mesh: 'createMonk' },
            'paladin':      { Class: Paladin,      mesh: 'createPaladin' },
            'cannon':       { Class: Cannon,       mesh: 'createCannon' },
            'elitearcher':  { Class: EliteArcher,  mesh: 'createEliteArcher' },
            'titan':        { Class: Titan,        mesh: 'createTitan' },
            'warelephant':  { Class: WarElephant,  mesh: 'createWarElephant' },
            'champion':     { Class: Champion,     mesh: 'createChampion' },
            'fighterrobot': { Class: FighterRobot, mesh: 'createFighterRobot' },
            'helicopter':   { Class: Helicopter,   mesh: 'createHelicopter' },
            'fighterplane': { Class: FighterPlane, mesh: 'createFighterPlane' },
            'fishboat':     { Class: FishBoat,     mesh: 'createFishBoat' },
            'warship':      { Class: WarShip,      mesh: 'createWarShip' },
        };

        const entry = UNIT_MAP[type];
        if (entry) {
            unit = new entry.Class(id, faction, x, z);
            unit.mesh = this.builders[entry.mesh](faction);
        }

        if (unit) {
            unit.alignMesh();
            this.scene.add(unit.mesh);
            this.entities.push(unit);

            if (faction === this.localFaction) {
                this.stats.unitsTrained++;
            }
        }
        return unit;
    }

    spawnAnimal(type, x, z) {
        let animal;
        if (type === 'deer') {
            animal = new Animal(this.getNewEntityId(), type, 25, x, z, 3.5);
            animal.mesh = this.builders.createDeer();
        } else if (type === 'bear') {
            animal = new Animal(this.getNewEntityId(), type, 80, x, z, 2.5);
            animal.mesh = this.builders.createBear();
        }

        if (animal) {
            animal.alignMesh();
            this.scene.add(animal.mesh);
            this.entities.push(animal);
        }
        return animal;
    }

    spawnBuilding(faction, type, x, z, forceId = null) {
        const id = forceId !== null ? forceId : this.getNewEntityId();
        const HP_TABLE = {
            'towncenter': 800, 'barracks': 400, 'tower': 300, 'house': 180, 'farm': 150, 'fishmarket': 250,
            'stable': 350, 'market': 250, 'blacksmith': 300,
            'castle': 600, 'siegeworkshop': 300, 'monastery': 280,
            'university': 350, 'fortress': 700, 'treasury': 400,
            'temple': 500, 'titanforge': 550, 'wonder': 1500
        };
        const maxHealth = HP_TABLE[type] || 200;

        let b;
        if (type === 'tower') {
            b = new Tower(id, faction, x, z);
            b.mesh = this.builders.createTower(faction);
        } else {
            b = new Building(id, faction, type, maxHealth, x, z, {});
            const MESH_MAP = {
                'house': 'createHouse', 'barracks': 'createBarracks', 'farm': 'createFarm', 'fishmarket': 'createFishMarket',
                'towncenter': 'createTownCenter', 'woodwall': 'createWoodWall', 'stonewall': 'createStoneWall',
                'stable': 'createStable', 'market': 'createMarket', 'blacksmith': 'createBlacksmith',
                'castle': 'createCastle', 'siegeworkshop': 'createSiegeWorkshop', 'monastery': 'createMonastery',
                'university': 'createUniversity', 'fortress': 'createFortress', 'treasury': 'createTreasury',
                'temple': 'createTemple', 'titanforge': 'createTitanForge', 'wonder': 'createWonder'
            };
            const meshFn = MESH_MAP[type];
            if (meshFn && this.builders[meshFn]) {
                b.mesh = (type === 'farm') ? this.builders[meshFn]() : this.builders[meshFn](faction);
            }
            if (type === 'farm') b.radius = 1.0;
        }

        b.mesh.position.copy(b.position);
        b.buildProgress = 0;
        b.mesh.scale.set(1.0, 0.2, 1.0);
        this.scene.add(b.mesh);
        this.entities.push(b);
        if (faction === this.localFaction) this.stats.buildingsBuilt++;
        return b;
    }

    constructBuilding(type, x, z, rotation = 0) {
        // Building Cost lookup — combines all ages
        const ALL_COSTS = {
            'house': { food: 0, wood: 50, gold: 0, stone: 0 },
            'barracks': { food: 0, wood: 150, gold: 0, stone: 0 },
            'farm': { food: 0, wood: 60, gold: 0, stone: 0 },
            'fishmarket': { food: 0, wood: 120, gold: 0, stone: 0 },
            'tower': { food: 0, wood: 150, gold: 0, stone: 100 },
            'towncenter': { food: 0, wood: 400, gold: 0, stone: 200 },
            'woodwall': { food: 0, wood: 1, gold: 0, stone: 0 },
            'stonewall': { food: 0, wood: 0, gold: 0, stone: 1 },
            // Age 2
            'stable': { food: 0, wood: 200, gold: 50, stone: 0 },
            'market': { food: 0, wood: 180, gold: 30, stone: 0 },
            'blacksmith': { food: 0, wood: 150, gold: 0, stone: 80 },
            // Age 3
            'castle': { food: 0, wood: 0, gold: 200, stone: 250 },
            'siegeworkshop': { food: 0, wood: 250, gold: 100, stone: 0 },
            'monastery': { food: 0, wood: 200, gold: 150, stone: 0 },
            // Age 4
            'university': { food: 0, wood: 300, gold: 200, stone: 0 },
            'fortress': { food: 0, wood: 0, gold: 400, stone: 300 },
            'treasury': { food: 0, wood: 0, gold: 500, stone: 200 },
            // Age 5
            'temple': { food: 0, wood: 0, gold: 600, stone: 400 },
            'titanforge': { food: 0, wood: 0, gold: 800, stone: 500 },
            'wonder': { food: 1000, wood: 1000, gold: 1000, stone: 1000 }
        };
        const cost = ALL_COSTS[type];
        if (!cost) return false;

        // Can afford check
        if (this.playerResources.food < cost.food || this.playerResources.wood < cost.wood ||
            this.playerResources.gold < cost.gold || this.playerResources.stone < cost.stone) {
            return false;
        }

        // Deduct resources
        this.playerResources.food -= cost.food;
        this.playerResources.wood -= cost.wood;
        this.playerResources.gold -= cost.gold;
        this.playerResources.stone -= cost.stone;

        const villagers = this.selectedEntities.filter(e => e.type === 'villager');

        // If networked, send command, otherwise process directly
        if (this.network && (this.network.isClient || this.network.isHost)) {
            this.network.sendCommand({
                type: 'BUILD_CMD',
                faction: this.localFaction,
                buildingType: type,
                x: x,
                z: z,
                rotation: rotation,
                unitIds: villagers.map(v => v.id),
                buildingId: Math.random().toString(36).substr(2, 9)
            });
        } else {
            const b = this.spawnBuilding(this.localFaction, type, x, z);
            if (b) {
                if (rotation && b.mesh) b.mesh.rotation.y = rotation;
                villagers.forEach(vil => {
                    vil.setOrder('BUILD', b);
                });
            }
        }

        return true;
    }

    createAIGhostBuilding(faction, type, x, z, cost) {
        const HP_TABLE = {
            'towncenter': 800, 'barracks': 400, 'tower': 300, 'house': 180, 'farm': 150,
            'stable': 350, 'market': 250, 'blacksmith': 300,
            'castle': 600, 'siegeworkshop': 300, 'monastery': 280,
            'university': 350, 'fortress': 700, 'treasury': 400,
            'temple': 500, 'titanforge': 550, 'wonder': 1500
        };
        const maxHealth = HP_TABLE[type] || 200;
        let b;
        if (type === 'tower') {
            b = new Tower(this.getNewEntityId(), faction, x, z);
            b.mesh = this.builders.createTower(faction);
        } else {
            b = new Building(this.getNewEntityId(), faction, type, maxHealth, x, z, cost);
            const MESH_MAP = {
                'house': 'createHouse', 'barracks': 'createBarracks', 'farm': 'createFarm',
                'towncenter': 'createTownCenter', 'woodwall': 'createWoodWall', 'stonewall': 'createStoneWall',
                'stable': 'createStable', 'market': 'createMarket', 'blacksmith': 'createBlacksmith',
                'castle': 'createCastle', 'siegeworkshop': 'createSiegeWorkshop', 'monastery': 'createMonastery',
                'university': 'createUniversity', 'fortress': 'createFortress', 'treasury': 'createTreasury',
                'temple': 'createTemple', 'titanforge': 'createTitanForge', 'wonder': 'createWonder'
            };
            const meshFn = MESH_MAP[type];
            if (meshFn && this.builders[meshFn]) {
                b.mesh = this.builders[meshFn](faction);
            }
        }
        
        b.mesh.position.copy(b.position);
        b.buildProgress = 0;
        b.mesh.scale.set(1.0, 0.2, 1.0);
        this.scene.add(b.mesh);
        this.entities.push(b);
        return b;
    }

    assignSelectedVillagersToBuild(building) {
        const villagers = this.selectedEntities.filter(e => e.type === 'villager');
        villagers.forEach(vil => {
            vil.setOrder('BUILD', building);
        });
    }

    spawnArrow(startPos, targetEntity, damage, type = 'arrow', fromNetwork = false) {
        this.projectiles.push(new Projectile(this.scene, startPos, targetEntity, damage, type === 'cannonball' ? 12 : 15, this, type));
        if (this.network && this.network.isHost && !fromNetwork) {
            this.network.broadcastProjectile(startPos, targetEntity.id, damage, type);
        }
    }

    notifyCombat() {
        this.lastCombatTime = this.matchTime;
        if (!this.inCombat) {
            this.inCombat = true;
            audio.setBattleMode(true);
            audio.playBattleCry();
        }
    }

    // Helper functions for AI / Units
    findNearestResource(position, type, faction = null) {
        let bestRes = null;
        let minDist = Infinity;
        
        this.entities.forEach(e => {
            if (e.dead || !e.isResource || e.type !== type) return;
            if (type === 'farm') {
                if (!e.isBuilding || !e.isCompleted) return;
                if (faction && e.faction !== faction) return;
            }
            const dist = position.distanceTo(e.position);
            if (dist < minDist) {
                minDist = dist;
                bestRes = e;
            }
        });
        return bestRes;
    }

    findNearestTownCenter(position, faction) {
        let bestTc = null;
        let minDist = Infinity;
        
        this.entities.forEach(e => {
            if (e.dead || e.faction !== faction || e.type !== 'towncenter' || !e.isCompleted) return;
            const dist = position.distanceTo(e.position);
            if (dist < minDist) {
                minDist = dist;
                bestTc = e;
            }
        });
        return bestTc;
    }

    findNearestEnemy(position, faction, range = Infinity) {
        let bestEnemy = null;
        let minDist = range;

        this.entities.forEach(e => {
            if (e.dead || e.faction === faction || e.faction === 'nature' || e.faction === 'neutral') return;
            const dist = position.distanceTo(e.position);
            if (dist < minDist) {
                minDist = dist;
                bestEnemy = e;
            }
        });
        return bestEnemy;
    }

    selectEntities(list) {
        // Deselect current
        this.selectedEntities = list;
        this.updateHUD();
    }

    updateCameraPosition() {
        const x = this.cameraTarget.x + this.cameraRadius * Math.sin(this.cameraAngleY) * Math.cos(this.cameraAngleX);
        const y = this.cameraTarget.y + this.cameraRadius * Math.sin(this.cameraAngleX);
        const z = this.cameraTarget.z + this.cameraRadius * Math.cos(this.cameraAngleY) * Math.cos(this.cameraAngleX);
        
        this.camera.position.set(x, y, z);
        this.camera.lookAt(this.cameraTarget);
    }

    shakeCamera(amount = 0.5) {
        this.cameraShakeAmount = Math.max(this.cameraShakeAmount, amount);
    }

    updateCameraShake(dt) {
        if (this.cameraShakeAmount > 0) {
            this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeAmount;
            this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeAmount;
            this.camera.position.z += (Math.random() - 0.5) * this.cameraShakeAmount;
            this.cameraShakeAmount -= dt * 2.0; // fade out
            if (this.cameraShakeAmount < 0) this.cameraShakeAmount = 0;
        }
    }

    // Game Update loop tick
    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        let dt = (now - this.lastTime) / 1000.0;
        this.lastTime = now;

        // Caps dt in case tab was backgrounded to avoid physics explosion
        if (dt > 0.1) dt = 0.1;

        if (this.mobileHUDTimer > 0) {
            this.mobileHUDTimer -= dt;
            if (this.mobileHUDTimer <= 0 && this.selectedEntities.length === 0) {
                const bottomBar = document.getElementById('bottom-bar');
                const isMobileUI = window.innerWidth <= 950 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (isMobileUI) {
                    if (bottomBar) bottomBar.style.display = 'grid';
                    document.getElementById('info-panel').style.display = 'none';
                    document.getElementById('command-panel').style.display = 'none';
                } else {
                    document.getElementById('info-panel').style.visibility = 'hidden';
                    document.getElementById('command-panel').style.visibility = 'hidden';
                    document.getElementById('info-panel').style.pointerEvents = 'none';
                    document.getElementById('command-panel').style.pointerEvents = 'none';
                }
            }
        }

        if (!this.gameStarted || this.gameOver || this.gamePaused) {
            // Render static preview
            this.renderer.render(this.scene, this.camera);
            return;
        }

        this.matchTime += dt;
        this.updateTimerUI();

        // 1. Update Camera
        this.input.updateCamera(dt);
        this.updateCameraPosition();
        this.updateCameraShake(dt);
        this.updateRealtimeStats();

        // Update visual effects and environment
        if (this.vfx) {
            this.vfx.update(dt);
            this.vfx.updateSelectionRings(this.selectedEntities);
        }
        if (this.world) this.world.animateWater(dt);

        // Combat Audio State
        if (this.inCombat && (this.matchTime - this.lastCombatTime > 5.0)) {
            this.inCombat = false;
            audio.setBattleMode(false);
        }

        // 2. Update AI
        if (!this.network || !this.network.isClient) {
            this.aiPlayers.forEach(ai => ai.update(dt));
        }

        // 3. Update Projectiles (arrows)
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(dt);
            if (proj.dead) {
                this.projectiles.splice(i, 1);
            }
        }

        // 4. Update Entities (units and building progression)
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const ent = this.entities[i];
            if (ent.dead) {
                // If it is player selected, remove it
                const selIdx = this.selectedEntities.indexOf(ent);
                if (selIdx !== -1) {
                    this.selectedEntities.splice(selIdx, 1);
                    this.updateHUD();
                }

                // Statistics
                if (ent.faction === 'enemy') {
                    this.stats.enemiesKilled++;
                }

                // Death VFX and sound
                if (this.vfx) this.vfx.spawnDeathEffect(ent.position);
                if (ent.isBuilding) {
                    if (audio.playBuildingCollapse) audio.playBuildingCollapse();
                    this.shakeCamera(0.8);
                } else if (ent.isUnit) {
                    audio.playDeathGrunt();
                }

                // Delete node from world scene
                ent.destroy(this.scene);
                this.entities.splice(i, 1);
                
                // If Town Center destroyed, check match end
                if (ent.type === 'towncenter') {
                    this.checkVictoryConditions();
                }
                continue;
            }

            if (ent.showHealthTimer > 0) {
                ent.showHealthTimer -= dt;
            }

            // Physics Unit-to-Unit push separation
            if (ent.isUnit && (!this.network || !this.network.isClient)) {
                ent.applySeparation(this.entities, dt);
            }

            if (typeof ent.update === 'function') {
                if (!this.network || !this.network.isClient) {
                    ent.update(dt, this.world, this);
                } else {
                    // Client only updates animation mixer and smooth position interpolation
                    if (ent.networkTargetPos) {
                        ent.position.x += (ent.networkTargetPos.x - ent.position.x) * dt * 15;
                        ent.position.z += (ent.networkTargetPos.z - ent.position.z) * dt * 15;
                        if (ent.mesh) {
                            ent.mesh.position.set(ent.position.x, this.world.getElevationAtCoords(ent.position.x, ent.position.z), ent.position.z);
                            
                            if (ent.networkTargetRot !== undefined) {
                                let diff = ent.networkTargetRot - ent.mesh.rotation.y;
                                while (diff < -Math.PI) diff += Math.PI * 2;
                                while (diff > Math.PI) diff -= Math.PI * 2;
                                ent.mesh.rotation.y += diff * dt * 15;
                            }
                        }
                    }

                    if (ent.isBuilding && !ent.isCompleted && ent.buildProgress !== undefined) {
                        const scaleY = 0.2 + (ent.buildProgress / 100) * 0.8;
                        if (ent.mesh) ent.mesh.scale.set(1.0, scaleY, 1.0);
                    }

                    if (ent.mixer) {
                        // determine animation state based on velocity
                        if (ent.velocity && (Math.abs(ent.velocity.x) > 0.01 || Math.abs(ent.velocity.z) > 0.01)) {
                            if (ent.actions && ent.actions.walk) ent.playAnim('walk');
                        } else if (ent.state === 'ATTACK') {
                            if (ent.actions && ent.actions.attack) ent.playAnim('attack');
                        } else if (ent.state === 'GATHER') {
                            if (ent.actions && ent.actions.gather) ent.playAnim('gather');
                        } else {
                            if (ent.actions && ent.actions.idle) ent.playAnim('idle');
                        }
                        ent.mixer.update(dt);
                    }
                }
            }
        }

        if (this.network && this.network.isHost) {
            this.network.broadcastState();
        }

        // 5. Drawing Minimap
        this.drawMinimap();

        // 6. Update Selection World Billboards (Health Bars)
        this.updateWorldSelectionBars();

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    getEntityCost(type) {
        // Building costs
        for (let i = 1; i <= 6; i++) {
            const age = this.AGE_DATA[i];
            if (age && age.buildings) {
                const b = age.buildings.find(x => x.id === type);
                if (b) return b.res;
            }
        }
        // Unit costs
        const unitCosts = {
            'villager': { food: 50 },
            'soldier': { food: 60, gold: 20 },
            'archer': { food: 40, wood: 35 },
            'knight': { food: 80, gold: 60 },
            'spearman': { food: 50, wood: 30 },
            'crossbowman': { food: 60, gold: 40 },
            'siegeram': { food: 100, wood: 200 },
            'monk': { food: 30, gold: 100 },
            'paladin': { food: 120, gold: 100 },
            'cannon': { food: 80, wood: 100, gold: 150 },
            'elitearcher': { food: 60, gold: 80 },
            'champion': { food: 100, gold: 120 },
            'titan': { food: 300, gold: 400 },
            'warelephant': { food: 200, gold: 250 },
            'fighterrobot': { gold: 500, stone: 300 },
            'helicopter': { gold: 800, stone: 400 },
            'fighterplane': { gold: 1200, stone: 600 },
            'fishboat': { wood: 50 },
            'warship': { wood: 150, gold: 50 },
            'transportboat': { wood: 200 }
        };
        return unitCosts[type] || {};
    }

    processCommand(cmd) {
        if (!cmd || !cmd.type) return;
        
        switch (cmd.type) {
            case 'MOVE':
                if (cmd.unitIds) {
                    cmd.unitIds.forEach(id => {
                        const unit = this.entities.find(e => e.id === id && e.faction === cmd.faction);
                        if (unit) unit.moveTo(cmd.x, cmd.z);
                    });
                }
                break;
            case 'ATTACK':
            case 'GATHER':
            case 'BUILD':
            case 'REPAIR':
            case 'ORDER_LOAD':
                if (cmd.unitIds && cmd.targetId) {
                    const target = this.entities.find(e => e.id === cmd.targetId);
                    if (target) {
                        cmd.unitIds.forEach(id => {
                            const unit = this.entities.find(e => e.id === id && e.faction === cmd.faction);
                            if (unit) unit.setOrder(cmd.type === 'ORDER_LOAD' ? 'LOAD' : cmd.type, target);
                        });
                    }
                }
                break;
            case 'UNLOAD':
                if (cmd.unitId) {
                    const t = this.entities.find(e => e.id === cmd.unitId && e.faction === cmd.faction);
                    if (t && t.type === 'transportboat' && t.loadedEntities) {
                        t.loadedEntities.forEach(u => {
                            u.isLoaded = false;
                            if (u.mesh) u.mesh.visible = true;
                            u.position.copy(t.position);
                            u.position.x += (Math.random() * 4 - 2);
                            u.position.z += (Math.random() * 4 - 2);
                            u.position.y = this.world.getElevationAtCoords(u.position.x, u.position.z);
                        });
                        t.loadedEntities = [];
                    }
                }
                break;
            case 'BUILD_CMD':
                if (cmd.unitIds && cmd.buildingType) {
                    if (this.network && this.network.isHost) {
                        if (!this.factionResources) this.factionResources = {};
                        if (!this.factionResources[cmd.faction]) this.factionResources[cmd.faction] = { food: 200, wood: 200, gold: 100, stone: 0 };
                        const cost = this.getEntityCost(cmd.buildingType);
                        if (cost) {
                            if (cost.food) this.factionResources[cmd.faction].food -= cost.food;
                            if (cost.wood) this.factionResources[cmd.faction].wood -= cost.wood;
                            if (cost.gold) this.factionResources[cmd.faction].gold -= cost.gold;
                            if (cost.stone) this.factionResources[cmd.faction].stone -= cost.stone;
                        }
                    }
                    // Create building shell
                    const b = this.spawnBuilding(cmd.faction, cmd.buildingType, cmd.x, cmd.z, cmd.buildingId);
                    if (b) {
                        if (cmd.rotation !== undefined && b.mesh) b.mesh.rotation.y = cmd.rotation;
                        cmd.unitIds.forEach(id => {
                            const unit = this.entities.find(e => e.id === id && e.faction === cmd.faction);
                            if (unit) unit.setOrder('BUILD', b);
                        });
                    }
                }
                break;
            case 'AUTO_MODE':
                if (cmd.unitIds) {
                    cmd.unitIds.forEach(id => {
                        const unit = this.entities.find(e => e.id === id && e.faction === cmd.faction);
                        if (unit) unit.autoMode = cmd.enable;
                    });
                }
                break;
            case 'TRAIN':
                if (cmd.buildingId && cmd.unitType) {
                    if (this.network && this.network.isHost) {
                        if (!this.factionResources) this.factionResources = {};
                        if (!this.factionResources[cmd.faction]) this.factionResources[cmd.faction] = { food: 200, wood: 200, gold: 100, stone: 0 };
                        const cost = this.getEntityCost(cmd.unitType);
                        if (cost) {
                            if (cost.food) this.factionResources[cmd.faction].food -= cost.food;
                            if (cost.wood) this.factionResources[cmd.faction].wood -= cost.wood;
                            if (cost.gold) this.factionResources[cmd.faction].gold -= cost.gold;
                            if (cost.stone) this.factionResources[cmd.faction].stone -= cost.stone;
                        }
                    }
                    const building = this.entities.find(e => e.id === cmd.buildingId && e.faction === cmd.faction);
                    if (building && typeof building.trainUnit === 'function') {
                        building.trainUnit(cmd.unitType);
                    }
                }
                break;
            case 'DELETE_CMD':
                if (cmd.unitIds) {
                    cmd.unitIds.forEach(id => {
                        const entity = this.entities.find(e => e.id === id && e.faction === cmd.faction);
                        if (entity && !entity.dead) {
                            entity.die();
                        }
                    });
                }
                break;
        }
    }

    updateTimerUI() {
        const mins = Math.floor(this.matchTime / 60);
        const secs = Math.floor(this.matchTime % 60);
        this.dom.timer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateTopBar() {
        if (!this.dom.foodVal) {
            this.dom.foodVal = document.getElementById('food-val');
            this.dom.woodVal = document.getElementById('wood-val');
            this.dom.goldVal = document.getElementById('gold-val');
            this.dom.stoneVal = document.getElementById('stone-val');
            this.dom.popVal = document.getElementById('pop-val');
            this.dom.ageIndicator = document.getElementById('age-indicator');
        }
        if (this.dom.foodVal) {
            this.dom.foodVal.textContent = Math.floor(this.playerResources.food);
            this.dom.woodVal.textContent = Math.floor(this.playerResources.wood);
            this.dom.goldVal.textContent = Math.floor(this.playerResources.gold);
            this.dom.stoneVal.textContent = Math.floor(this.playerResources.stone);
            this.dom.popVal.textContent = `${this.playerPop}/${this.playerPopCap}`;
        }
        // Update age indicator
        if (this.dom.ageIndicator) {
            this.dom.ageIndicator.textContent = `${this.AGE_ICONS[this.playerAge]} ${this.AGE_NAMES[this.playerAge]}`;
            this.dom.ageIndicator.className = `age-badge age-${this.playerAge}`;
        }

        // Check age advancement whenever HUD updates (a building may have just completed)
        this.checkAgeAdvancement();
    }

    updateRealtimeStats() {
        if (this.selectedEntities.length === 1 && this.selectedEntities[0].type === 'villager') {
            const ent = this.selectedEntities[0];
            const eFood = document.getElementById('rt-carry-food');
            const eWood = document.getElementById('rt-carry-wood');
            const eGold = document.getElementById('rt-carry-gold');
            const eStone = document.getElementById('rt-carry-stone');
            if (eFood) eFood.textContent = ent.carrying.food;
            if (eWood) eWood.textContent = ent.carrying.wood;
            if (eGold) eGold.textContent = ent.carrying.gold;
            if (eStone) eStone.textContent = ent.carrying.stone;
        } else if (this.selectedEntities.length > 1) {
            const groupTotal = { food: 0, wood: 0, gold: 0, stone: 0 };
            let hasVillager = false;
            this.selectedEntities.forEach(ent => {
                if (ent.type === 'villager') {
                    hasVillager = true;
                    groupTotal.food += ent.carrying.food;
                    groupTotal.wood += ent.carrying.wood;
                    groupTotal.gold += ent.carrying.gold;
                    groupTotal.stone += ent.carrying.stone;
                }
            });
            if (hasVillager) {
                const eFood = document.getElementById('rt-carry-food');
                const eWood = document.getElementById('rt-carry-wood');
                const eGold = document.getElementById('rt-carry-gold');
                const eStone = document.getElementById('rt-carry-stone');
                if (eFood) eFood.textContent = groupTotal.food;
                if (eWood) eWood.textContent = groupTotal.wood;
                if (eGold) eGold.textContent = groupTotal.gold;
                if (eStone) eStone.textContent = groupTotal.stone;
            }
        }
    }

    drawMinimap() {
        const canvas = document.getElementById('minimap-canvas');
        const ctx = canvas.getContext('2d');
        const size = canvas.width;

        // Clear background
        ctx.fillStyle = '#060913';
        ctx.fillRect(0, 0, size, size);

        // Helper to convert world position to minimap coordinates (linear)
        const toMap = (pos) => {
            const half = this.world.mapSize / 2;
            const cx = ((pos.x + half) / this.world.mapSize) * size;
            const cy = ((pos.z + half) / this.world.mapSize) * size;
            return { cx, cy };
        };

        // Draw each entity
        this.entities.forEach(ent => {
            if (ent.dead) return;
            const { cx, cy } = toMap(ent.position);
            ctx.beginPath();
            let color = '#9ca3af';
            let radius = 2;
            const factionColors = {
                'player': '#3b82f6',
                'enemy': '#ef4444',
                'player3': '#10b981',
                'player4': '#f59e0b'
            };
            
            if (ent.faction !== 'neutral' && ent.faction !== 'nature') {
                color = factionColors[ent.faction] || (ent.faction === this.localFaction ? '#3b82f6' : '#ef4444');
                radius = ent.isBuilding ? 4 : 2;
            } else if (ent.faction === 'nature') {
                if (ent.type === 'tree') color = '#10b981';
                else if (ent.type === 'gold') color = '#fbbf24';
                else if (ent.type === 'stone') color = '#a1a1aa';
                else if (ent.type === 'forage') color = '#f59e0b';
                radius = 2.5;
            }
            ctx.fillStyle = color;
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw camera viewport indicator
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        const camPos = { x: this.cameraTarget.x, z: this.cameraTarget.z };
        const { cx: camX, cy: camY } = toMap(camPos);
        const vW = (this.cameraRadius * 0.9) * (size / this.world.mapSize);
        const vH = (this.cameraRadius * 0.6) * (size / this.world.mapSize);
        ctx.strokeRect(camX - vW/2, camY - vH/2, vW, vH);
    }

    updateWorldSelectionBars() {
        // Clear all previous world health bars and building labels
        document.querySelectorAll('.world-health-bar').forEach(el => el.remove());
        document.querySelectorAll('.building-name-label').forEach(el => el.remove());

        const widthHalf = window.innerWidth / 2;
        const heightHalf = window.innerHeight / 2;

        // Track which buildings already have a label (to avoid duplicates from hover + selection)
        const labeledBuildingIds = new Set();

        // Helper: create a building name label at screen position
        const createBuildingLabel = (ent, sx, sy) => {
            if (labeledBuildingIds.has(ent.id)) return;
            labeledBuildingIds.add(ent.id);

            const label = document.createElement('div');
            label.className = 'building-name-label' + (ent.faction !== this.localFaction && ent.faction !== 'neutral' && ent.faction !== 'nature' ? ' enemy-label' : '');
            const { icon, name } = this.getBuildingDisplayName(ent.type);
            label.innerHTML = `<span class="label-icon">${icon}</span>${name}`;
            label.style.left = `${sx}px`;
            label.style.top = `${sy - 18}px`;
            document.body.appendChild(label);
        };

        const entitiesToShowHealth = new Set(this.selectedEntities);
        if (this.hoveredEntity && this.hoveredEntity.faction !== this.localFaction && this.hoveredEntity.faction !== 'neutral' && this.hoveredEntity.faction !== 'nature') {
            entitiesToShowHealth.add(this.hoveredEntity);
        }
        this.entities.forEach(ent => {
            if (ent.showHealthTimer > 0) entitiesToShowHealth.add(ent);
        });

        entitiesToShowHealth.forEach(ent => {
            if (ent.dead) return;

            const vec = new THREE.Vector3().copy(ent.position);
            // position slightly above the highest point of building/unit mesh
            vec.y += ent.type === 'towncenter' ? 3.2 : (ent.type === 'tower' ? 4.5 : (ent.isBuilding ? 2.0 : 1.25));

            // Project 3D vector to 2D Screen
            vec.project(this.camera);

            // Is offscreen
            if (vec.z > 1) return;

            const sx = (vec.x * widthHalf) + widthHalf;
            const sy = -(vec.y * heightHalf) + heightHalf;

            // Spawn floating DOM health bar
            const bar = document.createElement('div');
            bar.className = 'world-health-bar';
            bar.style.left = `${sx - 20}px`;
            bar.style.top = `${sy}px`;

            const fill = document.createElement('div');
            fill.className = 'world-health-bar-fill';
            const healthPct = (ent.health / ent.maxHealth) * 100;
            fill.style.width = `${healthPct}%`;
            
            if (ent.faction !== this.localFaction && ent.faction !== 'neutral' && ent.faction !== 'nature') {
                fill.style.backgroundColor = '#ef4444';
            }

            bar.appendChild(fill);
            document.body.appendChild(bar);

            // Show building name label for selected buildings
            if (ent.isBuilding) {
                createBuildingLabel(ent, sx, sy);
            }
        });

        // Show building name label for hovered building (even if not selected)
        if (this.hoveredBuilding && !this.hoveredBuilding.dead && this.hoveredBuilding.isBuilding) {
            const ent = this.hoveredBuilding;
            const vec = new THREE.Vector3().copy(ent.position);
            vec.y += ent.type === 'towncenter' ? 3.2 : (ent.type === 'tower' ? 4.5 : 2.0);
            vec.project(this.camera);
            if (vec.z <= 1) {
                const sx = (vec.x * widthHalf) + widthHalf;
                const sy = -(vec.y * heightHalf) + heightHalf;
                createBuildingLabel(ent, sx, sy);
            }
        }
    }

    getBuildingDisplayName(type) {
        const names = {
            'towncenter': { icon: '🏰', name: 'Town Center' },
            'barracks': { icon: '⛺', name: 'Barracks' },
            'house': { icon: '🏠', name: 'House' },
            'farm': { icon: '🌾', name: 'Farm' },
            'tower': { icon: '🗼', name: 'Watchtower' },
            // Age 2
            'stable': { icon: '🐴', name: 'Stable' },
            'market': { icon: '🏪', name: 'Market' },
            'blacksmith': { icon: '⚒️', name: 'Blacksmith' },
            // Age 3
            'castle': { icon: '🏰', name: 'Castle' },
            'siegeworkshop': { icon: '🔧', name: 'Siege Workshop' },
            'monastery': { icon: '⛪', name: 'Monastery' },
            // Age 4
            'university': { icon: '🎓', name: 'University' },
            'fortress': { icon: '🏯', name: 'Fortress' },
            'treasury': { icon: '💰', name: 'Treasury' },
            // Age 5
            'temple': { icon: '🛕', name: 'Temple of Gods' },
            'titanforge': { icon: '🔥', name: 'Titan Forge' },
            'wonder': { icon: '🏛️', name: 'Wonder' },
            // Age 6
            'roboticlab': { icon: '🏭', name: 'Robotic Lab' },
            'airport': { icon: '🛫', name: 'Airport Strip' }
        };
        return names[type] || { icon: '🏗️', name: type.charAt(0).toUpperCase() + type.slice(1) };
    }

    updateHUD() {
        // 1. Gather count
        const players = this.entities.filter(e => !e.dead && e.faction === this.localFaction);
        const popCount = players.filter(e => e.isUnit).length;
        
        // Count houses
        const houses = players.filter(e => e.type === 'house' && e.isCompleted);
        const towncenters = players.filter(e => e.type === 'towncenter' && e.isCompleted);
        this.playerPopCap = 10 + (houses.length * 5) + (towncenters.length * 10);
        this.playerPopCap = Math.min(60, this.playerPopCap); // absolute pop limit

        // Draw Resource UI
        const updateRes = (id, val) => {
            const el = document.getElementById(id);
            const num = Math.floor(val);
            if (el.textContent != num) {
                el.textContent = num;
                const parent = el.parentElement;
                parent.classList.remove('updated');
                void parent.offsetWidth; // trigger reflow
                parent.classList.add('updated');
            }
        };

        updateRes('food-val', this.playerResources.food);
        updateRes('wood-val', this.playerResources.wood);
        updateRes('gold-val', this.playerResources.gold);
        updateRes('stone-val', this.playerResources.stone);
        document.getElementById('pop-val').textContent = `${popCount}/${this.playerPopCap}`;

        // 2. Details panel info
        const infoEmpty = document.getElementById('info-empty');
        const infoDetails = document.getElementById('info-details');

        const bottomBar = document.getElementById('bottom-bar');
        const isMobileUI = window.innerWidth <= 950 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (this.selectedEntities.length === 0) {
            infoEmpty.classList.remove('hidden');
            infoDetails.classList.add('hidden');
            this.drawCommandsCard(null);
            
            if (isMobileUI) {
                if (bottomBar) bottomBar.style.display = 'grid';
                document.getElementById('info-panel').style.display = 'none';
                document.getElementById('command-panel').style.display = 'none';
            } else {
                if (bottomBar) bottomBar.style.display = 'grid';
                if (this.mobileHUDTimer <= 0) {
                    document.getElementById('info-panel').style.visibility = 'hidden';
                    document.getElementById('command-panel').style.visibility = 'hidden';
                    document.getElementById('info-panel').style.pointerEvents = 'none';
                    document.getElementById('command-panel').style.pointerEvents = 'none';
                } else {
                    document.getElementById('info-panel').style.visibility = 'visible';
                    document.getElementById('command-panel').style.visibility = 'visible';
                    document.getElementById('info-panel').style.pointerEvents = 'auto';
                    document.getElementById('command-panel').style.pointerEvents = 'auto';
                }
            }
        } else if (this.selectedEntities.length === 1) {
            if (bottomBar) bottomBar.style.display = 'grid';
            document.getElementById('info-panel').style.display = '';
            document.getElementById('command-panel').style.display = '';
            document.getElementById('info-panel').style.visibility = 'visible';
            document.getElementById('command-panel').style.visibility = 'visible';
            document.getElementById('info-panel').style.pointerEvents = 'auto';
            document.getElementById('command-panel').style.pointerEvents = 'auto';
            infoEmpty.classList.add('hidden');
            infoDetails.classList.remove('hidden');
            infoDetails.classList.remove('hidden');

            const ent = this.selectedEntities[0];
            document.getElementById('info-name').textContent = ent.type.charAt(0).toUpperCase() + ent.type.slice(1);
            
            const badge = document.getElementById('info-faction');
            badge.className = `badge ${ent.faction !== this.localFaction && ent.faction !== 'neutral' && ent.faction !== 'nature' ? 'enemy' : ''}`;
            badge.textContent = ent.faction.toUpperCase();

            // Set icon
            const portrait = document.getElementById('info-portrait');
            const iconMap = {
                'villager': '🧑‍🌾', 'soldier': '⚔️', 'archer': '🏹',
                'knight': '♞', 'spearman': '🔱', 'crossbowman': '🎯', 'siegeram': '🪵', 'monk': '🙏', 'paladin': '🛡️', 'cannon': '💣', 'elitearcher': '🏹', 'titan': '🗿', 'warelephant': '🐘', 'champion': '⚔️',
                'fighterrobot': '🤖', 'helicopter': '🚁', 'fighterplane': '✈️',
                'towncenter': '🏰', 'barracks': '⛺', 'house': '🏠',
                'farm': '🌾', 'tower': '🗼', 'tree': '🌲',
                'stable': '🐴', 'market': '🏪', 'blacksmith': '⚒️', 'castle': '🏰', 'siegeworkshop': '🔧', 'monastery': '⛪', 'university': '🎓', 'fortress': '🏯', 'treasury': '💰', 'temple': '🏛️', 'titanforge': '🌋', 'wonder': '🗽',
                'roboticlab': '🏭', 'airport': '🛫',
                'gold': '🪙', 'stone': '🪨', 'forage': '🍇', 'transportboat': '🚢', 'fishmarket': '🐟', 'fishboat': '⛵', 'warship': '🛳️'
            };
            const iconStr = iconMap[ent.type] || ent.type.substring(0, 2).toUpperCase();
            portrait.textContent = iconStr;

            // Health status
            const healthPct = (ent.health / ent.maxHealth) * 100;
            const healthFill = document.getElementById('info-health-fill');
            healthFill.style.width = `${healthPct}%`;
            healthFill.className = `health-bar-fill ${ent.faction !== this.localFaction && ent.faction !== 'neutral' && ent.faction !== 'nature' ? 'enemy-fill' : ''}`;
            document.getElementById('info-health-text').textContent = `${Math.floor(ent.health)}/${ent.maxHealth}`;

            // Extra stats description
            const extra = document.getElementById('info-extra-stats');
            extra.innerHTML = '';
            
            if (ent.isUnit) {
                extra.innerHTML += `<span>Dmg: <strong>${ent.attackDamage}</strong></span>`;
                extra.innerHTML += `<span>Range: <strong>${ent.attackRange}</strong></span>`;
                extra.innerHTML += `<span>Speed: <strong>${ent.speed}</strong></span>`;
                extra.innerHTML += `<span>State: <strong>${ent.state}</strong></span>`;
                
                if (ent.type === 'villager') {
                    const totalCarried = Object.values(ent.carrying).reduce((a,b) => a+b, 0);
                    extra.innerHTML += `<span style="grid-column: span 2">Carrying: 🌾<span id="rt-carry-food">${ent.carrying.food}</span> 🪓<span id="rt-carry-wood">${ent.carrying.wood}</span> 🪙<span id="rt-carry-gold">${ent.carrying.gold}</span> 🪨<span id="rt-carry-stone">${ent.carrying.stone}</span></span>`;
                }

                // Show cost to train this unit type
                const unitCosts = {
                    'villager': '🌾 50 Food',
                    'soldier': '🌾 60 Food, 🪙 20 Gold',
                    'archer': '🌾 40 Food, 🪓 35 Wood'
                };
                if (unitCosts[ent.type]) {
                    extra.innerHTML += `<span style="grid-column: span 2">Train Cost: <strong>${unitCosts[ent.type]}</strong></span>`;
                }
            } else if (ent.isBuilding) {
                if (!ent.isCompleted) {
                    extra.innerHTML += `<span style="grid-column: span 2">Construction: <strong>${Math.floor(ent.buildProgress)}%</strong></span>`;
                } else if (ent.queue.length > 0) {
                    extra.innerHTML += `<span>Training: <strong>${ent.queue[0]}</strong></span>`;
                    extra.innerHTML += `<span>Progress: <strong>${Math.floor(ent.trainingProgress)}%</strong></span>`;
                }

                // Show cost to build this building type
                const buildingCosts = {
                    'house': '🪓 50 Wood',
                    'farm': '🪓 60 Wood',
                    'barracks': '🪓 150 Wood',
                    'tower': '🪓 150 Wood, 🪨 100 Stone',
                    'towncenter': '🪓 400 Wood, 🪨 200 Stone'
                };
                if (buildingCosts[ent.type]) {
                    extra.innerHTML += `<span style="grid-column: span 2">Build Cost: <strong>${buildingCosts[ent.type]}</strong></span>`;
                }
            } else if (ent.isResource) {
                extra.innerHTML += `<span style="grid-column: span 2">Remaining Capacity: <strong>${ent.health} / ${ent.maxHealth}</strong></span>`;
            }

            this.drawCommandsCard(ent);
        } else {
            const bottomBar = document.getElementById('bottom-bar');
            if (bottomBar) bottomBar.style.display = 'grid';
            document.getElementById('info-panel').style.display = '';
            document.getElementById('command-panel').style.display = '';
            document.getElementById('info-panel').style.visibility = 'visible';
            document.getElementById('command-panel').style.visibility = 'visible';
            document.getElementById('info-panel').style.pointerEvents = 'auto';
            document.getElementById('command-panel').style.pointerEvents = 'auto';
            // Multiple units selected
            infoEmpty.classList.add('hidden');
            infoDetails.classList.remove('hidden');

            const count = this.selectedEntities.length;
            document.getElementById('info-name').textContent = `${count} Units Selected`;
            
            const badge = document.getElementById('info-faction');
            badge.className = 'badge';
            badge.textContent = 'PLAYER';

            document.getElementById('info-portrait').textContent = '👥';

            // Show group collective health bar
            let totalHP = 0;
            let maxHP = 0;
            this.selectedEntities.forEach(e => {
                totalHP += e.health;
                maxHP += e.maxHealth;
            });
            const healthPct = (totalHP / maxHP) * 100;
            const healthFill = document.getElementById('info-health-fill');
            healthFill.style.width = `${healthPct}%`;
            healthFill.className = 'health-bar-fill';
            document.getElementById('info-health-text').textContent = `${Math.floor(totalHP)}/${maxHP}`;

            const villagerCount = this.selectedEntities.filter(e => e.type === 'villager').length;
            document.getElementById('info-extra-stats').innerHTML = `
                <span style="grid-column: span 2">Villagers: <strong>${villagerCount}</strong></span>
                <span style="grid-column: span 2">Combat: <strong>${this.selectedEntities.filter(e => e.type !== 'villager').length}</strong></span>
            `;
            if (villagerCount > 0) {
                document.getElementById('info-extra-stats').innerHTML += `<span style="grid-column: span 2">Group Carrying: 🌾<span id="rt-carry-food">0</span> 🪓<span id="rt-carry-wood">0</span> 🪙<span id="rt-carry-gold">0</span> 🪨<span id="rt-carry-stone">0</span></span>`;
            }

            this.drawCommandsCard({ isGroup: true, type: 'group', faction: this.localFaction });
        }
    }

    drawCommandsCard(entity) {
        const grid = document.getElementById('command-grid');
        grid.innerHTML = '';

        if (!entity || entity.faction !== this.localFaction) return;

        if (entity.isGroup) {
            const units = this.selectedEntities.filter(e => e.isUnit && !e.dead && e.faction === this.localFaction);
            if (units.length === 0) return;

            const allAuto = units.every(u => u.autoMode);
            const autoBtn = document.createElement('button');
            autoBtn.className = 'cmd-btn' + (allAuto ? ' active-cmd' : '');
            autoBtn.innerHTML = `<span class="cmd-icon">🗺️</span> Auto Mode`;
            autoBtn.innerHTML += `
                <div class="tooltip">
                    <h5>Auto Mode (Group)</h5>
                    <p>Toggle auto-work for the selected group (villagers gather, military hunts enemies).</p>
                </div>
            `;
            autoBtn.addEventListener('click', () => {
                const next = !allAuto;
                const cmd = { type: 'AUTO_MODE', faction: this.localFaction, unitIds: units.map(u => u.id), enable: next };
                if (this.network) this.network.sendCommand(cmd);
                else this.processCommand(cmd);
                
                audio.playClick();
                this.updateHUD();
            });
            grid.appendChild(autoBtn);

            const hasVillager = units.some(u => u.type === 'villager');
            if (!hasVillager) return;

            const structures = this.getAvailableBuildingsForUI();

            structures.forEach(s => {
                const btn = document.createElement('button');
                btn.className = 'cmd-btn';
                const canAfford = s.canAfford();
                if (!canAfford) btn.classList.add('disabled');

                btn.innerHTML = `
                    <span class="cmd-icon">${s.icon}</span>
                    <span class="cmd-label">${s.label}</span>
                    <span class="cmd-cost-inline ${canAfford ? '' : 'insufficient'}">${s.cost}</span>
                    <div class="tooltip">
                        <h5>${s.label}</h5>
                        <p>${s.desc}</p>
                    </div>
                `;

                btn.addEventListener('click', () => {
                    if (s.canAfford()) {
                        this.input.startBuildingPlacement(s.id);
                    } else {
                        audio.playOrder();
                    }
                });

                grid.appendChild(btn);
            });

            return;
        }

        if (entity.type === 'villager') {
            // Build commands list — all ages up to current
            const structures = this.getAvailableBuildingsForUI();

            structures.forEach(s => {
                const btn = document.createElement('button');
                btn.className = 'cmd-btn';
                const canAfford = s.canAfford();
                if (!canAfford) btn.classList.add('disabled');

                btn.innerHTML = `
                    <span class="cmd-icon">${s.icon}</span>
                    <span class="cmd-label">${s.label}</span>
                    <span class="cmd-cost-inline ${canAfford ? '' : 'insufficient'}">${s.cost}</span>
                    <div class="tooltip">
                        <h5>${s.label}</h5>
                        <p>${s.desc}</p>
                    </div>
                `;

                btn.addEventListener('click', () => {
                    if (s.canAfford()) {
                        this.input.startBuildingPlacement(s.id);
                    } else {
                        audio.playOrder();
                    }
                });

                grid.appendChild(btn);
            });

            // Add Auto-Explore / Work Button
            const autoBtn = document.createElement('button');
            autoBtn.className = 'cmd-btn' + (entity.autoMode ? ' active-cmd' : '');
            autoBtn.innerHTML = `<span class="cmd-icon">🗺️</span> Auto-Work`;
            autoBtn.innerHTML += `
                <div class="tooltip">
                    <h5>Auto-Work Mode</h5>
                    <p>Toggle to let the villager roam and automatically gather resources.</p>
                </div>
            `;
            autoBtn.addEventListener('click', () => {
                const next = !entity.autoMode;
                const cmd = { type: 'AUTO_MODE', faction: this.localFaction, unitIds: [entity.id], enable: next };
                if (this.network) this.network.sendCommand(cmd);
                else this.processCommand(cmd);
                
                audio.playClick();
                this.drawCommandsCard(entity); // Redraw to update active state
            });
            grid.appendChild(autoBtn);

        } else if (entity.type === 'towncenter' && entity.isCompleted) {
            // Train villager command
            const btn = document.createElement('button');
            btn.className = 'cmd-btn';
            
            // Check cost limit
            const canAfford = this.playerResources.food >= 50;
            if (!canAfford) btn.classList.add('disabled');

            btn.innerHTML = `
                <span class="cmd-icon">🧑‍🌾</span>
                <span class="cmd-label">Train Villager</span>
                <span class="cmd-cost-inline ${canAfford ? '' : 'insufficient'}">🌾 50</span>
                <div class="tooltip">
                    <h5>Villager</h5>
                    <p>Collects resources, builds structures.</p>
                    <div class="cost-row">
                        <span class="cost-item">🌾 50 Food</span>
                    </div>
                </div>
            `;

            btn.addEventListener('click', () => {
                const popCurrent = this.entities.filter(e => !e.dead && e.faction === this.localFaction && e.isUnit).length;
                if (this.playerResources.food >= 50 && popCurrent < this.playerPopCap) {
                    this.playerResources.food -= 50;
                    this.network.sendCommand({ type: 'TRAIN', faction: this.localFaction, buildingId: entity.id, unitType: 'villager' });
                    audio.playClick();
                    this.updateHUD();
                } else {
                    audio.playOrder(); // buzz
                }
            });
            grid.appendChild(btn);
        } else if (entity.type === 'barracks' && entity.isCompleted) {
            // Train soldier
            const soldierBtn = document.createElement('button');
            soldierBtn.className = 'cmd-btn';
            
            // Check cost limit
            const canAffordSoldier = this.playerResources.food >= 60 && this.playerResources.gold >= 20;
            if (!canAffordSoldier) soldierBtn.classList.add('disabled');

            soldierBtn.innerHTML = `
                <span class="cmd-icon">⚔️</span>
                <span class="cmd-label">Train Soldier</span>
                <span class="cmd-cost-inline ${canAffordSoldier ? '' : 'insufficient'}">🌾 60 🪙 20</span>
                <div class="tooltip">
                    <h5>Soldier</h5>
                    <p>Heavy infantry with high health and melee damage.</p>
                    <div class="cost-row">
                        <span class="cost-item">🌾 60 Food</span>
                        <span class="cost-item">🪙 20 Gold</span>
                    </div>
                </div>
            `;

            soldierBtn.addEventListener('click', () => {
                const popCurrent = this.entities.filter(e => !e.dead && e.faction === this.localFaction && e.isUnit).length;
                if (this.playerResources.food >= 60 && this.playerResources.gold >= 20 && popCurrent < this.playerPopCap) {
                    this.playerResources.food -= 60;
                    this.playerResources.gold -= 20;
                    this.network.sendCommand({ type: 'TRAIN', faction: this.localFaction, buildingId: entity.id, unitType: 'soldier' });
                    audio.playClick();
                    this.updateHUD();
                } else {
                    audio.playOrder();
                }
            });
            grid.appendChild(soldierBtn);

            // Train archer
            const archerBtn = document.createElement('button');
            archerBtn.className = 'cmd-btn';
            
            // Check cost limit
            const canAffordArcher = this.playerResources.food >= 40 && this.playerResources.wood >= 35;
            if (!canAffordArcher) archerBtn.classList.add('disabled');

            archerBtn.innerHTML = `
                <span class="cmd-icon">🏹</span>
                <span class="cmd-label">Train Archer</span>
                <span class="cmd-cost-inline ${canAffordArcher ? '' : 'insufficient'}">🌾 40 🪓 35</span>
                <div class="tooltip">
                    <h5>Archer</h5>
                    <p>Ranged archer unit that attacks from a distance.</p>
                    <div class="cost-row">
                        <span class="cost-item">🌾 40 Food</span>
                        <span class="cost-item">🪓 35 Wood</span>
                    </div>
                </div>
            `;

            archerBtn.addEventListener('click', () => {
                const popCurrent = this.entities.filter(e => !e.dead && e.faction === this.localFaction && e.isUnit).length;
                if (this.playerResources.food >= 40 && this.playerResources.wood >= 35 && popCurrent < this.playerPopCap) {
                    this.playerResources.food -= 40;
                    this.playerResources.wood -= 35;
                    this.network.sendCommand({ type: 'TRAIN', faction: this.localFaction, buildingId: entity.id, unitType: 'archer' });
                    audio.playClick();
                    this.updateHUD();
                } else {
                    audio.playOrder();
                }
            });
            grid.appendChild(archerBtn);
        } else if (entity.type === 'stable' && entity.isCompleted) {
            // Age 2 Stable: Knight & Spearman
            this.addTrainButton(grid, entity, '🐴', 'Knight', 'knight', { food: 80, gold: 60 }, 'Fast cavalry, bonus vs archers.');
            this.addTrainButton(grid, entity, '🔱', 'Spearman', 'spearman', { food: 50, wood: 30 }, 'Anti-cavalry infantry.');
        } else if (entity.type === 'castle' && entity.isCompleted) {
            // Age 3 Castle: Crossbowman
            this.addTrainButton(grid, entity, '🎯', 'Crossbowman', 'crossbowman', { food: 60, gold: 40 }, 'High-damage ranged unit.');
        } else if (entity.type === 'siegeworkshop' && entity.isCompleted) {
            // Age 3 Siege Workshop: Siege Ram
            this.addTrainButton(grid, entity, '🪵', 'Siege Ram', 'siegeram', { food: 100, wood: 200 }, 'Destroys buildings. Slow but devastating.');
        } else if (entity.type === 'monastery' && entity.isCompleted) {
            // Age 3 Monastery: Monk
            this.addTrainButton(grid, entity, '🙏', 'Monk', 'monk', { food: 30, gold: 100 }, 'Healer. Auto-heals nearby friendly units.');
        } else if (entity.type === 'fortress' && entity.isCompleted) {
            // Age 4 Fortress: Paladin & Cannon
            this.addTrainButton(grid, entity, '🛡️', 'Paladin', 'paladin', { food: 120, gold: 100 }, 'Elite armored cavalry.');
            this.addTrainButton(grid, entity, '💣', 'Cannon', 'cannon', { food: 80, wood: 100, gold: 150 }, 'Long-range siege weapon.');
        } else if (entity.type === 'university' && entity.isCompleted) {
            // Age 4 University: Elite Archer
            this.addTrainButton(grid, entity, '🏹', 'Elite Archer', 'elitearcher', { food: 60, gold: 80 }, 'Extended range, high damage archer.');
        } else if (entity.type === 'temple' && entity.isCompleted) {
            // Age 5 Temple: Champion
            this.addTrainButton(grid, entity, '⚔️', 'Champion', 'champion', { food: 100, gold: 120 }, 'Elite all-round infantry.');
        } else if (entity.type === 'titanforge' && entity.isCompleted) {
            // Age 5 Titan Forge: Titan & War Elephant
            this.addTrainButton(grid, entity, '🗿', 'Titan', 'titan', { food: 300, gold: 400 }, 'Massive warrior with area damage.');
            this.addTrainButton(grid, entity, '🐘', 'War Elephant', 'warelephant', { food: 200, gold: 250 }, 'High HP cavalry with trample.');
        } else if (entity.type === 'roboticlab' && entity.isCompleted) {
            // Age 6 Robotic Lab: Fighter Robot
            this.addTrainButton(grid, entity, '🤖', 'Fighter Robot', 'fighterrobot', { gold: 500, stone: 300 }, 'Heavy sci-fi infantry with lasers.');
        } else if (entity.type === 'airport' && entity.isCompleted) {
            // Age 6 Airport Strip: Plane & Helicopter
            this.addTrainButton(grid, entity, '🚁', 'Helicopter', 'helicopter', { gold: 800, stone: 400 }, 'Hovering air unit with rapid fire.');
            this.addTrainButton(grid, entity, '✈️', 'Fighter Plane', 'fighterplane', { gold: 1200, stone: 600 }, 'Fast strafing flying vehicle.');
        } else if (entity.type === 'fishmarket' && entity.isCompleted) {
            // Age 1 Fish Market: Fish Boat & War Ship
            this.addTrainButton(grid, entity, '⛵', 'Fish Boat', 'fishboat', { wood: 50 }, 'Gathers food from deep water fish zones.');
            this.addTrainButton(grid, entity, '🚢', 'War Ship', 'warship', { wood: 150, gold: 50 }, 'Naval cannon ship to control the seas.');
            this.addTrainButton(grid, entity, '⛴️', 'Transport Boat', 'transportboat', { wood: 200 }, 'Transports up to 10 units across water.');
        } else if (entity.type === 'transportboat') {
            this.addCommandButton(grid, '⏏️', 'Unload', () => {
                if (this.network) {
                    this.network.sendCommand({ type: 'UNLOAD', faction: this.localFaction, unitId: entity.id });
                } else {
                    this.processCommand({ type: 'UNLOAD', faction: this.localFaction, unitId: entity.id });
                }
            });
            const p = document.createElement('p');
            p.textContent = `Loaded: ${entity.loadedEntities ? entity.loadedEntities.length : 0}/10`;
            p.style.fontSize = '0.8rem';
            p.style.gridColumn = 'span 4';
            p.style.color = '#fff';
            grid.appendChild(p);
        } else if (['soldier','archer','knight','spearman','crossbowman','paladin','elitearcher','champion','titan','warelephant','fighterrobot','helicopter','fighterplane','warship'].includes(entity.type)) {
            // Auto-Hunt for all military units
            const autoBtn = document.createElement('button');
            autoBtn.className = 'cmd-btn' + (entity.autoMode ? ' active-cmd' : '');
            autoBtn.innerHTML = `<span class="cmd-icon">🗺️</span> Auto-Hunt`;
            autoBtn.innerHTML += `
                <div class="tooltip">
                    <h5>Auto-Hunt Mode</h5>
                    <p>Toggle auto-hunt for enemies.</p>
                </div>
            `;
            autoBtn.addEventListener('click', () => {
                const next = !entity.autoMode;
                const cmd = { type: 'AUTO_MODE', faction: this.localFaction, unitIds: [entity.id], enable: next };
                if (this.network) this.network.sendCommand(cmd);
                else this.processCommand(cmd);
                
                audio.playClick();
                this.drawCommandsCard(entity);
            });
            grid.appendChild(autoBtn);
        }

        // Add Delete Button universally
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'cmd-btn';
        deleteBtn.innerHTML = `<span class="cmd-icon">🗑️</span> Delete`;
        deleteBtn.innerHTML += `
            <div class="tooltip">
                <h5>Delete</h5>
                <p>Destroy selected. Cannot be undone. (Hotkey: Del)</p>
            </div>
        `;
        deleteBtn.style.border = '1px solid #ef4444';
        deleteBtn.addEventListener('click', () => {
            if (this.input) this.input.deleteSelectedEntities();
        });
        grid.appendChild(deleteBtn);
    }

    // Helper: adds a train-unit button to the command grid
    addTrainButton(grid, entity, icon, label, unitType, costs, desc) {
        const btn = document.createElement('button');
        btn.className = 'cmd-btn';
        const r = this.playerResources;
        const canAfford = (r.food >= (costs.food || 0)) && (r.wood >= (costs.wood || 0)) &&
                          (r.gold >= (costs.gold || 0)) && (r.stone >= (costs.stone || 0));
        if (!canAfford) btn.classList.add('disabled');

        const costStr = Object.entries(costs).filter(([,v]) => v > 0).map(([k,v]) => {
            const icons = { food: '🌾', wood: '🪓', gold: '🪙', stone: '🪨' };
            return `${icons[k]||''} ${v}`;
        }).join(' ');

        btn.innerHTML = `
            <span class="cmd-icon">${icon}</span>
            <span class="cmd-label">Train ${label}</span>
            <span class="cmd-cost-inline ${canAfford ? '' : 'insufficient'}">${costStr}</span>
            <div class="tooltip"><h5>${label}</h5><p>${desc}</p></div>
        `;

        btn.addEventListener('click', () => {
            const popCurrent = this.entities.filter(e => !e.dead && e.faction === 'player' && e.isUnit).length;
            const canNow = (r.food >= (costs.food||0)) && (r.wood >= (costs.wood||0)) &&
                           (r.gold >= (costs.gold||0)) && (r.stone >= (costs.stone||0)) && popCurrent < this.playerPopCap;
            if (canNow) {
                r.food -= (costs.food || 0);
                r.wood -= (costs.wood || 0);
                r.gold -= (costs.gold || 0);
                r.stone -= (costs.stone || 0);
                this.network.sendCommand({ type: 'TRAIN', faction: this.localFaction, buildingId: entity.id, unitType: unitType });
                audio.playClick();
                this.updateHUD();
            } else {
                audio.playOrder();
            }
        });
        grid.appendChild(btn);
    }

    // Returns array of building definitions available at current age for the command panel
    getAvailableBuildingsForUI() {
        const structures = [];
        const r = this.playerResources;
        for (let age = 1; age <= this.playerAge; age++) {
            const ageData = this.AGE_DATA[age];
            if (!ageData) continue;
            ageData.buildings.forEach(b => {
                structures.push({
                    id: b.id,
                    label: b.label,
                    icon: b.icon,
                    desc: b.desc,
                    cost: b.cost,
                    canAfford: () => r.food >= b.res.food && r.wood >= b.res.wood && r.gold >= b.res.gold && r.stone >= b.res.stone
                });
            });
        }
        return structures;
    }

    // ===== AGE ADVANCEMENT SYSTEM =====
    checkAgeAdvancement() {
        if (this.playerAge >= 6) return; // Already at Sci-Fi Age

        const ageData = this.AGE_DATA[this.playerAge];
        if (!ageData || !ageData.advanceRequires || ageData.advanceRequires.length === 0) return;

        // Check if all required building types are built (completed)
        const playerBuildings = this.entities.filter(e => !e.dead && e.faction === this.localFaction && e.isBuilding && e.isCompleted);
        const builtTypes = new Set(playerBuildings.map(b => b.type));

        const allBuilt = ageData.advanceRequires.every(req => builtTypes.has(req));
        if (!allBuilt) return;

        // Check cost
        const cost = ageData.advanceCost;
        if (cost) {
            if (this.playerResources.food < cost.food || this.playerResources.wood < cost.wood ||
                this.playerResources.gold < cost.gold || this.playerResources.stone < cost.stone) {
                return; // Can't afford yet
            }
            // Deduct
            this.playerResources.food -= cost.food;
            this.playerResources.wood -= cost.wood;
            this.playerResources.gold -= cost.gold;
            this.playerResources.stone -= cost.stone;
        }

        this.playerAge++;
        this.showAgeBanner(this.playerAge);
        audio.playAgeAdvance();
        this.setAgeAtmosphere(this.playerAge);
        this.updateTopBar();
    }

    showAgeBanner(age) {
        const banner = document.getElementById('age-banner');
        const title = document.getElementById('age-banner-title');
        const icon = document.getElementById('age-banner-icon');
        if (!banner || !title || !icon) return;

        title.textContent = this.AGE_NAMES[age];
        icon.textContent = this.AGE_ICONS[age];
        banner.classList.remove('hidden');
        banner.style.animation = 'none';
        banner.offsetHeight; // force reflow
        banner.style.animation = '';

        // Auto-hide after 4s
        setTimeout(() => { banner.classList.add('hidden'); }, 4200);
    }

    setAgeAtmosphere(age) {
        if (!this.scene) return;
        // Sky, fog, and lighting adjustments per age
        const themes = {
            1: { sky: 0x87CEEB, fog: 0xc8d6e5, fogNear: 50, fogFar: 120, ambientColor: 0x606080, ambientIntensity: 0.5, dirColor: 0xffffff, dirIntensity: 0.8 },
            2: { sky: 0x6CA6CD, fog: 0xb0c4de, fogNear: 55, fogFar: 130, ambientColor: 0x707090, ambientIntensity: 0.55, dirColor: 0xffe8c0, dirIntensity: 0.85 },
            3: { sky: 0x4B6587, fog: 0x8899aa, fogNear: 45, fogFar: 115, ambientColor: 0x505070, ambientIntensity: 0.45, dirColor: 0xddc8a0, dirIntensity: 0.9 },
            4: { sky: 0x2C3E50, fog: 0x5a6a7a, fogNear: 40, fogFar: 110, ambientColor: 0x404060, ambientIntensity: 0.4, dirColor: 0xffd700, dirIntensity: 1.0 },
            5: { sky: 0x1a0a2e, fog: 0x2d1b4e, fogNear: 35, fogFar: 100, ambientColor: 0x3a1a5e, ambientIntensity: 0.35, dirColor: 0xff88cc, dirIntensity: 1.2 }
        };
        const t = themes[age] || themes[1];

        // Update background
        this.scene.background = new THREE.Color(t.sky);
        this.scene.fog = new THREE.Fog(t.fog, t.fogNear, t.fogFar);

        // Update lights
        this.scene.traverse(child => {
            if (child.isAmbientLight) {
                child.color.set(t.ambientColor);
                child.intensity = t.ambientIntensity;
            }
            if (child.isDirectionalLight) {
                child.color.set(t.dirColor);
                child.intensity = t.dirIntensity;
            }
        });
    }

    checkVictoryConditions() {
        const playerTC = this.entities.find(e => !e.dead && e.faction === this.localFaction && e.type === 'towncenter');
        const enemyTC = this.entities.find(e => !e.dead && e.faction !== this.localFaction && e.faction !== 'neutral' && e.faction !== 'nature' && e.type === 'towncenter');

        if (!enemyTC) {
            this.endMatch(true);
        } else if (!playerTC) {
            this.endMatch(false);
        }
    }

    endMatch(isVictory) {
        this.gameOver = true;
        this.dom.gameOverScreen.classList.remove('hidden');
        this.dom.hud.classList.add('hidden');
        audio.stopAmbient();

        if (isVictory) {
            this.dom.gameOverTitle.textContent = "VICTORY!";
            this.dom.gameOverTitle.className = "victory-text";
            this.dom.gameOverMsg.textContent = "You have completely crushed the enemy and established your empire!";
            audio.playWin();
        } else {
            this.dom.gameOverTitle.textContent = "YOU LOST";
            this.dom.gameOverTitle.className = "defeat-text";
            this.dom.gameOverMsg.textContent = "The opponent has destroyed your Town Center. You lost!";
            audio.playLose();
        }

        // Output match summaries
        const mins = Math.floor(this.matchTime / 60);
        const secs = Math.floor(this.matchTime % 60);
        document.getElementById('stat-time').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        document.getElementById('stat-units').textContent = this.stats.unitsTrained;
        document.getElementById('stat-buildings').textContent = this.stats.buildingsBuilt;
        document.getElementById('stat-kills').textContent = this.stats.enemiesKilled;
    }

    // ===== SHOW ALL AGES DEMO =====
    runAllAgesDemo() {
        if (this._showcaseRunning) return;
        this._showcaseRunning = true;

        this.playerResources = { food: 999999, wood: 999999, gold: 999999, stone: 999999 };
        this.playerPopCap = 200;
        this.updateHUD();

        if (this.dom.topBar) this.dom.topBar.style.display = 'none';
        if (this.dom.bottomBar) this.dom.bottomBar.style.display = 'none';
        
        const tc = this.entities.find(e => !e.dead && e.faction === this.localFaction && e.type === 'towncenter');
        const cx = tc ? tc.position.x : -22;
        const cz = tc ? tc.position.z : 22;

        const demoAges = [
            { age: 1, duration: 6000 },
            { age: 2, duration: 6000 },
            { age: 3, duration: 6000 },
            { age: 4, duration: 6000 },
            { age: 5, duration: 15000 }, // War scene
            { age: 6, duration: 120000 }, // Ultimate war scene, 2 minutes
            { age: 6, duration: 60000, interactive: true } // 1 minute interaction
        ];

        const allBuildingsByAge = {
            1: ['towncenter', 'house', 'barracks'],
            2: ['archeryrange', 'blacksmith', 'farm', 'lumbercamp'],
            3: ['stable', 'market', 'miningcamp'],
            4: ['siege_workshop', 'castle', 'monastery'],
            5: ['university', 'factory'],
            6: ['airport']
        };

        const executeDemoAge = (index) => {
            if (index >= demoAges.length) {
                alert("The Demo has finished! The game will now restart to let you play.");
                window.location.reload();
                return;
            }

            const step = demoAges[index];
            
            if (step.interactive) {
                if (this.dom.topBar) this.dom.topBar.style.display = 'flex';
                if (this.dom.bottomBar) this.dom.bottomBar.style.display = 'flex';
                this.cameraTarget.copy(new THREE.Vector3(cx, 0, cz));
                this.camera.position.set(cx, 40, cz + 45);
                this.camera.lookAt(this.cameraTarget);
                
                setTimeout(() => {
                    executeDemoAge(index + 1);
                }, step.duration);
                return;
            }
            
            const age = step.age;

            this.playerAge = age;
            this.showAgeBanner(age);
            audio.playAgeAdvance();
            this.setAgeAtmosphere(age);

            const buildings = allBuildingsByAge[age] || [];
            buildings.forEach((bType, i) => {
                const angle = (i / buildings.length) * Math.PI * 2 + (age * 0.5);
                const radius = 10 + age * 2;
                const bx = cx + Math.cos(angle) * radius;
                const bz = cz + Math.sin(angle) * radius;
                const b = this.spawnBuilding(this.localFaction, bType, bx, bz);
                if (b && typeof b.completeConstruction === 'function') {
                    b.completeConstruction();
                }
            });

            if (age >= 5) {
                this.spawnDemoWarScene(age, cx, cz);
            }

            const lookAt = new THREE.Vector3(cx, 0, cz);
            const camDist = 20 + age * 5;
            
            let elapsedTime = 0;
            const camTick = setInterval(() => {
                elapsedTime += 100;
                if (elapsedTime >= step.duration || !this._showcaseRunning) {
                    clearInterval(camTick);
                    return;
                }
                const orbitAngle = (elapsedTime / 10000) * (age >= 5 ? 0.5 : 1.0); 
                const camX = cx + Math.cos(orbitAngle) * camDist;
                const camZ = cz + Math.sin(orbitAngle) * camDist;
                
                this.camera.position.lerp(new THREE.Vector3(camX, camDist * 0.8, camZ), 0.1);
                this.camera.lookAt(lookAt);
            }, 100);

            setTimeout(() => {
                clearInterval(camTick);
                executeDemoAge(index + 1);
            }, step.duration);
        };

        executeDemoAge(0);
    }

    spawnDemoWarScene(age, cx, cz) {
        const enemyTc = this.entities.find(e => !e.dead && e.faction !== this.localFaction && e.faction !== 'neutral' && e.faction !== 'nature' && e.type === 'towncenter');
        const ex = enemyTc ? enemyTc.position.x : cx + 40;
        const ez = enemyTc ? enemyTc.position.z : cz + 40;

        const pUnits5 = ['champion', 'paladin', 'cannon', 'titan'];
        const eUnits5 = ['champion', 'paladin', 'cannon', 'titan'];
        
        const pUnits6 = ['fighterrobot', 'helicopter', 'fighterplane', 'titan'];
        const eUnits6 = ['fighterrobot', 'helicopter', 'fighterplane', 'titan'];

        const pUnits = age === 6 ? pUnits6 : pUnits5;
        const eUnits = age === 6 ? eUnits6 : eUnits5;

        const midX = (cx + ex) / 2;
        const midZ = (cz + ez) / 2;

        for (let i = 0; i < 15; i++) {
            const pType = pUnits[Math.floor(Math.random() * pUnits.length)];
            const px = midX - 10 + (Math.random() - 0.5) * 15;
            const pz = midZ - 10 + (Math.random() - 0.5) * 15;
            const pEnt = this.spawnUnit(this.localFaction, pType, px, pz);
            if (pEnt) {
                pEnt.targetPos.set(ex, 0, ez);
                pEnt.state = 'MOVING';
            }

            const eType = eUnits[Math.floor(Math.random() * eUnits.length)];
            const epx = midX + 10 + (Math.random() - 0.5) * 15;
            const epz = midZ + 10 + (Math.random() - 0.5) * 15;
            const eEnt = this.spawnUnit('enemy', eType, epx, epz);
            if (eEnt) {
                eEnt.targetPos.set(cx, 0, cz);
                eEnt.state = 'MOVING';
            }
        }
    }

    // ===== DEBUG: AGE SHOWCASE =====
    // Press T to auto-build all buildings, advance through all ages, and show the results
    runAgeShowcase() {
        if (this._showcaseRunning) return;
        this._showcaseRunning = true;

        // 1. Give infinite resources
        this.playerResources = { food: 999999, wood: 999999, gold: 999999, stone: 999999 };
        this.playerPopCap = 200;
        this.updateHUD();

        // Find player TC position as center
        const tc = this.entities.find(e => !e.dead && e.faction === this.localFaction && e.type === 'towncenter');
        const cx = tc ? tc.position.x : -22;
        const cz = tc ? tc.position.z : 22;

        // All buildings grouped by age
        const AGE_BUILDINGS = {
            1: ['house', 'farm', 'barracks', 'tower', 'fishmarket', 'woodwall', 'stonewall'],
            2: ['stable', 'market', 'blacksmith'],
            3: ['castle', 'siegeworkshop', 'monastery'],
            4: ['university', 'fortress', 'treasury'],
            5: ['temple', 'titanforge', 'wonder'],
            6: ['roboticlab', 'airport']
        };

        // Units to spawn from each age's buildings
        const AGE_UNITS = {
            1: ['soldier', 'archer', 'fishboat', 'warship'],
            2: ['knight', 'spearman'],
            3: ['crossbowman', 'siegeram', 'monk'],
            4: ['paladin', 'cannon', 'elitearcher'],
            5: ['titan', 'warelephant', 'champion'],
            6: ['fighterrobot', 'helicopter', 'fighterplane']
        };

        // Building placement layout - radial around TC
        let buildingIndex = 0;
        const allBuiltByAge = {};

        const placeAndCompleteBuildings = (age) => {
            const types = AGE_BUILDINGS[age];
            if (!types) return;

            const startAngle = (age - 1) * (Math.PI * 2 / 5);
            const radius = 8 + (age - 1) * 4; // expanding circles
            allBuiltByAge[age] = [];

            types.forEach((type, i) => {
                let currentAngle = startAngle + (i * 0.5);
                let currentRadius = radius;
                let bx = cx + Math.cos(currentAngle) * currentRadius;
                let bz = cz + Math.sin(currentAngle) * currentRadius;
                let validPlacement = false;

                while (!validPlacement && currentRadius < 60) {
                    const elevation = this.world.getElevationAtCoords(bx, bz);
                    if (type === 'fishmarket' || elevation >= 0.25) {
                        validPlacement = true;
                    } else {
                        currentAngle += 0.5;
                        if (currentAngle > Math.PI * 2) {
                            currentAngle -= Math.PI * 2;
                            currentRadius += 2.0;
                        }
                        bx = cx + Math.cos(currentAngle) * currentRadius;
                        bz = cz + Math.sin(currentAngle) * currentRadius;
                    }
                }

                // Health table
                const HP_TABLE = {
                    'towncenter': 800, 'barracks': 400, 'tower': 300, 'house': 180, 'farm': 150, 'fishmarket': 250,
                    'stable': 350, 'market': 250, 'blacksmith': 300,
                    'castle': 600, 'siegeworkshop': 300, 'monastery': 280,
                    'university': 350, 'fortress': 700, 'treasury': 400,
                    'temple': 500, 'titanforge': 550, 'wonder': 1500,
                    'roboticlab': 800, 'airport': 1000
                };
                const maxHealth = HP_TABLE[type] || 200;

                let building;
                if (type === 'tower') {
                    building = new Tower(this.getNewEntityId(), 'player', bx, bz);
                    building.mesh = this.builders.createTower('player');
                } else {
                    building = new Building(this.getNewEntityId(), 'player', type, maxHealth, bx, bz, {});
                    const MESH_MAP = {
                        'house': 'createHouse', 'barracks': 'createBarracks', 'farm': 'createFarm', 'fishmarket': 'createFishMarket',
                        'towncenter': 'createTownCenter',
                        'stable': 'createStable', 'market': 'createMarket', 'blacksmith': 'createBlacksmith',
                        'castle': 'createCastle', 'siegeworkshop': 'createSiegeWorkshop', 'monastery': 'createMonastery',
                        'university': 'createUniversity', 'fortress': 'createFortress', 'treasury': 'createTreasury',
                        'temple': 'createTemple', 'titanforge': 'createTitanForge', 'wonder': 'createWonder',
                        'roboticlab': 'createRoboticLab', 'airport': 'createAirport'
                    };
                    const fn = MESH_MAP[type];
                    if (fn && this.builders[fn]) {
                        building.mesh = (type === 'farm') ? this.builders[fn]() : this.builders[fn]('player');
                    }
                    if (type === 'farm') building.radius = 1.0;
                }

                // Instantly complete
                building.buildProgress = 1.0;
                building.isCompleted = true;
                building.health = maxHealth;
                building.maxHealth = maxHealth;
                const elevation = this.world.getElevationAtCoords(bx, bz);
                building.mesh.position.set(bx, elevation, bz);
                building.mesh.scale.set(1, 1, 1);
                building.position.set(bx, elevation, bz);

                this.scene.add(building.mesh);
                this.entities.push(building);
                allBuiltByAge[age].push(building);
                buildingIndex++;
            });

            // Spawn sample units nearby
            const units = AGE_UNITS[age];
            if (units) {
                units.forEach((unitType, i) => {
                    const angle = startAngle + (i * 0.6) + 0.2;
                    const ur = radius + 3;
                    const ux = cx + Math.cos(angle) * ur;
                    const uz = cz + Math.sin(angle) * ur;
                    this.spawnUnit('player', unitType, ux, uz);
                });
            }
        };

        // Run showcase: place age 1 buildings, then advance, repeat...
        const showcaseAge = (age) => {
            if (age > 6) {
                this._showcaseRunning = false;
                return;
            }

            // Reset resources each time
            this.playerResources = { food: 999999, wood: 999999, gold: 999999, stone: 999999 };

            // Place all buildings for this age
            placeAndCompleteBuildings(age);

            // Force age advancement (skip cost check)
            if (age < 6 && this.playerAge < age + 1) {
                this.playerAge = age + 1;
                this.showAgeBanner(this.playerAge);
                audio.playAgeAdvance();
                this.setAgeAtmosphere(this.playerAge);
            } else if (age === 6 && this.playerAge < 6) {
                this.playerAge = 6;
                this.showAgeBanner(6);
                audio.playAgeAdvance();
                this.setAgeAtmosphere(6);
            }

            this.updateHUD();

            // Pan camera to look at this age's buildings
            const ageBuildings = allBuiltByAge[age];
            if (ageBuildings && ageBuildings.length > 0) {
                const midBuilding = ageBuildings[Math.floor(ageBuildings.length / 2)];
                const lookAt = midBuilding.position.clone();
                // Animate camera
                const camDist = 15 + age * 3;
                const camTarget = new THREE.Vector3(lookAt.x - camDist * 0.5, camDist * 0.8, lookAt.z + camDist * 0.5);
                this.camera.position.lerp(camTarget, 0.8);
                this.camera.lookAt(lookAt);
            }

            // Schedule next age
            setTimeout(() => showcaseAge(age + 1), 5000);
        };

        // Start showcase from age 1
        showcaseAge(1);
    }

    async saveGame() {
        if (this.network && this.network.isClient) {
            alert("Only the Host can save multiplayer games.");
            return;
        }

        const saveData = {
            matchTime: this.matchTime,
            playerAge: this.playerAge,
            enemyAge: this.enemyAge,
            playerResources: this.playerResources,
            worldSeedX: this.world.seedX,
            worldSeedZ: this.world.seedZ,
            entities: this.entities.map(e => ({
                id: e.id,
                type: e.type,
                faction: e.faction,
                health: e.health,
                maxHealth: e.maxHealth,
                capacity: e.capacity,
                x: e.position ? e.position.x : 0,
                z: e.position ? e.position.z : 0,
                yRot: (e.mesh && e.mesh.rotation) ? e.mesh.rotation.y : 0,
                isCompleted: e.isCompleted !== undefined ? e.isCompleted : true,
                buildProgress: e.buildProgress || 0
            })),
            aiPlayers: this.aiPlayers.map(ai => ({
                faction: ai.faction,
                resources: ai.resources,
                age: ai.age
            }))
        };

        const d = new Date();
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(d.getHours()).padStart(2, '0')}-${String(d.getMinutes()).padStart(2, '0')}-${String(d.getSeconds()).padStart(2, '0')}`;
        const suggestedName = `age_of_now_save_${dateStr}_${timeStr}.json`;

        try {
            if (window.showSaveFilePicker) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: suggestedName,
                    types: [{
                        description: 'JSON Save File',
                        accept: {'application/json': ['.json']},
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(JSON.stringify(saveData));
                await writable.close();
            } else {
                const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = suggestedName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.log("Save cancelled or failed:", err);
        }
    }

    loadGame(data, isMultiplayer = false) {
        if (this.dom.startScreen) this.dom.startScreen.classList.add('hidden');
        this.dom.hud.classList.remove('hidden');

        // Setup Player Info
        if (!isMultiplayer) {
            this.localFaction = 'player';
        }
        
        this.playerName = 'Player 1';
        const nameInput = document.getElementById('player-name-input');
        if (nameInput && nameInput.value.trim()) {
            this.playerName = nameInput.value.trim();
        }
        const hudName = document.getElementById('hud-player-name');
        if (hudName) hudName.textContent = this.playerName;
        const flag = document.getElementById('hud-color-flag');
        if (flag) flag.style.backgroundColor = '#2563eb';

        // Clear existing state
        this.entities.forEach(ent => {
            if (ent.mesh) this.scene.remove(ent.mesh);
            if (ent.healthBar) this.scene.remove(ent.healthBar);
            if (ent.model) this.scene.remove(ent.model);
            if (ent.projectileMesh) this.scene.remove(ent.projectileMesh);
        });
        this.entities = [];
        this.selectedEntities = [];

        // Apply loaded state
        this.matchTime = data.matchTime || 0;
        this.playerAge = data.playerAge || 1;
        this.enemyAge = data.enemyAge || 1;
        if (data.playerResources) {
            this.playerResources = data.playerResources;
        }

        // Generate World
        this.world = new WorldMap(this.scene, this, data.worldSeedX, data.worldSeedZ, 'random');
        this.world.generate();

        // Clear the newly generated resources/animals to avoid duplication
        this.entities.forEach(ent => {
            if (ent.mesh) this.scene.remove(ent.mesh);
            if (ent.healthBar) this.scene.remove(ent.healthBar);
            if (ent.model) this.scene.remove(ent.model);
        });
        this.entities = [];

        // Restore Entities
        let maxId = 0;
        if (data.entities) {
            data.entities.forEach(eData => {
                if (eData.id > maxId && eData.id < 1000) {
                    maxId = eData.id;
                }
                
                let ent;
                if (['towncenter', 'barracks', 'tower', 'farm'].includes(eData.type)) {
                    ent = new Building(eData.id, eData.faction, eData.type, eData.maxHealth, eData.x, eData.z, {});
                    ent.isCompleted = eData.isCompleted;
                    ent.buildProgress = eData.buildProgress || 0;
                    
                    if (eData.type === 'towncenter') ent.mesh = this.builders.createTownCenter(eData.faction);
                    else if (eData.type === 'barracks') ent.mesh = this.builders.createBarracks(eData.faction);
                    else if (eData.type === 'tower') ent.mesh = this.builders.createTower(eData.faction);
                    else if (eData.type === 'farm') ent.mesh = this.builders.createFarm(eData.faction);

                    if (ent.mesh) {
                        ent.alignMesh();
                        ent.mesh.rotation.y = eData.yRot || 0;
                        this.scene.add(ent.mesh);
                        if (!ent.isCompleted && ent.mesh.material) {
                            ent.mesh.material.transparent = true;
                            ent.mesh.material.opacity = 0.5;
                            ent.mesh.position.y = -2 + (ent.buildProgress / 100) * 2;
                        }
                    }
                } else if (['villager', 'soldier', 'archer'].includes(eData.type)) {
                    if (eData.type === 'villager') ent = new Villager(eData.id, eData.faction, eData.x, eData.z);
                    else if (eData.type === 'soldier') ent = new Soldier(eData.id, eData.faction, eData.x, eData.z);
                    else if (eData.type === 'archer') ent = new Archer(eData.id, eData.faction, eData.x, eData.z);
                    ent.state = 'idle';
                    if (eData.type === 'villager') ent.mesh = this.builders.createVillager(eData.faction);
                    else if (eData.type === 'soldier') ent.mesh = this.builders.createSoldier(eData.faction);
                    else if (eData.type === 'archer') ent.mesh = this.builders.createArcher(eData.faction);

                    if (ent.mesh) {
                        ent.alignMesh();
                        ent.mesh.rotation.y = eData.yRot || 0;
                        this.scene.add(ent.mesh);
                    }
                } else if (['deer', 'bear'].includes(eData.type)) {
                    ent = new Animal(eData.id, eData.type, eData.maxHealth, eData.x, eData.z, eData.type === 'deer' ? 12 : 18);
                    ent.state = 'idle';
                    if (eData.type === 'deer') ent.mesh = this.builders.createDeer();
                    else ent.mesh = this.builders.createBear();
                    
                    if (ent.mesh) {
                        ent.alignMesh();
                        ent.mesh.rotation.y = eData.yRot || 0;
                        this.scene.add(ent.mesh);
                    }
                } else if (['tree', 'gold', 'stone', 'forage', 'fishzone'].includes(eData.type)) {
                    ent = new NaturalResource(eData.id, eData.type, eData.x, eData.z, eData.capacity || eData.maxHealth);
                    this.scene.add(ent.mesh);
                }
                
                if (ent) {
                    ent.health = eData.health;
                    this.entities.push(ent);
                }
            });
        }
        
        this.entityIdCounter = maxId + 1;

        // Setup AI
        this.aiPlayers = [];
        if (data.aiPlayers && (!isMultiplayer || (this.network && this.network.isHost))) {
            data.aiPlayers.forEach(aiData => {
                let aiBase = { x: 40, z: -40 };
                const aiTC = this.entities.find(e => e.faction === aiData.faction && e.type === 'towncenter');
                if (aiTC && aiTC.position) {
                    aiBase = { x: aiTC.position.x, z: aiTC.position.z };
                }
                const ai = new EnemyAI(this, aiData.faction, aiBase, 'normal');
                ai.resources = aiData.resources || { food: 0, wood: 0, gold: 0, stone: 0, pop: 0 };
                ai.age = aiData.age || 1;
                this.aiPlayers.push(ai);
            });
        }

        // Camera positioning
        const pTC = this.entities.find(e => e.type === 'towncenter' && e.faction === 'player');
        if (pTC) {
            this.cameraTarget.copy(pTC.position);
            this.camera.position.set(pTC.position.x, 35, pTC.position.z + 40);
        }

        this.gameStarted = true;
        this.updateHUD();
    }
}

// Instantiate and start
const game = new GameController();
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        game.init();
    });
} else {
    game.init();
}
// Let loop hook access resources drops
window.game = game;

// Press F7 to run age showcase demo
document.addEventListener('keydown', (e) => {
    if (e.key === 'F7') {
        if (!game._showcaseRunning) {
            game.runAgeShowcase();
        }
    }
});

export { game };
