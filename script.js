const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const livesElement = document.getElementById("lives");

const gameMessage = document.getElementById("gameMessage");
const startButton = document.getElementById("startButton");

const TILE = 40;

const maze = [
"##############",
"#............#",
"#.####.#####.#",
"#............#",
"#.##.#.###.#.#",
"#....#...#...#",
"####.#...#.###",
"####.#...#.###",
"#....#...#...#",
"#.##.#.###.#.#",
"#............#",
"#.####.#####.#",
"#............#",
"##############"
];

const ROWS = maze.length;
const COLS = maze[0].length;

canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

let score = 0;
let lives = 3;
let gameRunning = false;
let gameOver = false;

let highScore = Number(localStorage.getItem("pacmanHighScore")) || 0;

highScoreElement.textContent = highScore;

/* =========================
PAC-MAN
========================= */

let pacman = {
x: 1,
y: 1,
direction: "right",
nextDirection: "right"
};

/* =========================
FANTASMAS
========================= */

let ghosts = [
{
x: 6,
y: 6,
color: "#ff3030",
direction: "left"
},

{
    x: 8,
    y: 6,
    color: "#ff77c8",
    direction: "right"
},

{
    x: 7,
    y: 8,
    color: "#00e5ff",
    direction: "up"
}


];

/* =========================
PONTOS
========================= */

let pellets = [];

function createPellets() {

pellets = [];

for (let y = 0; y < ROWS; y++) {

    for (let x = 0; x < COLS; x++) {

        if (maze[y][x] === ".") {

            pellets.push({
                x: x,
                y: y
            });

        }

    }

}


}

createPellets();

/* =========================
DESENHAR LABIRINTO
========================= */

function drawMaze() {

for (let y = 0; y < ROWS; y++) {

    for (let x = 0; x < COLS; x++) {

        const tile = maze[y][x];

        if (tile === "#") {

            ctx.fillStyle = "#111d83";

            ctx.fillRect(
                x * TILE,
                y * TILE,
                TILE,
                TILE
            );

            ctx.strokeStyle = "#263cff";

            ctx.lineWidth = 2;

            ctx.strokeRect(
                x * TILE + 3,
                y * TILE + 3,
                TILE - 6,
                TILE - 6
            );

        }

    }

}


}

/* =========================
DESENHAR PONTOS
========================= */

