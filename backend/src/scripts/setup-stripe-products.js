const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  try {
    console.log('Setting up Stripe products and prices...');

    // Create Pro product
    const proProduct = await stripe.products.create({
      name: 'RobotPDF Pro',
      description: 'Great for regular users with advanced features',
      metadata: {
        plan: 'pro'
      }
    });

    // Create Pro price
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 100, // $1.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'pro'
      }
    });

    // Create Premium product
    const premiumProduct = await stripe.products.create({
      name: 'RobotPDF Premium',
      description: 'For power users and teams with unlimited features',
      metadata: {
        plan: 'premium'
      }
    });

    // Create Premium price
    const premiumPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 1000, // $10.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'premium'
      }
    });

    console.log('✅ Stripe products and prices created successfully!');
    console.log('\nAdd these to your .env file:');
    console.log(`STRIPE_PRICE_ID_PRO=${proPrice.id}`);
    console.log(`STRIPE_PRICE_ID_PREMIUM=${premiumPrice.id}`);
    
    console.log('\nProduct Details:');
    console.log('Pro Product:', proProduct.id);
    console.log('Pro Price:', proPrice.id);
    console.log('Premium Product:', premiumProduct.id);
    console.log('Premium Price:', premiumPrice.id);

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error);
  }
}

setupStripeProducts();