import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Camera, CameraOff, Sparkles, X, RefreshCw, Download,
  Maximize, Minimize, Sliders, Eye, RotateCw, Scan, FlipHorizontal,
  ShieldCheck, Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStudio } from '@/context/StudioContext';
import { getProductLabel } from '@/components/studio/ProductTemplate';

const WebARTryOnModal = ({ isOpen, onClose }) => {
  const { fabricRef, designTitle, productType, productColor } = useStudio();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [designDataUrl, setDesignDataUrl] = useState(null);
  
  // AR Transform Controls
  const [scale, setScale] = useState(1.0);
  const [posY, setPosY] = useState(30); // percentage from top
  const [posX, setPosX] = useState(50); // percentage from left
  const [opacity, setOpacity] = useState(0.95);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  // Extract clean design from canvas
  useEffect(() => {
    if (!isOpen || !fabricRef.current) return;
    const canvas = fabricRef.current;
    
    // Hide UI helper objects
    const guideObjs = canvas.getObjects().filter((o) =>
      o.id === '__grid__' ||
      o.id?.includes('active_zone') ||
      o.id?.includes('active_label') ||
      o.id?.includes('inactive_zone') ||
      o.id?.includes('inactive_label')
    );
    const prevVis = guideObjs.map((o) => o.visible);
    guideObjs.forEach((o) => (o.visible = false));
    canvas.renderAll();

    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });

    // Restore
    guideObjs.forEach((o, i) => (o.visible = prevVis[i]));
    canvas.renderAll();

    setDesignDataUrl(dataUrl);
  }, [isOpen, fabricRef]);

  // Start Camera
  useEffect(() => {
    if (!isOpen) return;

    const startCamera = async () => {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setHasCamera(true);
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
        setCameraError('Camera access required for live WebAR try-on. Using simulated AR mode.');
        setHasCamera(false);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  /* ── Take AR Snapshot ── */
  const handleCaptureSnapshot = () => {
    setIsCapturing(true);
    const toastId = toast.loading('Capturing WebAR mirror snapshot...');

    try {
      const canvas = document.createElement('canvas');
      const width = videoRef.current?.videoWidth || 960;
      const height = videoRef.current?.videoHeight || 720;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Draw video background or simulated fallback
      if (hasCamera && videoRef.current) {
        ctx.save();
        if (isMirrored) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        ctx.restore();
      } else {
        // Fallback simulated mannequin
        ctx.fillStyle = '#12131a';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#222634';
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.35, 90, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(width / 2, height * 0.8, 180, 220, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Apparel overlay
      if (designDataUrl) {
        const designImg = new Image();
        designImg.crossOrigin = 'anonymous';
        designImg.onload = () => {
          const overlayW = width * 0.45 * scale;
          const overlayH = (overlayW / 1) * 1.15;
          const overlayX = (width * (posX / 100)) - (overlayW / 2);
          const overlayY = (height * (posY / 100)) - (overlayH / 4);

          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.shadowColor = 'rgba(0,0,0,0.35)';
          ctx.shadowBlur = 12;
          ctx.drawImage(designImg, overlayX, overlayY, overlayW, overlayH);
          ctx.restore();

          // 3. Watermark
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px Inter, sans-serif';
          ctx.fillText('CREXZA WebAR TRY-ON • LIVE MIRROR', 30, height - 35);

          const snapData = canvas.toDataURL('image/png', 0.95);
          setCapturedImage(snapData);
          setIsCapturing(false);
          toast.success('Snapshot captured!', { id: toastId });
        };
        designImg.src = designDataUrl;
      }
    } catch (e) {
      console.error(e);
      setIsCapturing(false);
      toast.error('Could not capture snapshot', { id: toastId });
    }
  };

  const handleDownloadSnapshot = () => {
    if (!capturedImage) return;
    const link = document.createElement('a');
    link.download = `crexza-ar-tryon-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();
    toast.success('AR try-on photo downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-4xl bg-dark-900/95 border border-glass-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border bg-dark-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-brand-500/20 border border-cyan-500/30 text-cyan-400">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">WebAR Live Try-On Mirror</h2>
                <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Zero App Install
                </span>
              </div>
              <p className="text-xs text-dark-400">
                Stand in front of your camera to preview your custom apparel in spatial real-time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AR Viewport & Control Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-y-auto">
          
          {/* Main Camera View (Left, 8 cols) */}
          <div className="lg:col-span-8 p-4 sm:p-6 bg-dark-950 flex flex-col items-center justify-center relative min-h-[380px] sm:min-h-[460px]">
            
            {/* Live AR Stream Container */}
            <div className="relative w-full max-w-xl aspect-[4/3] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-black flex items-center justify-center">
              
              {/* Web Video Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''} ${!hasCamera ? 'hidden' : ''}`}
              />

              {/* Fallback Mannequin Stage if Camera is blocked */}
              {!hasCamera && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-dark-900 to-dark-950">
                  <div className="w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                    <CameraOff className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Camera Stream Standby</h4>
                  <p className="text-xs text-dark-400 max-w-xs mb-3">
                    {cameraError || 'Grant browser camera access to activate the interactive live mirror.'}
                  </p>
                  <span className="text-3xs text-cyan-400 font-mono px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                    SIMULATION MODE ACTIVE
                  </span>
                </div>
              )}

              {/* Cyber AR HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 rounded-2xl">
                {/* Crosshairs */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

                {/* Tracking Reticle Target */}
                <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-60">
                  <div className="w-28 h-28 border border-dashed border-cyan-400/60 rounded-full animate-spin-slow" />
                  <span className="text-3xs font-mono text-cyan-400 bg-black/60 px-2 py-0.5 rounded">ALIGN CHEST</span>
                </div>
              </div>

              {/* Live Overlaying Apparel Design */}
              {designDataUrl && (
                <div
                  className="absolute pointer-events-none flex items-center justify-center transition-transform duration-75"
                  style={{
                    top: `${posY}%`,
                    left: `${posX}%`,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    opacity: opacity,
                    filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.6))',
                  }}
                >
                  <img
                    src={designDataUrl}
                    alt="Custom Try-on"
                    className="max-w-[260px] max-h-[300px] object-contain"
                  />
                </div>
              )}

              {/* Shutter Button floating over stream */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button
                  onClick={handleCaptureSnapshot}
                  disabled={isCapturing}
                  className="px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition-all hover:scale-105"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Selfie</span>
                </button>
              </div>
            </div>

            {/* Quick Helper */}
            <div className="text-3xs text-dark-400 font-mono mt-3 flex items-center gap-3">
              <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-cyan-400" /> Mobile & Desktop Optimized</span>
              <span>•</span>
              <span>Drag & slider controls to fit garment</span>
            </div>
          </div>

          {/* Controls & Snapshot Gallery (Right, 4 cols) */}
          <div className="lg:col-span-4 p-5 space-y-5 border-l border-glass-border bg-dark-950/40 overflow-y-auto">
            
            <div>
              <h3 className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                AR Fit Calibration
              </h3>

              <div className="space-y-4">
                {/* Scale */}
                <div>
                  <div className="flex justify-between text-2xs text-dark-300 mb-1">
                    <span>Apparel Scale</span>
                    <span className="font-mono text-cyan-400">{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-dark-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Vertical Position */}
                <div>
                  <div className="flex justify-between text-2xs text-dark-300 mb-1">
                    <span>Chest Height (Y)</span>
                    <span className="font-mono text-cyan-400">{posY}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="75"
                    step="1"
                    value={posY}
                    onChange={(e) => setPosY(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-dark-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Horizontal Position */}
                <div>
                  <div className="flex justify-between text-2xs text-dark-300 mb-1">
                    <span>Torso Centering (X)</span>
                    <span className="font-mono text-cyan-400">{posX}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="1"
                    value={posX}
                    onChange={(e) => setPosX(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-dark-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Mirror Toggle */}
                <div className="pt-2">
                  <button
                    onClick={() => setIsMirrored(!isMirrored)}
                    className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isMirrored
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                        : 'border-glass-border bg-dark-900/50 text-dark-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      Mirror Camera Feed
                    </span>
                    <span className="text-2xs font-mono">{isMirrored ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Captured Snapshot Card */}
            {capturedImage && (
              <div className="p-3.5 rounded-xl bg-dark-900/60 border border-cyan-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Latest AR Snapshot
                  </span>
                  <span className="text-3xs font-mono text-cyan-400">READY</span>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-white/10 aspect-[4/3] bg-black">
                  <img src={capturedImage} alt="AR Snapshot" className="w-full h-full object-cover" />
                </div>

                <button
                  onClick={handleDownloadSnapshot}
                  className="w-full btn-secondary py-2 text-xs flex items-center justify-center gap-1.5 border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Snapshot</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WebARTryOnModal;
