const razorpayService = require('./razorpayService');
const paypalService = require('./paypalService');
const currencyService = require('./currencyService');

class PaymentService {
  /**
   * Determine which payment gateway to use based on country/currency
   */
  getPaymentGateway(countryCode, currency) {
    // Use Razorpay for India
    if (countryCode === 'IN' || currency === 'INR') {
      return 'razorpay';
    }
    
    // Use PayPal for all other countries
    return 'paypal';
  }

  /**
   * Create a subscription using the appropriate gateway
   */
  async createSubscription(userId, plan, email, name, countryCode, currency) {
    const gateway = this.getPaymentGateway(countryCode, currency);
    
    console.log(`Creating subscription with ${gateway} for user ${userId}, plan ${plan}`);
    
    if (gateway === 'razorpay') {
      return await razorpayService.createSubscription(userId, plan, email, name);
    } else {
      return await paypalService.createSubscription(userId, plan, email, name);
    }
  }

  /**
   * Create an order/payment using the appropriate gateway
   */
  async createOrder(amount, currency, userId, plan, email, countryCode) {
    const gateway = this.getPaymentGateway(countryCode, currency);
    
    console.log(`Creating order with ${gateway} for user ${userId}, amount ${amount} ${currency}`);
    
    if (gateway === 'razorpay') {
      return await razorpayService.createOrder(amount, currency, userId, plan, email);
    } else {
      return await paypalService.createOrder(amount, currency, userId, plan, email);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId, gateway, immediate = false) {
    console.log(`Canceling subscription ${subscriptionId} on ${gateway}`);
    
    if (gateway === 'razorpay') {
      return await razorpayService.cancelSubscription(subscriptionId, !immediate);
    } else {
      return await paypalService.cancelSubscription(subscriptionId);
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId, gateway) {
    if (gateway === 'razorpay') {
      return await razorpayService.getSubscription(subscriptionId);
    } else {
      return await paypalService.getSubscription(subscriptionId);
    }
  }

  /**
   * Verify payment signature (for Razorpay)
   */
  verifyPaymentSignature(orderId, paymentId, signature) {
    return razorpayService.verifyPaymentSignature(orderId, paymentId, signature);
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(gateway, payload, signature, headers) {
    if (gateway === 'razorpay') {
      return razorpayService.verifyWebhookSignature(payload, signature);
    } else {
      return await paypalService.verifyWebhookSignature(headers, payload);
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(gateway, event) {
    console.log(`Handling ${gateway} webhook event`);
    
    if (gateway === 'razorpay') {
      return await razorpayService.handleWebhook(event);
    } else {
      return await paypalService.handleWebhook(event);
    }
  }

  /**
   * Get plan pricing based on gateway and currency
   */
  getPlanPricing(plan, gateway, currency = 'USD') {
    if (gateway === 'razorpay') {
      const planDetails = razorpayService.getPlanDetails(plan);
      return {
        amount: planDetails.amount,
        currency: 'INR',
        gateway: 'razorpay'
      };
    } else {
      const planDetails = paypalService.getPlanDetails(plan);
      return {
        amount: planDetails.amount,
        currency: currency || 'USD',
        gateway: 'paypal'
      };
    }
  }

  /**
   * Get available payment methods for a country
   */
  getAvailablePaymentMethods(countryCode) {
    if (countryCode === 'IN') {
      return [{
        gateway: 'razorpay',
        name: 'Razorpay',
        methods: ['card', 'upi', 'netbanking', 'wallet'],
        currency: 'INR'
      }];
    } else {
      return [{
        gateway: 'paypal',
        name: 'PayPal',
        methods: ['paypal', 'card'],
        currency: 'USD'
      }];
    }
  }

  /**
   * Format amount for display
   */
  formatAmount(amount, currency) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    
    return formatter.format(amount / 100);
  }

  /**
   * Capture PayPal order
   */
  async capturePayPalOrder(orderId) {
    return await paypalService.captureOrder(orderId);
  }

  /**
   * Activate PayPal subscription
   */
  async activatePayPalSubscription(subscriptionId, reason) {
    return await paypalService.activateSubscription(subscriptionId, reason);
  }

  /**
   * Suspend PayPal subscription
   */
  async suspendPayPalSubscription(subscriptionId, reason) {
    return await paypalService.suspendSubscription(subscriptionId, reason);
  }
}

module.exports = new PaymentService();
