const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Get credentials from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Parse JSON bodies

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Dev Mobile Backend is running!');
});

// API endpoint to send the Telegram alert
app.post('/api/send-telegram-alert', async (req, res) => {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('Telegram credentials are not configured in the .env file.');
        return res.status(500).json({ success: false, message: 'Server is not configured for notifications.' });
    }

    const { order, user } = req.body;

    if (!order) {
        return res.status(400).json({ success: false, message: 'Order data is missing.' });
    }
    
    // Construct a detailed message
    const message = `
📦 *New Order Received!*

*Order ID:* \`${order.id}\`
*Customer:* ${user?.name || `${order.deliveryAddress.firstName} ${order.deliveryAddress.lastName}`}
*Total Amount:* ₹${order.total.toLocaleString('en-IN')}
*Payment Status:* ${order.status}

*Items:*
${order.items.map(item => `- ${item.product.name} (Qty: ${item.quantity})`).join('\n')}

Please verify the payment in the admin panel.
    `.trim();

    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        await axios.post(telegramApiUrl, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown',
        });
        console.log(`✅ Telegram alert sent for Order ID: ${order.id}`);
        res.status(200).json({ success: true, message: 'Alert sent successfully.' });
    } catch (error) {
        console.error('❌ Failed to send Telegram alert:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to send Telegram alert.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn('⚠️ WARNING: Telegram credentials (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) are missing. Notifications will not work. Please create a .env file in the /backend directory.');
    }
});
