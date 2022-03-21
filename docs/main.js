'use strict';

var today = new Date();
today.setTime(today.getTime());
var year = today.getFullYear();
var yearStr = year.toString().substring(2, 4);
var month = today.getMonth() + 1;
var monthStr = month < 10 ? '0' + month.toString() : month.toString();
var day = today.getDate();
var dayStr = day < 10 ? '0' + day.toString() : day.toString();
var todayStr = '' + yearStr + monthStr + dayStr;
var submittedNumbers = [];
var usedNumbers = [];
var correctAnswer = '';
var newestAnswer = [];
var round = 0;
var endgame = false;
var maxRound = 6;
var upperKey = '12345\u232B';
var lowerKey = '67890\u21B5';
document.getElementById('seed-input-textbox').value = todayStr;

var initCorrectAnswer = function initCorrectAnswer(seed) {
  correctAnswer = String((seed | 0) * 2147483647 % 48271 % 100000).padStart(5, '0');
};

var seedSubmit = function seedSubmit() {
  var seedInput = document.getElementById('seed-input-textbox').value;
  newestAnswer = [];
  round = 0;
  endgame = false;
  initCorrectAnswer(seedInput);
  makeEachKeypad();
  renderSquares();
};

var seedRandomSubmit = function seedRandomSubmit() {
  var randomNum = Math.floor(Math.random() * 1000002);
  document.getElementById('seed-input-textbox').value = randomNum;
  seedSubmit();
};

var submit = function submit() {
  if (correctAnswer.length == 0) {
    return;
  } else if (endgame == true) {
    return;
  }
  if (!isFilledCurrentLine()) {
    return;
  }
  for (var i = 0; i < 5; i++) {
    var cell = document.getElementById('square-r' + round + 'c' + i);
    newestAnswer.push(cell.textContent);
    submittedNumbers.push(cell.textContent);
  }
  renderSquares();
  makeEachKeypad();
  if (newestAnswer.join('') === correctAnswer || round == 5) {
    endgame = true;
    return;
  }
  newestAnswer = [];
  round += 1;
};

var makeKeypad = function makeKeypad(isUpper) {
  var keypadId = isUpper ? 'keypad-upper' : 'keypad-lower';
  var keypad = document.getElementById(keypadId);
  var keypadClone = keypad.cloneNode(false);
  keypad.parentNode.replaceChild(keypadClone, keypad);
  keypad = document.getElementById(keypadId);
  var keys = (isUpper ? upperKey : lowerKey).split('');
  for (var i = 0; i < keys.length; i++) {
    var button = document.createElement('button');
    if (submittedNumbers.includes(keys[i])) {
      for (var row = 0; row < submittedNumbers.length / 5; row++) {
        for (var column = 0; column < 5; column++) {
          if (submittedNumbers[5 * row + column] === correctAnswer.split('')[column] && submittedNumbers[5 * row + column] === keys[i]) {
            button.classList.add('green');
            break;
          }
        }
      }
      if (button.classList.contains('green')) {} else if (correctAnswer.split('').includes(keys[i])) {
        button.classList.add('yellow');
      } else {
        button.classList.add('grey');
      }
    } else {
      button.classList.add('not-used');
    }
    button.classList.add('answer-keypad-key');
    button.textContent = keys[i];
    if (isNaN(keys[i])) {
      if (keys[i] === '\u232B') {
        button.onclick = removeNumberFromSquare;
      } else if (keys[i] === '\u21B5') {
        button.onclick = submit;
      }
    } else {
      button.id = 'button' + keys[i];
      button.setAttribute('onclick', 'numberButton(this.id)');
    }
    var wrapper = document.createElement('div');
    wrapper.classList.add('answer-keypad-key-wrapper');
    keypad.appendChild(wrapper);
    wrapper.appendChild(button);
  }
};

var makeEachKeypad = function makeEachKeypad() {
  makeKeypad(true);
  makeKeypad(false);
};

var isHit = function isHit(num, position) {
  return correctAnswer.split('')[position] == num;
};

var isBlow = function isBlow(num) {
  return correctAnswer.split('').includes(num);
};

var isBlowInLeft = function isBlowInLeft(num, position) {
  var left = correctAnswer.slice(0, position);
  return left.includes(num);
};

var isBlowInRight = function isBlowInRight(num, position) {
  var right = correctAnswer.slice(position + 1);
  return right.includes(num);
};

var enterSeed = function enterSeed(event) {
  if (event.key === 'Enter') {
    seedSubmit();
  }
};

var countNumInArray = function countNumInArray(array, num) {
  return array.filter(function (x) {
    return x === num;
  }).length;
};

var countMatchedNumInArray = function countMatchedNumInArray(array, num, position, isLeftOfPosition) {
  var count = 0;
  for (var i = 0; i < array.length; i++) {
    if (array[i][1] == num && (isLeftOfPosition && array[i][0] < position || !isLeftOfPosition && array[i][0] > position)) {
      count++;
    }
  }
  return count;
};

