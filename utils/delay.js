module.exports = function smartDelay(min = 5000, max = 10000) {
  const delayMs = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delayMs));
};
