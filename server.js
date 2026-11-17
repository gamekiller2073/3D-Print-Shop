import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import './catalog.js';
dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json({ limit: '25kb' }));

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems, email, address, fullName } = req.body || {};
    if (!Array.isArray(cartItems) || cartItems.length === 0 || cartItems.length > 50) {
      return res.status(400).json({ error: 'Your cart is empty or contains too many items.' });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (typeof fullName !== 'string' || !fullName.trim() || fullName.length > 200 ||
        typeof address !== 'string' || !address.trim() || address.length > 500) {
      return res.status(400).json({ error: 'Enter your name and shipping address.' });
    }

    const lineItems = globalThis.buildShopLineItems(cartItems);

    // Add customer info to metadata
    const metadata = {
      customer_name: fullName.trim(),
      customer_email: email,
      customer_address: address.trim(),
      total_items: cartItems.length.toString(),
      total_quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0).toString()
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'bancontact'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email.trim(),
      metadata: metadata,
      success_url: 'http://3d-print-shop-mu.vercel.app/success.html',
      cancel_url: 'http://3d-print-shop-mu.vercel.app/checkout.html?cancelled=true',
    });
    res.json({ url: session.url });
  } catch (err) {
    if (err.message.includes('not available') || err.message.includes('custom quote') || err.message.includes('valid product') || err.message.includes('valid product size') || err.message.includes('too many items') || err.message.includes('cart is empty')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Checkout session creation failed:', err.message);
    res.status(500).json({ error: 'Could not create checkout session.' });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
