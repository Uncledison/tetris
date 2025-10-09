// 게임 상수
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Canvas 요소
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

// Canvas 크기 설정
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// 사운드 시스템 (전역)
window.sounds = {
    bgm: null,
    currentBgm: 1,
    volume: 0.3,
    sfxVolume: 0.5,
    
    // 사운드 파일 로드
    init() {
        this.move = new Audio('audio/flip.wav');
        this.rotate = new Audio('audio/beep.wav');
        this.drop = new Audio('audio/drop.wav');
        this.clear = new Audio('audio/success.mp3');
        this.levelUp = new Audio('audio/level-up.wav');
        this.gameStart = new Audio('audio/beep.wav');
        this.whoosh = new Audio('audio/whoosh.wav');
        
        // BGM
        this.bgm1 = new Audio('audio/bgm01.mp3');
        this.bgm2 = new Audio('audio/bgm02.mp3');
        
        // BGM 설정
        this.bgm1.loop = true;
        this.bgm2.loop = true;
        this.bgm1.volume = this.volume;
        this.bgm2.volume = this.volume;
        
        // 효과음 볼륨 설정
        this.move.volume = this.sfxVolume * 0.3;
        this.rotate.volume = this.sfxVolume * 0.4;
        this.drop.volume = this.sfxVolume * 0.6;
        this.clear.volume = this.sfxVolume * 0.7;
        this.levelUp.volume = this.sfxVolume * 0.8;
        this.gameStart.volume = this.sfxVolume * 0.5;
        this.whoosh.volume = this.sfxVolume * 0.5;
        
        console.log('사운드 시스템 초기화 완료');
    },
    
    // 효과음 재생
    play(soundName) {
        try {
            if (this[soundName]) {
                this[soundName].currentTime = 0;
                this[soundName].play().catch(e => console.log('사운드 재생 실패:', e));
            }
        } catch (e) {
            console.log('사운드 재생 오류:', e);
        }
    },
    
    // BGM 시작
    startBGM() {
        this.stopBGM();
        this.bgm = this.currentBgm === 1 ? this.bgm1 : this.bgm2;
        this.bgm.currentTime = 0;
        this.bgm.play().catch(e => console.log('BGM 재생 실패:', e));
    },
    
    // BGM 정지
    stopBGM() {
        if (this.bgm1) this.bgm1.pause();
        if (this.bgm2) this.bgm2.pause();
    },
    
    // BGM 전환
    switchBGM() {
        this.currentBgm = this.currentBgm === 1 ? 2 : 1;
        this.startBGM();
    },
    
    // 볼륨 조절
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.bgm1) this.bgm1.volume = this.volume;
        if (this.bgm2) this.bgm2.volume = this.volume;
    },
    
    // 효과음 볼륨 조절
    setSFXVolume(vol) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
        if (this.move) this.move.volume = this.sfxVolume * 0.3;
        if (this.rotate) this.rotate.volume = this.sfxVolume * 0.4;
        if (this.drop) this.drop.volume = this.sfxVolume * 0.6;
        if (this.clear) this.clear.volume = this.sfxVolume * 0.7;
        if (this.levelUp) this.levelUp.volume = this.sfxVolume * 0.8;
        if (this.gameStart) this.gameStart.volume = this.sfxVolume * 0.5;
        if (this.whoosh) this.whoosh.volume = this.sfxVolume * 0.5;
    }
};

// 게임 상태
let game = {
    score: 0,
    level: 1,
    lines: 0,
    isRunning: false,
    isPaused: false,
    gameLoop: null,
    board: [],
    currentPiece: null,
    nextPiece: null
};

