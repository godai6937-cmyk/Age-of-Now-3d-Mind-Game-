// Game Map and World Generation — Flat Plane Terrain with biome coloring, animated water, sky dome
import { GameEntity, meshBuilders, materials } from './entities.js?v=62';

// Natural Resource Classes
export class NaturalResource extends GameEntity {
    constructor(id, type, x, z, capacity) {
        super(id, 'nature', type, capacity, x, z);
        this.isResource = true;
        this.capacity = capacity;
        this.radius = 0.6;

        if (type === 'tree') {
            this.mesh = meshBuilders.createTree();
            this.radius = 0.4;
        } else if (type === 'gold') {
            this.mesh = meshBuilders.createGoldNode();
            this.radius = 0.7;
        } else if (type === 'stone') {
            this.mesh = meshBuilders.createStoneNode();
            this.radius = 0.7;
        } else if (type === 'forage') {
            this.mesh = meshBuilders.createForageNode();
            this.radius = 0.5;
        } else if (type === 'fishzone') {
            this.mesh = meshBuilders.createFishZone();
            this.radius = 1.5;
        }

        this.mesh.position.copy(this.position);
    }
    
    update(dt) {
        if (this.type === 'fishzone' && this.mesh) {
            const time = performance.now() * 0.001;
            this.mesh.children.forEach(child => {
                if (child.userData && child.userData.isFish) {
                    // Fish jumping animation
                    const offset = child.userData.jumpOffset;
                    const speed = child.userData.speed;
                    // Jump up and down
                    child.position.y = Math.sin(time * speed * 2.0 + offset) * 0.4 - 0.1;
                    child.rotation.x = Math.PI / 2 + Math.cos(time * speed * 2.0 + offset) * 0.5;
                }
            });
        }
    }
}

// Simple Perlin-like noise for terrain coloring
function pseudoNoise(x, z) {
    const n = Math.sin(x * 0.37 + z * 0.71) * 43758.5453;
    return n - Math.floor(n);
}

// Multi-octave noise for realistic terrain
function fbmNoise(x, z, octaves = 4) {
    let value = 0;
    let amplitude = 1.0;
    let frequency = 1.0;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
        value += amplitude * (Math.sin(x * frequency * 0.05 + z * frequency * 0.03) *
                              Math.cos(z * frequency * 0.04 - x * frequency * 0.02) * 0.5 + 0.5);
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value / maxValue;
}

export class PRNG {
    constructor(seed) {
        this.seed = seed;
    }
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

export class WorldMap {
    constructor(scene, game, seedX, seedZ, mapType = 'random') {
        this.scene = scene;
        this.game = game;
        this.mapType = mapType;
        // Flat plane settings
        this.planeSize = 250;
        this.mapSize = this.planeSize;
        this.ground = null;
        this.materials = materials;
        
        // Random map seed
        this.seedX = seedX !== undefined ? seedX : Math.random() * 10000;
        this.seedZ = seedZ !== undefined ? seedZ : Math.random() * 10000;
        this.prng = new PRNG(Math.floor((this.seedX + this.seedZ) * 1000));
        
        this.waterMesh = null;
        this.waterTime = 0;
        this.grassTufts = [];
        this.cloudLayers = [];
        this.cloudTime = 0;
        // Store elevation data for querying
        this._elevationData = null;
        this._elevationSegments = 200;

        // Map layout parameters
        this.layout = {
            r1z: this.mapType === 'random' ? (this.prng.next() * 100 - 50) : 10,
            r2x: this.mapType === 'random' ? (this.prng.next() * 100 - 50) : -5,
            r1amp: this.mapType === 'random' ? (this.prng.next() * 20 + 5) : 15,
            r2amp: this.mapType === 'random' ? (this.prng.next() * 30 + 10) : 20,
            mountains: this.mapType === 'random' ? (this.prng.next() * 20 + 40) : 60
        };
    }

