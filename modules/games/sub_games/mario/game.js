(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const WIDTH = 800;
    const HEIGHT = 480;
    const TILE = 32;
    const ROWS = 15;
    const FIXED_DT = 1000 / 60;

    // אלמנטים של ממשק המשתמש
    const gameWrapper = document.getElementById('gameWrapper');
    const hudScore = document.getElementById('hudScore');
    const hudHighScore = document.getElementById('hudHighScore');
    const hudCoins = document.getElementById('hudCoins');
    const hudWorld = document.getElementById('hudWorld');
    const hudLives = document.getElementById('hudLives');
    const hudTime = document.getElementById('hudTime');

    const overlayScreen = document.getElementById('overlayScreen');
    const overlayBadge = document.getElementById('overlayBadge');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlaySubtitle = document.getElementById('overlaySubtitle');
    const levelSelectBox = document.getElementById('levelSelectBox');
    const statsBox = document.getElementById('statsBox');
    const statFinalScore = document.getElementById('statFinalScore');
    const statFinalCoins = document.getElementById('statFinalCoins');
    const statEnemies = document.getElementById('statEnemies');
    const controlsLegend = document.getElementById('controlsLegend');
    const btnStartOverlay = document.getElementById('btnStartOverlay');

    const btnMusic = document.getElementById('btnMusic');
    const btnSound = document.getElementById('btnSound');
    const btnPause = document.getElementById('btnPause');
    const btnRestart = document.getElementById('btnRestart');
    const btnFullscreen = document.getElementById('btnFullscreen');

    // =========================================================================
    // 1. מנוע סאונד ומוזיקת צ'יפטון 8-ביט (Web Audio API)
    // =========================================================================
    const AudioEngine = {
        ctx: null,
        sfxMuted: false,
        musicMuted: false,
        musicTimer: null,
        stepIdx: 0,
        currentTrack: 'overworld',

        // תווים בתדרים (Hz)
        N: {
            _: 0,
            C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
            C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99,
            G4: 392.00, Gs4: 415.30, A4: 440.00, As4: 466.16, B4: 493.88,
            C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00
        },

        tracks: {
            overworld: {
                tempo: 155,
                lead: [
                    'E5', 'E5', '_', 'E5', '_', 'C5', 'E5', '_', 'G5', '_', '_', '_', 'G4', '_', '_', '_',
                    'C5', '_', '_', 'G4', '_', '_', 'E4', '_', '_', 'A4', '_', 'B4', '_', 'As4', 'A4', '_',
                    'G4', 'E5', 'G5', 'A5', '_', 'F5', 'G5', '_', 'E5', '_', 'C5', 'D5', 'B4', '_', '_', '_'
                ],
                bass: [
                    'D3', 'D3', '_', 'D3', '_', 'D3', 'D3', '_', 'G3', '_', '_', '_', 'G3', '_', '_', '_',
                    'C3', '_', '_', 'G3', '_', '_', 'E3', '_', '_', 'F3', '_', 'G3', '_', 'Fs3', 'F3', '_',
                    'E3', 'C4', 'E4', 'F4', '_', 'D4', 'E4', '_', 'C4', '_', 'A3', 'B3', 'G3', '_', '_', '_'
                ]
            },
            underground: {
                tempo: 170,
                lead: [
                    'C4', 'C5', 'A3', 'A4', 'As3', 'As4', '_', '_', '_', '_', '_', '_',
                    'C4', 'C5', 'A3', 'A4', 'As3', 'As4', '_', '_', '_', '_', '_', '_',
                    'F3', 'F4', 'D3', 'D4', 'Ds3', 'Ds4', '_', '_', '_', '_', '_', '_',
                    'F3', 'F4', 'D3', 'D4', 'Ds3', 'Ds4', '_', '_', 'Ds4', 'D4', 'Cs4', 'C4'
                ],
                bass: [
                    'C3', '_', 'A3', '_', 'As3', '_', '_', '_', '_', '_', '_', '_',
                    'C3', '_', 'A3', '_', 'As3', '_', '_', '_', '_', '_', '_', '_',
                    'F3', '_', 'D3', '_', 'Ds3', '_', '_', '_', '_', '_', '_', '_',
                    'F3', '_', 'D3', '_', 'Ds3', '_', '_', '_', '_', '_', '_', '_'
                ]
            },
            sky: {
                tempo: 140,
                lead: [
                    'G4', 'C5', 'E5', 'G5', '_', 'E5', 'C5', '_', 'A4', 'D5', 'F5', 'A5', '_', 'F5', 'D5', '_',
                    'B4', 'D5', 'G5', 'B5', '_', 'G5', 'D5', '_', 'C5', 'E5', 'G5', 'E5', 'C5', '_', '_', '_'
                ],
                bass: [
                    'C3', '_', 'G3', '_', 'C4', '_', 'G3', '_', 'D3', '_', 'A3', '_', 'D4', '_', 'A3', '_',
                    'G3', '_', 'D4', '_', 'G4', '_', 'D4', '_', 'C3', '_', 'G3', '_', 'C3', '_', '_', '_'
                ]
            },
            starman: {
                tempo: 115,
                lead: [
                    'C5', 'C5', 'C5', 'D5', 'C5', '_', 'C5', 'D5', 'C5', 'D5', 'C5', '_',
                    'B4', 'B4', 'B4', 'C5', 'B4', '_', 'B4', 'C5', 'B4', 'C5', 'B4', '_'
                ],
                bass: [
                    'F3', 'C4', 'F3', 'C4', 'F3', 'C4', 'F3', 'C4', 'F3', 'C4', 'F3', 'C4',
                    'E3', 'B3', 'E3', 'B3', 'E3', 'B3', 'E3', 'B3', 'E3', 'B3', 'E3', 'B3'
                ]
            }
        },

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        },

        tone(freq, duration, type = 'square', vol = 0.07, slideTo = null, delay = 0) {
            if (this.sfxMuted || !freq) return;
            this.init();
            if (!this.ctx) return;

            const start = this.ctx.currentTime + delay;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, start);
            if (slideTo) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), start + duration);
            }
            gain.gain.setValueAtTime(vol, start);
            gain.gain.exponentialRampToValueAtTime(0.0008, start + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(start);
            osc.stop(start + duration);
        },

        musicNote(freq, duration, type, vol) {
            if (this.musicMuted || !freq || !this.ctx || this.ctx.state !== 'running') return;
            const start = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(vol, start);
            gain.gain.exponentialRampToValueAtTime(0.0008, start + duration * 0.9);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(start);
            osc.stop(start + duration);
        },

        startMusic(trackName) {
            if (trackName) this.currentTrack = trackName;
            this.stopMusic();
            this.stepIdx = 0;

            const tick = () => {
                if (gameState !== 'playing' || this.musicMuted) return;
                const track = this.tracks[this.currentTrack] || this.tracks.overworld;
                const speedMult = (timeLeft <= 99 && this.currentTrack !== 'starman') ? 0.78 : 1.0;
                const stepMs = track.tempo * speedMult;

                const leadNote = track.lead[this.stepIdx % track.lead.length];
                const bassNote = track.bass[this.stepIdx % track.bass.length];

                if (leadNote && this.N[leadNote]) {
                    this.musicNote(this.N[leadNote], stepMs / 1000, 'square', 0.025);
                }
                if (bassNote && this.N[bassNote]) {
                    this.musicNote(this.N[bassNote], stepMs / 1000, 'triangle', 0.042);
                }

                this.stepIdx++;
                this.musicTimer = setTimeout(tick, stepMs);
            };

            this.musicTimer = setTimeout(tick, 80);
        },

        stopMusic() {
            if (this.musicTimer) {
                clearTimeout(this.musicTimer);
                this.musicTimer = null;
            }
        },

        // אפקטים קוליים (SFX)
        jump(big = false) {
            this.tone(big ? 240 : 330, 0.15, 'square', 0.065, big ? 580 : 720);
        },
        skid() {
            this.tone(180, 0.06, 'sawtooth', 0.04, 110);
        },
        coin() {
            this.tone(988, 0.06, 'square', 0.065, null, 0);
            this.tone(1319, 0.18, 'square', 0.065, null, 0.06);
        },
        bump() {
            this.tone(150, 0.08, 'triangle', 0.09, 75);
        },
        breakBrick() {
            this.tone(220, 0.07, 'sawtooth', 0.085, 65);
            this.tone(140, 0.09, 'square', 0.07, 45, 0.04);
        },
        stomp(combo = 1) {
            const base = Math.min(880, 380 + (combo - 1) * 75);
            this.tone(base, 0.09, 'square', 0.08, base * 0.45);
        },
        kickShell() {
            this.tone(280, 0.08, 'square', 0.08, 520);
        },
        powerupSpawn() {
            this.tone(330, 0.22, 'triangle', 0.075, 680);
        },
        powerup() {
            [523, 659, 784, 1046, 1318].forEach((f, i) => {
                this.tone(f, 0.08, 'square', 0.065, null, i * 0.055);
            });
        },
        oneUp() {
            [330, 392, 659, 523, 587, 784].forEach((f, i) => {
                this.tone(f, 0.085, 'square', 0.07, null, i * 0.07);
            });
        },
        checkpoint() {
            [440, 554, 659, 880].forEach((f, i) => {
                this.tone(f, 0.1, 'triangle', 0.08, null, i * 0.075);
            });
        },
        fireball() {
            this.tone(720, 0.07, 'sawtooth', 0.055, 220);
        },
        hurt() {
            this.tone(340, 0.26, 'sawtooth', 0.085, 85);
        },
        die() {
            this.stopMusic();
            [494, 466, 440, 392, 330, 262].forEach((f, i) => {
                this.tone(f, 0.12, 'square', 0.075, null, i * 0.095);
            });
        },
        win() {
            this.stopMusic();
            [523, 659, 784, 1046, 784, 1046].forEach((f, i) => {
                this.tone(f, 0.14, 'square', 0.075, null, i * 0.105);
            });
        }
    };

    // =========================================================================
    // 2. אטלס ספרייטים Pixel-Art פרוצדורלי (Offscreen Canvas Caching)
    // =========================================================================
    const Sprites = (() => {
        const cache = {};

        function makeSprite(name, rows, palette, flipX = false) {
            const h = rows.length;
            const w = rows[0].length;
            const off = document.createElement('canvas');
            off.width = w;
            off.height = h;
            const octx = off.getContext('2d');

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const ch = rows[y][x];
                    const color = palette[ch];
                    if (!color) continue;
                    octx.fillStyle = color;
                    const drawX = flipX ? (w - 1 - x) : x;
                    octx.fillRect(drawX, y, 1, 1);
                }
            }
            cache[name] = off;
            return off;
        }

        function makeDirectional(baseName, rows, palette) {
            makeSprite(`${baseName}_R`, rows, palette, false);
            makeSprite(`${baseName}_L`, rows, palette, true);
        }

        // פלטות צבעים
        const palSmallRed = { R: '#e11d48', S: '#fed7aa', H: '#78350f', B: '#2563eb', Y: '#facc15', K: '#111827' };
        const palFire = { R: '#ffffff', S: '#fed7aa', H: '#9a3412', B: '#dc2626', Y: '#facc15', K: '#111827' };

        // מריו קטן (14x16)
        const marioSmallIdle = [
            '....RRRRR.....',
            '...RRRRRRRRR..',
            '...HHHSSKS....',
            '..HSHSSSKSs...',
            '..HSHHSSSSKK..',
            '..HHSSSSKKKK..',
            '....SSSSSS....',
            '...RRBRRR.....',
            '..RRRBRRRR....',
            '.RRRRBBBBBR...',
            '.SSRYBBBBYRS..',
            '.SSSBBBBBBSS..',
            '..SSBBBBBBSS..',
            '....BBB.BBB...',
            '...HHH...HHH..',
            '..HHHH...HHHH.'
        ];
        const marioSmallWalk = [
            '....RRRRR.....',
            '...RRRRRRRRR..',
            '...HHHSSKS....',
            '..HSHSSSKSs...',
            '..HSHHSSSSKK..',
            '..HHSSSSKKKK..',
            '....SSSSSS....',
            '....RRBRR.....',
            '..RRRRBRRRR...',
            '.SSRRRBBBBRS..',
            '.SS.YBBBBY.S..',
            '....BBBBBB....',
            '..BBBB..BBBB..',
            '.HHHH....HHHH.',
            '.HHH..........',
            '..............'
        ];
        const marioSmallJump = [
            '..........SSS.',
            '....RRRRR.SSS.',
            '...RRRRRRRRRS.',
            '...HHHSSKS.RR.',
            '..HSHSSSKSsRR.',
            '..HSHHSSSSKKR.',
            '..HHSSSSKKKK..',
            '....SSSSSS....',
            '..RRRRBRRRR...',
            '.RRRRRBBBBBR..',
            '.SS.RYBBBBYR..',
            '....BBBBBBBB..',
            '..BBBBBBBB.HH.',
            '.HHHH..BBB.HH.',
            '.HHH..........',
            '..............'
        ];
        const marioSmallSkid = [
            '....RRRRR.....',
            '...RRRRRRRRR..',
            '...HHHSSKS....',
            '..HSHSSSKSs...',
            '..HSHHSSSSKK..',
            '..HHSSSSKKKK..',
            '....SSSSSS....',
            '..RRRRBRRRR...',
            '.SSRRRBBBBRS..',
            '.SS.RYBBBBYR..',
            '....BBBBBB....',
            '...BBBB.BBB...',
            '..HHHH...HHH..',
            '.HHHH.....HHH.',
            '..............',
            '..............'
        ];

        makeDirectional('small_idle', marioSmallIdle, palSmallRed);
        makeDirectional('small_walk', marioSmallWalk, palSmallRed);
        makeDirectional('small_jump', marioSmallJump, palSmallRed);
        makeDirectional('small_skid', marioSmallSkid, palSmallRed);

        // מריו גדול / אש (14x24)
        const marioBigIdle = [
            '....RRRRR.....',
            '...RRRRRRRRR..',
            '...HHHSSKS....',
            '..HSHSSSKSs...',
            '..HSHHSSSSKK..',
            '..HHSSSSKKKK..',
            '....SSSSSS....',
            '...RRBRRR.....',
            '..RRRBRRRR....',
            '.RRRRBRRRRR...',
            '.RRRRBBBBBR...',
            '.SSRYBBBBYRS..',
            '.SSSBBBBBBSS..',
            '.SSSBBBBBBSS..',
            '..SSBBBBBBSS..',
            '....BBBBBB....',
            '...BBBBBBBB...',
            '...BBBB.BBBB..',
            '..BBBB...BBBB.',
            '..BBBB...BBBB.',
            '.HHHH.....HHHH',
            'HHHHH.....HHHH',
            '..............',
            '..............'
        ];
        const marioBigWalk = [
            '....RRRRR.....',
            '...RRRRRRRRR..',
            '...HHHSSKS....',
            '..HSHSSSKSs...',
            '..HSHHSSSSKK..',
            '..HHSSSSKKKK..',
            '....SSSSSS....',
            '....RRBRR.....',
            '..RRRRBRRRR...',
            '.RRRRRBBBBBR..',
            '.SSRRRBBBBYR..',
            '.SS.BBBBBBBB..',
            '....BBBBBBBB..',
            '...BBBB..BBBB.',
            '..BBBB....BBBB',
            '.HHHH......HHH',
            '.HHH.......HHH',
            '..............',
            '..............',
            '..............',
            '..............',
            '..............',
            '..............',
            '..............'
        ];
        const marioBigJump = [
            '..........SSS.',
            '....RRRRR.SSS.',
            '...RRRRRRRRRS.',
            '...HHHSSKS.RR.',
            '..HSHSSSKSsRR.',
            '..HSHHSSSSKKR.',
            '..HHSSSSKKKK..',
            '....SSSSSS....',
            '..RRRRBRRRR...',
            '.RRRRRBBBBBR..',
            '.SS.RYBBBBYR..',
            '....BBBBBBBB..',
            '...BBBBBBBB...',
            '..BBBBBBBB.HH.',
            '.BBBB..BBB.HH.',
            '.HHHH..BBB.HH.',
            '.HHH..........',
            '..............',
            '..............',
            '..............',
            '..............',
            '..............',
            '..............',
            '..............'
        ];
        const marioBigCrouch = [
            '..............',
            '..............',
            '..............',
            '..............',
            '..............',
            '..............',
            '..............',
            '..............',
            '....RRRRR.....',
            '...RRRRRRRRR..',
            '...HHHSSKS....',
            '..HSHSSSKSs...',
            '..HSHHSSSSKK..',
            '..HHSSSSKKKK..',
            '...RRRRBRRR...',
            '..RRRRBBBBBR..',
            '.SSRYBBBBBYRS.',
            '.SSSBBBBBBBSS.',
            '..BBBBBBBBBB..',
            '.HHHH....HHHH.',
            'HHHHH....HHHH.',
            '..............',
            '..............',
            '..............'
        ];

        makeDirectional('big_idle', marioBigIdle, palSmallRed);
        makeDirectional('big_walk', marioBigWalk, palSmallRed);
        makeDirectional('big_jump', marioBigJump, palSmallRed);
        makeDirectional('big_skid', marioBigIdle, palSmallRed);
        makeDirectional('big_crouch', marioBigCrouch, palSmallRed);

        makeDirectional('fire_idle', marioBigIdle, palFire);
        makeDirectional('fire_walk', marioBigWalk, palFire);
        makeDirectional('fire_jump', marioBigJump, palFire);
        makeDirectional('fire_skid', marioBigIdle, palFire);
        makeDirectional('fire_crouch', marioBigCrouch, palFire);

        // גומבה (16x16)
        const palGoomba = { B: '#92400e', D: '#78350f', S: '#fde68a', W: '#ffffff', K: '#111827' };
        makeSprite('goomba_0', [
            '......BBBB......',
            '....BBBBBBBB....',
            '...BBBBBBBBBB...',
            '..BBBBBBBBBBBB..',
            '.BBWBBDBBBBWBBB.',
            '.BBWKBBBBBBKWBB.',
            '.BBWKBBBBBBKWBB.',
            'BBBBBBBBBBBBBBBB',
            'BBBBBBBBBBBBBBBB',
            '.DDDDSSSSSSSSDD.',
            '....SSSSSSSS....',
            '....SSSSSSSS....',
            '..KKKK....KKKK..',
            '.KKKKKK..KKKKKK.',
            '.KKKKKK..KKKKKK.',
            '................'
        ], palGoomba);

        makeSprite('goomba_1', [
            '......BBBB......',
            '....BBBBBBBB....',
            '...BBBBBBBBBB...',
            '..BBBBBBBBBBBB..',
            '.BBWBBDBBBBWBBB.',
            '.BBWKBBBBBBKWBB.',
            '.BBWKBBBBBBKWBB.',
            'BBBBBBBBBBBBBBBB',
            'BBBBBBBBBBBBBBBB',
            '.DDDDSSSSSSSSDD.',
            '....SSSSSSSS....',
            '....SSSSSSSS....',
            '...KKKK..KKKK...',
            '..KKKKKK.KKKKKK.',
            '.........KKKKKK.',
            '................'
        ], palGoomba);

        makeSprite('goomba_squish', [
            '................',
            '................',
            '................',
            '................',
            '................',
            '................',
            '................',
            '................',
            '................',
            '....BBBBBBBB....',
            '..BBBBBBBBBBBB..',
            '.BBWKWBBBBWKWBB.',
            'BBBBBBBBBBBBBBBB',
            '.DDDDSSSSSSSSDD.',
            '..KKKK....KKKK..',
            '................'
        ], palGoomba);

        // צב קופה (16x22)
        const palKoopa = { G: '#16a34a', L: '#4ade80', Y: '#facc15', W: '#ffffff', K: '#111827', O: '#f97316' };
        const koopaWalk0 = [
            '..........YYYY..',
            '.........YYYYYY.',
            '.........YYKWYY.',
            '.........YYKWYY.',
            '.........YYYYYY.',
            '.....GGGG.YYYY..',
            '...GGLLLLGGYY...',
            '..GGLLLLLLGGY...',
            '.GGLLGGGGLLGG...',
            '.GGLGGGGGGLLG...',
            '.GGLLGGGGLLGG...',
            '.WWWWWWWWWWWW...',
            '..WWWWWWWWWW....',
            '....OO..OO......',
            '...OOO..OOO.....',
            '..OOOO..OOOO....'
        ];
        const koopaWalk1 = [
            '..........YYYY..',
            '.........YYYYYY.',
            '.........YYKWYY.',
            '.........YYKWYY.',
            '.........YYYYYY.',
            '.....GGGG.YYYY..',
            '...GGLLLLGGYY...',
            '..GGLLLLLLGGY...',
            '.GGLLGGGGLLGG...',
            '.GGLGGGGGGLLG...',
            '.GGLLGGGGLLGG...',
            '.WWWWWWWWWWWW...',
            '..WWWWWWWWWW....',
            '.....OO..OO.....',
            '....OOO..OOO....',
            '....OOOO.OOOO...'
        ];
        makeDirectional('koopa_0', koopaWalk0, palKoopa);
        makeDirectional('koopa_1', koopaWalk1, palKoopa);

        makeSprite('koopa_shell', [
            '................',
            '................',
            '.....GGGGGG.....',
            '...GGLLLLLLGG...',
            '..GGLLGGGGLLGG..',
            '.GGLGGGGGGGGLLG.',
            '.GGLGGGGGGGGLLG.',
            '.GGLLGGGGGGLLGG.',
            '.WWWWWWWWWWWWWW.',
            '..WWWWWWWWWWWW..',
            '................',
            '................'
        ], palKoopa);

        // צמח פיראנה (16x20)
        const palPiranha = { R: '#dc2626', W: '#ffffff', G: '#16a34a', L: '#4ade80' };
        makeSprite('piranha_0', [
            '...RRRR..RRRR...',
            '..RRRRW..WRRRR..',
            '.RRRRWW..WWRRRR.',
            '.RRRRWW..WWRRRR.',
            'RRRRRWW..WWRRRRR',
            'RRRRRWW..WWRRRRR',
            'RRRRWW....WWRRRR',
            '.RRRR......RRRR.',
            '..RRRR....RRRR..',
            '...RRRRRRRRRR...',
            '.....GGGGGG.....',
            '...LLGGGGGGLL...',
            '..LLLGGGGGGLLL..',
            '...LLGGGGGGLL...',
            '.....GGGGGG.....',
            '.....GGGGGG.....'
        ], palPiranha);

        makeSprite('piranha_1', [
            '....RRRRRRRR....',
            '..RRRRWWWWWRRR..',
            '.RRRRRWWWWWRRRR.',
            '.RRRRRWWWWWRRRR.',
            'RRRRRRWWWWWRRRRR',
            'RRRRRRWWWWWRRRRR',
            'RRRRRRWWWWWRRRRR',
            '.RRRRRWWWWWRRRR.',
            '..RRRRWWWWWRRR..',
            '...RRRRRRRRRR...',
            '.....GGGGGG.....',
            '...LLGGGGGGLL...',
            '..LLLGGGGGGLLL..',
            '...LLGGGGGGLL...',
            '.....GGGGGG.....',
            '.....GGGGGG.....'
        ], palPiranha);

        // פריטים (פטרייה, 1-UP, פרח אש, כוכב)
        const palMush = { R: '#dc2626', W: '#ffffff', S: '#fde68a', K: '#111827' };
        const pal1Up = { R: '#16a34a', W: '#ffffff', S: '#fde68a', K: '#111827' };
        const mushGrid = [
            '.....RRRRRR.....',
            '...RRRRRRRRRR...',
            '..RRWWRRRRWWRR..',
            '.RRWWWWRRWWWWRR.',
            '.RRWWWWRRWWWWRR.',
            'RRRRWWRRRRWWRRRR',
            'RRRRRRRRRRRRRRRR',
            'RRRRRRRRRRRRRRRR',
            '.RRRRRRRRRRRRRR.',
            '...SSSSSSSSSS...',
            '...SSKSSSSKSS...',
            '...SSKSSSSKSS...',
            '...SSSSSSSSSS...',
            '....SSSSSSSS....',
            '.....SSSSSS.....',
            '................'
        ];
        makeSprite('mushroom', mushGrid, palMush);
        makeSprite('oneup', mushGrid, pal1Up);

        const palFlower = { O: '#ea580c', Y: '#facc15', W: '#ffffff', G: '#16a34a', L: '#4ade80', K: '#111827' };
        makeSprite('flower', [
            '....OOOOOOOO....',
            '..OOYYYYYYYYOO..',
            '.OOYYWWWWWWYYOO.',
            'OOYYWWKWWKWWYYOO',
            'OOYYWWKWWKWWYYOO',
            '.OOYYWWWWWWYYOO.',
            '..OOYYYYYYYYOO..',
            '....OOOOOOOO....',
            '.......GG.......',
            '..LL...GG...LL..',
            '.LLLL..GG..LLLL.',
            '..LLLLGGGGLLLL..',
            '....LLGGGGLL....',
            '.......GG.......',
            '.......GG.......',
            '................'
        ], palFlower);

        const palStar = { Y: '#facc15', W: '#fef08a', O: '#eab308', K: '#111827' };
        makeSprite('star', [
            '.......YY.......',
            '......YYYY......',
            '......YYYY......',
            '.....YYYYYY.....',
            '.YYYYYYYYYYYYYY.',
            '..YYYYKYYKYYYY..',
            '...YYYKYYKYYY...',
            '....YYYYYYYY....',
            '....YYYYYYYY....',
            '...YYYYYYYYYY...',
            '...YYYY..YYYY...',
            '..YYYY....YYYY..',
            '..YYY......YYY..',
            '.YY..........YY.',
            '................',
            '................'
        ], palStar);

        return {
            get(name) {
                return cache[name] || null;
            }
        };
    })();

    // =========================================================================
    // 3. הגדרת 3 שלבים עשירים (Overworld, Underground, Sky)
    // =========================================================================
    // מקרא:
    // # קרקע | B לבנה | ? מטבע | M פטרייה/פרח | 1 1-UP | * כוכב על
    // X בלוק קשיח | [ ] ( ) צינור | P צמח פיראנה מעל צינור | C מטבע מרחף
    // G גומבה | K צב קופה | H פלטפורמה אופקית | V פלטפורמה אנכית | S נקודת שמירה | F דגל סיום
    const LEVELS = [
        {
            name: '1-1',
            title: 'ממלכת הפטריות',
            theme: 'overworld',
            music: 'overworld',
            time: 320,
            map: [
                "................................................................................................................................................",
                "................................................................................................................................................",
                "................................................................................................................................................",
                "................................................................................................................................................",
                "..................................................................................C.C.C.C.......................................................",
                ".....................BBBB....B?M?B........................................BBBB....BBBBBBB...............B*B.....................................",
                "................................................................................................................................................",
                "................................................................................................................................................",
                "....................................................H...........................................................................................",
                ".............?......B?M?B....................................B?B....M.............C.C.C.......B?B..............................XXXX.............",
                "....................................[]..........[]....[]......................................................................XXXXX.............",
                "........................[]..........()..........()....()............................................X........................XXXXXX.............",
                "................G.......()....G.....()....K.....()....()....G..G........K....G.......S....X........XX........G......K.......XXXXXXX.....F.......",
                "##################################..################################..############################..############################################",
                "##################################..################################..############################..############################################"
            ]
        },
        {
            name: '1-2',
            title: 'המערות התת-קרקעיות',
            theme: 'underground',
            music: 'underground',
            time: 340,
            map: [
                "################################################################################################################################################",
                "################################################################################################################################################",
                "................................................................................................................................................",
                "..........................................C.C.C.C...............................................................................................",
                "..........................................BBBBBBB......................................C.C.C....................................................",
                ".....................B?M?B....................................B?B.....................BBBBBBB......................B*B..........................",
                "....................................................1...........................................................................................",
                ".........................................................................................................V......................................",
                "........................................................................[]......................................................................",
                ".............?......B?B?B.........C.C.C.....................B?M?B.......().....................................................XXXX.............",
                ".................................BBBBBBB................................()....................................................XXXXX.............",
                "........................[]..............................................()..............X....................................XXXXXX.............",
                "................G.......()...G..........K......G....G...................()....K...G..S..XX.................G.......K........XXXXXXX.....F.......",
                "##########################..############################...##############################..#####################################################",
                "##########################..############################...##############################..#####################################################"
            ]
        },
        {
            name: '1-3',
            title: 'מבצר העננים',
            theme: 'sky',
            music: 'sky',
            time: 360,
            map: [
                "................................................................................................................................................",
                "................................................................................................................................................",
                "................................................................................................................................................",
                "................................................................................................................................................",
                "....................................C.C.C....................................C.C.C..............................................................",
                "...................................BBBBBBB..................................BB?M?BB....................................B*B......................",
                "..................C.C...........................................................................................................................",
                ".................B?M?B.........................................C.C.C............................................................................",
                "...............................................................BBBBBBB......................H...................................................",
                "............?............B?B...................................................................................................XXXX.............",
                ".....................................K.............................G......................................K...................XXXXX.............",
                "...................................XXXXX........................XXXXXX...............S..................XXXXX................XXXXXX.............",
                ".......G........G...........................................................................................................XXXXXXX.....F.......",
                "################..#####....#####..........#######....########............######..####....######........#########################################",
                "################..#####....#####..........#######....########............######..####....######........#########################################"
            ]
        }
    ];

    const SOLID_TILES = new Set(['#', 'X', 'B', '?', 'M', '1', '*', 'U', '[', ']', '(', ')']);

    // =========================================================================
    // 4. קלט מקלדת ו-Multi-Touch למובייל
    // =========================================================================
    const keys = {};
    let jumpJustPressed = false;
    let fireJustPressed = false;

    function pressKey(code) {
        if (!keys[code]) {
            if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
                jumpJustPressed = true;
            }
            if (code === 'KeyZ' || code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyF') {
                fireJustPressed = true;
            }
        }
        keys[code] = true;
    }

    function releaseKey(code) {
        keys[code] = false;
    }

    window.addEventListener('keydown', (e) => {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
        if (e.code === 'KeyP' || e.code === 'Escape') {
            togglePause();
            return;
        }
        if (e.code === 'KeyR') {
            startNewGame(selectedStartLevel);
            return;
        }
        if (e.code === 'KeyM') {
            toggleSfx();
            return;
        }
        pressKey(e.code);
    });

    window.addEventListener('keyup', (e) => {
        releaseKey(e.code);
    });

    // תמיכה מלאה ב-Multi-Touch עבור כפתורי המובייל
    document.querySelectorAll('.touch-btn').forEach(btn => {
        const code = btn.dataset.key;
        const onDown = (e) => {
            e.preventDefault();
            btn.classList.add('pressed');
            pressKey(code);
        };
        const onUp = (e) => {
            e.preventDefault();
            btn.classList.remove('pressed');
            releaseKey(code);
        };
        btn.addEventListener('pointerdown', onDown);
        btn.addEventListener('pointerup', onUp);
        btn.addEventListener('pointerleave', onUp);
        btn.addEventListener('pointercancel', onUp);
    });

    // =========================================================================
    // 5. משתני מצב המשחק
    // =========================================================================
    let gameState = 'menu'; // menu | stageIntro | playing | paused | levelClear | dying | gameOver | victory
    let selectedStartLevel = 0;
    let currentLevelIdx = 0;
    let unlockedLevel = Number(localStorage.getItem('mario_unlocked_level') || 0);

    let grid = [];
    let levelWidth = 0;
    let theme = 'overworld';
    let flagCol = 136;

    let score = 0;
    let highScore = Number(localStorage.getItem('mario_highscore') || 0);
    let coins = 0;
    let enemiesDefeated = 0;
    let lives = 3;
    let timeLeft = 300;
    let timeCounter = 0;
    let globalFrame = 0;

    let checkpointPos = null; // { x, y }
    let checkpointActive = false;

    let cameraX = 0;
    let lookAheadX = 0;
    let shakeTimer = 0;
    let shakeIntensity = 0;
    let hitstopTimer = 0;

    let player = null;
    let enemies = [];
    let platforms = [];
    let items = [];
    let fireballs = [];
    let particles = [];
    let floatingTexts = [];
    let blockBumps = {};

    let introTimer = 0;
    let clearPhase = 0;
    let clearTimer = 0;
    let flagSlideY = 0;
    let deathTimer = 0;

    function triggerShake(duration = 8, intensity = 4) {
        shakeTimer = Math.max(shakeTimer, duration);
        shakeIntensity = Math.max(shakeIntensity, intensity);
    }

    function createPlayer(powerState = 'small', spawnX = 64, spawnY = null) {
        const isBig = powerState !== 'small';
        const h = isBig ? 44 : 28;
        return {
            x: spawnX,
            y: spawnY !== null ? spawnY : (13 * TILE - h),
            w: 24,
            h,
            vx: 0,
            vy: 0,
            facing: 1,
            onGround: false,
            standingPlatform: null,
            coyoteTimer: 0,
            jumpBuffer: 0,
            isCrouching: false,
            isSkidding: false,
            stompCombo: 0,
            power: powerState, // small | big | fire
            invincibleTimer: 0,
            starTimer: 0,
            fireCooldown: 0,
            walkFrame: 0
        };
    }

    function loadLevel(idx, keepPower = false, useCheckpoint = false) {
        currentLevelIdx = idx;
        const lvl = LEVELS[idx];
        theme = lvl.theme;
        timeLeft = lvl.time;
        timeCounter = 0;

        grid = lvl.map.map(row => row.split(''));
        levelWidth = grid[0].length * TILE;

        enemies = [];
        platforms = [];
        items = [];
        fireballs = [];
        particles = [];
        floatingTexts = [];
        blockBumps = {};

        if (!useCheckpoint) {
            checkpointPos = null;
            checkpointActive = false;
        }

        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const ch = grid[y][x];
                if (ch === 'G') {
                    enemies.push({
                        type: 'goomba',
                        x: x * TILE + 2,
                        y: y * TILE + 4,
                        w: 28,
                        h: 28,
                        vx: -1.25,
                        vy: 0,
                        active: false,
                        squished: false,
                        squishTimer: 0,
                        dead: false
                    });
                    grid[y][x] = '.';
                } else if (ch === 'K') {
                    enemies.push({
                        type: 'koopa',
                        x: x * TILE + 2,
                        y: y * TILE - 10,
                        w: 28,
                        h: 42,
                        vx: -1.35,
                        vy: 0,
                        active: false,
                        shell: false,
                        shellMoving: false,
                        kickGrace: 0,
                        combo: 0,
                        dead: false
                    });
                    grid[y][x] = '.';
                } else if (ch === '[' && y > 2 && x % 14 === 0) {
                    // הוספת צמח פיראנה לחלק מהצינורות
                    enemies.push({
                        type: 'piranha',
                        x: x * TILE + 18,
                        baseY: y * TILE,
                        y: y * TILE,
                        w: 28,
                        h: 36,
                        timer: (x * 17) % 180,
                        offset: 0,
                        dead: false
                    });
                } else if (ch === 'H') {
                    platforms.push({
                        type: 'horizontal',
                        startX: x * TILE,
                        startY: y * TILE,
                        x: x * TILE,
                        y: y * TILE,
                        w: 96,
                        h: 16,
                        range: 110,
                        speed: 0.025,
                        phase: 0,
                        dx: 0,
                        dy: 0
                    });
                    grid[y][x] = '.';
                } else if (ch === 'V') {
                    platforms.push({
                        type: 'vertical',
                        startX: x * TILE,
                        startY: y * TILE,
                        x: x * TILE,
                        y: y * TILE,
                        w: 96,
                        h: 16,
                        range: 95,
                        speed: 0.028,
                        phase: 0,
                        dx: 0,
                        dy: 0
                    });
                    grid[y][x] = '.';
                } else if (ch === 'C') {
                    items.push({
                        type: 'coin',
                        x: x * TILE + 7,
                        y: y * TILE + 6,
                        w: 18,
                        h: 22,
                        collected: false
                    });
                    grid[y][x] = '.';
                } else if (ch === 'S') {
                    checkpointPos = { x: x * TILE, y: y * TILE };
                    grid[y][x] = '.';
                } else if (ch === 'F') {
                    flagCol = x;
                }
            }
        }

        const prevPower = keepPower && player ? player.power : 'small';
        const spawnX = (useCheckpoint && checkpointPos) ? checkpointPos.x : 64;
        const spawnY = (useCheckpoint && checkpointPos) ? (checkpointPos.y - (prevPower !== 'small' ? 12 : 0)) : null;

        player = createPlayer(prevPower, spawnX, spawnY);
        cameraX = Math.max(0, Math.min(levelWidth - WIDTH, player.x - WIDTH * 0.35));
        lookAheadX = 0;
        flagSlideY = 3.6 * TILE;
        updateHUD();
    }

    function beginStageWithIntro(idx, keepPower = false, useCheckpoint = false) {
        loadLevel(idx, keepPower, useCheckpoint);
        gameState = 'stageIntro';
        introTimer = 85; // ~1.4 שניות
        AudioEngine.stopMusic();
    }

    function addScore(pts, x = null, y = null, label = null) {
        score += pts;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('mario_highscore', String(highScore));
        }
        if (x !== null && y !== null) {
            floatingTexts.push({
                x,
                y,
                text: label || `+${pts}`,
                vy: -1.35,
                life: 44
            });
        }
    }

    function updateHUD() {
        hudScore.textContent = String(score).padStart(6, '0');
        hudHighScore.textContent = String(highScore).padStart(6, '0');
        hudCoins.textContent = `🪙 ${String(coins).padStart(2, '0')}`;
        hudWorld.textContent = LEVELS[currentLevelIdx].name;
        hudLives.textContent = `❤️ ${lives}`;

        const sec = Math.max(0, Math.ceil(timeLeft));
        hudTime.textContent = String(sec);
        if (sec <= 99 && gameState === 'playing') {
            hudTime.classList.add('time-low');
        } else {
            hudTime.classList.remove('time-low');
        }
    }

    function showOverlay(badge, title, subtitle, buttonText, options = {}) {
        overlayBadge.textContent = badge;
        overlayTitle.textContent = title;
        overlaySubtitle.textContent = subtitle;
        btnStartOverlay.textContent = buttonText;

        levelSelectBox.classList.toggle('hidden', !options.showLevels);
        controlsLegend.classList.toggle('hidden', !options.showControls);
        statsBox.classList.toggle('hidden', !options.showStats);

        if (options.showStats) {
            statFinalScore.textContent = score.toLocaleString();
            statFinalCoins.textContent = String(coins);
            statEnemies.textContent = String(enemiesDefeated);
        }

        overlayScreen.classList.add('active');
    }

    function hideOverlay() {
        overlayScreen.classList.remove('active');
    }

    function startNewGame(startIdx = 0) {
        AudioEngine.init();
        score = 0;
        coins = 0;
        enemiesDefeated = 0;
        lives = 3;
        hideOverlay();
        beginStageWithIntro(startIdx, false, false);
    }

    function togglePause() {
        if (gameState === 'playing') {
            gameState = 'paused';
            AudioEngine.stopMusic();
            showOverlay('PAUSED', 'המשחק מושהה', 'לחץ על המשך או על מקש P כדי לחזור להרפתקה.', 'המשך במשחק', {
                showControls: true
            });
        } else if (gameState === 'paused') {
            gameState = 'playing';
            hideOverlay();
            AudioEngine.startMusic(player.starTimer > 0 ? 'starman' : LEVELS[currentLevelIdx].music);
        }
    }

    function toggleSfx() {
        AudioEngine.sfxMuted = !AudioEngine.sfxMuted;
        btnSound.textContent = AudioEngine.sfxMuted ? '🔇 אפקטים' : '🔊 אפקטים';
        btnSound.classList.toggle('muted', AudioEngine.sfxMuted);
    }

    function toggleMusic() {
        AudioEngine.musicMuted = !AudioEngine.musicMuted;
        btnMusic.textContent = AudioEngine.musicMuted ? '🔇 מוזיקה' : '🎵 מוזיקה';
        btnMusic.classList.toggle('muted', AudioEngine.musicMuted);
        if (AudioEngine.musicMuted) {
            AudioEngine.stopMusic();
        } else if (gameState === 'playing') {
            AudioEngine.startMusic(player && player.starTimer > 0 ? 'starman' : LEVELS[currentLevelIdx].music);
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            gameWrapper.requestFullscreen?.().catch(() => { });
        } else {
            document.exitFullscreen?.().catch(() => { });
        }
    }

    // בחירת שלב בתפריט
    function refreshLevelButtons() {
        document.querySelectorAll('.level-btn').forEach(btn => {
            const lvl = Number(btn.dataset.level);
            btn.classList.toggle('active', lvl === selectedStartLevel);
        });
    }

    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedStartLevel = Number(btn.dataset.level);
            refreshLevelButtons();
        });
    });

    btnStartOverlay.addEventListener('click', () => {
        if (gameState === 'paused') {
            togglePause();
        } else {
            startNewGame(selectedStartLevel);
        }
    });
    btnPause.addEventListener('click', togglePause);
    btnRestart.addEventListener('click', () => startNewGame(selectedStartLevel));
    btnSound.addEventListener('click', toggleSfx);
    btnMusic.addEventListener('click', toggleMusic);
    btnFullscreen.addEventListener('click', toggleFullscreen);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && gameState === 'playing') {
            togglePause();
        }
    });

    // =========================================================================
    // 6. פיזיקה, התנגשויות ואפקטים
    // =========================================================================
    function rectsOverlap(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function isSolidTile(tx, ty) {
        if (ty < 0) return false;
        if (ty >= ROWS) return false;
        if (tx < 0 || tx >= grid[0].length) return true;
        return SOLID_TILES.has(grid[ty][tx]);
    }

    function canStandUp() {
        if (player.power === 'small') return true;
        const testY = player.y - (44 - 28);
        const topRow = Math.floor((testY + 2) / TILE);
        const leftCol = Math.floor((player.x + 3) / TILE);
        const rightCol = Math.floor((player.x + player.w - 3) / TILE);
        for (let tx = leftCol; tx <= rightCol; tx++) {
            if (isSolidTile(tx, topRow)) return false;
        }
        return true;
    }

    function spawnDust(x, y, count = 4) {
        for (let i = 0; i < count; i++) {
            particles.push({
                type: 'dust',
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 4,
                vx: (Math.random() - 0.5) * 2.2,
                vy: -Math.random() * 1.4,
                size: 5 + Math.random() * 4,
                life: 16
            });
        }
    }

    function spawnBrickParticles(tx, ty) {
        const cx = tx * TILE + 8;
        const cy = ty * TILE + 8;
        [[-2.8, -7.5], [2.8, -7.5], [-2.0, -4.8], [2.0, -4.8]].forEach(([vx, vy]) => {
            particles.push({
                type: 'brick',
                x: cx,
                y: cy,
                vx,
                vy,
                rot: 0,
                vrot: vx * 0.12,
                size: 11,
                life: 48
            });
        });
    }

    function spawnBlockCoin(tx, ty) {
        coins++;
        if (coins >= 100) {
            coins -= 100;
            lives++;
            AudioEngine.oneUp();
        } else {
            AudioEngine.coin();
        }
        addScore(200, tx * TILE + 6, ty * TILE - 10);
        particles.push({
            type: 'popCoin',
            x: tx * TILE + 8,
            y: ty * TILE - 16,
            vy: -6.0,
            life: 24
        });
    }

    function bumpBlock(tx, ty) {
        const ch = grid[ty][tx];
        if (!['B', '?', 'M', '1', '*'].includes(ch)) return;

        // פגיעה באויבים שעומדים על הבלוק
        enemies.forEach(en => {
            if (!en.dead && !en.squished && en.type !== 'piranha') {
                const enFootY = Math.floor((en.y + en.h + 3) / TILE);
                const enCenterX = Math.floor((en.x + en.w / 2) / TILE);
                if (enFootY === ty && enCenterX === tx) {
                    en.dead = true;
                    en.vy = -6.5;
                    enemiesDefeated++;
                    addScore(100, en.x, en.y);
                }
            }
        });

        if (ch === '?') {
            grid[ty][tx] = 'U';
            blockBumps[`${tx},${ty}`] = -9;
            spawnBlockCoin(tx, ty);
        } else if (ch === 'M') {
            grid[ty][tx] = 'U';
            blockBumps[`${tx},${ty}`] = -9;
            AudioEngine.powerupSpawn();
            if (player.power === 'small') {
                items.push({
                    type: 'mushroom',
                    x: tx * TILE + 4,
                    y: ty * TILE - 26,
                    w: 24,
                    h: 26,
                    vx: 1.65,
                    vy: -2,
                    collected: false
                });
            } else {
                items.push({
                    type: 'flower',
                    x: tx * TILE + 4,
                    y: ty * TILE - 26,
                    w: 24,
                    h: 26,
                    vx: 0,
                    vy: 0,
                    collected: false
                });
            }
        } else if (ch === '1') {
            grid[ty][tx] = 'U';
            blockBumps[`${tx},${ty}`] = -9;
            AudioEngine.powerupSpawn();
            items.push({
                type: 'oneup',
                x: tx * TILE + 4,
                y: ty * TILE - 26,
                w: 24,
                h: 26,
                vx: 1.65,
                vy: -2,
                collected: false
            });
        } else if (ch === '*') {
            grid[ty][tx] = 'U';
            blockBumps[`${tx},${ty}`] = -9;
            AudioEngine.powerupSpawn();
            items.push({
                type: 'star',
                x: tx * TILE + 4,
                y: ty * TILE - 26,
                w: 24,
                h: 26,
                vx: 2.3,
                vy: -5.5,
                collected: false
            });
        } else if (ch === 'B') {
            if (player.power === 'small') {
                blockBumps[`${tx},${ty}`] = -8;
                AudioEngine.bump();
            } else {
                grid[ty][tx] = '.';
                AudioEngine.breakBrick();
                spawnBrickParticles(tx, ty);
                triggerShake(6, 3);
                addScore(50);
            }
        }
    }

    function hurtPlayer() {
        if (player.invincibleTimer > 0 || player.starTimer > 0 || gameState !== 'playing') return;
        triggerShake(10, 5);
        if (player.power !== 'small') {
            player.power = 'small';
            if (!player.isCrouching) {
                player.y += (44 - 28);
            }
            player.isCrouching = false;
            player.h = 28;
            player.invincibleTimer = 115;
            hitstopTimer = 4;
            AudioEngine.hurt();
        } else {
            killPlayer();
        }
    }

    function killPlayer() {
        if (gameState !== 'playing') return;
        gameState = 'dying';
        deathTimer = 0;
        player.vy = -10.8;
        player.vx = 0;
        triggerShake(12, 6);
        AudioEngine.die();
    }

    function upgradePlayer(toPower) {
        AudioEngine.powerup();
        addScore(1000, player.x, player.y - 10);
        if (toPower === 'star') {
            player.starTimer = 600; // 10 שניות
            AudioEngine.startMusic('starman');
            return;
        }
        if (player.power === 'small') {
            player.y -= (44 - 28);
            player.h = 44;
        }
        if (toPower === 'mushroom' && player.power === 'small') {
            player.power = 'big';
        } else if (toPower === 'flower') {
            player.power = 'fire';
        }
    }

    function updatePlatforms() {
        platforms.forEach(plat => {
            const oldX = plat.x;
            const oldY = plat.y;
            plat.phase += plat.speed;
            if (plat.type === 'horizontal') {
                plat.x = plat.startX + Math.sin(plat.phase) * plat.range;
            } else {
                plat.y = plat.startY + Math.sin(plat.phase) * plat.range;
            }
            plat.dx = plat.x - oldX;
            plat.dy = plat.y - oldY;
        });
    }

    function updatePlayer() {
        // הסעת מריו על פלטפורמה נעה
        if (player.standingPlatform) {
            player.x += player.standingPlatform.dx;
            player.y += player.standingPlatform.dy;
        }

        const left = keys['ArrowLeft'] || keys['KeyA'];
        const right = keys['ArrowRight'] || keys['KeyD'];
        const down = keys['ArrowDown'] || keys['KeyS'];
        const jumpHeld = keys['Space'] || keys['ArrowUp'] || keys['KeyW'];
        const sprint = keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyZ'] || keys['KeyF'];

        // התכופפות (Crouch) עבור מריו גדול/אש
        if (player.power !== 'small') {
            if (down && player.onGround) {
                if (!player.isCrouching) {
                    player.isCrouching = true;
                    player.y += (44 - 28);
                    player.h = 28;
                }
            } else if (player.isCrouching && canStandUp()) {
                player.isCrouching = false;
                player.y -= (44 - 28);
                player.h = 44;
            }
        }

        const starBoost = player.starTimer > 0 ? 1.15 : 1.0;
        const maxSpeed = (player.isCrouching ? 1.2 : (sprint ? 5.4 : 3.8)) * starBoost;
        const accel = player.onGround ? 0.44 : 0.30;

        player.isSkidding = false;
        if (left && !right) {
            if (player.vx > 2.2 && player.onGround && !player.isCrouching) {
                player.isSkidding = true;
                if (globalFrame % 4 === 0) {
                    spawnDust(player.x + player.w / 2, player.y + player.h, 1);
                    AudioEngine.skid();
                }
            }
            player.vx -= accel;
            player.facing = -1;
        } else if (right && !left) {
            if (player.vx < -2.2 && player.onGround && !player.isCrouching) {
                player.isSkidding = true;
                if (globalFrame % 4 === 0) {
                    spawnDust(player.x + player.w / 2, player.y + player.h, 1);
                    AudioEngine.skid();
                }
            }
            player.vx += accel;
            player.facing = 1;
        } else {
            player.vx *= player.onGround ? 0.80 : 0.92;
            if (Math.abs(player.vx) < 0.14) player.vx = 0;
        }
        player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));

        // Coyote Time & Jump Buffer
        if (player.onGround) {
            player.coyoteTimer = 7;
            player.stompCombo = 0;
        } else if (player.coyoteTimer > 0) {
            player.coyoteTimer--;
        }

        if (jumpJustPressed) {
            player.jumpBuffer = 7;
            jumpJustPressed = false;
        } else if (player.jumpBuffer > 0) {
            player.jumpBuffer--;
        }

        if (player.jumpBuffer > 0 && player.coyoteTimer > 0) {
            player.vy = -12.2;
            player.onGround = false;
            player.standingPlatform = null;
            player.coyoteTimer = 0;
            player.jumpBuffer = 0;
            spawnDust(player.x + player.w / 2, player.y + player.h, 4);
            AudioEngine.jump(player.power !== 'small');
        }

        // קפיצה נמוכה בשחרור מהיר
        if (!jumpHeld && player.vy < -4.5) {
            player.vy *= 0.62;
        }

        // ירי כדורי אש
        if (player.fireCooldown > 0) player.fireCooldown--;
        if (fireJustPressed) {
            fireJustPressed = false;
            if (player.power === 'fire' && player.fireCooldown === 0 && fireballs.length < 2) {
                AudioEngine.fireball();
                player.fireCooldown = 13;
                fireballs.push({
                    x: player.facing === 1 ? player.x + player.w : player.x - 12,
                    y: player.y + (player.isCrouching ? 10 : 16),
                    w: 12,
                    h: 12,
                    vx: 7.8 * player.facing,
                    vy: 2.2,
                    dead: false
                });
            }
        }

        // כוח משיכה
        player.vy = Math.min(13.5, player.vy + 0.52);

        // תנועה והתנגשות בציר X
        player.x += player.vx;
        if (player.x < 0) {
            player.x = 0;
            player.vx = 0;
        }

        const topTile = Math.floor((player.y + 3) / TILE);
        const bottomTile = Math.floor((player.y + player.h - 3) / TILE);
        if (player.vx > 0) {
            const rightTile = Math.floor((player.x + player.w) / TILE);
            for (let ty = topTile; ty <= bottomTile; ty++) {
                if (isSolidTile(rightTile, ty)) {
                    player.x = rightTile * TILE - player.w;
                    player.vx = 0;
                    break;
                }
            }
        } else if (player.vx < 0) {
            const leftTile = Math.floor(player.x / TILE);
            for (let ty = topTile; ty <= bottomTile; ty++) {
                if (isSolidTile(leftTile, ty)) {
                    player.x = (leftTile + 1) * TILE;
                    player.vx = 0;
                    break;
                }
            }
        }

        // תנועה והתנגשות בציר Y
        const wasOnGround = player.onGround;
        player.y += player.vy;
        player.onGround = false;
        player.standingPlatform = null;

        const leftCol = Math.floor((player.x + 3) / TILE);
        const rightCol = Math.floor((player.x + player.w - 3) / TILE);

        if (player.vy >= 0) {
            const footRow = Math.floor((player.y + player.h) / TILE);
            for (let tx = leftCol; tx <= rightCol; tx++) {
                if (isSolidTile(tx, footRow)) {
                    player.y = footRow * TILE - player.h;
                    player.vy = 0;
                    player.onGround = true;
                    break;
                }
            }

            // בדיקת נחיתה על פלטפורמה נעה (One-way top)
            if (!player.onGround) {
                const prevFoot = player.y + player.h - player.vy;
                for (const plat of platforms) {
                    if (
                        player.x + player.w > plat.x + 2 &&
                        player.x < plat.x + plat.w - 2 &&
                        prevFoot <= plat.y + 8 &&
                        player.y + player.h >= plat.y
                    ) {
                        player.y = plat.y - player.h;
                        player.vy = 0;
                        player.onGround = true;
                        player.standingPlatform = plat;
                        break;
                    }
                }
            }

            if (player.onGround && !wasOnGround) {
                spawnDust(player.x + player.w / 2, player.y + player.h, 3);
            }
        } else {
            const headRow = Math.floor(player.y / TILE);
            const hitCols = [];
            for (let tx = leftCol; tx <= rightCol; tx++) {
                if (isSolidTile(tx, headRow)) hitCols.push(tx);
            }
            if (hitCols.length > 0) {
                player.y = (headRow + 1) * TILE;
                player.vy = 0;
                const center = player.x + player.w / 2;
                hitCols.sort((a, b) => Math.abs((a + 0.5) * TILE - center) - Math.abs((b + 0.5) * TILE - center));
                bumpBlock(hitCols[0], headRow);
            }
        }

        if (player.invincibleTimer > 0) player.invincibleTimer--;
        if (player.starTimer > 0) {
            player.starTimer--;
            if (globalFrame % 3 === 0) {
                particles.push({
                    type: 'sparkle',
                    x: player.x + Math.random() * player.w,
                    y: player.y + Math.random() * player.h,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: -1 - Math.random(),
                    size: 4,
                    life: 14
                });
            }
            if (player.starTimer === 0) {
                AudioEngine.startMusic(LEVELS[currentLevelIdx].music);
            }
        }

        if (Math.abs(player.vx) > 0.35 && player.onGround && !player.isCrouching) {
            player.walkFrame += 0.24 * (sprint ? 1.25 : 1);
        } else {
            player.walkFrame = 0;
        }

        // הפעלת נקודת שמירה (Checkpoint)
        if (checkpointPos && !checkpointActive && player.x + player.w >= checkpointPos.x) {
            checkpointActive = true;
            AudioEngine.checkpoint();
            addScore(500, checkpointPos.x, checkpointPos.y - 24, 'CHECKPOINT!');
        }

        // נפילה לתהום
        if (player.y > HEIGHT + 40) {
            killPlayer();
        }

        // הגעה לדגל הסיום
        const flagX = flagCol * TILE + 12;
        if (player.x + player.w >= flagX && gameState === 'playing') {
            gameState = 'levelClear';
            clearPhase = 0;
            clearTimer = 0;
            player.x = flagX - player.w + 4;
            player.vx = 0;
            player.vy = 0;
            player.isCrouching = false;
            const heightBonus = Math.max(100, Math.round((HEIGHT - player.y) * 5));
            addScore(heightBonus, player.x, player.y - 12);
            AudioEngine.win();
        }

        // מצלמה חלקה עם Look-Ahead
        const desiredLookAhead = player.facing * 55;
        lookAheadX += (desiredLookAhead - lookAheadX) * 0.06;
        const targetCam = player.x - WIDTH * 0.36 + lookAheadX;
        const clampedCam = Math.max(0, Math.min(levelWidth - WIDTH, targetCam));
        cameraX += (clampedCam - cameraX) * 0.18;
    }

    function updateItems() {
        items.forEach(item => {
            if (item.collected) return;

            if (item.type === 'mushroom' || item.type === 'oneup' || item.type === 'star') {
                item.vy = Math.min(10, item.vy + 0.45);
                item.x += item.vx;

                const topT = Math.floor((item.y + 2) / TILE);
                const botT = Math.floor((item.y + item.h - 2) / TILE);
                if (item.vx > 0) {
                    const rt = Math.floor((item.x + item.w) / TILE);
                    for (let ty = topT; ty <= botT; ty++) {
                        if (isSolidTile(rt, ty)) {
                            item.x = rt * TILE - item.w;
                            item.vx *= -1;
                            break;
                        }
                    }
                } else {
                    const lt = Math.floor(item.x / TILE);
                    for (let ty = topT; ty <= botT; ty++) {
                        if (isSolidTile(lt, ty)) {
                            item.x = (lt + 1) * TILE;
                            item.vx *= -1;
                            break;
                        }
                    }
                }

                item.y += item.vy;
                const lCol = Math.floor((item.x + 2) / TILE);
                const rCol = Math.floor((item.x + item.w - 2) / TILE);
                const fRow = Math.floor((item.y + item.h) / TILE);
                for (let tx = lCol; tx <= rCol; tx++) {
                    if (isSolidTile(tx, fRow)) {
                        item.y = fRow * TILE - item.h;
                        item.vy = item.type === 'star' ? -7.5 : 0;
                        break;
                    }
                }
                if (item.y > HEIGHT + 40) item.collected = true;
            }

            if (rectsOverlap(player, item)) {
                item.collected = true;
                if (item.type === 'coin') {
                    coins++;
                    if (coins >= 100) {
                        coins -= 100;
                        lives++;
                        AudioEngine.oneUp();
                    } else {
                        AudioEngine.coin();
                    }
                    addScore(100, item.x, item.y - 8);
                } else if (item.type === 'mushroom') {
                    upgradePlayer('mushroom');
                } else if (item.type === 'flower') {
                    upgradePlayer('flower');
                } else if (item.type === 'star') {
                    upgradePlayer('star');
                } else if (item.type === 'oneup') {
                    lives++;
                    AudioEngine.oneUp();
                    addScore(0, item.x, item.y - 10, '1-UP!');
                }
            }
        });
        items = items.filter(i => !i.collected);
    }

    function updateEnemies() {
        enemies.forEach(en => {
            if (en.dead && en.type !== 'piranha') {
                en.vy += 0.5;
                en.y += en.vy;
                return;
            }

            // צמח פיראנה בצינורות
            if (en.type === 'piranha') {
                if (en.dead) return;
                const playerNear = Math.abs((player.x + player.w / 2) - (en.x + en.w / 2)) < 40;
                en.timer = (en.timer + 1) % 240;

                if (en.timer < 60) {
                    // חבוי בתוך הצינור
                    en.offset = 0;
                } else if (en.timer < 100) {
                    // עולה החוצה רק אם מריו לא עומד מעל הצינור
                    if (!playerNear || en.offset > 6) {
                        en.offset = Math.min(34, en.offset + 0.9);
                    } else {
                        en.timer = 59;
                    }
                } else if (en.timer < 170) {
                    en.offset = 34;
                } else {
                    en.offset = Math.max(0, en.offset - 0.9);
                }

                en.y = en.baseY - en.offset;
                if (en.offset > 8 && rectsOverlap(player, en)) {
                    if (player.starTimer > 0) {
                        en.dead = true;
                        enemiesDefeated++;
                        AudioEngine.stomp(2);
                        addScore(200, en.x, en.y);
                    } else {
                        hurtPlayer();
                    }
                }
                return;
            }

            if (!en.active) {
                if (en.x < cameraX + WIDTH + 120) {
                    en.active = true;
                } else {
                    return;
                }
            }

            if (en.squished) {
                en.squishTimer--;
                if (en.squishTimer <= 0) en.dead = true;
                return;
            }

            if (en.kickGrace > 0) en.kickGrace--;

            en.vy = Math.min(11, en.vy + 0.5);
            en.x += en.vx;

            const topT = Math.floor((en.y + 3) / TILE);
            const botT = Math.floor((en.y + en.h - 3) / TILE);
            if (en.vx > 0) {
                const rt = Math.floor((en.x + en.w) / TILE);
                for (let ty = topT; ty <= botT; ty++) {
                    if (isSolidTile(rt, ty)) {
                        en.x = rt * TILE - en.w;
                        en.vx *= -1;
                        if (en.shellMoving) AudioEngine.bump();
                        break;
                    }
                }
            } else if (en.vx < 0) {
                const lt = Math.floor(en.x / TILE);
                for (let ty = topT; ty <= botT; ty++) {
                    if (isSolidTile(lt, ty)) {
                        en.x = (lt + 1) * TILE;
                        en.vx *= -1;
                        if (en.shellMoving) AudioEngine.bump();
                        break;
                    }
                }
            }

            en.y += en.vy;
            const lCol = Math.floor((en.x + 2) / TILE);
            const rCol = Math.floor((en.x + en.w - 2) / TILE);
            const fRow = Math.floor((en.y + en.h) / TILE);
            for (let tx = lCol; tx <= rCol; tx++) {
                if (isSolidTile(tx, fRow)) {
                    en.y = fRow * TILE - en.h;
                    en.vy = 0;
                    break;
                }
            }

            if (en.y > HEIGHT + 60) {
                en.dead = true;
                return;
            }

            // שריון מחליק דורס אויבים אחרים
            if (en.type === 'koopa' && en.shellMoving) {
                enemies.forEach(other => {
                    if (other !== en && !other.dead && !other.squished && other.type !== 'piranha' && rectsOverlap(en, other)) {
                        other.dead = true;
                        other.vy = -7;
                        enemiesDefeated++;
                        en.combo++;
                        AudioEngine.stomp(en.combo);
                        addScore(200 * en.combo, other.x, other.y - 8);
                    }
                });
            }

            // מפגש עם מריו
            if (rectsOverlap(player, en)) {
                // פגיעה בזמן כוכב-על
                if (player.starTimer > 0) {
                    en.dead = true;
                    en.vy = -7.5;
                    enemiesDefeated++;
                    AudioEngine.stomp(3);
                    triggerShake(4, 2);
                    addScore(200, en.x, en.y - 8);
                    return;
                }

                const stompHit = player.vy > 0 && (player.y + player.h - player.vy) <= (en.y + en.h * 0.58);

                if (en.type === 'koopa' && en.shell && !en.shellMoving) {
                    AudioEngine.kickShell();
                    const dir = (player.x + player.w / 2) < (en.x + en.w / 2) ? 1 : -1;
                    en.vx = 6.8 * dir;
                    en.shellMoving = true;
                    en.kickGrace = 12;
                    if (stompHit) player.vy = -8.2;
                    addScore(400, en.x, en.y - 8);
                } else if (stompHit) {
                    player.stompCombo++;
                    const comboTable = [100, 200, 400, 800, 1000];
                    const pts = comboTable[Math.min(comboTable.length - 1, player.stompCombo - 1)];

                    AudioEngine.stomp(player.stompCombo);
                    player.vy = -8.8;
                    hitstopTimer = 2;
                    spawnDust(en.x + en.w / 2, en.y + 4, 4);

                    if (player.stompCombo > comboTable.length) {
                        lives++;
                        AudioEngine.oneUp();
                        addScore(0, en.x, en.y - 14, '1-UP!');
                    } else {
                        addScore(pts, en.x, en.y - 8);
                    }

                    if (en.type === 'goomba') {
                        en.squished = true;
                        en.squishTimer = 24;
                        en.vx = 0;
                        enemiesDefeated++;
                    } else if (en.type === 'koopa') {
                        if (!en.shell) {
                            en.shell = true;
                            en.y += 16;
                            en.h = 26;
                        }
                        en.shellMoving = false;
                        en.vx = 0;
                        en.kickGrace = 10;
                    }
                } else if (!(en.type === 'koopa' && en.kickGrace > 0)) {
                    hurtPlayer();
                }
            }
        });

        enemies = enemies.filter(en => !(en.dead && (en.y > HEIGHT + 60 || en.type === 'piranha')) && !(en.squished && en.squishTimer <= 0));
    }

    function updateFireballs() {
        fireballs.forEach(fb => {
            if (fb.dead) return;
            fb.vy = Math.min(9.5, fb.vy + 0.48);
            fb.x += fb.vx;

            const tx = Math.floor((fb.vx > 0 ? fb.x + fb.w : fb.x) / TILE);
            const ty = Math.floor((fb.y + fb.h / 2) / TILE);
            if (isSolidTile(tx, ty)) {
                fb.dead = true;
                spawnDust(fb.x, fb.y, 4);
                AudioEngine.bump();
                return;
            }

            fb.y += fb.vy;
            const fy = Math.floor((fb.y + fb.h) / TILE);
            const fx = Math.floor((fb.x + fb.w / 2) / TILE);
            if (isSolidTile(fx, fy)) {
                fb.y = fy * TILE - fb.h;
                fb.vy = -6.6;
            }

            if (fb.y > HEIGHT + 20 || fb.x < cameraX - 50 || fb.x > cameraX + WIDTH + 50) {
                fb.dead = true;
                return;
            }

            enemies.forEach(en => {
                if (!en.dead && !en.squished && rectsOverlap(fb, en)) {
                    if (en.type === 'piranha' && en.offset < 10) return;
                    fb.dead = true;
                    en.dead = true;
                    en.vy = -7;
                    enemiesDefeated++;
                    spawnDust(fb.x, fb.y, 5);
                    AudioEngine.stomp(2);
                    addScore(200, en.x, en.y - 8);
                }
            });
        });
        fireballs = fireballs.filter(fb => !fb.dead);
    }

    function updateEffects() {
        Object.keys(blockBumps).forEach(k => {
            blockBumps[k] += 1.6;
            if (blockBumps[k] >= 0) delete blockBumps[k];
        });

        particles.forEach(p => {
            if (p.type === 'brick') {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.45;
                p.rot += p.vrot;
            } else if (p.type === 'popCoin') {
                p.y += p.vy;
                p.vy += 0.48;
            } else if (p.type === 'dust' || p.type === 'sparkle') {
                p.x += p.vx;
                p.y += p.vy;
            }
            p.life--;
        });
        particles = particles.filter(p => p.life > 0);

        floatingTexts.forEach(ft => {
            ft.y += ft.vy;
            ft.life--;
        });
        floatingTexts = floatingTexts.filter(ft => ft.life > 0);
    }

    function update() {
        globalFrame++;

        if (shakeTimer > 0) shakeTimer--;
        if (hitstopTimer > 0) {
            hitstopTimer--;
            return;
        }

        if (gameState === 'stageIntro') {
            introTimer--;
            if (introTimer <= 0) {
                gameState = 'playing';
                AudioEngine.startMusic(LEVELS[currentLevelIdx].music);
            }
            return;
        }

        if (gameState === 'playing') {
            timeCounter++;
            if (timeCounter >= 60) {
                timeCounter = 0;
                timeLeft--;
                if (timeLeft <= 0) {
                    killPlayer();
                }
            }
            updatePlatforms();
            updatePlayer();
            updateItems();
            updateEnemies();
            updateFireballs();
            updateEffects();
            updateHUD();
        } else if (gameState === 'dying') {
            deathTimer++;
            if (deathTimer > 15) {
                player.vy += 0.45;
                player.y += player.vy;
            }
            if (deathTimer > 105) {
                lives--;
                updateHUD();
                if (lives <= 0) {
                    gameState = 'gameOver';
                    showOverlay('GAME OVER', 'המשחק נגמר!', 'אזלו כל החיים, אך תמיד אפשר לנסות שוב ולשבור את השיא.', 'נסה שוב', {
                        showLevels: true,
                        showStats: true
                    });
                } else {
                    beginStageWithIntro(currentLevelIdx, false, checkpointActive);
                }
            }
        } else if (gameState === 'levelClear') {
            clearTimer++;
            updateEffects();
            if (clearPhase === 0) {
                const groundY = 13 * TILE - player.h;
                if (player.y < groundY) player.y = Math.min(groundY, player.y + 4.2);
                if (flagSlideY < 11 * TILE) flagSlideY += 4.2;
                if (player.y >= groundY && flagSlideY >= 11 * TILE) {
                    clearPhase = 1;
                    clearTimer = 0;
                }
            } else if (clearPhase === 1) {
                const castleDoorX = (flagCol + 5) * TILE + 8;
                player.facing = 1;
                player.walkFrame += 0.22;
                player.x += 2.3;
                if (player.x >= castleDoorX) {
                    clearPhase = 2;
                    clearTimer = 0;
                    const timeBonus = Math.max(0, timeLeft) * 10;
                    addScore(timeBonus, castleDoorX, 10 * TILE, `TIME +${timeBonus}`);
                    updateHUD();
                }
            } else if (clearPhase === 2 && clearTimer > 65) {
                if (currentLevelIdx + 1 < LEVELS.length) {
                    const nextIdx = currentLevelIdx + 1;
                    if (nextIdx > unlockedLevel) {
                        unlockedLevel = nextIdx;
                        localStorage.setItem('mario_unlocked_level', String(unlockedLevel));
                    }
                    beginStageWithIntro(nextIdx, true, false);
                } else {
                    gameState = 'victory';
                    showOverlay('VICTORY! 🏆', 'ניצחת את כל השלבים!', 'השלמת את המסע בהצלחה והצלת את הממלכה!', 'שחק שוב מההתחלה', {
                        showLevels: true,
                        showStats: true
                    });
                }
            }
        }
    }

    // =========================================================================
    // 7. מנוע ציור (Rendering)
    // =========================================================================
    function drawBackground() {
        if (theme === 'overworld') {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
            skyGrad.addColorStop(0, '#4f86f7');
            skyGrad.addColorStop(1, '#8bb5ff');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            // הרים רחוקים (Parallax 0.2)
            for (let i = 0; i < 6; i++) {
                const mx = ((i * 440 - cameraX * 0.2) % (WIDTH + 480) + (WIDTH + 480)) % (WIDTH + 480) - 160;
                ctx.fillStyle = '#3b7a57';
                ctx.beginPath();
                ctx.moveTo(mx, 13 * TILE);
                ctx.lineTo(mx + 110, 13 * TILE - 150);
                ctx.lineTo(mx + 220, 13 * TILE);
                ctx.closePath();
                ctx.fill();
            }

            // גבעות קרובות (Parallax 0.4)
            for (let i = 0; i < 8; i++) {
                const hx = ((i * 360 - cameraX * 0.4) % (WIDTH + 400) + (WIDTH + 400)) % (WIDTH + 400) - 120;
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.arc(hx, 13 * TILE, 88, Math.PI, 0);
                ctx.fill();
                ctx.fillStyle = '#16a34a';
                ctx.beginPath();
                ctx.arc(hx + 18, 13 * TILE, 58, Math.PI, 0);
                ctx.fill();
            }

            // עננים (Parallax 0.25)
            for (let i = 0; i < 10; i++) {
                const cx = ((i * 290 - cameraX * 0.25) % (WIDTH + 320) + (WIDTH + 320)) % (WIDTH + 320) - 100;
                const cy = 55 + (i % 3) * 42;
                ctx.fillStyle = 'rgba(255,255,255,0.92)';
                ctx.beginPath();
                ctx.arc(cx, cy, 18, 0, Math.PI * 2);
                ctx.arc(cx + 20, cy - 8, 24, 0, Math.PI * 2);
                ctx.arc(cx + 44, cy, 18, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (theme === 'underground') {
            ctx.fillStyle = '#090d1a';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            // קריסטלים זוהרים ברקע
            for (let i = 0; i < 18; i++) {
                const sx = ((i * 210 - cameraX * 0.22) % (WIDTH + 200) + (WIDTH + 200)) % (WIDTH + 200) - 50;
                const sy = 85 + (i * 67) % 270;
                ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.14)' : 'rgba(168, 85, 247, 0.14)';
                ctx.beginPath();
                ctx.moveTo(sx, sy - 14);
                ctx.lineTo(sx + 8, sy);
                ctx.lineTo(sx, sy + 14);
                ctx.lineTo(sx - 8, sy);
                ctx.closePath();
                ctx.fill();
            }
        } else {
            const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
            grad.addColorStop(0, '#f97316');
            grad.addColorStop(0.55, '#fb923c');
            grad.addColorStop(1, '#fde047');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            for (let i = 0; i < 9; i++) {
                const cx = ((i * 300 - cameraX * 0.28) % (WIDTH + 320) + (WIDTH + 320)) % (WIDTH + 320) - 90;
                const cy = 70 + (i % 3) * 50;
                ctx.fillStyle = 'rgba(255,255,255,0.68)';
                ctx.beginPath();
                ctx.arc(cx, cy, 20, 0, Math.PI * 2);
                ctx.arc(cx + 22, cy - 6, 25, 0, Math.PI * 2);
                ctx.arc(cx + 46, cy, 20, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function drawTiles() {
        const startCol = Math.max(0, Math.floor(cameraX / TILE) - 1);
        const endCol = Math.min(grid[0].length - 1, Math.ceil((cameraX + WIDTH) / TILE) + 1);

        for (let y = 0; y < ROWS; y++) {
            for (let x = startCol; x <= endCol; x++) {
                const ch = grid[y][x];
                if (ch === '.' || ch === 'F') continue;

                const px = Math.round(x * TILE - cameraX);
                const bumpOffset = blockBumps[`${x},${y}`] || 0;
                const py = Math.round(y * TILE + bumpOffset);

                if (ch === '#') {
                    if (theme === 'underground') {
                        ctx.fillStyle = '#1e3a5f';
                        ctx.fillRect(px, py, TILE, TILE);
                        ctx.fillStyle = '#2d5a8e';
                        ctx.fillRect(px + 2, py + 2, TILE - 4, 4);
                        ctx.strokeStyle = '#0f1f36';
                        ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
                    } else {
                        ctx.fillStyle = '#8d5524';
                        ctx.fillRect(px, py, TILE, TILE);
                        if (y === 13) {
                            ctx.fillStyle = '#22c55e';
                            ctx.fillRect(px, py, TILE, 8);
                            ctx.fillStyle = '#15803d';
                            ctx.fillRect(px, py + 8, TILE, 3);
                        }
                        ctx.fillStyle = 'rgba(0,0,0,0.18)';
                        ctx.fillRect(px + 5, py + 15, 6, 5);
                        ctx.fillRect(px + 19, py + 22, 7, 5);
                    }
                } else if (ch === 'B') {
                    ctx.fillStyle = theme === 'underground' ? '#2563eb' : '#c2410c';
                    ctx.fillRect(px, py, TILE, TILE);
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillRect(px, py, TILE, 3);
                    ctx.fillStyle = 'rgba(0,0,0,0.38)';
                    ctx.fillRect(px, py + 14, TILE, 2);
                    ctx.fillRect(px, py + 30, TILE, 2);
                    ctx.fillRect(px + 15, py, 2, 14);
                    ctx.fillRect(px + 7, py + 16, 2, 14);
                    ctx.fillRect(px + 23, py + 16, 2, 14);
                } else if (ch === '?' || ch === 'M' || ch === '1' || ch === '*') {
                    const pulse = Math.sin(globalFrame * 0.14) * 20;
                    ctx.fillStyle = `rgb(${235 + pulse}, ${175 + pulse}, 25)`;
                    ctx.fillRect(px, py, TILE, TILE);
                    ctx.fillStyle = 'rgba(255,255,255,0.45)';
                    ctx.fillRect(px + 2, py + 2, TILE - 4, 3);
                    ctx.strokeStyle = '#78350f';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);
                    ctx.fillStyle = '#78350f';
                    ctx.font = 'bold 20px "JetBrains Mono", monospace';
                    ctx.fillText('?', px + 10, py + 23);
                } else if (ch === 'U') {
                    ctx.fillStyle = '#6b533b';
                    ctx.fillRect(px, py, TILE, TILE);
                    ctx.strokeStyle = '#3f2e1e';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);
                } else if (ch === 'X') {
                    ctx.fillStyle = '#9a3412';
                    ctx.fillRect(px, py, TILE, TILE);
                    ctx.fillStyle = 'rgba(255,255,255,0.25)';
                    ctx.fillRect(px, py, TILE, 4);
                    ctx.fillRect(px, py, 4, TILE);
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.fillRect(px, py + TILE - 4, TILE, 4);
                    ctx.fillRect(px + TILE - 4, py, 4, TILE);
                } else if (ch === '[' || ch === ']' || ch === '(' || ch === ')') {
                    ctx.fillStyle = '#16a34a';
                    ctx.fillRect(px, py, TILE, TILE);
                    ctx.fillStyle = '#4ade80';
                    if (ch === '[' || ch === '(') ctx.fillRect(px + 4, py, 7, TILE);
                    ctx.fillStyle = '#14532d';
                    if (ch === ']' || ch === ')') ctx.fillRect(px + TILE - 6, py, 6, TILE);
                    if (ch === '[' || ch === ']') {
                        ctx.strokeStyle = '#052e16';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(px, py, TILE, TILE);
                    }
                }
            }
        }
    }

    function drawPlatformsAndCheckpoint() {
        // פלטפורמות נעות
        platforms.forEach(plat => {
            const px = Math.round(plat.x - cameraX);
            const py = Math.round(plat.y);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(px, py, plat.w, plat.h);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(px + 2, py + 2, plat.w - 4, 4);
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, plat.w, plat.h);
        });

        // דגל Checkpoint
        if (checkpointPos) {
            const cx = Math.round(checkpointPos.x + 12 - cameraX);
            const cy = checkpointPos.y - 32;
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(cx, cy, 4, 64);
            ctx.fillStyle = checkpointActive ? '#22c55e' : '#ef4444';
            ctx.beginPath();
            ctx.moveTo(cx + 4, checkpointActive ? cy + 4 : cy + 32);
            ctx.lineTo(cx + 26, (checkpointActive ? cy + 4 : cy + 32) + 9);
            ctx.lineTo(cx + 4, (checkpointActive ? cy + 4 : cy + 32) + 18);
            ctx.closePath();
            ctx.fill();
        }
    }

    function drawGoalAndCastle() {
        const flagX = Math.round(flagCol * TILE + 14 - cameraX);
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(flagX, 3 * TILE, 5, 10 * TILE);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(flagX + 2.5, 3 * TILE, 7, 0, Math.PI * 2);
        ctx.fill();

        const fy = gameState === 'levelClear' ? flagSlideY : 3.4 * TILE;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(flagX + 5, fy);
        ctx.lineTo(flagX + 42, fy + 14);
        ctx.lineTo(flagX + 5, fy + 28);
        ctx.closePath();
        ctx.fill();

        // טירה
        const castleX = Math.round((flagCol + 4) * TILE - cameraX);
        const castleY = 8 * TILE;
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(castleX, castleY + 48, 96, 112);
        ctx.fillRect(castleX + 18, castleY, 60, 48);

        ctx.fillStyle = '#7f1d1d';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(castleX + 18 + i * 16, castleY - 10, 10, 10);
        }
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(castleX + 48, 13 * TILE - 22, 16, Math.PI, 0);
        ctx.lineTo(castleX + 64, 13 * TILE);
        ctx.lineTo(castleX + 32, 13 * TILE);
        ctx.closePath();
        ctx.fill();
    }

    function drawItems() {
        items.forEach(item => {
            const px = Math.round(item.x - cameraX);
            const py = Math.round(item.y);
            if (item.type === 'coin') {
                const spinW = Math.max(4, Math.abs(Math.cos(globalFrame * 0.13)) * item.w);
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.ellipse(px + item.w / 2, py + item.h / 2, spinW / 2, item.h / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ca8a04';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                const spr = Sprites.get(item.type);
                if (spr) {
                    ctx.drawImage(spr, px - 4, py - 4, 32, 32);
                }
            }
        });
    }

    function drawEnemies() {
        // צמחי פיראנה מצוירים לפני הצינורות או מעליהם עם חיתוך נקי
        enemies.forEach(en => {
            const px = Math.round(en.x - cameraX);
            const py = Math.round(en.y);

            if (en.type === 'piranha') {
                if (en.offset <= 2) return;
                const frame = Math.floor(globalFrame / 10) % 2;
                const spr = Sprites.get(`piranha_${frame}`);
                if (spr) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(px - 4, en.baseY - 40, 36, 40);
                    ctx.clip();
                    ctx.drawImage(spr, px - 2, py, 32, 36);
                    ctx.restore();
                }
            } else if (en.type === 'goomba') {
                const sprName = en.squished ? 'goomba_squish' : `goomba_${Math.floor(globalFrame / 9) % 2}`;
                const spr = Sprites.get(sprName);
                if (spr) ctx.drawImage(spr, px - 2, py - 2, 32, 32);
            } else if (en.type === 'koopa') {
                if (en.shell) {
                    const spr = Sprites.get('koopa_shell');
                    if (spr) ctx.drawImage(spr, px - 2, py - 4, 32, 30);
                } else {
                    const dir = en.vx >= 0 ? 'R' : 'L';
                    const frame = Math.floor(globalFrame / 9) % 2;
                    const spr = Sprites.get(`koopa_${frame}_${dir}`);
                    if (spr) ctx.drawImage(spr, px - 2, py - 2, 32, 44);
                }
            }
        });
    }

    function drawPlayer() {
        if (player.invincibleTimer > 0 && Math.floor(globalFrame / 4) % 2 === 0) return;

        const px = Math.round(player.x - cameraX);
        const py = Math.round(player.y);
        const dir = player.facing === 1 ? 'R' : 'L';
        const prefix = player.power;

        let pose = 'idle';
        if (player.isCrouching && player.power !== 'small') {
            pose = 'crouch';
        } else if (!player.onGround) {
            pose = 'jump';
        } else if (player.isSkidding) {
            pose = 'skid';
        } else if (Math.abs(player.vx) > 0.35) {
            pose = Math.floor(player.walkFrame) % 2 === 0 ? 'walk' : 'idle';
        }

        const spr = Sprites.get(`${prefix}_${pose}_${dir}`);
        if (spr) {
            ctx.save();
            if (player.starTimer > 0) {
                const hue = (globalFrame * 18) % 360;
                ctx.filter = `hue-rotate(${hue}deg) brightness(1.25)`;
            }
            if (player.power === 'small') {
                ctx.drawImage(spr, px - 3, py - 4, 30, 32);
            } else if (player.isCrouching) {
                ctx.drawImage(spr, px - 3, py - 18, 30, 48);
            } else {
                ctx.drawImage(spr, px - 3, py - 4, 30, 48);
            }
            ctx.restore();
        }
    }

    function drawFireballsAndEffects() {
        fireballs.forEach(fb => {
            const px = Math.round(fb.x - cameraX);
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(px + 6, fb.y + 6, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(px + 6, fb.y + 6, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        particles.forEach(p => {
            const px = Math.round(p.x - cameraX);
            if (p.type === 'brick') {
                ctx.save();
                ctx.translate(px + p.size / 2, p.y + p.size / 2);
                ctx.rotate(p.rot);
                ctx.fillStyle = theme === 'underground' ? '#2563eb' : '#c2410c';
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            } else if (p.type === 'popCoin') {
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.ellipse(px + 8, p.y + 8, 6, 9, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'dust') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
                ctx.beginPath();
                ctx.arc(px, p.y, p.size * (p.life / 16), 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'sparkle') {
                ctx.fillStyle = `hsl(${(globalFrame * 25) % 360}, 100%, 70%)`;
                ctx.fillRect(px, p.y, p.size, p.size);
            }
        });

        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        floatingTexts.forEach(ft => {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillText(ft.text, ft.x - cameraX + 1, ft.y + 1);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(ft.text, ft.x - cameraX, ft.y);
        });
    }

    function drawStageIntroCard() {
        const lvl = LEVELS[currentLevelIdx];
        ctx.fillStyle = '#090c15';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText(`WORLD ${lvl.name}`, WIDTH / 2, HEIGHT / 2 - 58);

        ctx.fillStyle = '#ffd166';
        ctx.font = '800 32px "Rubik", sans-serif';
        ctx.fillText(lvl.title, WIDTH / 2, HEIGHT / 2 - 16);

        const marioSpr = Sprites.get('small_idle_R');
        if (marioSpr) {
            ctx.drawImage(marioSpr, WIDTH / 2 - 48, HEIGHT / 2 + 12, 32, 34);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "JetBrains Mono", monospace';
        ctx.fillText(`x  ${lives}`, WIDTH / 2 + 18, HEIGHT / 2 + 37);
        ctx.textAlign = 'start';
    }

    function render() {
        if (gameState === 'stageIntro') {
            drawStageIntroCard();
            return;
        }

        ctx.save();
        if (shakeTimer > 0) {
            const dx = (Math.random() - 0.5) * shakeIntensity * 2;
            const dy = (Math.random() - 0.5) * shakeIntensity * 2;
            ctx.translate(dx, dy);
        }

        drawBackground();
        drawGoalAndCastle();
        drawEnemies(); // צמחי פיראנה מאחורי שפת הצינור
        drawTiles();
        drawPlatformsAndCheckpoint();
        drawItems();
        if (player && !(gameState === 'levelClear' && clearPhase === 2)) {
            drawPlayer();
        }
        drawFireballsAndEffects();

        ctx.restore();
    }

    // =========================================================================
    // 8. לולאת משחק ראשית בקצב קבוע (60Hz Fixed Timestep)
    // =========================================================================
    let lastTime = performance.now();
    let accumulator = 0;

    function loop(now) {
        const dt = Math.min(100, now - lastTime);
        lastTime = now;
        accumulator += dt;

        while (accumulator >= FIXED_DT) {
            update();
            accumulator -= FIXED_DT;
        }

        render();
        requestAnimationFrame(loop);
    }

    // אתחול ראשוני לתפריט הפתיחה
    loadLevel(0, false);
    updateHUD();
    showOverlay('SUPER MARIO BROS', 'סופר מריו', 'חצה את שלושת העולמות, אסוף כוחות-על והבס את האויבים בדרך לטירה!', 'התחל הרפתקה', {
        showLevels: true,
        showControls: true
    });
    requestAnimationFrame(loop);
})();