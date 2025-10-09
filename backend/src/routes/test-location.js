const express = require('express');
const currencyService = require('../services/currencyService');

const router = express.Router();

// Test endpoint to check location detection
router.get('/test-location', async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('LOCATION DETECTION TEST');
    console.log('========================================');
    
    const countryCode = await currencyService.getCountryFromRequest(req);
    const currency = await currencyService.getCurrencyFromRequest(req);
    
    res.json({
      success: true,
      detectedCountry: countryCode,
      detectedCurrency: currency,
      requestInfo: {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'],
          'x-real-ip': req.headers['x-real-ip'],
          'cf-ipcountry': req.headers['cf-ipcountry'],
          'accept-language': req.headers['accept-language']
        }
      },
      message: `Location detected as ${countryCode}, currency: ${currency}`
    });
  } catch (error) {
    console.error('Test location error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