    getRawElevation(x, z) {
        // Procedural elevation using noise — flat plane approach
        const nx = x + this.seedX;
        const nz = z + this.seedZ;

        const n1 = fbmNoise(nx, nz, 4);
        const n2 = fbmNoise(nx * 1.5 + 100, nz * 1.5 + 100, 3) * 0.5;
        
        let elevation = (n1 + n2 - 0.7) * 3.0;
        
        // Mountain ranges in corners
        const distFromCenter = Math.sqrt(x * x + z * z);
        const mountainFactor = Math.max(0, distFromCenter - this.layout.mountains) / 40;
        if (mountainFactor > 0) {
            const mountainNoise = fbmNoise(nx * 2, nz * 2, 3);
            elevation += mountainFactor * mountainNoise * 4.0;
        }
        
        // River valleys — two meandering SHALLOW rivers (fordable by units)
        // Rivers are shallow dips, NOT deep water. Units can walk across.
        const river1Dist = Math.abs(z - Math.sin(nx * 0.05) * this.layout.r1amp - this.layout.r1z);
        const river2Dist = Math.abs(x - Math.cos(nz * 0.04) * this.layout.r2amp - this.layout.r2x);
        if (river1Dist < 3) {
            const riverDepth = -0.05 + river1Dist * 0.08; // Shallow: max depth -0.05 (above -0.1 threshold)
            elevation = Math.min(elevation, riverDepth);
        }
        if (river2Dist < 3) {
            const riverDepth = -0.05 + river2Dist * 0.08;
            elevation = Math.min(elevation, riverDepth);
        }
        
        // Coastal lowlands at edges — only deep water at very edge
        const halfSize = this.planeSize / 2;
        const edgeDist = Math.min(
            halfSize - Math.abs(x),
            halfSize - Math.abs(z)
        );
        if (edgeDist < 10) {
            const coastFactor = edgeDist / 10;
            elevation = elevation * coastFactor + (-0.5) * (1 - coastFactor);
        }

        // === LAND BRIDGES: Ensure all land is connected ===
        // Main diagonal bridge connecting bases
        const distToBridge1 = Math.abs(x + z) / 1.414;
        if (distToBridge1 < 10) {
            const bridgeFactor = 1.0 - (distToBridge1 / 10);
            elevation = Math.max(elevation, 0.3 * bridgeFactor);
        }
        // Cross bridge (perpendicular to main)
        const distToBridge2 = Math.abs(x - z) / 1.414;
        if (distToBridge2 < 10) {
            const bridgeFactor = 1.0 - (distToBridge2 / 10);
            elevation = Math.max(elevation, 0.3 * bridgeFactor);
        }
        // Horizontal center bridge
        const distToBridgeH = Math.abs(z);
        if (distToBridgeH < 6) {
            const bridgeFactor = 1.0 - (distToBridgeH / 6);
            elevation = Math.max(elevation, 0.25 * bridgeFactor);
        }
        // Vertical center bridge
        const distToBridgeV = Math.abs(x);
        if (distToBridgeV < 6) {
            const bridgeFactor = 1.0 - (distToBridgeV / 6);
            elevation = Math.max(elevation, 0.25 * bridgeFactor);
        }

        // Flatten areas around bases dynamically
        const smoothstep = (edge0, edge1, x) => {
            const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
            return t * t * (3 - 2 * t);
        };
        
        let totalBlend = 0.0;
        if (this.game && this.game.basePositions) {
            for (const faction in this.game.basePositions) {
                const pos = this.game.basePositions[faction];
                const d = Math.hypot(x - pos.x, z - pos.z);
                if (d < 25) {
                    const blend = 1.0 - smoothstep(10, 25, d);
                    totalBlend = Math.max(totalBlend, blend);
                }
            }
        } else {
            const dPlayer = Math.hypot(x - (-40), z - 40);
            const dEnemy = Math.hypot(x - 40, z - (-40));
            if (dPlayer < 25) totalBlend = Math.max(totalBlend, 1.0 - smoothstep(10, 25, dPlayer));
            if (dEnemy < 25) totalBlend = Math.max(totalBlend, 1.0 - smoothstep(10, 25, dEnemy));
        }
        
        const baseElevation = 0.35;
        
        if (totalBlend > 0) {
            elevation = elevation * (1.0 - totalBlend) + baseElevation * totalBlend;
        }
        
        return elevation;
    }

