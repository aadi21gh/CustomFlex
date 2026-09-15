import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, ShieldCheck, QrCode, Smartphone, Download, Copy,
  Check, X, ExternalLink, Sparkles, Award, Cpu, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStudio } from '@/context/StudioContext';
import { getProductLabel } from '@/components/studio/ProductTemplate';

const PhygitalCertificateModal = ({ isOpen, onClose, designId = 'crx-8891' }) => {
  const { designTitle, productType, fabricMaterial, productColor } = useStudio();
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const certificateRef = useRef(null);

  const verificationUrl = `${window.location.origin}/verify/${designId}`;
  const cryptoHash = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  const editionNumber = '#001 / 100 (FIRST EDITION DROP)';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verificationUrl)}&bgcolor=000000&color=ffffff&margin=1`;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    toast.success('Phygital NFC payload URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTag = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Generating printable smart care label...');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#0e1017';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border frame
      ctx.strokeStyle = '#c76d4a';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CREXZA PHYGITAL AUTHENTIC', canvas.width / 2, 90);

      ctx.fillStyle = '#c76d4a';
      ctx.font = '600 18px Inter, sans-serif';
      ctx.fillText('NFC SMART GARMENT TAG & CERTIFICATE', canvas.width / 2, 125);

      // Load QR
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        qrImg.onload = resolve;
        qrImg.onerror = resolve;
        qrImg.src = qrImageUrl;
      });

      if (qrImg.complete) {
        ctx.drawImage(qrImg, canvas.width / 2 - 110, 160, 220, 220);
      }

      // Specs
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillText((designTitle || 'Custom Edition').toUpperCase(), canvas.width / 2, 430);

      ctx.fillStyle = '#a0aec0';
      ctx.font = '16px monospace';
      ctx.fillText(`EDITION: ${editionNumber}`, canvas.width / 2, 470);
      ctx.fillText(`VERIFY HASH: ${cryptoHash.substring(0, 22)}...`, canvas.width / 2, 505);
      ctx.fillText(`MATERIAL: 240 GSM ${fabricMaterial.toUpperCase()} BLEND`, canvas.width / 2, 540);

      // Tap instructions
      ctx.fillStyle = '#c76d4a';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('TAP SMART NFC / SCAN QR TO VERIFY OWNERSHIP', canvas.width / 2, 600);

      // Care icons text
      ctx.fillStyle = '#718096';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('MACHINE WASH COLD • DO NOT IRON ON PRINT • DRY FLAT', canvas.width / 2, 640);

      const link = document.createElement('a');
      link.download = `crexza-phygital-smart-tag-${designId}.png`;
      link.href = canvas.toDataURL('image/png', 0.95);
      link.click();

      toast.success('Printable Phygital Label downloaded!', { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('Failed to export label', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-3xl bg-dark-900/95 border border-glass-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border bg-dark-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-brand-500/20 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Phygital Smart Tag & Certificate</h2>
                <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  NFC & Web3 Proof
                </span>
              </div>
              <p className="text-xs text-dark-400">
                Printable smart apparel label and verifiable proof of digital ownership
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

        {/* Certificate Card Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Holographic Certificate Frame */}
          <div
            ref={certificateRef}
            className="relative rounded-2xl p-6 border border-amber-500/40 bg-gradient-to-br from-dark-900 via-dark-950 to-neutral-950 shadow-2xl overflow-hidden"
          >
            {/* Hologram sheen accent */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-cyan-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
              
              {/* QR Code Container */}
              <div className="p-3 rounded-xl bg-black border border-amber-500/30 shadow-lg flex flex-col items-center gap-2 flex-shrink-0">
                <img
                  src={qrImageUrl}
                  alt="Phygital QR"
                  className="w-36 h-36 rounded-lg object-contain"
                />
                <span className="text-3xs font-mono text-amber-400 tracking-wider">TAP NFC / SCAN</span>
              </div>

              {/* Certificate Details */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-3xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    VERIFIED GENUINE 1-OF-1
                  </span>
                  <span className="text-3xs font-mono text-dark-400">BATCH: 2026-V1</span>
                </div>

                <h3 className="text-lg font-black text-white tracking-wide">
                  {designTitle || 'Custom Edition Apparel'}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-2xs">
                  <div className="p-2 rounded-lg bg-dark-900/60 border border-glass-border">
                    <span className="text-dark-400 block">Edition</span>
                    <span className="font-mono font-bold text-amber-400">{editionNumber}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-dark-900/60 border border-glass-border">
                    <span className="text-dark-400 block">Fabric Grade</span>
                    <span className="font-semibold text-white">240 GSM Premium {fabricMaterial}</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-dark-900/80 border border-glass-border">
                  <span className="text-3xs text-dark-400 block">Cryptographic Hash</span>
                  <span className="font-mono text-3xs text-dark-300 break-all">{cryptoHash}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phygital NFC Link Box */}
          <div className="p-4 rounded-xl bg-dark-950/60 border border-glass-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="min-w-0 text-left">
              <span className="text-xs font-semibold text-white block">Dynamic NFC Tap & Referral URL</span>
              <span className="text-2xs font-mono text-dark-400 truncate block">{verificationUrl}</span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleCopyLink}
                className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>

              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Page</span>
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadTag}
              disabled={isExporting}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-brand-500/25"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Download Printable Hem Tag & Care Label</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PhygitalCertificateModal;
