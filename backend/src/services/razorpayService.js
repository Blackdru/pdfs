const Razorpay = require('razorpay');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');

// Initialize Razorpay with API keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

class RazorpayService {
  /**
   * Create a Razorpay subscription
   */
  async createSubscription(userId, plan, email, name) {
    try {
      // Get plan details
      const planDetails = this.getPlanDetails(plan);
      
      if (!planDetails) {
        throw new Error(`Invalid plan: ${plan}`);
      }

      // Create Razorpay subscription
      const subscription = await razorpay.subscriptions.create({
        plan_id: planDetails.razorpayPlanId,
        customer_notify: 1,
        total_count: 12, // 12 months
        quantity: 1,
        notes: {
          userId,
          plan,
          email,
          name
        }
      });

      // Store subscription in database
      await this.updateSubscriptionInDatabase(subscription, userId, plan);

      return {
        subscriptionId: subscription.id,
        subscription
      };
    } catch (error) {
      console.error('Error creating Razorpay subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Create a Razorpay order for one-time payment
   */
  async createOrder(amount, currency, userId, plan, email) {
    try {
      const order = await razorpay.orders.create({
        amount: amount, // Amount in paise (smallest currency unit)
        currency: currency,
        receipt: `order_${userId}_${Date.now()}`,
        notes: {
          userId,
          plan,
          email
        }
      });

      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create order');
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const text = `${orderId}|${paymentId}`;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      return generated_signature === signature;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  /**
   * Verify Razorpay webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      if (cancelAtPeriodEnd) {
        // Razorpay doesn't support cancel_at_period_end, so we mark it in our database
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_subscription_id', subscriptionId);

        if (error) throw error;

        return { status: 'marked_for_cancellation' };
      } else {
        // Immediate cancellation
        const subscription = await razorpay.subscriptions.cancel(subscriptionId);
        
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_subscription_id', subscriptionId);

        return subscription;
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId) {
    try {
      const subscription = await razorpay.subscriptions.fetch(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw new Error('Failed to get subscription');
    }
  }

  /**
   * Handle Razorpay webhook events
   */
  async handleWebhook(event) {
    try {
      const eventType = event.event;
      const payload = event.payload;

      switch (eventType) {
        case 'subscription.activated':
          await this.handleSubscriptionActivated(payload.subscription.entity);
          break;

        case 'subscription.charged':
          await this.handleSubscriptionCharged(payload.payment.entity, payload.subscription.entity);
          break;

        case 'subscription.completed':
          await this.handleSubscriptionCompleted(payload.subscription.entity);
          break;

        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(payload.subscription.entity);
          break;

        case 'subscription.paused':
          await this.handleSubscriptionPaused(payload.subscription.entity);
          break;

        case 'subscription.resumed':
          await this.handleSubscriptionResumed(payload.subscription.entity);
          break;

        case 'payment.captured':
          await this.handlePaymentCaptured(payload.payment.entity);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(payload.payment.entity);
          break;

        default:
          console.log(`Unhandled Razorpay event type: ${eventType}`);
      }
    } catch (error) {
      console.error('Error handling Razorpay webhook:', error);
      throw error;
    }
  }

  /**
   * Handle subscription activated
   */
  async handleSubscriptionActivated(subscription) {
    const userId = subscription.notes?.userId;
    if (!userId) return;

    await this.updateSubscriptionInDatabase(subscription, userId, subscription.notes?.plan);
  }

  /**
   * Handle subscription charged
   */
  async handleSubscriptionCharged(payment, subscription) {
    const userId = subscription.notes?.userId;
    if (!userId) return;

    // Record payment transaction
    await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_id: userId,
        subscription_id: subscription.id,
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: 'succeeded',
        payment_method: 'razorpay',
        metadata: {
          subscription_id: subscription.id,
          payment_method: payment.method
        }
      });
  }

  /**
   * Handle subscription completed
   */
  async handleSubscriptionCompleted(subscription) {
    const userId = subscription.notes?.userId;
    if (!userId) return;

    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_subscription_id', subscription.id);
  }

  /**
   * Handle subscription cancelled
   */
  async handleSubscriptionCancelled(subscription) {
    const userId = subscription.notes?.userId;
    if (!userId) return;

    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_subscription_id', subscription.id);
  }

  /**
   * Handle subscription paused
   */
  async handleSubscriptionPaused(subscription) {
    const userId = subscription.notes?.userId;
    if (!userId) return;

    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'paused',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_subscription_id', subscription.id);
  }

  /**
   * Handle subscription resumed
   */
  async handleSubscriptionResumed(subscription) {
    const userId = subscription.notes?.userId;
    if (!userId) return;

    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_subscription_id', subscription.id);
  }

  /**
   * Handle payment captured
   */
  async handlePaymentCaptured(payment) {
    // Record one-time payment
    const userId = payment.notes?.userId;
    if (!userId) return;

    await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_id: userId,
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: 'succeeded',
        payment_method: 'razorpay',
        metadata: {
          payment_method: payment.method
        }
      });
  }

  /**
   * Handle payment failed
   */
  async handlePaymentFailed(payment) {
    const userId = payment.notes?.userId;
    if (!userId) return;

    await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_id: userId,
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: 'failed',
        payment_method: 'razorpay',
        metadata: {
          error_code: payment.error_code,
          error_description: payment.error_description
        }
      });
  }

  /**
   * Update subscription in database
   */
  async updateSubscriptionInDatabase(razorpaySubscription, userId, plan) {
    const subscriptionData = {
      user_id: userId,
      plan: plan || 'basic',
      status: razorpaySubscription.status,
      razorpay_subscription_id: razorpaySubscription.id,
      current_period_start: new Date(razorpaySubscription.start_at * 1000).toISOString(),
      current_period_end: new Date(razorpaySubscription.end_at * 1000).toISOString(),
      cancel_at_period_end: false,
      payment_method: 'razorpay',
      metadata: {
        plan_id: razorpaySubscription.plan_id,
        ...razorpaySubscription.notes
      },
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error updating subscription in database:', error);
      throw error;
    }
  }

  /**
   * Get plan details with Razorpay plan IDs
   */
  getPlanDetails(plan) {
    const plans = {
      basic: {
        name: 'Basic',
        amount: 8300, // ₹83 (~$1) in paise
        currency: 'INR',
        period: 'monthly',
        interval: 1,
        razorpayPlanId: process.env.RAZORPAY_PLAN_BASIC || 'plan_basic'
      },
      pro: {
        name: 'Pro',
        amount: 83000, // ₹830 (~$10) in paise
        currency: 'INR',
        period: 'monthly',
        interval: 1,
        razorpayPlanId: process.env.RAZORPAY_PLAN_PRO || 'plan_pro'
      }
    };

    return plans[plan];
  }

  /**
   * Create Razorpay plans (run this once to set up plans)
   */
  async createPlans() {
    try {
      // Create Basic plan
      const basicPlan = await razorpay.plans.create({
        period: 'monthly',
        interval: 1,
        item: {
          name: 'Basic Plan',
          amount: 8300, // ₹83 (~$1) in paise
          currency: 'INR',
          description: 'Basic subscription plan with 50 files per month, 25 OCR pages, 25 AI chat messages, 25 AI summaries'
        }
      });

      console.log('Basic Plan created:', basicPlan.id);

      // Create Pro plan
      const proPlan = await razorpay.plans.create({
        period: 'monthly',
        interval: 1,
        item: {
          name: 'Pro Plan',
          amount: 83000, // ₹830 (~$10) in paise
          currency: 'INR',
          description: 'Pro subscription plan with unlimited files, OCR, AI chat, and AI summaries'
        }
      });

      console.log('Pro Plan created:', proPlan.id);

      return { basicPlan, proPlan };
    } catch (error) {
      console.error('Error creating Razorpay plans:', error);
      throw error;
    }
  }
}

module.exports = new RazorpayService();
