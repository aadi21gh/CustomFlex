const mongoose = require('mongoose');

/**
 * RewardConfig — Single-document configuration for the reward eligibility system.
 *
 * There is only ONE document in this collection.
 * Use RewardConfig.getSingleton() to always get (or create) it.
 *
 * Reward eligibility formula:
 *   1. The user must have a public Post linked to their Order
 *   2. post.likesCount >= likesThreshold (default: equal to order total in INR)
 *   3. At least `minUniquePurchasers` unique users must have purchased the same design
 *   4. Admin reviews and approves → reward is issued (Stripe refund)
 */
const rewardConfigSchema = new mongoose.Schema(
  {
    /* ── Eligibility Thresholds ──────────────────────────────────────────── */
    // Likes required. 'auto' = equal to order total (₹799 order → 799 likes)
    likesMode: {
      type: String,
      enum: ['auto', 'fixed'],
      default: 'auto',
    },
    // Used only when likesMode = 'fixed'
    fixedLikesThreshold: {
      type: Number,
      default: 500,
      min: 1,
    },

    // Minimum unique purchasers of the same design (including the applicant)
    minUniquePurchasers: {
      type: Number,
      default: 2,
      min: 2,
    },

    /* ── Reward Amount ───────────────────────────────────────────────────── */
    // Percentage of order total to reward (100 = full refund)
    rewardPercentage: {
      type: Number,
      default: 100,
      min: 1,
      max: 100,
    },

    /* ── Cron Schedule ───────────────────────────────────────────────────── */
    // How often the eligibility checker runs (cron expression)
    cronSchedule: {
      type: String,
      default: '0 */6 * * *', // every 6 hours
    },

    /* ── Email Notifications ─────────────────────────────────────────────── */
    sendEligibleEmail: { type: Boolean, default: true },
    sendApprovedEmail: { type: Boolean, default: true },

    /* ── Meta ────────────────────────────────────────────────────────────── */
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      default:
        'Default: post likes ≥ order total, min 2 unique purchasers, full 100% reward.',
    },
  },
  { timestamps: true }
);

/**
 * getSingleton — Returns the one-and-only config document.
 * Creates it with defaults if it doesn't exist yet.
 */
rewardConfigSchema.statics.getSingleton = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
    console.log('🏆 RewardConfig created with defaults.');
  }
  return config;
};

module.exports = mongoose.model('RewardConfig', rewardConfigSchema);
