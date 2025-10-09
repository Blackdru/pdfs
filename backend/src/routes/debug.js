const express = require('express');
const router = express.Router();

// Debug endpoint to check server configuration
router.get('/config', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    razorpayConfigured: !!process.env.RAZORPAY_KEY_ID,
    razorpayKeyPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 8),
    supabaseConfigured: !!process.env.SUPABASE_URL,
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to test subscription creation
router.post('/test-subscription', async (req, res) => {
  try {
    const { plan } = req.body;
    
    console.log('Test subscription request:', { plan, body: req.body });
    
    if (!plan) {
      return res.status(400).json({ 
        error: 'Missing plan parameter',
        received: req.body 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Test endpoint working',
      plan,
      env: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Debug test error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});

module.exports = router;
