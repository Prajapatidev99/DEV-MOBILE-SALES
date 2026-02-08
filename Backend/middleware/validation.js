// Input validation middleware for API endpoints

const validateTelegramAlert = (req, res, next) => {
    const { order, user } = req.body;

    // Validate order object
    if (!order || typeof order !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid order data' });
    }

    // Validate required order fields
    if (!order.id || !order.total || !Array.isArray(order.items)) {
        return res.status(400).json({ success: false, message: 'Missing required order fields (id, total, items)' });
    }

    // Validate order total is a positive number
    if (typeof order.total !== 'number' || order.total <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid order total' });
    }

    // Validate items array is not empty
    if (order.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    next();
};

const validateMobileNumber = (req, res, next) => {
    const { mobile } = req.body;

    if (!mobile || typeof mobile !== 'string') {
        return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    // Basic mobile number validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid mobile number format (must be 10 digits)' });
    }

    next();
};

const validateGenerateContent = (req, res, next) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    if (prompt.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Prompt cannot be empty' });
    }

    // Prevent excessively long prompts
    if (prompt.length > 10000) {
        return res.status(400).json({ success: false, message: 'Prompt is too long (max 10000 characters)' });
    }

    next();
};

module.exports = {
    validateTelegramAlert,
    validateMobileNumber,
    validateGenerateContent
};
