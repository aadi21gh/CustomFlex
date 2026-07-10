import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Package, Truck, CreditCard, ArrowRight,
  CheckCircle2, Loader2, Info, ChevronDown, ChevronUp,
  Minus, Plus, Tag, Box, Palette, Star,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

/* ─── Static delivery options (mirrors backend) ─────────────────────────────── */
const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', price: 99,  days: '7-10 business days', icon: '📦' },
  { id: 'express',  label: 'Express Delivery',  price: 199, days: '3-5 business days',  icon: '⚡' },
  { id: 'overnight',label: 'Priority Delivery', price: 349, days: '1-2 business days',  icon: '🚀' },
];

/* ─── Material options per category (mirrors backend MATERIAL_OPTIONS) ───────── */
const MATERIALS_BY_CATEGORY = {
  clothing:    [
    { id: 'cotton',           label: 'Cotton',           addOn: 0,   description: 'Standard 180 GSM cotton' },
    { id: 'premium-cotton',   label: 'Premium Cotton',   addOn: 120, description: 'Soft 240 GSM combed cotton' },
    { id: 'organic-cotton',   label: 'Organic Cotton',   addOn: 200, description: 'GOTS certified organic' },
    { id: 'oversized-cotton', label: 'Oversized Cotton', addOn: 80,  description: 'Relaxed fit 220 GSM' },
    { id: 'dry-fit',          label: 'Dry Fit',          addOn: 150, description: 'Moisture-wicking polyester' },
    { id: 'polyester',        label: 'Polyester',        addOn: 60,  description: 'Durable synthetic blend' },
  ],
  artwork: [
    { id: 'matte-paper',  label: 'Matte Paper',   addOn: 0,   description: 'Standard 250 GSM matte' },
    { id: 'glossy-paper', label: 'Glossy Paper',  addOn: 50,  description: 'High-gloss 300 GSM' },
    { id: 'canvas',       label: 'Canvas',        addOn: 300, description: 'Artist-grade stretched canvas' },
    { id: 'acrylic',      label: 'Acrylic Glass', addOn: 500, description: '4mm shatter-resistant acrylic' },
    { id: 'wood',         label: 'Wood',          addOn: 400, description: 'Birch wood panel' },
    { id: 'metal',        label: 'Aluminum',      addOn: 600, description: 'Brushed aluminum sheet' },
  ],
  accessories: [
    { id: 'standard',       label: 'Standard',       addOn: 0,   description: 'Default quality material' },
    { id: 'premium',        label: 'Premium',        addOn: 200, description: 'Upgraded premium material' },
    { id: 'silicone',       label: 'Silicone',       addOn: 0,   description: 'Flexible silicone case' },
    { id: 'hard-plastic',   label: 'Hard Plastic',   addOn: 50,  description: 'Impact-resistant polycarbonate' },
    { id: 'leather',        label: 'Leather',        addOn: 350, description: 'Genuine leather finish' },
    { id: 'stainless-steel',label: 'Stainless Steel',addOn: 250, description: 'Brushed 316L stainless' },
  ],
};

const DEFAULT_MATERIALS = { clothing: 'cotton', artwork: 'matte-paper', accessories: 'standard' };

const PRINT_AREAS = [
  { id: 'front',        label: 'Front Only',    charge: 199 },
  { id: 'back',         label: 'Back Only',     charge: 199 },
  { id: 'front-back',   label: 'Front + Back',  charge: 349 },
  { id: 'left-sleeve',  label: 'Left Sleeve',   charge: 249 },
  { id: 'right-sleeve', label: 'Right Sleeve',  charge: 249 },
  { id: 'all-over',     label: 'All Over Print',charge: 599 },
  { id: 'full',         label: 'Full Area',     charge: 399 },
  { id: 'standard',     label: 'Standard',      charge: 149 },
];

