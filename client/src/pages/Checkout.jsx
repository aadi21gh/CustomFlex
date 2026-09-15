import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Package, Truck, CreditCard, ArrowRight, ArrowLeft,
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
  { id: 'standard', label: 'Standard Shipping', price: 99,  days: '2-3 weeks', icon: '📦' },
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
    { id: 'silk',             label: 'Silk',             addOn: 300, description: 'Pure 100% mulberry silk' },
    { id: 'linen',            label: 'Linen',            addOn: 150, description: 'Lightweight breathable linen' },
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
      label: pricing.deliveryLabel || 'Delivery',
      value: `+${formatPrice(pricing.deliveryCharge)}`,
      icon: <Truck className="w-3.5 h-3.5" />,
      color: 'text-cyan-400',
      sub: pricing.deliveryDays,
    },
    pricing.couponDiscount > 0 ? {
      label: `Coupon (${pricing.couponCode})`,
      value: `−${formatPrice(pricing.couponDiscount)}`,
      icon: <Tag className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'text-emerald-400',
    } : null,
  ].filter(Boolean);

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

const SUBCATEGORY_MAP = {
  tshirt: 't-shirt',
  oversized: 'oversized-tee',
  hoodie: 'hoodie',
  sweatshirt: 'sweatshirt',
  longsleeve: 'longsleeve',
  tanktop: 'tank-top',
  polo: 'polo-shirt',
  jacket: 'jacket',
  jersey: 'jersey',
  canvas: 'canvas-print',
  poster: 'poster',
  acrylic: 'acrylic-print',
  phonecase: 'phone-case',
  totebag: 'tote-bag',
  cap: 'cap',
};

