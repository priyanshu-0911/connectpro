const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// ─── 1. Initialize Razorpay ───
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── 2. File to store purchases ───
const PURCHASES_FILE = './purchases.json';

// Helper to read/write purchases
const readPurchases = () => {
  try {
    const data = fs.readFileSync(PURCHASES_FILE);
    return JSON.parse(data);
  } catch {
    return [];
  }
};
const writePurchases = (purchases) => {
  fs.writeFileSync(PURCHASES_FILE, JSON.stringify(purchases, null, 2));
};

// ─── 3. Email transporter (Gmail) ───
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,    // your Gmail address
    pass: process.env.EMAIL_PASS,    // App password (not your Gmail password)
  },
});

// ─── 4. API: Create an order ───
app.post('/api/create-order', async (req, res) => {
  const { amount, currency, planName, customerName, customerEmail } = req.body;

  const options = {
    amount: amount * 100,          // ₹1 = 100 paise
    currency: currency || 'INR',
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1,            // auto-capture
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ─── 5. API: Verify payment after successful checkout ───
app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Payment is verified – store the purchase
    const purchases = readPurchases();
    const newPurchase = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      planName: req.body.planName || 'Unknown',
      amount: req.body.amount || 0,
      currency: req.body.currency || 'INR',
      customerName: req.body.customerName || 'Unknown',
      customerEmail: req.body.customerEmail || 'Unknown',
      purchasedAt: new Date().toISOString(),
      status: 'active',
      razorpay_payment_id,
    };
    purchases.push(newPurchase);
    writePurchases(purchases);

    // Send email notification to owner
    sendOwnerNotification(newPurchase);

    res.json({ status: 'success' });
  } else {
    res.status(400).json({ status: 'failure' });
  }
});

// ─── 6. Function to send email to owner ───
const sendOwnerNotification = (purchase) => {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) return;

  const subject = 'New Purchase Notification';
  const html = `
    <h3>New Payment Received</h3>
    <p><strong>Plan:</strong> ${purchase.planName}</p>
    <p><strong>Amount:</strong> ₹${(purchase.amount/100).toFixed(2)}</p>
    <p><strong>Customer:</strong> ${purchase.customerName} (${purchase.customerEmail})</p>
    <p><strong>Payment ID:</strong> ${purchase.razorpay_payment_id}</p>
    <p><strong>Date:</strong> ${new Date(purchase.purchasedAt).toLocaleString()}</p>
  `;

  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: ownerEmail,
    subject,
    html,
  }).then(() => console.log('Owner email sent'))
    .catch(err => console.error('Email error:', err));
};

// ─── 7. API: Get all purchases (for the dashboard) ───
app.get('/api/purchases', (req, res) => {
  const purchases = readPurchases();
  res.json(purchases);
});

// ─── 8. Start the server ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});