/* ─── Price Breakdown Component ─────────────────────────────────────────────── */
const PriceBreakdown = ({ pricing, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-3 rounded-full bg-white/5 animate-pulse" style={{ width: `${40 + i * 10}%` }} />
            <div className="h-3 w-16 rounded-full bg-white/5 animate-pulse" />
          </div>
        ))}
        <div className="border-t border-glass-border pt-3 mt-3">
          <div className="h-5 w-28 rounded-full bg-white/5 animate-pulse ml-auto" />
        </div>
      </div>
    );
  }

  if (!pricing) return (
    <p className="text-xs text-dark-500 text-center py-4">
      Select a product and material to see pricing
    </p>
  );

  const rows = [
    {
      label: 'Base Product',
      value: formatPrice(pricing.basePrice),
      icon: <Box className="w-3.5 h-3.5" />,
      color: 'text-dark-200',
    },
    {
      label: pricing.materialLabel || 'Material',
      value: pricing.materialPrice > 0 ? `+${formatPrice(pricing.materialPrice)}` : 'Included',
      icon: <Palette className="w-3.5 h-3.5" />,
      color: pricing.materialPrice > 0 ? 'text-blue-400' : 'text-dark-400',
      sub: pricing.materialDescription,
    },
    {
      label: `Design Charge (${pricing.printAreaLabel || 'Standard'})`,
      value: `+${formatPrice(pricing.designCharge)}`,
      icon: <Tag className="w-3.5 h-3.5" />,
      color: 'text-purple-400',
    },
    {
      label: pricing.deliveryLabel || 'Delivery',
      value: `+${formatPrice(pricing.deliveryCharge)}`,
      icon: <Truck className="w-3.5 h-3.5" />,
      color: 'text-cyan-400',
      sub: pricing.deliveryDays,
    },
  ];

  return (
    <div className="space-y-0">
      {/* Breakdown rows */}
      {rows.map(({ label, value, icon, color, sub }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="py-2.5 border-b border-glass-border/60 last:border-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-dark-500">{icon}</span>
              <span className="text-dark-400">{label}</span>
            </div>
            <span className={`text-sm font-semibold tabular-nums ${color}`}>{value}</span>
          </div>
          {sub && <p className="text-xs text-dark-600 mt-0.5 ml-5">{sub}</p>}
        </motion.div>
      ))}

      {/* Quantity multiplier row */}
      {pricing.quantity > 1 && (
        <div className="py-2.5 border-b border-glass-border/60">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-400">× {pricing.quantity} items</span>
            <span className="text-dark-200 font-semibold tabular-nums">
              {formatPrice(pricing.itemsTotal)}
            </span>
          </div>
        </div>
      )}

      {/* Quantity discount */}
      {pricing.quantityDiscount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-2.5 border-b border-glass-border/60"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-emerald-400 font-medium">Bulk Discount</span>
            </div>
            <span className="text-emerald-400 font-semibold tabular-nums">
              −{formatPrice(pricing.quantityDiscount)}
            </span>
          </div>
        </motion.div>
      )}

      {/* Dashed divider */}
      <div className="my-3 border-t border-dashed border-glass-border" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-white text-base">Total</span>
        <motion.span
          key={pricing.total}
          initial={{ scale: 1.1, color: '#818cf8' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-black gradient-text tabular-nums"
        >
          {formatPrice(pricing.total)}
        </motion.span>
      </div>

      {/* Tax note */}
      <p className="text-[10px] text-dark-600 mt-1">All prices inclusive of GST</p>
    </div>
  );
};

/* ─── Material Selector ──────────────────────────────────────────────────────── */
const MaterialSelector = ({ category, value, onChange }) => {
  const materials = MATERIALS_BY_CATEGORY[category] || MATERIALS_BY_CATEGORY.accessories;
  const selected = materials.find((m) => m.id === value) || materials[0];

  return (
    <div>
      <label className="text-xs font-semibold text-dark-300 block mb-2 uppercase tracking-wider">
        Material / Fabric
      </label>
      <div className="grid grid-cols-2 gap-2">
        {materials.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`p-3 rounded-xl text-left transition-all duration-200 border ${
              value === m.id
                ? 'border-brand-500/60 bg-brand-500/10'
                : 'border-glass-border hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-xs font-semibold text-white">{m.label}</p>
              {m.addOn > 0 ? (
                <span className="text-[10px] font-bold text-blue-400">+₹{m.addOn}</span>
              ) : (
                <span className="text-[10px] font-medium text-emerald-500">Free</span>
              )}
            </div>
            <p className="text-[10px] text-dark-500 leading-tight">{m.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── Print Area Selector (clothing only) ────────────────────────────────────── */
const PrintAreaSelector = ({ value, onChange, category }) => {
  // Only show for clothing; artwork/accessories use 'standard'
  if (category !== 'clothing') return null;
  const areas = PRINT_AREAS.filter((a) => a.id !== 'standard');

  return (
    <div>
      <label className="text-xs font-semibold text-dark-300 block mb-2 uppercase tracking-wider">
        Print Area
      </label>
      <div className="flex flex-wrap gap-2">
        {areas.map((a) => (
          <button
            key={a.id}
            onClick={() => onChange(a.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              value === a.id
                ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                : 'border-glass-border text-dark-400 hover:text-white hover:border-white/20'
            }`}
          >
            <span>{a.label}</span>
            <span className="ml-1 opacity-70">+₹{a.charge}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── Quantity Stepper ───────────────────────────────────────────────────────── */
const QuantityStepper = ({ value, onChange }) => (
  <div>
    <label className="text-xs font-semibold text-dark-300 block mb-2 uppercase tracking-wider">
      Quantity
    </label>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all border border-glass-border hover:border-white/20 hover:bg-white/5 text-dark-300 hover:text-white"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-10 text-center text-white font-bold text-lg tabular-nums">{value}</span>
      <button
        onClick={() => onChange(Math.min(100, value + 1))}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all border border-glass-border hover:border-white/20 hover:bg-white/5 text-dark-300 hover:text-white"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      {value >= 3 && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs text-emerald-400 font-semibold"
        >
          {value >= 10 ? '15% off!' : value >= 5 ? '10% off!' : '5% off!'}
        </motion.span>
      )}
    </div>
  </div>
);

