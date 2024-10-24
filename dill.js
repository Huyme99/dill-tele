const axios = require('axios');
const cron = require('node-cron');

const url = 'https://alps.dill.xyz/api/trpc/stats.getAllValidators?input=%7B%22json%22%3Anull%2C%22meta%22%3A%7B%22values%22%3A%5B%22undefined%22%5D%7D%7D';
const pubkeys = [
    "0xadf299c519546d4861d65664111b0595b48a5372e625bc6fbdc6643ab846be1eef3a5229d1b9b9fe0f706be57994f701",
    "0xa4801f23091e126a36e2e8e208b0f4f4af3db9e960f5346cb681156ac43a1a3743dbd0f4ae1941bba3dd88249dee9bfb"
]; // Thêm các pubkey khác vào đây

const telegramToken = 'YOUR_TELEGRAM_BOT_TOKEN'; // Token của bot Telegram
const telegramChatId = 'YOUR_TELEGRAM_CHAT_ID'; // ID của chat Telegram

const color = {
    reset: "\x1b[0m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    green: "\x1b[32m",
};

async function sendMessageToTelegram(message) {
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    try {
        await axios.post(telegramUrl, {
            chat_id: telegramChatId,
            text: message,
            parse_mode: 'HTML' // Sử dụng HTML để định dạng
        });
        console.log(`${color.green}Thông báo đã được gửi tới Telegram!`);
    } catch (error) {
        console.error('Lỗi khi gửi thông báo tới Telegram:', error);
    }
}

async function fetchData() {
    console.log('Đang lấy dữ liệu...');

    try {
        const response = await axios.get(url);
        const data = response.data;
        const validators = data.result.data.json.data;

        console.log('Dữ liệu đã được lấy thành công!');

        if (Array.isArray(validators)) {
            let messages = [];
            pubkeys.forEach(pubkey => {
                const validatorData = validators.find(validator => validator.validator.pubkey === pubkey);
                if (validatorData) {
                    const balance = parseFloat(validatorData.balance / 1e9).toFixed(4);
                    const link = `<a href="https://alps.dill.xyz/validators?pubkey=${pubkey}">${pubkey}</a>`;
                    const message = `🟢 Số lượng Dill của <u>${link}</u> hiện tại là <b>${balance}</b>`;
                    console.log(`🟢 Số lượng Dill của ${color.blue}${pubkey}${color.reset} hiện tại là ${color.yellow}${balance}${color.reset}`);
                    messages.push(message);
                } else {
                    const errorMessage = `🔴 Không tìm thấy validator với pubkey là "<a href="https://alps.dill.xyz/validators?pubkey=${pubkey}">${pubkey}</a>".`;
                    console.log(`🔴 Không tìm thấy validator với pubkey là "${pubkey}".`);
                    messages.push(errorMessage);
                }
            });

            // Thêm dấu chia cách giữa các thông báo
            const finalMessage = messages.join('\n================================================================================\n');
            sendMessageToTelegram(finalMessage);
        } else {
            console.error('Dữ liệu trong khóa json.data không phải là mảng.');
        }
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
    }
}

// Lập lịch chạy đoạn mã vào 7h sáng mỗi ngày
cron.schedule('0 7 * * *', async () => {
    await fetchData();
    console.log('Đã lập lịch chạy đoạn mã vào 7h sáng mỗi ngày theo giờ Việt Nam.');
}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
});

// Chạy đoạn mã ngay lập tức để in ra kết quả tại thời điểm chạy lệnh
fetchData().then(() => {
    console.log('Đã lập lịch chạy đoạn mã vào 7h sáng mỗi ngày theo giờ Việt Nam.');
});