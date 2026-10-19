"use strict"

//! ****************** Global Variables ******************
const itemBox = document.querySelectorAll(".item");
const currentTurn = document.querySelector("section .head-game ul li:nth-child(2) span:nth-child(2)");
const player1Score = document.querySelector("section .footer-game .score1");
const player2Score = document.querySelector("section .footer-game .score2");
const draw = document.querySelector("section .footer-game .draw");
const name2 = document.querySelector("section .footer-game .name2");
const resetBtn = document.querySelector(".reset");
const overlay = document.querySelector(".overlay");
const overlayMessage = document.querySelector(".overlay .message .content");
const closeMessage = document.querySelector(".overlay .message .close");
// (options bar) الجديد
const modeBtn = document.querySelector(".options-game .mode");
const modeIcon = document.querySelector(".options-game .mode i");
const modeText = document.querySelector(".options-game .mode span");
const levelBtn = document.querySelector(".options-game .level");
const levelText = document.querySelector(".options-game .level span");
const undoBtn = document.querySelector(".options-game .undo");
const soundBtn = document.querySelector(".options-game .sound");
const soundIcon = document.querySelector(".options-game .sound i");
const clearBtn = document.querySelector(".options-game .clear");

//! ****************** Object ******************
let player1 = {
  symbol: `<i class="fa-solid fa-xmark"></i>`,
  played: [],
  score: 0,
};
let player2 = {
  symbol: ` <i class="fa-solid fa-o"></i>`,
  played: [],
  score: 0,
};

//! ****************** Check Variables ******************
let turn = true; // (turn) بيتشك على ال
const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
let winner = false; // بيتشك مين الفائز
let usedCeils = []; // الخانات المستعملة
let ties = 0; // score draw

//! ****************** New Variables ******************
let vsComputer = false; // اللعب ضد الكمبيوتر ولا لاعبين اتنين
const levels = ["Easy", "Medium", "Hard"]; // مستويات الكمبيوتر
let level = 0; // (levels) رقم المستوى الحالى فى ال
let locked = false; // بيمنع الضغط (وقت تفكير الكمبيوتر / ظهور الرسالة)
let history = []; // كل الحركات اللى اتلعبت (عشان ال undo)
let soundOn = true; // الصوت شغال ولا لأ
let audioCtx = null; // (Web Audio) مش محتاجين ملفات صوت
let cpuTimer = null; // تايمر حركة الكمبيوتر
let messageTimer = null; // تايمر ظهور الرسالة

loadData();
updateOptions();
showScore();
checkTurn();

//! ****************** Function ******************
// اللى عليه الدو (item) بيعدى على ال
for (let i = 0; i < itemBox.length; i++) {
  itemBox[i].addEventListener("click", function () {
    if (locked) return;
    if (isEmpty(i)) {
      playMove(i);
    } else {
      shakeItem(i);
      playSound("error");
    }
  });
}

// (مين دوره + الكمبيوتر) بينفذ حركة واحدة
function playMove(i) {
  const player = turn ? player1 : player2;
  addSymbol(player, i);
  playSound(turn ? "x" : "o");
  turn = !turn;
  checkTurn();
  checkWinner(player);
  // لو لسه اللعبة مخلصتش ودور الكمبيوتر
  if (!winner && usedCeils.length < 9 && vsComputer && !turn) {
    computerTurn();
  }
}