/* ─── Main Checkout Page ─────────────────────────────────────────────────────── */
const Checkout = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const designId = params.get('designId');
  const category = params.get('category') || 'clothing';

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [design, setDesign] = useState(null);

  const [options, setOptions] = useState({
    material: DEFAULT_MATERIALS[category] || 'standard',
    printArea: category === 'clothing' ? 'front' : 'standard',
    size: '',
    color: '',
    quantity: 1,
    deliveryMethod: 'standard',
  });

  const [address, setAddress] = useState({
    fullName: '', address: '', city: '', state: '',
    postalCode: '', country: 'IN', phone: '',
  });

  // Load design
  useEffect(() => {
    if (!designId) return;
    api.get(`/designs/${designId}`)
      .then(({ data }) => setDesign(data.design))
      .catch(() => toast.error('Failed to load design details'));
  }, [designId]);

  // Load products by category
  useEffect(() => {
    api.get(`/products?category=${category}`)
      .then(({ data }) => {
        setProducts(data.products);
        if (data.products.length > 0) setSelectedProduct(data.products[0]);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setIsLoadingProducts(false));
  }, [category]);

  // Recalculate price whenever options or product changes
  const recalculate = useCallback(async () => {
    if (!selectedProduct) return;
    setIsCalculating(true);
    try {
      const { data } = await api.post('/orders/calculate-price', {
        category,
        subcategory: selectedProduct.subcategory,
        material: options.material,
        printArea: options.printArea,
        quantity: options.quantity,
        deliveryMethod: options.deliveryMethod,
        productId: selectedProduct._id,
      });
      setPricing(data.pricing);
    } catch {
      toast.error('Failed to calculate price');
    } finally {
      setIsCalculating(false);
    }
  }, [options, selectedProduct, category]);

  useEffect(() => {
    const timer = setTimeout(recalculate, 250);
    return () => clearTimeout(timer);
  }, [recalculate]);

  const handleCheckout = async () => {
    if (!designId)         { toast.error('No design selected'); return; }
    if (!selectedProduct)  { toast.error('Please select a product'); return; }
    if (!address.fullName || !address.address || !address.city || !address.postalCode) {
      toast.error('Please fill in all required address fields'); return;
    }

    setIsCheckingOut(true);
    try {
      const { data } = await api.post('/orders/create-checkout-session', {
        designId,
        productId: selectedProduct._id,
        quantity: options.quantity,
        material: options.material,
        printArea: options.printArea,
        size: options.size,
        color: options.color,
        deliveryMethod: options.deliveryMethod,
        shippingAddress: address,
      });
      if (data.sessionUrl) window.location.href = data.sessionUrl;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="section-container pt-24 pb-16">

        {/* Page title */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <ShoppingCart className="w-7 h-7 text-brand-400" />
            <h1 className="text-3xl font-black text-white">Checkout</h1>
          </div>
          <p className="text-dark-400 ml-10">Review your options and complete your custom order</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">

          {/* ── Left: Configuration ── */}
          <div className="space-y-6">

            {/* Design preview card */}
            {design && (
              <motion.div
                className="glass-card p-5 flex items-center gap-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-glass-border bg-dark-900 flex-shrink-0 flex items-center justify-center">
                  {design.thumbnail?.url ? (
                    <img src={design.thumbnail.url} alt={design.title} className="w-full h-full object-contain" />
                  ) : (
                    <Palette className="w-8 h-8 text-dark-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-brand-400 font-semibold uppercase tracking-wider mb-1">Your Design</p>
                  <h3 className="text-white font-bold text-lg truncate">{design.title}</h3>
                  <p className="text-dark-400 text-sm capitalize">{category} • Custom Print</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              </motion.div>
            )}

            {/* Product Selection */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-400" />
                Select Product
              </h2>
              {isLoadingProducts ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <p className="text-dark-500 text-sm text-center py-6">No products found for this category</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => setSelectedProduct(p)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                        selectedProduct?._id === p._id
                          ? 'border-brand-500/60 bg-brand-500/10'
                          : 'border-glass-border hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <p className="text-lg mb-1">{p.emoji || '🎁'}</p>
                      <p className="text-sm font-semibold text-white leading-tight">{p.name}</p>
                      <p className="text-xs text-dark-400 capitalize mt-0.5">{p.subcategory}</p>
                      <p className="text-sm font-bold text-brand-400 mt-1.5">from {formatPrice(p.basePrice)}</p>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Material & Print Area */}
            <motion.div
              className="glass-card p-6 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-brand-400" />
                Customization Options
              </h2>

              <MaterialSelector
                category={category}
                value={options.material}
                onChange={(v) => setOptions((o) => ({ ...o, material: v }))}
              />

              <PrintAreaSelector
                category={category}
                value={options.printArea}
                onChange={(v) => setOptions((o) => ({ ...o, printArea: v }))}
              />

              {/* Size picker */}
              {selectedProduct?.sizes?.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-dark-300 block mb-2 uppercase tracking-wider">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setOptions((o) => ({ ...o, size: s }))}
                        className={`px-3.5 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                          options.size === s
                            ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                            : 'border-glass-border text-dark-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <QuantityStepper
                value={options.quantity}
                onChange={(v) => setOptions((o) => ({ ...o, quantity: v }))}
              />
            </motion.div>

            {/* Delivery Method */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-400" />
                Delivery Method
              </h2>
              <div className="space-y-2.5">
                {DELIVERY_OPTIONS.map((d) => (
                  <label
                    key={d.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      options.deliveryMethod === d.id
                        ? 'border-brand-500/60 bg-brand-500/10'
                        : 'border-glass-border hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={d.id}
                      checked={options.deliveryMethod === d.id}
                      onChange={() => setOptions((o) => ({ ...o, deliveryMethod: d.id }))}
                      className="accent-brand-500"
                    />
                    <span className="text-xl">{d.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{d.label}</p>
                      <p className="text-xs text-dark-400">{d.days}</p>
                    </div>
                    <span className="text-sm font-bold text-brand-400">+{formatPrice(d.price)}</span>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-400" />
                Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input id="checkout-name"    label="Full Name *"      placeholder="Rahul Kumar"      value={address.fullName}   onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))}   required className="col-span-2" />
                <Input id="checkout-address" label="Street Address *" placeholder="123, MG Road"     value={address.address}    onChange={(e) => setAddress((a) => ({ ...a, address: e.target.value }))}    required className="col-span-2" />
                <Input id="checkout-city"    label="City *"           placeholder="Bengaluru"        value={address.city}       onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}       required />
                <Input id="checkout-state"   label="State"            placeholder="Karnataka"        value={address.state}      onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} />
                <Input id="checkout-zip"     label="PIN Code *"       placeholder="560001"           value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} required />
                <Input id="checkout-phone"   label="Phone"            placeholder="+91 98765 43210"  value={address.phone}      onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} />
              </div>
            </motion.div>
          </div>

          {/* ── Right: Order Summary (sticky) ── */}
          <div className="space-y-4 lg:sticky lg:top-24 self-start">
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-400" />
                Price Breakdown
              </h2>

              {/* Product summary chip */}
              {selectedProduct && (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl mb-5"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  <span className="text-2xl">{selectedProduct.emoji || '🎁'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{selectedProduct.name}</p>
                    <p className="text-xs text-dark-400 capitalize truncate">
                      {category} · {options.material?.replace(/-/g, ' ')} · ×{options.quantity}
                    </p>
                  </div>
                </div>
              )}

              {/* THE PRICE BREAKDOWN */}
              <PriceBreakdown pricing={pricing} isLoading={isCalculating} />

              {/* Reward info nudge */}
              <div
                className="flex items-start gap-2 mt-5 p-3 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
              >
                <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-dark-400 leading-relaxed">
                  Share your product photo after delivery. When enough people like it, you could earn a reward worth your purchase price! 🎉
                </p>
              </div>

              {/* Checkout button */}
              <Button
                onClick={handleCheckout}
                disabled={!pricing || isCheckingOut || !selectedProduct}
                isLoading={isCheckingOut}
                variant="primary"
                className="w-full mt-5 !py-4"
                id="checkout-pay-btn"
              >
                <CreditCard className="w-5 h-5" />
                {isCheckingOut ? 'Redirecting…' : `Pay ${pricing ? formatPrice(pricing.total) : '…'}`}
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-dark-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Secured by Stripe · SSL encrypted
              </div>
            </motion.div>

            {/* What's included box */}
            <motion.div
              className="glass-card p-5"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">What's included</p>
              {[
                'Professional print on premium material',
                'Custom design applied to your specs',
                'Packaged & shipped to your door',
                'Eligible for community reward program',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 py-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-dark-400">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
