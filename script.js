const board = document.getElementById("chessboard");

const pieces = {
  r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
  R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙"
};

let gameState = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"]
];

let selected = null;
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
      if (Math.abs(dx) === 1 && dy === dir && gameState[to.row][to.col] !== "") {
        return true;
      }
      break;
    }
    case "r":
      return (dx === 0 || dy === 0);
    case "n":
      return (Math.abs(dx) === 1 && Math.abs(dy) === 2) || (Math.abs(dx) === 2 && Math.abs(dy) === 1);
    case "b":
      return Math.abs(dx) === Math.abs(dy);
    case "q":
      return dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);
    case "k":
      return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
  }
  return false;
}

function validMove(from, to) {
  const piece = gameState[from.row][from.col];
  const target = gameState[to.row][to.col];
  if (!piece) return false;
  if (turn === "white" && !isWhite(piece)) return false;
  if (turn === "black" && !isBlack(piece)) return false;
  if (target && (isWhite(target) === isWhite(piece))) return false;
  return isValidMove(piece, from, to);
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
      renderBoard();
    }
  } else {
    const from = selected;
    const to = { row, col };
    if (from.row !== row || from.col !== col) {
      if (validMove(from, to)) {
        gameState[to.row][to.col] = gameState[from.row][from.col];
        gameState[from.row][from.col] = "";
        switchTurn();
      }
    }
    selected = null;
    renderBoard();
  }
}

renderBoard();
