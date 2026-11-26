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
    const { cartItems, email, address, fullName, shippingMethod, greenServiceLatitude, greenServiceLongitude } = req.body || {};
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

    // Validate shipping method and determine shipping cost
    const shippingMethods = {
      school: { name: 'Op school afgeven', amount: 0 },
      green: { name: 'Green Service', amount: 400 },
      bpost: { name: 'Bpost', amount: 710 }
    };
    const selectedShipping = shippingMethods[String(shippingMethod || '').trim().toLowerCase()];
    if (!selectedShipping) {
      return res.status(400).json({ error: 'Choose a valid shipping method.' });
    }

    // Leuven address validation for Green Service: 25 km radius
    if (shippingMethod === 'green') {
      const latitude = Number(greenServiceLatitude);
      const longitude = Number(greenServiceLongitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return res.status(400).json({ error: 'Geef een geldig adres op om Green Service te controleren.' });
      }

      const toRadians = degrees => degrees * Math.PI / 180;
      const earthRadiusKm = 6371;
      const deltaLatitude = toRadians(latitude - 50.8796);
      const deltaLongitude = toRadians(longitude - 4.7005);
      const haversine = Math.sin(deltaLatitude / 2) ** 2
        + Math.cos(toRadians(50.8796)) * Math.cos(toRadians(latitude))
        * Math.sin(deltaLongitude / 2) ** 2;
      const distanceKm = earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

      if (distanceKm > 25) {
        return res.status(400).json({ error: 'Green Service is alleen beschikbaar binnen 25 km van Leuven.' });
      }
    }

    if (selectedShipping.amount > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: selectedShipping.name },
          unit_amount: selectedShipping.amount
        },
        quantity: 1
      });
    }

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
