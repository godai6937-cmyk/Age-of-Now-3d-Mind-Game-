// Game Entities — Enhanced procedural models with animations, detailed buildings
import { audio } from './audio.js?v=33';

export function wrapX(x, R) {
    return x;
}

export function clampZ(z, R) {
    return z;
}

export function getSpherePosition(x, z, elevation, R) {
    return new THREE.Vector3(x, elevation, z);
}

export function getLogicalCoords(pos, R) {
    return {
        x: pos.x,
        z: pos.z
    };
}

// Global materials store
const texLoader = new THREE.TextureLoader();
const loadRepeatedTexture = (path, repeatX = 2, repeatY = 2) => {
    const texture = texLoader.load(path);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    return texture;
};

const texWood = loadRepeatedTexture('assets/textures/wood_plank.png', 2, 2);
const texWall = loadRepeatedTexture('assets/textures/stone_wall.png', 2, 2);
const texRoof = loadRepeatedTexture('assets/textures/roof_tile.png', 2, 2);
const texCloth = loadRepeatedTexture('assets/textures/cloth_weave.png', 3, 3);
const texLeather = loadRepeatedTexture('assets/textures/leather.png', 3, 3);
const texPants = loadRepeatedTexture('assets/textures/pants_weave.png', 3, 3);
const texChainmail = loadRepeatedTexture('assets/textures/chainmail.png', 4, 4);
const texDarkStone = loadRepeatedTexture('assets/textures/dark_stone.png', 2, 2);
const texDirt = loadRepeatedTexture('assets/textures/dirt_ground.png', 4, 4);
const texLeaves = loadRepeatedTexture('assets/textures/leaves_canopy.png', 3, 3);
const texBark = loadRepeatedTexture('assets/textures/bark.png', 2, 2);
const texWheat = loadRepeatedTexture('assets/textures/wheat_straw.png', 4, 4);
const texWater = loadRepeatedTexture('assets/textures/water.png', 4, 4);

export const materials = {
    player: new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.35, metalness: 0.1 }),
    enemy: new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.35, metalness: 0.1 }),
    player3: new THREE.MeshStandardMaterial({ color: 0x10B981, roughness: 0.35, metalness: 0.1 }),
    player4: new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.35, metalness: 0.1 }),
    playerDark: new THREE.MeshStandardMaterial({ color: 0x1E40AF, roughness: 0.4 }),
    enemyDark: new THREE.MeshStandardMaterial({ color: 0x991B1B, roughness: 0.4 }),
    player3Dark: new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.4 }),
    player4Dark: new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.4 }),
    skin: new THREE.MeshStandardMaterial({ color: 0xE8B88A, roughness: 0.7 }),
    skinDark: new THREE.MeshStandardMaterial({ color: 0xD49B6A, roughness: 0.7 }),
    hair: new THREE.MeshStandardMaterial({ color: 0x3B2507, roughness: 0.9 }),
    cloth: new THREE.MeshStandardMaterial({ map: texCloth, color: 0x8C6A4A, roughness: 0.88 }),
    leather: new THREE.MeshStandardMaterial({ map: texLeather, color: 0x6B4428, roughness: 0.82 }),
    pants: new THREE.MeshStandardMaterial({ map: texPants, color: 0x5A4A44, roughness: 0.88 }),
    chainmail: new THREE.MeshStandardMaterial({ map: texChainmail, color: 0xA0A6B0, metalness: 0.72, roughness: 0.32 }),
    wood: new THREE.MeshStandardMaterial({ map: texWood, color: 0x8B5E3C, roughness: 0.88 }),
    woodLight: new THREE.MeshStandardMaterial({ map: texWood, color: 0xAA7E5C, roughness: 0.85 }),
    bark: new THREE.MeshStandardMaterial({ map: texBark, color: 0x8B6038, roughness: 0.92 }),
    leaves: new THREE.MeshStandardMaterial({ map: texLeaves, color: 0x258C46, roughness: 0.8 }),
    leavesDark: new THREE.MeshStandardMaterial({ map: texLeaves, color: 0x1B6D34, roughness: 0.82 }),
    leavesLight: new THREE.MeshStandardMaterial({ map: texLeaves, color: 0x49A85A, roughness: 0.76 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xFFBF00, metalness: 0.85, roughness: 0.15 }),
    stone: new THREE.MeshStandardMaterial({ map: texWall, color: 0xF0E7D7, roughness: 0.9 }),
    stoneDark: new THREE.MeshStandardMaterial({ map: texDarkStone, color: 0xC2CBD5, roughness: 0.94 }),
    dirt: new THREE.MeshStandardMaterial({ map: texDirt, color: 0x8C6B47, roughness: 0.97 }),
    wheat: new THREE.MeshStandardMaterial({ map: texWheat, color: 0xD7B450, roughness: 0.88 }),
    roof: new THREE.MeshStandardMaterial({ map: texRoof, color: 0xE1E8F0, roughness: 0.52, metalness: 0.08 }),
    roofDark: new THREE.MeshStandardMaterial({ map: texRoof, color: 0xA8B5C7, roughness: 0.62 }),
    wall: new THREE.MeshStandardMaterial({ map: texWall, color: 0xF4E9D3, roughness: 0.95 }),
    wallDark: new THREE.MeshStandardMaterial({ map: texDarkStone, color: 0xB5BCC8, roughness: 0.96 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xA8A8A8, metalness: 0.75, roughness: 0.25 }),
    metalBright: new THREE.MeshStandardMaterial({ color: 0xD4D4D4, metalness: 0.8, roughness: 0.2 }),
    water: new THREE.MeshStandardMaterial({ map: texWater, color: 0x6BC3EB, opacity: 0.78, transparent: true, roughness: 0.06 }),
    torch: new THREE.MeshBasicMaterial({ color: 0xFF8C00 }),
    window: new THREE.MeshBasicMaterial({ color: 0xFFF3B0, transparent: true, opacity: 0.6 }),
};

export function getFactionMat(faction, isDark = false) {
    if (isDark) {
        if (faction === "player") return materials.playerDark;
        if (faction === "player3") return materials.player3Dark;
        if (faction === "player4") return materials.player4Dark;
        return materials.enemyDark;
    } else {
        if (faction === "player") return materials.player;
        if (faction === "player3") return materials.player3;
        if (faction === "player4") return materials.player4;
        return materials.enemy;
    }
}

