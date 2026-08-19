const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create payment intent for application fee
const createPaymentIntent = async (req, res) => {
  try {
    const { applicationId, amount = 50 } = req.body; // P50 application fee

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to thebe (cents)
      currency: 'bwp',
      metadata: {
        applicationId,
        userId: req.user.userId,
        purpose: 'Land application fee'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      applicationId
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

// Confirm payment and update application status
const confirmPayment = async (req, res) => {
  try {
    const { applicationId, paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update application with payment status
      await prisma.application.update({
        where: { applicationId },
        data: {
          paymentStatus: 'PAID',
          paymentDate: new Date(),
          paymentIntentId: paymentIntentId
        }
      });

      res.json({ success: true, message: 'Payment confirmed' });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

module.exports = { createPaymentIntent, confirmPayment };