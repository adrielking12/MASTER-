const gameDefinitions = [
  { id: "hangman", label: "Hangman (Word Guessing)", init: initHangman },
  { id: "tictactoe", label: "Smart Tic-Tac-Toe", init: initTicTacToe },
  { id: "mathbattle", label: "Math Battle Game", init: initMathBattle },
  { id: "maze", label: "Maze Escape", init: initMaze },
  { id: "brick", label: "Brick Breaker Deluxe", init: initBrickBreaker },
  { id: "racing", label: "Top-Down Car Racing", init: initRacing }
];

const state = {
  currentGame: null,
  initialized: new Set()
};

const menu = document.getElementById("gameMenu");
const backButton = document.getElementById("backToMenu");
const welcomeCard = document.getElementById("menuWelcome");

function buildMenu() {
  gameDefinitions.forEach((game) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.textContent = game.label;
    button.className = "primary";
    button.addEventListener("click", () => openGame(game.id));
    li.appendChild(button);
    menu.appendChild(li);
  });
}

function hideAllGames() {
  gameDefinitions.forEach((game) => {
    document.getElementById(game.id).classList.add("hidden");
  });
}

function openGame(gameId) {
  hideAllGames();
  welcomeCard.classList.add("hidden");
  backButton.classList.remove("hidden");

  const selected = gameDefinitions.find((g) => g.id === gameId);
  if (!selected) return;

  const panel = document.getElementById(gameId);
  panel.classList.remove("hidden");

  if (!state.initialized.has(gameId)) {
    selected.init(panel);
    state.initialized.add(gameId);
  }
  state.currentGame = gameId;
}

function resetToMenu() {
  hideAllGames();
  welcomeCard.classList.remove("hidden");
  backButton.classList.add("hidden");
  state.currentGame = null;
}

backButton.addEventListener("click", resetToMenu);
buildMenu();

function initHangman(root) {
  const words = [
    "JAVASCRIPT",
    "DEVELOPER",
    "FUNCTION",
    "ALGORITHM",
    "DEBUGGING",
    "COMPUTER",
    "INTERFACE",
    "VARIABLE",
    "DATABASE",
    "FRAMEWORK"
  ];

  root.innerHTML = `
    <h2>Hangman (Word Guessing)</h2>
    <p class="status" id="hangmanStatus"></p>
    <p>Lives: <strong id="hangmanLives"></strong></p>
    <div class="hangman-word" id="hangmanWord"></div>
    <div class="chips" id="hangmanGuessed"></div>
    <div class="letter-pad" id="hangmanPad"></div>
    <button id="hangmanReset">New Word</button>
  `;

  const status = root.querySelector("#hangmanStatus");
  const lives = root.querySelector("#hangmanLives");
  const wordBox = root.querySelector("#hangmanWord");
  const guessedBox = root.querySelector("#hangmanGuessed");
  const pad = root.querySelector("#hangmanPad");
  const resetBtn = root.querySelector("#hangmanReset");

  let selectedWord = "";
  let guessed = new Set();
  let remainingLives = 7;
  let done = false;

  function drawWord() {
    wordBox.innerHTML = "";
    selectedWord.split("").forEach((char) => {
      const span = document.createElement("span");
      span.className = "hangman-letter";
      span.textContent = guessed.has(char) ? char : "_";
      wordBox.appendChild(span);
    });
  }

  function drawGuessed() {
    guessedBox.innerHTML = "";
    [...guessed].sort().forEach((letter) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = letter;
      guessedBox.appendChild(chip);
    });
  }

  function evaluate() {
    const won = selectedWord.split("").every((char) => guessed.has(char));
    if (won) {
      done = true;
      status.textContent = `You won! The word was ${selectedWord}.`;
      status.style.color = "var(--success)";
      return;
    }

    if (remainingLives <= 0) {
      done = true;
      status.textContent = `You lost! The word was ${selectedWord}.`;
      status.style.color = "var(--danger)";
      selectedWord.split("").forEach((c) => guessed.add(c));
      drawWord();
      return;
    }

    status.textContent = "Guess a letter.";
    status.style.color = "var(--accent)";
  }

  function makePad() {
    pad.innerHTML = "";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    letters.forEach((letter) => {
      const btn = document.createElement("button");
      btn.textContent = letter;
      btn.addEventListener("click", () => {
        if (done || guessed.has(letter)) return;
        guessed.add(letter);
        if (!selectedWord.includes(letter)) remainingLives -= 1;
        lives.textContent = remainingLives;
        btn.disabled = true;
        drawWord();
        drawGuessed();
        evaluate();
      });
      pad.appendChild(btn);
    });
  }

  function reset() {
    selectedWord = words[Math.floor(Math.random() * words.length)];
    guessed = new Set();
    remainingLives = 7;
    done = false;
    lives.textContent = remainingLives;
    makePad();
    drawWord();
    drawGuessed();
    evaluate();
  }

  resetBtn.addEventListener("click", reset);
  reset();
}

