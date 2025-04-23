const board = document.getElementById("chessboard");

let moved = {
  whiteKing: false,
  blackKing: false,
  whiteRookLeft: false,
  whiteRookRight: false,
  blackRookLeft: false,
  blackRookRight: false,
};

const pieces = {
  r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
  R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙",
};

let gameState = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];

let selected = null;
let validMoves = [];
let turn = "white";

function isWhite(piece) {
  return piece && piece === piece.toUpperCase();
}

function isBlack(piece) {
  return piece && piece === piece.toLowerCase();
}

function isValidMove(piece, from, to) {
  const dx = to.col - from.col;
  const dy = to.row - from.row;

  switch (piece.toLowerCase()) {
    case "p": {
      const dir = isWhite(piece) ? -1 : 1;
      const startRow = isWhite(piece) ? 6 : 1;
      if (dx === 0 && gameState[to.row][to.col] === "") {
        if (dy === dir) return true;
        if (from.row === startRow && dy === 2 * dir && gameState[from.row + dir][from.col] === "") return true;
      }
      if (Math.abs(dx) === 1 && dy === dir && gameState[to.row][to.col] !== "" && isWhite(gameState[to.row][to.col]) !== isWhite(piece)) {
        return true;
      }
      break;
    }
    case "r":
      if (dx === 0 || dy === 0) return isPathClear(from, to);
      break;
    case "n":
      return (Math.abs(dx) === 1 && Math.abs(dy) === 2) || (Math.abs(dx) === 2 && Math.abs(dy) === 1);
    case "b":
      if (Math.abs(dx) === Math.abs(dy)) return isPathClear(from, to);
      break;
    case "q":
      if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) return isPathClear(from, to);
      break;
    case "k":
      if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return true;
      if (dy === 0 && Math.abs(dx) === 2) {
        // Castling logic
        const isWhitePiece = isWhite(piece);
        const row = from.row;
        const isLeft = dx === -2;
        const isRight = dx === 2;
        const clearLeft = !gameState[row][1] && !gameState[row][2] && !gameState[row][3];
        const clearRight = !gameState[row][5] && !gameState[row][6];
        if (isWhitePiece) {
          if (!moved.whiteKing && ((isLeft && !moved.whiteRookLeft && clearLeft) || (isRight && !moved.whiteRookRight && clearRight))) {
            return !isSquareAttacked({ row, col: 4 }, "black") &&
                   !isSquareAttacked({ row, col: isLeft ? 3 : 5 }, "black");
          }
        } else {
          if (!moved.blackKing && ((isLeft && !moved.blackRookLeft && clearLeft) || (isRight && !moved.blackRookRight && clearRight))) {
            return !isSquareAttacked({ row, col: 4 }, "white") &&
                   !isSquareAttacked({ row, col: isLeft ? 3 : 5 }, "white");
          }
        }
      }
      break;
  }
  return false;
}

function isPathClear(from, to) {
  const dx = Math.sign(to.col - from.col);
  const dy = Math.sign(to.row - from.row);
  let x = from.col + dx;
  let y = from.row + dy;

  while (x !== to.col || y !== to.row) {
    if (gameState[y][x] !== "") return false;
    x += dx;
    y += dy;
  }
  return true;
}

function findKing(color) {
  const kingChar = color === "white" ? "K" : "k";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (gameState[row][col] === kingChar) {
        return { row, col };
      }
    }
  }
  return null;
}

function isSquareAttacked(pos, attackerColor) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const attacker = gameState[row][col];
      if (!attacker) continue;
      if ((attackerColor === "white" && isWhite(attacker)) ||
          (attackerColor === "black" && isBlack(attacker))) {
        const from = { row, col };
        if (isValidMove(attacker, from, pos)) {
          return true;
        }
      }
    }
  }
  return false;
}

function switchTurn() {
  turn = turn === "white" ? "black" : "white";
}

function renderBoard() {
  board.innerHTML = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
      square.dataset.row = row;
      square.dataset.col = col;

      const piece = gameState[row][col];
      if (piece) {
        square.textContent = pieces[piece];
        square.classList.add(isWhite(piece) ? "white-piece" : "black-piece");
      }
      if (selected && selected.row === row && selected.col === col) {
        square.classList.add("selected");
      }
      if (validMoves.some(m => m.row === row && m.col === col)) {
        square.classList.add("valid-move");
      }

      square.addEventListener("click", () => handleMove(row, col));
      board.appendChild(square);
    }
  }
}

function handleMove(row, col) {
  if (!selected) {
    const piece = gameState[row][col];
    if (piece && ((turn === "white" && isWhite(piece)) || (turn === "black" && isBlack(piece)))) {
      selected = { row, col };
      validMoves = calculateValidMoves(piece, { row, col });
      renderBoard();
    }
  } else {
    const from = selected;
    const to = { row, col };
    const piece = gameState[from.row][from.col];

    if (validMoves.some(m => m.row === row && m.col === col)) {
      gameState[to.row][to.col] = piece;
      gameState[from.row][from.col] = "";

      // Pawn promotion
      if (piece.toLowerCase() === "p" && (to.row === 0 || to.row === 7)) {
        gameState[to.row][to.col] = prompt("Promote to (Q, R, B, N):", "Q").toUpperCase();
      }

      // Update moved flags
      if (piece === "K") moved.whiteKing = true;
      if (piece === "k") moved.blackKing = true;
      if (piece === "R" && from.col === 0) moved.whiteRookLeft = true;
      if (piece === "R" && from.col === 7) moved.whiteRookRight = true;
      if (piece === "r" && from.col === 0) moved.blackRookLeft = true;
      if (piece === "r" && from.col === 7) moved.blackRookRight = true;

      const kingPos = findKing(turn);
      if (isSquareAttacked(kingPos, turn === "white" ? "black" : "white")) {
        alert("Check!");
      }

      switchTurn();
    }

    selected = null;
    validMoves = [];
    renderBoard();
  }
}

function calculateValidMoves(piece, from) {
  const moves = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const to = { row, col };
      if (isValidMove(piece, from, to)) {
        const originalPiece = gameState[to.row][to.col];
        gameState[to.row][to.col] = piece;
        gameState[from.row][from.col] = "";
        const kingPos = findKing(turn);
        if (!isSquareAttacked(kingPos, turn === "white" ? "black" : "white")) {
          moves.push(to);
        }
        gameState[from.row][from.col] = piece;
        gameState[to.row][to.col] = originalPiece;
      }
    }
  }
  return moves;
}

renderBoard();
