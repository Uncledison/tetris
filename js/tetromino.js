// 테트로미노 모양 정의 (4가지 회전 상태)
const TETROMINOS = {
    'I': {
        shape: [
            [[0,0,0,0],
             [1,1,1,1],
             [0,0,0,0],
             [0,0,0,0]],
            
            [[0,0,1,0],
             [0,0,1,0],
             [0,0,1,0],
             [0,0,1,0]],
            
            [[0,0,0,0],
             [0,0,0,0],
             [1,1,1,1],
             [0,0,0,0]],
            
            [[0,1,0,0],
             [0,1,0,0],
             [0,1,0,0],
             [0,1,0,0]]
        ],
        color: 1
    },
    'O': {
        shape: [
            [[2,2],
             [2,2]],
            
            [[2,2],
             [2,2]],
            
            [[2,2],
             [2,2]],
            
            [[2,2],
             [2,2]]
        ],
        color: 2
    },
    'T': {
        shape: [
            [[0,3,0],
             [3,3,3],
             [0,0,0]],
            
            [[0,3,0],
             [0,3,3],
             [0,3,0]],
            
            [[0,0,0],
             [3,3,3],
             [0,3,0]],
            
            [[0,3,0],
             [3,3,0],
             [0,3,0]]
        ],
        color: 3
    },
    'S': {
        shape: [
            [[0,4,4],
             [4,4,0],
             [0,0,0]],
            
            [[0,4,0],
             [0,4,4],
             [0,0,4]],
            
            [[0,0,0],
             [0,4,4],
             [4,4,0]],
            
            [[4,0,0],
             [4,4,0],
             [0,4,0]]
        ],
        color: 4
    },
    'Z': {
        shape: [
            [[5,5,0],
             [0,5,5],
             [0,0,0]],
            
            [[0,0,5],
             [0,5,5],
             [0,5,0]],
            
            [[0,0,0],
             [5,5,0],
             [0,5,5]],
            
            [[0,5,0],
             [5,5,0],
             [5,0,0]]
        ],
        color: 5
    },
    'J': {
        shape: [
            [[6,0,0],
             [6,6,6],
             [0,0,0]],
            
            [[0,6,6],
             [0,6,0],
             [0,6,0]],
            
            [[0,0,0],
             [6,6,6],
             [0,0,6]],
            
            [[0,6,0],
             [0,6,0],
             [6,6,0]]
        ],
        color: 6
    },
    'L': {
        shape: [
            [[0,0,7],
             [7,7,7],
             [0,0,0]],
            
            [[0,7,0],
             [0,7,0],
             [0,7,7]],
            
            [[0,0,0],
             [7,7,7],
             [7,0,0]],
            
            [[7,7,0],
             [0,7,0],
             [0,7,0]]
        ],
        color: 7
    }
};

// 테트로미노 타입 배열
const TETROMINO_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// Piece 클래스
class Piece {
    constructor(type) {
        this.type = type;
        this.rotation = 0;
        this.shape = TETROMINOS[type].shape[this.rotation];
        this.color = TETROMINOS[type].color;
        this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
    }

    // 현재 블록 그리기
    draw() {
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    drawBlock(this.x + col, this.y + row, this.color);
                }
            }
        }
    }

    // 다음 블록 미리보기 그리기
    drawNext() {
        nextCtx.fillStyle = '#0f0f1e';
        nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

        const offsetX = (4 - this.shape[0].length) / 2;
        const offsetY = (4 - this.shape.length) / 2;

        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    drawBlock(offsetX + col, offsetY + row, this.color, nextCtx);
                }
            }
        }
    }

    // 블록 이동
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    // 회전
    rotate() {
        const prevRotation = this.rotation;
        this.rotation = (this.rotation + 1) % 4;
        this.shape = TETROMINOS[this.type].shape[this.rotation];

        // 회전 후 충돌 검사
        if (this.hasCollision()) {
            // 벽 킥 시도
            if (!this.tryWallKick()) {
                // 회전 불가능하면 원래대로 복구
                this.rotation = prevRotation;
                this.shape = TETROMINOS[this.type].shape[this.rotation];
            }
        }
    }

    // 벽 킥 시도 (회전 시 벽에 부딪히면 위치 조정)
    tryWallKick() {
        const kicks = [
            { x: 0, y: 0 },   // 현재 위치
            { x: -1, y: 0 },  // 왼쪽
            { x: 1, y: 0 },   // 오른쪽
            { x: 0, y: -1 },  // 위
            { x: -2, y: 0 },  // 왼쪽 2칸
            { x: 2, y: 0 }    // 오른쪽 2칸
        ];

        for (let kick of kicks) {
            this.x += kick.x;
            this.y += kick.y;

            if (!this.hasCollision()) {
                return true;
            }

            this.x -= kick.x;
            this.y -= kick.y;
        }

        return false;
    }

    // 충돌 검사
    hasCollision(offsetX = 0, offsetY = 0) {
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    const newX = this.x + col + offsetX;
                    const newY = this.y + row + offsetY;

                    // 벽 충돌
                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return true;
                    }

                    // 바닥이나 다른 블록 충돌
                    if (newY >= 0 && game.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // 블록을 보드에 고정
    lock() {
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    const boardY = this.y + row;
                    const boardX = this.x + col;
                    
                    if (boardY >= 0) {
                        game.board[boardY][boardX] = this.color;
                    }
                }
            }
        }
    }

    // 고스트 블록 (착지 위치 표시)
    drawGhost() {
        let ghostY = this.y;
        
        // 가능한 최하단 위치 찾기
        while (!this.hasCollision(0, ghostY - this.y + 1)) {
            ghostY++;
        }

        // 고스트 블록 그리기 (반투명)
        ctx.globalAlpha = 0.3;
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    drawBlock(this.x + col, ghostY + row, this.color);
                }
            }
        }
        ctx.globalAlpha = 1.0;
    }

    // 하드 드롭 (즉시 착지)
    hardDrop() {
        while (!this.hasCollision(0, 1)) {
            this.y++;
        }
    }
}

// 랜덤 테트로미노 생성
function getRandomPiece() {
    const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
    return new Piece(type);
}

// 7-bag 랜덤 시스템 (더 공평한 블록 분배)
let pieceBag = [];

function getNextPiece() {
    if (pieceBag.length === 0) {
        // 새로운 bag 생성
        pieceBag = [...TETROMINO_TYPES];
        
        // Fisher-Yates 셔플
        for (let i = pieceBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieceBag[i], pieceBag[j]] = [pieceBag[j], pieceBag[i]];
        }
    }
    
    const type = pieceBag.pop();
    return new Piece(type);
}

console.log('Tetromino 모듈 로드 완료!');