// ========== PROCEDURAL MESH BUILDERS ==========
export const meshBuilders = {

    createMissile() {
        const group = new THREE.Group();
        const bodyGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
        bodyGeo.rotateX(Math.PI / 2);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        
        const tipGeo = new THREE.ConeGeometry(0.04, 0.15, 8);
        tipGeo.rotateX(Math.PI / 2);
        const tipMat = new THREE.MeshStandardMaterial({ color: 0xcc2222 });
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.position.z = 0.3;

        const finGeo = new THREE.BoxGeometry(0.15, 0.15, 0.05);
        const finMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const fin1 = new THREE.Mesh(finGeo, finMat);
        fin1.position.z = -0.2;
        const fin2 = new THREE.Mesh(finGeo, finMat);
        fin2.rotation.z = Math.PI / 2;
        fin2.position.z = -0.2;

        group.add(body, tip, fin1, fin2);
        group.scale.set(1.5, 1.5, 1.5);
        return group;
    },

    createLaser() {
        const group = new THREE.Group();
        const geo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
        geo.rotateX(Math.PI / 2);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Bright cyan laser
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        return group;
    },
    // --- VILLAGER (Detailed articulated body) ---
    createVillager(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.4, 6);
        const leftLeg = new THREE.Mesh(legGeo, materials.pants);
        leftLeg.position.set(-0.08, 0.2, 0);
        leftLeg.castShadow = true;
        leftLeg.name = 'leftLeg';
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, materials.pants);
        rightLeg.position.set(0.08, 0.2, 0);
        rightLeg.castShadow = true;
        rightLeg.name = 'rightLeg';
        group.add(rightLeg);

        // Boots
        const bootGeo = new THREE.BoxGeometry(0.1, 0.06, 0.14);
        const leftBoot = new THREE.Mesh(bootGeo, materials.leather);
        leftBoot.position.set(-0.08, 0.03, 0.02);
        group.add(leftBoot);
        const rightBoot = new THREE.Mesh(bootGeo, materials.leather);
        rightBoot.position.set(0.08, 0.03, 0.02);
        group.add(rightBoot);

        // Torso (layered tunic)
        const torsoGeo = new THREE.BoxGeometry(0.28, 0.35, 0.18);
        const torso = new THREE.Mesh(torsoGeo, materials.cloth);
        torso.position.y = 0.58;
        torso.castShadow = true;
        group.add(torso);

        const undershirtGeo = new THREE.BoxGeometry(0.20, 0.26, 0.14);
        const undershirt = new THREE.Mesh(undershirtGeo, materials.skinDark);
        undershirt.position.set(0, 0.58, -0.01);
        group.add(undershirt);

        // Belt
        const beltGeo = new THREE.BoxGeometry(0.30, 0.04, 0.20);
        const belt = new THREE.Mesh(beltGeo, materials.leather);
        belt.position.y = 0.42;
        group.add(belt);

        const apronGeo = new THREE.BoxGeometry(0.18, 0.18, 0.03);
        const apron = new THREE.Mesh(apronGeo, materials.cloth);
        apron.position.set(0, 0.40, 0.095);
        group.add(apron);

        // Arms
        const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.32, 6);
        armGeo.translate(0, -0.16, 0); // Move pivot to shoulder
        const leftArm = new THREE.Mesh(armGeo, materials.skin);
        leftArm.position.set(-0.20, 0.74, 0);
        leftArm.rotation.z = 0.15;
        leftArm.castShadow = true;
        leftArm.name = 'leftArm';
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, materials.skin);
        rightArm.position.set(0.20, 0.74, 0);
        rightArm.rotation.z = -0.15;
        rightArm.castShadow = true;
        rightArm.name = 'rightArm';
        group.add(rightArm);

        // Head
        const headGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const head = new THREE.Mesh(headGeo, materials.skin);
        head.position.y = 0.88;
        head.castShadow = true;
        group.add(head);

        // Hair
        const hairGeo = new THREE.SphereGeometry(0.13, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
        const hair = new THREE.Mesh(hairGeo, materials.hair);
        hair.position.y = 0.90;
        group.add(hair);

        // Peasant Hood
        const hoodGeo = new THREE.SphereGeometry(0.135, 8, 6, 0, Math.PI * 2, 0, Math.PI / 1.8);
        const hood = new THREE.Mesh(hoodGeo, materials.cloth);
        hood.position.y = 0.88;
        hood.castShadow = true;
        group.add(hood);

        const noseGeo = new THREE.BoxGeometry(0.03, 0.05, 0.05);
        const nose = new THREE.Mesh(noseGeo, materials.skinDark);
        nose.position.set(0, 0.86, 0.11);
        group.add(nose);

        const satchelGeo = new THREE.BoxGeometry(0.12, 0.14, 0.08);
        const satchel = new THREE.Mesh(satchelGeo, materials.leather);
        satchel.position.set(-0.18, 0.42, -0.10);
        satchel.rotation.z = 0.18;
        group.add(satchel);

        // Tools
        const toolGroup = new THREE.Group();
        toolGroup.position.set(0, -0.31, 0.05); // relative to rightArm
        toolGroup.name = 'prop_tool';
        const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6);
        
        // 1. Axe
        const axeGroup = new THREE.Group();
        axeGroup.name = 'axeGroup';
        axeGroup.position.y = -0.15; // Shift down so hand holds the top end
        const handle1 = new THREE.Mesh(handleGeo, materials.wood);
        // Handle aligns with arm (local Y) to point forward during the swing
        handle1.rotation.x = 0;
        axeGroup.add(handle1);
        const axeHeadGeo = new THREE.BoxGeometry(0.12, 0.14, 0.02);
        const axeHead = new THREE.Mesh(axeHeadGeo, materials.metal);
        // Position at the end of the handle, pointing sideways
        axeHead.position.set(-0.06, -0.15, 0); 
        axeGroup.add(axeHead);
        toolGroup.add(axeGroup);

        // 2. Pickaxe
        const pickaxeGroup = new THREE.Group();
        pickaxeGroup.name = 'pickaxeGroup';
        pickaxeGroup.position.y = -0.15; // Shift down so hand holds the top end
        const handle2 = new THREE.Mesh(handleGeo, materials.wood);
        handle2.rotation.x = 0; // Align with arm
        pickaxeGroup.add(handle2);
        
        const centerEyeGeo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
        const centerEye = new THREE.Mesh(centerEyeGeo, materials.metal);
        centerEye.position.set(0, -0.18, 0); // Attach securely to handle
        pickaxeGroup.add(centerEye);

        const spikeGeo = new THREE.ConeGeometry(0.02, 0.22, 4);
        
        const frontSpike = new THREE.Mesh(spikeGeo, materials.metal);
        frontSpike.rotation.x = Math.PI / 2 - 0.4; // Point +Z and bend DOWN towards hand (+Y)
        frontSpike.position.set(0, -0.14, 0.10);
        pickaxeGroup.add(frontSpike);

        const backSpike = new THREE.Mesh(spikeGeo, materials.metal);
        backSpike.rotation.x = -Math.PI / 2 + 0.4; // Point -Z and bend DOWN towards hand (+Y)
        backSpike.position.set(0, -0.14, -0.10);
        pickaxeGroup.add(backSpike);

        toolGroup.add(pickaxeGroup);

        // 3. Hoe (Pitchfork)
        const pitchforkGroup = new THREE.Group();
        pitchforkGroup.name = 'pitchforkGroup';
        pitchforkGroup.position.y = -0.15; // Shift down so hand holds the top end
        const handle3 = new THREE.Mesh(handleGeo, materials.wood);
        handle3.rotation.x = 0; // Align with arm
        pitchforkGroup.add(handle3);
        const forkBaseGeo = new THREE.BoxGeometry(0.12, 0.02, 0.02);
        const forkBase = new THREE.Mesh(forkBaseGeo, materials.metal);
        forkBase.position.set(0, -0.3, 0);
        pitchforkGroup.add(forkBase);
        const tineGeo = new THREE.BoxGeometry(0.01, 0.01, 0.15);
        for (let i = 0; i < 4; i++) {
            const tine = new THREE.Mesh(tineGeo, materials.metal);
            tine.position.set(-0.045 + i * 0.03, -0.3, 0.075); // tines point DOWN (+Z)
            pitchforkGroup.add(tine);
        }
        toolGroup.add(pitchforkGroup);

        // 4. Hammer
        const hammerGroup = new THREE.Group();
        hammerGroup.name = 'hammerGroup';
        hammerGroup.position.y = -0.15; // Shift down so hand holds the top end
        const handle4 = new THREE.Mesh(handleGeo, materials.wood);
        handle4.rotation.x = 0; // Align with arm
        hammerGroup.add(handle4);
        const hammerHeadGeo = new THREE.BoxGeometry(0.08, 0.08, 0.15);
        const hammerHead = new THREE.Mesh(hammerHeadGeo, materials.metal);
        hammerHead.position.set(0, -0.3, 0); // Position at handle end, extends along Z
        hammerGroup.add(hammerHead);
        toolGroup.add(hammerGroup);

        // 5. Spear (Bhala)
        const spearGroup = new THREE.Group();
        spearGroup.name = 'spearGroup';
        spearGroup.position.y = -0.15; 
        const spearHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 6), materials.wood);
        spearGroup.add(spearHandle);
        const spearHeadGeo = new THREE.ConeGeometry(0.03, 0.25, 4);
        const spearHead = new THREE.Mesh(spearHeadGeo, materials.metal);
        spearHead.position.set(0, -0.6, 0); 
        spearHead.rotation.x = Math.PI; // point down towards negative Y (which is forward when arm is raised)
        spearGroup.add(spearHead);
        toolGroup.add(spearGroup);

        rightArm.add(toolGroup);

        // Faction tunic color overlay
        const tunicGeo = new THREE.BoxGeometry(0.22, 0.12, 0.16);
        const tunic = new THREE.Mesh(tunicGeo, mat);
        tunic.position.y = 0.66;
        group.add(tunic);

        group.name = 'villager';
        return group;
    },

    // --- SOLDIER (Armored melee warrior) ---
    createSoldier(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        const matDark = getFactionMat(faction, true);

        // Legs with greaves
        const legGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.42, 6);
        const leftLeg = new THREE.Mesh(legGeo, materials.chainmail);
        leftLeg.position.set(-0.09, 0.21, 0);
        leftLeg.castShadow = true;
        leftLeg.name = 'leftLeg';
        group.add(leftLeg);
        const rightLeg = new THREE.Mesh(legGeo, materials.chainmail);
        rightLeg.position.set(0.09, 0.21, 0);
        rightLeg.castShadow = true;
        rightLeg.name = 'rightLeg';
        group.add(rightLeg);

        // Boots
        const bootGeo = new THREE.BoxGeometry(0.12, 0.08, 0.15);
        [[-0.09, 0.04, 0.02], [0.09, 0.04, 0.02]].forEach(([x, y, z]) => {
            const boot = new THREE.Mesh(bootGeo, materials.leather);
            boot.position.set(x, y, z);
            group.add(boot);
        });

        // Armored torso
        const torsoGeo = new THREE.BoxGeometry(0.32, 0.38, 0.22);
        const torso = new THREE.Mesh(torsoGeo, materials.chainmail);
        torso.position.y = 0.62;
        torso.castShadow = true;
        group.add(torso);

        // Tabard (faction color over armor)
        const tabardGeo = new THREE.BoxGeometry(0.24, 0.30, 0.18);
        const tabard = new THREE.Mesh(tabardGeo, mat);
        tabard.position.y = 0.62;
        tabard.position.z = 0.03;
        group.add(tabard);

        const fauldGeo = new THREE.BoxGeometry(0.28, 0.16, 0.18);
        const fauld = new THREE.Mesh(fauldGeo, materials.chainmail);
        fauld.position.set(0, 0.40, 0.02);
        group.add(fauld);

        const capeGeo = new THREE.BoxGeometry(0.24, 0.34, 0.03);
        const cape = new THREE.Mesh(capeGeo, matDark);
        cape.position.set(0, 0.60, -0.13);
        group.add(cape);

        // Pauldrons (shoulder pads)
        const pauldronGeo = new THREE.SphereGeometry(0.08, 6, 6);
        [[-0.22, 0.76], [0.22, 0.76]].forEach(([x, y]) => {
            const p = new THREE.Mesh(pauldronGeo, matDark);
            p.position.set(x, y, 0);
            p.scale.set(1, 0.7, 1);
            p.castShadow = true;
            group.add(p);
        });

        // Arms
        const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
        const leftArm = new THREE.Mesh(armGeo, materials.chainmail);
        leftArm.position.set(-0.22, 0.58, 0);
        leftArm.name = 'leftArm';
        group.add(leftArm);
        const rightArm = new THREE.Mesh(armGeo, materials.chainmail);
        rightArm.position.set(0.22, 0.58, 0);
        rightArm.name = 'rightArm';
        group.add(rightArm);

        // Head with helmet
        const headGeo = new THREE.SphereGeometry(0.13, 8, 8);
        const head = new THREE.Mesh(headGeo, materials.skin);
        head.position.y = 0.93;
        head.castShadow = true;
        group.add(head);

        // Helmet
        const helmetGeo = new THREE.SphereGeometry(0.145, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const helmet = new THREE.Mesh(helmetGeo, materials.metal);
        helmet.position.y = 0.96;
        helmet.castShadow = true;
        group.add(helmet);
        // Nose guard
        const noseGeo = new THREE.BoxGeometry(0.02, 0.1, 0.05);
        const nose = new THREE.Mesh(noseGeo, materials.metal);
        nose.position.set(0, 0.92, 0.13);
        group.add(nose);

        [[-0.09, 0.92], [0.09, 0.92]].forEach(([x, y]) => {
            const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.10, 0.05), materials.metal);
            cheek.position.set(x, y, 0.10);
            group.add(cheek);
        });

        // Shield (left arm)
        const shieldGroup = new THREE.Group();
        const shieldGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.03, 8);
        const shield = new THREE.Mesh(shieldGeo, mat);
        shield.rotation.z = Math.PI / 2;
        shield.castShadow = true;
        shieldGroup.add(shield);
        // Shield boss
        const bossGeo = new THREE.SphereGeometry(0.06, 6, 6);
        const boss = new THREE.Mesh(bossGeo, materials.metal);
        boss.position.set(-0.02, 0, 0);
        shieldGroup.add(boss);

        const shieldStripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.18), materials.gold);
        shieldStripe.position.set(-0.02, 0, 0);
        shieldGroup.add(shieldStripe);
        
        shieldGroup.position.set(-0.13, -0.03, 0.05); // relative to leftArm
        shieldGroup.name = 'prop_shield';
        leftArm.add(shieldGroup);

        // Sword (right hand)
        const swordGroup = new THREE.Group();
        const bladeGeo = new THREE.BoxGeometry(0.025, 0.55, 0.04);
        const blade = new THREE.Mesh(bladeGeo, materials.metalBright);
        blade.position.y = 0.28;
        blade.castShadow = true;
        swordGroup.add(blade);
        const hiltGeo = new THREE.BoxGeometry(0.14, 0.025, 0.04);
        const hilt = new THREE.Mesh(hiltGeo, materials.gold);
        hilt.position.y = 0.02;
        swordGroup.add(hilt);
        const gripGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 4);
        const grip = new THREE.Mesh(gripGeo, materials.leather);
        grip.position.y = -0.05;
        swordGroup.add(grip);
        swordGroup.position.set(0.08, -0.08, 0.15); // relative to rightArm
        swordGroup.rotation.x = Math.PI / 6;
        swordGroup.name = 'prop_weapon';
        rightArm.add(swordGroup);

        group.name = 'soldier';
        return group;
    },

    // --- ARCHER (Hooded ranged) ---
    createArcher(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        const matDark = getFactionMat(faction, true);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.4, 6);
        const leftLeg = new THREE.Mesh(legGeo, materials.leather);
        leftLeg.position.set(-0.07, 0.2, 0);
        leftLeg.castShadow = true;
        leftLeg.name = 'leftLeg';
        group.add(leftLeg);
        const rightLeg = new THREE.Mesh(legGeo, materials.leather);
        rightLeg.position.set(0.07, 0.2, 0);
        rightLeg.castShadow = true;
        rightLeg.name = 'rightLeg';
        group.add(rightLeg);

        // Boots
        const bootGeo = new THREE.BoxGeometry(0.09, 0.06, 0.12);
        [[-0.07, 0.03], [0.07, 0.03]].forEach(([x, y]) => {
            const boot = new THREE.Mesh(bootGeo, materials.leather);
            boot.position.set(x, y, 0.01);
            group.add(boot);
        });

        // Torso (lighter armor)
        const torsoGeo = new THREE.BoxGeometry(0.26, 0.32, 0.16);
        const torso = new THREE.Mesh(torsoGeo, matDark);
        torso.position.y = 0.56;
        torso.castShadow = true;
        group.add(torso);

        // Cloak overlay
        const cloakGeo = new THREE.BoxGeometry(0.30, 0.34, 0.02);
        const cloak = new THREE.Mesh(cloakGeo, mat);
        cloak.position.set(0, 0.56, -0.09);
        group.add(cloak);

        const tunicGeo = new THREE.BoxGeometry(0.22, 0.24, 0.12);
        const tunic = new THREE.Mesh(tunicGeo, materials.cloth);
        tunic.position.set(0, 0.56, 0.01);
        group.add(tunic);

        // Arms
        const armGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.3, 6);
        const leftArm = new THREE.Mesh(armGeo, materials.leather);
        leftArm.position.set(-0.18, 0.55, 0);
        leftArm.name = 'leftArm';
        group.add(leftArm);
        const rightArm = new THREE.Mesh(armGeo, materials.leather);
        rightArm.position.set(0.18, 0.55, 0);
        rightArm.name = 'rightArm';
        group.add(rightArm);

        [[-0.18, 0.48], [0.18, 0.48]].forEach(([x, y]) => {
            const bracer = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.07), materials.leather);
            bracer.position.set(x, y, 0.02);
            group.add(bracer);
        });

        // Head
        const headGeo = new THREE.SphereGeometry(0.11, 8, 8);
        const head = new THREE.Mesh(headGeo, materials.skin);
        head.position.y = 0.85;
        head.castShadow = true;
        group.add(head);

        // Hood
        const hoodGeo = new THREE.ConeGeometry(0.18, 0.3, 8);
        const hood = new THREE.Mesh(hoodGeo, mat);
        hood.position.y = 0.95;
        hood.castShadow = true;
        group.add(hood);

        // Bow (right hand)
        const bowGroup = new THREE.Group();
        const bowCurve = new THREE.TorusGeometry(0.22, 0.015, 6, 12, Math.PI);
        const bow = new THREE.Mesh(bowCurve, materials.wood);
        bow.rotation.z = -Math.PI / 2;
        bowGroup.add(bow);
        // String
        const stringGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.44, 4);
        const string = new THREE.Mesh(stringGeo, new THREE.MeshBasicMaterial({ color: 0xCCCCCC }));
        string.position.x = 0.04;
        bowGroup.add(string);
        bowGroup.position.set(0.04, -0.05, 0.12); // relative to rightArm
        bowGroup.rotation.y = -Math.PI / 2; // aim forward locally
        bowGroup.name = 'prop_weapon';
        rightArm.add(bowGroup);

        // Quiver on back
        const quiverGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6);
        const quiver = new THREE.Mesh(quiverGeo, materials.leather);
        quiver.position.set(0.05, 0.6, -0.12);
        quiver.rotation.x = 0.15;
        group.add(quiver);
        // Arrow tips poking out
        for (let i = 0; i < 3; i++) {
            const arrowTip = new THREE.Mesh(
                new THREE.ConeGeometry(0.015, 0.06, 4),
                materials.metal
            );
            arrowTip.position.set(0.05 + (i - 1) * 0.02, 0.78, -0.12);
            group.add(arrowTip);
        }

        group.name = 'archer';
        return group;
    },    // --- TOWN CENTER (Alpine Stone Keep) ---
    createTownCenter(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);

        // Massive stone foundation
        const baseGeo = new THREE.BoxGeometry(3.6, 0.4, 3.6);
        const base = new THREE.Mesh(baseGeo, materials.wallDark);
        base.position.y = 0.2;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        // Main Keep block
        const keepGeo = new THREE.BoxGeometry(2.2, 2.0, 2.2);
        const keep = new THREE.Mesh(keepGeo, materials.wall);
        keep.position.y = 1.4;
        keep.castShadow = true;
        keep.receiveShadow = true;
        group.add(keep);

        // Peaked slate roof
        const roofGeo = new THREE.ConeGeometry(2.0, 1.5, 4);
        const roof = new THREE.Mesh(roofGeo, materials.roofDark);
        roof.position.y = 3.15;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        // 4 Corner Wooden Watchtowers
        const towerGeo = new THREE.BoxGeometry(0.6, 2.5, 0.6);
        const towerRoofGeo = new THREE.ConeGeometry(0.5, 0.8, 4);
        const positions = [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]];
        positions.forEach(([x, z]) => {
            const tower = new THREE.Mesh(towerGeo, materials.wood);
            tower.position.set(x, 1.65, z);
            tower.castShadow = true;
            group.add(tower);

            const tRoof = new THREE.Mesh(towerRoofGeo, materials.roofDark);
            tRoof.position.set(x, 3.3, z);
            tRoof.rotation.y = Math.PI / 4;
            tRoof.castShadow = true;
            group.add(tRoof);
        });

        // Entrance Arch
        const archGeo = new THREE.BoxGeometry(0.8, 1.2, 0.4);
        const arch = new THREE.Mesh(archGeo, materials.woodLight);
        arch.position.set(0, 1.0, 1.2);
        group.add(arch);

        // Faction Banners
        const bannerGeo = new THREE.PlaneGeometry(0.6, 1.2);
        [[-0.6, 1.4, 1.11], [0.6, 1.4, 1.11]].forEach(([x, y, z]) => {
            const banner = new THREE.Mesh(bannerGeo, mat);
            banner.position.set(x, y, z);
            group.add(banner);
        });

        // Torch points
        group.userData.torchPositions = [
            new THREE.Vector3(-1.0, 1.2, 1.5),
            new THREE.Vector3(1.0, 1.2, 1.5),
            new THREE.Vector3(0, 4.0, 0)
        ];

        group.name = 'towncenter';
        return group;
    },

    // --- BARRACKS (Alpine Garrison) ---
    createBarracks(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);

        // Dirt/Stone foundation
        const foundGeo = new THREE.BoxGeometry(3.4, 0.15, 2.8);
        const found = new THREE.Mesh(foundGeo, materials.dirt);
        found.position.y = 0.075;
        found.receiveShadow = true;
        group.add(found);

        // Main block (Wooden Hall)
        const wallGeo = new THREE.BoxGeometry(1.6, 1.2, 2.4);
        const walls = new THREE.Mesh(wallGeo, materials.wood);
        walls.position.set(-0.7, 0.675, 0);
        walls.castShadow = true;
        group.add(walls);

        // Pitched Roof
        const roofGeo = new THREE.ConeGeometry(1.6, 0.8, 4);
        const roof = new THREE.Mesh(roofGeo, materials.roofDark);
        roof.position.set(-0.7, 1.6, 0);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        // Wooden Palisades enclosing yard
        const fenceGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 4);
        for(let z = -1.2; z <= 1.2; z += 0.2) {
            const fence = new THREE.Mesh(fenceGeo, materials.wood);
            fence.position.set(1.5, 0.4, z);
            group.add(fence);
        }
        for(let x = 0; x <= 1.5; x += 0.2) {
            const f1 = new THREE.Mesh(fenceGeo, materials.wood);
            f1.position.set(x, 0.4, 1.3);
            group.add(f1);
            const f2 = new THREE.Mesh(fenceGeo, materials.wood);
            f2.position.set(x, 0.4, -1.3);
            group.add(f2);
        }

        // Weapon rack in courtyard
        const rackGeo = new THREE.BoxGeometry(0.1, 0.6, 1.2);
        const rack = new THREE.Mesh(rackGeo, materials.wood);
        rack.position.set(1.0, 0.3, 0);
        group.add(rack);
        
        // Spears on rack
        for (let z = -0.4; z <= 0.4; z += 0.2) {
            const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8), materials.wood);
            spear.position.set(1.0, 0.5, z);
            spear.rotation.x = 0.2;
            group.add(spear);
            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.15), materials.metalBright);
            tip.position.set(1.0, 0.95, z - 0.08);
            tip.rotation.x = 0.2;
            group.add(tip);
        }

        // Faction banner hanging
        const bannerGeo = new THREE.BoxGeometry(0.02, 0.8, 0.5);
        const banner = new THREE.Mesh(bannerGeo, mat);
        banner.position.set(-1.52, 0.8, 0);
        group.add(banner);

        group.userData.smokePosition = new THREE.Vector3(-0.7, 2.0, 0);

        group.name = 'barracks';
        return group;
    },

    // --- HOUSE (Log Cabin) ---
    createHouse(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);

        // Foundation
        const foundGeo = new THREE.BoxGeometry(1.6, 0.1, 1.6);
        const found = new THREE.Mesh(foundGeo, materials.wallDark);
        found.position.y = 0.05;
        found.receiveShadow = true;
        group.add(found);

        // Lower wall block (Logs)
        const wallGeo1 = new THREE.BoxGeometry(1.4, 0.8, 1.4);
        const walls1 = new THREE.Mesh(wallGeo1, materials.wood);
        walls1.position.y = 0.5;
        walls1.castShadow = true;
        group.add(walls1);

        // Pitched Roof
        const roofGeo = new THREE.ConeGeometry(1.2, 0.6, 4);
        const roof = new THREE.Mesh(roofGeo, materials.roofDark);
        roof.position.set(0, 1.2, 0);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        // Door arch
        const doorGeo = new THREE.BoxGeometry(0.3, 0.4, 0.05);
        const door = new THREE.Mesh(doorGeo, materials.woodLight);
        door.position.set(-0.2, 0.3, 0.72);
        group.add(door);

        // Small pot prop
        const potGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.15, 6);
        const pot = new THREE.Mesh(potGeo, materials.wallDark);
        pot.position.set(0.5, 0.125, 0.85);
        group.add(pot);

        group.name = 'house';
        return group;
    },

    // --- FARM ---
    createFarm() {
        const group = new THREE.Group();

        // Plowed soil
        const soilGeo = new THREE.BoxGeometry(2.2, 0.06, 2.2);
        const soil = new THREE.Mesh(soilGeo, materials.dirt);
        soil.position.y = 0.03;
        soil.receiveShadow = true;
        group.add(soil);

        // Fence posts
        const postGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4);
        const railGeo = new THREE.BoxGeometry(0.02, 0.02, 1.1);
        [[-1.1, 0], [1.1, 0], [0, -1.1], [0, 1.1]].forEach(([x, z]) => {
            [-0.5, 0, 0.5].forEach(offset => {
                const post = new THREE.Mesh(postGeo, materials.wood);
                if (x !== 0) post.position.set(x, 0.15, offset);
                else post.position.set(offset, 0.15, z);
                group.add(post);
            });
        });

        // Crops in rows
        const leafGeo = new THREE.BoxGeometry(0.15, 0.25, 0.01);
        const wheatGeo = new THREE.BoxGeometry(0.12, 0.35, 0.01);

        for (let row = -0.8; row <= 0.8; row += 0.35) {
            for (let col = -0.8; col <= 0.8; col += 0.2) {
                const isWheat = Math.random() > 0.3;
                const mat = isWheat ? materials.wheat : materials.leaves;
                const geo = isWheat ? wheatGeo : leafGeo;
                
                const crop = new THREE.Group();
                
                const blade1 = new THREE.Mesh(geo, mat);
                blade1.rotation.y = Math.random() * Math.PI;
                crop.add(blade1);
                
                const blade2 = new THREE.Mesh(geo, mat);
                blade2.rotation.y = blade1.rotation.y + Math.PI / 2;
                crop.add(blade2);
                
                crop.position.set(
                    row + (Math.random() - 0.5) * 0.06,
                    isWheat ? 0.17 : 0.12,
                    col + (Math.random() - 0.5) * 0.06
                );
                group.add(crop);
            }
        }

        group.name = 'farm';
        return group;
    },

    // --- TOWER (Wooden Watchtower) ---
    createTower(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);

        // Square stone base
        const baseGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const base = new THREE.Mesh(baseGeo, materials.wallDark);
        base.position.y = 0.6;
        base.receiveShadow = true;
        base.castShadow = true;
        group.add(base);

        // Wooden scaffolding body
        const towerGeo = new THREE.BoxGeometry(0.8, 2.4, 0.8);
        const tower = new THREE.Mesh(towerGeo, materials.wood);
        tower.position.y = 2.4;
        tower.castShadow = true;
        tower.receiveShadow = true;
        group.add(tower);

        // Balcony
        const balcGeo = new THREE.BoxGeometry(1.4, 0.2, 1.4);
        const balc = new THREE.Mesh(balcGeo, materials.woodLight);
        balc.position.y = 3.5;
        group.add(balc);

        // Roof
        const roofGeo = new THREE.ConeGeometry(1.0, 1.0, 4);
        const roof = new THREE.Mesh(roofGeo, materials.roofDark);
        roof.position.y = 4.1;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        // Torch mount position
        group.userData.torchPositions = [new THREE.Vector3(0, 4.8, 0)];

        group.name = 'tower';
        return group;
    },

    // --- RESOURCES ---
    createTree() {
        const group = new THREE.Group();

        const heightScale = 0.88 + Math.random() * 0.55;
        const trunkHeight = 1.15 * heightScale;
        const trunkGeo = new THREE.CylinderGeometry(0.10, 0.16, trunkHeight, 8);
        const trunk = new THREE.Mesh(trunkGeo, materials.bark);
        trunk.position.y = trunkHeight * 0.5;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);

        const topSpireGeo = new THREE.CylinderGeometry(0.035, 0.07, 0.5 * heightScale, 6);
        const topSpire = new THREE.Mesh(topSpireGeo, materials.bark);
        topSpire.position.y = trunkHeight + 0.1 * heightScale;
        topSpire.castShadow = true;
        group.add(topSpire);

        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
            const rootGeo = new THREE.SphereGeometry(0.09, 5, 4);
            const root = new THREE.Mesh(rootGeo, materials.bark);
            root.position.set(Math.cos(a) * 0.15, 0.05, Math.sin(a) * 0.15);
            root.scale.set(1.2, 0.45, 1.0);
            group.add(root);
        }

        const branchLevels = 3 + Math.floor(Math.random() * 2);
        for (let i = 0; i < branchLevels; i++) {
            const levelY = 0.7 * heightScale + i * 0.34;
            const branchCount = 4 + Math.floor(Math.random() * 2);
            for (let j = 0; j < branchCount; j++) {
                const branch = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.018, 0.028, 0.42 + Math.random() * 0.14, 5),
                    materials.bark
                );
                const angle = (j / branchCount) * Math.PI * 2 + Math.random() * 0.22;
                branch.position.set(Math.cos(angle) * 0.12, levelY, Math.sin(angle) * 0.12);
                branch.rotation.z = 1.1 + Math.random() * 0.18;
                branch.rotation.y = angle;
                branch.castShadow = true;
                group.add(branch);
            }
        }

        const canopyLayers = [
            { radius: 0.72, height: 0.8, y: trunkHeight + 0.20, mat: materials.leavesDark },
            { radius: 0.58, height: 0.72, y: trunkHeight + 0.65, mat: materials.leaves },
            { radius: 0.44, height: 0.62, y: trunkHeight + 1.02, mat: materials.leavesLight },
            { radius: 0.28, height: 0.42, y: trunkHeight + 1.34, mat: materials.leavesLight }
        ];

        canopyLayers.forEach((layer, idx) => {
            const cone = new THREE.Mesh(
                new THREE.ConeGeometry(layer.radius * heightScale, layer.height * heightScale, 8),
                layer.mat
            );
            cone.position.y = layer.y;
            cone.castShadow = true;
            group.add(cone);

            if (idx < 3) {
                const puff = new THREE.Mesh(
                    new THREE.SphereGeometry((layer.radius * 0.33) * heightScale, 6, 5),
                    idx === 0 ? materials.leavesDark : materials.leaves
                );
                puff.position.set(
                    (Math.random() - 0.5) * 0.18,
                    layer.y + 0.08,
                    (Math.random() - 0.5) * 0.18
                );
                puff.scale.set(1.4, 0.8, 1.25);
                puff.castShadow = true;
                group.add(puff);
            }
        });

        group.name = 'tree';
        return group;
    },

    // --- ANIMALS ---
    createDeer() {
        const group = new THREE.Group();
        // Body
        const bodyGeo = new THREE.BoxGeometry(0.12, 0.15, 0.25);
        const body = new THREE.Mesh(bodyGeo, materials.leather);
        body.position.y = 0.25;
        body.castShadow = true;
        group.add(body);
        // Legs
        const legGeo = new THREE.CylinderGeometry(0.015, 0.01, 0.2);
        [[-0.04, 0.08], [0.04, 0.08], [-0.04, -0.08], [0.04, -0.08]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeo, materials.leather);
            leg.position.set(x, 0.1, z);
            leg.castShadow = true;
            group.add(leg);
        });
        // Neck & Head
        const neckGeo = new THREE.BoxGeometry(0.06, 0.15, 0.06);
        const neck = new THREE.Mesh(neckGeo, materials.leather);
        neck.position.set(0, 0.35, 0.12);
        neck.rotation.x = 0.3;
        group.add(neck);
        const headGeo = new THREE.BoxGeometry(0.08, 0.08, 0.12);
        const head = new THREE.Mesh(headGeo, materials.leather);
        head.position.set(0, 0.42, 0.15);
        group.add(head);
        // Antlers
        const antlerGeo = new THREE.CylinderGeometry(0.005, 0.01, 0.15);
        const a1 = new THREE.Mesh(antlerGeo, materials.woodLight);
        a1.position.set(-0.03, 0.5, 0.12);
        a1.rotation.z = -0.3;
        a1.rotation.x = -0.2;
        group.add(a1);
        const a2 = new THREE.Mesh(antlerGeo, materials.woodLight);
        a2.position.set(0.03, 0.5, 0.12);
        a2.rotation.z = 0.3;
        a2.rotation.x = -0.2;
        group.add(a2);

        group.name = 'deer';
        return group;
    },

    createBear() {
        const group = new THREE.Group();
        // Body (thick)
        const bodyGeo = new THREE.BoxGeometry(0.25, 0.3, 0.45);
        const body = new THREE.Mesh(bodyGeo, materials.pants);
        body.position.y = 0.25;
        body.castShadow = true;
        group.add(body);
        // Legs (stubby)
        const legGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.15);
        [[-0.1, 0.15], [0.1, 0.15], [-0.1, -0.15], [0.1, -0.15]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeo, materials.pants);
            leg.position.set(x, 0.075, z);
            leg.castShadow = true;
            group.add(leg);
        });
        // Head
        const headGeo = new THREE.BoxGeometry(0.18, 0.18, 0.22);
        const head = new THREE.Mesh(headGeo, materials.pants);
        head.position.set(0, 0.35, 0.28);
        group.add(head);
        // Ears
        const earGeo = new THREE.SphereGeometry(0.04);
        const e1 = new THREE.Mesh(earGeo, materials.pants);
        e1.position.set(-0.08, 0.45, 0.22);
        group.add(e1);
        const e2 = new THREE.Mesh(earGeo, materials.pants);
        e2.position.set(0.08, 0.45, 0.22);
        group.add(e2);

        group.name = 'bear';
        return group;
    },

    createGoldNode() {
        const group = new THREE.Group();

        // Dark rock base
        const rockGeo = new THREE.DodecahedronGeometry(0.55);
        const rock = new THREE.Mesh(rockGeo, materials.stoneDark);
        rock.position.y = 0.3;
        rock.castShadow = true;
        group.add(rock);

        // Secondary rock
        const rock2Geo = new THREE.DodecahedronGeometry(0.35);
        const rock2 = new THREE.Mesh(rock2Geo, materials.stone);
        rock2.position.set(0.3, 0.2, 0.2);
        rock2.castShadow = true;
        group.add(rock2);

        // Golden crystal formations
        const crystalGeo = new THREE.ConeGeometry(0.1, 0.45, 5);
        const crystalData = [
            [0.15, 0.55, 0.1, 0.4, 0, 0],
            [-0.2, 0.5, 0.2, -0.3, 0.3, 0],
            [0.1, 0.6, -0.25, 0, -0.3, 0.4],
            [-0.25, 0.4, -0.15, -0.2, -0.2, -0.3],
            [0.3, 0.35, 0.15, 0.3, 0.2, 0.2],
        ];
        crystalData.forEach(([px, py, pz, rx, ry, rz]) => {
            const crystal = new THREE.Mesh(crystalGeo, materials.gold);
            crystal.position.set(px, py, pz);
            crystal.rotation.set(rx, ry, rz);
            crystal.castShadow = true;
            group.add(crystal);
        });

        // Gold sparkle point light
        const sparkle = new THREE.PointLight(0xFFD700, 0.3, 3);
        sparkle.position.set(0, 0.6, 0);
        group.add(sparkle);

        group.name = 'gold';
        return group;
    },

    createStoneNode() {
        const group = new THREE.Group();

        const stoneMatDark = new THREE.MeshStandardMaterial({ color: 0x6B7280, roughness: 0.95, metalness: 0.05, flatShading: true });
        const stoneMatLight = new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.9, metalness: 0.05, flatShading: true });

        const baseGeo = new THREE.DodecahedronGeometry(0.8);
        const base = new THREE.Mesh(baseGeo, stoneMatDark);
        base.position.y = 0.28;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const rockData = [
            [0.55, 0.5, 0.55, 0, 0.25, 0],
            [0.4, 0.38, 0.4, 0.35, 0.2, -0.3],
            [0.38, 0.42, 0.5, -0.3, 0.18, 0.2],
        ];
        rockData.forEach(([sx, sy, sz, px, py, pz]) => {
            const geo = new THREE.DodecahedronGeometry(1);
            const mesh = new THREE.Mesh(geo, Math.random() > 0.5 ? stoneMatLight : stoneMatDark);
            mesh.scale.set(sx, sy, sz);
            mesh.position.set(px, py, pz);
            mesh.rotation.set(Math.random(), Math.random(), 0);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
        });

        group.name = 'stone';
        return group;
    },

    createFishZone() {
        const group = new THREE.Group();
        
        // Bubbles / ripples
        for (let i = 0; i < 4; i++) {
            const ripple = new THREE.Mesh(
                new THREE.RingGeometry(0.1, 0.15, 12),
                new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
            );
            ripple.rotation.x = Math.PI / 2;
            ripple.position.set((Math.random() - 0.5) * 0.8, 0.05, (Math.random() - 0.5) * 0.8);
            group.add(ripple);
        }

        // Add fishes
        const fishGeo = new THREE.ConeGeometry(0.08, 0.25, 4);
        fishGeo.rotateX(Math.PI / 2);
        const fishMat = new THREE.MeshStandardMaterial({color: 0x3b82f6});
        for (let i = 0; i < 5; i++) {
            const fish = new THREE.Mesh(fishGeo, fishMat);
            fish.position.set((Math.random() - 0.5) * 1.5, -0.05, (Math.random() - 0.5) * 1.5);
            fish.rotation.y = Math.random() * Math.PI * 2;
            group.add(fish);
        }

        group.name = 'fishzone';
        return group;
    },

    createForageNode() {
        const group = new THREE.Group();

        // Bush body (multiple overlapping spheres for fullness)
        const bushParts = [
            [0, 0.35, 0, 0.45],
            [0.2, 0.3, 0.15, 0.3],
            [-0.2, 0.3, 0.1, 0.32],
            [0.1, 0.4, -0.2, 0.28],
        ];
        bushParts.forEach(([x, y, z, r]) => {
            const geo = new THREE.SphereGeometry(r, 8, 6);
            const bush = new THREE.Mesh(geo, materials.leaves);
            bush.position.set(x, y, z);
            bush.castShadow = true;
            group.add(bush);
        });

        // Berries
        const berryGeo = new THREE.SphereGeometry(0.05, 4, 4);
        const berryMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.25, metalness: 0.1 });
        const berryPositions = [
            [0.2, 0.5, 0.35], [-0.25, 0.55, 0.15], [0.35, 0.4, -0.15],
            [-0.1, 0.45, -0.35], [0, 0.6, 0.1], [-0.35, 0.3, 0.05],
            [0.15, 0.35, 0.25], [-0.15, 0.5, -0.2],
        ];
        berryPositions.forEach(([x, y, z]) => {
            const berry = new THREE.Mesh(berryGeo, berryMat);
            berry.position.set(x, y, z);
            group.add(berry);
        });

        group.name = 'forage';
        return group;
    },

    createArrow() {
        const group = new THREE.Group();
        const shaftGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.4, 4);
        const shaft = new THREE.Mesh(shaftGeo, materials.wood);
        shaft.rotation.x = Math.PI / 2;
        group.add(shaft);
        const tipGeo = new THREE.ConeGeometry(0.035, 0.1, 4);
        const tip = new THREE.Mesh(tipGeo, materials.metal);
        tip.rotation.x = Math.PI / 2;
        tip.position.z = 0.22;
        group.add(tip);
        const featherGeo = new THREE.BoxGeometry(0.01, 0.05, 0.07);
        const feather = new THREE.Mesh(featherGeo, new THREE.MeshBasicMaterial({ color: 0xEEEEEE }));
        feather.position.z = -0.16;
        group.add(feather);
        const feather2 = feather.clone();
        feather2.rotation.z = Math.PI / 2;
        group.add(feather2);
        return group;
    },

    createCannonball() {
        const group = new THREE.Group();
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), materials.metalDark || new THREE.MeshBasicMaterial({color: 0x222222}));
        group.add(sphere);
        const fire = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({color: 0xff4400, transparent: true, opacity: 0.7}));
        group.add(fire);
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({color: 0xffaa00, transparent: true, opacity: 0.9}));
        group.add(core);
        group.userData.isCannonball = true;
        return group;
    },

    createWoodWall(faction) {
        const group = new THREE.Group();
        const bannerMat = getFactionMat(faction, false);

        const logsNum = 5;
        const spacing = 0.4;
        const startX = -((logsNum - 1) * spacing) / 2;

        const logGeo = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 6);
        for(let i=0; i<logsNum; i++) {
            const log = new THREE.Mesh(logGeo, materials.wood);
            log.position.set(startX + i * spacing, 1.25, 0);
            
            // Randomize height and tilt slightly for rustic look
            log.position.y += (Math.random() * 0.4 - 0.2);
            log.rotation.z = (Math.random() * 0.1 - 0.05);
            log.rotation.x = (Math.random() * 0.1 - 0.05);
            
            // Add spikes on top
            const spikeGeo = new THREE.ConeGeometry(0.15, 0.5, 6);
            const spike = new THREE.Mesh(spikeGeo, materials.wood);
            spike.position.y = 1.25 + 0.25;
            log.add(spike);

            log.castShadow = true;
            log.receiveShadow = true;
            group.add(log);
        }

        // Horizontal binding log
        const bindGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 5);
        bindGeo.rotateZ(Math.PI / 2);
        const bind1 = new THREE.Mesh(bindGeo, materials.wood);
        bind1.position.set(0, 1.5, 0.15);
        const bind2 = new THREE.Mesh(bindGeo, materials.wood);
        bind2.position.set(0, 0.8, -0.15);
        
        group.add(bind1);
        group.add(bind2);

        // Faction banner
        const bannerGeo = new THREE.PlaneGeometry(0.6, 0.8);
        const banner = new THREE.Mesh(bannerGeo, bannerMat);
        banner.position.set(0, 1.5, 0.25);
        group.add(banner);

        group.userData.isBuilding = true;
        return group;
    },

    createStoneWall(faction) {
        const group = new THREE.Group();
        const stripeMat = getFactionMat(faction, false);

        // Main wall block
        const wallGeo = new THREE.BoxGeometry(2.5, 2.5, 1.0);
        const wall = new THREE.Mesh(wallGeo, materials.stone);
        wall.position.y = 1.25;
        wall.castShadow = true;
        wall.receiveShadow = true;
        group.add(wall);

        // Crenellations (top teeth)
        const toothGeo = new THREE.BoxGeometry(0.6, 0.5, 1.0);
        for(let i=0; i<3; i++) {
            const tooth = new THREE.Mesh(toothGeo, materials.stone);
            tooth.position.set(-0.8 + i*0.8, 2.75, 0);
            tooth.castShadow = true;
            group.add(tooth);
        }

        // Faction colored stripe/banner
        const stripeGeo = new THREE.PlaneGeometry(2.5, 0.5);
        const stripe1 = new THREE.Mesh(stripeGeo, stripeMat);
        stripe1.position.set(0, 1.5, 0.51);
        const stripe2 = new THREE.Mesh(stripeGeo, stripeMat);
        stripe2.position.set(0, 1.5, -0.51);
        
        group.add(stripe1);
        group.add(stripe2);

        group.userData.isBuilding = true;
        return group;
    },

    // ===== AGE 2 BUILDINGS =====
    createStable(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Main barn
        const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 2.4), materials.wood);
        base.position.y = 0.8; base.castShadow = true; group.add(base);
        // Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.0, 4), materials.roof);
        roof.position.y = 2.1; roof.rotation.y = Math.PI / 4; roof.castShadow = true; group.add(roof);
        // Stall dividers
        for (let i = -1; i <= 1; i++) {
            const div = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.2, 2.0), materials.woodLight);
            div.position.set(i * 0.8, 0.6, 0); group.add(div);
        }
        // Door opening
        const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.1), mat);
        door.position.set(0, 0.6, 1.25); group.add(door);
        // Fence
        const fence = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.4, 0.08), materials.wood);
        fence.position.set(0, 0.2, 1.8); group.add(fence);
        return group;
    },

    createMarket(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Platform
        const platform = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.15, 2.5), materials.wood);
        platform.position.y = 0.08; group.add(platform);
        // Tent poles
        for (let x = -1; x <= 1; x += 2) {
            for (let z = -0.8; z <= 0.8; z += 1.6) {
                const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6), materials.wood);
                pole.position.set(x * 1.2, 1.0, z); group.add(pole);
            }
        }
        // Tent roof (cloth)
        const tent = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 2.2), mat);
        tent.position.y = 2.0; group.add(tent);
        // Counter/stall
        const counter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 0.4), materials.woodLight);
        counter.position.set(0, 0.3, 0.7); group.add(counter);
        // Goods (colored boxes)
        const goods = [0xf59e0b, 0xef4444, 0x10b981];
        goods.forEach((c, i) => {
            const g = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshStandardMaterial({color: c, roughness: 0.6}));
            g.position.set(-0.6 + i * 0.6, 0.75, 0.7); group.add(g);
        });
        return group;
    },

    createBlacksmith(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Main building
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.0), materials.stoneDark);
        base.position.y = 0.9; base.castShadow = true; group.add(base);
        // Roof
        const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 2.4), materials.roofDark);
        roof.position.y = 1.85; group.add(roof);
        // Chimney
        const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 0.5), materials.stoneDark);
        chimney.position.set(0.8, 2.5, -0.5); chimney.castShadow = true; group.add(chimney);
        group.userData.smokePosition = new THREE.Vector3(0.8, 3.3, -0.5);
        // Anvil
        const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), materials.metal);
        anvil.position.set(-0.5, 0.15, 1.2); group.add(anvil);
        // Forge glow
        const glow = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.1), new THREE.MeshBasicMaterial({color: 0xff4400}));
        glow.position.set(0, 0.5, 1.05); group.add(glow);
        // Banner
        const banner = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.3), mat);
        banner.position.set(-1.2, 1.6, 0); group.add(banner);
        return group;
    },

    // ===== AGE 3 BUILDINGS =====
    createCastle(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Main keep
        const keep = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.0, 3.5), materials.wall);
        keep.position.y = 1.5; keep.castShadow = true; group.add(keep);
        // 4 corner towers
        const corners = [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]];
        corners.forEach(([cx, cz]) => {
            const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 3.8, 8), materials.wallDark);
            tower.position.set(cx, 1.9, cz); tower.castShadow = true; group.add(tower);
            const cap = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.8, 8), mat);
            cap.position.set(cx, 4.2, cz); group.add(cap);
        });
        // Battlements
        for (let i = -1; i <= 1; i++) {
            const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), materials.wall);
            merlon.position.set(i * 1.0, 3.25, 1.75); group.add(merlon);
            const merlon2 = merlon.clone();
            merlon2.position.set(i * 1.0, 3.25, -1.75); group.add(merlon2);
        }
        // Gate
        const gate = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.6, 0.15), materials.wood);
        gate.position.set(0, 0.8, 1.8); group.add(gate);
        return group;
    },

    createSiegeWorkshop(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Open shed
        const floor = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.1, 2.5), materials.dirt);
        floor.position.y = 0.05; group.add(floor);
        // Support pillars
        for (let x = -1.2; x <= 1.2; x += 2.4) {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), materials.wood);
            pillar.position.set(x, 1.1, 1.0); group.add(pillar);
            const pillar2 = pillar.clone();
            pillar2.position.set(x, 1.1, -1.0); group.add(pillar2);
        }
        // Roof
        const roof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 2.8), materials.wood);
        roof.position.y = 2.2; roof.rotation.x = 0.1; group.add(roof);
        // Siege equipment (log ram)
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.0, 6), materials.bark);
        log.position.set(0, 0.3, 0); log.rotation.z = Math.PI / 2; group.add(log);
        // Wheels
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 6, 12), materials.wood);
        wheel.position.set(-0.8, 0.3, 0.5); wheel.rotation.y = Math.PI / 2; group.add(wheel);
        // Banner
        const banner = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.4), mat);
        banner.position.set(1.5, 1.8, 0); group.add(banner);
        return group;
    },

    createMonastery(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Main building
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.2, 2.0), materials.wall);
        base.position.y = 1.1; base.castShadow = true; group.add(base);
        // Bell tower
        const tower = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.5, 0.8), materials.wall);
        tower.position.set(0, 2.35, 0); tower.castShadow = true; group.add(tower);
        // Spire
        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.5, 6), mat);
        spire.position.set(0, 4.35, 0); group.add(spire);
        // Arched windows
        for (let z = -0.5; z <= 0.5; z += 1.0) {
            const win = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.3), materials.window);
            win.position.set(1.28, 1.2, z); group.add(win);
        }
        // Roof
        const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 2.3), materials.roof);
        roof.position.y = 2.25; group.add(roof);
        return group;
    },

    // ===== AGE 4 BUILDINGS =====
    createUniversity(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Main hall
        const hall = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, 2.5), materials.wall);
        hall.position.y = 1.0; hall.castShadow = true; group.add(hall);
        // Columns
        for (let x = -1.2; x <= 1.2; x += 0.6) {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.0, 8), materials.stone);
            col.position.set(x, 1.0, 1.3); col.castShadow = true; group.add(col);
        }
        // Pediment (triangular front)
        const pediment = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.8, 3), mat);
        pediment.position.set(0, 2.4, 1.0); pediment.rotation.x = Math.PI / 2;
        pediment.rotation.z = Math.PI; group.add(pediment);
        // Dome
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
        dome.position.set(0, 2.0, -0.3); group.add(dome);
        // Book/scroll (decoration)
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.2), new THREE.MeshStandardMaterial({color: 0x8B4513, roughness: 0.8}));
        book.position.set(0, 0.1, 1.5); group.add(book);
        return group;
    },

    createFortress(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Thick walls
        const walls = [
            [0, 0, 1.8, 0.3, 2.5, 4.0],   // front
            [0, 0, -1.8, 0.3, 2.5, 4.0],   // back
            [-2.0, 0, 0, 4.0, 2.5, 0.3],   // left
            [2.0, 0, 0, 4.0, 2.5, 0.3],    // right
        ];
        walls.forEach(([x, y, z, w, h, d]) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(w === 0.3 ? 4.0 : w, h, d === 0.3 ? 4.0 : d), materials.wallDark);
            wall.position.set(x, h / 2, z); wall.castShadow = true; group.add(wall);
        });
        // Corner turrets
        const corners = [[-2, -2], [2, -2], [-2, 2], [2, 2]];
        corners.forEach(([cx, cz]) => {
            const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.65, 3.2, 8), materials.wallDark);
            turret.position.set(cx, 1.6, cz); turret.castShadow = true; group.add(turret);
            const cap = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.0, 8), mat);
            cap.position.set(cx, 3.7, cz); group.add(cap);
        });
        // Inner tower
        const inner = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.5, 1.5), materials.wall);
        inner.position.set(0, 1.75, 0); inner.castShadow = true; group.add(inner);
        // Flag
        const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 4), materials.metal);
        flagPole.position.set(0, 4.5, 0); group.add(flagPole);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.03), mat);
        flag.position.set(0.3, 5.3, 0); group.add(flag);
        return group;
    },

    createTreasury(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Vault body
        const vault = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.8, 2.0), materials.stone);
        vault.position.y = 0.9; vault.castShadow = true; group.add(vault);
        // Gold trim
        const trim = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 2.1), materials.gold);
        trim.position.y = 1.85; group.add(trim);
        const trimBot = trim.clone();
        trimBot.position.y = 0.05; group.add(trimBot);
        // Vault door
        const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.1), materials.metal);
        door.position.set(0, 0.7, 1.05); group.add(door);
        // Gold pile inside (visible through front)
        const pile = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.4, 8), materials.gold);
        pile.position.set(0, 0.2, 0); group.add(pile);
        // Columns
        for (let x = -1; x <= 1; x += 2) {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.8, 8), materials.gold);
            col.position.set(x * 1.0, 0.9, 1.1); group.add(col);
        }
        // Banner
        const banner = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.3), mat);
        banner.position.set(1.3, 1.5, 0); group.add(banner);
        return group;
    },

    // ===== AGE 5 BUILDINGS =====
    createTemple(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Stepped base
        const step1 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.3, 3.5), materials.stone);
        step1.position.y = 0.15; group.add(step1);
        const step2 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 3.0), materials.stone);
        step2.position.y = 0.45; group.add(step2);
        // Main hall
        const hall = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.5, 2.5), materials.wall);
        hall.position.y = 1.85; hall.castShadow = true; group.add(hall);
        // 6 front columns
        for (let x = -1.0; x <= 1.0; x += 0.5) {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.5, 8), materials.stone);
            col.position.set(x, 1.85, 1.4); col.castShadow = true; group.add(col);
        }
        // Grand dome
        const dome = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), materials.gold);
        dome.position.set(0, 3.1, 0); group.add(dome);
        // Spire atop dome
        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.0, 6), materials.gold);
        spire.position.set(0, 4.2, 0); group.add(spire);
        // Glowing orb
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({color: 0xffd700}));
        orb.position.set(0, 4.8, 0); group.add(orb);
        return group;
    },

    createTitanForge(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Rocky base
        const base = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 2.5), materials.stoneDark);
        base.position.y = 0.5; base.castShadow = true; group.add(base);
        // Forge pit (lava glow)
        const pit = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 1.5), new THREE.MeshBasicMaterial({color: 0xff4400}));
        pit.position.set(0, 1.05, 0); group.add(pit);
        // Volcanic columns
        for (let x = -1; x <= 1; x += 2) {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3.0, 6), materials.stoneDark);
            col.position.set(x * 1.0, 1.5, 0); col.castShadow = true; group.add(col);
            // Fire glow on top
            const fire = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), new THREE.MeshBasicMaterial({color: 0xff6600}));
            fire.position.set(x * 1.0, 3.1, 0); group.add(fire);
        }
        // Anvil (large)
        const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.4), materials.metal);
        anvil.position.set(0, 1.25, 1.0); group.add(anvil);
        // Chain decorations
        const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 4), materials.metal);
        chain.position.set(0, 2.0, 0); chain.rotation.z = Math.PI / 6; group.add(chain);
        // Banner
        const banner = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.35), mat);
        banner.position.set(1.5, 1.8, 0); group.add(banner);
        group.userData.smokePosition = new THREE.Vector3(0, 3.5, 0);
        return group;
    },

    createWonder(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Grand stepped pyramid base
        for (let i = 0; i < 4; i++) {
            const s = 4.0 - i * 0.8;
            const step = new THREE.Mesh(new THREE.BoxGeometry(s, 0.6, s), materials.stone);
            step.position.y = 0.3 + i * 0.6; step.castShadow = true; group.add(step);
        }
        // Obelisk
        const obelisk = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.0, 0.6), materials.gold);
        obelisk.position.y = 4.2; obelisk.castShadow = true; group.add(obelisk);
        // Pyramid tip
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.0, 4), materials.gold);
        tip.position.y = 6.2; tip.rotation.y = Math.PI / 4; group.add(tip);
        // Glowing apex
        const apex = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({color: 0xffd700}));
        apex.position.y = 7.0; group.add(apex);
        // Corner pillars
        const corners = [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]];
        corners.forEach(([cx, cz]) => {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.0, 8), mat);
            pillar.position.set(cx, 1.5, cz); pillar.castShadow = true; group.add(pillar);
        });
        return group;
    },

    createFishMarket(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        
        // Wooden Pier / Dock
        const pier = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 2.8), materials.wood);
        pier.position.set(0, 0.25, -0.4); // Extends forward
        pier.castShadow = true;
        group.add(pier);

        // Pier stilts (pillars into water)
        const stilts = [[-0.7, 0.8], [0.7, 0.8], [-0.7, -1.6], [0.7, -1.6]];
        stilts.forEach(([cx, cz]) => {
            const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 4), materials.bark);
            stilt.position.set(cx, -0.2, cz);
            group.add(stilt);
        });

        // Market Stall on land side
        const stallBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.0), materials.wood);
        stallBase.position.set(0, 0.7, 0.5);
        stallBase.castShadow = true;
        group.add(stallBase);

        // Stall Roof (Canvas/Cloth)
        const roof = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.6, 4), mat);
        roof.rotation.y = Math.PI / 4;
        roof.position.set(0, 1.4, 0.5);
        roof.castShadow = true;
        group.add(roof);

        // Hanging fish decorations
        for (let i = -0.4; i <= 0.4; i += 0.4) {
            const fish = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 4), new THREE.MeshStandardMaterial({color: 0x88ccff}));
            fish.position.set(i, 0.8, 0.1);
            fish.rotation.z = Math.PI / 8;
            group.add(fish);
        }

        return group;
    },

    // ===== NEW UNIT MESH BUILDERS =====
    createKnight(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Horse body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 1.0), new THREE.MeshStandardMaterial({color: 0x8B4513, roughness: 0.7}));
        body.position.set(0, 0.5, 0); body.castShadow = true; group.add(body);
        // Horse legs
        for (let x = -0.15; x <= 0.15; x += 0.3) {
            for (let z = -0.3; z <= 0.3; z += 0.6) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 4), new THREE.MeshStandardMaterial({color: 0x6B3410, roughness: 0.7}));
                leg.position.set(x, 0.2, z); group.add(leg);
            }
        }
        // Horse head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.3), new THREE.MeshStandardMaterial({color: 0x8B4513, roughness: 0.7}));
        head.position.set(0, 0.7, 0.55); head.rotation.x = -0.3; group.add(head);
        // Rider torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.16), materials.chainmail);
        torso.position.set(0, 0.95, 0); torso.castShadow = true; group.add(torso);
        // Rider head
        const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), materials.skin);
        rHead.position.set(0, 1.18, 0); group.add(rHead);
        // Helmet
        const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), materials.metal);
        helmet.position.set(0, 1.2, 0); group.add(helmet);
        // Shield
        const shield = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.2), mat);
        shield.position.set(-0.16, 0.9, 0); group.add(shield);
        // Lance
        const lance = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4), materials.wood);
        lance.position.set(0.16, 1.1, 0.3); lance.rotation.x = -0.3; group.add(lance);
        return group;
    },

    createSpearman(faction) {
        const group = this.createSoldier(faction);
        // Replace sword with spear
        const sword = group.getObjectByName('sword');
        if (sword) group.remove(sword);
        const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.4, 4), materials.wood);
        spear.position.set(0.22, 0.9, 0.1); spear.name = 'spear';
        group.add(spear);
        const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 4), materials.metal);
        spearTip.position.set(0.22, 1.65, 0.1);
        group.add(spearTip);
        return group;
    },

    createCrossbowman(faction) {
        const group = this.createArcher(faction);
        // Slightly modify appearance
        group.traverse(child => {
            if (child.isMesh && child.material === materials.leather) {
                child.material = materials.chainmail;
            }
        });
        return group;
    },

    createSiegeRam(faction) {
        const group = new THREE.Group();
        const wrapper = new THREE.Group();
        group.add(wrapper);
        wrapper.rotation.y = -Math.PI / 2;
        const mat = getFactionMat(faction, false);
        // Wheeled frame
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.8), materials.wood);
        frame.position.set(0, 0.4, 0); frame.castShadow = true; wrapper.add(frame);
        // Battering ram log
        const ram = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.6, 6), materials.bark);
        ram.position.set(0, 0.5, 0); ram.rotation.z = Math.PI / 2; wrapper.add(ram);
        // Ram head (metal)
        const head = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 6), materials.metal);
        head.position.set(0.9, 0.5, 0); head.rotation.z = -Math.PI / 2; wrapper.add(head);
        // Wheels
        for (let z = -0.3; z <= 0.3; z += 0.6) {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 8), materials.wood);
            wheel.position.set(-0.4, 0.2, z); wheel.rotation.x = Math.PI / 2; wrapper.add(wheel);
            const w2 = wheel.clone();
            w2.position.set(0.4, 0.2, z); wrapper.add(w2);
        }
        // Canopy with faction color
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.7), mat);
        canopy.position.set(0, 0.7, 0); wrapper.add(canopy);
        return group;
    },

    createMonk(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Robe (long cone)
        const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.7, 8), new THREE.MeshStandardMaterial({color: 0xF5DEB3, roughness: 0.9}));
        robe.position.y = 0.35; robe.castShadow = true; group.add(robe);
        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.25, 0.14), new THREE.MeshStandardMaterial({color: 0xDEB887, roughness: 0.85}));
        torso.position.y = 0.82; group.add(torso);
        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), materials.skin);
        head.position.y = 1.02; group.add(head);
        // Hood
        const hood = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4, 0, Math.PI * 2, 0, Math.PI / 1.5), new THREE.MeshStandardMaterial({color: 0xDEB887, roughness: 0.85}));
        hood.position.y = 1.04; group.add(hood);
        // Staff
        const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4), materials.wood);
        staff.position.set(0.2, 0.6, 0); group.add(staff);
        // Healing orb (glowing)
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshBasicMaterial({color: 0x00ff88}));
        orb.position.set(0.2, 1.25, 0); group.add(orb);
        // Faction sash
        const sash = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.16), mat);
        sash.position.set(0, 0.72, 0); group.add(sash);
        return group;
    },

    createPaladin(faction) {
        const group = this.createKnight(faction);
        // Add armor plating to horse
        const armor = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.15, 0.9), materials.metalBright);
        armor.position.set(0, 0.75, 0); group.add(armor);
        // Add plume to helmet
        const plume = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.3), new THREE.MeshStandardMaterial({color: 0xDC143C, roughness: 0.5}));
        plume.position.set(0, 1.35, -0.05); group.add(plume);
        return group;
    },

    createCannon(faction) {
        const group = new THREE.Group();
        const wrapper = new THREE.Group();
        group.add(wrapper);
        wrapper.rotation.y = -Math.PI / 2;
        const mat = getFactionMat(faction, false);
        // Carriage
        const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.5), materials.wood);
        carriage.position.set(0, 0.2, 0); wrapper.add(carriage);
        // Barrel
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 1.0, 8), materials.metal);
        barrel.position.set(0.3, 0.45, 0); barrel.rotation.z = Math.PI / 2; wrapper.add(barrel);
        // Wheels
        for (let z = -0.2; z <= 0.2; z += 0.4) {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 8), materials.wood);
            wheel.position.set(-0.2, 0.18, z); wheel.rotation.x = Math.PI / 2; wrapper.add(wheel);
        }
        // Flag
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.03), mat);
        flag.position.set(-0.3, 0.5, 0); wrapper.add(flag);
        return group;
    },

    createEliteArcher(faction) {
        const group = this.createArcher(faction);
        // Add cape
        const cape = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 0.04), getFactionMat(faction, true));
        cape.position.set(0, 0.55, -0.12); group.add(cape);
        // Add crown/headband
        const crown = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 4, 8), materials.gold);
        crown.position.set(0, 0.92, 0); crown.rotation.x = Math.PI / 2; group.add(crown);
        return group;
    },

    createTitan(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Massive legs
        const legGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.8, 6);
        const leftLeg = new THREE.Mesh(legGeo, materials.stoneDark);
        leftLeg.position.set(-0.15, 0.4, 0); leftLeg.castShadow = true; 
        leftLeg.name = 'leftLeg';
        group.add(leftLeg);
        const rightLeg = leftLeg.clone();
        rightLeg.position.set(0.15, 0.4, 0); 
        rightLeg.name = 'rightLeg';
        group.add(rightLeg);
        // Massive torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.35), materials.chainmail);
        torso.position.y = 1.15; torso.castShadow = true; group.add(torso);
        // Armor plate
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.38), mat);
        plate.position.y = 1.35; group.add(plate);
        // Arms
        const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6);
        const leftArm = new THREE.Mesh(armGeo, materials.skin);
        leftArm.position.set(-0.35, 1.1, 0); leftArm.rotation.z = 0.2; 
        leftArm.name = 'leftArm';
        group.add(leftArm);
        const rightArm = leftArm.clone();
        rightArm.position.set(0.35, 1.1, 0); rightArm.rotation.z = -0.2; 
        rightArm.name = 'rightArm';
        group.add(rightArm);
        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), materials.skin);
        head.position.y = 1.68; head.castShadow = true; group.add(head);
        // Helmet with horns
        const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), materials.metal);
        helmet.position.y = 1.71; group.add(helmet);
        const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.3, 4), materials.gold);
        hornL.position.set(-0.18, 1.85, 0); hornL.rotation.z = 0.4; group.add(hornL);
        const hornR = hornL.clone();
        hornR.position.set(0.18, 1.85, 0); hornR.rotation.z = -0.4; group.add(hornR);
        // Giant sword
        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.04), materials.metalBright);
        sword.position.set(0.4, 1.2, 0.15); group.add(sword);
        // Glowing eyes
        const eyeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.04), new THREE.MeshBasicMaterial({color: 0xff4400}));
        eyeGlow.position.set(0, 1.72, 0.16); group.add(eyeGlow);
        // Scale up 1.8x
        group.scale.set(1.8, 1.8, 1.8);
        return group;
    },

    createWarElephant(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Elephant body (large)
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 1.4), new THREE.MeshStandardMaterial({color: 0x808080, roughness: 0.8}));
        body.position.set(0, 0.8, 0); body.castShadow = true; group.add(body);
        // Legs (4 thick pillars)
        let legIndex = 0;
        for (let x = -0.3; x <= 0.3; x += 0.6) {
            for (let z = -0.4; z <= 0.4; z += 0.8) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.7, 6), new THREE.MeshStandardMaterial({color: 0x707070, roughness: 0.8}));
                leg.position.set(x, 0.35, z); 
                leg.name = legIndex % 2 === 0 ? 'leftLeg' : 'rightLeg';
                group.add(leg);
                legIndex++;
            }
        }
        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshStandardMaterial({color: 0x808080, roughness: 0.8}));
        head.position.set(0, 1.0, 0.8); group.add(head);
        // Trunk
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.6, 6), new THREE.MeshStandardMaterial({color: 0x808080, roughness: 0.8}));
        trunk.position.set(0, 0.7, 1.15); trunk.rotation.x = 0.5; group.add(trunk);
        // Tusks
        for (let x = -0.12; x <= 0.12; x += 0.24) {
            const tusk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.01, 0.4, 4), new THREE.MeshStandardMaterial({color: 0xFFFDD0, roughness: 0.3}));
            tusk.position.set(x, 0.85, 1.0); tusk.rotation.x = 0.6; group.add(tusk);
        }
        // Howdah (riding platform)
        const howdah = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.6), mat);
        howdah.position.set(0, 1.3, 0); group.add(howdah);
        // Rider
        const rider = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.1), materials.chainmail);
        rider.position.set(0, 1.55, 0); group.add(rider);
        const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), materials.skin);
        rHead.position.set(0, 1.72, 0); group.add(rHead);
        // Ears
        for (let x = -0.25; x <= 0.25; x += 0.5) {
            const ear = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.04), new THREE.MeshStandardMaterial({color: 0x808080, roughness: 0.8}));
            ear.position.set(x, 1.0, 0.65); group.add(ear);
        }
        return group;
    },

    createChampion(faction) {
        const group = this.createSoldier(faction);
        // Add cape
        const cape = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.4, 0.04), getFactionMat(faction, true));
        cape.position.set(0, 0.55, -0.12); group.add(cape);
        // Add golden crown
        const crown = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 4, 8), materials.gold);
        crown.position.set(0, 0.95, 0); crown.rotation.x = Math.PI / 2; group.add(crown);
        // Add shoulder guards
        for (let x = -0.18; x <= 0.18; x += 0.36) {
            const guard = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), materials.metalBright);
            guard.position.set(x, 0.78, 0); group.add(guard);
        }
        // Scale up slightly
        group.scale.set(1.15, 1.15, 1.15);
        return group;
    },

    // ===== AGE 6 (SCI-FI) =====
    createRoboticLab(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Main tech body
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 2.5), materials.metalDark);
        body.position.y = 0.6; body.castShadow = true; group.add(body);
        // Neon trim
        const trim = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 2.6), new THREE.MeshBasicMaterial({color: 0x00ffff}));
        trim.position.y = 0.6; group.add(trim);
        // Power core on top
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshBasicMaterial({color: 0x00ffff}));
        core.position.y = 1.5; group.add(core);
        // Antennas
        const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 4), materials.metalBright);
        ant.position.set(-0.8, 1.5, -0.8); group.add(ant);
        return group;
    },

    createAirport(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Runway strip (long)
        const runway = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 4.0), materials.stone);
        runway.position.y = 0.05; runway.receiveShadow = true; group.add(runway);
        // Runway markings
        for (let z = -1.5; z <= 1.5; z += 0.5) {
            const mark = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.11, 0.3), materials.gold);
            mark.position.set(0, 0.05, z); group.add(mark);
        }
        // Hangar
        const hangar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.5, 16, 1, false, 0, Math.PI), materials.metalDark);
        hangar.rotation.z = Math.PI / 2;
        hangar.position.set(-0.8, 0, 0); hangar.castShadow = true; group.add(hangar);
        // Control Tower
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.0, 8), mat);
        tower.position.set(0.8, 1.0, 1.2); tower.castShadow = true; group.add(tower);
        const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.4, 8), new THREE.MeshBasicMaterial({color: 0x88ccff}));
        glass.position.set(0.8, 2.2, 1.2); group.add(glass);
        return group;
    },

    createFighterRobot(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.4), materials.metalDark);
        torso.position.y = 0.6; torso.castShadow = true; group.add(torso);
        // Head with glowing visor
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), materials.metalDark);
        head.position.y = 1.05; group.add(head);
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.08, 0.1), new THREE.MeshBasicMaterial({color: 0xff0000}));
        visor.position.set(0, 1.05, 0.15); group.add(visor);
        // Arm cannon (Right arm)
        const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), materials.metalBright);
        cannon.rotation.x = Math.PI / 2; cannon.position.set(0.35, 0.6, 0.2); group.add(cannon);
        // Left arm
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), mat);
        armL.position.set(-0.35, 0.5, 0); group.add(armL);
        // Legs
        const legR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.15), materials.metalDark);
        legR.position.set(0.15, 0.2, 0); group.add(legR);
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.15), materials.metalDark);
        legL.position.set(-0.15, 0.2, 0); group.add(legL);
        return group;
    },

    createHelicopter(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        // Main Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 1.2), materials.metalDark);
        body.position.set(0, 0.3, 0); body.castShadow = true; group.add(body);
        // Cockpit glass
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7, roughness: 0.1, metalness: 0.8 });
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.4), glassMat);
        glass.position.set(0, 0.35, 0.5); group.add(glass);
        // Tail
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.8), mat);
        tail.position.set(0, 0.3, -0.9); group.add(tail);
        // Main Rotor Blade
        const rotor = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.02, 0.1), materials.metalBright);
        rotor.position.set(0, 0.6, 0); rotor.name = 'mainRotor'; group.add(rotor);
        const rotor2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 2.0), materials.metalBright);
        rotor2.position.set(0, 0.6, 0); rotor2.name = 'mainRotor2'; group.add(rotor2);
        // Tail Rotor
        const tailRotor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.05), materials.metalBright);
        tailRotor.rotation.z = Math.PI / 2; tailRotor.position.set(0.1, 0.3, -1.2); tailRotor.name = 'tailRotor'; group.add(tailRotor);
        // Skids
        const skidL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 4), materials.metalBright);
        skidL.rotation.x = Math.PI / 2; skidL.position.set(-0.3, 0.05, 0); group.add(skidL);
        const skidR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 4), materials.metalBright);
        skidR.rotation.x = Math.PI / 2; skidR.position.set(0.3, 0.05, 0); group.add(skidR);
        
        // Wrap everything so it rotates properly to face +Z
        const wrapper = new THREE.Group();
        wrapper.add(group);
        return wrapper;
    },

    createFighterPlane(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        
        // Fuselage
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.0, 8), materials.metalDark);
        body.rotation.x = Math.PI / 2; body.castShadow = true; group.add(body);
        
        // Pointy Nose
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.8, 8), materials.metalDark);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 0, 1.4);
        group.add(nose);

        // Cockpit
        const glassGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x111111, transparent: true, opacity: 0.7, roughness: 0.1, metalness: 0.8 });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.scale.set(0.8, 1.2, 2.2);
        glass.position.set(0, 0.25, 0.4); group.add(glass);
        
        // Delta Wings
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0.6);      // Nose intersection
        wingShape.lineTo(-1.2, -0.8);  // Back left
        wingShape.lineTo(1.2, -0.8);   // Back right
        wingShape.lineTo(0, 0.6);
        const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 };
        const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
        wingGeo.rotateX(Math.PI / 2); // lay flat
        const wings = new THREE.Mesh(wingGeo, mat);
        wings.position.set(0, 0.04, 0); 
        group.add(wings);

        // Swept Vertical Stabilizer (Tail Fin)
        const tailShape = new THREE.Shape();
        tailShape.moveTo(0, 0.6);      // Top tip
        tailShape.lineTo(-0.4, 0);     // Back bottom
        tailShape.lineTo(0.4, 0);      // Front bottom
        tailShape.lineTo(0, 0.6);
        const tailGeo = new THREE.ExtrudeGeometry(tailShape, { depth: 0.06, bevelEnabled: false });
        tailGeo.rotateY(Math.PI / 2); // align along Z axis
        const vFin = new THREE.Mesh(tailGeo, mat);
        vFin.position.set(0.03, 0.25, -0.85);
        group.add(vFin);
        
        // Engine Exhaust
        const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 0.3, 8), new THREE.MeshBasicMaterial({color: 0x222222}));
        exhaust.rotation.x = Math.PI / 2;
        exhaust.position.set(0, 0, -1.15);
        group.add(exhaust);

        const wrapper = new THREE.Group();
        wrapper.add(group);
        return wrapper;
    },

    createFishBoat(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        
        // Hull
        const hull = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.8, 6), materials.wood);
        hull.rotation.x = Math.PI / 2;
        hull.position.set(0, 0.2, 0);
        hull.scale.set(1, 1, 0.5); // Flatten a bit
        hull.castShadow = true;
        group.add(hull);

        // Mast
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 4), materials.bark);
        mast.position.set(0, 0.8, -0.2);
        group.add(mast);

        // Sail
        const sail = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.05), mat);
        sail.position.set(0, 0.8, -0.15);
        group.add(sail);

        return group;
    },

    createWarShip(faction) {
        const group = new THREE.Group();
        const mat = getFactionMat(faction, false);
        
        // Hull
        const hull = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3.0, 8), materials.woodDark);
        hull.rotation.x = Math.PI / 2;
        hull.position.set(0, 0.4, 0);
        hull.scale.set(1, 1, 0.6); // Flatten
        hull.castShadow = true;
        group.add(hull);

        // Cannons
        for(let z = -0.5; z <= 0.5; z += 0.5) {
            for(let x = -1; x <= 1; x += 2) {
                const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.6, 6), materials.metalDark);
                cannon.rotation.z = Math.PI / 2 * x;
                cannon.position.set(x * 0.4, 0.6, z);
                group.add(cannon);
            }
        }

        // Mast 1
        const mast1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 4), materials.bark);
        mast1.position.set(0, 1.2, -0.4);
        group.add(mast1);
        const sail1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.05), mat);
        sail1.position.set(0, 1.2, -0.35);
        group.add(sail1);

        // Mast 2
        const mast2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 4), materials.bark);
        mast2.position.set(0, 1.0, 0.6);
        group.add(mast2);
        const sail2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.05), mat);
        sail2.position.set(0, 1.0, 0.65);
        group.add(sail2);

        return group;
    },

    createTransportBoat(faction) {
        const boat = new THREE.Group();
        const factionMat = getFactionMat(faction, false);
        const darkMat = getFactionMat(faction, true);
        const woodMat = materials.wood;
        
        const hullGeo = new THREE.BoxGeometry(2.4, 0.8, 5.0);
        const hull = new THREE.Mesh(hullGeo, woodMat);
        hull.position.y = 0.4;

        const deckGeo = new THREE.BoxGeometry(2.2, 0.2, 3.6);
        const deck = new THREE.Mesh(deckGeo, darkMat);
        deck.position.set(0, 0.9, 0.4);

        const cabinGeo = new THREE.BoxGeometry(1.4, 1.0, 1.2);
        const cabin = new THREE.Mesh(cabinGeo, factionMat);
        cabin.position.set(0, 1.2, -1.6);

        boat.add(hull);
        boat.add(deck);
        boat.add(cabin);

        boat.castShadow = true;
        boat.receiveShadow = true;
        return boat;
    }
};

