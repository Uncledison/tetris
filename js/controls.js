// 키보드 컨트롤
document.addEventListener('keydown', (e) => {
    if (!game.isRunning || game.isPaused) return;

    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            moveLeft();
            break;
        case 'ArrowRight':
            e.preventDefault();
            moveRight();
            break;
        case 'ArrowDown':
            e.preventDefault();
            softDrop();
            break;
        case 'ArrowUp':
        case ' ':  // 스페이스바
            e.preventDefault();
            rotatePiece();
            break;
        case 'Shift':
            e.preventDefault();
            hardDrop();
            break;
        case 'p':
        case 'P':
        case 'Escape':
            e.preventDefault();
            togglePause();
            break;
    }
});

// 터치 컨트롤 변수
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchStartTime = 0;
const SWIPE_THRESHOLD = 50;  // 스와이프 최소 거리
const TAP_THRESHOLD = 10;    // 탭 최대 거리
const TAP_TIME = 200;        // 탭 최대 시간 (ms)

// 터치 시작
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!game.isRunning || game.isPaused) return;

    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
}, { passive: false });

// 터치 이동
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// 터치 종료
canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!game.isRunning || game.isPaused) return;

    const touch = e.changedTouches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const touchTime = Date.now() - touchStartTime;

    // 탭 (회전)
    if (absX < TAP_THRESHOLD && absY < TAP_THRESHOLD && touchTime < TAP_TIME) {
        rotatePiece();
        return;
    }

    // 스와이프 판정
    if (Math.max(absX, absY) < SWIPE_THRESHOLD) {
        return;
    }

    // 가로 스와이프가 더 큰 경우
    if (absX > absY) {
        if (deltaX > 0) {
            moveRight();
        } else {
            moveLeft();
        }
    }
    // 세로 스와이프가 더 큰 경우
    else {
        if (deltaY > 0) {
            // 아래로 스와이프 - 하드 드롭
            hardDrop();
        } else {
            // 위로 스와이프 - 회전
            rotatePiece();
        }
    }
}, { passive: false });

// 버튼 컨트롤
const controlButtons = {
    left: document.getElementById('leftBtn'),
    right: document.getElementById('rightBtn'),
    down: document.getElementById('downBtn'),
    rotate: document.getElementById('rotateBtn'),
    drop: document.getElementById('dropBtn'),
    pause: document.getElementById('pauseBtn')
};

// 왼쪽 버튼
controlButtons.left.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('왼쪽 버튼 클릭');
    if (typeof moveLeft === 'function') moveLeft();
});

// 오른쪽 버튼
controlButtons.right.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('오른쪽 버튼 클릭');
    if (typeof moveRight === 'function') moveRight();
});

// 아래 버튼
controlButtons.down.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('아래 버튼 클릭');
    if (typeof softDrop === 'function') softDrop();
});

// 회전 버튼
controlButtons.rotate.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('회전 버튼 클릭');
    if (typeof rotatePiece === 'function') rotatePiece();
});

// 빠른 낙하 버튼
controlButtons.drop.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('빠른 낙하 버튼 클릭');
    if (typeof hardDrop === 'function') hardDrop();
});

// 버튼 터치 이벤트 (모바일 최적화)
Object.values(controlButtons).forEach(button => {
    // 터치 시작
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        button.style.transform = 'scale(0.95)';
    }, { passive: false });

    // 터치 종료
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        button.style.transform = 'scale(1)';
    }, { passive: false });

    // 터치 취소
    button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        button.style.transform = 'scale(1)';
    }, { passive: false });
});

// 연속 입력 (버튼 길게 누르기)
let holdInterval = null;

function startHold(action) {
    action();
    holdInterval = setInterval(action, 100);
}

function stopHold() {
    if (holdInterval) {
        clearInterval(holdInterval);
        holdInterval = null;
    }
}

// 왼쪽/오른쪽/아래 버튼 길게 누르기
controlButtons.left.addEventListener('mousedown', () => startHold(moveLeft));
controlButtons.left.addEventListener('mouseup', stopHold);
controlButtons.left.addEventListener('mouseleave', stopHold);

controlButtons.right.addEventListener('mousedown', () => startHold(moveRight));
controlButtons.right.addEventListener('mouseup', stopHold);
controlButtons.right.addEventListener('mouseleave', stopHold);

controlButtons.down.addEventListener('mousedown', () => startHold(softDrop));
controlButtons.down.addEventListener('mouseup', stopHold);
controlButtons.down.addEventListener('mouseleave', stopHold);

// 터치 길게 누르기
controlButtons.left.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startHold(moveLeft);
}, { passive: false });
controlButtons.left.addEventListener('touchend', stopHold);

controlButtons.right.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startHold(moveRight);
}, { passive: false });
controlButtons.right.addEventListener('touchend', stopHold);

controlButtons.down.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startHold(softDrop);
}, { passive: false });
controlButtons.down.addEventListener('touchend', stopHold);

// 화면 방향 변경 감지
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        render();
    }, 100);
});

// 창 크기 변경 시 렌더링
window.addEventListener('resize', () => {
    render();
});

// 게임이 백그라운드로 가면 자동 일시정지
document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.isRunning && !game.isPaused) {
        togglePause();
    }
});

console.log('Controls 모듈 로드 완료!');
console.log('키보드 컨트롤:');
console.log('  ← → : 좌우 이동');
console.log('  ↓ : 소프트 드롭');
console.log('  ↑ / Space : 회전');
console.log('  Shift : 하드 드롭');
console.log('  P / Esc : 일시정지');
console.log('');
console.log('터치 컨트롤:');
console.log('  탭 : 회전');
console.log('  ← → 스와이프 : 좌우 이동');
console.log('  ↑ 스와이프 : 회전');
console.log('  ↓ 스와이프 : 하드 드롭');
