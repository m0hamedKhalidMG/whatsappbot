// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const WhatsAppAttendanceBot = require('./attendanceBot');

// const bot = new WhatsAppAttendanceBot();
// bot.initialize();

// const app = express();
// app.use(cors()); // ← enable CORS for all origins
// app.use(bodyParser.json());
// // POST /notifications/attendance
// app.post('/notifications/attendance', async (req, res) => {
//   const { students } = req.body;
//   try {
//     await bot.sendBulkNotifications(students);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /notifications/payment
// app.post('/notifications/payment', async (req, res) => {
//   const { reminders } = req.body;
//   try {
//     await bot.sendPaymentReminders(reminders);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// const PORT = process.env.PORT || 80;
// app.listen(PORT, () =>
//   console.log(`⚡ Notification server listening on ${PORT}`)
// );

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const WhatsAppAttendanceBot = require('./attendanceBot');

// مسار Chromium على Ubuntu AWS (تأكد باستخدام `which chromium-browser`)
const CHROME_PATH = '/usr/bin/chromium-browser';

// إنشاء البوت مع إعدادات Puppeteer مناسبة للسيرفر
const bot = new WhatsAppAttendanceBot({
  puppeteer: {
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--no-zygote',
      '--single-process'
    ]
  }
});

bot.initialize();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// POST /notifications/attendance
app.post('/notifications/attendance', async (req, res) => {
  const { students } = req.body;
  try {
    await bot.sendBulkNotifications(students);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /notifications/payment
app.post('/notifications/payment', async (req, res) => {
  const { reminders } = req.body;
  try {
    await bot.sendPaymentReminders(reminders);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () =>
  console.log(`⚡ Notification server listening on ${PORT}`)
);