var makeSquaresLine = function makeSquaresLine(row) {
  var squaresLine = document.createElement('div');
  squaresLine.classList.add('answer-keypad');
  var match_index_num = [];
  for (var i = 0; i < 5; i++) {
    if (isHit(submittedNumbers[row * 5 + i], i)) {
      match_index_num.push([i, submittedNumbers[row * 5 + i]]);
    }
  }
  for (var _i = 0; _i < 5; _i++) {
    var square = document.createElement('button');
    if (isHit(submittedNumbers[row * 5 + _i], _i)) {
      square.classList.add('green');
    } else if (isBlowInLeft(submittedNumbers[row * 5 + _i], _i)) {
      var countNumInLeft = countNumInArray(submittedNumbers.slice(row * 5, row * 5 + _i), submittedNumbers[row * 5 + _i]);
      var countMatchInRight = countMatchedNumInArray(match_index_num, submittedNumbers[row * 5 + _i], _i, false);
      var countUsedInAnswer = countNumInArray(correctAnswer.split(''), submittedNumbers[row * 5 + _i]);
      if (countMatchInRight + countNumInLeft >= countUsedInAnswer) {
        square.classList.add('grey');
      } else {
        square.classList.add('yellow');
      }
    } else if (isBlowInRight(submittedNumbers[row * 5 + _i], _i)) {
      var _countNumInLeft = countNumInArray(submittedNumbers.slice(row * 5, row * 5 + _i), submittedNumbers[row * 5 + _i]);
      var _countMatchInRight = countMatchedNumInArray(match_index_num, submittedNumbers[row * 5 + _i], _i, false);
      var _countUsedInAnswer = countNumInArray(correctAnswer.split(''), submittedNumbers[row * 5 + _i]);
      if (_countMatchInRight === _countUsedInAnswer && _countMatchInRight >= 1 || _countNumInLeft >= _countUsedInAnswer) {
        square.classList.add('grey');
      } else {
        square.classList.add('yellow');
      }
    } else {
      square.classList.add('grey');
    }
    square.classList.add('answer-keypad-key');
    square.classList.add('square-char-color');
    square.textContent = submittedNumbers[row * 5 + _i];
    square.id = 'square-r' + row + 'c' + _i;
    var wrapper = document.createElement('div');
    wrapper.classList.add('answer-keypad-key-wrapper');
    squaresLine.appendChild(wrapper);
    wrapper.appendChild(square);
  }
  return squaresLine;
};

var makeEmptySquaresLine = function makeEmptySquaresLine(row) {
  var squaresLine = document.createElement('div');
  squaresLine.classList.add('answer-keypad');
  for (var i = 0; i < 5; i++) {
    var square = document.createElement('button');
    square.classList.add('answer-keypad-key');
    square.classList.add('none-cell');
    square.classList.add('cell-border');
    square.id = 'square-r' + row + 'c' + i;
    var wrapper = document.createElement('div');
    wrapper.classList.add('answer-keypad-key-wrapper');
    squaresLine.appendChild(wrapper);
    wrapper.appendChild(square);
  }
  return squaresLine;
};

var renderSquares = function renderSquares() {
  var squaresWrapper = document.getElementById('squares-wrapper');
  var squaresWrapperClone = squaresWrapper.cloneNode(false);
  squaresWrapper.parentNode.replaceChild(squaresWrapperClone, squaresWrapper);
  squaresWrapper = document.getElementById('squares-wrapper');
  for (var i = 0; i < 6; i++) {
    if (i * 5 < submittedNumbers.length) {
      squaresWrapper.appendChild(makeSquaresLine(i));
    } else {
      squaresWrapper.appendChild(makeEmptySquaresLine(i));
    }
  }
};

var isFilledCurrentLine = function isFilledCurrentLine() {
  for (var i = 0; i < 5; i++) {
    var square = document.getElementById('square-r' + round + 'c' + i);
    var text = square.textContent;
    if (!text) {
      return false;
    }
  }
  return true;
};

var getNextSquarePosition = function getNextSquarePosition() {
  for (var row = 0; row < round + 1; row++) {
    for (var column = 0; column < 5; column++) {
      var square = document.getElementById('square-r' + row + 'c' + column);
      var text = square.textContent;
      if (!text) {
        return [row, column];
      }
    }
  }
  return [-1, -1];
};

var updateSquare = function updateSquare(input) {
  var nextSquarePosition = getNextSquarePosition();
  if (nextSquarePosition[0] === -1) {
    return;
  }
  var square = document.getElementById('square-r' + nextSquarePosition[0] + 'c' + nextSquarePosition[1]);
  square.textContent = input;
};

var numberButton = function numberButton(id) {
  if (endgame) {
    return;
  }
  var button = document.getElementById(id);
  var number = button.textContent;
  updateSquare(number);
};

var removeNumberFromSquare = function removeNumberFromSquare() {
  if (endgame) {
    return;
  }
  var nextSquarePosition = getNextSquarePosition();
  if (nextSquarePosition[1] <= 0) {
    return;
  }
  var row = nextSquarePosition[0];
  var column = nextSquarePosition[1] - 1;
  var square = document.getElementById('square-r' + row + 'c' + column);
  square.textContent = '';
};

var openTwitterLink = function openTwitterLink() {
  if (!endgame) {
    return;
  }
  var seed = document.getElementById('seed-input-textbox').value;
  var squareStr = 'Numberle ' + seed + ' ' + (round + 1) + '/6\n\n';
  for (var i = 0; i < round + 1; i++) {
    for (var j = 0; j < 5; j++) {
      var square = document.getElementById('square-r' + i + 'c' + j);
      if (square.classList.contains('green')) {
        squareStr += '\uD83D\uDFE9';
      } else if (square.classList.contains('yellow')) {
        squareStr += '\uD83D\uDFE8';
      } else if (square.classList.contains('grey')) {
        squareStr += '\u2B1B';
      }
    }
    squareStr += '\n';
  }
  var uri = 'https://twitter.com/intent/tweet?text=' + squareStr + '\n' + location.href;
  window.open(encodeURI(uri));
};

initCorrectAnswer(todayStr);
makeEachKeypad();
renderSquares();
