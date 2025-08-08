const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const moment = require('moment');
const config = require('./config/default.json');
const delay = require('./utils/delay');
const log = require('./utils/logger');

class WhatsAppAttendanceBot {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: 'attendance-bot' }),
      puppeteer: {
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          // ... your other args
        ],
      },
    });
  }

  async initialize() {
    log('🚀 Initializing WhatsApp client...');

    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      log('📱 QR code generated. Please scan it with your phone.');
    });

    this.client.on('ready', () => {
      log('✅ WhatsApp client is ready!');
      this.processAttendance();
    });

    this.client.on('auth_failure', (msg) => {
      log(`❌ Auth failure: ${msg}`, true);
    });

    this.client.on('disconnected', (reason) => {
      log(`⚠️ Disconnected: ${reason}`, true);
    });

    try {
      await this.client.initialize();
    } catch (err) {
      log(`❌ Initialization error: ${err.message}`, true);
    }
  }

  /**
   * Build the personalized message.
   * If student.absentCount is defined, use monthlyTemplate,
   * otherwise use daily messageTemplate.
   */
  generatePersonalizedMessage(student) {
    // Pick template
    const tpl =
      student.absentCount != null
        ? config.whatsapp.monthlyTemplate
        : config.whatsapp.messageTemplate;

    // Always use today's date
    const date = moment().format('YYYY-MM-DD');

    // Start with a random emoji + invisible chars + random hash
    const emojiSet = ['📢', '📌', '📝', '⚠️', '🔔'];
    const emoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
    const invisible = '\u200B'.repeat(Math.floor(Math.random() * 3) + 1);
    const randomHash = Math.floor(Math.random() * 999)
      .toString()
      .padStart(3, '0');

    // Replace placeholders
    let msg = tpl
      .replace('{studentName}', student.studentName)
      .replace('{className}', student.className)
      .replace('{date}', date)
      .replace('{schoolName}', config.school.name);

    // If monthly, also replace {absentCount}
    if (student.absentCount != null) {
      msg = msg.replace('{absentCount}', student.absentCount);
    }

    return `${emoji} ${msg}${invisible} #${randomHash}`;
  }

  async sendNotification(number, message) {
    try {
      const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
      await this.client.sendMessage(chatId, message);
      log(`✅ Sent to ${number}: ${message}`);
      await delay();
    } catch (err) {
      log(`❌ Error sending to ${number}: ${err.message}`, true);
    }
  }

  async sendBulkNotifications(students) {
    for (const s of students) {
      const msg = this.generatePersonalizedMessage(s);
      await this.sendNotification(s.parentNumber, msg);
    }
  }

  async sendPaymentReminders(reminders) {
    for (const r of reminders) {
      const tpl = config.whatsapp.paymentTemplate;
      const msg = tpl
        .replace('{studentName}', r.studentName)
        .replace('{month}', r.month)
        .replace('{year}', r.year)
        .replace('{schoolName}', config.school.name);
      await this.sendNotification(r.parentNumber, msg);
    }
  }

  // Example: loads dummy data; replace with your real DB/API calls.
  async loadDummyAttendanceData() {
    // For daily: studentName, className, parentWhatsAppNumber, date
    // For monthly: add absentCount
    return [
      // Daily example
      {
        studentName: 'Mohamed Khaled',
        className: 'A-1',
        parentName: 'Mrs. Khaled',
        parentNumber: '201019648129',
        // date is ignored, we'll inject today automatically
      },
      // Monthly example
      {
        studentName: 'Sarah Johnson',
        className: 'A-1',
        parentName: 'Mr. Johnson',
        parentNumber: '201009530093',
        absentCount: 5, // ← monthly stat
      },
    ];
  }

  async processAttendance() {
    try {
      const absentStudents = await this.loadDummyAttendanceData();
      await this.sendBulkNotifications(absentStudents);
      log('🎉 Finished sending attendance notifications.');
    } catch (err) {
      log(`❌ Attendance process error: ${err.message}`, true);
    }
  }
}

module.exports = WhatsAppAttendanceBot;