    getElevationAtCoords(x, z) {
        if (!this._elevationGrid) return this.getRawElevation(x, z);
        
        const halfSize = this.planeSize / 2;
        const cellSize = this.planeSize / this._elevationSegments;
        
        let gx = (x + halfSize) / cellSize;
        let gz = (z + halfSize) / cellSize;
        
        gx = Math.max(0, Math.min(this._elevationSegments, gx));
        gz = Math.max(0, Math.min(this._elevationSegments, gz));
        
        const col0 = Math.floor(gx);
        const row0 = Math.floor(gz);
        const col1 = Math.min(this._elevationSegments, col0 + 1);
        const row1 = Math.min(this._elevationSegments, row0 + 1);
        
        const tx = gx - col0;
        const tz = gz - row0;
        
        const h00 = this._elevationGrid[row0][col0];
        const h10 = this._elevationGrid[row0][col1];
        const h01 = this._elevationGrid[row1][col0];
        const h11 = this._elevationGrid[row1][col1];
        
        // Barycentric interpolation matching Three.js PlaneGeometry triangles
        // The quad is split by the diagonal from (0,1) to (1,0) (i.e. tx + tz = 1)
        if (tx + tz <= 1) {
            // Upper-left triangle (tx + tz <= 1): (0,0), (1,0), (0,1) -> h00, h10, h01
            return h00 + tx * (h10 - h00) + tz * (h01 - h00);
        } else {
            // Lower-right triangle (tx + tz > 1): (1,1), (0,1), (1,0) -> h11, h01, h10
            return h11 + (1 - tx) * (h01 - h11) + (1 - tz) * (h10 - h11);
        }
    }

    flattenArea(x, z, radius, targetElevation) {
        if (!this._elevationGrid || !this.ground) return;
        const halfSize = this.planeSize / 2;
        const cellSize = this.planeSize / this._elevationSegments;
        
        const startC = Math.max(0, Math.floor((x - radius + halfSize) / cellSize));
        const endC = Math.min(this._elevationSegments, Math.ceil((x + radius + halfSize) / cellSize));
        const startR = Math.max(0, Math.floor((z - radius + halfSize) / cellSize));
        const endR = Math.min(this._elevationSegments, Math.ceil((z + radius + halfSize) / cellSize));
        
        let changed = false;
        const posAttr = this.ground.geometry.attributes.position;
        for (let r = startR; r <= endR; r++) {
            for (let c = startC; c <= endC; c++) {
                const wx = (c * cellSize) - halfSize;
                const wz = (r * cellSize) - halfSize;
                const dist = Math.hypot(wx - x, wz - z);
                if (dist <= radius) {
                    this._elevationGrid[r][c] = targetElevation;
                    const vertexIndex = r * (this._elevationSegments + 1) + c;
                    posAttr.setY(vertexIndex, targetElevation);
                    changed = true;
                }
            }
        }
        
        if (changed) {
            posAttr.needsUpdate = true;
            this.ground.geometry.computeVertexNormals();
        }
    }

    generate() {
        // --- 1. SKY DOME ---
        this.createSkyDome();

        // --- 2. FLAT GROUND TERRAIN with PBR material ---
        this.createTerrain();

        // --- 3. ANIMATED WATER (plane) ---
        this.createWater();

        // --- 4. GRASS TUFTS & DECORATIVE ELEMENTS ---
        this.createGrassAndDecor();

        // --- 5. RESOURCE NODES ---
        this.createResources();

        // --- 6. BOUNDARY TREES ---
        this.createBoundary();
    }

    createCloudTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 26; i++) {
            const x = 60 + this.prng.next() * 392;
            const y = 40 + this.prng.next() * 160;
            const rx = 35 + this.prng.next() * 70;
            const ry = 18 + this.prng.next() * 34;
            const gradient = ctx.createRadialGradient(x, y, rx * 0.2, x, y, rx);
            gradient.addColorStop(0, 'rgba(255,255,255,0.92)');
            gradient.addColorStop(0.45, 'rgba(255,255,255,0.55)');
            gradient.addColorStop(1, 'rgba(255,255,255,0.0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(x, y, rx, ry, this.prng.next() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    createClouds() {
        const cloudTexture = this.createCloudTexture();
        const cloudCount = 7;

        for (let i = 0; i < cloudCount; i++) {
            const width = 70 + this.prng.next() * 55;
            const height = 26 + this.prng.next() * 18;
            const cloudGeo = new THREE.PlaneGeometry(width, height, 1, 1);
            const cloudMat = new THREE.MeshBasicMaterial({
                map: cloudTexture,
                transparent: true,
                opacity: 0.24 + this.prng.next() * 0.12,
                depthWrite: false,
                side: THREE.DoubleSide,
                color: new THREE.Color(0xf7fbff)
            });

            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            cloud.rotation.x = -Math.PI / 2;
            cloud.rotation.z = (this.prng.next() - 0.5) * 0.16;
            cloud.position.set(
                -120 + this.prng.next() * 240,
                26 + this.prng.next() * 10,
                -120 + this.prng.next() * 240
            );
            cloud.renderOrder = -1;
            cloud.userData = {
                speed: 1.4 + this.prng.next() * 2.2,
                drift: -0.4 + this.prng.next() * 0.8,
                baseOpacity: cloudMat.opacity,
                pulse: this.prng.next() * Math.PI * 2
            };

            this.scene.add(cloud);
            this.cloudLayers.push(cloud);
        }
    }

    createSkyDome() {
        const skyGeo = new THREE.SphereGeometry(320, 40, 20);
        const skyColors = [];
        const posAttr = skyGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            const y = posAttr.getY(i);
            const normalizedY = THREE.MathUtils.clamp((y + 320) / 640, 0, 1);
            const horizonGlow = THREE.MathUtils.smoothstep(1 - normalizedY, 0.0, 0.42);
            const r = THREE.MathUtils.lerp(0.97, 0.17, normalizedY) + horizonGlow * 0.05;
            const g = THREE.MathUtils.lerp(0.87, 0.45, normalizedY) + horizonGlow * 0.03;
            const b = THREE.MathUtils.lerp(0.74, 0.90, normalizedY);
            skyColors.push(r, g, b);
        }
        skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(skyColors, 3));

        const skyMat = new THREE.MeshBasicMaterial({
            vertexColors: true,
            side: THREE.BackSide,
            fog: false
        });
        const skyDome = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(skyDome);

        const hemiLight = new THREE.HemisphereLight(0xf6fbff, 0x5e7754, 0.82);
        this.scene.add(hemiLight);

