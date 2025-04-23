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

function validMove(from, to) {
  const piece = gameState[from.row][from.col];
  const target = gameState[to.row][to.col];
  if (!piece) return false;
  if (turn === "white" && !isWhite(piece)) return false;
  if (turn === "black" && !isBlack(piece)) return false;
  if (target && (isWhite(target) === isWhite(piece))) return false;
  return true;
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
    if (gameState[row][col]) {
      const piece = gameState[row][col];
      if ((turn === "white" && isWhite(piece)) || (turn === "black" && isBlack(piece))) {
        selected = { row, col };
        renderBoard();
      }
    }
  } else {
    if (selected.row !== row || selected.col !== col) {
      if (validMove(selected, { row, col })) {
        gameState[row][col] = gameState[selected.row][selected.col];
        gameState[selected.row][selected.col] = "";
        switchTurn();
      }
    }
    selected = null;
    renderBoard();
  }
}

renderBoard();