/* ─── Main Checkout Page ─────────────────────────────────────────────────────── */
const Checkout = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const designId = params.get('designId');
  const category = params.get('category') || 'clothing';
  const productTypeParam = params.get('productType');
  const materialParam = params.get('material');
  const colorParam = params.get('color');

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [design, setDesign] = useState(null);

  const [options, setOptions] = useState({
    material: materialParam || DEFAULT_MATERIALS[category] || 'cotton',
    printArea: category === 'clothing' ? 'front' : 'standard',
    size: 'M',
    color: colorParam || '#FFFFFF',
    quantity: 1,
    deliveryMethod: 'standard',
  });

  const [address, setAddress] = useState({
    fullName: '', address: '', city: '', state: '',
    postalCode: '', country: 'IN', phone: '',
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  // Load design
  useEffect(() => {
    if (!designId) return;
    api.get(`/designs/${designId}`)
      .then(({ data }) => setDesign(data.design))
      .catch(() => toast.error('Failed to load design details'));
  }, [designId]);

  // Load products by category and auto-match studio selection
  useEffect(() => {
    api.get(`/products?category=${category}`)
      .then(({ data }) => {
        const prodList = data.products || [];
        setProducts(prodList);
        if (prodList.length > 0) {
          const targetSub = SUBCATEGORY_MAP[productTypeParam] || productTypeParam;
          const matched = prodList.find(
            (p) => p.subcategory === targetSub || p.subcategory?.includes(productTypeParam) || p._id === productTypeParam
          ) || prodList[0];

          setSelectedProduct(matched);
          setOptions((prev) => ({
            ...prev,
            material: materialParam || matched.defaultMaterial || DEFAULT_MATERIALS[category] || 'cotton',
            color: colorParam || prev.color || '#FFFFFF',
            size: matched.sizes?.includes('M') ? 'M' : (matched.sizes?.[0] || 'M'),
          }));
        }
      })
      .catch(() => toast.error('Failed to load product details'))
      .finally(() => setIsLoadingProducts(false));
  }, [category, productTypeParam, materialParam, colorParam]);

  // Recalculate price whenever options, product, or applied coupon changes
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
        couponCode: appliedCoupon,
      });
      setPricing(data.pricing);
    } catch {
      toast.error('Failed to calculate price');
    } finally {
      setIsCalculating(false);
    }
  }, [options, selectedProduct, category, appliedCoupon]);

  useEffect(() => {
    const timer = setTimeout(recalculate, 250);
    return () => clearTimeout(timer);
  }, [recalculate]);

  // Coupon validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedProduct) return;
    setIsCalculating(true);
    setCouponError('');
    try {
      const { data } = await api.post('/orders/calculate-price', {
        category,
        subcategory: selectedProduct.subcategory,
        material: options.material,
        printArea: options.printArea,
        quantity: options.quantity,
        deliveryMethod: options.deliveryMethod,
        productId: selectedProduct._id,
        couponCode: couponCode.trim(),
      });
      if (data.pricing.couponError) {
        setCouponError(data.pricing.couponError);
        toast.error(data.pricing.couponError);
      } else if (data.pricing.couponCode) {
        setAppliedCoupon(data.pricing.couponCode);
        setPricing(data.pricing);
        toast.success(`Coupon "${data.pricing.couponCode}" applied! 🎉`);
      } else {
        toast.error('Invalid coupon code');
      }
    } catch (err) {
      toast.error('Failed to validate coupon code');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponCode('');
    setCouponError('');
  };

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
        couponCode: appliedCoupon,
      });
      if (data.isFree) {
        toast.success('Order placed successfully! 🎉');
        navigate(`/dashboard/orders?success=true&orderId=${data.orderId}`);
      } else if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleGoBackToStudio = () => {
    if (designId) {
      navigate(`/studio/${category}/${designId}?productType=${productTypeParam || ''}&material=${options.material || ''}&color=${encodeURIComponent(options.color || '')}`);
    } else {
      navigate(`/studio?category=${category}&productType=${productTypeParam || ''}&material=${options.material || ''}&color=${encodeURIComponent(options.color || '')}`);
    }
  };

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="section-container pt-24 pb-16">

        {/* Page header with Back to Studio button */}
        <motion.div
          className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ShoppingCart className="w-7 h-7 text-brand-400" />
              <h1 className="text-3xl font-black text-white">Checkout</h1>
            </div>
            <p className="text-dark-400 ml-10">Review your options and complete your custom order</p>
          </div>

          <button
            type="button"
            onClick={handleGoBackToStudio}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-glass-border bg-dark-900/60 hover:bg-dark-800 text-sm font-semibold text-dark-200 hover:text-white transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-brand-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Studio</span>
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">

          {/* ── Left: Configuration ── */}
          <div className="space-y-6">

            {/* Configured Design & Product Card */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-glass-border">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-400" />
                  <h2 className="text-base font-bold text-white">Custom Product &amp; Design</h2>
                </div>
                <button
                  type="button"
                  onClick={handleGoBackToStudio}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Edit in Studio</span>
                  <span>→</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-glass-border bg-dark-900 flex-shrink-0 flex items-center justify-center relative shadow-inner">
                  {design?.thumbnail?.url ? (
                    <img src={design.thumbnail.url} alt={design.title} className="w-full h-full object-contain" />
                  ) : (
                    <Palette className="w-10 h-10 text-dark-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl">{selectedProduct?.emoji || '🎁'}</span>
                    <h3 className="text-white font-black text-lg tracking-tight truncate">
                      {selectedProduct?.name || 'Custom Product'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                      Studio Configured
                    </span>
                  </div>

                  {design?.title && (
                    <p className="text-xs text-dark-300 font-medium truncate">
                      Design: <span className="text-white font-semibold">{design.title}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-1 flex-wrap">
                    {/* Color chip */}
                    {options.color && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-glass-border text-xs text-dark-200">
                        <span className="w-3 h-3 rounded-full border border-white/30 shadow-sm" style={{ background: options.color }} />
                        <span className="font-mono text-[11px] uppercase">{options.color}</span>
                      </div>
                    )}

                    {/* Fabric / Material chip */}
                    {pricing?.materialLabel && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-glass-border text-xs text-dark-200">
                        <Palette className="w-3 h-3 text-brand-400" />
                        <span className="font-semibold">{pricing.materialLabel}</span>
                        {pricing.materialPrice > 0 ? (
                          <span className="text-[10px] text-blue-400 font-bold">(+₹{pricing.materialPrice})</span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold">(Included)</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sizing & Quantity Options */}
            <motion.div
              className="glass-card p-6 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-brand-400" />
                Size &amp; Quantity
              </h2>

              {/* Size picker */}
              {selectedProduct?.sizes?.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-dark-300 block mb-2.5 uppercase tracking-wider">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedProduct.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setOptions((o) => ({ ...o, size: s }))}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                          options.size === s
                            ? 'border-brand-500 bg-brand-500/20 text-brand-300 shadow-sm scale-105'
                            : 'border-glass-border text-dark-300 hover:text-white hover:border-white/20 hover:bg-white/5'
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
                  style={{ background: 'rgba(199,109,74,0.08)', border: '1px solid rgba(199,109,74,0.2)' }}
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
                style={{ background: 'rgba(138,154,123,0.08)', border: '1px solid rgba(138,154,123,0.2)' }}
              >
                <Info className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-dark-400 leading-relaxed">
                  Share your product photo after delivery. When enough people like it, you could earn a reward worth your purchase price! 🎉
                </p>
              </div>

              {/* Dashed divider */}
              <div className="my-4 border-t border-dashed border-glass-border" />

              {/* Coupon Code Section */}
              <div className="mb-4">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon (e.g. FIRST)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 input-field !py-2 text-sm uppercase"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      variant="secondary"
                      size="sm"
                      className="whitespace-nowrap"
                      disabled={isCalculating || !couponCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="text-xs font-bold text-white uppercase">{appliedCoupon}</span>
                        <span className="text-[10px] text-emerald-400 ml-2">Applied</span>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-dark-400 hover:text-red-400 transition-colors px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-red-400 mt-1.5 ml-1">{couponError}</p>
                )}
              </div>

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
