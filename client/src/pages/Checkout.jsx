import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Package, Truck, CreditCard, ArrowRight,
  CheckCircle2, Loader2, Info, Cpu, Check, RefreshCw
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard Shipping', price: 5.99, days: '5-7 business days' },
  { id: 'express', label: 'Express Shipping', price: 12.99, days: '2-3 business days' },
  { id: 'overnight', label: 'Overnight Shipping', price: 24.99, days: 'Next business day' },
];

const scanSteps = [
  'Initializing CustomFlex AI Pricing Engine...',
  'Scanning design canvas vector paths & text layers...',
  'Analyzing color gamut and ink density coefficients...',
  'Assessing artist template demand and market value...',
  'Generating custom optimized price...'
];

const Checkout = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const designId = params.get('designId');
  const category = params.get('category') || 'artwork';

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [options, setOptions] = useState({ material: 'standard', printArea: 'front', size: '', color: '', quantity: 1, shippingMethod: 'standard' });
  const [address, setAddress] = useState({ fullName: '', address: '', city: '', state: '', postalCode: '', country: 'US', phone: '' });

  const [design, setDesign] = useState(null);
  const [isLoadingDesign, setIsLoadingDesign] = useState(false);
  const [aiScanStatus, setAiScanStatus] = useState('idle'); // 'idle' | 'scanning' | 'completed'
  const [activeScanStep, setActiveScanStep] = useState(0);

  // Load design details
  useEffect(() => {
    if (!designId) return;
    const loadDesign = async () => {
      setIsLoadingDesign(true);
      try {
        const { data } = await api.get(`/designs/${designId}`);
        setDesign(data.design);
      } catch (err) {
        toast.error('Failed to load design details');
      } finally {
        setIsLoadingDesign(false);
      }
    };
    loadDesign();
  }, [designId]);

  // Simulate scanning when design is first loaded
  useEffect(() => {
    if (!design) return;
    
    setAiScanStatus('scanning');
    setActiveScanStep(0);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < scanSteps.length) {
        setActiveScanStep(currentStep);
      } else {
        clearInterval(interval);
        setAiScanStatus('completed');
      }
    }, 450);
    
    return () => clearInterval(interval);
  }, [design]);

  // Load products for category
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/products?category=${category}`);
        setProducts(data.products);
        if (data.products.length > 0) setSelectedProduct(data.products[0]);
      } catch {
        toast.error('Failed to load products');
      } finally {
        setIsLoadingProducts(false);
      }
    };
    load();
  }, [category]);

  // Calculate price whenever options change
  useEffect(() => {
    if (!selectedProduct) return;
    const calculate = async () => {
      setIsCalculating(true);
      try {
        const { data } = await api.post('/orders/calculate-price', {
          category,
          subcategory: selectedProduct.subcategory,
          material: options.material,
          printArea: options.printArea,
          quantity: options.quantity,
          shippingMethod: options.shippingMethod,
          designId,
        });
        setPricing(data.pricing);
      } catch {
        toast.error('Failed to calculate price');
      } finally {
        setIsCalculating(false);
      }
    };
    const timer = setTimeout(calculate, 300);
    return () => clearTimeout(timer);
  }, [options, selectedProduct, designId]);

  const handleCheckout = async () => {
    if (!designId) { toast.error('No design selected'); return; }
    if (!selectedProduct) { toast.error('Please select a product'); return; }
    if (!address.fullName || !address.address || !address.city || !address.postalCode) {
      toast.error('Please fill in all required address fields'); return;
    }

    setIsCheckingOut(true);
    try {
      const { data } = await api.post('/orders/create-checkout-session', {
        designId, productId: selectedProduct._id,
        quantity: options.quantity, material: options.material,
        printArea: options.printArea, size: options.size, color: options.color,
        shippingMethod: options.shippingMethod, shippingAddress: address,
      });

      // Redirect to Stripe checkout
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
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
        <motion.div className="mb-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-brand-400" />
            Checkout
          </h1>
          <p className="text-dark-400">Complete your order and we'll get it made for you</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left — Options */}
          <div className="space-y-6">
            {/* AI Pricing scan widget */}
            {design && (
              <div className="glass-card p-6 mb-6 overflow-hidden relative border border-brand-500/20 shadow-[0_8px_32px_rgba(99,102,241,0.1)]">
                {/* Visual scan animation stylesheet */}
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes scan-animation {
                    0% { top: 0%; opacity: 0.3; }
                    50% { top: 100%; opacity: 1; filter: drop-shadow(0 0 8px rgba(99,102,241,0.8)); }
                    100% { top: 0%; opacity: 0.3; }
                  }
                  .animate-scan {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #8b5cf6, #6366f1, #8b5cf6, transparent);
                    box-shadow: 0 0 10px #6366f1, 0 0 20px #8b5cf6;
                    animation: scan-animation 2.2s ease-in-out infinite;
                  }
                `}} />

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Thumbnail / Scanning effect */}
                  <div className="w-full md:w-44 flex-shrink-0 flex justify-center">
                    <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-glass-border bg-dark-900 flex items-center justify-center group shadow-inner">
                      {design.thumbnail?.url ? (
                        <img src={design.thumbnail.url} alt={design.title} className="w-full h-full object-contain" />
                      ) : (
                        <Cpu className="w-12 h-12 text-dark-500" />
                      )}
                      
                      {/* Laser overlay */}
                      {aiScanStatus === 'scanning' && (
                        <>
                          <div className="absolute inset-0 bg-brand-500/5 backdrop-blur-[0.5px]" />
                          <div className="animate-scan" />
                        </>
                      )}
                    </div>
                  </div>

                  {/* AI Analysis and Status */}
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-brand-400 animate-pulse" />
                          CustomFlex AI Pricing Engine
                        </h2>
                        <p className="text-xs text-dark-400 mt-0.5">Predicting dynamic manufacturing & design value</p>
                      </div>
                      
                      {aiScanStatus === 'scanning' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> Scanning Design...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> AI Scan Complete
                        </span>
                      )}
                    </div>

                    {aiScanStatus === 'scanning' ? (
                      <div className="space-y-3 py-2">
                        {/* Scanning Step Progress */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-dark-300">
                            <span>Scan Progress</span>
                            <span>{Math.round(((activeScanStep + 1) / scanSteps.length) * 100)}%</span>
                          </div>
                          <div className="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${((activeScanStep + 1) / scanSteps.length) * 100}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-brand-300 italic animate-pulse">
                          {scanSteps[activeScanStep]}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {isCalculating ? (
                          <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                            <span className="text-sm text-dark-400 mt-2">Computing dynamic pricing...</span>
                          </div>
                        ) : pricing ? (
                          <>
                            {/* AI Estimated Price */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 shadow-lg shadow-brand-500/5">
                              <div className="flex-1">
                                <span className="text-[10px] uppercase font-bold text-brand-300 block">AI Predicted Base Price</span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-black text-white">{formatPrice(pricing.basePrice)}</span>
                                  {pricing.aiAnalysis?.originalBasePrice !== pricing.basePrice && (
                                    <span className="text-xs line-through text-dark-500 font-normal">
                                      {formatPrice(pricing.aiAnalysis.originalBasePrice)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-emerald-400 block">AI Confidence</span>
                                <span className="text-sm font-bold text-white">98%</span>
                              </div>
                            </div>

                            {/* Stats / Metrics */}
                            {pricing.aiAnalysis && (
                              <div className="grid grid-cols-3 gap-3">
                                {[
                                  { label: 'Complexity', score: pricing.aiAnalysis.complexityScore, color: 'from-blue-500 to-indigo-500' },
                                  { label: 'Ink Density', score: pricing.aiAnalysis.inkDensityScore, color: 'from-purple-500 to-pink-500' },
                                  { label: 'Mfg Load', score: pricing.aiAnalysis.manufacturingLoadScore, color: 'from-emerald-500 to-teal-500' },
                                ].map((stat) => (
                                  <div key={stat.label} className="bg-dark-900/50 border border-glass-border p-2.5 rounded-xl text-center">
                                    <span className="text-[10px] uppercase font-bold text-dark-400 block mb-1">{stat.label}</span>
                                    <span className="text-base font-black text-white">{stat.score}%</span>
                                    <div className="w-full bg-dark-800 h-1 rounded-full overflow-hidden mt-1.5">
                                      <div className={`h-1 bg-gradient-to-r ${stat.color} rounded-full`} style={{ width: `${stat.score}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Insights checklist */}
                            {pricing.aiAnalysis?.insights?.length > 0 && (
                              <div className="bg-dark-900/40 border border-glass-border rounded-xl p-3 space-y-2">
                                <span className="text-xs font-semibold text-white block mb-1">AI Valuation Insights:</span>
                                {pricing.aiAnalysis.insights.map((insight, idx) => {
                                  const isDiscount = insight.includes('-') || insight.toLowerCase().includes('discount');
                                  const isFee = insight.includes('+') || insight.toLowerCase().includes('fee');
                                  return (
                                    <div key={idx} className="flex items-start gap-2 text-xs">
                                      <Check className={`w-3.5 h-3.5 mt-0.5 ${isDiscount ? 'text-emerald-400' : isFee ? 'text-brand-400' : 'text-dark-400'}`} />
                                      <span className={isDiscount ? 'text-emerald-300 font-medium' : isFee ? 'text-brand-300' : 'text-dark-300'}>
                                        {insight}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-dark-500 text-center py-6">
                            No product options selected. Select a product to view AI insights.
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-glass-border text-xs">
                          <span className="text-dark-400">Predicted for: <strong className="text-white font-medium">{design.title}</strong></span>
                          <button 
                            onClick={() => {
                              setAiScanStatus('scanning');
                              setActiveScanStep(0);
                              let currentStep = 0;
                              const interval = setInterval(() => {
                                currentStep++;
                                if (currentStep < scanSteps.length) {
                                  setActiveScanStep(currentStep);
                                } else {
                                  clearInterval(interval);
                                  setAiScanStatus('completed');
                                }
                              }, 300);
                            }}
                            className="text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" /> Re-scan Design
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Product selection */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-400" /> Select Product
              </h2>
              {isLoadingProducts ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => setSelectedProduct(p)}
                      className={`p-4 rounded-xl border text-left transition-all ${selectedProduct?._id === p._id ? 'border-brand-500/60 bg-brand-500/10' : 'border-glass-border hover:border-white/20 hover:bg-white/5'}`}
                    >
                      <p className="text-sm font-semibold text-white">{p.name}</p>
                      <p className="text-xs text-dark-400 capitalize">{p.subcategory}</p>
                      <p className="text-sm font-bold text-brand-400 mt-1">${p.basePrice}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Customization Options</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-dark-300 block mb-2">Material</label>
                  <select value={options.material} onChange={(e) => setOptions((o) => ({ ...o, material: e.target.value }))} className="input-field text-sm">
                    {['standard', 'premium', 'luxury', 'organic', 'recycled'].map((m) => <option key={m} value={m} className="bg-dark-900 capitalize">{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-300 block mb-2">Print Area</label>
                  <select value={options.printArea} onChange={(e) => setOptions((o) => ({ ...o, printArea: e.target.value }))} className="input-field text-sm">
                    {['front', 'back', 'front-back', 'all-over', 'full'].map((p) => <option key={p} value={p} className="bg-dark-900">{p.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-dark-300 block mb-2">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setOptions((o) => ({ ...o, quantity: Math.max(1, o.quantity - 1) }))} className="toolbar-btn !w-8 !h-8">-</button>
                    <input type="number" min={1} max={100} value={options.quantity} onChange={(e) => setOptions((o) => ({ ...o, quantity: Math.max(1, parseInt(e.target.value) || 1) }))} className="input-field text-center !py-2 w-16 text-sm" />
                    <button onClick={() => setOptions((o) => ({ ...o, quantity: Math.min(100, o.quantity + 1) }))} className="toolbar-btn !w-8 !h-8">+</button>
                  </div>
                </div>
                {selectedProduct?.sizes?.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-dark-300 block mb-2">Size</label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.sizes.map((s) => (
                        <button key={s} onClick={() => setOptions((o) => ({ ...o, size: s }))}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${options.size === s ? 'border-brand-500 bg-brand-500/20 text-brand-300' : 'border-glass-border text-dark-400 hover:text-white'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-400" /> Shipping Method
              </h2>
              <div className="space-y-3 mb-6">
                {SHIPPING_METHODS.map((method) => (
                  <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${options.shippingMethod === method.id ? 'border-brand-500/60 bg-brand-500/10' : 'border-glass-border hover:border-white/20'}`}>
                    <input type="radio" name="shipping" value={method.id} checked={options.shippingMethod === method.id} onChange={() => setOptions((o) => ({ ...o, shippingMethod: method.id }))} className="accent-brand-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{method.label}</p>
                      <p className="text-xs text-dark-400">{method.days}</p>
                    </div>
                    <span className="text-sm font-bold text-brand-400">${method.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>

              {/* Address */}
              <h3 className="text-sm font-semibold text-white mb-4">Shipping Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input id="checkout-name" label="Full Name" placeholder="John Doe" value={address.fullName} onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))} required className="col-span-2" />
                <Input id="checkout-address" label="Street Address" placeholder="123 Main St" value={address.address} onChange={(e) => setAddress((a) => ({ ...a, address: e.target.value }))} required className="col-span-2" />
                <Input id="checkout-city" label="City" placeholder="New York" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} required />
                <Input id="checkout-state" label="State" placeholder="NY" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} />
                <Input id="checkout-zip" label="ZIP Code" placeholder="10001" value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} required />
                <Input id="checkout-phone" label="Phone" placeholder="+1 234 567 8900" value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="space-y-4 sticky top-24 self-start">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-400" /> Order Summary
              </h2>

              {selectedProduct && (
                <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <p className="text-sm font-semibold text-white">{selectedProduct.name}</p>
                  <p className="text-xs text-dark-400 capitalize">{category} · {options.material} · {options.printArea.replace(/-/g, ' ')}</p>
                </div>
              )}

              {isCalculating ? (
                <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-brand-500 animate-spin" /></div>
              ) : pricing && (
                <div className="space-y-2.5">
                  {[
                    {
                      label: 'Base Price',
                      value: pricing.aiAnalysis?.aiPricePredictionApplied && pricing.aiAnalysis?.originalBasePrice !== pricing.basePrice ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="line-through text-dark-500 font-normal text-xs">{formatPrice(pricing.aiAnalysis.originalBasePrice)}</span>
                          <span className="text-emerald-400 font-bold">{formatPrice(pricing.basePrice)}</span>
                        </div>
                      ) : (
                        formatPrice(pricing.basePrice)
                      )
                    },
                    { label: `Quantity (×${pricing.quantity})`, value: formatPrice(pricing.subtotal) },
                    pricing.quantityDiscount > 0 && { label: 'Quantity Discount', value: `-${formatPrice(pricing.quantityDiscount)}`, green: true },
                    pricing.aiComplexityFee > 0 && { label: 'AI Complexity Fee', value: formatPrice(pricing.aiComplexityFee) },
                    { label: 'Shipping', value: formatPrice(pricing.shipping) },
                    { label: 'Tax (8%)', value: formatPrice(pricing.tax) },
                  ].filter(Boolean).map(({ label, value, green }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-dark-400">{label}</span>
                      <span className={green ? 'text-emerald-400 font-medium' : 'text-dark-200'}>{value}</span>
                    </div>
                  ))}
                  <div className="border-t border-glass-border pt-3 mt-3 flex justify-between">
                    <span className="font-bold text-white">Total</span>
                    <span className="text-xl font-black gradient-text">{formatPrice(pricing.total)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 mt-4 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <Info className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-dark-400">
                  Share your product post after purchase. If it gets enough engagement, you could earn a full refund!
                </p>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={!pricing || isCheckingOut || !selectedProduct}
                isLoading={isCheckingOut}
                variant="primary"
                className="w-full mt-6 !py-4"
                id="checkout-pay-btn"
              >
                <CreditCard className="w-5 h-5" />
                Pay with Stripe
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-dark-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Secured by Stripe · SSL encrypted
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