// ========== BASE ENTITY CLASS ==========
export class GameEntity {
    constructor(id, faction, type, maxHealth, x, z) {
        this.id = id;
        this.faction = faction;
        this.type = type;
        this.health = maxHealth;
        this.maxHealth = maxHealth;
        this.dead = false;

        this.logicalX = x;
        this.logicalZ = z;

        const R = (window.game && window.game.world && window.game.world.sphereRadius) || 75;
        const elevation = (window.game && window.game.world && window.game.world.getElevationAtCoords(x, z)) || 0;
        this.position = getSpherePosition(x, z, elevation, R);

        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);
        this.alignMesh();

        this.radius = 0.5;
        this.isUnit = false;
        this.isBuilding = false;
        this.isResource = false;
    }

    alignMesh(forwardDir = null) {
        if (!this.mesh) return;
        this.mesh.position.copy(this.position);
        if (this.isFlying) return;
        if (forwardDir && forwardDir.lengthSq() > 0.001) {
            this.mesh.rotation.y = Math.atan2(forwardDir.x, forwardDir.z);
        }
    }

    takeDamage(amount, attacker) {
        if (this.dead) return;
        this.health = Math.max(0, this.health - amount);
        this.updateWorldHealthBar();
        
        if (this.health <= 0) {
            if (this.type === 'deer' || this.type === 'animal') {
                this.type = 'carcass';
                this.isResource = true;
                this.health = 100;
                this.updateWorldHealthBar();
                this.mesh.rotation.x = -Math.PI / 2; // Lay on ground
                this.mesh.position.y = 0.1;
                this.state = 'DEAD';
            } else if (this.type === 'carcass') {
                this.dead = true;
                if (this.scene) this.scene.remove(this.mesh);
            } else {
                this.dead = true;
                if (this.scene) this.scene.remove(this.mesh);
            }
        }
        
        // Damage Flash Vignette
        if (this.faction === game.localFaction && amount > 0) {
            const overlay = document.getElementById('damage-overlay');
            if (overlay) {
                overlay.classList.remove('flash');
                void overlay.offsetWidth; // trigger reflow
                overlay.classList.add('flash');
                
                // auto remove
                setTimeout(() => {
                    if (overlay) overlay.classList.remove('flash');
                }, 150);
            }
        }
        
        if (this.health <= 0) this.die();
    }

    die() { this.dead = true; }

    updateWorldHealthBar() {
        this.showHealthTimer = 3.0;
    }

    update(dt, world, game) {}

    destroy(scene) {
        if (this.mesh) {
            scene.remove(this.mesh);
        }
    }
}

