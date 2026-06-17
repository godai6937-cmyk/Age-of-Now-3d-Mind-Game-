// Enemy AI Controller — with Age Progression
export class EnemyAI {
    constructor(game, faction = 'enemy', basePos = {x: 40, z: -40}, difficulty = 'normal') {
        this.game = game;
        this.faction = faction;
        this.difficulty = difficulty;
        
        const diffMults = {
            'easy': { income: 0.5, ageTime: 1.5, raidInterval: 1.5, popLimit: 30 },
            'normal': { income: 1.0, ageTime: 1.0, raidInterval: 1.0, popLimit: 60 },
            'hard': { income: 2.0, ageTime: 0.6, raidInterval: 0.5, popLimit: 100 }
        };
        const mult = diffMults[this.difficulty] || diffMults['normal'];
        
        // AI resources
        this.resources = { food: 200, wood: 200, gold: 100, stone: 0 };
        this.maxPopulation = 10;
        this.popLimit = mult.popLimit;
        this.incomeMult = mult.income;
        
        // Timer gates
        this.thinkTimer = 0;
        this.thinkInterval = 3.0; // think every 3 seconds
        
        this.raidTimer = 0;
        this.raidInterval = 45.0 * mult.raidInterval; // raid every 45 seconds
        
        // Age system
        this.currentAge = 1;
        this.ageTimer = 0;
        this.AGE_TIMERS = [0, 0, 180, 360, 540, 720].map(t => t * mult.ageTime); 
        
        this.aiBaseCenter = new THREE.Vector3(basePos.x, 0, basePos.z);
    }

    update(dt) {
        this.thinkTimer += dt;
        this.raidTimer += dt;
        this.ageTimer += dt;

        // Add resource drip (AI cheat passive income to keep match active)
        this.resources.food += 0.5 * dt * this.incomeMult;
        this.resources.wood += 0.5 * dt * this.incomeMult;
        this.resources.gold += 0.3 * dt * this.incomeMult;
        this.resources.stone += 0.1 * dt * this.incomeMult;

        // Age-based resource boost (higher ages = faster income)
        if (this.currentAge >= 2) {
            this.resources.gold += 0.3 * dt;
            this.resources.stone += 0.15 * dt;
        }
        if (this.currentAge >= 3) {
            this.resources.food += 0.4 * dt;
            this.resources.gold += 0.5 * dt;
        }
        if (this.currentAge >= 4) {
            this.resources.gold += 0.8 * dt;
            this.resources.stone += 0.4 * dt;
        }

        // Check age advancement on timer
        this.checkAgeAdvance();

        if (this.thinkTimer >= this.thinkInterval) {
            this.thinkTimer = 0;
            this.executeAIBehavior();
        }

        if (this.raidTimer >= this.raidInterval) {
            this.raidTimer = 0;
            this.launchRaid();
        }
    }

    checkAgeAdvance() {
        if (this.currentAge >= 5) return;
        const nextAgeTime = this.AGE_TIMERS[this.currentAge + 1];
        if (this.ageTimer >= nextAgeTime) {
            this.currentAge++;
            // AI gets free resources on age up
            this.resources.food += 200;
            this.resources.gold += 200;
            this.resources.stone += 100;
        }
    }

