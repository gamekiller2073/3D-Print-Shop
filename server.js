import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { product, price, quantity, color, textColor, baseColor, outerColor, innerColor, boxColor, fingerColor, batteryType, spotify, email, address, fullName, paymentMethod, shape } = req.body;

  // Convert price to cents (assuming price is like '€ 4' or '4')
  let priceNumber = 0;
  if (typeof price === 'string') {
    priceNumber = parseFloat(price.replace(/[^0-9.,]/g, '').replace(',', '.'));
  } else {
    priceNumber = price;
  }
  const quantityNum = parseInt(quantity) || 1;
  // Calculate unit price (total price divided by quantity)
  const unitPrice = priceNumber / quantityNum;
  const amount = Math.round(unitPrice * 100);

  // Compose description based on product
  let description = `Qty: ${quantityNum} | `;
  const productName = (product || '').trim().toLowerCase();
  if (productName === 'spotify sleutelhanger') {
    description += `Text Color: ${textColor || ''}, Base Color: ${baseColor || ''}`;
    if (spotify) description += `, Spotify: ${spotify}`;
  } else if (productName === 'piramide') {
    description += `Outer Color: ${outerColor || ''}, Inner Color: ${innerColor || ''}`;
    if (shape) description += `, Shape: ${shape}`;
  } else if (productName === 'middle finger lighter') {
    description += `Box Color: ${boxColor || ''}, Finger Color: ${fingerColor || ''}`;
  } else if (productName === 'battery dispenser') {
    description += `Color: ${color || ''}, Battery Type: ${batteryType || ''}`;
  } else {
    description += `Color: ${color || ''}`;
  }
  if (address) {
    description += ` | Address: ${address}`;
  }
  if (fullName) {
    description += ` | Name: ${fullName}`;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'bancontact'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product,
              description,
            },
            unit_amount: amount,
          },
          quantity: quantityNum,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: 'http://localhost:3000/success.html',
      cancel_url: 'http://localhost:3000/checkout.html?cancelled=true',
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