// (X O) بيضيف الرمز
function addSymbol(player, i) {
  itemBox[i].innerHTML = player.symbol;
  player.played.push(i);
  usedCeils.push(i);
  history.push({ player: player, i: i });
}
// (head game) اللى فى (turn) بيتشك على ال
function checkTurn() {
  if (turn) {
    currentTurn.innerHTML = player1.symbol;
  } else {
    currentTurn.innerHTML = player2.symbol;
  }
}
// بيتشك مين الفائز
function checkWinner(player) {
  if (!winner) {
    winCombos.some((combo) => {
      if (combo.every((index) => player.played.includes(index))) {
        winner = true;
        locked = true;
        player.score++;
        showScore();
        highlightWinner(combo);
        playSound(vsComputer && player === player2 ? "lose" : "win");
        // نستنى شوية عشان اللاعب يشوف الخط الفايز
        messageTimer = setTimeout(() => displayMessage(player, true), 900);
        return true;
      }
    });
  }
  if (!winner && usedCeils.length === 9) {
    locked = true;
    ties++;
    showScore();
    playSound("draw");
    messageTimer = setTimeout(() => displayMessage(player, false), 600);
  }
}
// (footer game) فى (winner score) بيعرض ال
function showScore() {
  player1Score.innerHTML = player1.score;
  player2Score.innerHTML = player2.score;
  draw.innerHTML = ties;
  saveData();
}
// مسؤول عن الخانات المستعملة
function isEmpty(i) {
  if (usedCeils.includes(i)) {
    return false;
  } else {
    return true;
  }
}
// Relode Game
function resetGame() {
  clearTimeout(cpuTimer);
  clearTimeout(messageTimer);
  itemBox.forEach((item) => {
    item.innerHTML = "";
    item.classList.remove("win", "shake");
  });
  turn = true;
  winner = false;
  locked = false;
  usedCeils = [];
  history = [];
  player1.played = [];
  player2.played = [];
  checkTurn();
}
resetBtn.addEventListener("click", resetGame);
// overlay بيعرض
function displayMessage(player, winner) {
  overlay.classList.remove("d-none");
  if (winner) {
    overlayMessage.innerHTML = `<p><span class="text-warning">${player.symbol}</span> is the </p>
                                <h2>Winner</h2>`;
    if (vsComputer) {
      overlayMessage.innerHTML += player === player2
        ? `<p class="text-white-50 mb-0"><i class="fa-solid fa-robot pe-1"></i>Computer wins, try again</p>`
        : `<p class="text-white-50 mb-0"><i class="fa-solid fa-trophy pe-1"></i>You beat the computer</p>`;
    }
  } else {
    overlayMessage.innerHTML = `<p>It is the </p>
                                <h2>Draw</h2>`;
  }
}
// overlay بيقفل (وبيبدأ جيم جديد)
function closeOverlay() {
  overlay.classList.add("d-none");
  resetGame();
}
closeMessage.addEventListener("click", closeOverlay);
overlay.addEventListener("click", function (e) {
  if (e.target === overlay) closeOverlay();
});

//! ****************** Visual Effects ******************
// بيلون الخانات الفايزة
function highlightWinner(combo) {
  combo.forEach((index) => itemBox[index].classList.add("win"));
}
// اللى مش فاضية (item) بيهز ال
function shakeItem(i) {
  itemBox[i].classList.remove("shake");
  void itemBox[i].offsetWidth; // عشان الأنيميشن يتعاد
  itemBox[i].classList.add("shake");
}

//! ****************** Undo ******************
// بيرجع خطوة (ولو ضد الكمبيوتر بيرجع حركتك وحركته)
function undoMove() {
  if (locked || history.length === 0) return;
  const steps = vsComputer ? Math.min(2, history.length) : 1;
  for (let s = 0; s < steps; s++) {
    const last = history.pop();
    last.player.played.pop();
    usedCeils.pop();
    itemBox[last.i].innerHTML = "";
    turn = last.player === player1; // الدور يرجع لصاحب الحركة اللى اتمسحت
  }
  checkTurn();
  playSound("error");
}
undoBtn.addEventListener("click", undoMove);

//! ****************** Computer ******************
// دور الكمبيوتر (بيستنى نص ثانية عشان يبان إنه بيفكر)
function computerTurn() {
  locked = true;
  cpuTimer = setTimeout(function () {
    const i = chooseCell();
    locked = false;
    playMove(i);
  }, 500);
}
// (level) بيختار الخانة على حسب ال
function chooseCell() {
  const board = getBoard();
  const empty = [];
  board.forEach((cell, i) => {
    if (cell === null) empty.push(i);
  });
  if (level === 0) {
    return randomOf(empty); // Easy: عشوائى
  }
  if (level === 1) {
    // Medium: يكسب لو يقدر، يمنعك لو هتكسب، غير كدا عشوائى
    const win = findLine(board, "O");
    if (win !== -1) return win;
    const block = findLine(board, "X");
    if (block !== -1) return block;
    return randomOf(empty);
  }
  return bestMove(board); // Hard: مستحيل يخسر
}
// ("X" - "O" - null) بيحول الحركات لمصفوفة
function getBoard() {
  const board = Array(9).fill(null);
  player1.played.forEach((i) => (board[i] = "X"));
  player2.played.forEach((i) => (board[i] = "O"));
  return board;
}
function randomOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
// بيدور على خانة فاضية تكمل خط لنفس الرمز
function findLine(board, symbol) {
  for (const combo of winCombos) {
    const marks = combo.filter((i) => board[i] === symbol);
    const empty = combo.filter((i) => board[i] === null);
    if (marks.length === 2 && empty.length === 1) return empty[0];
  }
  return -1;
}
// بيرجع مين الفايز فى المصفوفة
function getWinner(board) {
  for (const [a, b, c] of winCombos) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}