// ========== PROJECTILE ==========
export class Projectile {
    constructor(scene, startPos, targetEntity, damage, speed = 15, game = null, type = 'arrow') {
        this.scene = scene;
        this.game = game;
        this.type = type;
        if (type === 'cannonball') this.mesh = meshBuilders.createCannonball();
        else if (type === 'missile') this.mesh = meshBuilders.createMissile();
        else if (type === 'laser') this.mesh = meshBuilders.createLaser();
        else this.mesh = meshBuilders.createArrow();
        
        this.mesh.position.copy(startPos);
        this.scene.add(this.mesh);
        this.target = targetEntity;
        this.damage = damage;
        this.speed = speed;
        this.dead = false;
    }

    update(dt) {
        if (this.dead) return;
        if (this.target.dead) { this.destroy(); return; }

        if (this.type === 'cannonball') {
            this.mesh.children[1].rotation.x += dt * 5;
            this.mesh.children[1].rotation.y += dt * 5;
            this.mesh.children[2].rotation.x -= dt * 7;
        }

        const dir = new THREE.Vector3().copy(this.target.position);
        const targetUp = this.target.position.clone().normalize();
        dir.addScaledVector(targetUp, 0.4);

        const currentPos = this.mesh.position;
        const distToTarget = currentPos.distanceTo(dir);
        if (distToTarget < 0.5) {
            this.target.takeDamage(this.damage, null);
            if (this.game && this.game.vfx) {
                if (this.type === 'cannonball') {
                    this.game.vfx.spawnSmoke(this.mesh.position);
                    this.game.vfx.spawnBuildDust(this.mesh.position);
                    audio.playExplosion(this.mesh.position);
                } else if (this.type === 'missile') {
                    this.game.vfx.spawnSmoke(this.mesh.position);
                    this.game.vfx.spawnBuildDust(this.mesh.position);
                    audio.playMissileBlast(this.mesh.position);
                } else if (this.type === 'laser') {
                    this.game.vfx.spawnSwordSparks(this.mesh.position);
                } else {
                    this.game.vfx.spawnArrowImpact(this.mesh.position);
                }
            }
            this.destroy();
            return;
        }

        const stepDist = this.speed * dt;
        const toTarget = dir.clone().sub(currentPos);
        const step = toTarget.clone().normalize().multiplyScalar(stepDist);
        currentPos.add(step);

        this.mesh.lookAt(dir);
    }