    executeAIBehavior() {
        // Find all enemy entities
        const myEntities = this.game.entities.filter(e => !e.dead && e.faction === this.faction);
        const villagers = myEntities.filter(e => e.type === 'villager');
        const military = myEntities.filter(e => e.isUnit && e.type !== 'villager');
        const townCenters = myEntities.filter(e => e.type === 'towncenter');
        const barracks = myEntities.filter(e => e.type === 'barracks');
        const houses = myEntities.filter(e => e.type === 'house');
        const towers = myEntities.filter(e => e.type === 'tower');
        const stables = myEntities.filter(e => e.type === 'stable');
        const castles = myEntities.filter(e => e.type === 'castle');
        const fortresses = myEntities.filter(e => e.type === 'fortress');

        const popCurrent = villagers.length + military.length;
        
        // 1. Manage Population Cap
        this.maxPopulation = 10 + (houses.length * 5);
        if (townCenters.length > 0) this.maxPopulation += 10;
        if (this.maxPopulation > this.popLimit) this.maxPopulation = this.popLimit;

        // Build house if population is tight
        if (popCurrent >= this.maxPopulation - 2 && this.maxPopulation < this.popLimit) {
            if (this.resources.wood >= 50) {
                this.orderVillagerToBuild('house', 50, { food: 0, wood: 50, gold: 0, stone: 0 });
            }
        }

        // 2. Train Villagers (Target: 6 villagers)
        if (villagers.length < 6 && townCenters.length > 0) {
            const tc = townCenters[0];
            if (tc.isCompleted && tc.queue.length === 0 && this.resources.food >= 50 && popCurrent < this.maxPopulation) {
                this.resources.food -= 50;
                tc.trainUnit('villager');
            }
        }

        // 3. Rebuild Barracks if destroyed
        if (barracks.length === 0 && this.resources.wood >= 150) {
            this.orderVillagerToBuild('barracks', 150, { food: 0, wood: 150, gold: 0, stone: 0 });
        }

        // 4. Build Watchtower for defense if stone is available
        if (towers.length < 2 && this.resources.wood >= 150 && this.resources.stone >= 100) {
            this.orderVillagerToBuild('tower', 200, { food: 0, wood: 150, gold: 0, stone: 100 });
        }

        // ===== AGE 2+ BUILDINGS =====
        if (this.currentAge >= 2) {
            // Build Stable
            if (stables.length === 0 && this.resources.wood >= 200 && this.resources.gold >= 50) {
                this.orderVillagerToBuild('stable', 200, { food: 0, wood: 200, gold: 50, stone: 0 });
            }
        }

        if (this.currentAge >= 3) {
            // Build Castle
            if (castles.length === 0 && this.resources.gold >= 200 && this.resources.stone >= 250) {
                this.orderVillagerToBuild('castle', 250, { food: 0, wood: 0, gold: 200, stone: 250 });
            }
        }

        if (this.currentAge >= 4) {
            // Build Fortress
            if (fortresses.length === 0 && this.resources.gold >= 400 && this.resources.stone >= 300) {
                this.orderVillagerToBuild('fortress', 300, { food: 0, wood: 0, gold: 400, stone: 300 });
            }
        }

        // 5. Train Army from available buildings
        if (popCurrent < this.maxPopulation) {
            // Barracks: Soldiers & Archers (all ages)
            if (barracks.length > 0) {
                const b = barracks[0];
                if (b.isCompleted && b.queue.length === 0) {
                    if (Math.random() > 0.5 && this.resources.food >= 60 && this.resources.gold >= 20) {
                        this.resources.food -= 60;
                        this.resources.gold -= 20;
                        b.trainUnit('soldier');
                    } else if (this.resources.food >= 40 && this.resources.wood >= 35) {
                        this.resources.food -= 40;
                        this.resources.wood -= 35;
                        b.trainUnit('archer');
                    }
                }
            }

            // Stable: Knights (Age 2+)
            if (this.currentAge >= 2 && stables.length > 0) {
                const s = stables[0];
                if (s.isCompleted && s.queue.length === 0 && this.resources.food >= 80 && this.resources.gold >= 60) {
                    this.resources.food -= 80;
                    this.resources.gold -= 60;
                    s.trainUnit('knight');
                }
            }

            // Castle: Crossbowman (Age 3+)
            if (this.currentAge >= 3 && castles.length > 0) {
                const c = castles[0];
                if (c.isCompleted && c.queue.length === 0 && this.resources.food >= 60 && this.resources.gold >= 40) {
                    this.resources.food -= 60;
                    this.resources.gold -= 40;
                    c.trainUnit('crossbowman');
                }
            }

            // Fortress: Paladin (Age 4+)
            if (this.currentAge >= 4 && fortresses.length > 0) {
                const f = fortresses[0];
                if (f.isCompleted && f.queue.length === 0 && this.resources.food >= 120 && this.resources.gold >= 100) {
                    this.resources.food -= 120;
                    this.resources.gold -= 100;
                    f.trainUnit('paladin');
                }
            }
        }

        // 6. Manage Idle Villagers (Balance gather jobs)
        villagers.forEach(vil => {
            if (vil.state === 'IDLE') {
                const targetRes = this.chooseResourceToGather();
                const node = this.game.findNearestResource(vil.position, targetRes);
                if (node) {
                    vil.setOrder('GATHER', node);
                }
            }
        });

        // 7. Defensive Army Patrol: Make idle military units defend base center
        military.forEach(sold => {
            if (sold.state === 'IDLE') {
                // If enemy spots player unit nearby, attack it
                const targetPlayer = this.game.findNearestEnemy(sold.position, this.faction, 10);
                if (targetPlayer) {
                    sold.setOrder('ATTACK', targetPlayer);
                } else {
                    // Return/Patrol base center
                    const scatterX = this.aiBaseCenter.x + (Math.random() - 0.5) * 6;
                    const scatterZ = this.aiBaseCenter.z + (Math.random() - 0.5) * 6;
                    sold.moveTo(scatterX, scatterZ);
                }
            }
        });
    }

