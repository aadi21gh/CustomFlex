import { fabric } from 'fabric';

/* ═══════════════════════════════════════════════════════════════════════════════
   Crexza Realistic Design Templates
   ─────────────────────────────────────────────────────────────────────────────
   Authentic, commercial-grade t-shirt & apparel graphics:
   - Iconic " (:" Signature Streetwear Tee
   - Y2K Tokyo Cyber Heavyweight Tee
   - Collegiate Varsity Arch & Number
   - Heritage Monogram & Laurel Crest
   - Polaroid Memory Frame with Photo
   - Pacific Trail Mountain & Pine Graphic
   ═══════════════════════════════════════════════════════════════════════════════ */

export const TEMPLATE_STYLES = [
  { id: 'all', label: 'All Templates' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'collegiate', label: 'Collegiate & Sports' },
  { id: 'monogram', label: 'Luxury Monogram' },
  { id: 'photo', label: 'Photo & Film' },
  { id: 'outdoors', label: 'Vintage & Outdoor' },
  { id: 'art', label: 'Gallery & Wall Art' },
  { id: 'cyber', label: 'Cyber & Techwear' },
];

export const STARTER_TEMPLATES = [
  {
    id: 'signature-smiley',
    name: 'The (: Signature Tee',
    tagline: 'Iconic oversized streetwear with the (: smiley emblem',
    category: 'clothing',
    style: 'streetwear',
    badge: 'Official Brand',
    hasPhoto: false,
    defaultColors: {
      text: '#5B4636',
      accent: '#C76D4A',
      garment: '#FFFFFF',
    },
    defaultTexts: {
      headline: 'HAVE A NICE DAY (:',
      subline: 'CREXZA ARCHIVE / SPECIAL EDITION',
      tag: 'N° 024 — TOKYO & PARIS',
    },
    textFields: [
      { key: 'headline', label: 'Main Slogan', placeholder: 'e.g. HAVE A NICE DAY (:', maxLength: 22 },
      { key: 'subline', label: 'Subtitle / Edition', placeholder: 'e.g. CREXZA ARCHIVE / SPECIAL EDITION', maxLength: 35 },
      { key: 'tag', label: 'Bottom Tag / Location', placeholder: 'e.g. N° 024 — TOKYO & PARIS', maxLength: 28 },
    ],
    renderPreview: (values, colors) => ({
      headline: values.headline || 'HAVE A NICE DAY (:',
      subline: values.subline || 'CREXZA ARCHIVE / SPECIAL EDITION',
      tag: values.tag || 'N° 024 — TOKYO & PARIS',
      accentColor: colors.accent || '#C76D4A',
      textColor: colors.text || '#5B4636',
      garmentColor: colors.garment || '#FFFFFF',
    }),
  },
  {
    id: 'tokyo-streetwear',
    name: 'Y2K Tokyo Cyber Tee',
    tagline: 'Heavyweight boxy cut with barcode & coordinates',
    category: 'clothing',
    style: 'streetwear',
    badge: 'Trending',
    hasPhoto: false,
    defaultColors: {
      text: '#1A1817',
      accent: '#C76D4A',
      garment: '#F7F3EB',
    },
    defaultTexts: {
      headline: 'CREXZA',
      subline: 'TOKYO METROPOLITAN // クレクサ',
      tag: '35°39\'10.2"N 139°41\'52.8"E',
    },
    textFields: [
      { key: 'headline', label: 'Brand Word', placeholder: 'e.g. CREXZA', maxLength: 16 },
      { key: 'subline', label: 'Division / Japanese Subtitle', placeholder: 'e.g. TOKYO METROPOLITAN // クレクサ', maxLength: 36 },
      { key: 'tag', label: 'GPS Coordinates / Code', placeholder: 'e.g. 35°39\'10.2"N 139°41\'52.8"E', maxLength: 30 },
    ],
    renderPreview: (values, colors) => ({
      headline: values.headline || 'CREXZA',
      subline: values.subline || 'TOKYO METROPOLITAN // クレクサ',
      tag: values.tag || '35°39\'10.2"N 139°41\'52.8"E',
      accentColor: colors.accent || '#C76D4A',
      textColor: colors.text || '#1A1817',
      garmentColor: colors.garment || '#F7F3EB',
    }),
  },
  {
    id: 'varsity-athletic',
    name: 'Varsity Collegiate 08',
    tagline: 'Classic arched championship lettering & bold jersey number',
    category: 'clothing',
    style: 'collegiate',
    badge: 'Classic',
    hasPhoto: false,
    defaultColors: {
      text: '#5B4636',
      accent: '#8A9A7B',
      garment: '#FFFFFF',
    },
    defaultTexts: {
      headline: 'CREXZA',
      number: '08',
      subline: 'ALL-STAR DIVISION CHAMPIONS',
    },
    textFields: [
      { key: 'headline', label: 'Team / University Name', placeholder: 'e.g. CREXZA', maxLength: 16 },
      { key: 'number', label: 'Jersey Number (1-2 digits)', placeholder: 'e.g. 08', maxLength: 3 },
      { key: 'subline', label: 'Division / Sport Slogan', placeholder: 'e.g. ALL-STAR DIVISION CHAMPIONS', maxLength: 32 },
    ],
    renderPreview: (values, colors) => ({
      headline: values.headline || 'CREXZA',
      number: values.number || '08',
      subline: values.subline || 'ALL-STAR DIVISION CHAMPIONS',
      accentColor: colors.accent || '#8A9A7B',
      textColor: colors.text || '#5B4636',
      garmentColor: colors.garment || '#FFFFFF',
    }),
  },
  {
    id: 'luxury-monogram',
    name: 'Heritage Royal Monogram',
    tagline: 'Ornate double crest with heraldic laurel wreath',
    category: 'all',
    style: 'monogram',
    badge: 'Luxury',
    hasPhoto: false,
    defaultColors: {
      text: '#5B4636',
      accent: '#C76D4A',
      garment: '#FFFFFF',
    },
    defaultTexts: {
      initial: 'C',
      headline: 'CREXZA ATELIER',
      subline: 'HAUTE COUTURE & READY-TO-WEAR',
      tag: 'MMXXV',
    },
    textFields: [
      { key: 'initial', label: 'Monogram Initial', placeholder: 'C', maxLength: 2 },
      { key: 'headline', label: 'Brand Name', placeholder: 'e.g. CREXZA ATELIER', maxLength: 20 },
      { key: 'subline', label: 'Tagline', placeholder: 'e.g. HAUTE COUTURE & READY-TO-WEAR', maxLength: 35 },
      { key: 'tag', label: 'Roman Year', placeholder: 'e.g. MMXXV', maxLength: 10 },
    ],
    renderPreview: (values, colors) => ({
      initial: values.initial || 'C',
      headline: values.headline || 'CREXZA ATELIER',
      subline: values.subline || 'HAUTE COUTURE & READY-TO-WEAR',
      tag: values.tag || 'MMXXV',
      accentColor: colors.accent || '#C76D4A',
      textColor: colors.text || '#5B4636',
      garmentColor: colors.garment || '#FFFFFF',
    }),
  },
  {
    id: 'polaroid-frame',
    name: 'Polaroid Memory Frame',
    tagline: 'Drop any personal photo with authentic film borders',
    category: 'all',
    style: 'photo',
    badge: 'Bestseller',
    hasPhoto: true,
    defaultPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    defaultColors: {
      text: '#2C2724',
      accent: '#8A9A7B',
      garment: '#FFFFFF',
    },
    defaultTexts: {
      headline: 'Summer in Positano',
      subline: 'Amalfi Coast, Italy',
      tag: 'AUG 2025 • 35MM',
    },
    textFields: [
      { key: 'headline', label: 'Handwritten Caption', placeholder: 'e.g. Summer in Positano', maxLength: 26 },
      { key: 'subline', label: 'Location / Note', placeholder: 'e.g. Amalfi Coast, Italy', maxLength: 30 },
      { key: 'tag', label: 'Film Stamp', placeholder: 'e.g. AUG 2025 • 35MM', maxLength: 20 },
    ],
    renderPreview: (values, colors) => ({
      headline: values.headline || 'Summer in Positano',
      subline: values.subline || 'Amalfi Coast, Italy',
      tag: values.tag || 'AUG 2025 • 35MM',
      accentColor: colors.accent || '#8A9A7B',
      textColor: colors.text || '#2C2724',
      garmentColor: colors.garment || '#FFFFFF',
    }),
  },
  {
    id: 'retro-mountain',
    name: 'Pacific Trail Ridge',
    tagline: 'Geometric mountain peaks, sun rays & pine tree crest',
    category: 'clothing',
    style: 'outdoors',
    badge: 'Vintage',
    hasPhoto: false,
    defaultColors: {
      text: '#3E4B37',
      accent: '#C76D4A',
      garment: '#F7F3EB',
    },
    defaultTexts: {
      headline: 'PACIFIC DISCOVERY',
      subline: 'CASCADE MOUNTAIN EXPEDITION',
      tag: 'EST. 1978 • ELEV. 4392M',
    },
    textFields: [
      { key: 'headline', label: 'Trail / Park Name', placeholder: 'e.g. PACIFIC DISCOVERY', maxLength: 22 },
      { key: 'subline', label: 'Expedition Tagline', placeholder: 'e.g. CASCADE MOUNTAIN EXPEDITION', maxLength: 32 },
      { key: 'tag', label: 'Elevation / Established Year', placeholder: 'e.g. EST. 1978 • ELEV. 4392M', maxLength: 25 },
    ],
    renderPreview: (values, colors) => ({
      headline: values.headline || 'PACIFIC DISCOVERY',
      subline: values.subline || 'CASCADE MOUNTAIN EXPEDITION',
      tag: values.tag || 'EST. 1978 • ELEV. 4392M',
      accentColor: colors.accent || '#C76D4A',
      textColor: colors.text || '#3E4B37',
      garmentColor: colors.garment || '#F7F3EB',
    }),
  },
  {
    id: 'bauhaus-poster',
    name: 'Bauhaus 1923 Exhibition',
    tagline: 'Modernist Swiss geometry, circles & crisp typographic grid',
    category: 'artwork',
    style: 'art',
    badge: 'Gallery Edition',
    hasPhoto: false,
    defaultColors: {
      text: '#1E1E1E',
      accent: '#C76D4A',
      garment: '#FAF7F0',
    },
    defaultTexts: {
      headline: 'BAUHAUS 1923',
      subline: 'STAATLICHES BAUHAUS WEIMAR',
      tag: 'AUSSTELLUNG • ARCHITEKTUR & DESIGN',
    },
    textFields: [
      { key: 'headline', label: 'Exhibition Title', placeholder: 'e.g. BAUHAUS 1923', maxLength: 20 },
      { key: 'subline', label: 'Institution / City', placeholder: 'e.g. STAATLICHES BAUHAUS WEIMAR', maxLength: 32 },
      { key: 'tag', label: 'Curation Note', placeholder: 'e.g. AUSSTELLUNG • ARCHITEKTUR & DESIGN', maxLength: 36 },
    ],
    renderPreview: (values, colors) => ({
      headline: values.headline || 'BAUHAUS 1923',
      subline: values.subline || 'STAATLICHES BAUHAUS WEIMAR',
      tag: values.tag || 'AUSSTELLUNG • ARCHITEKTUR & DESIGN',
      accentColor: colors.accent || '#C76D4A',
      textColor: colors.text || '#1E1E1E',
      garmentColor: colors.garment || '#FAF7F0',
    }),
  },
  {
    id: 'botanical-art',
    name: 'Wild Botanical Flora',
    tagline: 'Fine-line botanical branch with French apothecary serif',
    category: 'all',
    style: 'art',
    badge: 'Artisan',
    hasPhoto: false,
    defaultColors: {
      text: '#2D372E',
      accent: '#8A9A7B',
      garment: '#F7F3EB',
    },
    defaultTexts: {
      headline: 'FLORA & SILVA',
      subline: 'HERBARIUM BOTANICUM NO. 04',
      tag: 'COLLECTED IN PROVENCE • 1912',
    },
    textFields: [
      { key: 'headline', label: 'Botanical Title', placeholder: 'e.g. FLORA & SILVA', maxLength: 22 },
      { key: 'subline', label: 'Collection / Species', placeholder: 'e.g. HERBARIUM BOTANICUM NO. 04', maxLength: 32 },
      { key: 'tag', label: 'Origin / Note', placeholder: 'e.g. COLLECTED IN PROVENCE • 1912', maxLength: 30 },
    ],
    renderPreview: (values, colors) => ({
      headline: values.headline || 'FLORA & SILVA',
      subline: values.subline || 'HERBARIUM BOTANICUM NO. 04',
      tag: values.tag || 'COLLECTED IN PROVENCE • 1912',
      accentColor: colors.accent || '#8A9A7B',
      textColor: colors.text || '#2D372E',
      garmentColor: colors.garment || '#F7F3EB',
    }),
  },
  {
    id: 'cyber-matrix',
    name: 'Neo Tokyo 2099',
    tagline: 'Cyberpunk grid wireframe, barcode stamp & glitch typography',
    category: 'accessories',
    style: 'cyber',
    badge: 'Techwear',
    hasPhoto: false,
    defaultColors: {
      text: '#1C1917',
      accent: '#C76D4A',
      garment: '#F7F3EB',
    },
    defaultTexts: {
      headline: 'NEO TOKYO 2099',
      subline: 'CYBERNETIC SYSTEM OVERRIDE',
      tag: 'SYSTEM PROTOCOL // VER. 4.09',
    },
    textFields: [
      { key: 'headline', label: 'Cyber Title', placeholder: 'e.g. NEO TOKYO 2099', maxLength: 18 },
      { key: 'subline', label: 'Status / Operation', placeholder: 'e.g. CYBERNETIC SYSTEM OVERRIDE', maxLength: 32 },
      { key: 'tag', label: 'Version / Serial', placeholder: 'e.g. SYSTEM PROTOCOL // VER. 4.09', maxLength: 30 },
    ],
    renderPreview: (values, colors) => ({
      headline: values.headline || 'NEO TOKYO 2099',
      subline: values.subline || 'CYBERNETIC SYSTEM OVERRIDE',
      tag: values.tag || 'SYSTEM PROTOCOL // VER. 4.09',
      accentColor: colors.accent || '#C76D4A',
      textColor: colors.text || '#1C1917',
      garmentColor: colors.garment || '#F7F3EB',
    }),
  },
  {
    id: 'vintage-crest-patch',
    name: 'Alpine Explorer Patch',
    tagline: 'Classic embroidered outdoor shield for caps, jackets & bags',
    category: 'accessories',
    style: 'outdoors',
    badge: 'Club Crest',
    hasPhoto: false,
    defaultColors: {
      text: '#5B4636',
      accent: '#C76D4A',
      garment: '#FFFFFF',
    },
    defaultTexts: {
      headline: 'ALPINE EXPLORER',
      subline: 'HIGHLAND MOUNTAIN PATROL',
      tag: 'ELEVATION 2840M',
    },
    textFields: [
      { key: 'headline', label: 'Club / Team Name', placeholder: 'e.g. ALPINE EXPLORER', maxLength: 20 },
      { key: 'subline', label: 'Patrol / Branch', placeholder: 'e.g. HIGHLAND MOUNTAIN PATROL', maxLength: 30 },
      { key: 'tag', label: 'Badge Detail', placeholder: 'e.g. ELEVATION 2840M', maxLength: 22 },
    ],
    renderPreview: (values, colors) => ({
      headline: values.headline || 'ALPINE EXPLORER',
      subline: values.subline || 'HIGHLAND MOUNTAIN PATROL',
      tag: values.tag || 'ELEVATION 2840M',
      accentColor: colors.accent || '#C76D4A',
      textColor: colors.text || '#5B4636',
      garmentColor: colors.garment || '#FFFFFF',
    }),
  },
];

