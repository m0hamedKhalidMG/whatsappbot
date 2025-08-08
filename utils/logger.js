const fs = require('fs');
const path = require('path');

function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}\n`;
  const logPath = path.join(__dirname, '..', 'logs');

  // if (!fs.existsSync(logPath)) fs.mkdirSync(logPath);

  // const file = path.join(logPath, isError ? 'error.log' : 'activity.log');
  // fs.appendFileSync(file, fullMessage);
  console[isError ? 'error' : 'log'](message);
}

module.exports = log;