    chooseResourceToGather() {
        // Decide what to gather based on scarcest resource
        const { food, wood, gold, stone } = this.resources;
        if (food < 100) return 'forage';
        if (wood < 100) return 'tree';
        if (gold < 50) return 'gold';
        
        // Random pick
        const rand = Math.random();
        if (rand < 0.35) return 'forage';
        if (rand < 0.70) return 'tree';
        if (rand < 0.90) return 'gold';
        return 'stone';
    }

    orderVillagerToBuild(type, costWood, costRes) {
        // Find idle/working villager
        const myEntities = this.game.entities.filter(e => !e.dead && e.faction === this.faction);
        const villagers = myEntities.filter(e => e.type === 'villager');
        if (villagers.length === 0) return;

        // Pick closest villager to build point
        // Build position slightly offset from AI center
        const offset = {
            'house': { x: 5, z: -5 },
            'barracks': { x: -3, z: -5 },
            'tower': { x: -8, z: 2 },
            'stable': { x: 6, z: 3 },
            'castle': { x: -6, z: -8 },
            'fortress': { x: 8, z: -3 },
        }[type] || { x: 0, z: -6 };

        const bx = this.aiBaseCenter.x + offset.x + (Math.random() - 0.5) * 2;
        const bz = this.aiBaseCenter.z + offset.z + (Math.random() - 0.5) * 2;

        // Pay resources
        this.resources.food -= costRes.food;
        this.resources.wood -= costRes.wood;
        this.resources.gold -= costRes.gold;
        this.resources.stone -= costRes.stone;

        // Place ghost building
        const building = this.game.createAIGhostBuilding(this.faction, type, bx, bz, costRes);
        if (building) {
            // Assign best villager to go build it
            let bestVil = villagers[0];
            let minDist = Infinity;
            villagers.forEach(v => {
                const d = v.position.distanceTo(building.position);
                if (d < minDist) {
                    minDist = d;
                    bestVil = v;
                }
            });
            bestVil.setOrder('BUILD', building);
        }
    }

    launchRaid() {
        const myEntities = this.game.entities.filter(e => !e.dead && e.faction === this.faction);
        const military = myEntities.filter(e => e.isUnit && e.type !== 'villager');
        
        // Scale raid threshold by age
        const minUnits = Math.max(2, 3 - Math.floor(this.currentAge / 2));
        
        if (military.length >= minUnits) {
            // Find target player structure (TC first, then anything), attacking ANY faction that is not mine
            const enemyTCs = this.game.entities.filter(e => !e.dead && e.faction !== this.faction && e.faction !== 'neutral' && e.faction !== 'nature' && e.type === 'towncenter');
            let target = null;
            
            if (enemyTCs.length > 0) {
                target = enemyTCs[0];
            } else {
                const otherEnts = this.game.entities.filter(e => !e.dead && e.faction !== this.faction && e.faction !== 'neutral' && e.faction !== 'nature');
                if (otherEnts.length > 0) {
                    target = otherEnts[0];
                }
            }

            if (target) {
                // Command all military units to attack target!
                military.forEach(sold => {
                    sold.setOrder('ATTACK', target);
                });
            }
        }
    }
}
