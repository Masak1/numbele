const today = new Date();
today.setTime(today.getTime());
const year = today.getFullYear();
const yearStr = year.toString().substring(2, 4);
const month = today.getMonth() + 1;
const monthStr = month < 10 ? '0' + month.toString() : month.toString();
const day = today.getDate();
const dayStr = day < 10 ? '0' + day.toString() : day.toString();
const todayStr = `${yearStr}${monthStr}${dayStr}`;
let submittedNumbers = [];
let usedNumbers = [];
let correctAnswer = '';
let newestAnswer = [];
let round = 0;
let endgame = false;
const maxRound = 6;
const upperKey = '12345\u{232B}'
const lowerKey = '67890\u{21B5}'
document.getElementById('seed-input-textbox').value = todayStr;

const initCorrectAnswer = (seed) => {
  correctAnswer = String((seed | 0) * 2147483647 % 48271 % 100000).padStart(5, '0');
};

const seedSubmit = () => {
  const seedInput = document.getElementById('seed-input-textbox').value;
  newestAnswer = [];
  round = 0;
  endgame = false;
  initCorrectAnswer(seedInput);
  makeEachKeypad();
  renderSquares();
};

const seedRandomSubmit = () => {
  const randomNum = Math.floor(Math.random() * 1000002);
  document.getElementById('seed-input-textbox').value = randomNum;
  seedSubmit();
};

const submit = () => {
  if (correctAnswer.length == 0) {
    return;
  } else if (endgame == true) {
    return;
  }
  if (!isFilledCurrentLine()) {
    return;
  }
  for (let i = 0; i < 5; i++) {
    const cell = document.getElementById(`square-r${round}c${i}`);
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

const makeKeypad = (isUpper) => {
  const keypadId = isUpper ? 'keypad-upper' : 'keypad-lower'
  let keypad = document.getElementById(keypadId);
  const keypadClone = keypad.cloneNode(false);
  keypad.parentNode.replaceChild(keypadClone, keypad);
  keypad = document.getElementById(keypadId);
  const keys = (isUpper ? upperKey : lowerKey).split('');
  for (let i = 0; i < keys.length; i++) {
    const button = document.createElement('button');
    if (submittedNumbers.includes(keys[i])) {
      for (let row = 0; row < submittedNumbers.length / 5; row++) {
        for (let column = 0; column < 5; column++) {
          if (submittedNumbers[5 * row + column] === correctAnswer.split('')[column]
            && submittedNumbers[5 * row + column] === keys[i]) {
            button.classList.add('green');
            break;
          }
        }
      }
      if (button.classList.contains('green')) {
      } else if (correctAnswer.split('').includes(keys[i])) {
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
      if (keys[i] === '\u{232B}') {
        button.onclick = removeNumberFromSquare;
      } else if (keys[i] === '\u{21B5}') {
        button.onclick = submit;
      }
    } else {
      button.id = `button${keys[i]}`;
      button.setAttribute('onclick', 'numberButton(this.id)');
    }
    const wrapper = document.createElement('div');
    wrapper.classList.add('answer-keypad-key-wrapper');
    keypad.appendChild(wrapper);
    wrapper.appendChild(button);
  }
};

const makeEachKeypad = () => {
  makeKeypad(true);
  makeKeypad(false);
};

const isHit = (num, position) => {
  return correctAnswer.split('')[position] == num;
};

const isBlow = (num) => {
  return correctAnswer.split('').includes(num);
};

const isBlowInLeft = (num, position) => {
  const left = correctAnswer.slice(0, position);
  return left.includes(num);
};

const isBlowInRight = (num, position) => {
  const right = correctAnswer.slice(position + 1);
  return right.includes(num);
};

const enterSeed = (event) => {
  if (event.key === 'Enter') {
    seedSubmit();
  }
};

const countNumInArray = (array, num) => {
  return array.filter(function (x) { return x === num }).length;
};

const countMatchedNumInArray = (array, num, position, isLeftOfPosition) => {
  let count = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i][1] == num
      && (isLeftOfPosition && array[i][0] < position
        || !isLeftOfPosition && array[i][0] > position)) {
      count++;
    }
  }
  return count;
};

