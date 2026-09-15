import { useState } from 'react';
import { useStudio } from '@/context/StudioContext';
import { PRODUCT_TYPES, PRODUCT_COLORS } from './ProductTemplate';
import { Check, Feather, Sparkles, Sliders } from 'lucide-react';

export const FABRIC_MATERIALS = {
  clothing: [
    {
      id: 'cotton',
      name: '100% Combed Ring-Spun Cotton',
      gsm: '180 GSM',
      badge: 'Standard Included',
      priceAddon: 0,
      description: 'Ultra-breathable, pre-shrunk, soft regular daily fit.',
    },
    {
      id: 'french-terry',
      name: 'Heavyweight French Terry Cotton',
      gsm: '320 GSM',
      badge: 'Streetwear Luxury',
      priceAddon: 249,
      description: 'Plush interior loops, dense structured boxy drape, high durability.',
    },
    {
      id: 'supima-cotton',
      name: 'Luxury Supima® Long-Staple Cotton',
      gsm: '240 GSM',
      badge: 'Artisan Grade',
      priceAddon: 399,
      description: '2x stronger than standard cotton, featherweight silk sheen, museum colorfast.',
    },
    {
      id: 'organic-cotton',
      name: 'Organic Bamboo & Bio-Cotton Blend',
      gsm: '210 GSM',
      badge: 'Sustainable Eco',
      priceAddon: 200,
      description: 'Naturally hypoallergenic, thermal regulating, antibacterial soft touch.',
    },
    {
      id: 'premium-cotton',
      name: 'Premium Combed Cotton',
      gsm: '240 GSM',
      badge: 'Premium Soft',
      priceAddon: 120,
      description: 'Soft 240 GSM combed cotton with high comfort.',
    },
    {
      id: 'dry-fit',
      name: 'Moisture-Wicking Dry Fit',
      gsm: '160 GSM',
      badge: 'Athletic Active',
      priceAddon: 150,
      description: 'Quick-drying activewear microfiber polyester.',
    },
  ],
  artwork: [
    {
      id: 'matte-paper',
      name: 'Matte Archival Fine Art Paper',
      gsm: '280 GSM',
      badge: 'Standard Gallery',
      priceAddon: 0,
      description: 'Acid-free smooth matte finish with crisp high-definition line sharpness.',
    },
    {
      id: 'canvas',
      name: 'Heavyweight Textured Gallery Canvas',
      gsm: '380 GSM',
      badge: 'Artist Cotton Canvas',
      priceAddon: 300,
      description: '100% genuine woven artist canvas stretched over seasoned pine wood.',
    },
    {
      id: 'acrylic',
      name: 'High-Gloss 4mm Ultra-Clear Acrylic',
      gsm: '4mm Solid',
      badge: 'Ultra Luxury Float',
      priceAddon: 500,
      description: 'Shatter-resistant diamond polished optical acrylic with floating wall mount.',
    },
  ],
  accessories: [
    {
      id: 'standard',
      name: 'Matte Polycarbonate Slim Shell',
      gsm: 'Slim 1.5mm',
      badge: 'Slim Fit',
      priceAddon: 0,
      description: 'Ultra-thin snap case with scratch-resistant matte soft-touch coating.',
    },
    {
      id: 'premium',
      name: 'Impact Armor Dual-Layer Shockproof',
      gsm: 'Drop-Tested 10ft',
      badge: 'Heavy Protection',
      priceAddon: 200,
      description: 'Flexible TPU bumper with hardened anti-scratch polycarbonate back plate.',
    },
  ],
};

const ProductFabricPanel = () => {
  const {
    category,
    productType,
    setProductType,
    productColor,
    setProductColor,
    fabricMaterial,
    setFabricMaterial,
  } = useStudio();

  const currentCategory = ['canvas', 'poster', 'acrylic'].includes(productType)
    ? 'artwork'
    : ['phonecase', 'totebag', 'cap'].includes(productType)
    ? 'accessories'
    : 'clothing';

  const materials = FABRIC_MATERIALS[currentCategory] || FABRIC_MATERIALS.clothing;
  const activeMaterial = materials.find(m => m.id === fabricMaterial) || materials[0];

  const types = PRODUCT_TYPES[category] || PRODUCT_TYPES.clothing;
  const colors = PRODUCT_COLORS[category] || PRODUCT_COLORS.clothing;

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full select-none">
      {/* Product Type Selector */}
      <div>
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-2.5">Product Type</p>
        <div className="grid grid-cols-2 gap-2">
          {types.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setProductType(id)}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                productType === id
                  ? 'bg-brand-500/15 border-brand-500 text-white font-bold shadow-sm'
                  : 'bg-dark-900/40 border-glass-border text-dark-300 hover:text-white hover:bg-dark-800'
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-xs truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Garment / Product Color Swatches */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest">Product Color</p>
          <span className="text-2xs text-brand-400 font-bold">{colors.find(c => c.hex.toLowerCase() === productColor?.toLowerCase())?.label || productColor}</span>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-3">
          {colors.map(({ id, hex, label }) => {
            const isSelected = productColor?.toLowerCase() === hex.toLowerCase();
            return (
              <button
                key={id}
                onClick={() => setProductColor(hex)}
                className={`relative aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${
                  isSelected ? 'border-brand-500 ring-2 ring-brand-500/40 scale-105 shadow-md' : 'border-white/15 hover:scale-105'
                }`}
                style={{ background: hex }}
                title={label}
              >
                {isSelected && (
                  <Check className={`w-4 h-4 ${['#FFFFFF', '#ffffff', '#faf7f0', '#f5f0e8', '#e8eaed', '#d4b896', '#E7B8A4', '#DFD8C9', '#EFEAE0'].includes(hex) ? 'text-dark-900 font-extrabold' : 'text-white font-extrabold'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Hex Color Picker */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-dark-900/60 border border-glass-border">
          <input
            type="color"
            value={productColor || '#FFFFFF'}
            onChange={(e) => setProductColor(e.target.value)}
            className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
          />
          <span className="text-2xs text-dark-400 font-mono flex-1">Custom Hex</span>
          <input
            type="text"
            value={productColor || '#FFFFFF'}
            onChange={(e) => setProductColor(e.target.value)}
            className="w-20 bg-dark-950 border border-glass-border rounded-lg px-2 py-1 text-2xs font-mono text-white text-center uppercase"
          />
        </div>
      </div>

      {/* Fabric Material Quality Tier */}
      <div>
        <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-2.5 flex items-center gap-1">
          <Feather className="w-3 h-3 text-brand-400" />
          <span>Fabric &amp; Material Quality</span>
        </p>

        <div className="space-y-2">
          {materials.map((m) => {
            const isSelected = (fabricMaterial === m.id) || (!fabricMaterial && m.id === materials[0].id);
            return (
              <div
                key={m.id}
                onClick={() => setFabricMaterial(m.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-brand-500/10 border-brand-500/50 shadow-sm'
                    : 'bg-dark-900/30 border-glass-border hover:bg-dark-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate">{m.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isSelected ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-400'}`}>
                    {m.priceAddon === 0 ? 'Included' : `+₹${m.priceAddon}`}
                  </span>
                </div>
                <p className="text-2xs text-dark-400 line-clamp-2">{m.description}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-dark-500">
                  <span className="font-semibold text-dark-400">{m.gsm}</span>
                  <span>•</span>
                  <span>{m.badge}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductFabricPanel;
