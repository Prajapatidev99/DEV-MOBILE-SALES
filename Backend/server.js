
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Get credentials from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Initialize Firebase Admin
let db;
try {
    let serviceAccount;
    
    // 1. Try to load from Secret File first (Render Secret File or local file)
    try {
        serviceAccount = require('./serviceAccount.json');
        console.log("✅ Loaded credentials from serviceAccount.json");
    } catch (e) {
        // File not found, proceed to check environment variable
    }

    // 2. Fallback to Environment Variable
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            console.log("✅ Loaded credentials from FIREBASE_SERVICE_ACCOUNT_JSON env var");
        } catch (e) {
            console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON env var");
        }
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log("✅ Firebase Admin initialized successfully.");
    } else {
        // Only warn if not in test environment
        if (process.env.NODE_ENV !== 'test') {
             console.warn("⚠️ WARNING: No serviceAccount.json file AND no FIREBASE_SERVICE_ACCOUNT_JSON env var found. Database features (Sitemap, etc.) will fail.");
        }
    }
} catch (e) {
    console.error('❌ Firebase Admin initialization failed:', e.message);
}


// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL, // Variable from Render
    'https://www.devmobile.shop',
    'https://devmobile.shop',
    'https://dev-mobile-sales.onrender.com' // Allow self for testing
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Strictly allow any localhost origin for development (e.g., localhost:5173, localhost:3000)
    if (origin.startsWith('http://localhost')) {
        return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight request handling across-the-board

app.use(express.json()); // Parse JSON bodies

// Middleware to secure the telegram endpoint
const requireSecretKey = (req, res, next) => {
    const secretKey = req.headers['x-secret-key'];
    // In production, use a long, randomly generated secret for BACKEND_API_SECRET.
    if (!secretKey || secretKey !== (process.env.BACKEND_API_SECRET || 'dev-secret')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
};

// Helper: Create Slug
const createSlug = (name, id) => {
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
        .replace(/(^-|-$)+/g, ''); // Remove leading/trailing hyphens
    return `${slug}-${id}`;
};

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Dev Mobile Backend is running!');
});

// --- SITEMAP GENERATOR ---
app.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = process.env.FRONTEND_URL || 'https://www.devmobile.shop';
        
        // 1. Define Static Routes
        // NOTE: These use Clean URLs (no # hash)
        const staticRoutes = [
            'home', 'shop', 'cart', 'wishlist', 'account', 
            'contact', 'faq', 'shipping', 'returns', 
            'privacy', 'terms', 'blog', 'find-store'
        ];

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add Static Routes
        staticRoutes.forEach(route => {
            sitemap += `
  <url>
    <loc>${baseUrl}/${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        // 2. Fetch Dynamic Products from Firebase
        if (db) {
            const productsSnapshot = await db.collection('products').get();
            productsSnapshot.forEach(doc => {
                const product = doc.data();
                // Escape special characters in URL
                const safeSlug = createSlug(product.name, product.id);
                // Last modified date (default to today if not found)
                const lastMod = product.dateAdded ? product.dateAdded.split('T')[0] : new Date().toISOString().split('T')[0];

                // NOTE: Using Clean URL format /product/:slug
                sitemap += `
  <url>
    <loc>${baseUrl}/product/${safeSlug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
            });
        }

        sitemap += `
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(sitemap);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// API endpoint to send the Telegram alert, now secured with a secret key
app.post('/api/send-telegram-alert', requireSecretKey, async (req, res) => {
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

// New endpoint to securely resolve mobile number to email
app.post('/api/get-email-for-mobile', requireSecretKey, async (req, res) => {
    if (!db) {
        console.error('Attempted to access /api/get-email-for-mobile but Firestore is not initialized.');
        return res.status(503).json({ success: false, message: 'Database service is not available.' });
    }
    
    const { mobile } = req.body;
    if (!mobile) {
        return res.status(400).json({ success: false, message: 'Mobile number is missing.' });
    }

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('mobile', '==', mobile).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'No account found with that mobile number.' });
        }

        const user = snapshot.docs[0].data();
        if (!user.email) {
            return res.status(404).json({ success: false, message: 'Account associated with this mobile number does not have an email for login.' });
        }

        res.status(200).json({ success: true, email: user.email });
    } catch (error) {
        console.error('Error fetching user by mobile:', error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
});


// Secure proxy endpoint for Gemini API
app.post('/api/generate-content', async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
        console.error('Gemini API key (GEMINI_API_KEY) is not configured in the .env file.');
        return res.status(500).json({ success: false, message: 'Server is not configured for AI features.' });
    }

    const { prompt, config } = req.body;
    if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is missing.' });
    }

    const maxRetries = 3;
    let attempt = 0;
    let delay = 1000; // start with 1 second

    while (attempt < maxRetries) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            
            const genAIResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: config || {},
            });

            if (!genAIResponse || !genAIResponse.text) {
                console.warn(`Gemini API returned an empty or invalid response.`);
                // Throwing an error to potentially trigger a retry for transient issues.
                throw new Error('UNAVAILABLE: Empty or invalid response from model.');
            }

            let text = genAIResponse.text;
            
            // Clean the response text to ensure it's valid JSON if it's wrapped in markdown
            if (text.startsWith('```json')) {
                text = text.replace(/```json\n?/, '').replace(/```$/, '');
            }
            text = text.trim();

            return res.status(200).json({ success: true, text });

        } catch (error) {
            attempt++;
            
            const isRetryable = error.message && (error.message.includes('UNAVAILABLE') || error.message.includes('overloaded') || error.message.includes('503'));

            if (isRetryable && attempt < maxRetries) {
                console.warn(`Gemini API call attempt ${attempt} failed. Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                console.error(`❌ Failed to call Gemini API after ${attempt} attempts:`, error.message);
                const details = error.response?.data?.error?.message || error.message;
                return res.status(500).json({ success: false, message: 'Failed to generate content from AI.', details });
            }
        }
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn('⚠️ WARNING: Telegram credentials (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) are missing. Notifications will not work. Please create a .env file in the /backend directory.');
    }
     if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️ WARNING: Gemini API key (GEMINI_API_KEY) is missing. AI features will not work. Please add it to your .env file in the /backend directory.');
    }
    // We already log warnings inside the try/catch block for DB init
});
