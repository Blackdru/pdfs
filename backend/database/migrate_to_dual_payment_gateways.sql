-- Migration script to support dual payment gateways (Razorpay and PayPal)
-- Run this in your Supabase SQL editor

-- Add new columns to subscriptions table for Razorpay and PayPal
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS razorpay_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paypal_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paypal_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'razorpay', 'paypal', NULL));

-- Add new columns to payment_transactions table
ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paypal_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paypal_order_id VARCHAR(255);

-- Update payment_method check constraint
ALTER TABLE payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_payment_method_check;
ALTER TABLE payment_transactions 
ADD CONSTRAINT payment_transactions_payment_method_check 
CHECK (payment_method IN ('stripe', 'razorpay', 'paypal'));

-- Create indexes for new payment gateway IDs
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_subscription ON subscriptions(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_subscription ON subscriptions(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_payment ON payment_transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_paypal_payment ON payment_transactions(paypal_payment_id);

-- Update plan check constraint to include 'basic' plan
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_plan_check 
CHECK (plan IN ('free', 'basic', 'pro', 'premium'));

-- Add comment to explain the payment gateway strategy
COMMENT ON COLUMN subscriptions.payment_method IS 'Payment gateway used: razorpay for India, paypal for international, stripe for legacy';
COMMENT ON COLUMN subscriptions.razorpay_subscription_id IS 'Razorpay subscription ID for Indian users';
COMMENT ON COLUMN subscriptions.paypal_subscription_id IS 'PayPal subscription ID for international users';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Legacy Stripe subscription ID (deprecated)';

-- Migration complete
SELECT 'Migration to dual payment gateways completed successfully!' as status;
