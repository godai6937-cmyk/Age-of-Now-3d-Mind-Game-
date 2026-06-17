// Sound Effects Synthesizer using Web Audio API
class AudioSystem {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.ambientNodes = [];
        this.inBattle = false;
        this.battleNodes = [];
        this.lastFootstepTime = 0;
        this.customBGM = null;
        this.buffers = {};
        this.soundFiles = {
            click: 'assets/audio/click.mp3',
            order: 'assets/audio/order.mp3',
            chop: 'assets/audio/chop.mp3',
            mine: 'assets/audio/mine.mp3',
            build: 'assets/audio/build.mp3',
            melee: 'assets/audio/sword_slash.mp3',
            shoot: 'assets/audio/arrow_shot.mp3',
            missile_fire: 'assets/audio/missile_fire.mp3',
            missile_blast: 'assets/audio/missile_blast.mp3',
            footstep: 'assets/audio/footstep.mp3',
            death: 'assets/audio/death.mp3',
            battlecry: 'assets/audio/hurt.mp3',
            errorBuzzer: 'assets/audio/error_buzzer.mp3',
            ripple: 'assets/audio/water_ripple.mp3',
            dropoff: 'assets/audio/resource_dropoff.mp3',
            collapse: 'assets/audio/building_collapse.mp3',
            spawn: 'assets/audio/unit_spawn.mp3',
            fleshy: 'assets/audio/fleshy_hit.mp3'
        };
    }

    async init() {
        if (this.ctx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
        // Load all sound buffers and wait for completion
        await this.loadSounds();
        // Verify that each declared sound file was loaded at least once
        const missing = [];
        for (const [name, path] of Object.entries(this.soundFiles)) {
            if (!this.buffers[name] || this.buffers[name].length === 0) {
                missing.push(`${name}: ${path}`);
            }
        }
        if (missing.length > 0) {
            console.warn('AudioSystem: Missing or failed to load the following sound files:', missing);
        }
        this.startAmbient();
    }

    async loadSounds() {
        for (const [name, path] of Object.entries(this.soundFiles)) {
            this.buffers[name] = [];
            const basePath = path.replace('.mp3', '');
            const pathsToTry = [path];
            for (let i = 2; i <= 6; i++) {
                pathsToTry.push(`${basePath}_${i}.mp3`);
            }

            for (const p of pathsToTry) {
                try {
                    const response = await fetch(p + '?v=' + Date.now());
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        this.ctx.decodeAudioData(arrayBuffer, (buffer) => {
                            this.buffers[name].push(buffer);
                        });
                    } else {
                        // Stop trying numbered files if one fails
                        if (p !== path) break;
                    }
                } catch (e) {
                    if (p !== path) break;
                }
            }
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.ctx) {
            if (this.muted) {
                this.ctx.suspend();
            } else {
                this.ctx.resume();
            }
        }
        return this.muted;
    }

    createGain(duration, startVal = 0.1, decay = 0.0001) {
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(startVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(decay, this.ctx.currentTime + duration);
        gain.connect(this.ctx.destination);
        return gain;
    }

    // Returns a volume multiplier 0.0–1.0 based on distance from camera.
    // Returns 0 if the sound is off-screen (should not play at all).
    // Close to camera = 1.0, far away = fades down, beyond visible range = 0.
    getDistanceVolume(pos) {
        if (!pos || !window.game || !window.game.cameraTarget) return 1.0; // No position = UI sound, full volume
        const camTarget = window.game.cameraTarget;
        const dist = camTarget.distanceTo(pos);
        // Visible range scales with camera zoom: closer zoom = smaller audible area
        const cameraZoom = (window.game && window.game.cameraRadius) || 22;
        const maxAudibleDist = cameraZoom * 2.5; // At zoom 8 => 20 units, at zoom 45 => 112 units
        if (dist > maxAudibleDist) return 0; // Off-screen, don't play
        // Quadratic falloff for realistic distance feel
        const factor = 1.0 - (dist / maxAudibleDist);
        return factor * factor; // Quadratic: close=loud, far=very quiet
    }

    isAudible(pos) {
        return this.getDistanceVolume(pos) > 0;
    }

    playSoundBuffer(name, baseVolume = 0.5, pos = null) {
        const dv = this.getDistanceVolume(pos);
        if (dv <= 0) return true; // Return true to skip fallback synthesis if out of range

        if (this.muted || !this.ctx || !this.buffers[name] || this.buffers[name].length === 0) return false;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        let finalVolume = baseVolume * dv;
        let panX = 0;

        if (pos && window.game && window.game.cameraTarget && window.THREE) {
            const vecToTarget = new window.THREE.Vector3().subVectors(pos, window.game.cameraTarget);
            // Pan based on horizontal offset relative to camera target
            panX = Math.max(-1, Math.min(1, vecToTarget.x / 25));
        }

        const source = this.ctx.createBufferSource();
        const buffers = this.buffers[name];
        source.buffer = buffers[Math.floor(Math.random() * buffers.length)];
        
        const gainNode = this.ctx.createGain();
        gainNode.gain.value = finalVolume;
        
        if (this.ctx.createStereoPanner) {
            const panner = this.ctx.createStereoPanner();
            panner.pan.value = panX;
            source.connect(panner);
            panner.connect(gainNode);
        } else {
            source.connect(gainNode);
        }
        
        gainNode.connect(this.ctx.destination);
        source.start(0);
        return true;
    }

    // --- SOUND EFFECTS ---

    playBattleCry(pos = null) {
        if (this.playSoundBuffer('battlecry', 0.7, pos)) return;
        const dv = this.getDistanceVolume(pos);
        if (dv <= 0 || this.muted || !this.ctx) return;
        this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.3, 0.4 * dv);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playFootstep(pos = null, volume = 0.8) {
        if (this.playSoundBuffer('footstep', volume, pos)) return;
        const dv = this.getDistanceVolume(pos);
        if (dv <= 0 || this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        // Soft thud
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.05);
        const gain = this.createGain(0.05, volume * dv);
        osc.connect(gain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playError() {
        if (this.playSoundBuffer('errorBuzzer', 0.7)) return;
    }

    playRipple(pos = null) {
        if (this.playSoundBuffer('ripple', 0.6, pos)) return;
    }

    playDropoff(pos = null) {
        if (this.playSoundBuffer('dropoff', 0.8, pos)) return;
    }

    playCollapse(pos = null) {
        if (this.playSoundBuffer('collapse', 1.0, pos)) return;
    }

    playSpawn(pos = null) {
        if (this.playSoundBuffer('spawn', 0.8, pos)) return;
    }

    playFleshy(pos = null) {
        if (this.playSoundBuffer('fleshy', 0.8, pos)) return;
    }

    playClick(pos = null) {
        if (this.playSoundBuffer('click', 0.6, pos)) return;
        if (this.muted || !this.ctx) return;
        this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.08, 0.05);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playOrder() {
        if (this.playSoundBuffer('order', 0.5)) return;
        if (this.muted || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.12, 0.04);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.setValueAtTime(250, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    playChop(pos = null) {
        if (this.playSoundBuffer('chop', 1.0, pos)) return;
        const dv = this.getDistanceVolume(pos);
        if (dv <= 0 || this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        
        // Thud
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        const oscGain = this.createGain(0.1, 0.7 * dv);
        osc.connect(oscGain);
        osc.start(now);
        osc.stop(now + 0.1);

        // Crunch noise
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        const noiseGain = this.createGain(0.1, 0.6 * dv);
        noise.connect(filter);
        filter.connect(noiseGain);
        noise.start(now);
    }

    playMine(pos = null) {
        if (this.playSoundBuffer('mine', 1.0, pos)) return;
        const dv = this.getDistanceVolume(pos);
        if (dv <= 0 || this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        
        // Metallic clink
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.createGain(0.15, 0.7 * dv);
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2200, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(3500, now);
        osc2.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
        
        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.15);
        osc2.stop(now + 0.15);
    }

    playBuild(pos = null) {
        if (this.playSoundBuffer('build', 0.8, pos)) return;
        const dv = this.getDistanceVolume(pos);
        if (dv <= 0 || this.muted || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.15, 0.12 * dv);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playHammer(volume = 0.8, pos = null) {
        const dv = this.getDistanceVolume(pos);
        if (dv <= 0 || this.muted || !this.ctx || volume < 0.01) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const clampedVol = Math.min(volume, 0.6) * dv;

        // Impact noise burst (hammer strike)
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800 + Math.random() * 400, now);
        filter.Q.setValueAtTime(3, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(clampedVol * 0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);

        // Wood thud (low resonant hit)
        const thud = this.ctx.createOscillator();
        thud.type = 'sine';
        thud.frequency.setValueAtTime(180 + Math.random() * 60, now);
        thud.frequency.exponentialRampToValueAtTime(60, now + 0.12);

        const thudGain = this.ctx.createGain();
        thudGain.gain.setValueAtTime(clampedVol * 0.5, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        thud.connect(thudGain);
        thudGain.connect(this.ctx.destination);
        thud.start(now);
        thud.stop(now + 0.12);

        // Metallic ring (subtle anvil/nail ping)
        const ring = this.ctx.createOscillator();
        ring.type = 'sine';
        ring.frequency.setValueAtTime(2800 + Math.random() * 600, now);

        const ringGain = this.ctx.createGain();
        ringGain.gain.setValueAtTime(clampedVol * 0.15, now);
        ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        ring.connect(ringGain);
        ringGain.connect(this.ctx.destination);
        ring.start(now);
        ring.stop(now + 0.18);
    }

    playMeleeHit(pos = null) {
        if (this.playSoundBuffer('melee', 0.5, pos)) return;
        const dv = this.getDistanceVolume(pos);
        if (dv <= 0 || this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        
        // Sword clash
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.1, 0.8 * dv);
        gain.gain.setValueAtTime(0.8 * dv, now);
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200 + Math.random()*400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        
        const oscRing = this.ctx.createOscillator();
        const ringGain = this.createGain(0.3, 0.6 * dv);
        ringGain.gain.setValueAtTime(0.6 * dv, now);
        oscRing.type = 'sine';
        oscRing.frequency.setValueAtTime(4000 + Math.random()*1000, now);
        
        osc.connect(gain);
        oscRing.connect(ringGain);
        osc.start(now);
        oscRing.start(now);
        osc.stop(now + 0.1);
        oscRing.stop(now + 0.3);
    }

    playShoot(pos = null) {
        if (this.playSoundBuffer('shoot', 0.6, pos)) return;
        const dv = this.getDistanceVolume(pos);
        if (dv <= 0 || this.muted || !this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);
        const gain = this.createGain(0.15, 0.06 * dv);
        noise.connect(filter);
        filter.connect(gain);
        noise.start();
    }

    playMissileFire(pos = null) {
        if (this.playSoundBuffer('missile_fire', 0.8, pos)) return;
        const dv = this.getDistanceVolume(pos);
        if (dv <= 0 || this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        
        // Whoosh sound
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1.5 * dv, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        gain.connect(this.ctx.destination);
        
        noise.connect(filter);
        filter.connect(gain);
        noise.start(now);
    }

    playMissileBlast(pos = null) {
        if (this.playSoundBuffer('missile_blast', 1.0, pos)) return;
        this.playExplosion(pos);
    }

    playExplosion(pos = null) {
        if (this.playSoundBuffer('missile_blast', 0.8, pos)) return;
        const dv = this.getDistanceVolume(pos);
        if (dv <= 0 || this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        
        // Deep rumble oscillator
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.8);
        
        // Noise buffer for the crash
        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.8);
        
        const gain = this.createGain(0.8, 2.5 * dv);
        gain.gain.setValueAtTime(2.5 * dv, now);
        
        osc.connect(gain);
        noise.connect(filter);
        filter.connect(gain);
        
        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.8);
    }

    playSplash(pos = null) {
        const dv = this.getDistanceVolume(pos);
        if (dv <= 0 || this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(400, now + 0.3);
        filter.Q.value = 1;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        gain.connect(this.ctx.destination);
        
        noise.connect(filter);
        filter.connect(gain);
        noise.start(now);
    }

    // playFootstep duplicate removed — the primary definition is at line ~167

    playDeathGrunt(pos = null) {
        if (this.playSoundBuffer('death', 0.7, pos)) return;
        if (this.muted || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.3, 0.15);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playBuildingComplete() {
        if (this.muted || !this.ctx) return;
        const notes = [261.63, 329.63, 392.00]; // C4, E4, G4
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.createGain(0.8, 0.1);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);
            osc.connect(gain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.8 + idx * 0.05);
        });
    }

    playAgeAdvance() {
        if (this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        // Triumphant ascending fanfare
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4→E4→G4→C5→E5
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const t = now + idx * 0.12;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
            gain.gain.setValueAtTime(0.12, t + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.6);
        });
        // Bass note
        const bass = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bass.type = 'sine';
        bass.frequency.setValueAtTime(130.81, now); // C3
        bassGain.gain.setValueAtTime(0.08, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
        bass.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bass.start(now);
        bass.stop(now + 2.0);
    }

    

    playWin() {
        if (this.muted || !this.ctx) return;
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + idx * 0.15 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.15 + 1.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + idx * 0.15 + 1.25);
        });
    }

    playLose() {
        if (this.muted || !this.ctx) return;
        const notes = [196.00, 155.56, 130.81];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.25);
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + idx * 0.25 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.25 + 1.5);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + idx * 0.25 + 1.6);
        });
    }

    // --- AMBIENT LAYERED MUSIC ---

    startAmbient() {
        if (this.muted || !this.ctx) return;
        this.stopAmbient();
        
        // Custom BGM logic
        if (this.useCustomBGM && this.customBGM) {
            this.customBGM.play().catch(e => console.warn("Custom BGM play failed", e));
            return;
        }

        try {
            // Play a continuous melodic loop
            const melodyNotes = [261.63, 329.63, 392.00, 440.00, 392.00, 329.63]; // C4, E4, G4, A4, G4, E4
            let noteIndex = 0;
            
            this.melodyInterval = setInterval(() => {
                if (this.muted || this.inBattle || !this.ctx) return;
                
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(melodyNotes[noteIndex], this.ctx.currentTime);
                
                gain.gain.setValueAtTime(0, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start();
                osc.stop(this.ctx.currentTime + 0.6);
                
                noteIndex = (noteIndex + 1) % melodyNotes.length;
            }, 600); // Play a note every 600ms
            
            // Periodic birds
            this.birdInterval = setInterval(() => {
                if (!this.muted && !this.inBattle && Math.random() > 0.5) {
                    this.playBirdChirp();
                }
            }, 8000);
            
        } catch (e) {
            console.warn("Ambient music failed to start", e);
        }
    }

    playBirdChirp() {
        if (this.muted || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.createGain(0.2, 0.02);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3000 + Math.random() * 1000, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(4000, this.ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(2500, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    setBattleMode(active) {
        if (this.inBattle === active || !this.ctx) return;
        this.inBattle = active;
        
        if (active) {
            // Removed the noisy drum "bang" sound that was annoying the user.
            // Just playing a subtle tension drone instead.
            const osc = this.ctx.createOscillator();
            const gain = this.createGain(2.0, 0.05);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A1
            osc.connect(gain);
            osc.start();
            osc.stop(this.ctx.currentTime + 2.0);
            
            const battleInterval = setInterval(() => {
                if (this.muted || !this.ctx) return;
                const osc2 = this.ctx.createOscillator();
                const gain2 = this.createGain(2.0, 0.05);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(55, this.ctx.currentTime);
                osc2.connect(gain2);
                osc2.start();
                osc2.stop(this.ctx.currentTime + 2.0);
            }, 2000);
            this.battleNodes.push({ interval: battleInterval });
        } else {
            // Stop battle elements
            this.battleNodes.forEach(node => {
                if (node.interval) clearInterval(node.interval);
            });
            this.battleNodes = [];
        }
    }

    stopAmbient() {
        this.ambientNodes.forEach(node => {
            try {
                if (node.osc) node.osc.stop();
                if (node.lfo) node.lfo.stop();
            } catch(e) {}
        });
        this.ambientNodes = [];
        if (this.birdInterval) clearInterval(this.birdInterval);
        if (this.melodyInterval) clearInterval(this.melodyInterval);
        this.setBattleMode(false);
        
        if (this.customBGM) {
            this.customBGM.pause();
        }
    }

    loadCustomBGM(url) {
        if (!this.customBGM) {
            this.customBGM = new Audio(url);
            this.customBGM.loop = true;
            this.customBGM.volume = 0.5;
        } else {
            this.customBGM.src = url;
        }
        this.useCustomBGM = true;
        
        if (this.ctx && !this.muted) {
            this.stopAmbient();
            this.customBGM.play().catch(e => console.warn("Custom BGM play failed", e));
        }
    }
}

export const audio = new AudioSystem();
