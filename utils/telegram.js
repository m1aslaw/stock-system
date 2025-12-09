const axios = require('axios');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(text) {
    if (!botToken || !chatId) {
        console.warn('Telegram not configured');
        return;
    }
    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text,
            parse_mode: 'HTML'
        });
    } catch (err) {
        console.error('Telegram send error', err?.response?.data || err.message);
    }
}

module.exports = { sendTelegramMessage };
