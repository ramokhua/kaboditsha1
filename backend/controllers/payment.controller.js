const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create payment intent for application fee
const createPaymentIntent = async (req, res) => {
  try {
    const { applicationId, amount = 50 } = req.body;

    const application = await prisma.application.findUnique({
      where: { applicationId }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
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

// Confirm payment and CONVERT DRAFT to SUBMITTED application
const confirmPayment = async (req, res) => {
  try {
    const { applicationId, paymentIntentId } = req.body;

    const application = await prisma.application.findUnique({
      where: { applicationId }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Generate a proper application number (replaces DRAFT number)
    const year = new Date().getFullYear();
    const count = await prisma.application.count({
      where: {
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED', 'APPROVED', 'REJECTED', 'WITHDRAWN'] }
      }
    });
    const applicationNumber = `APP${year}${(count + 1).toString().padStart(6, '0')}`;

    // Calculate queue position
    const queuePosition = await prisma.application.count({
      where: {
        landBoardId: application.landBoardId,
        settlementType: application.settlementType,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
      }
    }) + 1;

    // Update the draft to a fully submitted application
    const updated = await prisma.application.update({
      where: { applicationId },
      data: {
        applicationNumber,
        referenceNumber: applicationNumber,
        status: 'SUBMITTED',
        queuePosition,
        paymentStatus: 'PAID',
        paymentDate: new Date(),
        paymentIntentId: paymentIntentId
      },
      include: {
        landBoard: { select: { name: true, region: true } },
        user: { select: { fullName: true, email: true, omangNumber: true } }
      }
    });

    // Send confirmation email
    try {
      const { sendEmail } = require('../services/email.service');
      await sendEmail(updated.user.email, 'applicationSubmitted', {
        user: updated.user,
        application: updated
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    res.json({
      success: true,
      message: 'Payment confirmed. Application submitted.',
      application: updated,
      receipt: {
        applicationNumber,
        amount: 50,
        currency: 'BWP',
        paymentDate: updated.paymentDate,
        paymentIntentId,
        landBoard: updated.landBoard.name,
        settlementType: updated.settlementType,
        purpose: updated.purpose
      }
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

module.exports = { createPaymentIntent, confirmPayment };