    destroy() {
        this.dead = true;
        this.scene.remove(this.mesh);
    }
}

function findPathAStar(world, startX, startZ, endX, endZ) {
    if (!world || !world._elevationGrid) return null;

    const segments = world._elevationSegments || 200;
    const size = world.mapSize || world.planeSize || 250;
    const halfSize = size / 2;
    const cellSize = size / segments;

    const toGrid = (wx, wz) => {
        let col = Math.round((wx + halfSize) / cellSize);
        let row = Math.round((wz + halfSize) / cellSize);
        col = Math.max(0, Math.min(segments, col));
        row = Math.max(0, Math.min(segments, row));
        return { col, row };
    };

    const toWorld = (col, row) => {
        const wx = col * cellSize - halfSize;
        const wz = row * cellSize - halfSize;
        const elev = world._elevationGrid[row][col];
        return new THREE.Vector3(wx, elev, wz);
    };

    const start = toGrid(startX, startZ);
    const end = toGrid(endX, endZ);

    if (start.col === end.col && start.row === end.row) return null;

    const isWalkable = (col, row) => {
        if (col < 0 || col > segments || row < 0 || row > segments) return false;
        return world._elevationGrid[row][col] >= -0.1;
    };

    const startInWater = world._elevationGrid[start.row][start.col] < -0.1;

    if (!isWalkable(end.col, end.row)) {
        let bestDist = Infinity;
        let bestCol = end.col;
        let bestRow = end.row;
        for (let r = 1; r <= 15; r++) {
            let found = false;
            for (let dc = -r; dc <= r; dc++) {
                for (let dr = -r; dr <= r; dr++) {
                    if (Math.abs(dc) !== r && Math.abs(dr) !== r) continue;
                    const nc = end.col + dc;
                    const nr = end.row + dr;
                    if (isWalkable(nc, nr)) {
                        const d = dc * dc + dr * dr;
                        if (d < bestDist) {
                            bestDist = d;
                            bestCol = nc;
                            bestRow = nr;
                            found = true;
                        }
                    }
                }
            }
            if (found) break;
        }
        end.col = bestCol;
        end.row = bestRow;
    }

    const getKey = (col, row) => row * 300 + col;

    const openList = [];
    const openSet = new Set();
    const closedSet = new Set();

    const gScore = new Map();
    const fScore = new Map();
    const cameFrom = new Map();

    const startKey = getKey(start.col, start.row);
    gScore.set(startKey, 0);
    fScore.set(startKey, Math.hypot(start.col - end.col, start.row - end.row));

    openList.push({ col: start.col, row: start.row, f: fScore.get(startKey) });
    openSet.add(startKey);

    let iterations = 0;
    const maxIterations = 1500;

    const getCost = (col, row) => {
        if (col < 0 || col > segments || row < 0 || row > segments) return Infinity;
        const elev = world._elevationGrid[row][col];
        if (elev < -0.1) {
            return startInWater ? 50.0 : Infinity;
        }
        return 1.0;
    };

    while (openList.length > 0 && iterations < maxIterations) {
        iterations++;
        openList.sort((a, b) => a.f - b.f);
        const current = openList.shift();
        const currentKey = getKey(current.col, current.row);
        openSet.delete(currentKey);

        if (current.col === end.col && current.row === end.row) {
            const path = [];
            let curr = currentKey;
            while (cameFrom.has(curr)) {
                const col = curr % 300;
                const row = Math.floor(curr / 300);
                path.push(toWorld(col, row));
                curr = cameFrom.get(curr);
            }
            path.reverse();
            return path;
        }

        closedSet.add(currentKey);

        const dirs = [
            { dc: 1, dr: 0, cost: 1 },
            { dc: -1, dr: 0, cost: 1 },
            { dc: 0, dr: 1, cost: 1 },
            { dc: 0, dr: -1, cost: 1 },
            { dc: 1, dr: 1, cost: 1.414 },
            { dc: -1, dr: 1, cost: 1.414 },
            { dc: 1, dr: -1, cost: 1.414 },
            { dc: -1, dr: -1, cost: 1.414 }
        ];

        for (const d of dirs) {
            const ncol = current.col + d.dc;
            const nrow = current.row + d.dr;
            const neighborKey = getKey(ncol, nrow);

            if (closedSet.has(neighborKey)) continue;

            const cost = getCost(ncol, nrow);
            if (cost === Infinity && neighborKey !== startKey) continue;

            const tentativeGScore = gScore.get(currentKey) + d.cost * cost;
            const currentG = gScore.has(neighborKey) ? gScore.get(neighborKey) : Infinity;

            if (tentativeGScore < currentG) {
                cameFrom.set(neighborKey, currentKey);
                gScore.set(neighborKey, tentativeGScore);
                const h = Math.hypot(ncol - end.col, nrow - end.row);
                const f = tentativeGScore + h;
                fScore.set(neighborKey, f);

                if (!openSet.has(neighborKey)) {
                    openList.push({ col: ncol, row: nrow, f });
                    openSet.add(neighborKey);
                } else {
                    const openNode = openList.find(n => n.col === ncol && n.row === nrow);
                    if (openNode) openNode.f = f;
                }
            }
        }
    }

    return null;
}

// ========== UNIT BASE CLASS ==========
export class Unit extends GameEntity {
    constructor(id, faction, type, maxHealth, x, z, speed) {
        super(id, faction, type, maxHealth, x, z);
        this.isUnit = true;
        this.speed = speed;
        this.radius = 0.35;
        this.targetPos = new THREE.Vector3().copy(this.position);
        this.targetEntity = null;
        this.state = 'IDLE';
        this.attackRange = 1.0;
        this.attackDamage = 8;
        this.attackCooldown = 1.5;
        this.attackTimer = 0;
        this.gatherTargetType = null;
        this.velocity = new THREE.Vector3();
        this.animTime = Math.random() * 10;
        this.autoMode = false;
        this.lastMoveSample = this.position.clone();
        this.stuckTimer = 0;
        this.pathWaypoints = [];
        this.pathFinalDest = null;
        this.lastPathfindTime = 0;
    }

    moveTo(x, z) {
        const R = (window.game && window.game.world && window.game.world.sphereRadius) || 75;
        const wrappedX = wrapX(x, R);
        const clampedZ = clampZ(z, R);
        const elevation = (window.game && window.game.world && window.game.world.getElevationAtCoords(wrappedX, clampedZ)) || 0;
        this.targetPos.copy(getSpherePosition(wrappedX, clampedZ, elevation, R));
        this.targetEntity = null;
        this.state = 'MOVE';
        this.pathWaypoints = [];
        this.pathFinalDest = null;
        this.stuckTimer = 0;
    }

    setOrder(state, target) {
        this.state = state;
        this.targetEntity = target;
        if (target) this.targetPos.copy(target.position);
        this.pathWaypoints = [];
        this.pathFinalDest = null;
        this.stuckTimer = 0;
    }

    getApproachPosition(target, extraDistance = 0) {
        const targetRadius = target && target.radius ? target.radius : 0.5;
        let ring = targetRadius + this.radius + extraDistance;
        if (target && target.type === 'farm') {
            // Walk inside the farmland deterministically
            ring = ((this.id % 10) / 10.0) * targetRadius * 0.8;
        }
        const angle = this.id * 2.399963229728653;
        const ax = target.position.x + Math.cos(angle) * ring;
        const az = target.position.z + Math.sin(angle) * ring;
        // Use terrain elevation instead of target's Y to avoid Y-axis distance mismatches
        const ay = (window.game && window.game.world && window.game.world.getElevationAtCoords(ax, az)) || target.position.y;
        return new THREE.Vector3(ax, ay, az);
    }

