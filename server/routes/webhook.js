const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Design = require('../models/Design');
const Notification = require('../models/Notification');

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.payment_status === 'paid') {
        const order = await Order.findOne({ stripeSessionId: session.id });
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.status = 'paid';
          order.stripePaymentIntentId = session.payment_intent;
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
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (order) {
        order.status = 'cancelled';
        await order.save();
      }
      break;
    }
    default:
      console.log(`Unhandled webhook event: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

module.exports = router;