const makeSquaresLine = (row) => {
  const squaresLine = document.createElement('div');
  squaresLine.classList.add('answer-keypad');
  let match_index_num = [];
  for (let i = 0; i < 5; i++) {
    if (isHit(submittedNumbers[row * 5 + i], i)) {
      match_index_num.push([i, submittedNumbers[row * 5 + i]]);
    }
  }
  for (let i = 0; i < 5; i++) {
    const square = document.createElement('button');
    if (isHit(submittedNumbers[row * 5 + i], i)) {
      square.classList.add('green');
    } else if (isBlowInLeft(submittedNumbers[row * 5 + i], i)) {
      const countNumInLeft = countNumInArray(submittedNumbers.slice(row * 5, row * 5 + i),
        submittedNumbers[row * 5 + i]);
      const countMatchInRight = countMatchedNumInArray(
        match_index_num, submittedNumbers[row * 5 + i], i, false
      );
      const countUsedInAnswer = countNumInArray(correctAnswer.split(''), submittedNumbers[row * 5 + i]);
      if (countMatchInRight + countNumInLeft >= countUsedInAnswer) {
        square.classList.add('grey');
      } else {
        square.classList.add('yellow');
      }
    } else if (isBlowInRight(submittedNumbers[row * 5 + i], i)) {
      const countNumInLeft = countNumInArray(submittedNumbers.slice(row * 5, row * 5 + i),
        submittedNumbers[row * 5 + i]);
      const countMatchInRight = countMatchedNumInArray(
        match_index_num, submittedNumbers[row * 5 + i], i, false
      );
      const countUsedInAnswer = countNumInArray(correctAnswer.split(''), submittedNumbers[row * 5 + i]);
      if (countMatchInRight === countUsedInAnswer
        && countMatchInRight >= 1
        || countNumInLeft >= countUsedInAnswer) {
        square.classList.add('grey');
      } else {
        square.classList.add('yellow');
      }
    } else {
      square.classList.add('grey');
    }
    square.classList.add('answer-keypad-key');
    square.classList.add('square-char-color');
    square.textContent = submittedNumbers[row * 5 + i];
    square.id = `square-r${row}c${i}`;
    const wrapper = document.createElement('div');
    wrapper.classList.add('answer-keypad-key-wrapper');
    squaresLine.appendChild(wrapper);
    wrapper.appendChild(square);
  }
  return squaresLine;
};

const makeEmptySquaresLine = (row) => {
  const squaresLine = document.createElement('div');
  squaresLine.classList.add('answer-keypad');
  for (let i = 0; i < 5; i++) {
    const square = document.createElement('button');
    square.classList.add('answer-keypad-key');
    square.classList.add('none-cell');
    square.classList.add('cell-border');
    square.id = `square-r${row}c${i}`;
    const wrapper = document.createElement('div');
    wrapper.classList.add('answer-keypad-key-wrapper');
    squaresLine.appendChild(wrapper);
    wrapper.appendChild(square);
  }
  return squaresLine;
};

const renderSquares = () => {
  let squaresWrapper = document.getElementById('squares-wrapper');
  const squaresWrapperClone = squaresWrapper.cloneNode(false);
  squaresWrapper.parentNode.replaceChild(squaresWrapperClone, squaresWrapper);
  squaresWrapper = document.getElementById('squares-wrapper');
  for (let i = 0; i < 6; i++) {
    if (i * 5 < submittedNumbers.length) {
      squaresWrapper.appendChild(makeSquaresLine(i));
    } else {
      squaresWrapper.appendChild(makeEmptySquaresLine(i));
    }
  }
};

const isFilledCurrentLine = () => {
  for (let i = 0; i < 5; i++) {
    const square = document.getElementById(`square-r${round}c${i}`);
    const text = square.textContent;
    if (!text) {
      return false;
    }
  }
  return true;
};

const getNextSquarePosition = () => {
  for (let row = 0; row < round + 1; row++) {
    for (let column = 0; column < 5; column++) {
      const square = document.getElementById(`square-r${row}c${column}`);
      const text = square.textContent;
      if (!text) {
        return [row, column];
      }
    }
  }
  return [-1, -1];
};

const updateSquare = (input) => {
  const nextSquarePosition = getNextSquarePosition();
  if (nextSquarePosition[0] === -1) {
    return;
  }
  const square = document.getElementById(`square-r${nextSquarePosition[0]}c${nextSquarePosition[1]}`);
  square.textContent = input;
};

const numberButton = (id) => {
  if (endgame) {
    return;
  }
  const button = document.getElementById(id);
  const number = button.textContent;
  updateSquare(number);
};

const removeNumberFromSquare = () => {
  if (endgame) {
    return;
  }
  const nextSquarePosition = getNextSquarePosition();
  if (nextSquarePosition[1] <= 0) {
    return;
  }
  const row = nextSquarePosition[0];
  const column = nextSquarePosition[1] - 1;
  const square = document.getElementById(`square-r${row}c${column}`);
  square.textContent = '';
};

const openTwitterLink = () => {
  if (!endgame) {
    return;
  }
  const seed = document.getElementById('seed-input-textbox').value;
  let squareStr = `Numberle ${seed} ${round + 1}/6\n\n`;
  for (let i = 0; i < round + 1; i++) {
    for (let j = 0; j < 5; j++) {
      const square = document.getElementById(`square-r${i}c${j}`);
      if (square.classList.contains('green')) {
        squareStr += '\u{1F7E9}';
      } else if (square.classList.contains('yellow')) {
        squareStr += '\u{1F7E8}';
      } else if (square.classList.contains('grey')) {
        squareStr += '\u{2B1B}';
      }
    }
    squareStr += '\n';
  }
  const uri = 'https://twitter.com/intent/tweet?text=' + squareStr + '\n' + location.href;
  window.open(encodeURI(uri));
}

initCorrectAnswer(todayStr);
makeEachKeypad();
renderSquares();