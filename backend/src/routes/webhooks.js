const express = require('express');
const stripeService = require('../services/stripeService');

const router = express.Router();

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    // Verify webhook signature and construct event
    const event = stripeService.verifyWebhookSignature(req.body, sig);
    
    console.log(`Received Stripe webhook: ${event.type}`);
    
    // Handle the event
    await stripeService.handleWebhook(event);
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;