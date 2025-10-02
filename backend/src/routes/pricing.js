const express = require('express');
const currencyService = require('../services/currencyService');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Get pricing for user's detected currency
 */
router.get('/detect', optionalAuth, async (req, res) => {
  try {
    const currency = await currencyService.getCurrencyFromRequest(req);
    const pricing = currencyService.getPricingForCurrency(currency);
    const currencyInfo = currencyService.getCurrencyInfo(currency);

    res.json({
      currency,
      currencyInfo,
      pricing
    });
  } catch (error) {
    console.error('Error detecting currency:', error);
    res.status(500).json({ error: 'Failed to detect currency' });
  }
});

/**
 * Get pricing for a specific currency
 */
router.get('/currency/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const upperCode = code.toUpperCase();

    if (!currencyService.isCurrencySupported(upperCode)) {
      return res.status(400).json({ error: 'Currency not supported' });
    }

    const pricing = currencyService.getPricingForCurrency(upperCode);
    const currencyInfo = currencyService.getCurrencyInfo(upperCode);

    res.json({
      currency: upperCode,
      currencyInfo,
      pricing
    });
  } catch (error) {
    console.error('Error getting pricing:', error);
    res.status(500).json({ error: 'Failed to get pricing' });
  }
});

/**
 * Get all supported currencies
 */
router.get('/currencies', async (req, res) => {
  try {
    const currencies = currencyService.getAllCurrencies();
    res.json({ currencies });
  } catch (error) {
    console.error('Error getting currencies:', error);
    res.status(500).json({ error: 'Failed to get currencies' });
  }
});

/**
 * Get pricing for all currencies
 */
router.get('/all', async (req, res) => {
  try {
    const currencies = currencyService.getAllCurrencies();
    const allPricing = {};

    currencies.forEach(currency => {
      allPricing[currency.code] = {
        ...currency,
        pricing: currencyService.getPricingForCurrency(currency.code)
      };
    });

    res.json({ pricing: allPricing });
  } catch (error) {
    console.error('Error getting all pricing:', error);
    res.status(500).json({ error: 'Failed to get pricing' });
  }
});

module.exports = router;