    // Horizontal-only distance (ignoring Y elevation) for proximity checks
    distXZ(a, b) {
        const dx = a.x - b.x;
        const dz = a.z - b.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    update(dt, world, game) {
        if (this.dead) return;
        this.animTime += dt;
        if (this.attackTimer > 0) this.attackTimer -= dt;

        switch (this.state) {
            case 'IDLE': 
                // Ensure idle units stay conforming to terrain
                if (world && world.getElevationAtCoords) {
                    if (this.isFlying) {
                        this.position.y += (7.5 - this.position.y) * dt * 2.5;
                    } else if (this.isBoat) {
                        this.position.y = 0.15;
                    } else {
                        const elevation = world.getElevationAtCoords(this.position.x, this.position.z);
                        if (this.type === 'villager' && elevation < 0.15) {
                            this.position.y = 0.05; // swimming depth
                        } else {
                            this.position.y = elevation;
                        }
                    }
                }
                
                if (this.autoMode) {
                    if (this.type === 'villager') {
                        // Smart auto-work: pick resource type based on player need & nearby availability
                        const searchRadius = 40;
                        
                        // Gather all nearby gatherable resources
                        const nearbyResources = [];
                        game.entities.forEach(e => {
                            if (e.dead || !e.isResource) return;
                            if (e.type === 'farm' && (!e.isCompleted || e.faction !== this.faction)) return;
                            const d = this.distXZ(this.position, e.position);
                            if (d > searchRadius) return;
                            
                            // Count how many villagers are already gathering from this resource
                            const crowdCount = game.entities.filter(other =>
                                other.isUnit &&
                                !other.dead &&
                                other.faction === this.faction &&
                                other.type === 'villager' &&
                                other.targetEntity === e &&
                                (other.state === 'GATHER' || other.state === 'RETURN_RESOURCE')
                            ).length;
                            
                            nearbyResources.push({ entity: e, dist: d, crowd: crowdCount, resKey: this.getResKey(e.type) });
                        });

                        if (nearbyResources.length > 0) {
                            // Check which resource types are available nearby
                            const availableTypes = new Set(nearbyResources.map(r => r.resKey));
                            
                            // Get player resource levels to determine priority
                            const res = game.playerResources || { food: 0, wood: 0, gold: 0, stone: 0 };
                            
                            // Priority order: lowest resource first (what the player needs most)
                            const priorities = [
                                { key: 'food', amount: res.food },
                                { key: 'wood', amount: res.wood },
                                { key: 'gold', amount: res.gold },
                                { key: 'stone', amount: res.stone }
                            ].filter(p => availableTypes.has(p.key))
                             .sort((a, b) => a.amount - b.amount);

                            let bestResource = null;
                            let bestScore = Infinity;

                            if (priorities.length > 0) {
                                // Pick the type the player needs most that's available nearby
                                const targetResKey = priorities[0].key;
                                
                                // Find the best resource of that type (closest + least crowded)
                                nearbyResources
                                    .filter(r => r.resKey === targetResKey)
                                    .forEach(r => {
                                        const score = r.dist + r.crowd * 5;
                                        if (score < bestScore) {
                                            bestScore = score;
                                            bestResource = r.entity;
                                        }
                                    });
                            }
                            
                            // Fallback: if preferred type didn't yield a result, pick ANY nearest
                            if (!bestResource) {
                                nearbyResources.forEach(r => {
                                    const score = r.dist + r.crowd * 3;
                                    if (score < bestScore) {
                                        bestScore = score;
                                        bestResource = r.entity;
                                    }
                                });
                            }

                            if (bestResource) {
                                this.setOrder('GATHER', bestResource);
                            }
                        } else {
                            // Nothing nearby — explore outward to find resources
                            if (Math.random() < 0.05) {
                                const angle = Math.random() * Math.PI * 2;
                                const dist = 15 + Math.random() * 20;
                                const tx = THREE.MathUtils.clamp(this.position.x + Math.cos(angle) * dist, -85, 85);
                                const tz = THREE.MathUtils.clamp(this.position.z + Math.sin(angle) * dist, -85, 85);
                                this.moveTo(tx, tz);
                            }
                        }
                    } else if (this.type !== 'villager') {
                        // Scan for the nearest enemy
                        const nearestEnemy = game.findNearestEnemy(this.position, this.faction, 25.0);
                        if (nearestEnemy) {
                            this.setOrder('ATTACK', nearestEnemy);
                        } else {
                            // Roaming
                            if (Math.random() < 0.05) {
                                const angle = Math.random() * Math.PI * 2;
                                const dist = 15 + Math.random() * 20;
                                const tx = THREE.MathUtils.clamp(this.position.x + Math.cos(angle) * dist, -85, 85);
                                const tz = THREE.MathUtils.clamp(this.position.z + Math.sin(angle) * dist, -85, 85);
                                this.moveTo(tx, tz);
                            }
                        }
                    }
                } else {
                    // Standard auto attack check for military if not in autoMode
                    if (this.type !== 'villager') {
                        if (Math.random() < 0.1) { // Throttle check
                            const searchRadius = this.isFlying ? 30.0 : 12.0;
                            const nearestEnemy = game.findNearestEnemy(this.position, this.faction, searchRadius);
                            if (nearestEnemy) {
                                this.setOrder('ATTACK', nearestEnemy);
                            }
                        }
                    }
                }
                break;
            case 'MOVE': 
                this.moveTowardsTarget(dt, world); 
                // Mid-movement scan when in autoMode
                if (this.autoMode && Math.random() < 0.05) {
                    if (this.type === 'villager') {
                        // Mid-move smart scan: intercept nearby resources based on player need
                        const nearbyResources = [];
                        game.entities.forEach(e => {
                            if (e.dead || !e.isResource) return;
                            if (e.type === 'farm' && (!e.isCompleted || e.faction !== this.faction)) return;
                            const d = this.distXZ(this.position, e.position);
                            if (d > 15) return; // intercept range
                            const crowdCount = game.entities.filter(other =>
                                other.isUnit && !other.dead &&
                                other.faction === this.faction &&
                                other.type === 'villager' &&
                                other.targetEntity === e &&
                                (other.state === 'GATHER' || other.state === 'RETURN_RESOURCE')
                            ).length;
                            nearbyResources.push({ entity: e, dist: d, crowd: crowdCount, resKey: this.getResKey(e.type) });
                        });

                        if (nearbyResources.length > 0) {
                            const availableTypes = new Set(nearbyResources.map(r => r.resKey));
                            const res = game.playerResources || { food: 0, wood: 0, gold: 0, stone: 0 };
                            const priorities = [
                                { key: 'food', amount: res.food },
                                { key: 'wood', amount: res.wood },
                                { key: 'gold', amount: res.gold },
                                { key: 'stone', amount: res.stone }
                            ].filter(p => availableTypes.has(p.key))
                             .sort((a, b) => a.amount - b.amount);

                            let bestResource = null;
                            let bestScore = Infinity;
                            const targetKey = priorities.length > 0 ? priorities[0].key : null;
                            
                            nearbyResources
                                .filter(r => targetKey ? r.resKey === targetKey : true)
                                .forEach(r => {
                                    const score = r.dist + r.crowd * 5;
                                    if (score < bestScore) {
                                        bestScore = score;
                                        bestResource = r.entity;
                                    }
                                });
                            
                            if (bestResource) {
                                this.setOrder('GATHER', bestResource);
                            }
                        }
                    } else if (this.type !== 'villager') {
                        const nearestEnemy = game.findNearestEnemy(this.position, this.faction, 15.0);
                        if (nearestEnemy) {
                            this.setOrder('ATTACK', nearestEnemy);
                        }
                    }
                }
                break;
            case 'GATHER': this.handleGatherState(dt, world, game); break;
            case 'BUILD': this.handleBuildState(dt, world, game); break;
            case 'ATTACK': this.handleAttackState(dt, world, game); break;
            case 'RETURN_RESOURCE': this.handleReturnResourceState(dt, world, game); break;
            case 'REPAIR': this.handleRepairState(dt, world, game); break;
            case 'LOAD': this.handleLoadState(dt, world); break;
            case 'LOAD': this.handleLoadState(dt, world); break;
        }

        // Apply position
        this.mesh.position.copy(this.position);

        // --- ANIMATIONS ---
        this.animateUnit(dt);
    }

    animateUnit(dt) {
        const isMoving = (this.state === 'MOVE' || 
            (this.state === 'GATHER' && this.targetEntity && this.distXZ(this.position, this.targetPos) > (this.gatherTargetType === 'farm' ? 0.15 : 0.55)) ||
            (this.state === 'RETURN_RESOURCE' && this.targetEntity && this.distXZ(this.position, this.targetPos) > 0.55) ||
            (this.state === 'REPAIR' && this.targetEntity && this.distXZ(this.position, this.targetPos) > 0.55) ||
            (this.state === 'BUILD' && this.targetEntity && this.distXZ(this.position, this.targetPos) > 0.55) ||
            (this.state === 'ATTACK' && this.targetEntity && this.distXZ(this.position, this.targetEntity.position) > (this.attackRange + (this.targetEntity.radius || 0.4))));

        if (this.isFlying) {
            this.mesh.position.copy(this.position);
            return;
        }

        const up = new THREE.Vector3(0, 1, 0);
        
        // Reset sway for all states except IDLE
        this.mesh.rotation.z = 0;
        this.mesh.rotation.x = 0;

        // Reset weapon for archer
        if (this.type === 'archer') {
            this.mesh.traverse(child => {
                if (child.name === 'weapon') {
                    child.rotation.y = 0;
                    child.rotation.x = 0;
                }
            });
        }

        if (isMoving) {
            // Walk bob
            const bob = Math.sin(this.animTime * 8) * 0.04;
            this.mesh.position.copy(this.position).addScaledVector(up, bob);

            // Leg swing
            const legSwing = Math.sin(this.animTime * 8) * 0.35;
            
            // Trigger footstep exactly once when leg swing crosses zero
            if (!this._lastLegSwing) this._lastLegSwing = 0;
            if (this._lastLegSwing < 0 && legSwing >= 0 || this._lastLegSwing > 0 && legSwing <= 0) {
                if (typeof audio !== 'undefined') {
                    if (this.isBoat && audio.playRipple) audio.playRipple(this.position); 
                    else if (!this.isBoat && audio.playFootstep) audio.playFootstep(this.position, 0.75); // Louder footstep
                }
            }
            this._lastLegSwing = legSwing;
            this.mesh.traverse(child => {
                if (child.name === 'leftLeg') {
                    child.rotation.x = legSwing;
                    child.position.y = 0.2;
                }
                if (child.name === 'rightLeg') {
                    child.rotation.x = -legSwing;
                    child.position.y = 0.2;
                }
                if (child.name === 'leftArm') {
                    child.rotation.x = -legSwing * 0.5;
                    child.rotation.y = 0;
                    child.rotation.z = 0;
                }
                if (child.name === 'rightArm') {
                    child.rotation.x = legSwing * 0.5;
                    child.rotation.y = 0;
                    child.rotation.z = 0;
                }
            });
        } else {
            // Idle breathing and swaying
            const time = this.animTime + this.id;
            const breathe = Math.sin(time * 1.5) * 0.008;
            this.mesh.position.copy(this.position).addScaledVector(up, breathe);
            
            // Reset body lean
            this.mesh.rotation.x *= 0.9;
            this.mesh.rotation.z *= 0.9;

            // Reset legs
            this.mesh.traverse(child => {
                if (child.name === 'leftLeg' || child.name === 'rightLeg') {
                    child.rotation.x *= 0.9;
                    child.position.y = 0.2; // Reset from sitting
                }
                if (child.name === 'leftArm' || child.name === 'rightArm') {
                    child.rotation.x *= 0.9;
                    child.rotation.y = 0;
                    child.rotation.z *= 0.9; // Reset z rotation from goofing
                }
                if (child.name === 'prop_tool') {
                    child.position.y = -0.31; // Reset tool position from spear thrusting
                }
            });
        }

        // Action animations
        if (!isMoving) {
            if (this.state === 'IDLE') {
                this.setToolType('none');

                // Goofing off / slight upper body and hand movement
                const time = this.animTime + this.id * 0.5;
                const armAnimX1 = Math.sin(time * 0.8) * 0.15 + Math.sin(time * 1.5) * 0.05;
                const armAnimX2 = Math.cos(time * 0.9) * 0.15 + Math.sin(time * 1.3) * 0.05;
                const armAnimZ1 = Math.sin(time * 0.5) * 0.1;
                const armAnimZ2 = Math.cos(time * 0.6) * 0.1;

                this.mesh.traverse(child => {
                    if (child.name === 'leftArm') {
                        child.rotation.x = armAnimX1;
                        child.rotation.z = armAnimZ1;
                    }
                    if (child.name === 'rightArm') {
                        child.rotation.x = armAnimX2;
                        child.rotation.z = -armAnimZ2;
                    }
                });
                
                // Slight upper body sway
                this.mesh.rotation.z = Math.sin(time * 0.7) * 0.03;
                this.mesh.rotation.x = Math.cos(time * 0.8) * 0.03;
            } else if (this.state === 'ATTACK' && this.targetEntity) {
                if (this.type === 'archer') {
                    // Archer firing animation
                    const progress = Math.max(0, 1.0 - (this.attackTimer / (this.attackCooldown || 1.6)));
                    
                    let recoilX = 0;
                    if (progress < 0.2) {
                        // Kicks upwards when fired
                        recoilX = -Math.sin(progress * Math.PI * 5) * 0.3;
                    }
                    
                    let drawAnim = 0;
                    if (progress >= 0.2) {
                        const drawP = (progress - 0.2) / 0.8; 
                        drawAnim = -Math.PI / 2 + (drawP * Math.PI / 4); // pull back
                    } else {
                        drawAnim = -Math.PI / 2 + recoilX; // recoil with bow
                    }

                    this.mesh.traverse(child => {
                        if (child.name === 'rightArm') {
                            child.rotation.x = -Math.PI / 2 + recoilX;
                        }
                        if (child.name === 'leftArm') {
                            child.rotation.x = drawAnim;
                        }
                        if (child.name === 'weapon') {
                            child.rotation.y = -Math.PI / 2; // aim forward
                            child.rotation.x = -Math.PI / 2 + recoilX; // align with arm
                        }
                    });
                } else if (this.type === 'villager') {
                    this.setToolType('spear');
                    // Thrust / poke animation for spear
                    const progress = (this.attackTimer / (this.attackCooldown || 1.5));
                    let thrust = 0;
                    if (progress > 0.8) {
                        thrust = (1.0 - progress) / 0.2; // 0 to 1
                    } else if (progress > 0.6) {
                        thrust = (progress - 0.6) / 0.2; // 1 to 0
                    }
                    this.mesh.traverse(child => {
                        if (child.name === 'rightArm') {
                            child.rotation.x = -Math.PI / 2.2 + (thrust * 0.2); // Point forward
                        }
                        if (child.name === 'prop_tool') {
                            child.position.y = -0.31 - (thrust * 0.4); // Thrust forward
                        }
                    });
                } else {
                    const attackAnim = Math.sin(this.animTime * 6) * 0.6;
                    this.mesh.traverse(child => {
                        if (child.name === 'weapon' || child.name === 'rightArm' || child.name === 'tool') {
                            child.rotation.x = attackAnim;
                        }
                    });
                }
            } else if ((this.state === 'BUILD' || this.state === 'REPAIR') && this.targetEntity) {
                this.mesh.position.y -= 0.15;
                const t = Math.cos(this.animTime * 12); // 1 to -1
                this.setToolType('hammer');
                
                if (this.faction === game.localFaction) {
                    const swingDown = Math.sin(this.animTime * 12) > 0;
                    if (swingDown) {
                        this._buildPhase = 1;
                    } else if (this._buildPhase === 1) {
                        if (this.state === 'BUILD' && Math.random() < 0.2) audio.playBuild(this.position);
                        audio.playHammer(0.5, this.position);
                        if (game.vfx && Math.random() < 0.15) game.vfx.spawnBuildDust(this.targetEntity.position);
                        this._buildPhase = 2;
                    }
                }

                this.mesh.traverse(child => {
                    if (child.name === 'leftLeg' || child.name === 'rightLeg') {
                        child.rotation.x = -Math.PI / 2.2;
                        child.position.y = 0.3; // Sit up a bit relative to center
                    }
                    if (child.name === 'rightArm') {
                        child.rotation.x = -Math.PI * 0.35 - t * Math.PI * 0.15;
                        child.rotation.z = 0; 
                    }
                    if (child.name === 'leftArm') {
                        child.rotation.x *= 0.9;
                        child.rotation.z *= 0.9;
                    }
                    if (child.name === 'prop_tool') {
                        child.rotation.order = 'XYZ';
                        child.rotation.x = -Math.PI * 0.3 - t * Math.PI * 0.2;
                        child.rotation.y = 0;
                        child.rotation.z = 0;
                    }
                });
                this.mesh.rotation.x = 0.1 - t * 0.1; // Body leans into the hammer strike
            } else if (this.state === 'GATHER' && this.targetEntity) {
                if (this.gatherTargetType === 'tree') this.setToolType('axe');
                else if (this.gatherTargetType === 'farm') this.setToolType('hoe');
                else if (this.gatherTargetType === 'forage' || this.gatherTargetType === 'deer' || this.gatherTargetType === 'animal' || this.gatherTargetType === 'carcass') this.setToolType('none');
                else this.setToolType('pickaxe');
                
                // Synchronize sound and VFX directly with the visual animation cycle
                if (this.gatherTargetType === 'farm') {
                    const dragAnim = Math.cos(this.animTime * 6);
                    const swingDown = Math.sin(this.animTime * 6) > 0;
                    if (swingDown) {
                        this._farmPhase = 1;
                    } else if (this._farmPhase === 1) {
                        audio.playChop(this.position);
                        audio.playMeleeHit(this.position);
                        if (game.vfx && Math.random() < 0.35) game.vfx.spawnWoodChips(this.targetEntity ? this.targetEntity.position : this.position);
                        this._farmPhase = 2;
                    }
                } else if (this.gatherTargetType === 'stone' || this.gatherTargetType === 'gold') {
                    let cycle = (this.animTime * 1.5) % 1.0;
                    let t;
                    
                    const swingDown = cycle > 0.1 && cycle < 0.4;
                    if (swingDown) {
                        this._minePhase = 1;
                    } else if (this._minePhase === 1) {
                        if (typeof audio !== 'undefined') {
                            audio.playMine(this.position);
                            if (game && game.vfx) game.vfx.spawnMiningSparks(this.targetEntity ? this.targetEntity.position : this.position);
                        }
                        this._minePhase = 2;
                    }

                    if (cycle < 0.2) {
                        t = Math.cos(cycle / 0.2 * Math.PI);
                    } else if (cycle < 0.6) {
                        t = -1 + 2 * ((cycle - 0.2) / 0.4);
                    } else {
                        t = 1;
                    }
                } else if (this.gatherTargetType === 'tree') {
                    let cycle = (this.animTime * 1.5) % 1.0;
                    let t;
                    
                    const swingDown = cycle > 0.1 && cycle < 0.4;
                    if (swingDown) {
                        this._treePhase = 1;
                    } else if (this._treePhase === 1) {
                        if (typeof audio !== 'undefined') {
                            audio.playChop(this.position);
                            if (game && game.vfx) game.vfx.spawnWoodChips(this.targetEntity ? this.targetEntity.position : this.position);
                        }
                        this._treePhase = 2;
                    }

                    if (cycle < 0.3) {
                        t = Math.cos(cycle / 0.3 * Math.PI);
                    } else if (cycle < 0.8) {
                        t = -1 + 2 * ((cycle - 0.3) / 0.5);
                    } else {
                        t = 1;
                    }
                } else if (this.gatherTargetType === 'forage' || this.gatherTargetType === 'deer' || this.gatherTargetType === 'animal' || this.gatherTargetType === 'carcass') {
                    const reachAnim = Math.sin(this.animTime * 8);
                    const reachingOut = Math.cos(this.animTime * 8) > 0;
                    if (reachingOut) {
                        this._foragePhase = 1;
                    } else if (this._foragePhase === 1) {
                        if (this.gatherTargetType === 'carcass') audio.playFleshy(this.position);
                        this._foragePhase = 2;
                    }
                }
                
                this.mesh.traverse(child => {
                    if (this.gatherTargetType === 'farm') {
                        // Two-handed hoeing (dragging dirt backwards)
                        const dragAnim = Math.cos(this.animTime * 6);
                        if (child.name === 'rightArm' || child.name === 'leftArm') {
                            // Arms point forward and down, both hands meeting in the center
                            child.rotation.x = -Math.PI / 4 + dragAnim * 0.1; 
                            child.rotation.z = (child.name === 'rightArm' ? -Math.PI/8 : Math.PI/8);
                        }
                        this.mesh.rotation.x = 0.25 - dragAnim * 0.05; // Lean body into the drag
                        this.mesh.rotation.z = 0;
                        // Staggered legs for leverage
                        if (child.name === 'leftLeg') child.rotation.x = -Math.PI / 8;
                        if (child.name === 'rightLeg') child.rotation.x = Math.PI / 8;
                    } else if (this.gatherTargetType === 'stone' || this.gatherTargetType === 'gold') {
                        // Overhead swing into ground with wrist snap
                        // Hold tool up, then fast strike
                        let cycle = (this.animTime * 1.5) % 1.0;
                        let t;
                        if (cycle < 0.2) t = Math.cos(cycle / 0.2 * Math.PI); // 1 to -1 (fast strike)
                        else if (cycle < 0.6) t = -1 + 2 * ((cycle - 0.2) / 0.4); // -1 to 1 (recover)
                        else t = 1; // hold up
                        
                        if (child.name === 'rightArm' || child.name === 'leftArm') {
                            // Swing arms from low (-Math.PI*0.25) to high (-Math.PI*0.5)
                            child.rotation.x = -Math.PI * 0.375 - t * Math.PI * 0.125;
                            // Bring arms together so they look like they hold the same handle
                            child.rotation.z = (child.name === 'rightArm' ? -Math.PI/12 : Math.PI/12);
                        }
                        if (child.name === 'prop_tool') {
                            child.rotation.order = 'XYZ';
                            // Tool snaps from cocked back over shoulder (-Math.PI*0.75) to striking forward (-Math.PI*0.125)
                            child.rotation.x = -Math.PI * 0.4375 - t * Math.PI * 0.3125; 
                            child.rotation.y = 0;
                            child.rotation.z = 0;
                        }
                        if (child.name === 'leftLeg') child.rotation.x = -Math.PI / 8; // Wide stance forward
                        if (child.name === 'rightLeg') child.rotation.x = Math.PI / 8; // Wide stance back
                        this.mesh.rotation.x = 0.1 - t * 0.1; // Lean into the swing
                    } else if (this.gatherTargetType === 'tree') {
                        // Two-handed diagonal chop with body follow-through
                        let cycle = (this.animTime * 1.5) % 1.0;
                        let t;
                        if (cycle < 0.3) t = Math.cos(cycle / 0.3 * Math.PI); // 1 to -1 (swing)
                        else if (cycle < 0.8) t = -1 + 2 * ((cycle - 0.3) / 0.5); // -1 to 1 (recover)
                        else t = 1; // hold

                        if (child.name === 'rightArm' || child.name === 'leftArm') {
                            // Two-handed diagonal chop
                            // Arm goes from up/right (t=1) to down/left (t=-1)
                            child.rotation.x = -Math.PI / 3 - t * Math.PI / 6; 
                            child.rotation.z = (child.name === 'rightArm' ? -Math.PI/12 : Math.PI/12) + t * Math.PI / 6;
                        }
                        if (child.name === 'prop_tool') {
                            child.rotation.order = 'XYZ';
                            child.rotation.x = -Math.PI / 8; // Angle forward to hit trunk
                            child.rotation.y = 0; // Blade is at -X (LEFT), leading the right-to-left chop
                            child.rotation.z = 0;
                        }
                        this.mesh.rotation.x = 0.05 - t * 0.05; // Forward lean
                        this.mesh.rotation.z = -t * 0.05; // Slight sideways body weight shift
                    } else {
                        // Forage: reach out
                        const reachAnim = Math.sin(this.animTime * 8);
                        if (child.name === 'rightArm') {
                            child.rotation.x = reachAnim * 0.4;
                        }
                        if (child.name === 'leftArm') {
                            child.rotation.x = reachAnim * -0.4; // Alternate hands
                        }
                    }
                });
            }
        } else {
            this.setToolType('none'); // hide tool when moving
        }
        

        // Reset tool rotation if not gathering/building
        if (this.state !== 'GATHER' && this.state !== 'BUILD' && this.state !== 'REPAIR') {
            this.mesh.traverse(child => {
                if (child.name === 'tool' || child.name === 'prop_tool') {
                    child.rotation.x = 0;
                    child.rotation.y = 0;
                    child.rotation.z = 0;
                }
            });
        }
    }

    setToolType(type) {
        if (!this.mesh) return;
        this.mesh.traverse(child => {
            if (child.name === 'tool' || child.name === 'prop_tool') {
                if (type === 'none') {
                    child.visible = false;
                } else {
                    child.visible = true;
                    // Find the sub-groups and toggle them based on the tool type requested
                    child.children.forEach(subTool => {
                        if (subTool.name === 'axeGroup') subTool.visible = (type === 'axe');
                        else if (subTool.name === 'pickaxeGroup') subTool.visible = (type === 'pickaxe');
                        else if (subTool.name === 'pitchforkGroup') subTool.visible = (type === 'hoe');
                        else if (subTool.name === 'hammerGroup') subTool.visible = (type === 'hammer');
                        else if (subTool.name === 'spearGroup') subTool.visible = (type === 'spear');
                    });
                }
            }
        });
    }

    moveTowardsTarget(dt, world, customArrivalDist = null) {
        if (this.pathWaypoints && this.pathWaypoints.length > 0) {
            if (this.pathFinalDest && this.targetPos.distanceTo(this.pathFinalDest) > 3.0) {
                this.pathWaypoints = [];
            }
        }

        let activeTarget = this.targetPos;
        let isUsingWaypoint = false;
        if (this.pathWaypoints && this.pathWaypoints.length > 0) {
            activeTarget = this.pathWaypoints[0];
            isUsingWaypoint = true;
        }

        const dist = this.distXZ(this.position, activeTarget);
        const arrivalDist = isUsingWaypoint ? 1.0 : (customArrivalDist !== null ? customArrivalDist : (this.isFlying ? 3.0 : 0.4));
        
        if (dist < arrivalDist) {
            if (isUsingWaypoint) {
                this.pathWaypoints.shift();
                return;
            } else {
                if (!this.isFlying) {
                    this.position.x = this.targetPos.x;
                    this.position.z = this.targetPos.z;
                    if (!this.isBoat) {
                        this.position.y = this.targetPos.y;
                    }
                }
                if (this.state === 'MOVE') {
                    this.state = 'IDLE';
                }
                this.stuckTimer = 0;
                this.lastMoveSample.copy(this.position);
                return;
            }
        }

        const prevPos = this.position.clone();
        const toTarget = activeTarget.clone().sub(this.position);
        toTarget.y = 0;
        const dir = toTarget.clone().normalize();

        let step;
        if (this.isFlying) {
            const targetRot = Math.atan2(dir.x, dir.z);
            let diff = targetRot - this.mesh.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            this.mesh.rotation.y += diff * Math.min(1.0, dt * 3.0);
            
            const forward = new THREE.Vector3(Math.sin(this.mesh.rotation.y), 0, Math.cos(this.mesh.rotation.y));
            this.velocity.lerp(forward.multiplyScalar(this.speed), dt * 2.0);
            step = this.velocity.clone().multiplyScalar(dt);
        } else {
            step = dir.clone().multiplyScalar(this.speed * dt);
        }
        
        let nextX = this.position.x + step.x;
        let nextZ = this.position.z + step.z;

        if (!this.isFlying) {
            const nextElevation = world.getElevationAtCoords(nextX, nextZ);
            const myElev = world.getElevationAtCoords(this.position.x, this.position.z);
            const isInvalid = (elev, nx, nz) => {
                // Check wall collision
                if (window.game && window.game.entities) {
                    for (let i = 0; i < window.game.entities.length; i++) {
                        const e = window.game.entities[i];
                        if (e === this) continue;
                        if (!e.dead && (e.type === 'woodwall' || e.type === 'stonewall')) {
                            const dx = nx - e.position.x;
                            const dz = nz - e.position.z;
                            if (dx * dx + dz * dz < 1.44) { // radius ~1.2
                                return true;
                            }
                        }
                    }
                }

                if (this.isBoat) {
                    if (myElev > -0.1) return false; // Allow escaping land if stuck
                    return elev > -0.1; // Boats cannot go on land (elev > -0.1)
                }
                
                // For ground units:
                // They cannot walk on deep water (elev < -0.1)
                if (elev < -0.1) {
                    // But if they are stuck in water (myElev < -0.1), allow movement ONLY IF moving towards land (higher elevation)
                    if (myElev < -0.1 && elev > myElev) {
                        return false;
                    }
                    return true;
                }
                return false;
            };
            
            if (isInvalid(nextElevation, nextX, nextZ)) {
                let tangent1 = new THREE.Vector3(-dir.z, 0, dir.x);
                let tangent2 = new THREE.Vector3(dir.z, 0, -dir.x);
                
                const t1x = this.position.x + tangent1.x * this.speed * dt;
                const t1z = this.position.z + tangent1.z * this.speed * dt;
                let valid1 = !isInvalid(world.getElevationAtCoords(t1x, t1z), t1x, t1z);
                
                const t2x = this.position.x + tangent2.x * this.speed * dt;
                const t2z = this.position.z + tangent2.z * this.speed * dt;
                let valid2 = !isInvalid(world.getElevationAtCoords(t2x, t2z), t2x, t2z);

                if (valid1 && !valid2) {
                    step.copy(tangent1.multiplyScalar(this.speed * dt));
                } else if (valid2 && !valid1) {
                    step.copy(tangent2.multiplyScalar(this.speed * dt));
                } else {
                    step.set(0, 0, 0);
                }
            }
        }

        this.position.add(step);

        if (world && world.getElevationAtCoords) {
            if (this.isFlying) {
                const targetY = 7.5; // Flat constant altitude
                this.position.y += (targetY - this.position.y) * dt * 2.5;
            } else if (this.isBoat) {
                this.position.y = 0.15; // Water surface
            } else {
                let groundY = world.getElevationAtCoords(this.position.x, this.position.z);
                if (this.type === 'villager' && groundY < 0.15) {
                    this.position.y = 0.05; // Slightly below water surface to simulate swimming
                } else {
                    this.position.y = groundY;
                }
            }
        }

        this.logicalX = this.position.x;
        this.logicalZ = this.position.z;

        const moved = this.position.distanceTo(prevPos);
        const finalDist = this.distXZ(this.position, this.targetPos);
        
        let needsPathfind = false;
        let isRoamFallback = false;
        
        if (finalDist > 0.6) {
            const inWater = !this.isFlying && !this.isBoat && (world && world.getElevationAtCoords && world.getElevationAtCoords(this.position.x, this.position.z) < -0.1);
            if (inWater && (!this.pathWaypoints || this.pathWaypoints.length === 0)) {
                needsPathfind = true;
            } else if (moved < Math.max(0.005, this.speed * dt * 0.12)) {
                this.stuckTimer += dt;
                if (this.stuckTimer > 0.55) {
                    needsPathfind = true;
                    isRoamFallback = true;
                }
            } else {
                this.stuckTimer = Math.max(0, this.stuckTimer - dt);
            }
        }

        if (needsPathfind) {
            // If auto-hunting warrior gets stuck, they should give up and roam to avoid water traps
            if (isRoamFallback && this.autoMode && this.type !== 'villager') {
                const angle = Math.random() * Math.PI * 2;
                const roamDist = 15 + Math.random() * 15;
                this.moveTo(this.position.x + Math.cos(angle) * roamDist, this.position.z + Math.sin(angle) * roamDist);
                this.stuckTimer = 0;
                return;
            }

            if (!this.isFlying && !this.isBoat) {
                const now = this.animTime;
                if (!this.lastPathfindTime || now - this.lastPathfindTime > 1.0) {
                    this.lastPathfindTime = now;
                    const path = findPathAStar(world, this.position.x, this.position.z, this.targetPos.x, this.targetPos.z);
                    if (path && path.length > 0) {
                        this.pathWaypoints = path;
                        this.pathFinalDest = this.targetPos.clone();
                        this.stuckTimer = 0;
                        return;
                    }
                }
            }

            if (isRoamFallback) {
                const unstuckAngle = this.animTime * 7.123 + this.id;
                const pushX = Math.cos(unstuckAngle) * 0.18;
                const pushZ = Math.sin(unstuckAngle) * 0.18;
                
                let nextX = this.position.x + pushX;
                let nextZ = this.position.z + pushZ;
                
                let canUnstuck = true;
                if (world && world.getElevationAtCoords && !this.isFlying) {
                    const elev = world.getElevationAtCoords(nextX, nextZ);
                    const myElev = world.getElevationAtCoords(this.position.x, this.position.z);
                    if (this.isBoat) {
                        if (elev > -0.1) {
                            nextX = this.position.x;
                            nextZ = this.position.z;
                        }
                    } else {
                        if (elev < -0.1 && !(myElev < -0.1 && elev > myElev)) {
                            nextX = this.position.x;
                            nextZ = this.position.z;
                        }
                    }
                    
                    const isInvalid = (e) => {
                        if (this.isBoat) {
                            if (myElev > 0.25) return false;
                            return e > 0.25;
                        }
                        if (this.type === 'villager') {
                            return false;
                        }
                        return e < 0.25;
                    };
                    if (isInvalid(elev)) canUnstuck = false;
                }
                
                if (canUnstuck) {
                    this.position.x = nextX;
                    this.position.z = nextZ;
                    if (world && world.getElevationAtCoords && !this.isFlying && !this.isBoat) {
                        let groundY = world.getElevationAtCoords(this.position.x, this.position.z);
                        if (this.type === 'villager' && groundY < 0.15) {
                            this.position.y = 0.05;
                        } else {
                            this.position.y = groundY;
                        }
                    }
                }
                
                this.stuckTimer = 0;
            }
        } else {
            this.stuckTimer = Math.max(0, this.stuckTimer - dt);
        }
        this.lastMoveSample.copy(this.position);

        this.alignMesh(dir);
    }

    applySeparation(units, dt) {
        const pushForce = new THREE.Vector3();
        units.forEach(u => {
            if (u.id === this.id || u.dead) return;
            if (u.type === 'farm') return; // Farms are flat; don't push units away
            const dist = this.position.distanceTo(u.position);
            const minDist = this.radius + u.radius;
            if (dist < minDist && dist > 0.01) {
                const overlap = minDist - dist;
                const push = new THREE.Vector3().copy(this.position).sub(u.position);
                push.y = 0;
                push.normalize().multiplyScalar(overlap * 2.0);
                pushForce.add(push);
            }
        });
        if (pushForce.lengthSq() > 0.001) {
            const pushStep = pushForce.multiplyScalar(dt);
            let nextX = this.position.x + pushStep.x;
            let nextZ = this.position.z + pushStep.z;
            
            let canPush = true;
            const world = window.game ? window.game.world : null;
            if (world && world.getElevationAtCoords && !this.isFlying) {
                const elev = world.getElevationAtCoords(nextX, nextZ);
                const myElev = world.getElevationAtCoords(this.position.x, this.position.z);
                if (this.isBoat) {
                    if (elev > -0.1) {
                        nextX = this.position.x;
                        nextZ = this.position.z;
                        this.state = 'IDLE';
                    }
                } else {
                    if (elev < -0.1 && !(myElev < -0.1 && elev > myElev)) {
                        nextX = this.position.x;
                        nextZ = this.position.z;
                        this.state = 'IDLE';
                    }
                }
                
                const isInvalid = (elev) => {
                    if (this.isBoat) {
                        if (myElev > 0.05) return false;
                        return elev > 0.05;
                    }
                    if (this.type === 'villager') {
                        return false;
                    }
                    return elev < -0.1;
                };
                if (isInvalid(elev)) canPush = false;
            }
            
            if (canPush) {
                this.position.x = nextX;
                this.position.z = nextZ;
            }

            if (world && world.getElevationAtCoords) {
                if (this.isFlying) {
                    this.position.y += (7.5 - this.position.y) * dt * 2.5;
                } else if (this.isBoat) {
                    this.position.y = 0.15;
                } else {
                    let groundY = world.getElevationAtCoords(this.position.x, this.position.z);
                    if (this.type === 'villager' && groundY < 0.15) {
                        this.position.y = 0.05;
                    } else {
                        this.position.y = groundY;
                    }
                }
            }

            this.logicalX = this.position.x;
            this.logicalZ = this.position.z;
        }
    }

    handleGatherState(dt, world, game) { this.state = 'IDLE'; }
    handleBuildState(dt, world, game) { this.state = 'IDLE'; }
    handleAttackState(dt, world, game) { this.state = 'IDLE'; }

    handleLoadState(dt, world) {
        if (!this.targetEntity || this.targetEntity.dead || this.targetEntity.type !== 'transportboat') {
            this.state = 'IDLE'; return;
        }
        const dist = this.distXZ(this.position, this.targetEntity.position);
        if (dist > 3.0) {
            this.targetPos.copy(this.targetEntity.position);
            this.moveTowardsTarget(dt, world);
        } else {
            if (!this.isLoaded && this.targetEntity.loadedEntities.length < 10) {
                this.isLoaded = true;
                if (this.mesh) this.mesh.visible = false;
                this.targetEntity.loadedEntities.push(this);
            }
            this.state = 'IDLE';
        }
    }
}

// ========== VILLAGER ==========
export class Villager extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'villager', 60, x, z, 3.5);
        this.radius = 0.3;
        this.attackRange = 0.9;
        this.attackDamage = 3;
        this.attackCooldown = 1.8;
        this.carrying = { food: 0, wood: 0, gold: 0, stone: 0 };
        this.carryCapacity = 10;
        this.gatherRate = 2.5;
        this.gatherTimer = 0;
        this.buildRate = 12;
    }

    handleGatherState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            const nextRes = game.findNearestResource(this.position, this.gatherTargetType, this.faction);
            if (nextRes) { this.setOrder('GATHER', nextRes); }
            else { this.returnResources(game); }
            return;
        }
        if (this.targetEntity.type === 'farm' && (!this.targetEntity.isCompleted || this.targetEntity.faction !== this.faction)) {
            this.state = 'IDLE';
            this.targetEntity = null;
            return;
        }
        const totalCarried = Object.values(this.carrying).reduce((a, b) => a + b, 0);
        if (totalCarried >= this.carryCapacity) { this.returnResources(game); return; }

        this.gatherTargetType = this.targetEntity.type;
        const gatherSpot = this.getApproachPosition(this.targetEntity, 0.18);
        const dist = this.distXZ(this.position, gatherSpot);
        const arrivalDist = this.gatherTargetType === 'farm' ? 0.1 : 0.5;
        if (dist > arrivalDist) {
            this.targetPos.copy(gatherSpot);
            this.moveTowardsTarget(dt, world, arrivalDist);
        } else {
            const dir = this.targetEntity.position.clone().sub(this.position);
            dir.y = 0;
            if (dir.lengthSq() > 0.001) this.alignMesh(dir.normalize());
            
            this.gatherTimer += dt;
            if (this.gatherTimer >= 1.0) {
                this.gatherTimer = 0;
                const collected = Math.min(this.carryCapacity - totalCarried, 2);
                this.carrying[this.getResKey(this.gatherTargetType)] += collected;
                if (this.gatherTargetType !== 'farm') {
                    this.targetEntity.takeDamage(collected, this);
                }
            }
        }
    }

    handleBuildState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) { this.state = 'IDLE'; return; }
        
        const searchNextBuilding = () => {
            let nextTarget = null;
            let minDist = 15.0; // Search radius for next building
            game.entities.forEach(e => {
                if (e.dead || e.faction !== this.faction || !e.isBuilding || e.isCompleted) return;
                if (e === this.targetEntity) return;
                const d = this.position.distanceTo(e.position);
                if (d < minDist) {
                    minDist = d;
                    nextTarget = e;
                }
            });
            if (nextTarget) {
                this.setOrder('BUILD', nextTarget);
            } else {
                this.state = 'IDLE';
                this.targetEntity = null;
            }
        };

        if (this.targetEntity.isCompleted) {
            searchNextBuilding();
            return;
        }

        const buildSpot = this.getApproachPosition(this.targetEntity, 1.2);
        const dist = this.distXZ(this.position, buildSpot);
        if (dist > 0.5) {
            this.targetPos.copy(buildSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            const dir = this.targetEntity.position.clone().sub(this.position);
            dir.y = 0;
            if (dir.lengthSq() > 0.001) this.alignMesh(dir.normalize());

            this.targetEntity.buildProgress = Math.min(100, this.targetEntity.buildProgress + this.buildRate * dt);
            if (this.targetEntity.buildProgress >= 100) {
                this.targetEntity.completeConstruction();
                if (game.vfx) game.vfx.spawnBuildDust(this.targetEntity.position);
                audio.playBuildingComplete();
                
                searchNextBuilding();
            }
        }
    }

    returnResources(game) {
        const dropoff = game.findNearestTownCenter(this.position, this.faction);
        if (dropoff) {
            this.setOrder('RETURN_RESOURCE', dropoff);
        } else { this.state = 'IDLE'; }
    }

    handleReturnResourceState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) { this.state = 'IDLE'; return; }
        const dropSpot = this.getApproachPosition(this.targetEntity, 1.1);
        const dist = this.distXZ(this.position, dropSpot);
        if (dist > 0.5) {
            this.targetPos.copy(dropSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            // Deposit resources
            for (const [res, amount] of Object.entries(this.carrying)) {
                if (amount > 0) {
                    if (!game.factionResources) game.factionResources = {};
                    if (!game.factionResources[this.faction]) game.factionResources[this.faction] = { food: 200, wood: 200, gold: 100, stone: 0 };
                    
                    game.factionResources[this.faction][res] += amount;
                    if (this.faction === game.localFaction) {
                        game.playerResources[res] = game.factionResources[this.faction][res];
                    }
                    this.carrying[res] = 0;
                }
            }
            if (this.faction === game.localFaction) game.updateTopBar();
            
            // Go back to gathering the last type
            if (this.gatherTargetType) {
                const nextRes = game.findNearestResource(this.position, this.gatherTargetType, this.faction);
                if (nextRes) {
                    this.setOrder('GATHER', nextRes);
                } else {
                    this.state = 'IDLE';
                }
            } else {
                this.state = 'IDLE';
            }
        }
    }

    handleRepairState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead || this.targetEntity.health >= this.targetEntity.maxHealth) { 
            this.state = 'IDLE'; 
            return; 
        }
        const repairSpot = this.getApproachPosition(this.targetEntity, 1.15);
        const dist = this.distXZ(this.position, repairSpot);
        if (dist > 0.5) {
            this.targetPos.copy(repairSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            const dir = this.targetEntity.position.clone().sub(this.position);
            dir.y = 0;
            if (dir.lengthSq() > 0.001) this.alignMesh(dir.normalize());

            this.targetEntity.hp = Math.min(this.targetEntity.maxHp, this.targetEntity.hp + this.repairRate * dt);    
            if (!game.factionResources) game.factionResources = {};
            if (!game.factionResources[this.faction]) game.factionResources[this.faction] = { food: 200, wood: 200, gold: 100, stone: 0 };

            // Repair costs 1 wood per 10 HP
            if (game.factionResources[this.faction].wood >= 1) {
                game.factionResources[this.faction].wood -= 1;
                if (this.faction === game.localFaction) {
                    game.playerResources.wood = game.factionResources[this.faction].wood;
                    game.updateTopBar();
                }
                this.targetEntity.health = Math.min(this.targetEntity.maxHealth, this.targetEntity.health + 10);
                this.targetEntity.updateWorldHealthBar();
            } else {
                this.state = 'IDLE';
            }
        }
    }

    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            this.state = 'IDLE';
            return;
        }

        const attackSpot = this.getApproachPosition(this.targetEntity, 0.1); // Get close for melee
        const dist = this.distXZ(this.position, attackSpot);
        if (dist > 0.5) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playMeleeHit(this.position);
                if (game.vfx) game.vfx.spawnSwordSparks(this.targetEntity.position);
                game.notifyCombat();
                this.targetEntity.takeDamage(this.attackDamage, this);
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }

    getResKey(type) {
        if (type === 'tree') return 'wood';
        if (type === 'forage' || type === 'deer' || type === 'animal' || type === 'carcass') return 'food';
        if (type === 'gold') return 'gold';
        if (type === 'stone') return 'stone';
        if (type === 'farm') return 'food';
        return 'wood';
    }
}