// DOM 요소
const elements = {
    score: document.getElementById('score'),
    level: document.getElementById('level'),
    lines: document.getElementById('lines'),
    gameOver: document.getElementById('gameOver'),
    finalScore: document.getElementById('finalScore'),
    highScore: document.getElementById('highScore'),
    highScoreDisplay: document.getElementById('highScoreDisplay'),
    startScreen: document.getElementById('startScreen'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn')
};

// 최고 점수 로드
function loadHighScore() {
    const highScore = localStorage.getItem('tetrisHighScore') || 0;
    elements.highScore.textContent = highScore;
    elements.highScoreDisplay.textContent = highScore;
    return parseInt(highScore);
}

// 최고 점수 저장
function saveHighScore(score) {
    const currentHigh = loadHighScore();
    if (score > currentHigh) {
        localStorage.setItem('tetrisHighScore', score);
        elements.highScore.textContent = score;
        elements.highScoreDisplay.textContent = score;
    }
}

// 게임 보드 초기화
function initBoard() {
    game.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// 게임 보드 그리기
function drawBoard() {
    // 배경 그리기
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 그리드 그리기
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            
            // 보드에 고정된 블록 그리기
            if (game.board[row][col]) {
                drawBlock(col, row, game.board[row][col]);
            }
        }
    }
}

// 블록 그리기 - 크리스탈 큐브 스타일 💎
function drawBlock(x, y, color, context = ctx) {
    const colors = {
        1: '#00f0ff', // I - 시안
        2: '#f0f000', // O - 노랑
        3: '#a000f0', // T - 보라
        4: '#00f000', // S - 초록
        5: '#f00000', // Z - 빨강
        6: '#0000f0', // J - 파랑
        7: '#f0a000'  // L - 주황
    };

    const blockColor = colors[color] || '#ffffff';
    const size = BLOCK_SIZE;
    const px = x * size;
    const py = y * size;

    // 💎 외곽 크리스탈 글로우 (반투명)
    context.save();
    const gradient1 = context.createRadialGradient(
        px + size * 0.3, py + size * 0.3, 0,
        px + size * 0.5, py + size * 0.5, size * 0.7
    );
    gradient1.addColorStop(0, blockColor + '60');
    gradient1.addColorStop(1, 'transparent');
    context.fillStyle = gradient1;
    context.fillRect(px - 2, py - 2, size + 4, size + 4);
    context.restore();

    // 💎 메인 크리스탈 본체 (그라데이션)
    context.save();
    const gradient2 = context.createLinearGradient(px, py, px + size, py + size);
    gradient2.addColorStop(0, blockColor + 'ee');
    gradient2.addColorStop(0.5, blockColor + 'aa');
    gradient2.addColorStop(1, blockColor + 'ee');
    context.fillStyle = gradient2;
    context.fillRect(px, py, size, size);
    context.restore();

    // 💎 크리스탈 하이라이트 (왼쪽 상단)
    context.save();
    const highlight = context.createRadialGradient(
        px + size * 0.3, py + size * 0.3, 0,
        px + size * 0.3, py + size * 0.3, size * 0.4
    );
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = highlight;
    context.fillRect(px, py, size * 0.6, size * 0.6);
    context.restore();

    // 💎 크리스탈 패싯 (상단)
    context.save();
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(px, py, size, size * 0.35);
    context.restore();

    // 💎 크리스탈 패싯 (하단 그림자)
    context.save();
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(px, py + size * 0.65, size, size * 0.35);
    context.restore();

    // 💎 크리스탈 테두리 (강조)
    context.save();
    context.strokeStyle = blockColor;
    context.lineWidth = 2;
    context.shadowColor = blockColor;
    context.shadowBlur = 8;
    context.strokeRect(px + 1, py + 1, size - 2, size - 2);
    context.restore();

    // 💎 반짝이는 별 파티클 (랜덤 위치)
    context.save();
    const sparkleTime = Date.now() / 1000;
    for (let i = 0; i < 3; i++) {
        const sparkleX = px + size * (0.2 + i * 0.3);
        const sparkleY = py + size * (0.3 + i * 0.25);
        const opacity = Math.abs(Math.sin(sparkleTime * 3 + i * 2));
        
        if (opacity > 0.5) {
            context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            context.shadowColor = '#ffffff';
            context.shadowBlur = 4;
            
            // 작은 십자 반짝임
            context.fillRect(sparkleX - 1, sparkleY - 3, 2, 6);
            context.fillRect(sparkleX - 3, sparkleY - 1, 6, 2);
        }
    }
    context.restore();

    // 💎 외곽 크리스탈 광채
    context.save();
    context.strokeStyle = blockColor + '80';
    context.lineWidth = 1;
    context.shadowColor = blockColor;
    context.shadowBlur = 5;
    context.strokeRect(px, py, size, size);
    context.restore();
}

