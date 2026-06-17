// VFX Particle System — Lightweight GPU-friendly effects
// Supports: sparks, dust, smoke, fire, death fade, selection rings

export class VFXSystem {
    constructor(scene) {
        this.scene = scene;
        this.emitters = [];
        this.selectionRings = new Map(); // entityId -> ringMesh
    }

    update(dt) {
        for (let i = this.emitters.length - 1; i >= 0; i--) {
            const em = this.emitters[i];
            em.age += dt;
            if (em.age >= em.lifetime) {
                // Remove all particles
                em.particles.forEach(p => {
                    this.scene.remove(p.mesh);
                    p.mesh.geometry.dispose();
                });
                this.emitters.splice(i, 1);
                continue;
            }
            // Update each particle
            em.particles.forEach(p => {
                p.age += dt;
                if (p.age > p.lifetime) {
                    p.mesh.visible = false;
                    return;
                }
                // Physics
                p.velocity.y += (em.gravity || 0) * dt;
                p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));
                // Fade out
                const lifePct = p.age / p.lifetime;
                p.mesh.material.opacity = Math.max(0, 1 - lifePct);
                // Shrink
                const scale = p.startScale * (1 - lifePct * 0.6);
                p.mesh.scale.setScalar(Math.max(0.01, scale));
                // Rotation
                if (em.spin) {
                    p.mesh.rotation.z += em.spin * dt;
                }
            });
        }
    }

    // --- EFFECT SPAWNERS ---

    spawnSwordSparks(position) {
        const particles = [];
        const count = 10;
        for (let i = 0; i < count; i++) {
            const geo = new THREE.SphereGeometry(0.04, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.12, 1, 0.5 + Math.random() * 0.5),
                transparent: true, opacity: 1
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(position);
            mesh.position.y += 0.6;
            this.scene.add(mesh);
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            particles.push({
                mesh, age: 0, lifetime: 0.2 + Math.random() * 0.3, startScale: 1,
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    1 + Math.random() * 3,
                    Math.sin(angle) * speed
                )
            });
        }
        this.emitters.push({ particles, age: 0, lifetime: 0.6, gravity: -15, spin: 0 });
    }

    spawnArrowImpact(position) {
        const particles = [];
        for (let i = 0; i < 6; i++) {
            const geo = new THREE.SphereGeometry(0.03, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: 0x8B7355, transparent: true, opacity: 1
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(position);
            mesh.position.y += 0.3;
            this.scene.add(mesh);
            const angle = Math.random() * Math.PI * 2;
            particles.push({
                mesh, age: 0, lifetime: 0.3 + Math.random() * 0.2, startScale: 1,
                velocity: new THREE.Vector3(
                    Math.cos(angle) * 1.5,
                    0.5 + Math.random() * 2,
                    Math.sin(angle) * 1.5
                )
            });
        }
        this.emitters.push({ particles, age: 0, lifetime: 0.6, gravity: -10, spin: 0 });
    }

    spawnWoodChips(position) {
        const particles = [];
        for (let i = 0; i < 5; i++) {
            const geo = new THREE.BoxGeometry(0.06, 0.02, 0.04);
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.08, 0.6, 0.3 + Math.random() * 0.2),
                transparent: true, opacity: 1
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(position);
            mesh.position.y += 0.5;
            this.scene.add(mesh);
            const angle = Math.random() * Math.PI * 2;
            particles.push({
                mesh, age: 0, lifetime: 0.4 + Math.random() * 0.4, startScale: 1,
                velocity: new THREE.Vector3(
                    Math.cos(angle) * 2,
                    1 + Math.random() * 2,
                    Math.sin(angle) * 2
                )
            });
        }
        this.emitters.push({ particles, age: 0, lifetime: 1.0, gravity: -8, spin: 5 });
    }

    spawnMiningSparks(position) {
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const geo = new THREE.SphereGeometry(0.025, 4, 4);
            const isGold = Math.random() > 0.5;
            const mat = new THREE.MeshBasicMaterial({
                color: isGold ? 0xFFD700 : 0xFFFFFF,
                transparent: true, opacity: 1
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(position);
            mesh.position.y += 0.4;
            this.scene.add(mesh);
            const angle = Math.random() * Math.PI * 2;
            particles.push({
                mesh, age: 0, lifetime: 0.15 + Math.random() * 0.25, startScale: 1,
                velocity: new THREE.Vector3(
                    Math.cos(angle) * 3, 1 + Math.random() * 3, Math.sin(angle) * 3
                )
            });
        }
        this.emitters.push({ particles, age: 0, lifetime: 0.5, gravity: -12, spin: 0 });
    }

    spawnBuildDust(position) {
        const particles = [];
        for (let i = 0; i < 6; i++) {
            const geo = new THREE.SphereGeometry(0.15 + Math.random() * 0.15, 6, 6);
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.08, 0.15, 0.5 + Math.random() * 0.2),
                transparent: true, opacity: 0.5
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(position);
            mesh.position.y += Math.random() * 0.5;
            this.scene.add(mesh);
            const angle = Math.random() * Math.PI * 2;
            particles.push({
                mesh, age: 0, lifetime: 1.0 + Math.random() * 0.5, startScale: 1,
                velocity: new THREE.Vector3(
                    Math.cos(angle) * 0.5, 0.3 + Math.random() * 0.5, Math.sin(angle) * 0.5
                )
            });
        }
        this.emitters.push({ particles, age: 0, lifetime: 1.8, gravity: -0.5, spin: 0 });
    }

    spawnSmoke(position) {
        const particles = [];
        for (let i = 0; i < 3; i++) {
            const geo = new THREE.SphereGeometry(0.08 + Math.random() * 0.08, 6, 6);
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0.55, 0.55, 0.55),
                transparent: true, opacity: 0.3
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(position);
            mesh.position.x += (Math.random() - 0.5) * 0.2;
            mesh.position.z += (Math.random() - 0.5) * 0.2;
            this.scene.add(mesh);
            particles.push({
                mesh, age: 0, lifetime: 2 + Math.random() * 1, startScale: 0.6,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.15, 0.4 + Math.random() * 0.3, (Math.random() - 0.5) * 0.15
                )
            });
        }
        this.emitters.push({ particles, age: 0, lifetime: 3.5, gravity: 0.1, spin: 0 });
    }

    spawnTorchFire(position) {
        const particles = [];
        for (let i = 0; i < 5; i++) {
            const geo = new THREE.SphereGeometry(0.04 + Math.random() * 0.04, 4, 4);
            const hue = 0.05 + Math.random() * 0.08; // orange-yellow
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(hue, 1, 0.5 + Math.random() * 0.3),
                transparent: true, opacity: 0.9
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(position);
            mesh.position.x += (Math.random() - 0.5) * 0.1;
            mesh.position.z += (Math.random() - 0.5) * 0.1;
            this.scene.add(mesh);
            particles.push({
                mesh, age: 0, lifetime: 0.3 + Math.random() * 0.4, startScale: 1,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3, 1.5 + Math.random() * 1, (Math.random() - 0.5) * 0.3
                )
            });
        }
        this.emitters.push({ particles, age: 0, lifetime: 0.8, gravity: 1, spin: 0 });
    }

    spawnDeathEffect(position) {
        const particles = [];
        for (let i = 0; i < 12; i++) {
            const geo = new THREE.SphereGeometry(0.06, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0, 0.8, 0.4 + Math.random() * 0.2),
                transparent: true, opacity: 0.8
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(position);
            mesh.position.y += 0.5;
            this.scene.add(mesh);
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            particles.push({
                mesh, age: 0, lifetime: 0.6 + Math.random() * 0.5, startScale: 1.2,
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed, 1 + Math.random() * 2, Math.sin(angle) * speed
                )
            });
        }
        this.emitters.push({ particles, age: 0, lifetime: 1.5, gravity: -6, spin: 3 });
    }

    spawnWake(position) {
        const particles = [];
        for (let i = 0; i < 2; i++) {
            const geo = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.55, 0.4, 0.8 + Math.random() * 0.2), // Light foam blue/white
                transparent: true, opacity: 0.6
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(position);
            mesh.position.x += (Math.random() - 0.5) * 0.3;
            mesh.position.z += (Math.random() - 0.5) * 0.3;
            mesh.position.y = 0.15; // Water level
            this.scene.add(mesh);
            particles.push({
                mesh, age: 0, lifetime: 1.5 + Math.random() * 1.0, startScale: 1.0,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1
                )
            });
        }
        this.emitters.push({ particles, age: 0, lifetime: 2.5, gravity: 0, spin: 0 });
    }

    // --- SELECTION RING ---

    showSelectionRing(entity) {
        if (this.selectionRings.has(entity.id)) return;
        const radius = entity.radius || 0.5;
        const geo = new THREE.RingGeometry(radius * 0.8, radius * 1.1, 32);
        let ringColor = 0xef4444;
        if (entity.faction === 'player') ringColor = 0x3b82f6;
        else if (entity.faction === 'player3') ringColor = 0x10B981;
        else if (entity.faction === 'player4') ringColor = 0xF59E0B;
        else if (entity.faction === 'neutral') ringColor = 0xffffff;
        else if (entity.faction === 'nature') ringColor = 0xaaaaaa;

        const mat = new THREE.MeshBasicMaterial({
            color: ringColor,
            transparent: true, opacity: 0.45,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(geo, mat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.copy(entity.position);
        ring.position.y = 0.05;
        this.scene.add(ring);
        this.selectionRings.set(entity.id, ring);
    }

    hideSelectionRing(entityId) {
        const ring = this.selectionRings.get(entityId);
        if (ring) {
            this.scene.remove(ring);
            ring.geometry.dispose();
            ring.material.dispose();
            this.selectionRings.delete(entityId);
        }
    }

    clearAllSelectionRings() {
        this.selectionRings.forEach((ring) => {
            this.scene.remove(ring);
            ring.geometry.dispose();
            ring.material.dispose();
        });
        this.selectionRings.clear();
    }

    updateSelectionRings(selectedEntities) {
        // Remove rings for entities no longer selected
        const selectedIds = new Set(selectedEntities.map(e => e.id));
        this.selectionRings.forEach((ring, id) => {
            if (!selectedIds.has(id)) {
                this.hideSelectionRing(id);
            }
        });
        // Add/update rings for selected entities
        selectedEntities.forEach(ent => {
            if (!ent.dead) {
                this.showSelectionRing(ent);
                const ring = this.selectionRings.get(ent.id);
                if (ring) {
                    ring.position.copy(ent.position);
                    ring.position.y = 0.05;
                    // Pulse animation
                    const pulse = 1 + Math.sin(performance.now() * 0.005) * 0.08;
                    ring.scale.setScalar(pulse);
                }
            }
        });
    }

    dispose() {
        this.emitters.forEach(em => {
            em.particles.forEach(p => {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
            });
        });
        this.emitters = [];
        this.clearAllSelectionRings();
    }
}
