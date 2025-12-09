require('dotenv').config();
const { sendTelegramMessage } = require('./utils/telegram');

async function test() {
    console.log('Testing Telegram...');
    try {
        await sendTelegramMessage(' Test Message from Antigravity Verification');
        console.log('Message sent!');
    } catch (e) {
        console.error('Failed:', e);
    }
}

test();