        this.createClouds();
    }

    createTerrain() {
        const size = this.planeSize;
        const segments = this._elevationSegments;
        const groundGeo = new THREE.PlaneGeometry(size, size, segments, segments);
        groundGeo.rotateX(-Math.PI / 2); // make horizontal
        const posAttr = groundGeo.attributes.position;
        
        const colors = [];
        const clamp01 = (v) => Math.max(0, Math.min(1, v));
        const smooth = (e0, e1, x) => {
            const t = clamp01((x - e0) / (e1 - e0));
            return t * t * (3 - 2 * t);
        };

        this._elevationGrid = [];
        for (let r = 0; r <= segments; r++) {
            this._elevationGrid[r] = new Float32Array(segments + 1);
        }

        const halfSize = this.planeSize / 2;
        const cellSize = this.planeSize / segments;

        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const z = posAttr.getZ(i);
            
            // Get procedural elevation
            const elevation = this.getRawElevation(x, z);
            posAttr.setY(i, elevation);
            
            const gridCol = Math.round((x + halfSize) / cellSize);
            const gridRow = Math.round((z + halfSize) / cellSize);
            if (gridRow >= 0 && gridRow <= segments && gridCol >= 0 && gridCol <= segments) {
                this._elevationGrid[gridRow][gridCol] = elevation;
            }
        }

        posAttr.needsUpdate = true;
        groundGeo.computeVertexNormals();

        // --- Generate Terrain Texture (Fix for mobile WebGL vertex colors) ---
        const texSize = 256;
        const canvas = document.createElement('canvas');
        canvas.width = texSize;
        canvas.height = texSize;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(texSize, texSize);
        const data = imgData.data;

        for (let py = 0; py < texSize; py++) {
            for (let px = 0; px < texSize; px++) {
                const x = (px / (texSize - 1)) * size - halfSize;
                const z = (py / (texSize - 1)) * size - halfSize;
                
                const elevation = this.getRawElevation(x, z);

                // Add some noise to colors to break up tiling
                const nx = x + this.seedX;
                const nz = z + this.seedZ;
                const nSmall = fbmNoise(nx * 2.2, nz * 2.2, 3);
                const nLarge = fbmNoise(nx * 0.35 + 50, nz * 0.35 - 20, 2);
                const grassVar = (nSmall * 0.65 + nLarge * 0.35);
                const slopeSample =
                    Math.abs(this.getRawElevation(x + 0.75, z) - this.getRawElevation(x - 0.75, z)) +
                    Math.abs(this.getRawElevation(x, z + 0.75) - this.getRawElevation(x, z - 0.75));

                const grassA = new THREE.Color(0.12, 0.28, 0.10);
                const grassB = new THREE.Color(0.18, 0.35, 0.14);
                const meadow = new THREE.Color(0.25, 0.45, 0.18);
                const dirt = new THREE.Color(0.18, 0.14, 0.08);
                const wetSand = new THREE.Color(0.20, 0.18, 0.12);
                const drySand = new THREE.Color(0.28, 0.24, 0.16);
                const rock = new THREE.Color(0.15, 0.32, 0.12); 
                const snow = new THREE.Color(0.18, 0.35, 0.14); 

                let col = grassA.clone().lerp(grassB, grassVar);
                const meadowW = smooth(0.25, 0.78, nSmall) * smooth(0.18, 1.35, elevation) * (1 - smooth(1.7, 3.0, elevation));
                col.lerp(meadow, meadowW * 0.65);

                const wetShoreW = 1 - smooth(0.05, 0.60, elevation);
                const beachW = smooth(-0.35, 0.05, elevation) * (1 - smooth(0.12, 0.55, elevation));
                col.lerp(wetSand, wetShoreW * 0.75);
                col.lerp(drySand, beachW * 0.95);

                const rockW = Math.max(smooth(0.30, 1.0, slopeSample), smooth(1.15, 2.15, elevation) * 0.55);
                col.lerp(rock, rockW);

                const snowW = smooth(2.65, 3.35, elevation);
                col.lerp(snow, snowW);

                let baseDist = Infinity;
                if (this.game && this.game.basePositions) {
                    for (const faction in this.game.basePositions) {
                        const pos = this.game.basePositions[faction];
                        const d = Math.hypot(x - pos.x, z - pos.z);
                        if (d < baseDist) baseDist = d;
                    }
                } else {
                    const distToPlayerBase = Math.hypot(x - (-40), z - 40);
                    const distToEnemyBase = Math.hypot(x - 40, z - (-40));
                    baseDist = Math.min(distToPlayerBase, distToEnemyBase);
                }
                const wornGround = 1 - smooth(8, 18, baseDist);
                const pathNoise = smooth(0.55, 0.85, fbmNoise(nx * 0.9 + 200, nz * 0.9 - 80, 3));
                col.lerp(dirt, THREE.MathUtils.clamp(wornGround * 0.85 + pathNoise * 0.10, 0, 0.9));

                // PlaneGeometry UVs: (0,0) is bottom-left, (1,1) is top-right.
                // However, ThreeJS canvas textures map (0,0) to top-left.
                // y needs to be inverted so it maps properly to the vertices.
                const invertedY = (texSize - 1) - py;
                const idx = (invertedY * texSize + px) * 4;
                
                data[idx] = Math.min(255, Math.max(0, Math.floor(col.r * 255)));
                data[idx + 1] = Math.min(255, Math.max(0, Math.floor(col.g * 255)));
                data[idx + 2] = Math.min(255, Math.max(0, Math.floor(col.b * 255)));
                data[idx + 3] = 255;
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
        const groundTex = new THREE.CanvasTexture(canvas);
        if (THREE.sRGBEncoding) groundTex.encoding = THREE.sRGBEncoding;

        const groundMat = new THREE.MeshLambertMaterial({
            map: groundTex,
            flatShading: false
        });

        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }

    createFlowerPatchMesh() {
        const group = new THREE.Group();
        const bloomPalette = [0xfff1a8, 0xffffff, 0xd8d4ff, 0xffb7d5, 0x8cc8ff];
        const stemMat = new THREE.MeshLambertMaterial({ color: 0x4f8f38, roughness: 0.9, flatShading: true });
        const stemGeo = new THREE.CylinderGeometry(0.009, 0.012, 0.16, 4);
        const bloomGeo = new THREE.SphereGeometry(0.028, 5, 4);

        const flowerCount = 8 + Math.floor(this.prng.next() * 10);
        for (let i = 0; i < flowerCount; i++) {
            const stem = new THREE.Mesh(stemGeo, stemMat);
            const bloom = new THREE.Mesh(
                bloomGeo,
                new THREE.MeshLambertMaterial({
                    color: bloomPalette[Math.floor(this.prng.next() * bloomPalette.length)],
                    roughness: 0.82,
                    flatShading: true
                })
            );

            const ox = (this.prng.next() - 0.5) * 0.9;
            const oz = (this.prng.next() - 0.5) * 0.9;
            stem.position.set(ox, 0.08, oz);
            stem.rotation.z = (this.prng.next() - 0.5) * 0.2;
            bloom.position.set(ox, 0.16 + this.prng.next() * 0.03, oz);
            bloom.scale.set(0.8 + this.prng.next() * 0.4, 0.8 + this.prng.next() * 0.35, 0.8 + this.prng.next() * 0.4);

            group.add(stem);
            group.add(bloom);
        }

        return group;
    }

    createCliffFormationMesh() {
        const group = new THREE.Group();
        const rockMats = [
            new THREE.MeshLambertMaterial({ color: 0x7b828a, roughness: 0.95, flatShading: true }),
            new THREE.MeshLambertMaterial({ color: 0x939aa2, roughness: 0.92, flatShading: true }),
            new THREE.MeshLambertMaterial({ color: 0x686f77, roughness: 0.96, flatShading: true })
        ];

        const slabCount = 4 + Math.floor(this.prng.next() * 4);
        for (let i = 0; i < slabCount; i++) {
            const geo = this.prng.next() > 0.4 ? new THREE.DodecahedronGeometry(1) : new THREE.OctahedronGeometry(0.95);
            const mesh = new THREE.Mesh(geo, rockMats[i % rockMats.length]);
            mesh.position.set(
                (this.prng.next() - 0.5) * 2.1,
                0.4 + i * 0.2 + this.prng.next() * 0.3,
                (this.prng.next() - 0.5) * 1.5
            );
            mesh.rotation.set(this.prng.next() * 0.7, this.prng.next() * Math.PI, this.prng.next() * 0.25);
            mesh.scale.set(
                0.9 + this.prng.next() * 1.6,
                0.65 + this.prng.next() * 0.85,
                0.8 + this.prng.next() * 1.3
            );
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
        }

        return group;
    }

    createWater() {
        const size = this.planeSize;
        const waterSegs = 128;
        const waterGeo = new THREE.PlaneGeometry(size, size, waterSegs, waterSegs);
        waterGeo.rotateX(-Math.PI / 2);

        const waterMat = new THREE.MeshLambertMaterial({
            color: 0x0077be,
            opacity: 0.85,
            transparent: true,
            roughness: 0.2,
            metalness: 0.05,
            flatShading: false
        });
        this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
        this.waterMesh.position.y = 0.15;
        this.waterMesh.receiveShadow = false;
        this.scene.add(this.waterMesh);
    }

    animateWater(dt) {
        this.waterTime += dt;
        this.cloudTime += dt;

        if (this.waterMesh) {
            const posAttr = this.waterMesh.geometry.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
                const x = posAttr.getX(i);
                const z = posAttr.getZ(i);
                const wave1 = Math.sin(x * 0.15 + this.waterTime * 0.6) * 0.02;
                const wave2 = Math.cos(z * 0.10 + this.waterTime * 0.4) * 0.015;
                const wave3 = Math.sin((x + z) * 0.08 + this.waterTime * 0.3) * 0.01;
                const y = wave1 + wave2 + wave3;
                posAttr.setXYZ(i, x, y, z);
            }
            posAttr.needsUpdate = true;
            this.waterMesh.geometry.computeVertexNormals();

        }

        if (this.ground && this.ground.material && this.ground.material.userData && this.ground.material.userData.shader) {
            this.ground.material.userData.shader.uniforms.uCloudTime.value = this.cloudTime;
        }

        if (this.cloudLayers.length) {
            this.cloudLayers.forEach((cloud, index) => {
                cloud.position.x += cloud.userData.speed * dt;
                cloud.position.z += cloud.userData.drift * dt;
                cloud.material.opacity = cloud.userData.baseOpacity * (0.88 + 0.12 * Math.sin(this.cloudTime * 0.2 + cloud.userData.pulse + index));

                if (cloud.position.x > 145) cloud.position.x = -145;
                if (cloud.position.z > 145) cloud.position.z = -145;
                if (cloud.position.z < -145) cloud.position.z = 145;
            });
        }
    }

    createGrassAndDecor() {
        const halfSize = this.planeSize / 2;
        // Wildflower meadows for a richer, less empty ground plane
        for (let i = 0; i < 90; i++) {
            const x = this.prng.next() * this.planeSize - halfSize;
            const z = this.prng.next() * this.planeSize - halfSize;
            const elevation = this.getElevationAtCoords(x, z);
            if (elevation < 0.35 || elevation > 1.15) continue;
            let nearBase = false;
            if (this.game && this.game.basePositions) {
                for (const faction in this.game.basePositions) {
                    const pos = this.game.basePositions[faction];
                    if (Math.hypot(x - pos.x, z - pos.z) < 9) nearBase = true;
                }
            } else {
                if (Math.hypot(x - (-40), z - 40) < 9) nearBase = true;
                if (Math.hypot(x - 40, z - (-40)) < 9) nearBase = true;
            }
            if (nearBase) continue;

            const patch = this.createFlowerPatchMesh();
            patch.position.set(x, elevation, z);
            patch.rotation.y = this.prng.next() * Math.PI * 2;
            patch.scale.setScalar(0.75 + this.prng.next() * 0.7);
            this.scene.add(patch);
        }
        
        // Decorative small rocks
        const rockGeo = new THREE.DodecahedronGeometry(0.15);
        const rockMat = new THREE.MeshLambertMaterial({ color: 0x7A7A7A, roughness: 0.95, flatShading: true });
        for (let i = 0; i < 80; i++) {
            const x = this.prng.next() * this.planeSize - halfSize;
            const z = this.prng.next() * this.planeSize - halfSize;
            const elevation = this.getElevationAtCoords(x, z);
            if (elevation < 0.25) continue; // skip underwater
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(x, elevation + 0.05, z);
            rock.rotateY(this.prng.next() * Math.PI * 2);
            rock.scale.setScalar(0.5 + this.prng.next() * 1.5);
            rock.castShadow = true;
            this.scene.add(rock);
        }

    }

    createResources() {
        let entityId = 1000;
        const halfSize = this.planeSize / 2;
        
        const spawnResource = (type, x, z, cap) => {
            const res = new NaturalResource(entityId++, type, x, z, cap);
            this.scene.add(res.mesh);
            this.game.entities.push(res);
        };

        // Guaranteed Base Resources for all active factions
        const factions = ['player', 'enemy', 'player3', 'player4'];
        factions.forEach(faction => {
            const pos = this.game.basePositions && this.game.basePositions[faction] ? this.game.basePositions[faction] : null;
            if (!pos) return;
            const px = pos.x;
            const pz = pos.z;
            const guaranteed = [
                { t: 'tree', x: px - 4, z: pz + 2 },
                { t: 'tree', x: px - 5, z: pz },
                { t: 'tree', x: px - 3, z: pz + 4 },
                { t: 'gold', x: px - 2, z: pz - 4 },
                { t: 'gold', x: px - 3, z: pz - 3 },
                { t: 'stone', x: px + 4, z: pz + 3 },
                { t: 'stone', x: px + 3, z: pz + 4 },
                { t: 'forage', x: px + 2, z: pz + 4 },
                { t: 'forage', x: px + 3, z: pz + 5 },
            ];
            guaranteed.forEach(r => spawnResource(r.t, r.x, r.z, r.t === 'tree' ? 100 : (r.t === 'gold' ? 300 : 200)));
        });

        const isNearAnyBase = (x, z, dist) => {
            if (!this.game.basePositions) return false;
            for (const faction of factions) {
                const pos = this.game.basePositions[faction];
                if (pos && Math.hypot(x - pos.x, z - pos.z) < dist) {
                    return true;
                }
            }
            return false;
        };

        // Procedural Deep Forest Trees
        for (let i = 0; i < 7500; i++) {
            const x = this.prng.next() * this.planeSize - halfSize;
            const z = this.prng.next() * this.planeSize - halfSize;
            
            // Avoid immediate base areas
            if (isNearAnyBase(x, z, 15)) continue;
            
            const elevation = this.getElevationAtCoords(x, z);

            if (elevation > 0.3 && elevation < 1.4) {
                // Use noise to create dense forest patches and open clearings
                const forestNoise = fbmNoise(x * 1.5 + 100, z * 1.5 - 50, 2);
                
                if (forestNoise > 0.55) {
                    spawnResource('tree', x, z, 100); // Dense forest patch
                } else if (forestNoise > 0.35 && this.prng.next() > 0.4) {
                    spawnResource('tree', x, z, 100); // Forest edge
                } else if (this.prng.next() > 0.94) {
                    spawnResource('tree', x, z, 100); // Sparse lone trees
                }
            }
        }

        // Procedural Minerals
        for (let i = 0; i < 150; i++) {
            const x = this.prng.next() * this.planeSize - halfSize;
            const z = this.prng.next() * this.planeSize - halfSize;
            
            const elevation = this.getElevationAtCoords(x, z);

            if (elevation > 0.3 && elevation < 2.5) {
                spawnResource(this.prng.next() > 0.5 ? 'gold' : 'stone', x, z, 300);
            }
        }

        // Procedural Wildlife
        for (let i = 0; i < 50; i++) {
            const x = this.prng.next() * this.planeSize - halfSize;
            const z = this.prng.next() * this.planeSize - halfSize;
            
            const elevation = this.getElevationAtCoords(x, z);

            if (elevation > 0.3 && elevation < 1.5) {
                const type = this.prng.next() > 0.20 ? 'deer' : 'bear';
                this.game.spawnAnimal(type, x, z);
            }
        }

        // Procedural Fish Zones (Guarantees every water body, even small ponds, gets fish)
        const fishZones = [];
        const step = 3;
        for (let x = -halfSize; x < halfSize; x += step) {
            for (let z = -halfSize; z < halfSize; z += step) {
                // Add jitter
                const jx = x + (this.prng.next() - 0.5) * step * 0.8;
                const jz = z + (this.prng.next() - 0.5) * step * 0.8;
                
                const elevation = this.getElevationAtCoords(jx, jz);
                if (elevation < -0.1) {
                    let tooClose = false;
                    for (let i = 0; i < fishZones.length; i++) {
                        const dx = fishZones[i].x - jx;
                        const dz = fishZones[i].z - jz;
                        if (dx * dx + dz * dz < 64) { // Minimum 8 units apart
                            tooClose = true;
                            break;
                        }
                    }
                    if (!tooClose) {
                        spawnResource('fishzone', jx, jz, 500);
                        fishZones.push({x: jx, z: jz});
                    }
                }
            }
        }
    }

    createBoundary() {
        // Create boundary trees/rocks at map edges
        const halfSize = this.planeSize / 2;
        for (let i = 0; i < 200; i++) {
            const side = Math.floor(this.prng.next() * 4);
            let x, z;
            const offset = this.prng.next() * this.planeSize - halfSize;
            const edgeRand = halfSize - this.prng.next() * 5;
            
            if (side === 0) { x = offset; z = edgeRand; }
            else if (side === 1) { x = offset; z = -edgeRand; }
            else if (side === 2) { x = edgeRand; z = offset; }
            else { x = -edgeRand; z = offset; }
            
            const elevation = this.getElevationAtCoords(x, z);
            const tree = meshBuilders.createTree();
            tree.position.set(x, elevation, z);
            tree.scale.setScalar(1.25 + this.prng.next() * 1.35);
            this.scene.add(tree);
        }
    }
}
