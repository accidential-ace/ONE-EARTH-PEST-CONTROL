const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Constants
const PORT = process.env.PORT || 3000;

// Email configuration
const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'oneearthpest@gmail.com',
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
};

// Create transporter
let transporter = nodemailer.createTransport(emailConfig);

// Verify email configuration
async function verifyEmailConfig() {
    try {
        await transporter.verify();
        console.log('✓ Email configuration is valid');
        return true;
    } catch (error) {
        console.error('✗ Email configuration error:', error);
        // Recreate transporter with updated config
        transporter = nodemailer.createTransport(emailConfig);
        return false;
    }
}

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Internal server error', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

// Newsletter subscription endpoint
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Send confirmation email
        try {
            await transporter.sendMail({
                from: {
                    name: 'One Earth Pest Control',
                    address: process.env.EMAIL_USER || 'oneearthpest@gmail.com'
                },
                to: email,
                subject: 'Welcome to One Earth Pest Control Newsletter!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Thank you for subscribing!</h2>
                        <p>You're now subscribed to receive updates from One Earth Pest Control.</p>
                        <p>Stay tuned for our latest news and updates about pest control services!</p>
                        <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                            <p style="margin: 0;">Best regards,<br>One Earth Pest Control Team</p>
                        </div>
                    </div>
                `
            });

            // Also send notification to admin
            await transporter.sendMail({
                from: {
                    name: 'One Earth Pest Control Website',
                    address: process.env.EMAIL_USER || 'oneearthpest@gmail.com'
                },
                to: process.env.EMAIL_USER || 'oneearthpest@gmail.com',
                subject: 'New Newsletter Subscription',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">New Newsletter Subscription</h2>
                        <p>A new user has subscribed to the newsletter:</p>
                        <p><strong>Email:</strong> ${email}</p>
                    </div>
                `
            });

            console.log('✓ Newsletter subscription successful for:', email);
            res.json({ message: 'Subscription successful' });
        } catch (error) {
            console.error('✗ Email error:', error);
            res.status(500).json({ message: 'Failed to send confirmation email' });
        }
    } catch (error) {
        console.error('✗ Subscription error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Call request endpoint
app.post('/api/call-request', async (req, res) => {
    try {
        const { name, phone } = req.body;
        
        if (!name || !phone) {
            return res.status(400).json({ message: 'Name and phone are required' });
        }

        // Validate phone format (basic validation)
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        try {
            // Send notification email to admin
            await transporter.sendMail({
                from: {
                    name: 'One Earth Pest Control Website',
                    address: process.env.EMAIL_USER || 'oneearthpest@gmail.com'
                },
                to: process.env.EMAIL_USER || 'oneearthpest@gmail.com',
                subject: 'New Call Request',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">New Call Request</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                            <p style="margin: 0;">Please contact the customer as soon as possible.</p>
                        </div>
                    </div>
                `
            });

            console.log('✓ Call request received from:', name);
            res.json({ message: 'Call request received' });
        } catch (error) {
            console.error('✗ Email error:', error);
            res.status(500).json({ message: 'Failed to process call request' });
        }
    } catch (error) {
        console.error('✗ Call request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        emailConfig: transporter.isIdle()
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server with retries for email configuration
async function startServer(retries = 3) {
    let emailConfigValid = false;
    
    for (let i = 0; i < retries && !emailConfigValid; i++) {
        emailConfigValid = await verifyEmailConfig();
        if (!emailConfigValid && i < retries - 1) {
            console.log(`Retrying email configuration (${i + 1}/${retries})...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    app.listen(PORT, () => {
        console.log(`
✨ Server is running on port ${PORT}
${emailConfigValid ? '✓' : '✗'} Email configuration status: ${emailConfigValid ? 'Valid' : 'Invalid'}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
        `);
    });
}

startServer();
