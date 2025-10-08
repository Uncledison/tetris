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
    startScreen: document.getElementById('startScreen'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    pauseBtn: document.getElementById('pauseBtn')
};

// 최고 점수 로드
function loadHighScore() {
    const highScore = localStorage.getItem('tetrisHighScore') || 0;
    elements.highScore.textContent = highScore;
    return parseInt(highScore);
}

// 최고 점수 저장
function saveHighScore(score) {
    const currentHigh = loadHighScore();
    if (score > currentHigh) {
        localStorage.setItem('tetrisHighScore', score);
        elements.highScore.textContent = score;
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
    elements.score.textContent = game.score;
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
    elements.startScreen.classList.add('hidden');
    elements.gameOver.classList.add('hidden');
    initGame();
    game.isRunning = true;
    
    // 여기에 게임 루프가 추가될 예정
    console.log('게임 시작!');
    drawBoard();
}

// 게임 오버
function gameOver() {
    game.isRunning = false;
    if (game.gameLoop) {
        clearInterval(game.gameLoop);
    }
    
    elements.finalScore.textContent = game.score;
    saveHighScore(game.score);
    elements.gameOver.classList.remove('hidden');
}

// 일시정지 토글
function togglePause() {
    if (!game.isRunning) return;
    
    game.isPaused = !game.isPaused;
    elements.pauseBtn.textContent = game.isPaused ? '▶ 계속' : '⏸ 일시정지';
    
    if (game.isPaused) {
        console.log('게임 일시정지');
    } else {
        console.log('게임 재개');
    }
}

// 이벤트 리스너
elements.startBtn.addEventListener('click', startGame);
elements.restartBtn.addEventListener('click', startGame);
elements.pauseBtn.addEventListener('click', togglePause);

// 초기화
initGame();

console.log('Tetris 게임 초기화 완료!');
console.log(`Canvas 크기: ${canvas.width}x${canvas.height}`);
console.log(`보드 크기: ${COLS}x${ROWS}`);
