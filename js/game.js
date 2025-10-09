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

// 사운드 시스템
const sounds = {
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

// 블록 그리기
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

    // 블록 본체
    context.fillStyle = blockColor;
    context.fillRect(x * size, y * size, size, size);

    // 하이라이트 (3D 효과)
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(x * size, y * size, size, size * 0.3);
    context.fillRect(x * size, y * size, size * 0.3, size);

    // 그림자
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(x * size, y * size + size * 0.7, size, size * 0.3);
    context.fillRect(x * size + size * 0.7, y * size, size * 0.3, size);

    // 테두리
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.lineWidth = 2;
    context.strokeRect(x * size, y * size, size, size);
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
