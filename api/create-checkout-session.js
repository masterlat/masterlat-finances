// api/create-checkout-session.js
// Vercel Serverless Function — Stripe Checkout
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  starter_monthly: { amount: 1990,  name: 'Masterlat Starter — Mensal',  interval: 'month' },
  starter_annual:  { amount: 19900, name: 'Masterlat Starter — Anual',   interval: null   },
  plus_monthly:    { amount: 3990,  name: 'Masterlat Plus — Mensal',     interval: 'month' },
  plus_annual:     { amount: 39900, name: 'Masterlat Plus — Anual',      interval: null   },
  pro_monthly:     { amount: 5990,  name: 'Masterlat Pro — Mensal',      interval: 'month' },
  pro_annual:      { amount: 59900, name: 'Masterlat Pro — Anual',       interval: null   },
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { plan, billing, userEmail, userId } = req.body;
    const key = `${plan}_${billing}`;
    const p = PRICES[key];
    if (!p) return res.status(400).json({ error: 'Invalid plan' });

    const isSubscription = billing === 'monthly';
    const BASE = process.env.BASE_URL || 'https://masterlat.finance';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: isSubscription ? 'subscription' : 'payment',
      customer_email: userEmail,
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: { name: p.name },
          unit_amount: p.amount,
          ...(isSubscription ? { recurring: { interval: p.interval } } : {}),
        },
        quantity: 1,
      }],
      metadata: { userId, plan, billing },
      success_url: `${BASE}/planos?status=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE}/planos?status=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