import { getDesignZone } from './ProductTemplate';

/* ─── Fabric Canvas Synchronizer ─────────────────────────────────────────────
   Builds or updates the Fabric.js canvas from the realistic template values.
   Ensures seamless switching between Quick Mode and Pro Mode!
   ───────────────────────────────────────────────────────────────────────── */
export function applyTemplateToFabricCanvas(canvas, template, values, colors, photoUrl = null) {
  if (!canvas) return;

  // Clear existing user objects, keeping template product silhouettes and grid
  const objects = canvas.getObjects();
  const toRemove = objects.filter((obj) => obj.id && !obj.id.startsWith('__template_') && obj.id !== '__grid__');
  toRemove.forEach((obj) => canvas.remove(obj));

  const targetProduct = template.category === 'artwork' ? 'canvas' : template.category === 'accessories' ? 'phonecase' : 'tshirt';
  const zone = getDesignZone(targetProduct, 'front', canvas.width, canvas.height);
  const centerX = zone.x + zone.w / 2;
  const centerY = zone.y + zone.h / 2;

  const textColor = colors.text || '#5B4636';
  const accentColor = colors.accent || '#C76D4A';

  // 1. Signature (: Smiley Graphic
  if (template.id === 'signature-smiley') {
    // Outer dashed boundary
    const borderBox = new fabric.Rect({
      left: centerX,
      top: centerY,
      width: 250,
      height: 250,
      originX: 'center',
      originY: 'center',
      fill: 'transparent',
      stroke: accentColor,
      strokeWidth: 1.5,
      strokeDashArray: [6, 4],
      rx: 12,
      ry: 12,
      id: 'template_border',
    });

    // Circular background badge
    const circleBg = new fabric.Circle({
      left: centerX,
      top: centerY - 15,
      radius: 65,
      originX: 'center',
      originY: 'center',
      fill: accentColor,
      opacity: 0.12,
      id: 'template_circle_bg',
    });

    // Main (: Smiley text mark in center
    const smileyMark = new fabric.IText('(:', {
      left: centerX,
      top: centerY - 15,
      originX: 'center',
      originY: 'center',
      fontSize: 58,
      fontFamily: 'Space Grotesk, monospace',
      fontWeight: '900',
      fill: accentColor,
      id: 'template_smiley',
      customName: '(: Smiley Mark',
    });

    // Arched or top headline
    const headline = new fabric.IText(values.headline || 'HAVE A NICE DAY (:', {
      left: centerX,
      top: centerY - 95,
      originX: 'center',
      originY: 'center',
      fontSize: 16,
      fontFamily: 'Inter',
      fontWeight: '900',
      fill: textColor,
      charSpacing: 180,
      id: 'template_headline',
      customName: 'Top Headline',
    });

    // Subtitle
    const subline = new fabric.IText(values.subline || 'CREXZA ARCHIVE / SPECIAL EDITION', {
      left: centerX,
      top: centerY + 68,
      originX: 'center',
      originY: 'center',
      fontSize: 9,
      fontFamily: 'Inter',
      fontWeight: '800',
      fill: textColor,
      charSpacing: 140,
      id: 'template_subline',
      customName: 'Subtitle',
    });

    // Bottom Tag
    const tag = new fabric.IText(values.tag || 'N° 024 — TOKYO & PARIS', {
      left: centerX,
      top: centerY + 90,
      originX: 'center',
      originY: 'center',
      fontSize: 8.5,
      fontFamily: 'Space Grotesk, monospace',
      fontWeight: '600',
      fill: accentColor,
      charSpacing: 120,
      id: 'template_tag',
      customName: 'Edition Tag',
    });

    canvas.add(borderBox, circleBg, smileyMark, headline, subline, tag);
  }

  // 2. Y2K Tokyo Cyber Streetwear
  else if (template.id === 'tokyo-streetwear') {
    // Top crosshairs
    const crosshairL = new fabric.IText('+', {
      left: centerX - 110,
      top: centerY - 75,
      originX: 'center',
      originY: 'center',
      fontSize: 14,
      fontFamily: 'monospace',
      fill: accentColor,
      id: 'template_cross_l',
    });
    const crosshairR = new fabric.IText('+', {
      left: centerX + 110,
      top: centerY - 75,
      originX: 'center',
      originY: 'center',
      fontSize: 14,
      fontFamily: 'monospace',
      fill: accentColor,
      id: 'template_cross_r',
    });

    // Bold Industrial Headline
    const headline = new fabric.IText(values.headline || 'CREXZA', {
      left: centerX,
      top: centerY - 50,
      originX: 'center',
      originY: 'center',
      fontSize: 42,
      fontFamily: 'Inter',
      fontWeight: '900',
      fill: textColor,
      charSpacing: 220,
      id: 'template_headline',
      customName: 'Main Title',
    });

    // Solid accent underline
    const line = new fabric.Rect({
      left: centerX,
      top: centerY - 15,
      width: 220,
      height: 3,
      originX: 'center',
      originY: 'center',
      fill: accentColor,
      id: 'template_line',
    });

    // Japanese subtitle
    const subline = new fabric.IText(values.subline || 'TOKYO METROPOLITAN // クレクサ', {
      left: centerX,
      top: centerY + 5,
      originX: 'center',
      originY: 'center',
      fontSize: 10,
      fontFamily: 'Inter',
      fontWeight: '700',
      fill: textColor,
      charSpacing: 120,
      id: 'template_subline',
      customName: 'Subtitle',
    });

    // Realistic Barcode Graphic
    const barcodeBars = [];
    const barWidths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2];
    let currentX = centerX - 70;
    barWidths.forEach((w, i) => {
      barcodeBars.push(new fabric.Rect({
        left: currentX,
        top: centerY + 40,
        width: w,
        height: 24,
        fill: textColor,
        id: `template_bar_${i}`,
      }));
      currentX += w + 4;
    });

    // Coordinates Tag
    const tag = new fabric.IText(values.tag || '35°39\'10.2"N 139°41\'52.8"E', {
      left: centerX,
      top: centerY + 72,
      originX: 'center',
      originY: 'center',
      fontSize: 8,
      fontFamily: 'Space Grotesk, monospace',
      fontWeight: '600',
      fill: accentColor,
      charSpacing: 100,
      id: 'template_tag',
    });

    canvas.add(crosshairL, crosshairR, headline, line, subline, ...barcodeBars, tag);
  }

  // 3. Collegiate Varsity Arch & Number
  else if (template.id === 'varsity-athletic') {
    // Arch team name
    const headline = new fabric.IText(values.headline || 'CREXZA', {
      left: centerX,
      top: centerY - 65,
      originX: 'center',
      originY: 'center',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '900',
      fill: textColor,
      stroke: accentColor,
      strokeWidth: 1.5,
      charSpacing: 200,
      id: 'template_headline',
      customName: 'Team Name',
    });

    // Huge athletic jersey number
    const number = new fabric.IText(values.number || '08', {
      left: centerX,
      top: centerY + 5,
      originX: 'center',
      originY: 'center',
      fontSize: 76,
      fontFamily: 'Impact, Inter, sans-serif',
      fontWeight: '900',
      fill: accentColor,
      stroke: textColor,
      strokeWidth: 2,
      charSpacing: 50,
      id: 'template_number',
      customName: 'Jersey Number',
    });

    // Horizontal sport strip
    const stripeL = new fabric.Rect({ left: centerX - 85, top: centerY + 65, width: 45, height: 2, fill: textColor, originX: 'center' });
    const star = new fabric.IText('★', { left: centerX, top: centerY + 65, originX: 'center', originY: 'center', fontSize: 14, fill: accentColor });
    const stripeR = new fabric.Rect({ left: centerX + 85, top: centerY + 65, width: 45, height: 2, fill: textColor, originX: 'center' });

    // Subline
    const subline = new fabric.IText(values.subline || 'ALL-STAR DIVISION CHAMPIONS', {
      left: centerX,
      top: centerY + 85,
      originX: 'center',
      originY: 'center',
      fontSize: 8.5,
      fontFamily: 'Inter',
      fontWeight: '800',
      fill: textColor,
      charSpacing: 160,
      id: 'template_subline',
    });

    canvas.add(headline, number, stripeL, star, stripeR, subline);
  }

  // 4. Heritage Royal Monogram
  else if (template.id === 'luxury-monogram') {
    // Outer decorative ring
    const outerRing = new fabric.Circle({
      left: centerX,
      top: centerY - 20,
      radius: 68,
      originX: 'center',
      originY: 'center',
      fill: 'transparent',
      stroke: accentColor,
      strokeWidth: 2,
      id: 'template_ring_out',
    });

    // Inner dotted ring
    const innerRing = new fabric.Circle({
      left: centerX,
      top: centerY - 20,
      radius: 60,
      originX: 'center',
      originY: 'center',
      fill: 'transparent',
      stroke: textColor,
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      id: 'template_ring_in',
    });

    // Monogram Initial
    const initial = new fabric.IText(values.initial || 'C', {
      left: centerX,
      top: centerY - 22,
      originX: 'center',
      originY: 'center',
      fontSize: 64,
      fontFamily: 'Georgia, serif',
      fontWeight: 'bold',
      fill: textColor,
      id: 'template_initial',
    });

    // Brand title
    const headline = new fabric.IText(values.headline || 'CREXZA ATELIER', {
      left: centerX,
      top: centerY + 70,
      originX: 'center',
      originY: 'center',
      fontSize: 14,
      fontFamily: 'Georgia, serif',
      fontWeight: 'bold',
      fill: textColor,
      charSpacing: 180,
      id: 'template_headline',
    });

    // Subline
    const subline = new fabric.IText(values.subline || 'HAUTE COUTURE & READY-TO-WEAR', {
      left: centerX,
      top: centerY + 88,
      originX: 'center',
      originY: 'center',
      fontSize: 8,
      fontFamily: 'Inter',
      fontWeight: '700',
      fill: accentColor,
      charSpacing: 140,
      id: 'template_subline',
    });

    // Roman numeral tag
    const tag = new fabric.IText(values.tag || 'MMXXV', {
      left: centerX,
      top: centerY - 95,
      originX: 'center',
      originY: 'center',
      fontSize: 10,
      fontFamily: 'Georgia, serif',
      fill: accentColor,
      charSpacing: 200,
      id: 'template_tag',
    });

    canvas.add(outerRing, innerRing, initial, headline, subline, tag);
  }

  // 5. Polaroid Memory Frame
  else if (template.id === 'polaroid-frame') {
    // Polaroid white card backing with shadow
    const card = new fabric.Rect({
      left: centerX,
      top: centerY,
      width: 210,
      height: 250,
      originX: 'center',
      originY: 'center',
      fill: '#FFFFFF',
      stroke: '#E2DCD2',
      strokeWidth: 1.5,
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.15)', blur: 12, offsetX: 0, offsetY: 4 }),
      id: 'template_card',
    });

    // Tape sticker at top-center
    const tape = new fabric.Rect({
      left: centerX,
      top: centerY - 128,
      width: 60,
      height: 18,
      originX: 'center',
      originY: 'center',
      fill: 'rgba(235, 225, 205, 0.75)',
      stroke: 'rgba(215, 205, 185, 0.8)',
      strokeWidth: 1,
      id: 'template_tape',
    });

    // Photo placeholder or uploaded image
    const effectivePhoto = photoUrl || template.defaultPhoto;
    if (effectivePhoto) {
      fabric.Image.fromURL(effectivePhoto, (img) => {
        img.set({
          left: centerX,
          top: centerY - 25,
          originX: 'center',
          originY: 'center',
          id: 'template_photo',
        });
        img.scaleToWidth(180);
        img.scaleToHeight(170);
        canvas.insertAt(img, canvas.getObjects().indexOf(card) + 1);
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' });
    }

    // Handwritten-style caption
    const headline = new fabric.IText(values.headline || 'Summer in Positano', {
      left: centerX,
      top: centerY + 80,
      originX: 'center',
      originY: 'center',
      fontSize: 13,
      fontFamily: 'Caveat, cursive, sans-serif',
      fontWeight: 'bold',
      fill: textColor,
      id: 'template_headline',
    });

    // Location or Note
    const subline = new fabric.IText(values.subline || 'Amalfi Coast, Italy', {
      left: centerX,
      top: centerY + 98,
      originX: 'center',
      originY: 'center',
      fontSize: 8.5,
      fontFamily: 'Inter',
      fontWeight: '600',
      fill: accentColor,
      charSpacing: 80,
      id: 'template_subline',
    });

    canvas.add(card, tape, headline, subline);
  }

  // 6. Pacific Mountain Trail
  else if (template.id === 'retro-mountain') {
    // Diamond frame
    const diamond = new fabric.Rect({
      left: centerX,
      top: centerY - 15,
      width: 140,
      height: 140,
      originX: 'center',
      originY: 'center',
      angle: 45,
      fill: 'transparent',
      stroke: accentColor,
      strokeWidth: 2,
      id: 'template_diamond',
    });

    // Mountain peak paths
    const mountain = new fabric.Path('M 0 60 L 45 0 L 90 60 L 60 60 L 45 40 L 30 60 Z', {
      left: centerX,
      top: centerY - 15,
      originX: 'center',
      originY: 'center',
      fill: textColor,
      id: 'template_mountain',
    });

    // Trail headline
    const headline = new fabric.IText(values.headline || 'PACIFIC DISCOVERY', {
      left: centerX,
      top: centerY + 72,
      originX: 'center',
      originY: 'center',
      fontSize: 15,
      fontFamily: 'Inter',
      fontWeight: '900',
      fill: textColor,
      charSpacing: 180,
      id: 'template_headline',
    });

    // Subline
    const subline = new fabric.IText(values.subline || 'CASCADE MOUNTAIN EXPEDITION', {
      left: centerX,
      top: centerY + 90,
      originX: 'center',
      originY: 'center',
      fontSize: 8.5,
      fontFamily: 'Inter',
      fontWeight: '700',
      fill: accentColor,
      charSpacing: 140,
      id: 'template_subline',
    });

    // Tag
    const tag = new fabric.IText(values.tag || 'EST. 1978 • ELEV. 4392M', {
      left: centerX,
      top: centerY - 95,
      originX: 'center',
      originY: 'center',
      fontSize: 8,
      fontFamily: 'Space Grotesk, monospace',
      fontWeight: '600',
      fill: textColor,
      charSpacing: 140,
      id: 'template_tag',
    });

    canvas.add(diamond, mountain, headline, subline, tag);
  }

  // 7. Bauhaus Exhibition Poster
  else if (template.id === 'bauhaus-poster') {
    const bgCircle = new fabric.Circle({
      left: centerX - 30,
      top: centerY - 25,
      radius: 65,
      originX: 'center',
      originY: 'center',
      fill: accentColor,
      opacity: 0.85,
      id: 'template_bauhaus_circle',
    });

    const wireCircle = new fabric.Circle({
      left: centerX + 35,
      top: centerY + 10,
      radius: 45,
      originX: 'center',
      originY: 'center',
      fill: 'transparent',
      stroke: textColor,
      strokeWidth: 2,
      id: 'template_wire_circle',
    });

    const divider = new fabric.Line([centerX - 110, centerY + 55, centerX + 110, centerY + 55], {
      stroke: textColor,
      strokeWidth: 3,
      id: 'template_divider',
    });

    const headline = new fabric.IText(values.headline || 'BAUHAUS 1923', {
      left: centerX,
      top: centerY - 90,
      originX: 'center',
      originY: 'center',
      fontSize: 22,
      fontFamily: 'Space Grotesk, sans-serif',
      fontWeight: '900',
      fill: textColor,
      charSpacing: 220,
      id: 'template_headline',
    });

    const subline = new fabric.IText(values.subline || 'STAATLICHES BAUHAUS WEIMAR', {
      left: centerX,
      top: centerY + 75,
      originX: 'center',
      originY: 'center',
      fontSize: 9,
      fontFamily: 'Inter',
      fontWeight: '800',
      fill: textColor,
      charSpacing: 160,
      id: 'template_subline',
    });

    const tag = new fabric.IText(values.tag || 'AUSSTELLUNG • ARCHITEKTUR & DESIGN', {
      left: centerX,
      top: centerY + 95,
      originX: 'center',
      originY: 'center',
      fontSize: 7.5,
      fontFamily: 'Inter',
      fontWeight: '600',
      fill: accentColor,
      charSpacing: 120,
      id: 'template_tag',
    });

    canvas.add(bgCircle, wireCircle, divider, headline, subline, tag);
  }

  // 8. Botanical Herbarium Flora
  else if (template.id === 'botanical-art') {
    const border = new fabric.Rect({
      left: centerX,
      top: centerY,
      width: 220,
      height: 270,
      originX: 'center',
      originY: 'center',
      fill: 'transparent',
      stroke: accentColor,
      strokeWidth: 1.5,
      strokeDashArray: [4, 4],
      id: 'template_border',
    });

    const branch = new fabric.Path('M 50 150 C 50 100, 70 50, 90 20 C 70 35, 60 50, 45 60 C 65 75, 75 95, 60 115 C 40 120, 25 130, 20 140 Z', {
      left: centerX,
      top: centerY - 25,
      originX: 'center',
      originY: 'center',
      scaleX: 1.2,
      scaleY: 1.2,
      fill: accentColor,
      opacity: 0.85,
      id: 'template_branch',
    });

    const headline = new fabric.IText(values.headline || 'FLORA & SILVA', {
      left: centerX,
      top: centerY + 65,
      originX: 'center',
      originY: 'center',
      fontSize: 16,
      fontFamily: 'Georgia, serif',
      fontWeight: 'bold',
      fill: textColor,
      charSpacing: 180,
      id: 'template_headline',
    });

    const subline = new fabric.IText(values.subline || 'HERBARIUM BOTANICUM NO. 04', {
      left: centerX,
      top: centerY + 88,
      originX: 'center',
      originY: 'center',
      fontSize: 8,
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fill: textColor,
      charSpacing: 140,
      id: 'template_subline',
    });

    const tag = new fabric.IText(values.tag || 'COLLECTED IN PROVENCE • 1912', {
      left: centerX,
      top: centerY - 110,
      originX: 'center',
      originY: 'center',
      fontSize: 7.5,
      fontFamily: 'Inter',
      fontWeight: '600',
      fill: accentColor,
      charSpacing: 120,
      id: 'template_tag',
    });

    canvas.add(border, branch, headline, subline, tag);
  }

  // 9. Cyber Matrix Neo Tokyo
  else if (template.id === 'cyber-matrix') {
    const box = new fabric.Rect({
      left: centerX,
      top: centerY,
      width: 230,
      height: 250,
      originX: 'center',
      originY: 'center',
      fill: 'rgba(0,0,0,0.03)',
      stroke: textColor,
      strokeWidth: 1.5,
      id: 'template_cyber_box',
    });

    // Barcode lines
    const barcodeGroup = [];
    const widths = [2, 4, 1, 3, 5, 2, 1, 4, 2, 3, 1, 5, 3, 2];
    let startX = centerX - 55;
    widths.forEach((w, i) => {
      barcodeGroup.push(
        new fabric.Rect({
          left: startX,
          top: centerY - 40,
          width: w * 1.5,
          height: 24,
          fill: textColor,
        })
      );
      startX += w * 1.5 + 4;
    });

    const headline = new fabric.IText(values.headline || 'NEO TOKYO 2099', {
      left: centerX,
      top: centerY - 85,
      originX: 'center',
      originY: 'center',
      fontSize: 18,
      fontFamily: 'Space Grotesk, sans-serif',
      fontWeight: '900',
      fill: textColor,
      charSpacing: 200,
      id: 'template_headline',
    });

    const subline = new fabric.IText(values.subline || 'CYBERNETIC SYSTEM OVERRIDE', {
      left: centerX,
      top: centerY + 40,
      originX: 'center',
      originY: 'center',
      fontSize: 9,
      fontFamily: 'Space Grotesk, monospace',
      fontWeight: '700',
      fill: accentColor,
      charSpacing: 140,
      id: 'template_subline',
    });

    const tag = new fabric.IText(values.tag || 'SYSTEM PROTOCOL // VER. 4.09', {
      left: centerX,
      top: centerY + 65,
      originX: 'center',
      originY: 'center',
      fontSize: 8,
      fontFamily: 'Space Grotesk, monospace',
      fontWeight: '600',
      fill: textColor,
      charSpacing: 100,
      id: 'template_tag',
    });

    canvas.add(box, ...barcodeGroup, headline, subline, tag);
  }

  // 10. Alpine Explorer Club Crest Patch
  else if (template.id === 'vintage-crest-patch') {
    const shield = new fabric.Path('M 50 10 C 80 10, 95 20, 95 60 C 95 100, 50 130, 50 130 C 50 130, 5 100, 5 60 C 5 20, 20 10, 50 10 Z', {
      left: centerX,
      top: centerY - 15,
      originX: 'center',
      originY: 'center',
      scaleX: 1.8,
      scaleY: 1.6,
      fill: 'transparent',
      stroke: accentColor,
      strokeWidth: 2.5,
      id: 'template_shield',
    });

    const star = new fabric.IText('★', {
      left: centerX,
      top: centerY - 45,
      originX: 'center',
      originY: 'center',
      fontSize: 26,
      fill: accentColor,
      id: 'template_star',
    });

    const headline = new fabric.IText(values.headline || 'ALPINE EXPLORER', {
      left: centerX,
      top: centerY,
      originX: 'center',
      originY: 'center',
      fontSize: 14,
      fontFamily: 'Impact, sans-serif',
      fontWeight: '900',
      fill: textColor,
      charSpacing: 160,
      id: 'template_headline',
    });

    const subline = new fabric.IText(values.subline || 'HIGHLAND PATROL', {
      left: centerX,
      top: centerY + 25,
      originX: 'center',
      originY: 'center',
      fontSize: 8.5,
      fontFamily: 'Inter',
      fontWeight: '800',
      fill: textColor,
      charSpacing: 140,
      id: 'template_subline',
    });

    const tag = new fabric.IText(values.tag || 'ELEVATION 2840M', {
      left: centerX,
      top: centerY + 50,
      originX: 'center',
      originY: 'center',
      fontSize: 7.5,
      fontFamily: 'Space Grotesk, monospace',
      fontWeight: '700',
      fill: accentColor,
      charSpacing: 120,
      id: 'template_tag',
    });

    canvas.add(shield, star, headline, subline, tag);
  }

  canvas.renderAll();
}
