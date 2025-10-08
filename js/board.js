// 점수 계산 상수
const POINTS = {
    SINGLE: 100,      // 1줄
    DOUBLE: 300,      // 2줄
    TRIPLE: 500,      // 3줄
    TETRIS: 800,      // 4줄
    SOFT_DROP: 1,     // 소프트 드롭 (한 칸당)
    HARD_DROP: 2      // 하드 드롭 (한 칸당)
};

// 레벨별 낙하 속도 (밀리초)
const LEVEL_SPEEDS = [
    800,  // Level 1
    720,  // Level 2
    630,  // Level 3
    550,  // Level 4
    470,  // Level 5
    380,  // Level 6
    300,  // Level 7
    220,  // Level 8
    130,  // Level 9
    100,  // Level 10
    80,   // Level 11+
];

// 줄 제거 확인
function checkLines() {
    let linesCleared = 0;
    let linesToClear = [];

    // 완성된 줄 찾기
    for (let row = ROWS - 1; row >= 0; row--) {
        if (game.board[row].every(cell => cell !== 0)) {
            linesToClear.push(row);
            linesCleared++;
        }
    }

    // 줄 제거 애니메이션 및 처리
    if (linesCleared > 0) {
        // 애니메이션 효과
        animateLinesClear(linesToClear);
        
        // 줄 제거
        setTimeout(() => {
            removeLines(linesToClear);
            
            // 점수 계산
            updateScore(linesCleared);
            
            // 줄 수 업데이트
            game.lines += linesCleared;
            
            // 레벨 업 (10줄마다)
            const newLevel = Math.floor(game.lines / 10) + 1;
            if (newLevel > game.level) {
                game.level = newLevel;
                updateGameSpeed();
            }
            
            updateUI();
        }, 200);
    }

    return linesCleared;
}

// 줄 제거 애니메이션
function animateLinesClear(lines) {
    lines.forEach(row => {
        for (let col = 0; col < COLS; col++) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    });
}

// 줄 제거 및 위 블록 내리기
function removeLines(linesToClear) {
    // 제거할 줄을 위에서부터 정렬
    linesToClear.sort((a, b) => a - b);

    // 각 줄 제거
    linesToClear.forEach(lineIndex => {
        // 해당 줄 삭제
        game.board.splice(lineIndex, 1);
        // 맨 위에 빈 줄 추가
        game.board.unshift(Array(COLS).fill(0));
    });
}

// 점수 업데이트
function updateScore(linesCleared) {
    let points = 0;

    switch(linesCleared) {
        case 1:
            points = POINTS.SINGLE;
            break;
        case 2:
            points = POINTS.DOUBLE;
            break;
        case 3:
            points = POINTS.TRIPLE;
            break;
        case 4:
            points = POINTS.TETRIS;
            break;
    }

    // 레벨 배수 적용
    game.score += points * game.level;
}

// 게임 속도 업데이트
function updateGameSpeed() {
    if (game.gameLoop) {
        clearInterval(game.gameLoop);
        startGameLoop();
    }
}

// 게임 속도 가져오기
function getGameSpeed() {
    const speedIndex = Math.min(game.level - 1, LEVEL_SPEEDS.length - 1);
    return LEVEL_SPEEDS[speedIndex];
}

// 블록 아래로 이동
function moveDown() {
    if (!game.currentPiece) return false;

    if (!game.currentPiece.hasCollision(0, 1)) {
        game.currentPiece.move(0, 1);
        return true;
    } else {
        // 블록 고정
        game.currentPiece.lock();
        
        // 줄 제거 확인
        checkLines();
        
        // 새 블록 생성
        spawnNewPiece();
        
        return false;
    }
}

// 블록 좌우 이동
function moveLeft() {
    if (!game.currentPiece || game.isPaused) return;
    
    if (!game.currentPiece.hasCollision(-1, 0)) {
        game.currentPiece.move(-1, 0);
        render();
    }
}

function moveRight() {
    if (!game.currentPiece || game.isPaused) return;
    
    if (!game.currentPiece.hasCollision(1, 0)) {
        game.currentPiece.move(1, 0);
        render();
    }
}

// 블록 회전
function rotatePiece() {
    if (!game.currentPiece || game.isPaused) return;
    
    game.currentPiece.rotate();
    render();
}

// 소프트 드롭 (빠른 낙하)
function softDrop() {
    if (!game.currentPiece || game.isPaused) return;
    
    if (moveDown()) {
        game.score += POINTS.SOFT_DROP;
        updateUI();
        render();
    }
}

// 하드 드롭 (즉시 착지)
function hardDrop() {
    if (!game.currentPiece || game.isPaused) return;
    
    let dropDistance = 0;
    while (!game.currentPiece.hasCollision(0, 1)) {
        game.currentPiece.move(0, 1);
        dropDistance++;
    }
    
    game.score += POINTS.HARD_DROP * dropDistance;
    
    // 블록 고정
    game.currentPiece.lock();
    checkLines();
    spawnNewPiece();
    
    updateUI();
    render();
}

// 새 블록 생성
function spawnNewPiece() {
    game.currentPiece = game.nextPiece;
    game.nextPiece = getNextPiece();
    
    // 다음 블록 미리보기
    game.nextPiece.drawNext();
    
    // 게임 오버 체크
    if (game.currentPiece.hasCollision()) {
        gameOver();
    }
}

// 게임 루프 시작
function startGameLoop() {
    game.gameLoop = setInterval(() => {
        if (!game.isPaused && game.isRunning) {
            moveDown();
            render();
        }
    }, getGameSpeed());
}

// 렌더링
function render() {
    if (!game.isRunning) return;
    
    // 보드 그리기
    drawBoard();
    
    // 현재 블록이 있으면 고스트와 블록 그리기
    if (game.currentPiece) {
        game.currentPiece.drawGhost();
        game.currentPiece.draw();
    }
}

// 보드 초기화 (게임 시작 시)
function resetBoard() {
    game.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// 보드가 가득 찼는지 확인
function isBoardFull() {
    return game.board[0].some(cell => cell !== 0);
}

// 보드 상태 출력 (디버깅용)
function printBoard() {
    console.log('=== 게임 보드 ===');
    game.board.forEach((row, index) => {
        console.log(`${index.toString().padStart(2)}: ${row.map(cell => cell || '.').join(' ')}`);
    });
}

// 통계 정보
function getStats() {
    return {
        score: game.score,
        level: game.level,
        lines: game.lines,
        speed: getGameSpeed()
    };
}

console.log('Board 모듈 로드 완료!');
