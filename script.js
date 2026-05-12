"use strict";

const display = document.querySelector(".display");
const keys = document.querySelector(".keys");
const calculator = document.querySelector(".calculator");
const toggleBtn = document.querySelector("#toggle_calc_btn");

const state = {
  current: "0",
  previous: null,
  operator: null,
  //AI
  waiting: false,
  lastOperand: null,
  lastOperator: null,
};

// converting normal operator to js operator
const operatorValue = (v) => {
  if (v === "÷") return "/";
  if (v === "×") return "*";
  if (v === "↻") return "+/-";
  return v;
};

// checking if key is a number convert to string for display
const formatResult = (n) => {
  return typeof n === "number" && !Number.isNaN(n)
    ? parseFloat(n.toFixed(12)).toString()
    : "Error";
};

const displayResult = function () {
  display.value = state.current;

  if (state.previous !== null && state.operator !== null) {
    if (state.waiting) {
      //if you want to display the num and operators while typing(when waiting is false)
      display.value = `${formatResult(state.previous)} ${state.operator}`;

      //or hide it-- OS
      // display.value = formatResult(state.previous);

      return;
    }
    //if the previous and operator are not null.. display everything
    display.value = `${formatResult(state.previous)} ${state.operator} ${state.current}`;

    //or hide it and show only current num - OS
    // display.value = state.current;
    return;
  }
  // console.log(display.value);
};

const resetAll = () => {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  //AI
  state.waiting = false;
  state.lastOperand = null;
  state.lastOperator = null;
  displayResult();
};

const errorState = () => {
  state.current = "Error";
  state.previous = null;
  state.operator = null;
  //AI
  state.waiting = false;
  state.lastOperand = null;
  state.lastOperator = null;
  displayResult();
};

//the calculator maths engine - a is previous, b is current, op is operations
const calc = (a, b, op) => {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return b === 0 ? "Error" : a / b; //if current = 0. don't divide.. throw error else divide
    default:
      return b;
  }
};

function inputNumber(digit) {
  if (state.current === "Error") return;

  if (state.waiting) {
    state.current = String(digit);
    state.waiting = false;
  } else {
    //important for negative signs
    state.current =
      state.current === "0" ? String(digit) : state.current + String(digit);
  }
  displayResult();
}

const inputDecimal = function () {
  if (state.current === "Error") return;

  if (state.waiting) {
    state.current = "0."; //we can't have .5 + 2..
    state.waiting = false; //user typed num, so don't wait
  }
  // if decimal point doesn't exist in current.. append(add) it to state.current
  else if (!state.current.includes(".")) {
    state.current += ".";
  }
  displayResult();
};

//AI CODE
function inputOperator(nextOp) {
  if (state.current === "Error") return;

  const value = Number(state.current);

  if (state.operator && state.waiting) {
    state.operator = nextOp; //changing operator
    displayResult();
    return;
  }

  if (state.previous === null) {
    state.previous = value;
  } else if (state.operator) {
    const result = calc(state.previous, value, state.operator);

    if (result === "Error") return errorState();
    state.previous = result;
    state.current = formatResult(result);
  }

  state.operator = nextOp;
  state.waiting = true;
  displayResult();
}

function inputEquals() {
  if (state.current === "Error") return;

  const value = Number(state.current);

  if (state.operator !== null && state.previous !== null) {
    const result = calc(state.previous, value, state.operator);
    if (result === "Error") return errorState();

    state.lastOperand = value;
    state.lastOperator = state.operator;

    state.current = formatResult(result);
    state.previous = result;
    state.operator = null;
    state.waiting = true;
    displayResult();
    return;
  }

  if (
    state.lastOperator !== null &&
    state.lastOperand !== null &&
    state.previous !== null
  ) {
    const result = calc(state.previous, state.lastOperand, state.lastOperator);
    if (result === "Error") return errorState();

    state.current = formatResult(result);
    state.previous = result;
    state.waiting = true;
    displayResult();
  }
}
//end of AI CODE

function deleteLastDigit() {
  if (state.current === "Error") return resetAll();
  if (state.waiting) return;

  state.current = state.current.slice(0, -1); //takeS everything except last one and store to current
  if (state.current === "" || state.current === "-") state.current = "0";
  displayResult();
}

function inputPercent() {
  if (state.current === "Error") return;
  state.current = formatResult(Number(state.current) / 100);
  displayResult();
}

//AI
function toggleSign() {
  if (state.current === "Error" || state.current === "0") return;
  state.current = state.current.startsWith("-")
    ? state.current.slice(1)
    : `-${state.current}`;
  displayResult();
}

function handleButton(value) {
  value = operatorValue(value);

  // if (value >= "0" && value <= "9") return inputNumber(value);

  //from telegram -regex
  const regex = /^[0-9]$/;
  if (regex.test(value)) return inputNumber(value);

  if (value === ".") return inputDecimal();
  if (["+", "-", "*", "/"].includes(value)) return inputOperator(value);
  if (value === "=") return inputEquals();
  if (value === "AC") return resetAll();
  if (value === "DEL") return deleteLastDigit();
  if (value === "%") return inputPercent();
  if (value === "+/-") return toggleSign();
}
//end of AI

//event delegation on keys(container for the btn nodelist)
keys.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  handleButton(btn.textContent.trim());
});

// toggle calculator
function toggleCalculator() {
  calculator.classList.toggle("hidden");
}

toggleBtn.addEventListener("click", toggleCalculator);
