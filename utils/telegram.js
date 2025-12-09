const axios = require('axios');

async function sendTelegramMessage(text) {
    // Read inside function to ensure env is loaded
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.error('Telegram Error: Missing Credentials', {
            hasToken: !!botToken,
            hasChatId: !!chatId
        });
        return;
    }
    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text,
            parse_mode: 'HTML'
        });
        console.log('Telegram sent successfully');
    } catch (err) {
        console.error('Telegram send error:', err?.response?.data || err.message);
    }
}

module.exports = { sendTelegramMessage };
