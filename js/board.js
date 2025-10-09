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
        // 🔊 라인 클리어 사운드 재생
        console.log('라인 클리어 사운드 재생 시도, 줄:', linesCleared);
        if (window.sounds) {
            window.sounds.play('clear');
        } else {
            console.error('sounds 객체를 찾을 수 없습니다!');
        }
        
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
                // 🔊 레벨업 사운드 재생
                console.log('레벨업 사운드 재생 시도');
                if (window.sounds) {
                    window.sounds.play('levelUp');
                } else {
                    console.error('sounds 객체를 찾을 수 없습니다!');
                }
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
    
    // 🔊 테트리스 특별 효과음
    if (linesCount === 4) {
        console.log('테트리스 특별 사운드 재생 시도');
        if (window.sounds) {
            window.sounds.play('whoosh');
        } else {
            console.error('sounds 객체를 찾을 수 없습니다!');
        }
    }
    
    // 💥 진동 강도 대폭 증가
    if (navigator.vibrate) {
        if (linesCount === 4) {
            navigator.vibrate([100, 50, 100, 50, 150]); // 테트리스: 더 강력한 진동
        } else if (linesCount >= 3) {
            navigator.vibrate([80, 40, 120]); // 트리플
        } else if (linesCount === 2) {
            navigator.vibrate([60, 30, 90]); // 더블
        } else {
            navigator.vibrate(70); // 싱글
        }
    }
    
    // 💥 화면 흔들림 효과 - 3배 강화!
    const shakeIntensity = linesCount === 4 ? 30 : linesCount === 3 ? 20 : linesCount === 2 ? 10 : 5;
    shakeScreen(shakeIntensity);
    
    // 1단계: 화면 전체 플래시 (테트리스는 화면 전체)
    if (linesCount === 4) {
        // 화면 전체 하얗게 번쩍!
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // 라인 밝게 빛나기
    lines.forEach(row => {
        for (let col = 0; col < COLS; col++) {
            // 색상 강화
            if (linesCount === 4) {
                ctx.fillStyle = '#ffffff'; // 테트리스: 순백
            } else if (linesCount === 3) {
                ctx.fillStyle = '#ff0066'; // 트리플: 핫핑크
            } else if (linesCount === 2) {
                ctx.fillStyle = '#ff9900'; // 더블: 오렌지
            } else {
                ctx.fillStyle = '#ffff00'; // 싱글: 노랑
            }
            ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            
            // 외곽 글로우 강화
            ctx.shadowColor = linesCount === 4 ? '#00ffff' : '#ffaa00';
            ctx.shadowBlur = linesCount === 4 ? 30 : 20; // 더 강하게
            ctx.strokeStyle = ctx.shadowColor;
            ctx.lineWidth = 4; // 더 두껍게
            ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            ctx.shadowBlur = 0;
        }
    });
    
    // 2단계: 크랙 효과 (10ms 후 - 5배 빠르게!)
    setTimeout(() => {
        lines.forEach(row => {
            for (let col = 0; col < COLS; col++) {
                const distance = Math.abs(col - COLS/2);
                setTimeout(() => {
                    ctx.fillStyle = linesCount === 4 ? 'rgba(0, 255, 255, 0.9)' : 'rgba(255, 100, 0, 0.8)';
                    ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }, distance * 5); // 2배 빠르게
            }
        });
    }, 10); // 5배 빠르게!
    
    // 3단계: 대폭발 파티클 (20ms 후 - 7배 빠르게!)
    setTimeout(() => {
        createMassiveExplosion(lines, linesCount);
    }, 20); // 5배 빠르게!
    
    // 테트리스 전용 효과
    if (linesCount === 4) {
        createEnhancedLightning();
        createTripleShockwave();
        
        // "TETRIS!" 텍스트
        showTetrisText();
    }
}

// 💥 대폭발 파티클 생성 (6배 증가!)
function createMassiveExplosion(lines, linesCount) {
    // 파티클 수 대폭 증가!
    const particleCount = linesCount === 4 ? 300 : linesCount === 3 ? 150 : linesCount === 2 ? 100 : 50;
    
    const colors = linesCount === 4 
        ? ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0099ff', '#4400ff', '#ff00ff'] // 무지개 7색
        : linesCount >= 3
        ? ['#ff00ff', '#ff0099', '#ff00cc', '#ff3366'] // 핑크 계열
        : linesCount === 2
        ? ['#ff7700', '#ff0000', '#ff4400'] // 주황/빨강
        : ['#ffff00', '#ffaa00', '#ffcc00']; // 노랑
    
    lines.forEach(row => {
        for (let i = 0; i < particleCount / lines.length; i++) {
            const col = Math.random() * COLS;
            const x = col * BLOCK_SIZE;
            const y = row * BLOCK_SIZE;
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 10; // 3배 빠르게!
            const size = 3 + Math.random() * 5; // 더 크게!
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            animateParticle(x, y, angle, speed, size, color, 25); // 짧게! 25프레임
        }
    });
}

