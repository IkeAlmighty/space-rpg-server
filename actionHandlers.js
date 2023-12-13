// actionHandlers.js

// Global state object
const state = {
  entities: [],
};

// Function to handle the 'add' action
const addAction = (a, b, callback) => {
  state.counter += a + b;
  callback(state.counter);
};

// Function to handle the 'multiply' action
const multiplyAction = (a, b, callback) => {
  state.counter += a * b;
  callback(state.counter);
};

module.exports = {
  addAction,
  multiplyAction,
  // Add more action handlers as needed
};