function drawPellets() {

pellets.forEach(pellet => {

    ctx.beginPath();

    ctx.fillStyle = "#ffffff";

    ctx.arc(
        pellet.x * TILE + TILE / 2,
        pellet.y * TILE + TILE / 2,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();

});


}

/* =========================
DESENHAR PAC-MAN
========================= */

function drawPacman() {

const centerX = pacman.x * TILE + TILE / 2;
const centerY = pacman.y * TILE + TILE / 2;

let angle = 0;

if (pacman.direction === "right") {
    angle = 0;
}

if (pacman.direction === "down") {
    angle = Math.PI / 2;
}

if (pacman.direction === "left") {
    angle = Math.PI;
}

if (pacman.direction === "up") {
    angle = -Math.PI / 2;
}

ctx.save();

ctx.translate(centerX, centerY);
ctx.rotate(angle);

ctx.beginPath();

ctx.moveTo(0, 0);

ctx.arc(
    0,
    0,
    15,
    0.25,
    Math.PI * 2 - 0.25
);

ctx.fillStyle = "#ffe600";

ctx.shadowColor = "#ffe600";
ctx.shadowBlur = 15;

ctx.fill();

ctx.restore();


}

/* =========================
DESENHAR FANTASMAS
========================= */

function drawGhost(ghost) {

const x = ghost.x * TILE + TILE / 2;
const y = ghost.y * TILE + TILE / 2;

ctx.save();

ctx.fillStyle = ghost.color;

ctx.shadowColor = ghost.color;
ctx.shadowBlur = 10;

ctx.beginPath();

ctx.arc(
    x,
    y - 3,
    14,
    Math.PI,
    0
);

ctx.lineTo(x + 14, y + 15);

ctx.lineTo(x + 7, y + 9);

ctx.lineTo(x, y + 15);

ctx.lineTo(x - 7, y + 9);

ctx.lineTo(x - 14, y + 15);

ctx.closePath();

ctx.fill();

/* Olhos */

ctx.shadowBlur = 0;

ctx.fillStyle = "white";

ctx.beginPath();
ctx.arc(x - 6, y - 4, 4, 0, Math.PI * 2);
ctx.arc(x + 6, y - 4, 4, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = "#111";

ctx.beginPath();
ctx.arc(x - 6, y - 4, 2, 0, Math.PI * 2);
ctx.arc(x + 6, y - 4, 2, 0, Math.PI * 2);
ctx.fill();

ctx.restore();


}

/* =========================
MOVIMENTO
========================= */

function canMove(x, y) {

if (y < 0 || y >= ROWS || x < 0 || x >= COLS) {
    return false;
}

return maze[y][x] !== "#";


}

function movePacman() {

let dx = 0;
let dy = 0;

if (pacman.nextDirection === "right") {
    dx = 1;
}

if (pacman.nextDirection === "left") {
    dx = -1;
}

if (pacman.nextDirection === "up") {
    dy = -1;
}

if (pacman.nextDirection === "down") {
    dy = 1;
}

if (canMove(pacman.x + dx, pacman.y + dy)) {

    pacman.direction = pacman.nextDirection;

}

dx = 0;
dy = 0;

if (pacman.direction === "right") {
    dx = 1;
}

if (pacman.direction === "left") {
    dx = -1;
}

if (pacman.direction === "up") {
    dy = -1;
}

if (pacman.direction === "down") {
    dy = 1;
}

if (canMove(pacman.x + dx, pacman.y + dy)) {

    pacman.x += dx;
    pacman.y += dy;

}


}

/* =========================
MOVIMENTO DOS FANTASMAS
========================= */

function moveGhost(ghost) {

const directions = [
    { name: "up", dx: 0, dy: -1 },
    { name: "down", dx: 0, dy: 1 },
    { name: "left", dx: -1, dy: 0 },
    { name: "right", dx: 1, dy: 0 }
];

let possible = directions.filter(direction => {

    return canMove(
        ghost.x + direction.dx,
        ghost.y + direction.dy
    );

});

if (possible.length === 0) {
    return;
}

/* Evita voltar imediatamente */

let filtered = possible.filter(direction => {

    return direction.name !== oppositeDirection(ghost.direction);

});

if (filtered.length > 0) {
    possible = filtered;
}

/* Pequena chance de perseguir o Pac-Man */

let selected;

if (Math.random() < 0.55) {

    selected = possible.reduce((best, current) => {

        const currentDistance =
            Math.abs(
                pacman.x -
                (ghost.x + current.dx)
            ) +
            Math.abs(
                pacman.y -
                (ghost.y + current.dy)
            );

        const bestDistance =
            Math.abs(
                pacman.x -
                (ghost.x + best.dx)
            ) +
            Math.abs(
                pacman.y -
                (ghost.y + best.dy)
            );

        return currentDistance < bestDistance
            ? current
            : best;

    });

} else {

    selected =
        possible[
            Math.floor(
                Math.random() * possible.length
            )
        ];

}

ghost.direction = selected.name;

ghost.x += selected.dx;
ghost.y += selected.dy;


}

function oppositeDirection(direction) {

if (direction === "up") return "down";
if (direction === "down") return "up";
if (direction === "left") return "right";
if (direction === "right") return "left";


}

/* =========================
PEGAR PONTOS
========================= */

function collectPellet() {

const index = pellets.findIndex(
    pellet =>
        pellet.x === pacman.x &&
        pellet.y === pacman.y
);

if (index !== -1) {

    pellets.splice(index, 1);

    score += 10;

    updateScore();

}

if (pellets.length === 0) {

    winGame();

}


}

/* =========================
COLISÕES
========================= */

function checkGhostCollision() {

for (let ghost of ghosts) {

    if (
        ghost.x === pacman.x &&
        ghost.y === pacman.y
    ) {

        loseLife();

        return;

    }

}


}

/* =========================
PERDER VIDA
========================= */

function loseLife() {

lives--;

updateLives();

if (lives <= 0) {

    endGame();

    return;

}

resetPositions();


}

/* =========================
RESETAR POSIÇÕES
========================= */

function resetPositions() {

pacman.x = 1;
pacman.y = 1;

pacman.direction = "right";
pacman.nextDirection = "right";

ghosts[0].x = 6;
ghosts[0].y = 6;

ghosts[1].x = 8;
ghosts[1].y = 6;

ghosts[2].x = 7;
ghosts[2].y = 8;


}

/* =========================
GAME OVER
========================= */

function endGame() {

gameRunning = false;
gameOver = true;

saveHighScore();

gameMessage.style.display = "flex";

gameMessage.innerHTML = `
    <h2>GAME OVER</h2>

    <p>
        Pontuação final: <strong>${score}</strong>
    </p>

    <button id="restartButton">
        ↻ JOGAR NOVAMENTE
    </button>
`;

document
    .getElementById("restartButton")
    .addEventListener("click", startGame);


}

/* =========================
VITÓRIA
========================= */

function winGame() {

gameRunning = false;

saveHighScore();

gameMessage.style.display = "flex";

gameMessage.innerHTML = `
    <h2>VOCÊ VENCEU!</h2>

    <p>
        Labirinto completado!<br>
        Pontuação: <strong>${score}</strong>
    </p>

    <button id="restartButton">
        ▶ JOGAR NOVAMENTE
    </button>
`;

document
    .getElementById("restartButton")
    .addEventListener("click", startGame);


}

/* =========================
ATUALIZAR PLACAR
========================= */

function updateScore() {

scoreElement.textContent = score;


}

function updateLives() {

livesElement.textContent =
    "❤️".repeat(lives);


}

/* =========================
RECORDE
========================= */

function saveHighScore() {

if (score > highScore) {

    highScore = score;

    localStorage.setItem(
        "pacmanHighScore",
        highScore
    );

}

highScoreElement.textContent = highScore;


}

/* =========================
DESENHAR
========================= */

function draw() {

ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
);

drawMaze();
drawPellets();

drawPacman();

ghosts.forEach(drawGhost);


}

/* =========================
LOOP DO JOGO
========================= */

let lastMove = 0;

function gameLoop(timestamp) {

if (!gameRunning) {

    draw();

    requestAnimationFrame(gameLoop);

    return;

}

if (timestamp - lastMove > 160) {

    movePacman();

    ghosts.forEach(moveGhost);

    collectPellet();

    checkGhostCollision();

    lastMove = timestamp;

}

draw();

requestAnimationFrame(gameLoop);


}

/* =========================
INICIAR
========================= */

function startGame() {

score = 0;
lives = 3;

gameOver = false;
gameRunning = true;

createPellets();

resetPositions();

updateScore();
updateLives();

gameMessage.style.display = "none";


}

startButton.addEventListener(
"click",
startGame
);

/* =========================
TECLADO
========================= */

document.addEventListener(
"keydown",
function(event) {

    if (
        event.key === "ArrowUp" ||
        event.key.toLowerCase() === "w"
    ) {

        pacman.nextDirection = "up";

    }

    if (
        event.key === "ArrowDown" ||
        event.key.toLowerCase() === "s"
    ) {

        pacman.nextDirection = "down";

    }

    if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a"
    ) {

        pacman.nextDirection = "left";

    }

    if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
    ) {

        pacman.nextDirection = "right";

    }

}


);

/* =========================
INICIAR ANIMAÇÃO
========================= */

draw();

requestAnimationFrame(gameLoop);
