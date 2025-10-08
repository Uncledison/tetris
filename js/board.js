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
    const linesCount = lines.length;
    
    // 진동 강도
    if (navigator.vibrate) {
        if (linesCount === 4) {
            navigator.vibrate([50, 30, 50, 30, 100]); // 테트리스: 강력한 진동
        } else if (linesCount >= 3) {
            navigator.vibrate([50, 20, 80]); // 트리플
        } else if (linesCount === 2) {
            navigator.vibrate([40, 20, 60]); // 더블
        } else {
            navigator.vibrate(50); // 싱글
        }
    }
    
    // 화면 흔들림 효과
    if (linesCount >= 3) {
        shakeScreen(linesCount === 4 ? 10 : 6);
    }
    
    // 1단계: 라인 밝게 빛나기 (50ms)
    lines.forEach(row => {
        for (let col = 0; col < COLS; col++) {
            ctx.fillStyle = linesCount === 4 ? '#ffffff' : '#ffff00';
            ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            
            // 외곽 글로우
            ctx.shadowColor = linesCount === 4 ? '#00ffff' : '#ffaa00';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = ctx.shadowColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            ctx.shadowBlur = 0;
        }
    });
    
    // 2단계: 크랙 효과 (100ms 후)
    setTimeout(() => {
        lines.forEach(row => {
            // 가운데부터 양쪽으로 크랙
            for (let col = 0; col < COLS; col++) {
                const distance = Math.abs(col - COLS/2);
                setTimeout(() => {
                    ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
                    ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }, distance * 10);
            }
        });
    }, 50);
    
    // 3단계: 폭발 파티클 (150ms 후)
    setTimeout(() => {
        createExplosionParticles(lines, linesCount);
    }, 100);
    
    // 테트리스 전용 효과
    if (linesCount === 4) {
        createLightningEffect();
        createShockwave();
    }
}

// 화면 흔들림
function shakeScreen(intensity) {
    const gameContainer = document.querySelector('.game-container');
    let shakeCount = 0;
    const shakeInterval = setInterval(() => {
        if (shakeCount >= 6) {
            clearInterval(shakeInterval);
            gameContainer.style.transform = 'translate(0, 0)';
            return;
        }
        const x = (Math.random() - 0.5) * intensity;
        const y = (Math.random() - 0.5) * intensity;
        gameContainer.style.transform = `translate(${x}px, ${y}px)`;
        shakeCount++;
    }, 50);
}

// 강화된 파티클 생성
function createExplosionParticles(lines, linesCount) {
    const particleCount = linesCount === 4 ? 50 : linesCount * 15;
    const colors = linesCount === 4 
        ? ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0099ff', '#ff00ff'] // 무지개
        : linesCount >= 3
        ? ['#ff00ff', '#ff0099', '#ff00cc'] // 핑크
        : linesCount === 2
        ? ['#ff7700', '#ff0000'] // 주황/빨강
        : ['#ffff00', '#ffaa00']; // 노랑
    
    lines.forEach(row => {
        for (let i = 0; i < particleCount / lines.length; i++) {
            const col = Math.random() * COLS;
            const x = col * BLOCK_SIZE;
            const y = row * BLOCK_SIZE;
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const size = 2 + Math.random() * 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            animateParticle(x, y, angle, speed, size, color);
        }
    });
}

// 개별 파티클 애니메이션
function animateParticle(startX, startY, angle, speed, size, color) {
    let x = startX;
    let y = startY;
    let life = 1.0;
    let frame = 0;
    
    const animate = () => {
        if (life <= 0 || frame > 30) return;
        
        x += Math.cos(angle) * speed;
        y += Math.sin(angle) * speed;
        life -= 0.05;
        frame++;
        
        ctx.save();
        ctx.globalAlpha = life;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size * life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        requestAnimationFrame(animate);
    };
    
    animate();
}

// 번개 효과 (테트리스 전용)
function createLightningEffect() {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    
    // 테두리 번쩍임
    canvas.style.boxShadow = '0 0 50px #00ffff, 0 0 100px #00ffff';
    setTimeout(() => {
        canvas.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
    }, 200);
    
    // 번개 선 그리기
    ctx.save();
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, 0);
            const segments = 5;
            for (let s = 0; s < segments; s++) {
                ctx.lineTo(
                    Math.random() * canvas.width,
                    (canvas.height / segments) * (s + 1)
                );
            }
            ctx.stroke();
        }, i * 50);
    }
    
    ctx.restore();
}

// 충격파 효과 (테트리스 전용)
function createShockwave() {
    let radius = 0;
    const centerX = canvas.width / 4;
    const centerY = canvas.height / 4;
    
    const animate = () => {
        if (radius > 200) return;
        
        ctx.save();
        ctx.strokeStyle = `rgba(0, 255, 255, ${1 - radius/200})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        
        radius += 10;
        requestAnimationFrame(animate);
    };
    
    animate();
}

// 점수 팝업 표시
function showScorePopup(points, linesCleared) {
    const popup = document.getElementById('scorePopup');
    const popupText = document.createElement('div');
    popupText.className = linesCleared >= 3 ? 'popup-text combo-text' : 'popup-text';
    
    let message = '';
    switch(linesCleared) {
        case 1: message = `+${points}`; break;
        case 2: message = `DOUBLE! +${points}`; break;
        case 3: message = `TRIPLE! +${points}`; break;
        case 4: message = `TETRIS! +${points}`; break;
    }
    
    popupText.textContent = message;
    popupText.style.left = '50%';
    popupText.style.top = '40%';
    popupText.style.transform = 'translateX(-50%)';
    
    popup.appendChild(popupText);
    
    setTimeout(() => {
        popup.removeChild(popupText);
    }, 1000);
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
    points *= game.level;
    game.score += points;
    
    // 점수 팝업 표시
    showScorePopup(points, linesCleared);
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
        // 블록 고정 시 진동
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
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
    if (!game.currentPiece || game.isPaused || !game.isRunning) return;
    
    if (!game.currentPiece.hasCollision(-1, 0)) {
        game.currentPiece.move(-1, 0);
        console.log('왼쪽 이동, 현재 x:', game.currentPiece.x);
        render();
    }
}

function moveRight() {
    if (!game.currentPiece || game.isPaused || !game.isRunning) return;
    
    if (!game.currentPiece.hasCollision(1, 0)) {
        game.currentPiece.move(1, 0);
        console.log('오른쪽 이동, 현재 x:', game.currentPiece.x);
        render();
    }
}

// 블록 회전
function rotatePiece() {
    if (!game.currentPiece || game.isPaused || !game.isRunning) {
        console.log('회전 불가:', { 
            hasPiece: !!game.currentPiece, 
            isPaused: game.isPaused,
            isRunning: game.isRunning 
        });
        return;
    }
    
    console.log('블록 회전!');
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
    if (!game.currentPiece || game.isPaused || !game.isRunning) {
        console.log('하드드롭 불가:', { 
            hasPiece: !!game.currentPiece, 
            isPaused: game.isPaused,
            isRunning: game.isRunning 
        });
        return;
    }
    
    console.log('하드 드롭!');
    
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
