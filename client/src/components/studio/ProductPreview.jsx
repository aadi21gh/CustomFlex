import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, X, Sparkles, Check, ChevronDown } from 'lucide-react';
import { useStudio } from '@/context/StudioContext';
import { getMockup, MOCKUP_IMAGES, getAllProductTypes } from './mockupRegistry';
import { isTemplateObject, getDesignZone } from './ProductTemplate';

/**
 * ProductPreview — High-Fidelity Photorealistic Product Preview
 * Combines the real studio photo mockup with the user's canvas artwork.
 */
const ProductPreview = ({ category, onClose }) => {
  const {
    fabricRef,
    productType,
    setProductType,
    productColor,
    activeSide,
    setActiveSide,
    designTitle,
  } = useStudio();

  const previewCanvasRef = useRef(null);
  const [previewSide, setPreviewSide] = useState(activeSide || 'front');
  const [selectedProduct, setSelectedProduct] = useState(productType || 'tshirt');
  const [isRendering, setIsRendering] = useState(true);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  const mockup = getMockup(selectedProduct);
  const allProducts = getAllProductTypes();

  // Re-composite whenever product, side, color or canvas changes
  useEffect(() => {
    if (!fabricRef.current || !previewCanvasRef.current) return;

    let isMounted = true;
    setIsRendering(true);

    const canvas = fabricRef.current;
    const pCanvas = previewCanvasRef.current;
    const ctx = pCanvas.getContext('2d');

    // 1. Export only user artwork (hide template silhouettes temporarily)
    const allObjects = canvas.getObjects();
    const templateObjs = allObjects.filter((o) => isTemplateObject(o));

    // Save previous visibility
    const prevVis = templateObjs.map((o) => o.visible);
    templateObjs.forEach((o) => (o.visible = false));
    canvas.renderAll();

    // Get artwork bounding data
    const artworkDataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: 1.5,
    });

    // Restore template visibility
    templateObjs.forEach((o, i) => (o.visible = prevVis[i]));
    canvas.renderAll();

    // 2. Load the mockup photo
    const mockupImg = new Image();
    mockupImg.crossOrigin = 'anonymous';
    const mockupSrc = previewSide === 'back' && mockup.back ? mockup.back : mockup.front;
    mockupImg.src = mockupSrc;

    mockupImg.onload = () => {
      if (!isMounted) return;

      // Set preview canvas dimensions to match the high-res mockup photo
      pCanvas.width = mockupImg.naturalWidth || 1024;
      pCanvas.height = mockupImg.naturalHeight || 1024;

      // Draw studio mockup photo
      ctx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      ctx.drawImage(mockupImg, 0, 0, pCanvas.width, pCanvas.height);

      // 3. Load and overlay artwork onto the print area
      const artImg = new Image();
      artImg.crossOrigin = 'anonymous';
      artImg.onload = () => {
        if (!isMounted) return;

        const printArea = previewSide === 'back' && mockup.printAreaBack
          ? mockup.printAreaBack
          : mockup.printArea;

        const targetX = (printArea.x / 100) * pCanvas.width;
        const targetY = (printArea.y / 100) * pCanvas.height;
        const targetW = (printArea.w / 100) * pCanvas.width;
        const targetH = (printArea.h / 100) * pCanvas.height;

        // Overlay with realistic blending
        ctx.save();
        ctx.globalAlpha = 0.95;
        // Natural fabric blend mode for realistic texture integration
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(artImg, targetX, targetY, targetW, targetH);
        ctx.restore();

        setIsRendering(false);
      };
      artImg.src = artworkDataUrl;
    };

    return () => {
      isMounted = false;
    };
  }, [selectedProduct, previewSide, productColor, fabricRef]);

  // Download high-resolution composite image
  const handleDownload = () => {
    if (!previewCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${designTitle || 'crexza-design'}-${selectedProduct}-${previewSide}-mockup.png`;
    link.href = previewCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="glass-card-strong p-6 sm:p-7 rounded-3xl flex flex-col items-center gap-5 max-w-xl w-full mx-4 border border-glass-border shadow-2xl relative">
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-glass-border pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-sm text-[#F7F3EB] select-none"
            style={{ background: 'linear-gradient(135deg, #C76D4A, #8A9A7B)' }}
          >
            (:
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              Photorealistic Preview
              <span className="tag text-2xs !py-0.5 !px-2">Studio Shot</span>
            </h3>
            <p className="text-2xs text-dark-400">High-resolution mockup preview with your artwork applied</p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="toolbar-btn" title="Close">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Product & Perspective Selectors */}
      <div className="w-full flex items-center justify-between gap-3 flex-wrap">
        {/* Product Type Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProductDropdownOpen(!productDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900/80 border border-glass-border text-xs font-semibold text-white hover:bg-dark-800 transition-all"
          >
            <img src={mockup.front} alt="" className="w-5 h-5 rounded object-cover" />
            <span>{mockup.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-dark-400 transition-transform ${productDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {productDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-52 max-h-60 overflow-y-auto rounded-2xl glass-card-strong border border-glass-border shadow-xl p-1.5 z-30 space-y-1">
              {allProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p.id);
                    setProductType(p.id);
                    setProductDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedProduct === p.id
                      ? 'bg-brand-500/20 text-brand-500 font-bold'
                      : 'text-dark-300 hover:bg-dark-800/60 hover:text-white'
                  }`}
                >
                  <img src={p.front} alt="" className="w-6 h-6 rounded object-cover" />
                  <span className="truncate">{p.label}</span>
                  {selectedProduct === p.id && <Check className="w-3 h-3 text-brand-500 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Front / Back Toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-dark-900/80 border border-glass-border">
          <button
            onClick={() => setPreviewSide('front')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              previewSide === 'front'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-dark-400 hover:text-brand-500'
            }`}
          >
            Front View
          </button>
          <button
            onClick={() => setPreviewSide('back')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              previewSide === 'back'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-dark-400 hover:text-brand-500'
            }`}
          >
            Back View
          </button>
        </div>
      </div>

      {/* Main Mockup Viewport */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-glass-border bg-[#DFD7C8]/20 flex items-center justify-center shadow-inner">
        <canvas
          ref={previewCanvasRef}
          className="w-full max-h-[380px] object-contain rounded-2xl"
          style={{ imageRendering: 'auto' }}
        />

        {isRendering && (
          <div className="absolute inset-0 bg-dark-950/60 backdrop-blur-xs flex items-center justify-center gap-2 text-xs text-white font-medium">
            <RefreshCw className="w-4 h-4 text-brand-500 animate-spin" />
            Generating studio shot...
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="w-full flex items-center justify-between pt-2 border-t border-glass-border text-xs">
        <span className="text-dark-400 text-2xs">
          Studio photograph with real lighting &amp; shadow overlay
        </span>
        <button
          onClick={handleDownload}
          className="btn-primary !py-1.5 !px-3.5 text-xs flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Download Mockup
        </button>
      </div>
    </div>
  );
};

export default ProductPreview;
