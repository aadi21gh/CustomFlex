import { useEffect, useRef } from 'react';
import { useStudio } from '@/context/StudioContext';

// Flat 2D product preview overlay
const MOCKUP_SIZES = {
  artwork: { width: 300, height: 250, name: 'Canvas Print', bg: '#f8f8f8', overlayX: 20, overlayY: 20, overlayW: 260, overlayH: 210 },
  clothing: { width: 240, height: 300, name: 'T-Shirt', bg: '#e2e8f0', overlayX: 35, overlayY: 60, overlayW: 170, overlayH: 160 },
  accessories: { width: 260, height: 260, name: 'Product', bg: '#f1f5f9', overlayX: 30, overlayY: 30, overlayW: 200, overlayH: 200 },
};

const ProductPreview = ({ category }) => {
  const { fabricRef } = useStudio();
  const previewRef = useRef(null);
  const mockup = MOCKUP_SIZES[category] || MOCKUP_SIZES.artwork;

  useEffect(() => {
    if (!fabricRef.current || !previewRef.current) return;

    const canvas = fabricRef.current;
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });

    const ctx = previewRef.current.getContext('2d');
    previewRef.current.width = mockup.width;
    previewRef.current.height = mockup.height;

    // Draw background
    ctx.fillStyle = mockup.bg;
    ctx.fillRect(0, 0, mockup.width, mockup.height);

    // Draw product shape
    if (category === 'clothing') {
      // Simple t-shirt shape
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(60, 0);
      ctx.lineTo(0, 60);
      ctx.lineTo(30, 70);
      ctx.lineTo(30, mockup.height);
      ctx.lineTo(mockup.width - 30, mockup.height);
      ctx.lineTo(mockup.width - 30, 70);
      ctx.lineTo(mockup.width, 60);
      ctx.lineTo(mockup.width - 60, 0);
      ctx.lineTo(mockup.width * 0.6, 30);
      ctx.arcTo(mockup.width / 2, 50, mockup.width * 0.4, 30, 20);
      ctx.lineTo(60, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      // Rounded rectangle for other categories
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      const r = 16;
      ctx.moveTo(r, 0);
      ctx.lineTo(mockup.width - r, 0);
      ctx.arcTo(mockup.width, 0, mockup.width, r, r);
      ctx.lineTo(mockup.width, mockup.height - r);
      ctx.arcTo(mockup.width, mockup.height, mockup.width - r, mockup.height, r);
      ctx.lineTo(r, mockup.height);
      ctx.arcTo(0, mockup.height, 0, mockup.height - r, r);
      ctx.lineTo(0, r);
      ctx.arcTo(0, 0, r, 0, r);
      ctx.closePath();
      ctx.fill();
    }

    // Overlay design
    const img = new Image();
    img.onload = () => {
      ctx.globalAlpha = 0.92;
      ctx.drawImage(img, mockup.overlayX, mockup.overlayY, mockup.overlayW, mockup.overlayH);
      ctx.globalAlpha = 1;
    };
    img.src = dataUrl;
  }, [category]);

  return (
    <div className="glass-card-strong p-8 flex flex-col items-center gap-6">
      <h3 className="text-lg font-semibold text-white">Product Preview</h3>
      <div className="relative">
        <canvas
          ref={previewRef}
          className="rounded-xl shadow-glass"
          style={{ maxWidth: 320, maxHeight: 320 }}
        />
        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }} />
      </div>
      <p className="text-xs text-dark-400 text-center">
        {mockup.name} preview — actual product may vary
      </p>
    </div>
  );
};

export default ProductPreview;
