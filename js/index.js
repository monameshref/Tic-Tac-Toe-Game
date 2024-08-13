"use strict"

//! ****************** Global Variables ******************
const itemBox = document.querySelectorAll(".item");
const currentTurn = document.querySelector("section .head-game ul li:nth-child(2) span:nth-child(2)");
const player1Score = document.querySelector("section .footer-game .score1");
const player2Score = document.querySelector("section .footer-game .score2");
const draw = document.querySelector("section .footer-game .draw");
const resetBtn = document.querySelector(".reset");
const overlay = document.querySelector(".overlay");
const overlayMessage = document.querySelector(".overlay .message .content");
const closeMessage = document.querySelector(".overlay .message .close");

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

checkTurn();

//! ****************** Function ******************
// اللى عليه الدو (item) بيعدى على ال
for (let i = 0; i < itemBox.length; i++) {
  itemBox[i].addEventListener("click", function () {
    if (isEmpty(i)) {
      if (turn) {
        addSymbol(player1, i);
        turn = false;
        checkTurn();
        checkWinner(player1);
      } else {
        addSymbol(player2, i);
        turn = true;
        checkTurn();
        checkWinner(player2);
      }
    } else {
      alert("Choose An Empty Ceil");
    }
  });
}

// (X O) بيضيف الرمز
function addSymbol(player, i) {
  itemBox[i].innerHTML = player.symbol;
  player.played.push(i);
  usedCeils.push(i);
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
        player.score++;
        // console.log(player.score);
        showScore();
        displayMessage(player, winner);
        resetGame();
      }
    });
  }
  if (!winner && usedCeils.length === 9) {
    ties++;
    showScore();
    displayMessage(player, winner);
  }
}
// (footer game) فى (winner score) بيعرض ال
function showScore() {
  player1Score.innerHTML = player1.score;
  player2Score.innerHTML = player2.score;
  draw.innerHTML = ties;
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
  itemBox.forEach((item) => {
    item.innerHTML = "";
  });
  turn = true;
  winner = false;
  usedCeils = [];
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
  } else {
    overlayMessage.innerHTML = `<p>It is the </p>
                                <h2>Draw</h2>`;
  }
  resetGame();
}
// overlay بيقفل
closeMessage.addEventListener("click", function () {
  overlay.classList.add("d-none");
});