function initTicTacToe(root) {
  root.innerHTML = `
    <h2>Smart Tic-Tac-Toe</h2>
    <p class="status" id="tttStatus"></p>
    <div class="ttt-board" id="tttBoard"></div>
    <div class="chips">
      <span class="chip">You: X</span>
      <span class="chip">AI: O</span>
    </div>
    <button id="tttReset">Reset Match</button>
  `;

  const status = root.querySelector("#tttStatus");
  const boardEl = root.querySelector("#tttBoard");
  const resetBtn = root.querySelector("#tttReset");

  let board = Array(9).fill("");
  let finished = false;

  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  function checkWinner(currentBoard) {
    for (const [a, b, c] of lines) {
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    if (currentBoard.every(Boolean)) return "draw";
    return null;
  }

  function minimax(newBoard, isMax) {
    const outcome = checkWinner(newBoard);
    if (outcome === "O") return 10;
    if (outcome === "X") return -10;
    if (outcome === "draw") return 0;

    const empty = newBoard
      .map((cell, index) => (cell ? null : index))
      .filter((index) => index !== null);

    if (isMax) {
      let best = -Infinity;
      empty.forEach((index) => {
        newBoard[index] = "O";
        best = Math.max(best, minimax(newBoard, false));
        newBoard[index] = "";
      });
      return best;
    }

    let best = Infinity;
    empty.forEach((index) => {
      newBoard[index] = "X";
      best = Math.min(best, minimax(newBoard, true));
      newBoard[index] = "";
    });
    return best;
  }

  function getBestMove() {
    let bestVal = -Infinity;
    let move = null;
    board.forEach((cell, index) => {
      if (!cell) {
        board[index] = "O";
        const score = minimax(board, false);
        board[index] = "";
        if (score > bestVal) {
          bestVal = score;
          move = index;
        }
      }
    });
    return move;
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    board.forEach((cell, index) => {
      const btn = document.createElement("button");
      btn.className = "ttt-cell";
      btn.textContent = cell;
      btn.disabled = !!cell || finished;
      btn.addEventListener("click", () => humanMove(index));
      boardEl.appendChild(btn);
    });
  }

  function updateStatus() {
    const result = checkWinner(board);
    if (!result) {
      status.textContent = "Your turn";
      status.style.color = "var(--accent)";
      return false;
    }

    finished = true;
    if (result === "draw") {
      status.textContent = "It is a draw";
      status.style.color = "var(--warning)";
    } else if (result === "X") {
      status.textContent = "You won";
      status.style.color = "var(--success)";
    } else {
      status.textContent = "AI won";
      status.style.color = "var(--danger)";
    }
    return true;
  }

  function humanMove(index) {
    if (finished || board[index]) return;
    board[index] = "X";
    renderBoard();
    if (updateStatus()) return;

    const move = getBestMove();
    if (move !== null) board[move] = "O";
    renderBoard();
    updateStatus();
  }

  function resetGame() {
    board = Array(9).fill("");
    finished = false;
    status.textContent = "Your turn";
    status.style.color = "var(--accent)";
    renderBoard();
  }

  resetBtn.addEventListener("click", resetGame);
  resetGame();
}

function initMathBattle(root) {
  root.innerHTML = `
    <h2>Math Battle Game</h2>
    <p class="status" id="mathStatus"></p>
    <div class="game-grid two-col">
      <div>
        <h3>Question</h3>
        <h2 id="mathQuestion"></h2>
        <div class="math-options" id="mathOptions"></div>
      </div>
      <div>
        <h3>Stats</h3>
        <p>Health: <strong id="mathHealth">100</strong></p>
        <p>Enemy Health: <strong id="enemyHealth">100</strong></p>
        <p>Score: <strong id="mathScore">0</strong></p>
        <button id="mathReset">Restart Battle</button>
      </div>
    </div>
  `;

  const status = root.querySelector("#mathStatus");
  const questionEl = root.querySelector("#mathQuestion");
  const optionsEl = root.querySelector("#mathOptions");
  const healthEl = root.querySelector("#mathHealth");
  const enemyEl = root.querySelector("#enemyHealth");
  const scoreEl = root.querySelector("#mathScore");
  const resetBtn = root.querySelector("#mathReset");

  let health = 100;
  let enemy = 100;
  let score = 0;
  let answer = 0;
  let active = true;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function buildQuestion() {
    const a = randomInt(2, 20);
    const b = randomInt(2, 20);
    const operators = ["+", "-", "×"];
    const op = operators[randomInt(0, operators.length - 1)];

    if (op === "+") answer = a + b;
    if (op === "-") answer = a - b;
    if (op === "×") answer = a * b;

    questionEl.textContent = `${a} ${op} ${b} = ?`;

    const choices = new Set([answer]);
    while (choices.size < 4) {
      choices.add(answer + randomInt(-15, 15));
    }
    const shuffled = [...choices].sort(() => Math.random() - 0.5);

    optionsEl.innerHTML = "";
    shuffled.forEach((value) => {
      const btn = document.createElement("button");
      btn.textContent = value;
      btn.addEventListener("click", () => chooseAnswer(value, btn));
      optionsEl.appendChild(btn);
    });
  }

  function chooseAnswer(value, button) {
    if (!active) return;

    [...optionsEl.querySelectorAll("button")].forEach((b) => (b.disabled = true));

    if (value === answer) {
      button.classList.add("correct");
      enemy -= 20;
      score += 10;
      status.textContent = "Hit! Great answer.";
      status.style.color = "var(--success)";
    } else {
      button.classList.add("wrong");
      health -= 15;
      status.textContent = "Miss! Enemy attacks.";
      status.style.color = "var(--danger)";
    }

    healthEl.textContent = Math.max(health, 0);
    enemyEl.textContent = Math.max(enemy, 0);
    scoreEl.textContent = score;

    if (enemy <= 0) {
      active = false;
      status.textContent = "Victory! You defeated the enemy.";
      status.style.color = "var(--success)";
      return;
    }

    if (health <= 0) {
      active = false;
      status.textContent = "Defeat! Train and try again.";
      status.style.color = "var(--danger)";
      return;
    }

    setTimeout(buildQuestion, 550);
  }

  function resetBattle() {
    health = 100;
    enemy = 100;
    score = 0;
    active = true;
    healthEl.textContent = health;
    enemyEl.textContent = enemy;
    scoreEl.textContent = score;
    status.textContent = "Solve quickly to win!";
    status.style.color = "var(--accent)";
    buildQuestion();
  }

  resetBtn.addEventListener("click", resetBattle);
  resetBattle();
}

function initMaze(root) {
  root.innerHTML = `
    <h2>Maze Escape</h2>
    <p class="status" id="mazeStatus">Use arrow keys to reach the green tile.</p>
    <div class="chips">
      <span class="chip">Player: Yellow</span>
      <span class="chip">Goal: Green</span>
    </div>
    <div id="mazeGrid" class="maze-grid"></div>
    <button id="mazeReset">Generate New Maze</button>
  `;

  const mazeGrid = root.querySelector("#mazeGrid");
  const status = root.querySelector("#mazeStatus");
  const resetBtn = root.querySelector("#mazeReset");

  const rows = 13;
  const cols = 13;
  let maze = [];
  let player = { r: 1, c: 1 };
  let goal = { r: rows - 2, c: cols - 2 };

  function carveMaze() {
    maze = Array.from({ length: rows }, () => Array(cols).fill(1));

    function shuffle(arr) {
      return arr.sort(() => Math.random() - 0.5);
    }

    function dfs(r, c) {
      maze[r][c] = 0;
      const dirs = shuffle([
        [0, 2],
        [0, -2],
        [2, 0],
        [-2, 0]
      ]);

      dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && maze[nr][nc] === 1) {
          maze[r + dr / 2][c + dc / 2] = 0;
          dfs(nr, nc);
        }
      });
    }

    dfs(1, 1);
  }

  function drawMaze() {
    mazeGrid.style.gridTemplateColumns = `repeat(${cols}, 28px)`;
    mazeGrid.innerHTML = "";

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const cell = document.createElement("div");
        cell.className = `maze-cell ${maze[r][c] === 1 ? "wall" : "path"}`;
        if (r === player.r && c === player.c) cell.className = "maze-cell player";
        if (r === goal.r && c === goal.c) cell.className = "maze-cell goal";
        mazeGrid.appendChild(cell);
      }
    }
  }

  function movePlayer(dr, dc) {
    const nr = player.r + dr;
    const nc = player.c + dc;

    if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) return;
    if (maze[nr][nc] === 1) return;

    player = { r: nr, c: nc };
    drawMaze();

    if (nr === goal.r && nc === goal.c) {
      status.textContent = "Escaped! You solved the maze.";
      status.style.color = "var(--success)";
    }
  }

  function resetMaze() {
    carveMaze();
    player = { r: 1, c: 1 };
    goal = { r: rows - 2, c: cols - 2 };
    status.textContent = "Use arrow keys to reach the green tile.";
    status.style.color = "var(--accent)";
    drawMaze();
  }

  document.addEventListener("keydown", (event) => {
    if (state.currentGame !== "maze") return;
    if (event.key === "ArrowUp") movePlayer(-1, 0);
    if (event.key === "ArrowDown") movePlayer(1, 0);
    if (event.key === "ArrowLeft") movePlayer(0, -1);
    if (event.key === "ArrowRight") movePlayer(0, 1);
  });

  resetBtn.addEventListener("click", resetMaze);
  resetMaze();
}