// ========== SOLDIER ==========
export class Soldier extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'soldier', 90, x, z, 3.8);
        this.attackRange = 1.0;
        this.attackDamage = 12;
        this.attackCooldown = 1.2;
    }

    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            const nextEnemy = game.findNearestEnemy(this.position, this.faction, 6);
            if (nextEnemy) { this.targetEntity = nextEnemy; }
            else { this.state = 'IDLE'; return; }
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, 0.1); // Get close for melee
        const dist = this.distXZ(this.position, attackSpot);
        const range = Math.max(0.5, this.radius + 0.1);
        if (dist > range) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playMeleeHit(this.position);
                if (game.vfx) game.vfx.spawnSwordSparks(this.targetEntity.position);
                game.notifyCombat();
                this.targetEntity.takeDamage(this.attackDamage, this);
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}

// ========== ARCHER ==========
export class Archer extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'archer', 55, x, z, 4.0);
        this.attackRange = 6.5;
        this.attackDamage = 8;
        this.attackCooldown = 1.6;
    }

    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            const nextEnemy = game.findNearestEnemy(this.position, this.faction, 8);
            if (nextEnemy) { this.targetEntity = nextEnemy; }
            else { this.state = 'IDLE'; return; }
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, this.attackRange);
        const dist = this.distXZ(this.position, attackSpot);
        if (dist > 0.5) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playShoot(this.position);
                game.notifyCombat();
                const arrowStart = this.position.clone();
                arrowStart.y += 1.0;
                game.spawnArrow(arrowStart, this.targetEntity, this.attackDamage);
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}

// ========== KNIGHT (Age 2 - Cavalry) ==========
export class Knight extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'knight', 120, x, z, 5.0);
        this.attackRange = 1.2;
        this.attackDamage = 14;
        this.attackCooldown = 1.1;
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            const nextEnemy = game.findNearestEnemy(this.position, this.faction, 8);
            if (nextEnemy) { this.targetEntity = nextEnemy; }
            else { this.state = 'IDLE'; return; }
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, 0.1); // Get close for melee
        const dist = this.distXZ(this.position, attackSpot);
        if (dist > 0.6) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playMeleeHit(this.position);
                if (game.vfx) game.vfx.spawnSwordSparks(this.targetEntity.position);
                game.notifyCombat();
                // Bonus damage vs archers
                let dmg = this.attackDamage;
                if (this.targetEntity.type === 'archer' || this.targetEntity.type === 'crossbowman' || this.targetEntity.type === 'elitearcher') dmg = Math.floor(dmg * 1.5);
                this.targetEntity.takeDamage(dmg, this);
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}

// ========== SPEARMAN (Age 2 - Anti-Cavalry) ==========
export class Spearman extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'spearman', 80, x, z, 3.2);
        this.attackRange = 1.5;
        this.attackDamage = 10;
        this.attackCooldown = 1.3;
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            const nextEnemy = game.findNearestEnemy(this.position, this.faction, 6);
            if (nextEnemy) { this.targetEntity = nextEnemy; }
            else { this.state = 'IDLE'; return; }
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, 0.1); // Get close for melee
        const dist = this.distXZ(this.position, attackSpot);
        if (dist > 0.6) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playMeleeHit(this.position);
                game.notifyCombat();
                // Bonus vs cavalry
                let dmg = this.attackDamage;
                if (this.targetEntity.type === 'knight' || this.targetEntity.type === 'paladin' || this.targetEntity.type === 'warelephant') dmg = Math.floor(dmg * 2.0);
                this.targetEntity.takeDamage(dmg, this);
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}

// ========== CROSSBOWMAN (Age 3) ==========
export class Crossbowman extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'crossbowman', 70, x, z, 3.0);
        this.attackRange = 7.0;
        this.attackDamage = 12;
        this.attackCooldown = 1.8;
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            const nextEnemy = game.findNearestEnemy(this.position, this.faction, 9);
            if (nextEnemy) { this.targetEntity = nextEnemy; }
            else { this.state = 'IDLE'; return; }
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, this.attackRange);
        const dist = this.distXZ(this.position, attackSpot);
        if (dist > 0.5) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playShoot(this.position);
                game.notifyCombat();
                const start = this.position.clone(); start.y += 1.0;
                game.spawnArrow(start, this.targetEntity, this.attackDamage);
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}

// ========== SIEGE RAM (Age 3 - Building Destroyer) ==========
export class SiegeRam extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'siegeram', 250, x, z, 1.5);
        this.attackRange = 1.5;
        this.attackDamage = 30;
        this.attackCooldown = 2.5;
        this.radius = 0.8;
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            this.state = 'IDLE'; return;
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, 0.1); // Get close for melee
        const dist = this.distXZ(this.position, attackSpot);
        if (dist > 0.8) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                game.notifyCombat();
                // Massive bonus vs buildings
                let dmg = this.attackDamage;
                if (this.targetEntity.isBuilding) dmg *= 3;
                this.targetEntity.takeDamage(dmg, this);
                if (game.vfx) game.vfx.spawnBuildDust(this.targetEntity.position);
            }
        }
    }
}

// ========== MONK (Age 3 - Healer) ==========
export class Monk extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'monk', 40, x, z, 2.8);
        this.attackRange = 5.0;
        this.attackDamage = 0;
        this.attackCooldown = 2.0;
        this.healAmount = 15;
        this.conversionProgress = 0;
        this.conversionThreshold = 3.0 + Math.random() * 3.0; // 3-6s to convert
    }
    update(dt, world, game) {
        super.update(dt, world, game);
        // Auto-heal nearby friendly units
        if (this.state === 'IDLE' && !this.dead) {
            if (this.attackTimer <= 0) {
                const friendlies = game.entities.filter(e =>
                    !e.dead && e.isUnit && e.faction === this.faction && e !== this &&
                    e.health < e.maxHealth && this.distXZ(this.position, e.position) < 6.0
                );
                if (friendlies.length > 0) {
                    // Heal the most damaged nearby unit
                    friendlies.sort((a, b) => (a.health / a.maxHealth) - (b.health / b.maxHealth));
                    friendlies[0].health = Math.min(friendlies[0].maxHealth, friendlies[0].health + this.healAmount);
                    friendlies[0].updateWorldHealthBar();
                    this.attackTimer = this.attackCooldown;
                    if (game.vfx) game.vfx.spawnSmoke(friendlies[0].position);
                }
            }
        }
    }
    handleAttackState(dt, world, game) {
        // Attack state for monk = CONVERSION
        if (!this.targetEntity || this.targetEntity.dead || this.targetEntity.faction === this.faction || this.targetEntity.isBuilding) {
            this.state = 'IDLE';
            this.conversionProgress = 0;
            return;
        }

        const dist = this.distXZ(this.position, this.targetEntity.position);
        if (dist > this.attackRange) {
            this.targetPos.copy(this.getApproachPosition(this.targetEntity, this.attackRange - 0.5));
            this.moveTowardsTarget(dt, world);
            this.conversionProgress = 0; // reset chant if moved
        } else {
            // Chanting!
            if (this.attackTimer <= 0) {
                this.attackTimer = 0.8;
                audio.playOrder(); // Chanting sound
                if (game.vfx) game.vfx.spawnSwordSparks(this.targetEntity.position);
            }
            
            this.conversionProgress += dt;
            if (this.conversionProgress >= this.conversionThreshold) {
                // Conversion success! Wololo!
                this.targetEntity.faction = this.faction;
                this.targetEntity.state = 'IDLE';
                this.targetEntity.targetEntity = null;
                this.targetEntity.updateWorldHealthBar();
                audio.playAgeAdvance(); // Triumphant sound
                
                this.state = 'IDLE';
                this.conversionProgress = 0;
                this.conversionThreshold = 3.0 + Math.random() * 3.0;
            }
            
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}

// ========== PALADIN (Age 4 - Elite Cavalry) ==========
export class Paladin extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'paladin', 180, x, z, 4.5);
        this.attackRange = 1.3;
        this.attackDamage = 18;
        this.attackCooldown = 1.0;
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            const nextEnemy = game.findNearestEnemy(this.position, this.faction, 10);
            if (nextEnemy) { this.targetEntity = nextEnemy; }
            else { this.state = 'IDLE'; return; }
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, 0.1); // Get close for melee
        const dist = this.distXZ(this.position, attackSpot);
        if (dist > 0.6) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playMeleeHit(this.position);
                if (game.vfx) game.vfx.spawnSwordSparks(this.targetEntity.position);
                game.notifyCombat();
                this.targetEntity.takeDamage(this.attackDamage, this);
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}

// ========== CANNON (Age 4 - Ranged Siege) ==========
export class Cannon extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'cannon', 100, x, z, 1.8);
        this.attackRange = 9.0;
        this.attackDamage = 40;
        this.attackCooldown = 3.5;
        this.radius = 0.7;
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            this.state = 'IDLE'; return;
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, this.attackRange);
        const dist = this.distXZ(this.position, attackSpot);
        if (dist > 0.5) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playShoot(this.position);
                game.notifyCombat();
                const start = this.position.clone(); start.y += 0.8;
                game.spawnArrow(start, this.targetEntity, this.attackDamage, 'cannonball');
                if (game.vfx) game.vfx.spawnBuildDust(this.position);
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}

// ========== ELITE ARCHER (Age 4) ==========
export class EliteArcher extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'elitearcher', 80, x, z, 3.2);
        this.attackRange = 8.0;
        this.attackDamage = 14;
        this.attackCooldown = 1.4;
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            const nextEnemy = game.findNearestEnemy(this.position, this.faction, 10);
            if (nextEnemy) { this.targetEntity = nextEnemy; }
            else { this.state = 'IDLE'; return; }
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, this.attackRange);
        const dist = this.distXZ(this.position, attackSpot);
        if (dist > 0.5) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playShoot(this.position);
                game.notifyCombat();
                const start = this.position.clone(); start.y += 1.0;
                game.spawnArrow(start, this.targetEntity, this.attackDamage);
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}

