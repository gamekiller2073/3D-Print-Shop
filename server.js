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
  const { cartItems, totalPrice, email, address, fullName } = req.body;

  try {
    // Create line items for each cart item
    const lineItems = cartItems.map(item => {
      // Convert price to cents
      let priceNumber = 0;
      if (typeof item.price === 'string') {
        priceNumber = parseFloat(item.price.replace(/[^0-9.,]/g, '').replace(',', '.'));
      } else {
        priceNumber = item.price;
      }
      const amount = Math.round(priceNumber * 100);

      // Compose description based on product options
      let description = '';
      const options = [];
      
      if (item.options.color) options.push(`Color: ${item.options.color}`);
      if (item.options.textColor) options.push(`Text Color: ${item.options.textColor}`);
      if (item.options.baseColor) options.push(`Base Color: ${item.options.baseColor}`);
      if (item.options.outerColor) options.push(`Outer Color: ${item.options.outerColor}`);
      if (item.options.innerColor) options.push(`Inner Color: ${item.options.innerColor}`);
      if (item.options.boxColor) options.push(`Box Color: ${item.options.boxColor}`);
      if (item.options.fingerColor) options.push(`Finger Color: ${item.options.fingerColor}`);
      if (item.options.batteryType) options.push(`Battery Type: ${item.options.batteryType}`);
      if (item.options.spotify) options.push(`Spotify: ${item.options.spotify}`);
      if (item.options.shape) options.push(`Shape: ${item.options.shape}`);
      if (item.options.size) options.push(`Size: ${item.options.size}`);
      if (item.options.name) options.push(`Name: ${item.options.name}`);
      if (item.options.guitarType) options.push(`Guitar Type: ${item.options.guitarType}`);
      
      if (options.length > 0) {
        description = options.join(', ');
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.product,
            description: description,
          },
          unit_amount: amount,
        },
        quantity: item.quantity,
      };
    });

    // Add customer info to metadata
    const metadata = {
      customer_name: fullName,
      customer_email: email,
      customer_address: address,
      total_items: cartItems.length.toString(),
      total_quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0).toString()
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'bancontact'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      metadata: metadata,
      success_url: 'http://3d-print-shop-mu.vercel.app/success.html',
      cancel_url: 'http://3d-print-shop-mu.vercel.app/checkout.html?cancelled=true',
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