// UI 업데이트
function updateUI() {
    // 점수에 애니메이션 효과
    elements.score.style.transform = 'scale(1.1)';
    setTimeout(() => {
        elements.score.style.transform = 'scale(1)';
    }, 150);
    
    elements.score.textContent = game.score.toLocaleString();
    elements.level.textContent = game.level;
    elements.lines.textContent = game.lines;
}

// 게임 초기화
function initGame() {
    initBoard();
    game.score = 0;
    game.level = 1;
    game.lines = 0;
    game.isRunning = false;
    game.isPaused = false;
    updateUI();
    loadHighScore();
    drawBoard();
}

// 게임 시작
function startGame() {
    console.log('startGame 함수 호출됨');
    
    // 시작 효과음
    sounds.play('gameStart');
    
    elements.startScreen.classList.add('hidden');
    elements.gameOver.classList.add('hidden');
    
    // 게임 초기화
    initGame();
    
    // 게임 보드 재설정
    game.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    
    // 첫 블록 생성
    if (typeof getNextPiece === 'function') {
        game.currentPiece = getNextPiece();
        game.nextPiece = getNextPiece();
        game.nextPiece.drawNext();
        console.log('블록 생성 완료');
    } else {
        console.error('getNextPiece 함수를 찾을 수 없습니다!');
    }
    
    game.isRunning = true;
    
    // BGM 시작
    setTimeout(() => {
        sounds.startBGM();
    }, 100);
    
    // 게임 루프 시작
    if (typeof startGameLoop === 'function') {
        startGameLoop();
        console.log('게임 루프 시작');
    } else {
        console.error('startGameLoop 함수를 찾을 수 없습니다!');
    }
    
    render();
    
    console.log('게임 시작 완료!');
}

// 게임 오버
function gameOver() {
    game.isRunning = false;
    if (game.gameLoop) {
        clearInterval(game.gameLoop);
    }
    
    // BGM 정지
    sounds.stopBGM();
    
    elements.finalScore.textContent = game.score;
    saveHighScore(game.score);
    elements.gameOver.classList.remove('hidden');
    
    console.log('게임 오버! 최종 점수:', game.score);
}

// 일시정지 토글
function togglePause() {
    if (!game.isRunning) return;
    
    game.isPaused = !game.isPaused;
    
    if (game.isPaused) {
        console.log('게임 일시정지');
        // BGM 일시정지
        if (sounds.bgm) sounds.bgm.pause();
    } else {
        console.log('게임 재개');
        // BGM 재개
        if (sounds.bgm) sounds.bgm.play();
        render();
    }
}

// 이벤트 리스너
elements.startBtn.addEventListener('click', (e) => {
    console.log('시작 버튼 클릭됨!');
    e.preventDefault();
    startGame();
});

elements.restartBtn.addEventListener('click', (e) => {
    console.log('재시작 버튼 클릭됨!');
    e.preventDefault();
    startGame();
});

// 사운드 시스템 초기화
sounds.init();

// 초기화
initGame();

console.log('Tetris 게임 초기화 완료!');
console.log(`Canvas 크기: ${canvas.width}x${canvas.height}`);
console.log(`보드 크기: ${COLS}x${ROWS}`);