// (minimax) بيجرب كل الاحتمالات ويختار أحسن خانة
function bestMove(board) {
  let bestScore = -Infinity;
  let move = -1;
  board.forEach((cell, i) => {
    if (cell === null) {
      board[i] = "O";
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  });
  return move;
}
function minimax(board, depth, isComputer) {
  const result = getWinner(board);
  if (result === "O") return 10 - depth; // الكمبيوتر كسب (كل ما أسرع أحسن)
  if (result === "X") return depth - 10;
  if (board.every((cell) => cell !== null)) return 0;
  let best = isComputer ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = isComputer ? "O" : "X";
      const score = minimax(board, depth + 1, !isComputer);
      board[i] = null;
      best = isComputer ? Math.max(best, score) : Math.min(best, score);
    }
  }
  return best;
}

//! ****************** Options Bar ******************
// (head game) بيحدث شكل الأزرار والأسماء حسب الإعدادات
function updateOptions() {
  modeText.textContent = vsComputer ? "vs Computer" : "2 Players";
  modeIcon.className = vsComputer ? "fa-solid fa-robot pe-1" : "fa-solid fa-user-group pe-1";
  levelBtn.classList.toggle("d-none", !vsComputer);
  levelText.textContent = levels[level];
  name2.textContent = vsComputer ? "Computer" : "Player2";
  soundIcon.className = soundOn ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
}
// بيصفر النتيجة وبيبدأ جيم جديد
function clearScores() {
  player1.score = 0;
  player2.score = 0;
  ties = 0;
  showScore();
  resetGame();
}
// 2 Players <=> vs Computer
modeBtn.addEventListener("click", function () {
  vsComputer = !vsComputer;
  clearScores(); // النتيجة القديمة متنفعش مع الوضع الجديد
  updateOptions();
});
// Easy => Medium => Hard
levelBtn.addEventListener("click", function () {
  level = (level + 1) % levels.length;
  clearScores();
  updateOptions();
});
soundBtn.addEventListener("click", function () {
  soundOn = !soundOn;
  updateOptions();
  saveData();
  playSound("x");
});
clearBtn.addEventListener("click", clearScores);

//! ****************** Sound ******************
// (Web Audio API) بيعمل صوت من غير ملفات
function playSound(type) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    if (type === "x") beep(520, 0, 0.12);
    if (type === "o") beep(390, 0, 0.12);
    if (type === "error") beep(160, 0, 0.15, "square");
    if (type === "win") [523, 659, 784, 1047].forEach((f, n) => beep(f, n * 0.12, 0.18));
    if (type === "lose") [392, 330, 262].forEach((f, n) => beep(f, n * 0.15, 0.22));
    if (type === "draw") [330, 330].forEach((f, n) => beep(f, n * 0.15, 0.15));
  } catch (e) {
    // المتصفح مش بيدعم الصوت، عادى نكمل من غيره
  }
}
function beep(freq, delay, duration, wave = "sine") {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const start = audioCtx.currentTime + delay;
  osc.type = wave;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.15, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

//! ****************** Local Storage ******************
// بيحفظ النتيجة والإعدادات عشان متضيعش لما الصفحة تتقفل
function saveData() {
  try {
    localStorage.setItem(
      "ticTacToe",
      JSON.stringify({
        score1: player1.score,
        score2: player2.score,
        ties: ties,
        vsComputer: vsComputer,
        level: level,
        soundOn: soundOn,
      })
    );
  } catch (e) {}
}
// بيرجع اللى اتحفظ
function loadData() {
  try {
    const data = JSON.parse(localStorage.getItem("ticTacToe"));
    if (!data) return;
    player1.score = data.score1 || 0;
    player2.score = data.score2 || 0;
    ties = data.ties || 0;
    vsComputer = !!data.vsComputer;
    level = levels[data.level] ? data.level : 0;
    soundOn = data.soundOn !== false;
  } catch (e) {}
}
