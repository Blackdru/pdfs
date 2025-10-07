const { 
  CURRENCIES, 
  getCurrencyByCountry, 
  formatPrice, 
  getPlanPrice,
  getStripePriceId,
  getSupportedCurrencies,
  getCurrencyInfo
} = require('../../../shared/currencies');

class CurrencyService {
  /**
   * Detect currency from IP address using a geolocation service
   * You can use services like ipapi.co, ip-api.com, or ipgeolocation.io
   */
  async detectCurrencyFromIP(ipAddress) {
    try {
      // Using ip-api.com (free, no API key required)
      const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,countryCode`);
      const data = await response.json();
      
      if (data.status === 'success' && data.countryCode) {
        const currency = getCurrencyByCountry(data.countryCode);
        return currency.code;
      }
    } catch (error) {
      console.warn('Error detecting currency from IP:', error);
    }
    
    return 'USD'; // Default fallback
  }

  /**
   * Get country code from request headers or IP
   */
  async getCountryFromRequest(req) {
    try {
      // Try to get from Accept-Language header
      const acceptLanguage = req.headers['accept-language'];
      if (acceptLanguage) {
        const locale = acceptLanguage.split(',')[0];
        const region = locale.split('-')[1];
        
        if (region) {
          return region.toUpperCase();
        }
      }

      // For localhost/development, default to India for testing
      // You can change this to 'US' to test international payments
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.includes('::ffff:127.0.0.1')) {
        console.log('Localhost detected, defaulting to IN for Razorpay testing');
        return 'IN'; // Change to 'US' to test international card payments
      }

      // Try to detect from IP address for production
      try {
        const cleanIp = ipAddress.replace('::ffff:', '');
        const https = require('https');
        const url = `https://ipapi.co/${cleanIp}/json/`;
        
        return await new Promise((resolve, reject) => {
          https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
              try {
                const parsed = JSON.parse(data);
                if (parsed.country_code) {
                  resolve(parsed.country_code);
                } else {
                  resolve('IN'); // Default to India
                }
              } catch (e) {
                resolve('IN');
              }
            });
          }).on('error', () => {
            resolve('IN');
          });
        });
      } catch (error) {
        console.warn('Error detecting country from IP:', error);
        return 'IN'; // Default to India
      }
    } catch (error) {
      console.warn('Error in getCountryFromRequest:', error);
    }
    
    return 'IN'; // Default to India for Razorpay
  }

  /**
   * Get currency from request headers or IP
   */
  async getCurrencyFromRequest(req) {
    // First, check if user has a preferred currency stored
    if (req.user && req.user.preferred_currency) {
      return req.user.preferred_currency;
    }

    // Get country code
    const countryCode = await this.getCountryFromRequest(req);
    
    // Get currency for country
    const currency = getCurrencyByCountry(countryCode);
    if (currency) {
      return currency.code;
    }

    return 'USD'; // Default fallback
  }

  /**
   * Get pricing information for all plans in a specific currency
   */
  getPricingForCurrency(currencyCode = 'USD') {
    const plans = ['basic', 'pro'];
    const pricing = {};

    plans.forEach(plan => {
      const amount = getPlanPrice(plan, currencyCode);
      const stripePriceId = getStripePriceId(plan, currencyCode);
      
      pricing[plan] = {
        amount,
        formatted: formatPrice(amount, currencyCode),
        currency: currencyCode,
        stripePriceId
      };
    });

    return pricing;
  }

  /**
   * Get all supported currencies with their info
   */
  getAllCurrencies() {
    const currencies = getSupportedCurrencies();
    return currencies.map(code => ({
      code,
      ...getCurrencyInfo(code)
    }));
  }

  /**
   * Format a price in a specific currency
   */
  formatPrice(amount, currencyCode = 'USD') {
    return formatPrice(amount, currencyCode);
  }

  /**
   * Get Stripe price ID for a plan and currency
   */
  getStripePriceId(plan, currencyCode = 'USD') {
    return getStripePriceId(plan, currencyCode);
  }

  /**
   * Validate if a currency is supported
   */
  isCurrencySupported(currencyCode) {
    return getSupportedCurrencies().includes(currencyCode);
  }

  /**
   * Get currency info
   */
  getCurrencyInfo(currencyCode) {
    return getCurrencyInfo(currencyCode);
  }

  /**
   * Convert amount between currencies (simplified - in production use a real exchange rate API)
   * This is just for display purposes, actual billing is done in the selected currency
   */
  async convertCurrency(amount, fromCurrency, toCurrency) {
    // In production, use a service like exchangerate-api.com or fixer.io
    // For now, we'll use approximate rates based on our pricing
    const fromPrice = getPlanPrice('basic', fromCurrency);
    const toPrice = getPlanPrice('basic', toCurrency);
    
    if (fromPrice === 0) return amount;
    
    const rate = toPrice / fromPrice;
    return Math.round(amount * rate);
  }
}

module.exports = new CurrencyService();
