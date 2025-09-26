const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');
const { PLAN_LIMITS } = require('../../../shared/planLimits.js');

const router = express.Router();

// Get available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = Object.entries(PLAN_LIMITS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      price: plan.price,
      features: plan.features,
      restrictions: plan.restrictions,
      limits: {
        filesPerMonth: plan.filesPerMonth,
        maxFileSize: plan.maxFileSize,
        storageLimit: plan.storageLimit,
        aiOperations: plan.aiOperations,
        apiCalls: plan.apiCalls,
        batchOperations: plan.batchOperations
      }
    }));

    res.json({ plans });
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

// Get current user subscription
router.get('/current', authenticateUser, async (req, res) => {
  try {
    // Get user profile with subscription info
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError) {
      console.error('Error getting user profile:', profileError);
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get subscription from subscriptions table if exists
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single();

    const currentPlan = subscription?.plan || 'free';
    const planLimits = PLAN_LIMITS[currentPlan];

    res.json({
      subscription: {
        id: subscription?.id,
        plan: currentPlan,
        status: subscription?.status || 'active',
        started_at: subscription?.started_at,
        expires_at: subscription?.expires_at,
        cancel_at_period_end: subscription?.cancel_at_period_end || false,
        planLimits: planLimits
      },
      user: userProfile
    });
  } catch (error) {
    console.error('Error getting current subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Get usage statistics
router.get('/usage', authenticateUser, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Initialize counters
    let filesProcessed = 0;
    let totalStorage = 0;
    let ocrCount = 0;
    let aiOperationsCount = 0;

    // Get file count this month and total storage
    try {
      const { data: filesThisMonth, error: filesError } = await supabaseAdmin
        .from('files')
        .select('id, size')
        .eq('user_id', req.user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (filesError) {
        console.error('Error getting files this month:', filesError);
      } else {
        filesProcessed = filesThisMonth?.length || 0;
      }

      // Get total storage used
      const { data: allFiles, error: storageError } = await supabaseAdmin
        .from('files')
        .select('size')
        .eq('user_id', req.user.id);

      if (storageError) {
        console.error('Error getting total storage:', storageError);
      } else {
        totalStorage = allFiles?.reduce((sum, file) => sum + (file.size || 0), 0) || 0;
      }
    } catch (error) {
      console.error('Error querying files table:', error);
    }

    // Get OCR operations this month (handle table not existing)
    try {
      const { data: ocrOperations, error: ocrError } = await supabaseAdmin
        .from('ocr_results')
        .select('id')
        .eq('user_id', req.user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (ocrError) {
        console.error('Error getting OCR operations:', ocrError);
      } else {
        ocrCount = ocrOperations?.length || 0;
      }
    } catch (error) {
      console.error('Error querying ocr_results table (table may not exist):', error);
      ocrCount = 0;
    }

    // Get AI operations this month (summaries + chat messages)
    try {
      const { data: summaries, error: summariesError } = await supabaseAdmin
        .from('summaries')
        .select('id')
        .eq('user_id', req.user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (summariesError) {
        console.error('Error getting summaries:', summariesError);
      } else {
        aiOperationsCount += summaries?.length || 0;
      }
    } catch (error) {
      console.error('Error querying summaries table (table may not exist):', error);
    }

    // Get chat messages this month
    try {
      const { data: chatMessages, error: chatError } = await supabaseAdmin
        .from('chat_messages')
        .select(`
          id,
          chat_sessions!inner(user_id)
        `)
        .eq('chat_sessions.user_id', req.user.id)
        .eq('role', 'user')
        .gte('created_at', startOfMonth.toISOString());

      if (chatError) {
        console.error('Error getting chat messages:', chatError);
      } else {
        aiOperationsCount += chatMessages?.length || 0;
      }
    } catch (error) {
      console.error('Error querying chat_messages table (table may not exist):', error);
    }

    res.json({
      usage: {
        files_processed: filesProcessed,
        storage_used: totalStorage,
        ocr_operations: ocrCount,
        ai_operations: aiOperationsCount,
        api_calls: 0 // TODO: Implement API call tracking
      },
      period: {
        start: startOfMonth.toISOString(),
        end: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting usage statistics:', error);
    res.status(500).json({ error: 'Failed to get usage statistics' });
  }
});

// Create subscription (for free plan or upgrade)
router.post('/create', authenticateUser, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !PLAN_LIMITS[plan]) {
      return res.status(400).json({ error: 'Invalid plan specified' });
    }

    // For free plan, just update user profile
    if (plan === 'free') {
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .upsert([
          {
            user_id: req.user.id,
            plan: 'free',
            status: 'active',
            started_at: new Date().toISOString()
          }
        ]);

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      return res.json({ message: 'Free plan activated successfully' });
    }

    // For paid plans, you would integrate with Stripe here
    // For now, return a placeholder response
    res.json({
      message: 'Paid plan creation not implemented yet',
      clientSecret: 'placeholder_client_secret',
      subscriptionId: 'placeholder_subscription_id'
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Cancel subscription
router.post('/cancel', authenticateUser, async (req, res) => {
  try {
    const { immediate = false } = req.body;

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: immediate ? 'cancelled' : 'active',
        cancel_at_period_end: !immediate,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: immediate 
        ? 'Subscription cancelled immediately' 
        : 'Subscription will be cancelled at the end of the billing period'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Reactivate subscription
router.post('/reactivate', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        cancel_at_period_end: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Subscription reactivated successfully' });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// Update subscription plan
router.put('/plan', authenticateUser, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !PLAN_LIMITS[plan]) {
      return res.status(400).json({ error: 'Invalid plan specified' });
    }

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        plan: plan,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Plan updated successfully' });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Get billing history (placeholder)
router.get('/billing-history', authenticateUser, async (req, res) => {
  try {
    // This would integrate with Stripe to get actual billing history
    // For now, return empty array
    res.json({ history: [] });
  } catch (error) {
    console.error('Error getting billing history:', error);
    res.status(500).json({ error: 'Failed to get billing history' });
  }
});

module.exports = router;