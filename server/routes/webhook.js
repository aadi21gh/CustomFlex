const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Design = require('../models/Design');
const Notification = require('../models/Notification');

router.post('/', async (req, res) => {
  const rzpSignature = req.headers['x-razorpay-signature'];
  const stripeSignature = req.headers['stripe-signature'];

  // 1. Handle Razorpay Webhook
  if (rzpSignature) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const rawBody = req.body ? req.body.toString('utf8') : '';

    if (webhookSecret) {
      try {
        const isValid = Razorpay.validateWebhookSignature(rawBody, rzpSignature, webhookSecret);
        if (!isValid) {
          console.error('❌ Razorpay webhook signature verification failed.');
          return res.status(400).json({ success: false, message: 'Invalid signature' });
        }
      } catch (err) {
        console.error('❌ Razorpay webhook error:', err.message);
        return res.status(400).json({ success: false, message: err.message });
      }
    }

    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : JSON.parse(rawBody);
      const event = payload.event;
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      if (event === 'payment.captured' || event === 'order.paid') {
        const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
        const razorpayPaymentId = paymentEntity?.id;

        if (razorpayOrderId) {
          const order = await Order.findOne({ razorpayOrderId });
          if (order && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = new Date();
            order.status = 'paid';
            if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;
            await order.save();

            // Increment design purchase count
            await Design.findByIdAndUpdate(order.design, { $inc: { purchaseCount: 1 } });

            // Notify user
            await Notification.create({
              recipient: order.user,
              type: 'order_placed',
              message: `✅ Your order ${order.orderNumber} has been confirmed and is being processed!`,
              link: '/dashboard/orders',
              meta: { orderId: order._id },
            });
          }
        }
      } else if (event === 'payment.failed') {
        const razorpayOrderId = paymentEntity?.order_id;
        if (razorpayOrderId) {
          const order = await Order.findOne({ razorpayOrderId });
          if (order && !order.isPaid) {
            order.status = 'cancelled';
            await order.save();
          }
        }
      }

      return res.status(200).json({ status: 'ok' });
    } catch (parseErr) {
      console.error('Razorpay payload parse error:', parseErr.message);
      return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    }
  }

  // 2. Fallback Legacy Stripe Webhook
  if (stripeSignature && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const event = stripe.webhooks.constructEvent(req.body, stripeSignature, process.env.STRIPE_WEBHOOK_SECRET);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          const order = await Order.findOne({ stripeSessionId: session.id });
          if (order && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = new Date();
            order.status = 'paid';
            order.stripePaymentIntentId = session.payment_intent;
            await order.save();
            await Design.findByIdAndUpdate(order.design, { $inc: { purchaseCount: 1 } });
            await Notification.create({
              recipient: order.user,
              type: 'order_placed',
              message: `✅ Your order ${order.orderNumber} has been confirmed!`,
              link: '/dashboard/orders',
              meta: { orderId: order._id },
            });
          }
        }
      }
    } catch (err) {
      console.error(`Legacy stripe webhook failed: ${err.message}`);
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;
