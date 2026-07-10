const Order = require('../models/Order');
const Post = require('../models/Post');
const Refund = require('../models/Refund');
const Notification = require('../models/Notification');
const RewardConfig = require('../models/RewardConfig');
const { sendEmail, getRefundEligibleEmail } = require('./sendEmail');
const User = require('../models/User');

/**
 * checkRefundEligibility (Reward Eligibility Checker)
 *
 * Runs on a configurable cron schedule (default: every 6 hours).
 * All thresholds are read live from the RewardConfig singleton —
 * no hardcoded business logic.
 */
const checkRefundEligibility = async () => {
  try {
    console.log('🏆 Running reward eligibility check...');

    // Load live config from DB (creates default if missing)
    const config = await RewardConfig.getSingleton();
    const { likesMode, fixedLikesThreshold, minUniquePurchasers, rewardPercentage, sendEligibleEmail } = config;

    // All paid, non-rewarded, non-cancelled orders with public posts
    const orders = await Order.find({
      isPaid: true,
      refundEligible: false,
      status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
    }).populate('user', 'name email');

    let eligibleCount = 0;

    for (const order of orders) {
      // Find the public post linked to this order
      const post = await Post.findOne({ order: order._id, isPublic: true });
      if (!post) continue;

      /* ── Condition 1: Likes threshold ─────────────────────────────────── */
      const likesRequired = likesMode === 'auto'
        ? Math.ceil(order.pricing.total)   // ₹917 order → needs 917 likes
        : fixedLikesThreshold;

      const likesCondition = post.likesCount >= likesRequired;

      /* ── Condition 2: Unique purchasers of same design ────────────────── */
      const otherPurchasers = await Order.distinct('user', {
        design: order.design,
        isPaid: true,
        _id: { $ne: order._id },
      });
      // minUniquePurchasers includes the original buyer, so others needed = minUniquePurchasers - 1
      const purchasersCondition = otherPurchasers.length >= (minUniquePurchasers - 1);

      if (!likesCondition || !purchasersCondition) continue;

      /* ── Mark order as reward eligible ───────────────────────────────── */
      order.refundEligible = true;
      order.refundEligibleAt = new Date();
      order.status = 'refund_eligible';
      await order.save();

      // Skip if reward request already exists for this order
      const existingRefund = await Refund.findOne({ order: order._id });
      if (existingRefund) continue;

      /* ── Calculate reward amount ─────────────────────────────────────── */
      const rewardAmount = parseFloat((order.pricing.total * rewardPercentage / 100).toFixed(2));

      /* ── Create reward (refund) request ──────────────────────────────── */
      await Refund.create({
        order: order._id,
        user: order.user._id,
        post: post._id,
        design: order.design,
        amount: rewardAmount,
        status: 'pending',
        eligibilityReason: {
          likesCount: post.likesCount,
          requiredLikes: likesRequired,
          uniquePurchasers: otherPurchasers.length + 1,
          requiredPurchasers: minUniquePurchasers,
        },
      });

      /* ── In-app notification ─────────────────────────────────────────── */
      await Notification.create({
        recipient: order.user._id,
        type: 'refund_eligible',
        message: `🎉 Your order ${order.orderNumber} is reward eligible! ₹${rewardAmount.toFixed(0)} is being reviewed.`,
        link: '/dashboard/refunds',
        meta: { orderId: order._id, rewardAmount },
      });

      /* ── Email notification (if enabled) ────────────────────────────── */
      if (sendEligibleEmail) {
        try {
          const emailTemplate = getRefundEligibleEmail(
            order.user.name,
            order.orderNumber,
            rewardAmount
          );
          await sendEmail({ to: order.user.email, ...emailTemplate });
        } catch (emailError) {
          console.error('Failed to send reward eligible email:', emailError.message);
        }
      }

      eligibleCount++;
    }

    console.log(`✅ Reward check complete. ${eligibleCount} new eligible order(s).`);
    return eligibleCount;
  } catch (error) {
    console.error('❌ Reward eligibility check failed:', error.message);
    return 0;
  }
};

module.exports = { checkRefundEligibility };
