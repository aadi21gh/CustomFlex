const Order = require('../models/Order');
const Post = require('../models/Post');
const Refund = require('../models/Refund');
const Notification = require('../models/Notification');
const { sendEmail, getRefundEligibleEmail } = require('./sendEmail');
const User = require('../models/User');

const checkRefundEligibility = async () => {
  try {
    console.log('🔄 Running refund eligibility check...');

    // Get all paid orders that aren't already refund eligible or refunded
    const orders = await Order.find({
      isPaid: true,
      refundEligible: false,
      status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
    }).populate('user', 'name email');

    let eligibleCount = 0;

    for (const order of orders) {
      // Find the post associated with this order's design
      const post = await Post.findOne({
        order: order._id,
        isPublic: true,
      });

      if (!post) continue;

      // Check condition 1: likes >= product price
      const likesCondition = post.likesCount >= order.pricing.total;

      // Check condition 2: at least 2 different users purchased the same design
      const uniquePurchasers = await Order.distinct('user', {
        design: order.design,
        isPaid: true,
        _id: { $ne: order._id },
      });
      const purchasersCondition = uniquePurchasers.length >= 1; // 1 other = 2 total

      if (likesCondition && purchasersCondition) {
        // Mark order as refund eligible
        order.refundEligible = true;
        order.refundEligibleAt = new Date();
        order.status = 'refund_eligible';
        await order.save();

        // Check if refund request already exists
        const existingRefund = await Refund.findOne({ order: order._id });
        if (!existingRefund) {
          // Create refund request
          await Refund.create({
            order: order._id,
            user: order.user._id,
            post: post._id,
            design: order.design,
            amount: order.pricing.total,
            status: 'pending',
            eligibilityReason: {
              likesCount: post.likesCount,
              requiredLikes: Math.ceil(order.pricing.total),
              uniquePurchasers: uniquePurchasers.length + 1,
              requiredPurchasers: 2,
            },
          });

          // Create in-app notification
          await Notification.create({
            recipient: order.user._id,
            type: 'refund_eligible',
            message: `🎉 Your order ${order.orderNumber} is now eligible for a refund!`,
            link: '/dashboard/refunds',
            meta: { orderId: order._id },
          });

          // Send email notification
          try {
            const emailTemplate = getRefundEligibleEmail(
              order.user.name,
              order.orderNumber,
              order.pricing.total
            );
            await sendEmail({
              to: order.user.email,
              ...emailTemplate,
            });
          } catch (emailError) {
            console.error('Failed to send refund eligible email:', emailError.message);
          }

          eligibleCount++;
        }
      }
    }

    console.log(`✅ Refund check complete. ${eligibleCount} new eligible order(s).`);
  } catch (error) {
    console.error('❌ Refund eligibility check failed:', error.message);
  }
};

module.exports = { checkRefundEligibility };
