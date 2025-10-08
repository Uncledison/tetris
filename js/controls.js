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
console.log('터치 컨트롤:');
console.log('  탭 : 회전');
console.log('  ← → 스와이프 : 좌우 이동');
console.log('  ↑ 스와이프 : 회전');
console.log('  ↓ 스와이프 : 하드 드롭');