function initBrickBreaker(root) {
  root.innerHTML = `
    <h2>Brick Breaker Deluxe</h2>
    <p class="status" id="brickStatus">Break all bricks to win.</p>
    <canvas id="brickCanvas" width="720" height="420"></canvas>
    <p class="controls-hint">Move paddle with left and right arrow keys.</p>
    <button id="brickReset">Restart Level</button>
  `;

  const canvas = root.querySelector("#brickCanvas");
  const ctx = canvas.getContext("2d");
  const status = root.querySelector("#brickStatus");
  const resetBtn = root.querySelector("#brickReset");

  let paddleX = canvas.width / 2 - 60;
  let ballX = canvas.width / 2;
  let ballY = canvas.height - 60;
  let dx = 3;
  let dy = -3;
  let rightPressed = false;
  let leftPressed = false;
  let animationId = null;

  const paddle = { width: 120, height: 12 };
  const brick = { rowCount: 6, colCount: 10, width: 62, height: 16, padding: 8, offsetTop: 36, offsetLeft: 18 };

  let bricks = [];

  function createBricks() {
    bricks = [];
    for (let c = 0; c < brick.colCount; c += 1) {
      bricks[c] = [];
      for (let r = 0; r < brick.rowCount; r += 1) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  }

  function drawBricks() {
    for (let c = 0; c < brick.colCount; c += 1) {
      for (let r = 0; r < brick.rowCount; r += 1) {
        if (bricks[c][r].status === 1) {
          const brickX = c * (brick.width + brick.padding) + brick.offsetLeft;
          const brickY = r * (brick.height + brick.padding) + brick.offsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.fillStyle = `hsl(${(r * 55 + c * 14) % 360} 75% 60%)`;
          ctx.fillRect(brickX, brickY, brick.width, brick.height);
        }
      }
    }
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#6ee7ff";
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(paddleX, canvas.height - paddle.height - 8, paddle.width, paddle.height);
  }

  function collisionDetection() {
    let bricksLeft = 0;
    for (let c = 0; c < brick.colCount; c += 1) {
      for (let r = 0; r < brick.rowCount; r += 1) {
        const b = bricks[c][r];
        if (b.status === 1) {
          bricksLeft += 1;
          if (ballX > b.x && ballX < b.x + brick.width && ballY > b.y && ballY < b.y + brick.height) {
            dy = -dy;
            b.status = 0;
          }
        }
      }
    }

    if (bricksLeft === 0) {
      status.textContent = "You win! All bricks destroyed.";
      status.style.color = "var(--success)";
      cancelAnimationFrame(animationId);
    }
  }

  function draw() {
    if (state.currentGame !== "brick") {
      animationId = requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (ballX + dx > canvas.width - 9 || ballX + dx < 9) dx = -dx;
    if (ballY + dy < 9) dy = -dy;
    else if (ballY + dy > canvas.height - 20) {
      if (ballX > paddleX && ballX < paddleX + paddle.width) {
        dy = -dy;
      } else {
        status.textContent = "Game over! Click restart.";
        status.style.color = "var(--danger)";
        cancelAnimationFrame(animationId);
        return;
      }
    }

    if (rightPressed && paddleX < canvas.width - paddle.width) paddleX += 7;
    else if (leftPressed && paddleX > 0) paddleX -= 7;

    ballX += dx;
    ballY += dy;
    animationId = requestAnimationFrame(draw);
  }

  function keyDown(event) {
    if (event.key === "Right" || event.key === "ArrowRight") rightPressed = true;
    if (event.key === "Left" || event.key === "ArrowLeft") leftPressed = true;
  }

  function keyUp(event) {
    if (event.key === "Right" || event.key === "ArrowRight") rightPressed = false;
    if (event.key === "Left" || event.key === "ArrowLeft") leftPressed = false;
  }

  function resetLevel() {
    paddleX = canvas.width / 2 - 60;
    ballX = canvas.width / 2;
    ballY = canvas.height - 60;
    dx = 3;
    dy = -3;
    status.textContent = "Break all bricks to win.";
    status.style.color = "var(--accent)";
    createBricks();
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(draw);
  }

  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);
  resetBtn.addEventListener("click", resetLevel);
  resetLevel();
}

function initRacing(root) {
  root.innerHTML = `
    <h2>Top-Down Car Racing</h2>
    <p class="status" id="raceStatus">Avoid traffic and survive.</p>
    <canvas id="raceCanvas" width="520" height="620"></canvas>
    <p class="controls-hint">Use A/D or ←/→ to move. Speed increases over time.</p>
    <p>Score: <strong id="raceScore">0</strong></p>
    <button id="raceReset">Restart Race</button>
  `;

  const canvas = root.querySelector("#raceCanvas");
  const ctx = canvas.getContext("2d");
  const status = root.querySelector("#raceStatus");
  const scoreEl = root.querySelector("#raceScore");
  const resetBtn = root.querySelector("#raceReset");

  const laneCount = 4;
  const laneWidth = canvas.width / laneCount;
  const player = { lane: 1, y: canvas.height - 110, width: 50, height: 90 };
  const enemies = [];

  let frame = 0;
  let score = 0;
  let speed = 3;
  let running = true;
  let animationId = null;

  function spawnEnemy() {
    const lane = Math.floor(Math.random() * laneCount);
    enemies.push({
      lane,
      y: -120,
      width: 50,
      height: 90,
      color: ["#ef4444", "#f59e0b", "#10b981", "#8b5cf6"][Math.floor(Math.random() * 4)]
    });
  }

  function drawRoad() {
    ctx.fillStyle = "#232838";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff33";
    for (let lane = 1; lane < laneCount; lane += 1) {
      for (let dash = 0; dash < 12; dash += 1) {
        ctx.fillRect(lane * laneWidth - 3, (dash * 70 + frame * speed) % (canvas.height + 70) - 70, 6, 40);
      }
    }
  }

  function drawCar(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 50, 90);
    ctx.fillStyle = "#111827";
    ctx.fillRect(x + 10, y + 16, 30, 20);
    ctx.fillRect(x + 10, y + 52, 30, 20);
  }

  function update() {
    if (state.currentGame !== "racing") {
      animationId = requestAnimationFrame(update);
      return;
    }

    if (!running) return;

    drawRoad();

    if (frame % 60 === 0) spawnEnemy();

    const playerX = player.lane * laneWidth + (laneWidth - player.width) / 2;
    drawCar(playerX, player.y, "#38bdf8");

    for (let i = enemies.length - 1; i >= 0; i -= 1) {
      const enemy = enemies[i];
      enemy.y += speed;
      const enemyX = enemy.lane * laneWidth + (laneWidth - enemy.width) / 2;
      drawCar(enemyX, enemy.y, enemy.color);

      const collision =
        playerX < enemyX + enemy.width &&
        playerX + player.width > enemyX &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y;

      if (collision) {
        running = false;
        status.textContent = "Crash! Restart race.";
        status.style.color = "var(--danger)";
      }

      if (enemy.y > canvas.height + 120) {
        enemies.splice(i, 1);
        score += 10;
      }
    }

    frame += 1;
    speed = Math.min(9, 3 + Math.floor(frame / 600));
    score += 0.05;
    scoreEl.textContent = Math.floor(score);

    animationId = requestAnimationFrame(update);
  }

  function keyHandler(event) {
    if (state.currentGame !== "racing") return;
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
      player.lane = Math.max(0, player.lane - 1);
    }
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
      player.lane = Math.min(laneCount - 1, player.lane + 1);
    }
  }

  function resetRace() {
    player.lane = 1;
    enemies.length = 0;
    frame = 0;
    speed = 3;
    score = 0;
    running = true;
    scoreEl.textContent = "0";
    status.textContent = "Avoid traffic and survive.";
    status.style.color = "var(--accent)";
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(update);
  }

  document.addEventListener("keydown", keyHandler);
  resetBtn.addEventListener("click", resetRace);
  resetRace();
}
