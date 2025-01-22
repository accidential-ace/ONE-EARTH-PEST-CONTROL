const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.static(path.join(__dirname)));

// Constants
const STORAGE_FILE = path.join(__dirname, 'data.json');
const PORT = process.env.PORT || 3000;

// Initialize storage file
async function initializeStorage() {
    try {
        await fs.access(STORAGE_FILE);
    } catch {
        await fs.writeFile(STORAGE_FILE, JSON.stringify({
            subscribers: [],
            callRequests: []
        }));
    }
}

// Read data from storage
async function readData() {
    const data = await fs.readFile(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
}

// Write data to storage
async function writeData(data) {
    await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
}

// Email transporter setup with better error handling
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Test email configuration
async function verifyEmailConfig() {
    try {
        await transporter.verify();
        console.log('Email configuration is valid');
        return true;
    } catch (error) {
        console.error('Email configuration error:', error);
        return false;
    }
}

// Newsletter subscription endpoint
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Store subscriber data first
        const data = await readData();
        if (data.subscribers.includes(email)) {
            return res.status(400).json({ message: 'Email already subscribed' });
        }
        data.subscribers.push(email);
        await writeData(data);

        // Send confirmation email
        try {
            await transporter.sendMail({
                from: {
                    name: 'One Earth Pest Control',
                    address: process.env.EMAIL_USER
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
            console.log('Newsletter confirmation email sent to:', email);
        } catch (emailError) {
            console.error('Failed to send newsletter confirmation:', emailError);
            // We don't return an error here since the subscription was successful
        }

        res.status(200).json({ message: 'Successfully subscribed!' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Call request endpoint
app.post('/api/call-request', async (req, res) => {
    try {
        const { name, phone } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ message: 'Name and phone are required' });
        }

        // Store call request first
        const data = await readData();
        const newRequest = {
            name,
            phone,
            date: new Date().toISOString()
        };
        data.callRequests.push(newRequest);
        await writeData(data);

        // Send notification email
        try {
            await transporter.sendMail({
                from: {
                    name: 'One Earth Pest Control',
                    address: process.env.EMAIL_USER
                },
                to: process.env.ADMIN_EMAIL,
                subject: 'New Call Request - One Earth Pest Control',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">New Call Request Received</h2>
                        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Phone:</strong> ${phone}</p>
                            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p style="color: #666; margin-top: 20px;">Please contact the customer as soon as possible.</p>
                    </div>
                `
            });
            console.log('Call request notification sent to admin');
        } catch (emailError) {
            console.error('Failed to send call request notification:', emailError);
            // We don't return an error since the call request was stored successfully
        }

        res.status(200).json({ message: 'Call request received!' });
    } catch (error) {
        console.error('Call request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Initialize storage and start server
async function startServer() {
    try {
        await initializeStorage();
        const emailConfigValid = await verifyEmailConfig();
        if (!emailConfigValid) {
            console.warn('Warning: Email configuration is not valid. Emails will not be sent.');
        }
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Email configuration status:', emailConfigValid ? 'Valid' : 'Invalid');
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
}

startServer();