// ========== TITAN (Age 5 - Massive Warrior) ==========
export class Titan extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'titan', 500, x, z, 2.0);
        this.attackRange = 2.0;
        this.attackDamage = 35;
        this.attackCooldown = 1.5;
        this.radius = 1.2;
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            const nextEnemy = game.findNearestEnemy(this.position, this.faction, 10);
            if (nextEnemy) { this.targetEntity = nextEnemy; }
            else { this.state = 'IDLE'; return; }
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, 0.1); // Get close for melee
        const dist = this.distXZ(this.position, attackSpot);
        if (dist > 1.0) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playMeleeHit(this.position);
                if (game.vfx) game.vfx.spawnSwordSparks(this.targetEntity.position);
                game.notifyCombat();
                // Area damage — hit all enemies within 2 units
                game.entities.forEach(e => {
                    if (!e.dead && e.faction !== this.faction && e !== this) {
                        if (this.distXZ(this.targetEntity.position, e.position) < 2.0) {
                            e.takeDamage(this.attackDamage, this);
                        }
                    }
                });
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}

// ========== WAR ELEPHANT (Age 5) ==========
export class WarElephant extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'warelephant', 400, x, z, 2.5);
        this.attackRange = 1.8;
        this.attackDamage = 25;
        this.attackCooldown = 1.8;
        this.radius = 1.0;
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            const nextEnemy = game.findNearestEnemy(this.position, this.faction, 8);
            if (nextEnemy) { this.targetEntity = nextEnemy; }
            else { this.state = 'IDLE'; return; }
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, 0.1); // Get close for melee
        const dist = this.distXZ(this.position, attackSpot);
        if (dist > 0.8) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playMeleeHit(this.position);
                game.notifyCombat();
                this.targetEntity.takeDamage(this.attackDamage, this);
                if (game.vfx) game.vfx.spawnBuildDust(this.targetEntity.position);
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}

// ========== CHAMPION (Age 5 - Elite Infantry) ==========
export class Champion extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'champion', 200, x, z, 3.8);
        this.attackRange = 1.2;
        this.attackDamage = 22;
        this.attackCooldown = 0.9;
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            const nextEnemy = game.findNearestEnemy(this.position, this.faction, 8);
            if (nextEnemy) { this.targetEntity = nextEnemy; }
            else { this.state = 'IDLE'; return; }
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, 0.1); // Get close for melee
        const dist = this.distXZ(this.position, attackSpot);
        if (dist > 0.6) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playMeleeHit(this.position);
                if (game.vfx) game.vfx.spawnSwordSparks(this.targetEntity.position);
                game.notifyCombat();
                this.targetEntity.takeDamage(this.attackDamage, this);
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}

// ========== FIGHTER ROBOT (Age 6) ==========
export class FighterRobot extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'fighterrobot', 600, x, z, 2.5);
        this.attackRange = 4.0;
        this.attackDamage = 50;
        this.attackCooldown = 1.0;
        this.radius = 1.0;
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            this.state = 'IDLE'; return;
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, this.attackRange);
        if (this.distXZ(this.position, attackSpot) > 1.0) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                game.spawnArrow(this.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), this.targetEntity, this.attackDamage, 'laser');
                if (game.vfx) game.vfx.spawnSwordSparks(this.mesh.position);
                game.notifyCombat();
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            const targetRot = Math.atan2(dir.x, dir.z);
            let diff = targetRot - this.mesh.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            this.mesh.rotation.y += diff * Math.min(1.0, dt * 4.0);
        }
    }
}

// ========== HELICOPTER (Age 6) ==========
export class Helicopter extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'helicopter', 450, x, z, 3.5);
        this.position.y = 7.5; // Spawn in air
        this.attackRange = 8.0;
        this.attackDamage = 25;
        this.attackCooldown = 0.5; // Rapid fire
        this.radius = 1.5;
        this.isFlying = true;
    }
    animateUnit(dt) {
        const rotor = this.mesh.getObjectByName('mainRotor');
        const rotor2 = this.mesh.getObjectByName('mainRotor2');
        const tailRotor = this.mesh.getObjectByName('tailRotor');
        if (rotor) rotor.rotation.y += 15 * dt;
        if (rotor2) rotor2.rotation.y += 15 * dt;
        if (tailRotor) tailRotor.rotation.x += 15 * dt;

        // Bobbing in the air
        this.mesh.position.y += Math.sin(this.animTime * 2.5 + this.id) * 0.15;
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            this.state = 'IDLE'; return;
        }
        const distToTarget = this.distXZ(this.position, this.targetEntity.position);
        
        // Target angle
        const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
        let targetRot = Math.atan2(dir.x, dir.z);
        
        // If close enough, orbit/strafe slightly
        if (distToTarget < this.attackRange * 0.7) {
             targetRot += Math.PI / 3; 
        }
        
        let diff = targetRot - this.mesh.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.mesh.rotation.y += diff * Math.min(1.0, dt * 3.0);
        
        // Always move smoothly
        const forward = new THREE.Vector3(Math.sin(this.mesh.rotation.y), 0, Math.cos(this.mesh.rotation.y));
        if (!this.velocity) this.velocity = new THREE.Vector3();
        
        // Slow down if inside range, speed up if outside
        const moveSpeed = distToTarget > this.attackRange ? this.speed : this.speed * 0.4;
        this.velocity.lerp(forward.multiplyScalar(moveSpeed), dt * 2.5);
        this.position.add(this.velocity.clone().multiplyScalar(dt));

        if (distToTarget < this.attackRange && Math.abs(diff) < Math.PI / 4) {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playMissileFire(this.position);
                game.spawnArrow(this.mesh.position.clone().add(new THREE.Vector3(0, 0.3, 0)), this.targetEntity, this.attackDamage, 'missile');
                game.notifyCombat();
            }
        }
        
        if (world && world.getElevationAtCoords) {
            let targetY = 7.5;
            if (this.targetEntity && this.targetEntity.isFlying) {
                // Adjust height dynamically during mid-air dogfights
                targetY = this.targetEntity.position.y + Math.sin(this.animTime * 2.0) * 1.5;
            }
            this.position.y += (targetY - this.position.y) * dt * 2.5;
        }
    }
}

// ========== FIGHTER PLANE (Age 6) ==========
export class FighterPlane extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'fighterplane', 300, x, z, 8.0); // Very fast
        this.position.y = 7.5; // Spawn in air
        this.attackRange = 10.0;
        this.attackDamage = 60;
        this.attackCooldown = 2.0;
        this.radius = 1.5;
        this.isFlying = true;
    }
    animateUnit(dt) {
        // Smooth banking effect based on rotation and velocity can be added, but for now simple bobbing
        this.mesh.position.y += Math.sin(this.animTime * 2.5 + this.id) * 0.15;
        
        // Add subtle pitch/roll based on movement
        const speedRatio = this.velocity ? this.velocity.length() / this.speed : 0;
        this.mesh.rotation.x = speedRatio * 0.1; // slight pitch down when flying fast
        this.mesh.rotation.z = Math.cos(this.animTime * 3.0 + this.id) * 0.05 * (1 - speedRatio); // slight wobble when slow
    }
    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            this.state = 'IDLE'; return;
        }
        const distToTarget = this.distXZ(this.position, this.targetEntity.position);
        
        // Target angle
        const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
        let targetRot = Math.atan2(dir.x, dir.z);
        
        // If close enough, orbit
        if (distToTarget < this.attackRange * 0.8) {
             targetRot += Math.PI / 2.5; // Orbit
        }
        
        let diff = targetRot - this.mesh.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.mesh.rotation.y += diff * Math.min(1.0, dt * 2.0); // Smooth turning
        
        // Always move forward
        const forward = new THREE.Vector3(Math.sin(this.mesh.rotation.y), 0, Math.cos(this.mesh.rotation.y));
        if (!this.velocity) this.velocity = new THREE.Vector3();
        this.velocity.lerp(forward.multiplyScalar(this.speed), dt * 2.5);
        this.position.add(this.velocity.clone().multiplyScalar(dt));

        if (distToTarget < this.attackRange && Math.abs(diff) < Math.PI / 3) {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                audio.playMissileFire(this.position);
                game.spawnArrow(this.mesh.position.clone(), this.targetEntity, this.attackDamage, 'missile');
                game.notifyCombat();
            }
        }
        
        if (world && world.getElevationAtCoords) {
            let targetY = 7.5;
            if (this.targetEntity && this.targetEntity.isFlying) {
                // Adjust height dynamically during mid-air dogfights
                targetY = this.targetEntity.position.y + Math.cos(this.animTime * 2.0) * 1.5;
            }
            this.position.y += (targetY - this.position.y) * dt * 2.5;
        }
    }
}

// ========== NAVAL UNITS ==========
export class FishBoat extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'fishboat', 120, x, z, 1.2);
        this.radius = 0.8;
        this.isBoat = true;
        this.gatherTargetType = 'fishzone'; // Specific gather target
        this.carryingCapacity = 30;
    }
    
    animateUnit(dt) {
        // Bobbing on water
        this.mesh.position.y = Math.sin(this.animTime * 2.5 + this.id) * 0.05;
        this.mesh.rotation.z = Math.sin(this.animTime * 1.5 + this.id) * 0.08;
        this.mesh.rotation.x = Math.cos(this.animTime * 1.2 + this.id) * 0.05;
        
        // Wake effect if moving
        if (this.state === 'MOVE' && window.game && window.game.vfx && Math.random() < 0.2) {
            window.game.vfx.spawnWake(this.position);
            if (typeof audio !== 'undefined' && audio.playRipple) audio.playRipple(this.position);
        }
    }

    handleGatherState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            const nextRes = game.findNearestResource(this.position, 'fishzone', this.faction);
            if (nextRes) { this.setOrder('GATHER', nextRes); }
            else { this.returnResources(game); }
            return;
        }
        
        const totalCarried = Object.values(this.carrying).reduce((a, b) => a + b, 0);
        if (totalCarried >= this.carryingCapacity) { this.returnResources(game); return; }

        this.gatherTargetType = 'fishzone';
        const gatherSpot = this.getApproachPosition(this.targetEntity, 1.0);
        const dist = this.distXZ(this.position, gatherSpot);
        if (dist > 1.2) {
            this.targetPos.copy(gatherSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            this.gatherTimer = (this.gatherTimer || 0) + dt;
            if (this.gatherTimer >= 1.0) {
                this.gatherTimer = 0;
                if (game.vfx) game.vfx.spawnWake(this.mesh.position);
                const collected = Math.min(this.carryingCapacity - totalCarried, 3); // Faster than villagers
                this.carrying.food += collected;
                this.targetEntity.takeDamage(collected, this);
                if (typeof audio !== 'undefined' && audio.playRipple) audio.playRipple(this.position);
            }
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }

    returnResources(game) {
        const dropoff = game.entities.find(e => !e.dead && e.faction === this.faction && (e.type === 'fishmarket' || e.type === 'towncenter'));
        if (dropoff) {
            this.setOrder('RETURN_RESOURCE', dropoff);
        } else {
            this.state = 'IDLE';
        }
    }

    handleReturnResourceState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            this.returnResources(game); return;
        }
        const approachPos = this.getApproachPosition(this.targetEntity, 1.5);
        if (this.distXZ(this.position, approachPos) > 1.5) {
            this.targetPos.copy(approachPos);
            this.moveTowardsTarget(dt, world);
        } else {
            if (!game.factionResources) game.factionResources = {};
            if (!game.factionResources[this.faction]) game.factionResources[this.faction] = { food: 200, wood: 200, gold: 100, stone: 0 };
            
            for (const res in this.carrying) {
                if (this.carrying[res] > 0) {
                    game.factionResources[this.faction][res] += this.carrying[res];
                    if (this.faction === game.localFaction) {
                        game.playerResources[res] = game.factionResources[this.faction][res];
                    }
                    this.carrying[res] = 0;
                }
            }
            
            if (this.faction === game.localFaction) {
                game.updateHUD();
                if (this.gatherTargetType === 'carcass') audio.playFleshy(this.position); else audio.playDropoff(this.position);
            }
            
            // Go back to gathering
            const nextRes = game.findNearestResource(this.position, 'fishzone', this.faction);
            if (nextRes) { this.setOrder('GATHER', nextRes); }
            else { this.state = 'IDLE'; }
        }
    }
}

export class WarShip extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'warship', 500, x, z, 1.0);
        this.attackRange = 12.0;
        this.attackDamage = 35;
        this.attackCooldown = 1.5;
        this.radius = 1.2;
        this.isBoat = true;
    }

    animateUnit(dt) {
        // Heavy bobbing
        this.mesh.position.y = Math.sin(this.animTime * 1.5 + this.id) * 0.08;
        this.mesh.rotation.z = Math.sin(this.animTime * 1.0 + this.id) * 0.05;
        this.mesh.rotation.x = Math.cos(this.animTime * 0.8 + this.id) * 0.03;
        
        // Wake effect if moving
        if (this.state === 'MOVE' && window.game && window.game.vfx && Math.random() < 0.3) {
            window.game.vfx.spawnWake(this.position);
            if (typeof audio !== 'undefined' && audio.playRipple) audio.playRipple(this.position);
        }
    }

    handleAttackState(dt, world, game) {
        if (!this.targetEntity || this.targetEntity.dead) {
            this.state = 'IDLE'; return;
        }
        const attackSpot = this.getApproachPosition(this.targetEntity, this.attackRange);
        if (this.distXZ(this.position, attackSpot) > 1.0) {
            this.targetPos.copy(attackSpot);
            this.moveTowardsTarget(dt, world);
        } else {
            if (this.attackTimer <= 0) {
                this.attackTimer = this.attackCooldown;
                game.spawnArrow(this.mesh.position.clone().add(new THREE.Vector3(0, 0.6, 0)), this.targetEntity, this.attackDamage, 'cannonball');
                if (game.vfx) game.vfx.spawnSmoke(this.mesh.position);
                game.notifyCombat();
            }
            // Broadside aiming (turn side to target)
            const dir = new THREE.Vector3().copy(this.targetEntity.position).sub(this.position);
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z) + Math.PI / 2; // Perpendicular
        }
    }
}

export class TransportBoat extends Unit {
    constructor(id, faction, x, z) {
        super(id, faction, 'transportboat', 400, x, z, 1.0);
        this.isBoat = true;
        this.speed = 4.0;
        this.radius = 1.5;
        this.loadedEntities = [];
    }

    animateUnit(dt) {
        this.mesh.position.y = Math.sin(this.animTime * 1.5 + this.id) * 0.08;
        this.mesh.rotation.z = Math.sin(this.animTime * 1.0 + this.id) * 0.05;
        this.mesh.rotation.x = Math.cos(this.animTime * 0.8 + this.id) * 0.03;
        if (this.state === 'MOVE' && window.game && window.game.vfx && Math.random() < 0.3) {
            window.game.vfx.spawnWake(this.position);
            if (typeof audio !== 'undefined' && audio.playRipple) audio.playRipple(this.position);
        }
    }

    die() {
        super.die();
        if (this.loadedEntities) {
            this.loadedEntities.forEach(u => {
                u.isLoaded = false;
                if (u.mesh) u.mesh.visible = true;
                u.die();
            });
        }
    }
}

// ========== BUILDING ==========
export class Building extends GameEntity {
    constructor(id, faction, type, maxHealth, x, z, cost) {
        super(id, faction, type, maxHealth, x, z);
        this.isBuilding = true;
        this.radius = 1.5;
        this.isCompleted = false;
        this.buildProgress = 0;
        this.cost = cost;
        this.queue = [];
        this.trainingProgress = 0;
        this.trainingDuration = 8;
        this.smokeTimer = 0;

        if (type === 'towncenter') this.radius = 2.0;
        else if (type === 'house' || type === 'farm') this.radius = 1.0;
        else if (type === 'tower') this.radius = 0.8;
    }

    completeConstruction() {
        this.isCompleted = true;
        this.buildProgress = 100;
        this.health = this.maxHealth;
        if (this.type === 'farm') this.isResource = true;
        this.mesh.scale.set(1.0, 1.0, 1.0);
    }

    trainUnit(unitType) {
        if (this.queue.length >= 5) return false;
        this.queue.push(unitType);
        return true;
    }

    update(dt, world, game) {
        if (this.dead) return;

        if (!this.isCompleted) {
            const scaleY = 0.2 + (this.buildProgress / 100) * 0.8;
            this.mesh.scale.set(1.0, scaleY, 1.0);
            return;
        }

        // Training queue
        if (this.queue.length > 0) {
            this.trainingProgress += (100 / this.trainingDuration) * dt;
            if (this.trainingProgress >= 100) {
                const trained = this.queue.shift();
                game.spawnUnit(this.faction, trained, this.position.x, this.position.z + this.radius + 1.0);
                this.trainingProgress = 0;
            }
        }

        // Smoke from chimney (if building has smokePosition)
        if (game.vfx && this.mesh.userData.smokePosition) {
            this.smokeTimer += dt;
            if (this.smokeTimer > 3) {
                this.smokeTimer = 0;
                const worldSmoke = this.mesh.userData.smokePosition.clone().add(this.position);
                game.vfx.spawnSmoke(worldSmoke);
            }
        }

        // Torch fire (if building has torchPositions)
        if (game.vfx && this.mesh.userData.torchPositions) {
            this.smokeTimer += dt * 0.5;
            if (this.smokeTimer > 2) {
                this.smokeTimer = 0;
                this.mesh.userData.torchPositions.forEach(tp => {
                    const worldTorch = tp.clone().add(this.position);
                    game.vfx.spawnTorchFire(worldTorch);
                });
            }
        }
    }
}

// ========== TOWER ==========
export class Tower extends Building {
    constructor(id, faction, x, z) {
        super(id, faction, 'tower', 300, x, z, { wood: 150, stone: 100 });
        this.attackRange = 8.0;
        this.attackDamage = 10;
        this.attackCooldown = 1.8;
        this.attackTimer = 0;
    }

    update(dt, world, game) {
        super.update(dt, world, game);
        if (!this.isCompleted || this.dead) return;
        if (this.attackTimer > 0) this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
            const enemy = game.findNearestEnemy(this.position, this.faction, this.attackRange);
            if (enemy) {
                this.attackTimer = this.attackCooldown;
                audio.playShoot(this.position);
                game.notifyCombat();
                game.spawnArrow(new THREE.Vector3(this.position.x, 3.2, this.position.z), enemy, this.attackDamage);
            }
        }
    }
}

// ========== ANIMAL ==========
export class Animal extends GameEntity {
    constructor(id, type, maxHealth, x, z, speed) {
        super(id, 'neutral', type, maxHealth, x, z);
        this.speed = speed;
        this.radius = 0.4;
        this.targetPos = new THREE.Vector3().copy(this.position);
        this.state = 'IDLE';
        this.idleTimer = Math.random() * 5;
        this.animTime = Math.random() * 10;
        this.velocity = new THREE.Vector3();
    }

    update(dt, world, game) {
        if (this.dead) return;
        this.animTime += dt;

        // Simple wandering logic
        if (this.state === 'IDLE') {
            this.idleTimer -= dt;
            if (this.idleTimer <= 0) {
                this.state = 'WANDER';
                const wanderDist = 4 + Math.random() * 6;
                const angle = Math.random() * Math.PI * 2;
                
                const targetX = this.position.x + Math.cos(angle) * wanderDist;
                const targetZ = this.position.z + Math.sin(angle) * wanderDist;
                const elevation = world.getElevationAtCoords(targetX, targetZ);
                
                if (elevation >= -0.1) {
                    this.targetPos.set(targetX, elevation, targetZ);
                } else {
                    this.state = 'IDLE'; // Cancel wander if target is in deep water
                }
            }
            // Idle animation (gentle bob or head movement)
            if (this.type === 'deer') {
                const head = this.mesh.children.find(c => c.geometry.type === 'BoxGeometry' && c.position.y > 0.4);
                if (head) head.rotation.x = Math.sin(this.animTime * 2) * 0.1;
            }
        } else if (this.state === 'WANDER') {
            const dist = this.position.distanceTo(this.targetPos);

            if (dist < 0.3) {
                this.state = 'IDLE';
                this.idleTimer = 3 + Math.random() * 5;
            } else {
                const toTarget = this.targetPos.clone().sub(this.position);
                toTarget.y = 0;
                const dir = toTarget.clone().normalize();
                
                const step = dir.clone().multiplyScalar(this.speed * dt);
                const nextX = this.position.x + step.x;
                const nextZ = this.position.z + step.z;
                
                const nextElev = world.getElevationAtCoords(nextX, nextZ);
                if (nextElev < -0.1 && !(world.getElevationAtCoords(this.position.x, this.position.z) < -0.1 && nextElev > world.getElevationAtCoords(this.position.x, this.position.z))) {
                    this.state = 'IDLE';
                    this.idleTimer = 1.0;
                } else {
                    this.position.add(step);
                    this.position.y = world.getElevationAtCoords(this.position.x, this.position.z);
                }
                
                this.logicalX = this.position.x;
                this.logicalZ = this.position.z;

                this.alignMesh(dir);

                // Walking animation
                const bob = Math.abs(Math.sin(this.animTime * 12)) * 0.1;
                this.mesh.position.y += bob;

                if (this.type === 'deer') {
                    // Leg swing
                    const legs = this.mesh.children.filter(c => c.geometry.type === 'CylinderGeometry' && c.position.y < 0.2);
                    legs.forEach((leg, i) => {
                        leg.rotation.x = Math.sin(this.animTime * 12 + (i % 2 === 0 ? 0 : Math.PI)) * 0.3;
                    });
                }
            }
        }
        
        // Ensure they stay on the terrain
        if (world && world.getElevationAtCoords) {
            const elevation = world.getElevationAtCoords(this.position.x, this.position.z);
            this.position.y = elevation;
            
            if (this.state === 'IDLE') {
                const breathe = Math.sin(this.animTime * 1.5) * 0.008;
                this.mesh.position.y += breathe;
                this.alignMesh();
            }
        }
    }
}
