// Game Input Controls (Camera, Selection Box, Raycast Orders, Building Placement)
import { audio } from './audio.js?v=33';

export class InputController {
    constructor(game) {
        this.game = game;
        this.camera = game.camera;
        this.renderer = game.renderer;
        this.scene = game.scene;
        // Keys mapping
        this.keys = { w: false, a: false, s: false, d: false };
        // Mouse state
        this.isSelecting = false;
        this.startMouse = { x: 0, y: 0 };
        this.currentMouse = { x: 0, y: 0 };
        // Track cursor for edge drag
        this.mousePos = { x: 0, y: 0 };
        // Camera rotation
        this.isRotating = false;
        this.rotMouseStart = { x: 0, y: 0 };
        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        // Building Placement Preview
        this.placingType = null;
        this.placementPreview = null;
        this.previewMaterialValid = new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true, transparent: true, opacity: 0.5 });
        this.previewMaterialInvalid = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.5 });
        this.swordCursor = this.createSwordCursor();
        // Bind events
        this.initEvents();
        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        // Touch state
        this.activeTouches = new Map();
        this.touchZoomDistStart = 0;
        this.touchZoomInitialRadius = 0;
        this.touchRotStart = { x: 0, y: 0 };
        this.isTouchMoved = false;
        this.touchStartTime = 0;

        // Sensor state
        this.sensorEnabled = false;
        this.sensorBase = null;
        this.sensorCurrent = { beta: 0, gamma: 0 };

        // Building Placement Preview
        this.placingType = null;
        this.placementPreview = null;
        this.previewMaterialValid = new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true, transparent: true, opacity: 0.5 });
        this.previewMaterialInvalid = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.5 });
        this.swordCursor = this.createSwordCursor();

        // Bind events
        this.initEvents();
        this.initTouchEvents();
    }

    createSwordCursor() {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g transform="rotate(-45 16 16)"><rect x="14" y="3" width="4" height="15" rx="1" fill="#e5e7eb" stroke="#111827" stroke-width="1.2"/><polygon points="16,1 19,5 13,5" fill="#f8fafc" stroke="#111827" stroke-width="1.2"/><rect x="9" y="17" width="14" height="3" rx="1.2" fill="#f59e0b" stroke="#111827" stroke-width="1.2"/><rect x="14.3" y="20" width="3.4" height="7" rx="1" fill="#92400e" stroke="#111827" stroke-width="1.2"/><circle cx="16" cy="28.5" r="2.3" fill="#78350f" stroke="#111827" stroke-width="1.2"/></g></svg>`;
        return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 4 4, pointer`;
    }

    getHoveredEntity() {
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const meshes = this.game.entities
            .filter(e => !e.dead && e.mesh)
            .map(e => e.mesh);
        const intersects = this.raycaster.intersectObjects(meshes, true);
        if (intersects.length === 0) return null;

        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== this.scene) {
            obj = obj.parent;
        }
        return this.game.entities.find(e => e.mesh === obj) || null;
    }

    updateContextCursor(targetElement) {
        if (!this.renderer || !this.renderer.domElement) return;
        if (this.placingType) {
            this.renderer.domElement.style.cursor = 'crosshair';
            this.game.hoveredBuilding = null;
            return;
        }

        // Track hovered entity for building name labels
        const hoveredEntity = this.getHoveredEntity();
        
        // Update hovered building for name label display
        if (hoveredEntity && hoveredEntity.isBuilding && !hoveredEntity.dead) {
            this.game.hoveredBuilding = hoveredEntity;
        } else {
            this.game.hoveredBuilding = null;
        }

        const hasPlayerUnitsSelected = this.game.selectedEntities.some(e => e.isUnit && e.faction === this.game.localFaction && !e.dead);
        if (!hasPlayerUnitsSelected) {
            this.renderer.domElement.style.cursor = 'default';
            return;
        }

        if (targetElement.closest('#hud') || targetElement.closest('.overlay-screen') || targetElement.closest('#audio-settings-toggle')) {
            this.renderer.domElement.style.cursor = 'default';
            return;
        }

        if (hoveredEntity && hoveredEntity.faction !== this.game.localFaction && hoveredEntity.faction !== 'neutral' && hoveredEntity.faction !== 'nature') {
            this.renderer.domElement.style.cursor = this.swordCursor;
            return;
        }

        this.renderer.domElement.style.cursor = 'default';
    }

    initEvents() {
        // Keyboard movement
        window.addEventListener('keydown', (e) => {
            const k = e.key.toLowerCase();
            if (k in this.keys) this.keys[k] = true;
            if (e.key === 'F7') {
                this.game.runAllAgesDemo();
            }
            if (e.key === 'Delete') {
                this.deleteSelectedEntities();
            }
        });

        window.addEventListener('keyup', (e) => {
            const k = e.key.toLowerCase();
            if (k in this.keys) this.keys[k] = false;
        });

        // Mouse Down (Selection and rotation start)
        window.addEventListener('mousedown', (e) => {
            // Ignore UI clicks
            if (e.target.closest('#hud') || e.target.closest('.overlay-screen') || e.target.closest('#audio-settings-toggle')) return;

            if (e.button === 0) { // Left click
                if (this.placingType && (this.placingType === 'woodwall' || this.placingType === 'stonewall')) {
                    if (this.placementPreview) {
                        this.isDraggingWall = true;
                        this.wallDragStartPos = this.placementPreview.position.clone();
                        if (!this.wallPreviews) this.wallPreviews = [];
                        this.wallPreviews.push(this.placementPreview);
                    }
                } else if (this.placingType) {
                    this.confirmBuildingPlacement();
                } else {
                    this.isSelecting = true;
                    this.startMouse.x = e.clientX;
                    this.startMouse.y = e.clientY;
                    this.currentMouse.x = e.clientX;
                    this.currentMouse.y = e.clientY;
                    this.updateSelectionBox();
                }
            } else if (e.button === 2) { // Right click
                if (this.placingType) {
                    this.cancelBuildingPlacement();
                } else {
                    // Start camera rotation
                    this.isRotating = true;
                    this.rotMouseStart.x = e.clientX;
                    this.rotMouseStart.y = e.clientY;
                }
            }
        });

        // Mouse Move
        window.addEventListener('mousemove', (e) => {
            // Update stored mouse position for edge drag detection
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;

            // Screen coords for selection box
            if (this.isSelecting) {
                this.currentMouse.x = e.clientX;
                this.currentMouse.y = e.clientY;
                this.updateSelectionBox();
            }

            // Camera rotate drag
            if (this.isRotating) {
                const deltaX = e.clientX - this.rotMouseStart.x;
                this.rotMouseStart.x = e.clientX;
                
                // Rotate camera orbit target
                this.game.cameraAngleY += deltaX * 0.005;
            }

            // Normal Pointer update for Raycasting
            this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.updateContextCursor(e.target);

            // Update building placement preview location
            if (this.placingType && this.placementPreview) {
                if (this.isDraggingWall) {
                    this.updateWallDragPreview();
                } else {
                    this.updatePlacementPreview();
                }
            }
        });

        // Mouse Up
        window.addEventListener('mouseup', (e) => {
            if (e.button === 0 && this.isDraggingWall) {
                this.confirmWallDragPlacement();
            } else if (e.button === 0 && this.isSelecting) {
                this.isSelecting = false;
                const box = document.getElementById('selection-box');
                box.classList.add('hidden');

                // Determine selection type (single click vs drag selection)
                const dragDist = Math.hypot(e.clientX - this.startMouse.x, e.clientY - this.startMouse.y);
                if (dragDist < 8) {
                    this.handleSingleSelect();
                } else {
                    this.handleBoxSelect();
                }
            } else if (e.button === 2 && this.isRotating) {
                this.isRotating = false;
            }
        });

        // Right-click action context menu override
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target.closest('#hud') || e.target.closest('.overlay-screen')) return;
            
            if (!this.placingType) {
                this.handleRightClickOrder();
            }
        });

        // Prevent mouse scroll panning default page behavior
        window.addEventListener('wheel', (e) => {
            if (e.target.closest('#hud') || e.target.closest('.overlay-screen')) return;
            this.game.cameraRadius = Math.max(8, Math.min(45, this.game.cameraRadius + e.deltaY * 0.02));
        }, { passive: false });
    }

    initTouchEvents() {
        const dom = this.renderer.domElement;

        dom.addEventListener('touchstart', (e) => {
            if (e.target.closest('#hud') || e.target.closest('.overlay-screen') || e.target.closest('#audio-settings-toggle')) return;
            e.preventDefault();

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                this.activeTouches.set(touch.identifier, { x: touch.clientX, y: touch.clientY, startX: touch.clientX, startY: touch.clientY });
            }

            // Show HUD on touch
            this.showMobileHUD();

            this.isTouchMoved = false;
            this.touchStartTime = Date.now();

            if (this.activeTouches.size === 1) {
                const t = this.activeTouches.values().next().value;
                this.pointer.x = (t.x / window.innerWidth) * 2 - 1;
                this.pointer.y = -(t.y / window.innerHeight) * 2 + 1;
                
                if (this.placingType) {
                    if (this.placingType === 'woodwall' || this.placingType === 'stonewall') {
                        if (this.placementPreview) {
                            this.isDraggingWall = true;
                            this.wallDragStartPos = this.placementPreview.position.clone();
                            if (!this.wallPreviews) this.wallPreviews = [];
                            this.wallPreviews.push(this.placementPreview);
                        }
                    }
                    this.updatePlacementPreview();
                } else {
                    this.isSelecting = true;
                    this.startMouse.x = t.x;
                    this.startMouse.y = t.y;
                    this.currentMouse.x = t.x;
                    this.currentMouse.y = t.y;
                    this.updateSelectionBox();
                }
            } else if (this.activeTouches.size === 2) {
                const tArr = Array.from(this.activeTouches.values());
                const dx = tArr[0].x - tArr[1].x;
                const dy = tArr[0].y - tArr[1].y;
                this.touchZoomDistStart = Math.hypot(dx, dy);
                this.touchZoomInitialRadius = this.game.cameraRadius;
                
                const cx = (tArr[0].x + tArr[1].x) / 2;
                const cy = (tArr[0].y + tArr[1].y) / 2;
                this.touchRotStart.x = cx;
                this.touchRotStart.y = cy;
                
                this.touchRotAngleStart = Math.atan2(dy, dx);
            }
        }, { passive: false });

        dom.addEventListener('touchmove', (e) => {
            if (e.target.closest('#hud') || e.target.closest('.overlay-screen') || e.target.closest('#audio-settings-toggle')) return;
            e.preventDefault();

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (this.activeTouches.has(touch.identifier)) {
                    const t = this.activeTouches.get(touch.identifier);
                    if (Math.hypot(touch.clientX - t.startX, touch.clientY - t.startY) > 10) {
                        this.isTouchMoved = true;
                    }
                    t.x = touch.clientX;
                    t.y = touch.clientY;
                }
            }

            if (this.activeTouches.size === 1) {
                if (this.placingType) {
                    const t = this.activeTouches.values().next().value;
                    this.pointer.x = (t.x / window.innerWidth) * 2 - 1;
                    this.pointer.y = -(t.y / window.innerHeight) * 2 + 1;
                    if (this.isDraggingWall) {
                        this.updateWallDragPreview();
                    } else {
                        this.updatePlacementPreview();
                    }
                } else if (this.isSelecting) {
                    const t = this.activeTouches.values().next().value;
                    this.currentMouse.x = t.x;
                    this.currentMouse.y = t.y;
                    this.updateSelectionBox();
                }
            } else if (this.activeTouches.size === 2) {
                this.isTouchMoved = true;
                const tArr = Array.from(this.activeTouches.values());
                const dx = tArr[0].x - tArr[1].x;
                const dy = tArr[0].y - tArr[1].y;
                const dist = Math.hypot(dx, dy);
                const angle = Math.atan2(dy, dx);

                if (this.touchZoomDistStart > 0) {
                    const ratio = this.touchZoomDistStart / dist;
                    this.game.cameraRadius = Math.max(8, Math.min(45, this.touchZoomInitialRadius * ratio));
                }

                if (this.touchRotAngleStart !== undefined) {
                    let dAngle = angle - this.touchRotAngleStart;
                    if (dAngle > Math.PI) dAngle -= Math.PI * 2;
                    if (dAngle < -Math.PI) dAngle += Math.PI * 2;
                    this.game.cameraAngleY -= dAngle;
                    this.touchRotAngleStart = angle;
                }

                const cx = (tArr[0].x + tArr[1].x) / 2;
                const cy = (tArr[0].y + tArr[1].y) / 2;
                const panDx = cx - this.touchRotStart.x;
                const panDy = cy - this.touchRotStart.y;
                this.touchRotStart.x = cx;
                this.touchRotStart.y = cy;

                const camYaw = this.game.cameraAngleY;
                const forward = new THREE.Vector3(Math.sin(camYaw), 0, Math.cos(camYaw)).normalize();
                const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), forward).normalize();
                
                this.game.cameraTarget.add(right.clone().multiplyScalar(-panDx * 0.15));
                this.game.cameraTarget.add(forward.clone().multiplyScalar(-panDy * 0.15));
            }
        }, { passive: false });

        const onTouchEnd = (e) => {
            if (e.target.closest('#hud') || e.target.closest('.overlay-screen') || e.target.closest('#audio-settings-toggle')) return;
            
            if (this.placingType) {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const touch = e.changedTouches[i];
                    if (this.activeTouches.has(touch.identifier)) {
                        const t = this.activeTouches.get(touch.identifier);
                        this.pointer.x = (t.x / window.innerWidth) * 2 - 1;
                        this.pointer.y = -(t.y / window.innerHeight) * 2 + 1;
                        if (this.isDraggingWall) {
                            this.updateWallDragPreview();
                            this.confirmWallDragPlacement();
                        } else {
                            this.updatePlacementPreview();
                            this.confirmBuildingPlacement();
                        }
                        this.activeTouches.delete(touch.identifier);
                    }
                }
                return;
            }

            if (!this.isTouchMoved && this.activeTouches.size === 1 && Date.now() - this.touchStartTime < 500) {
                const t = this.activeTouches.values().next().value;
                this.pointer.x = (t.x / window.innerWidth) * 2 - 1;
                this.pointer.y = -(t.y / window.innerHeight) * 2 + 1;
                
                const now = Date.now();
                const isDoubleTap = (now - (this.lastTapTime || 0) < 350);
                this.lastTapTime = now;

                const hasPlayerUnitsSelected = this.game.selectedEntities.some(ent => ent.isUnit && ent.faction === this.game.localFaction && !ent.dead);

                let targetEnt = null;
                this.raycaster.setFromCamera(this.pointer, this.camera);
                const meshes = this.game.entities.filter(e => !e.dead && e.mesh).map(e => e.mesh);
                const intersects = this.raycaster.intersectObjects(meshes, true);
                if (intersects.length > 0) {
                    let obj = intersects[0].object;
                    while (obj.parent && obj.parent !== this.scene) { obj = obj.parent; }
                    targetEnt = this.game.entities.find(e => e.mesh === obj);
                }

                if (hasPlayerUnitsSelected) {
                    if (targetEnt && targetEnt.faction === this.game.localFaction) {
                        if (isDoubleTap) {
                            this.handleRightClickOrder();
                        } else {
                            this.handleSingleSelect();
                        }
                    } else {
                        this.handleRightClickOrder();
                    }
                } else {
                    this.handleSingleSelect();
                }
            }

            if (this.isSelecting) {
                this.isSelecting = false;
                const box = document.getElementById('selection-box');
                box.classList.add('hidden');
                
                // If dragged significantly, box select. Else handled by tap logic
                if (this.isTouchMoved) {
                    this.handleBoxSelect();
                }
            }

            for (let i = 0; i < e.changedTouches.length; i++) {
                this.activeTouches.delete(e.changedTouches[i].identifier);
            }

            if (this.activeTouches.size === 0) {
                this.isTouchMoved = false;
            }
        };

        dom.addEventListener('touchend', onTouchEnd);
        dom.addEventListener('touchcancel', onTouchEnd);
    }

    showMobileHUD() {
        if (this.game) {
            this.game.mobileHUDTimer = 4.0;
            document.getElementById('info-panel').style.visibility = 'visible';
            document.getElementById('command-panel').style.visibility = 'visible';
            document.getElementById('info-panel').style.pointerEvents = 'auto';
            document.getElementById('command-panel').style.pointerEvents = 'auto';
        }
    }

    toggleSensors() {
        const btn = document.getElementById('btn-recalibrate');
        
        // Toggle if already enabled
        if (this.sensorEnabled) {
            this.sensorEnabled = false;
            if (this.deviceOrientationListener) {
                window.removeEventListener('deviceorientation', this.deviceOrientationListener, true);
                this.deviceOrientationListener = null;
            }
            if (btn) {
                btn.style.background = 'rgba(239, 68, 68, 0.8)';
                btn.style.borderColor = '#ef4444';
            }
            return;
        }

        const updateBtn = () => {
            if (btn) {
                btn.style.background = 'rgba(16, 185, 129, 0.8)';
                btn.style.borderColor = '#10b981';
            }
        };

        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        this.sensorEnabled = true;
                        this.enableSensor();
                        updateBtn();
                    }
                })
                .catch(console.error);
        } else {
            this.sensorEnabled = true;
            this.enableSensor();
            updateBtn();
        }
    }

    enableSensor() {
        this.sensorBase = null; // Reset calibration on enable
        this.deviceOrientationListener = (e) => {
            if (!this.sensorBase) {
                this.sensorBase = { beta: e.beta, gamma: e.gamma };
            }
            this.sensorCurrent = { beta: e.beta, gamma: e.gamma };
        };
        window.addEventListener('deviceorientation', this.deviceOrientationListener, true);
    }

    deleteSelectedEntities() {
        if (!this.game.selectedEntities || this.game.selectedEntities.length === 0) return;
        
        const myEntities = this.game.selectedEntities.filter(e => e.faction === this.game.localFaction);
        if (myEntities.length > 0) {
            const ids = myEntities.map(e => e.id);
            if (this.game.network && (this.game.network.isClient || this.game.network.isHost)) {
                this.game.network.sendCommand({
                    type: 'DELETE_CMD',
                    faction: this.game.localFaction,
                    unitIds: ids
                });
            } else {
                myEntities.forEach(e => {
                    e.die();
                });
            }
            this.game.selectedEntities = [];
            this.game.updateHUD();
        }
    }

    startBuildingPlacement(type) {
        this.cancelBuildingPlacement();
        this.placingType = type;
        
        // Mesh builder lookup for all building types
        const MESH_MAP = {
            'barracks': 'createBarracks', 'house': 'createHouse', 'farm': 'createFarm',
            'tower': 'createTower', 'towncenter': 'createTownCenter', 'fishmarket': 'createFishMarket',
            'stable': 'createStable', 'market': 'createMarket', 'blacksmith': 'createBlacksmith',
            'castle': 'createCastle', 'siegeworkshop': 'createSiegeWorkshop', 'monastery': 'createMonastery',
            'university': 'createUniversity', 'fortress': 'createFortress', 'treasury': 'createTreasury',
            'temple': 'createTemple', 'titanforge': 'createTitanForge', 'wonder': 'createWonder',
            'roboticlab': 'createRoboticLab', 'airport': 'createAirport',
            'woodwall': 'createWoodWall', 'stonewall': 'createStoneWall'
        };

        const meshFn = MESH_MAP[type];
        if (meshFn && this.game.builders[meshFn]) {
            this.placementPreview = (type === 'farm') ? this.game.builders[meshFn]() : this.game.builders[meshFn](this.game.localFaction);
        }

        if (!this.placementPreview) return;

        // Apply wireframe wire preview material
        this.placementPreview.traverse(child => {
            if (child.isMesh) {
                child.material = this.previewMaterialValid;
            }
        });
        
        this.scene.add(this.placementPreview);
    }

    confirmBuildingPlacement() {
        if (!this.placementPreview) return;
        const pos = this.placementPreview.position.clone();

        if (this.validatePlacement(pos)) {
            // Place building
            const success = this.game.constructBuilding(this.placingType, pos.x, pos.z, this.placementPreview.rotation.y);
            if (success) {
                audio.playClick();
                this.cancelBuildingPlacement();
            } else {
                audio.playError();
            }
        } else {
            audio.playError();
        }
    }

    cancelBuildingPlacement() {
        if (this.wallPreviews) {
            this.wallPreviews.forEach(p => this.scene.remove(p));
            this.wallPreviews = null;
        } else if (this.placementPreview) {
            this.scene.remove(this.placementPreview);
        }
        this.placementPreview = null;
        this.placingType = null;
        this.isDraggingWall = false;
    }

    confirmWallDragPlacement() {
        let placedAny = false;
        if (this.wallPreviews) {
            for (let preview of this.wallPreviews) {
                const pos = preview.position.clone();
                if (this.validatePlacement(pos)) {
                    const success = this.game.constructBuilding(this.placingType, pos.x, pos.z, preview.rotation.y);
                    if (success) placedAny = true;
                }
            }
        }
        if (placedAny) {
            audio.playClick();
        } else {
            audio.playError();
        }
        this.cancelBuildingPlacement();
    }

    updateWallDragPreview() {
        const intersect = this.getGroundIntersect();
        if (!intersect || !this.wallPreviews) return;
        
        let endPos = intersect.point.clone();
        
        const dx = endPos.x - this.wallDragStartPos.x;
        const dz = endPos.z - this.wallDragStartPos.z;
        const dist = Math.hypot(dx, dz);
        
        const spacing = 1.6; // Slightly overlapped
        const numBlocks = Math.max(1, Math.floor(dist / spacing) + 1);
        
        while (this.wallPreviews.length < numBlocks) {
            const meshFn = this.placingType === 'woodwall' ? 'createWoodWall' : 'createStoneWall';
            const newMesh = this.game.builders[meshFn](this.game.localFaction);
            newMesh.traverse(child => { if (child.isMesh) child.material = this.previewMaterialValid; });
            this.scene.add(newMesh);
            this.wallPreviews.push(newMesh);
        }
        while (this.wallPreviews.length > numBlocks) {
            const extra = this.wallPreviews.pop();
            this.scene.remove(extra);
        }
        
        for (let i = 0; i < numBlocks; i++) {
            const t = numBlocks > 1 ? i / (numBlocks - 1) : 0;
            const px = this.wallDragStartPos.x + dx * t;
            const pz = this.wallDragStartPos.z + dz * t;
            
            const prev = this.wallPreviews[i];
            const elev = this.game.world && this.game.world.getElevationAtCoords ? this.game.world.getElevationAtCoords(px, pz) : 0;
            prev.position.set(px, elev, pz);
            // Add PI/2 so the wall's local X-axis (its length) aligns with the drag direction
            prev.rotation.y = Math.atan2(dx, dz) + Math.PI / 2;
            
            const isValid = this.validatePlacement(prev.position);
            prev.traverse(child => {
                if (child.isMesh) {
                    child.material = isValid ? this.previewMaterialValid : this.previewMaterialInvalid;
                }
            });
        }
    }

    updatePlacementPreview() {
        if (!this.placingType || !this.placementPreview) return;
        const intersect = this.getGroundIntersect();
        if (intersect) {
            this.placementPreview.position.copy(intersect.point);
            // Snap to grid
            this.placementPreview.position.x = Math.round(this.placementPreview.position.x);
            this.placementPreview.position.z = Math.round(this.placementPreview.position.z);
            
            // Validate position
            const isValid = this.validatePlacement(this.placementPreview.position);
            this.placementPreview.traverse(child => {
                if (child.isMesh) {
                    child.material = isValid ? this.previewMaterialValid : this.previewMaterialInvalid;
                }
            });
        }
    }

    validatePlacement(pos) {
        // Walls can be built on any surface and anywhere, bypassing all restrictions
        if (this.placingType === 'woodwall' || this.placingType === 'stonewall') return true;

        // Must be within map limits
        const halfSize = (this.game.world && this.game.world.planeSize) ? (this.game.world.planeSize / 2 - 2) : 123;
        if (Math.abs(pos.x) > halfSize || Math.abs(pos.z) > halfSize) return false;

        // Terrain constraints
        if (this.game.world && this.game.world.getElevationAtCoords) {
            const centerElev = this.game.world.getElevationAtCoords(pos.x, pos.z);
            if (this.placingType === 'fishmarket') {
                // Must be on the coast (mix of water and land)
                const e1 = this.game.world.getElevationAtCoords(pos.x + 3, pos.z);
                const e2 = this.game.world.getElevationAtCoords(pos.x - 3, pos.z);
                const e3 = this.game.world.getElevationAtCoords(pos.x, pos.z + 3);
                const e4 = this.game.world.getElevationAtCoords(pos.x, pos.z - 3);
                
                const elevations = [centerElev, e1, e2, e3, e4];
                const hasWater = elevations.some(e => e < 0.25);
                const hasLand = elevations.some(e => e >= 0.25);
                
                if (!hasWater || !hasLand) return false;
            } else {
                // Normal buildings must be fully on land
                if (centerElev < 0.25) return false;
            }
        }

        // No overlap checks: villagers can build anywhere on land!
        return true;
    }

    updateSelectionBox() {
        const box = document.getElementById('selection-box');
        box.classList.remove('hidden');
        
        const left = Math.min(this.startMouse.x, this.currentMouse.x);
        const top = Math.min(this.startMouse.y, this.currentMouse.y);
        const width = Math.abs(this.startMouse.x - this.currentMouse.x);
        const height = Math.abs(this.startMouse.y - this.currentMouse.y);

        box.style.left = `${left}px`;
        box.style.top = `${top}px`;
        box.style.width = `${width}px`;
        box.style.height = `${height}px`;
    }

    getGroundIntersect() {
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObject(this.game.world.ground);
        return intersects.length > 0 ? intersects[0] : null;
    }

    handleSingleSelect() {
        this.raycaster.setFromCamera(this.pointer, this.camera);
        
        // Find entities meshes intersected
        const meshes = this.game.entities
            .filter(e => !e.dead && e.mesh)
            .map(e => e.mesh);

        const intersects = this.raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
            // Find root group name or uuid to identify entity
            let obj = intersects[0].object;
            while (obj.parent && obj.parent !== this.scene) {
                obj = obj.parent;
            }
            
            // Find matching game entity
            const selected = this.game.entities.find(e => e.mesh === obj);
            if (selected) {
                this.game.selectEntities([selected]);
                if (selected.isUnit || selected.isBuilding) {
                    audio.playClick();
                }
                return;
            }
        }
        
        // Clicked ground - clear selection
        this.game.selectEntities([]);
    }

    handleBoxSelect() {
        const x1 = Math.min(this.startMouse.x, this.currentMouse.x);
        const x2 = Math.max(this.startMouse.x, this.currentMouse.x);
        const y1 = Math.min(this.startMouse.y, this.currentMouse.y);
        const y2 = Math.max(this.startMouse.y, this.currentMouse.y);

        const selected = [];
        const widthHalf = window.innerWidth / 2;
        const heightHalf = window.innerHeight / 2;

        this.game.entities.forEach(ent => {
            if (ent.dead || ent.faction !== this.game.localFaction || !ent.isUnit) return;

            // Project 3D center to 2D Screen
            const vec = new THREE.Vector3().copy(ent.position);
            vec.y += 0.5; // Project middle height
            vec.project(this.camera);

            const sx = (vec.x * widthHalf) + widthHalf;
            const sy = -(vec.y * heightHalf) + heightHalf;

            // Check containment in drag rectangle
            if (sx >= x1 && sx <= x2 && sy >= y1 && sy <= y2) {
                selected.push(ent);
            }
        });

        if (selected.length > 0) {
            this.game.selectEntities(selected);
            audio.playClick();
        } else {
            this.game.selectEntities([]);
        }
    }

    handleRightClickOrder() {
        if (this.game.selectedEntities.length === 0) return;
        
        // Only allow commanding player-faction units
        const playerUnits = this.game.selectedEntities.filter(e => e.isUnit && e.faction === this.game.localFaction && !e.dead);
        if (playerUnits.length === 0) return;

        // Perform raycast
        this.raycaster.setFromCamera(this.pointer, this.camera);
        
        // Check intersections with other entities
        const meshes = this.game.entities
            .filter(e => !e.dead && e.mesh)
            .map(e => e.mesh);
            
        const entityIntersects = this.raycaster.intersectObjects(meshes, true);
        
        if (entityIntersects.length > 0) {
            // Find root entity
            let obj = entityIntersects[0].object;
            while (obj.parent && obj.parent !== this.scene) {
                obj = obj.parent;
            }
            
            const targetEnt = this.game.entities.find(e => e.mesh === obj);
            if (targetEnt) {
                this.issueEntityOrder(targetEnt);
                return;
            }
        }

        // Otherwise raycast to ground coordinates
        const groundIntersect = this.getGroundIntersect();
        if (groundIntersect) {
            const x = groundIntersect.point.x;
            const z = groundIntersect.point.z;

            let best = null;
            let bestPriority = Infinity;
            let bestDist = Infinity;

            this.game.entities.forEach(e => {
                if (e.dead || !e.position) return;
                const dx = e.position.x - x;
                const dz = e.position.z - z;
                const dist = Math.hypot(dx, dz);

                const pickRadius = (e.radius || 0.5) + 0.9;
                if (dist > pickRadius) return;

                const priority =
                    (e.faction && e.faction !== this.game.localFaction && e.faction !== 'neutral' && e.faction !== 'nature') ? 0 :
                    e.faction === 'neutral' ? 1 :
                    e.faction === 'nature' ? 2 : 3;

                if (priority < bestPriority || (priority === bestPriority && dist < bestDist)) {
                    best = e;
                    bestPriority = priority;
                    bestDist = dist;
                }
            });

            if (best) {
                this.issueEntityOrder(best);
                return;
            }

            this.issueGroundOrder(x, z);
        }
    }

    issueEntityOrder(target) {
        audio.playOrder();
        
        const units = this.game.selectedEntities.filter(e => e.isUnit && e.faction === this.game.localFaction && !e.dead);
        if (units.length === 0) return;

        units.forEach(unit => unit.autoMode = false);

        const villagers = units.filter(u => u.type === 'villager');
        const others = units.filter(u => u.type !== 'villager');
        
        let cmdSent = false;

        if (target.faction === 'neutral' || (target.faction === 'nature' && target.isResource)) {
            if (villagers.length > 0) this.sendCommand({ type: 'GATHER', faction: this.game.localFaction, targetId: target.id, unitIds: villagers.map(u=>u.id) });
            if (others.length > 0) this.sendCommand({ type: 'MOVE', faction: this.game.localFaction, x: target.position.x, z: target.position.z, unitIds: others.map(u=>u.id) });
            cmdSent = true;
        } else if (target.faction !== this.game.localFaction && target.faction !== 'neutral' && target.faction !== 'nature') {
            this.sendCommand({ type: 'ATTACK', faction: this.game.localFaction, targetId: target.id, unitIds: units.map(u=>u.id) });
            cmdSent = true;
        } else if (target.faction === this.game.localFaction && target.isBuilding) {
            if (!target.isCompleted) {
                if (villagers.length > 0) this.sendCommand({ type: 'BUILD', faction: this.game.localFaction, targetId: target.id, unitIds: villagers.map(u=>u.id) });
                if (others.length > 0) this.sendCommand({ type: 'MOVE', faction: this.game.localFaction, x: target.position.x, z: target.position.z, unitIds: others.map(u=>u.id) });
                cmdSent = true;
            } else if (target.health < target.maxHealth && villagers.length > 0) {
                this.sendCommand({ type: 'REPAIR', faction: this.game.localFaction, targetId: target.id, unitIds: villagers.map(u=>u.id) });
                if (others.length > 0) this.sendCommand({ type: 'MOVE', faction: this.game.localFaction, x: target.position.x, z: target.position.z, unitIds: others.map(u=>u.id) });
                cmdSent = true;
            } else if (target.type === 'farm' && villagers.length > 0) {
                this.sendCommand({ type: 'GATHER', faction: this.game.localFaction, targetId: target.id, unitIds: villagers.map(u=>u.id) });
                if (others.length > 0) this.sendCommand({ type: 'MOVE', faction: this.game.localFaction, x: target.position.x, z: target.position.z, unitIds: others.map(u=>u.id) });
                cmdSent = true;
            }
        } else if (target.faction === this.game.localFaction && target.type === 'transportboat') {
            this.sendCommand({ type: 'ORDER_LOAD', faction: this.game.localFaction, targetId: target.id, unitIds: units.map(u=>u.id) });
            cmdSent = true;
        }

        if (!cmdSent) {
            this.sendCommand({ type: 'MOVE', faction: this.game.localFaction, x: target.position.x, z: target.position.z, unitIds: units.map(u=>u.id) });
        }
    }

    issueGroundOrder(x, z) {
        audio.playOrder();

        const units = this.game.selectedEntities.filter(e => e.isUnit && e.faction === this.game.localFaction && !e.dead);
        if (units.length === 0) return;

        units.forEach(u => u.autoMode = false);

        // Calculate offsets and emit separate move commands for grouped formations
        // Actually it's easier to calculate locally and send individual positions, but doing it in game.js processCommand is better.
        // Let's just send the target center, and the game.js processCommand can assign positions if it wants, OR we send individual MOVEs.
        // For simplicity, we send individual MOVEs from here.
        const count = units.length;
        const spacing = 0.8;
        const rows = Math.ceil(Math.sqrt(count));

        units.forEach((unit, idx) => {
            const r = Math.floor(idx / rows);
            const c = idx % rows;
            const offsetX = (c - (rows - 1) / 2) * spacing;
            const offsetZ = (r - (rows - 1) / 2) * spacing;

            this.sendCommand({
                type: 'MOVE',
                faction: this.game.localFaction,
                x: x + offsetX,
                z: z + offsetZ,
                unitIds: [unit.id]
            });
        });
    }

    sendCommand(cmd) {
        if (this.game.network) {
            this.game.network.sendCommand(cmd);
        } else {
            this.game.processCommand(cmd);
        }
    }

    updateCamera(dt) {
        const panSpeed = 16.0; // Units per second
        const direction = new THREE.Vector3();

        // Standard camera pan vector calculations relative to camera Y angle
        const camYaw = this.game.cameraAngleY;
        const forward = new THREE.Vector3(Math.sin(camYaw), 0, Math.cos(camYaw)).normalize();
        const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), forward).normalize();

        let isAnalog = false;

        // Edge scrolling (camera-relative)
        const edgeSize = 20;
        if (this.mousePos.x < edgeSize) direction.add(right.clone().multiplyScalar(-1));
        if (this.mousePos.x > window.innerWidth - edgeSize) direction.add(right);
        if (this.mousePos.y < edgeSize) direction.add(forward.clone().multiplyScalar(-1));
        if (this.mousePos.y > window.innerHeight - edgeSize) direction.add(forward);

        // WASD scrolling (camera-relative)
        if (this.keys.w) direction.add(forward.clone().multiplyScalar(-1));
        if (this.keys.s) direction.add(forward);
        if (this.keys.a) direction.add(right.clone().multiplyScalar(-1));
        if (this.keys.d) direction.add(right);

        // Sensor panning
        if (this.sensorEnabled && this.sensorBase && this.sensorCurrent) {
            let db = this.sensorCurrent.beta - this.sensorBase.beta;
            let dg = this.sensorCurrent.gamma - this.sensorBase.gamma;

            // Handle wrap-arounds if any
            if (db > 180) db -= 360; else if (db < -180) db += 360;
            if (dg > 180) dg -= 360; else if (dg < -180) dg += 360;

            const deadzone = 4.0; 
            
            let tiltForward = db;
            let tiltRight = dg;

            // Adjust for landscape
            if (window.innerWidth > window.innerHeight) {
                tiltForward = dg;
                tiltRight = db;
                
                let angle = window.orientation || (screen.orientation ? screen.orientation.angle : 0);
                if (angle === -90 || angle === 270) {
                    tiltForward = -tiltForward;
                    tiltRight = -tiltRight;
                }
            }

            if (Math.abs(tiltForward) > deadzone) {
                const amount = Math.sign(tiltForward) * (Math.abs(tiltForward)-deadzone) * 0.08;
                direction.add(forward.clone().multiplyScalar(amount));
                isAnalog = true;
            }
            if (Math.abs(tiltRight) > deadzone) {
                const amount = Math.sign(tiltRight) * (Math.abs(tiltRight)-deadzone) * 0.08;
                direction.add(right.clone().multiplyScalar(amount));
                isAnalog = true;
            }
        }

        if (direction.lengthSq() > 0) {
            if (!isAnalog) {
                direction.normalize();
            } else {
                if (direction.length() > 2.5) {
                    direction.normalize().multiplyScalar(2.5);
                }
            }
            direction.multiplyScalar(panSpeed * dt);
            this.game.cameraTarget.add(direction);
            
            // Constrain camera target to map size boundaries
            const limit = 85;
            this.game.cameraTarget.x = THREE.MathUtils.clamp(this.game.cameraTarget.x, -limit, limit);
            this.game.cameraTarget.z = THREE.MathUtils.clamp(this.game.cameraTarget.z, -limit, limit);
        }
    }
}
