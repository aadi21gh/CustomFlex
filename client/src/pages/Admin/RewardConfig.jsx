import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Settings, Play, Save, RefreshCw, CheckCircle2,
  AlertCircle, ToggleLeft, ToggleRight, Info, Zap, Clock,
  Users, Heart, Percent, Mail,
} from 'lucide-react';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div
    className="glass-card p-5"
    style={{ borderColor: `${color}25` }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon className="w-4.5 h-4.5" style={{ color }} />
      </div>
    </div>
    <p className="text-2xl font-black text-white mb-0.5">{value}</p>
    <p className="text-sm font-medium text-dark-400">{label}</p>
    {sub && <p className="text-xs text-dark-600 mt-1">{sub}</p>}
  </div>
);

/* ─── Toggle Switch ─────────────────────────────────────────────────────────── */
const Toggle = ({ value, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-glass-border last:border-0">
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      {description && <p className="text-xs text-dark-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`flex-shrink-0 transition-colors duration-200 ${value ? 'text-emerald-400' : 'text-dark-600'}`}
    >
      {value ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
    </button>
  </div>
);

/* ─── Number Input ──────────────────────────────────────────────────────────── */
const NumberField = ({ label, value, onChange, min, max, step = 1, prefix, suffix, description }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">{label}</label>
    <div className="flex items-center gap-2">
      {prefix && <span className="text-dark-400 font-bold text-sm">{prefix}</span>}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input flex-1"
        style={{ maxWidth: '120px' }}
      />
      {suffix && <span className="text-dark-400 text-sm">{suffix}</span>}
    </div>
    {description && <p className="text-xs text-dark-500">{description}</p>}
  </div>
);

/* ─── Main Component ────────────────────────────────────────────────────────── */
const RewardConfigPanel = () => {
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [draft, setDraft] = useState(null);

  // Load config + stats
  useEffect(() => {
    const load = async () => {
      try {
        const [configRes, statsRes] = await Promise.all([
          api.get('/admin/reward-config'),
          api.get('/admin/stats'),
        ]);
        setConfig(configRes.data.config);
        setDraft(configRes.data.config);
        setStats(statsRes.data.stats);
      } catch {
        toast.error('Failed to load reward configuration');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const update = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await api.put('/admin/reward-config', draft);
      setConfig(data.config);
      setDraft(data.config);
      setHasChanges(false);
      toast.success('Reward configuration saved!');
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunCheck = async () => {
    setIsRunningCheck(true);
    try {
      const { data } = await api.post('/admin/reward-config/run-check');
      toast.success(data.message);
    } catch {
      toast.error('Failed to run eligibility check');
    } finally {
      setIsRunningCheck(false);
    }
  };

  const handleReset = () => {
    setDraft(config);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header + Actions ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-black text-white">Reward System Config</h2>
          </div>
          <p className="text-dark-400 text-sm">
            Configure eligibility thresholds, reward amounts, and notification settings.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            id="admin-run-reward-check-btn"
            onClick={handleRunCheck}
            disabled={isRunningCheck}
            className="btn-secondary !py-2 !px-4 text-sm gap-1.5"
            whileTap={{ scale: 0.97 }}
          >
            {isRunningCheck ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 text-emerald-400" />
            )}
            Run Check Now
          </motion.button>
          {hasChanges && (
            <>
              <button onClick={handleReset} className="btn-secondary !py-2 !px-4 text-sm">
                Reset
              </button>
              <motion.button
                id="admin-save-reward-config-btn"
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary !py-2 !px-4 text-sm"
                whileTap={{ scale: 0.97 }}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* ── Reward Stats ── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Trophy}
            label="Total Rewards Paid"
            value={formatPrice(stats.totalRewardsPaid || 0)}
            color="#f59e0b"
            sub={`${stats.totalRewardsCount || 0} rewards issued`}
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Reviews"
            value={stats.pendingRefunds || 0}
            color="#ef4444"
            sub="Awaiting admin action"
          />
          <StatCard
            icon={Zap}
            label="Total Revenue"
            value={formatPrice(stats.totalRevenue || 0)}
            color="#8b5cf6"
          />
          <StatCard
            icon={Users}
            label="Active Creators"
            value={(stats.userCount || 0).toLocaleString('en-IN')}
            color="#06b6d4"
          />
        </div>
      )}

      {/* ── Eligibility Rules ── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Heart className="w-4 h-4 text-pink-400" />
          <h3 className="font-bold text-white">Eligibility Rules</h3>
        </div>

        <div className="space-y-5">
          {/* Likes mode toggle */}
          <div>
            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider block mb-2">
              Likes Threshold Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: 'auto',
                  label: 'Auto (= Order Total)',
                  desc: 'A ₹917 order needs 917 likes',
                  icon: '🔄',
                },
                {
                  id: 'fixed',
                  label: 'Fixed Number',
                  desc: 'Same threshold for all orders',
                  icon: '🔒',
                },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => update('likesMode', mode.id)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                    draft?.likesMode === mode.id
                      ? 'border-brand-500/60 bg-brand-500/10'
                      : 'border-glass-border hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{mode.icon}</span>
                    <span className="text-sm font-bold text-white">{mode.label}</span>
                    {draft?.likesMode === mode.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-dark-500">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Fixed likes threshold (only when mode = fixed) */}
          {draft?.likesMode === 'fixed' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <NumberField
                label="Fixed Likes Threshold"
                value={draft?.fixedLikesThreshold || 500}
                onChange={(v) => update('fixedLikesThreshold', v)}
                min={1}
                suffix="likes"
                description="All orders will require exactly this many likes to become reward eligible."
              />
            </motion.div>
          )}

          {/* Min unique purchasers */}
          <NumberField
            label="Minimum Unique Purchasers"
            value={draft?.minUniquePurchasers || 2}
            onChange={(v) => update('minUniquePurchasers', v)}
            min={2}
            max={20}
            prefix="≥"
            suffix="buyers"
            description="Minimum total unique users (including the original buyer) who must have purchased the same design."
          />
        </div>
      </div>

      {/* ── Reward Amount ── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Percent className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white">Reward Amount</h3>
        </div>

        <NumberField
          label="Reward Percentage"
          value={draft?.rewardPercentage || 100}
          onChange={(v) => update('rewardPercentage', v)}
          min={1}
          max={100}
          step={5}
          suffix="% of order total"
          description="100% = full purchase price rewarded. Set to 50% to reward half the order amount."
        />

        {/* Live preview */}
        <div
          className="mt-4 p-3 rounded-xl text-sm"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <p className="text-dark-400">
            Example: A ₹1,299 hoodie order would receive a reward of{' '}
            <span className="text-emerald-400 font-bold">
              {formatPrice(Math.round(1299 * (draft?.rewardPercentage || 100) / 100))}
            </span>
          </p>
        </div>
      </div>

      {/* ── Cron Schedule ── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white">Checker Schedule</h3>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider block">
            Cron Expression
          </label>
          <input
            type="text"
            value={draft?.cronSchedule || '0 */6 * * *'}
            onChange={(e) => update('cronSchedule', e.target.value)}
            className="input w-full font-mono"
            placeholder="0 */6 * * *"
          />
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Every 6h', value: '0 */6 * * *' },
              { label: 'Every 12h', value: '0 */12 * * *' },
              { label: 'Every day', value: '0 9 * * *' },
              { label: 'Every hour', value: '0 * * * *' },
            ].map((preset) => (
              <button
                key={preset.value}
                onClick={() => update('cronSchedule', preset.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  draft?.cronSchedule === preset.value
                    ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                    : 'border-glass-border text-dark-400 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Notifications ── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-violet-400" />
          <h3 className="font-bold text-white">Email Notifications</h3>
        </div>
        <Toggle
          value={draft?.sendEligibleEmail ?? true}
          onChange={(v) => update('sendEligibleEmail', v)}
          label="Reward Eligible Email"
          description="Send an email when a user's order becomes reward eligible."
        />
        <Toggle
          value={draft?.sendApprovedEmail ?? true}
          onChange={(v) => update('sendApprovedEmail', v)}
          label="Reward Approved Email"
          description="Send an email when admin approves a reward request."
        />
      </div>

      {/* ── Description ── */}
      <div className="glass-card p-6">
        <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider block mb-2">
          Config Notes
        </label>
        <textarea
          value={draft?.description || ''}
          onChange={(e) => update('description', e.target.value)}
          rows={2}
          className="input w-full resize-none"
          placeholder="Notes about the current reward configuration..."
        />
        {config?.lastModifiedBy && (
          <p className="text-xs text-dark-600 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Last saved: {new Date(config.updatedAt).toLocaleString('en-IN')}
          </p>
        )}
      </div>

      {/* ── Unsaved indicator ── */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-2xl"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <div className="flex items-center gap-2 text-sm text-brand-300">
            <AlertCircle className="w-4 h-4" />
            You have unsaved changes
          </div>
          <div className="flex gap-2">
            <button onClick={handleReset} className="text-xs text-dark-400 hover:text-white transition-colors">
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary !py-1.5 !px-4 text-xs"
            >
              {isSaving ? 'Saving…' : 'Save Now'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RewardConfigPanel;