// 개별 파티클 애니메이션 (빠르게 사라짐)
function animateParticle(startX, startY, angle, speed, size, color, maxLife = 25) {
    let x = startX;
    let y = startY;
    let life = 1.0;
    let frame = 0;
    const fadeSpeed = 1.2 / maxLife; // 더 빠르게 페이드
    
    const animate = () => {
        if (life <= 0 || frame > maxLife) return;
        
        x += Math.cos(angle) * speed;
        y += Math.sin(angle) * speed;
        life -= fadeSpeed;
        frame++;
        
        // 빠르게 페이드 아웃
        const alpha = Math.max(0, life * life); // 제곱으로 더 빠르게
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        
        // 별 모양으로 그리기
        ctx.beginPath();
        ctx.arc(x, y, size * life, 0, Math.PI * 2);
        ctx.fill();
        
        // 외곽 글로우 (약하게)
        if (alpha > 0.5) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.arc(x, y, size * life * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        requestAnimationFrame(animate);
    };
    
    animate();
}

// 화면 흔들림 강화 (더 빠르게)
function shakeScreen(intensity) {
    const gameContainer = document.querySelector('.game-container');
    let shakeCount = 0;
    const maxShakes = intensity > 20 ? 8 : 5; // 횟수 줄임
    
    const shakeInterval = setInterval(() => {
        if (shakeCount >= maxShakes) {
            clearInterval(shakeInterval);
            gameContainer.style.transform = 'translate(0, 0)';
            return;
        }
        const x = (Math.random() - 0.5) * intensity;
        const y = (Math.random() - 0.5) * intensity;
        gameContainer.style.transform = `translate(${x}px, ${y}px)`;
        shakeCount++;
    }, 20); // 더 빠르게 (30ms → 20ms)
}

// 강화된 번개 효과 (10개, 더 두껍게)
function createEnhancedLightning() {
    const canvas = document.getElementById('gameCanvas');
    
    // 테두리 번쩍임 강화
    canvas.style.boxShadow = '0 0 80px #00ffff, 0 0 150px #00ffff, 0 0 200px #00ffff';
    setTimeout(() => {
        canvas.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
    }, 300);
    
    // 번개 선 그리기 (10개!)
    ctx.save();
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            ctx.strokeStyle = i % 2 === 0 ? '#00ffff' : '#ffffff';
            ctx.lineWidth = 5; // 더 두껍게
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 30;
            
            ctx.beginPath();
            let startX = Math.random() * canvas.width;
            ctx.moveTo(startX, 0);
            
            const segments = 8; // 더 많은 세그먼트
            for (let s = 0; s < segments; s++) {
                const nextX = startX + (Math.random() - 0.5) * 60;
                const nextY = (canvas.height / segments) * (s + 1);
                ctx.lineTo(nextX, nextY);
                startX = nextX;
            }
            ctx.stroke();
        }, i * 30);
    }
    
    ctx.restore();
}

// 3중 충격파
function createTripleShockwave() {
    const centerX = canvas.width / 4;
    const centerY = canvas.height / 4;
    
    // 3개의 충격파를 시차를 두고 발생
    [0, 100, 200].forEach((delay, index) => {
        setTimeout(() => {
            let radius = 0;
            const maxRadius = 250;
            const colors = ['#00ffff', '#ffffff', '#00ffff'];
            
            const animate = () => {
                if (radius > maxRadius) return;
                
                ctx.save();
                ctx.strokeStyle = colors[index % colors.length];
                ctx.lineWidth = 4;
                ctx.globalAlpha = 1 - (radius / maxRadius);
                ctx.shadowColor = colors[index % colors.length];
                ctx.shadowBlur = 20;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                
                radius += 15; // 더 빠르게
                requestAnimationFrame(animate);
            };
            
            animate();
        }, delay);
    });
}

// "TETRIS!" 텍스트 표시
function showTetrisText() {
    const popup = document.getElementById('scorePopup');
    const tetrisText = document.createElement('div');
    tetrisText.style.position = 'absolute';
    tetrisText.style.left = '50%';
    tetrisText.style.top = '30%';
    tetrisText.style.transform = 'translateX(-50%)';
    tetrisText.style.fontSize = '4rem';
    tetrisText.style.fontWeight = 'bold';
    tetrisText.style.color = '#00ffff';
    tetrisText.style.textShadow = '0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff';
    tetrisText.style.animation = 'tetrisPop 1s ease-out';
    tetrisText.textContent = 'TETRIS!';
    
    popup.appendChild(tetrisText);
    
    setTimeout(() => {
        if (popup.contains(tetrisText)) {
            popup.removeChild(tetrisText);
        }
    }, 1000);
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
        // 🔊 블록 착지 사운드
        console.log('착지 사운드 재생 시도');
        if (window.sounds) {
            window.sounds.play('drop');
        } else {
            console.error('sounds 객체를 찾을 수 없습니다!');
        }
        
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
        // 🔊 이동 사운드
        console.log('이동 사운드 재생 시도');
        if (window.sounds) {
            window.sounds.play('move');
        } else {
            console.error('sounds 객체를 찾을 수 없습니다!');
        }
        game.currentPiece.move(-1, 0);
        console.log('왼쪽 이동, 현재 x:', game.currentPiece.x);
        render();
    }
}

function moveRight() {
    if (!game.currentPiece || game.isPaused || !game.isRunning) return;
    
    if (!game.currentPiece.hasCollision(1, 0)) {
        // 🔊 이동 사운드
        console.log('이동 사운드 재생 시도');
        if (window.sounds) {
            window.sounds.play('move');
        } else {
            console.error('sounds 객체를 찾을 수 없습니다!');
        }
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
    
    // 🔊 회전 사운드
    console.log('회전 사운드 재생 시도');
    if (window.sounds) {
        window.sounds.play('rotate');
    } else {
        console.error('sounds 객체를 찾을 수 없습니다!');
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
    
    // 🔊 하드 드롭 사운드 (drop 사운드는 착지 시 자동 재생됨)
    
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
