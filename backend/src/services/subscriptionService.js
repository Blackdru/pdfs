const { supabase } = require('../config/supabase');
const stripeService = require('./stripeService');

// Import plan limits
const path = require('path');
const planLimitsPath = path.join(__dirname, '../../../shared/planLimits.js');
const { PLAN_LIMITS, STRIPE_PRICE_IDS, getPlanLimits, hasFeature, isWithinLimit } = require(planLimitsPath);

class SubscriptionService {
  /**
   * Get available subscription plans
   */
  getAvailablePlans() {
    return Object.entries(PLAN_LIMITS).map(([key, plan]) => ({
      id: key,
      ...plan,
      priceId: STRIPE_PRICE_IDS[key] || null
    }));
  }

  /**
   * Get user's current subscription with usage data
   */
  async getUserSubscription(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_subscription_with_usage', { user_uuid: userId });

      if (error) {
        console.error('Error getting user subscription:', error);
        throw new Error('Failed to get subscription');
      }

      if (!data || data.length === 0) {
        // Create default free subscription if none exists
        await this.createFreeSubscription(userId);
        return this.getDefaultSubscription(userId);
      }

      const subscription = data[0];
      const planLimits = getPlanLimits(subscription.plan);

      return {
        ...subscription,
        planLimits,
        usage: {
          files_processed: subscription.files_processed,
          storage_used: subscription.storage_used,
          ai_operations: subscription.ai_operations,
          api_calls: subscription.api_calls
        }
      };
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      throw error;
    }
  }

  /**
   * Create a free subscription for new users
   */
  async createFreeSubscription(userId) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: 'free',
          status: 'active'
        });

      if (error) {
        console.error('Error creating free subscription:', error);
        throw new Error('Failed to create free subscription');
      }
    } catch (error) {
      console.error('Error in createFreeSubscription:', error);
      throw error;
    }
  }

  /**
   * Get default subscription data
   */
  getDefaultSubscription(userId) {
    const planLimits = getPlanLimits('free');
    return {
      subscription_id: null,
      plan: 'free',
      status: 'active',
      current_period_end: null,
      cancel_at_period_end: false,
      planLimits,
      usage: {
        files_processed: 0,
        storage_used: 0,
        ai_operations: 0,
        api_calls: 0
      }
    };
  }

  /**
   * Create a new subscription
   */
  async createSubscription(userId, plan, paymentMethodId = null) {
    try {
      if (plan === 'free') {
        return await this.createFreeSubscription(userId);
      }

      // Get user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // Create or get Stripe customer
      let customerId;
      const existingSubscription = await this.getUserSubscription(userId);
      
      if (existingSubscription.stripe_customer_id) {
        customerId = existingSubscription.stripe_customer_id;
      } else {
        const customer = await stripeService.createCustomer(user.email, user.name, userId);
        customerId = customer.id;
      }

      // Create Stripe subscription
      const priceId = STRIPE_PRICE_IDS[plan];
      if (!priceId) {
        throw new Error('Invalid plan selected');
      }

      const result = await stripeService.createSubscription(customerId, priceId, userId);
      
      return {
        subscriptionId: result.subscriptionId,
        clientSecret: result.clientSecret,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId, immediate = false) {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription.stripe_subscription_id) {
        throw new Error('No active subscription to cancel');
      }

      if (immediate) {
        await stripeService.cancelSubscriptionImmediately(subscription.stripe_subscription_id);
      } else {
        await stripeService.cancelSubscription(subscription.stripe_subscription_id, true);
      }

      return { success: true, message: 'Subscription cancelled successfully' };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription.stripe_subscription_id) {
        throw new Error('No subscription to reactivate');
      }

      await stripeService.reactivateSubscription(subscription.stripe_subscription_id);
      
      return { success: true, message: 'Subscription reactivated successfully' };
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription plan
   */
  async updateSubscriptionPlan(userId, newPlan) {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription.stripe_subscription_id) {
        throw new Error('No active subscription to update');
      }

      const newPriceId = STRIPE_PRICE_IDS[newPlan];
      if (!newPriceId) {
        throw new Error('Invalid plan selected');
      }

      await stripeService.updateSubscriptionPlan(subscription.stripe_subscription_id, newPriceId);
      
      return { success: true, message: 'Subscription plan updated successfully' };
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      throw error;
    }
  }

  /**
   * Check if user can perform an action based on their plan
   */
  async checkPlanLimit(userId, limitType, increment = 1) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const planLimits = subscription.planLimits;
      
      // Get current usage
      const currentUsage = subscription.usage;
      let currentValue = 0;
      
      switch (limitType) {
        case 'filesPerMonth':
          currentValue = currentUsage.files_processed;
          break;
        case 'storageLimit':
          currentValue = currentUsage.storage_used;
          break;
        case 'aiOperations':
          currentValue = currentUsage.ai_operations;
          break;
        case 'apiCalls':
          currentValue = currentUsage.api_calls;
          break;
        default:
          throw new Error('Invalid limit type');
      }

      const limit = planLimits[limitType];
      
      // -1 means unlimited
      if (limit === -1) {
        return { allowed: true, remaining: -1 };
      }

      const allowed = (currentValue + increment) <= limit;
      const remaining = Math.max(0, limit - currentValue);

      return { 
        allowed, 
        remaining, 
        current: currentValue, 
        limit,
        plan: subscription.plan 
      };
    } catch (error) {
      console.error('Error checking plan limit:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to a feature
   */
  async checkFeatureAccess(userId, feature) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const hasAccess = hasFeature(subscription.plan, feature);
      
      return { 
        hasAccess, 
        plan: subscription.plan,
        feature 
      };
    } catch (error) {
      console.error('Error checking feature access:', error);
      throw error;
    }
  }

  /**
   * Track usage for a user
   */
  async trackUsage(userId, usageType, amount = 1, metadata = {}) {
    try {
      let files_delta = 0;
      let storage_delta = 0;
      let ai_delta = 0;
      let api_delta = 0;

      switch (usageType) {
        case 'file_processed':
          files_delta = amount;
          break;
        case 'storage_used':
          storage_delta = amount;
          break;
        case 'ai_operation':
          ai_delta = amount;
          break;
        case 'api_call':
          api_delta = amount;
          break;
        default:
          throw new Error('Invalid usage type');
      }

      const { error } = await supabase
        .rpc('increment_usage', {
          user_uuid: userId,
          files_delta,
          storage_delta,
          ai_delta,
          api_delta
        });

      if (error) {
        console.error('Error tracking usage:', error);
        throw new Error('Failed to track usage');
      }

      // Also record in history if it's a file operation
      if (usageType === 'file_processed' && metadata.action) {
        await supabase
          .from('history')
          .insert({
            user_id: userId,
            file_id: metadata.file_id || null,
            action: metadata.action
          });
      }

      return { success: true };
    } catch (error) {
      console.error('Error in trackUsage:', error);
      throw error;
    }
  }

  /**
   * Get usage statistics for a user
   */
  async getUsageStats(userId, monthYear = null) {
    try {
      if (!monthYear) {
        monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM format
      }

      const { data, error } = await supabase
        .from('subscription_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('month_year', monthYear)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error getting usage stats:', error);
        throw new Error('Failed to get usage statistics');
      }

      return data || {
        files_processed: 0,
        storage_used: 0,
        ai_operations: 0,
        api_calls: 0
      };
    } catch (error) {
      console.error('Error in getUsageStats:', error);
      throw error;
    }
  }

  /**
   * Get billing history for a user
   */
  async getBillingHistory(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting billing history:', error);
        throw new Error('Failed to get billing history');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBillingHistory:', error);
      throw error;
    }
  }

  /**
   * Validate subscription status
   */
  async validateSubscription(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      // Check if subscription is expired
      if (subscription.current_period_end) {
        const now = new Date();
        const periodEnd = new Date(subscription.current_period_end);
        
        if (now > periodEnd && subscription.status === 'active') {
          // Update status to expired
          await supabase
            .from('subscriptions')
            .update({ 
              status: 'expired',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
          
          subscription.status = 'expired';
        }
      }

      return {
        isValid: ['active', 'trialing'].includes(subscription.status),
        subscription
      };
    } catch (error) {
      console.error('Error validating subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription analytics for admin
   */
  async getSubscriptionAnalytics() {
    try {
      // Get subscription counts by plan
      const { data: planCounts, error: planError } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('status', 'active');

      if (planError) {
        throw planError;
      }

      // Get revenue data (last 12 months)
      const { data: revenueData, error: revenueError } = await supabase
        .from('payment_transactions')
        .select('amount, currency, created_at')
        .eq('status', 'succeeded')
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (revenueError) {
        throw revenueError;
      }

      // Process data
      const planStats = planCounts.reduce((acc, sub) => {
        acc[sub.plan] = (acc[sub.plan] || 0) + 1;
        return acc;
      }, {});

      const monthlyRevenue = revenueData.reduce((acc, transaction) => {
        const month = transaction.created_at.slice(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + transaction.amount;
        return acc;
      }, {});

      return {
        planStats,
        monthlyRevenue,
        totalActiveSubscriptions: planCounts.length,
        totalRevenue: revenueData.reduce((sum, t) => sum + t.amount, 0)
      };
    } catch (error) {
      console.error('Error getting subscription analytics:', error);
      throw error;
    }
  }
}

module.exports = new SubscriptionService();