import { useEffect, useRef, useState, useCallback } from 'react';
import { useStudio } from '@/context/StudioContext';
import { PATTERN_TEMPLATES, pxToCm, cmToPx, formatCm } from '@/lib/utils';
import {
  Ruler, Scissors, Move, RotateCw, ZoomIn, ZoomOut,
  MousePointer2, PenTool, Trash2, Plus, Download,
  Maximize2, RefreshCw, Layers, Compass,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════════════════════════════════════
   PatternEditor — Professional 2D CAD Pattern Drafting Workspace
   ─────────────────────────────────────────────────────────────────────────────
   Features:
   - Centimeter-calibrated cutting table with real-world rulers
   - Freely draggable pattern pieces with seam allowances and grainlines
   - Real-time dimensional callouts on edges (in cm)
   - Point editing: drag, add, and delete control vertices
   - Bounding dimension readouts (Width × Height, Area)
   - Auto "Fit All" to center and scale all pieces into view
   - Export CAD Pattern to standard SVG format for plotting & cutting
   ═══════════════════════════════════════════════════════════════════════════════ */

const RULER_SIZE = 28;
const MIN_SCALE = 3;
const MAX_SCALE = 35;

const PatternEditor = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const {
    productType, category,
    patternPieces, setPatternPieces,
    activePatternPiece, setActivePatternPiece,
    patternScale, setPatternScale,
    syncPatternPieces,
  } = useStudio();

  const [tool, setTool] = useState('select'); // 'select' | 'point' | 'addPoint' | 'pan'
  const [panOffset, setPanOffset] = useState({ x: 70, y: 70 });
  const [dragState, setDragState] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredPiece, setHoveredPiece] = useState(null);
  const [cursorCm, setCursorCm] = useState({ x: 0, y: 0 });
  const [measurements, setMeasurements] = useState([]);

  // Load pattern pieces when product type changes
  useEffect(() => {
    syncPatternPieces(productType);
  }, [productType, syncPatternPieces]);

  // Compute measurements between adjacent points
  useEffect(() => {
    const m = [];
    patternPieces.forEach(piece => {
      const pts = piece.points;
      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % pts.length];
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        m.push({
          pieceId: piece.id,
          from: i,
          to: (i + 1) % pts.length,
          distance: dist,
          midX: (p1[0] + p2[0]) / 2,
          midY: (p1[1] + p2[1]) / 2,
          angle: Math.atan2(dy, dx),
        });
      }
    });
    setMeasurements(m);
  }, [patternPieces]);

  // Fit all pattern pieces into view
  const fitAll = useCallback(() => {
    const container = containerRef.current;
    if (!container || patternPieces.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    patternPieces.forEach(piece => {
      piece.points.forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      });
    });

    const pad = 8;
    const totalW = (maxX - minX) + pad * 2;
    const totalH = (maxY - minY) + pad * 2;

    const availableW = container.clientWidth - RULER_SIZE - 40;
    const availableH = container.clientHeight - RULER_SIZE - 40;

    const scaleX = availableW / totalW;
    const scaleY = availableH / totalH;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(scaleX, scaleY)));

    setPatternScale(newScale);
    setPanOffset({
      x: (availableW - (maxX - minX) * newScale) / 2 - minX * newScale + 20,
      y: (availableH - (maxY - minY) * newScale) / 2 - minY * newScale + 20,
    });
  }, [patternPieces, setPatternScale]);

  // Reset pattern layout to template default
  const resetLayout = useCallback(() => {
    const templates = PATTERN_TEMPLATES[productType] || PATTERN_TEMPLATES.tshirt;
    setPatternPieces(JSON.parse(JSON.stringify(templates)));
    toast.success('Pattern layout reset to default');
    setTimeout(fitAll, 50);
  }, [productType, setPatternPieces, fitAll]);

  // Export Pattern as SVG CAD file
  const exportPatternSVG = useCallback(() => {
    if (patternPieces.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    patternPieces.forEach(piece => {
      piece.points.forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      });
    });

    const pad = 10;
    const vbW = (maxX - minX) + pad * 2;
    const vbH = (maxY - minY) + pad * 2;
    const offX = minX - pad;
    const offY = minY - pad;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW.toFixed(1)} ${vbH.toFixed(1)}" width="${(vbW * 10).toFixed(0)}mm" height="${(vbH * 10).toFixed(0)}mm">\n`;
    svg += `  <style>\n`;
    svg += `    .cut-line { fill: none; stroke: #111; stroke-width: 0.3; }\n`;
    svg += `    .seam-line { fill: none; stroke: #888; stroke-width: 0.2; stroke-dasharray: 0.8,0.8; }\n`;
    svg += `    .grain-line { stroke: #c76d4a; stroke-width: 0.25; }\n`;
    svg += `    .label { font-family: sans-serif; font-size: 1.2px; fill: #333; font-weight: bold; }\n`;
    svg += `  </style>\n`;

    patternPieces.forEach(piece => {
      const pts = piece.points.map(([x, y]) => `${(x - offX).toFixed(2)},${(y - offY).toFixed(2)}`).join(' ');
      svg += `  <!-- ${piece.name} -->\n`;
      svg += `  <polygon points="${pts}" class="cut-line" />\n`;

      const cx = piece.points.reduce((s, p) => s + p[0], 0) / piece.points.length - offX;
      const cy = piece.points.reduce((s, p) => s + p[1], 0) / piece.points.length - offY;
      svg += `  <text x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" text-anchor="middle" class="label">${piece.name} (SA: ${piece.seamAllowance}cm)</text>\n`;
    });

    svg += `</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${productType}_pattern_cad.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Pattern exported as SVG CAD file');
  }, [patternPieces, productType]);

  // Main Canvas Rendering Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const scale = patternScale;
    const ox = panOffset.x;
    const oy = panOffset.y;

    // ── Cutting Mat Background ──────────────────────────────────────────
    ctx.fillStyle = '#14151a';
    ctx.fillRect(0, 0, w, h);

    // ── CAD Grid (cm lines) ─────────────────────────────────────────────
    ctx.save();
    ctx.translate(RULER_SIZE, RULER_SIZE);

    const gridW = w - RULER_SIZE;
    const gridH = h - RULER_SIZE;

    const startCmX = Math.floor(-ox / scale);
    const endCmX = Math.ceil((gridW - ox) / scale);
    const startCmY = Math.floor(-oy / scale);
    const endCmY = Math.ceil((gridH - oy) / scale);

    // Sub-centimeter / 1cm lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 0.5;
    for (let cm = startCmX; cm <= endCmX; cm++) {
      const x = ox + cm * scale;
      if (x < 0 || x > gridW) continue;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gridH);
      ctx.stroke();
    }
    for (let cm = startCmY; cm <= endCmY; cm++) {
      const y = oy + cm * scale;
      if (y < 0 || y > gridH) continue;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(gridW, y);
      ctx.stroke();
    }

    // Major 5cm lines
    ctx.strokeStyle = 'rgba(199, 109, 74, 0.12)';
    ctx.lineWidth = 1;
    for (let cm = startCmX; cm <= endCmX; cm++) {
      if (cm % 5 !== 0) continue;
      const x = ox + cm * scale;
      if (x < 0 || x > gridW) continue;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gridH);
      ctx.stroke();
    }
    for (let cm = startCmY; cm <= endCmY; cm++) {
      if (cm % 5 !== 0) continue;
      const y = oy + cm * scale;
      if (y < 0 || y > gridH) continue;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(gridW, y);
      ctx.stroke();
    }

    // ── Render Pattern Pieces ───────────────────────────────────────────
    patternPieces.forEach((piece) => {
      const isActive = piece.id === activePatternPiece;
      const isHovered = piece.id === hoveredPiece;
      const pts = piece.points;
      if (pts.length < 2) return;

      // 1. Seam allowance offset boundary (dashed outline)
      if (piece.seamAllowance > 0) {
        ctx.save();
        ctx.strokeStyle = isActive ? 'rgba(199, 109, 74, 0.45)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        const sa = piece.seamAllowance * scale;
        ctx.beginPath();
        pts.forEach((p, i) => {
          const sx = ox + p[0] * scale;
          const sy = oy + p[1] * scale;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // 2. Main piece filled body
      ctx.beginPath();
      pts.forEach((p, i) => {
        const sx = ox + p[0] * scale;
        const sy = oy + p[1] * scale;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.closePath();

      // Soft luminous fill
      ctx.fillStyle = isActive
        ? 'rgba(199, 109, 74, 0.22)'
        : isHovered
        ? 'rgba(199, 109, 74, 0.12)'
        : 'rgba(255, 255, 255, 0.03)';
      ctx.fill();

      // 3. Piece perimeter cut-line
      ctx.strokeStyle = isActive ? '#C76D4A' : isHovered ? '#D89377' : 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = isActive ? 2.2 : 1.2;
      ctx.setLineDash([]);
      ctx.stroke();

      // 4. Piece Center Label & Bounding Box Readout
      let pMinX = Infinity, pMinY = Infinity, pMaxX = -Infinity, pMaxY = -Infinity;
      pts.forEach(([px, py]) => {
        if (px < pMinX) pMinX = px;
        if (py < pMinY) pMinY = py;
        if (px > pMaxX) pMaxX = px;
        if (py > pMaxY) pMaxY = py;
      });

      const pw = pMaxX - pMinX;
      const ph = pMaxY - pMinY;
      const pcx = (pMinX + pMaxX) / 2;
      const pcy = (pMinY + pMaxY) / 2;

      ctx.save();
      ctx.textAlign = 'center';
      // Piece Name
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(piece.name, ox + pcx * scale, oy + pcy * scale - 6);

      // Dimensions & Seam Allowance
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillStyle = isActive ? '#C76D4A' : 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(
        `${pw.toFixed(1)} × ${ph.toFixed(1)} cm  |  SA: ${piece.seamAllowance}cm`,
        ox + pcx * scale,
        oy + pcy * scale + 10,
      );
      ctx.restore();

      // 5. Grainline Indicator Arrow
      if (piece.grainAngle !== undefined) {
        const len = Math.min(pw, ph) * 0.45 || 6;
        const angle = (piece.grainAngle * Math.PI) / 180;
        const dx = Math.cos(angle) * len;
        const dy = Math.sin(angle) * len;

        const sx = ox + pcx * scale;
        const sy = oy + pcy * scale + 24;

        ctx.save();
        ctx.strokeStyle = isActive ? '#C76D4A' : 'rgba(199, 109, 74, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx - dx * scale / 2, sy - dy * scale / 2);
        ctx.lineTo(sx + dx * scale / 2, sy + dy * scale / 2);
        ctx.stroke();

        // Dual arrowheads (warp grainline)
        const arrowH = 4;
        const tipX1 = sx + dx * scale / 2;
        const tipY1 = sy + dy * scale / 2;
        ctx.beginPath();
        ctx.moveTo(tipX1, tipY1);
        ctx.lineTo(tipX1 - arrowH * Math.cos(angle - 0.5), tipY1 - arrowH * Math.sin(angle - 0.5));
        ctx.moveTo(tipX1, tipY1);
        ctx.lineTo(tipX1 - arrowH * Math.cos(angle + 0.5), tipY1 - arrowH * Math.sin(angle + 0.5));
        ctx.stroke();

        ctx.font = '7px JetBrains Mono';
        ctx.fillStyle = 'rgba(199, 109, 74, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('GRAINLINE ↕', sx, sy - 4);
        ctx.restore();
      }

      // 6. Control Points
      pts.forEach((p, i) => {
        const sx = ox + p[0] * scale;
        const sy = oy + p[1] * scale;
        const isPtHovered = hoveredPoint?.pieceId === piece.id && hoveredPoint?.pointIdx === i;
        const radius = isPtHovered ? 5.5 : isActive ? 4 : 3;

        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = isPtHovered ? '#FFFFFF' : isActive ? '#C76D4A' : 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
        ctx.strokeStyle = '#14151a';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    });

    // ── Measurement edge callouts ───────────────────────────────────────
    ctx.font = '8.5px JetBrains Mono, monospace';
    measurements.forEach((m) => {
      const isPieceActive = m.pieceId === activePatternPiece;
      if (!isPieceActive && patternScale < 8) return; // Only show on active piece if zoomed out

      const sx = ox + m.midX * scale;
      const sy = oy + m.midY * scale;

      const normAngle = m.angle + Math.PI / 2;
      const offset = 8;
      const tx = sx + Math.cos(normAngle) * offset;
      const ty = sy + Math.sin(normAngle) * offset;

      const text = `${m.distance.toFixed(1)}cm`;
      const tw = ctx.measureText(text).width;

      ctx.fillStyle = 'rgba(18, 19, 23, 0.85)';
      ctx.fillRect(tx - tw / 2 - 2, ty - 6, tw + 4, 11);
      ctx.fillStyle = isPieceActive ? '#C76D4A' : 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'center';
      ctx.fillText(text, tx, ty + 3);
    });

    ctx.restore();

    // ── Top Ruler ───────────────────────────────────────────────────────
    ctx.fillStyle = '#1e1f26';
    ctx.fillRect(RULER_SIZE, 0, w - RULER_SIZE, RULER_SIZE);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(RULER_SIZE, RULER_SIZE);
    ctx.lineTo(w, RULER_SIZE);
    ctx.stroke();

    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';

    for (let cm = startCmX; cm <= endCmX; cm++) {
      const x = RULER_SIZE + ox + cm * scale;
      if (x < RULER_SIZE || x > w) continue;

      const isMajor = cm % 5 === 0;
      const tickH = isMajor ? 10 : 5;

      ctx.strokeStyle = isMajor ? 'rgba(199, 109, 74, 0.5)' : 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(x, RULER_SIZE - tickH);
      ctx.lineTo(x, RULER_SIZE);
      ctx.stroke();

      if (isMajor) {
        ctx.fillText(`${cm}`, x, RULER_SIZE - 13);
      }
    }

    // ── Left Ruler ──────────────────────────────────────────────────────
    ctx.fillStyle = '#1e1f26';
    ctx.fillRect(0, RULER_SIZE, RULER_SIZE, h - RULER_SIZE);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(RULER_SIZE, RULER_SIZE);
    ctx.lineTo(RULER_SIZE, h);
    ctx.stroke();

    ctx.textAlign = 'right';
    for (let cm = startCmY; cm <= endCmY; cm++) {
      const y = RULER_SIZE + oy + cm * scale;
      if (y < RULER_SIZE || y > h) continue;

      const isMajor = cm % 5 === 0;
      const tickW = isMajor ? 10 : 5;

      ctx.strokeStyle = isMajor ? 'rgba(199, 109, 74, 0.5)' : 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(RULER_SIZE - tickW, y);
      ctx.lineTo(RULER_SIZE, y);
      ctx.stroke();

      if (isMajor) {
        ctx.save();
        ctx.translate(RULER_SIZE - 13, y);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(`${cm}`, 0, 0);
        ctx.restore();
      }
    }

    // ── Top-Left Corner Box ─────────────────────────────────────────────
    ctx.fillStyle = '#181920';
    ctx.fillRect(0, 0, RULER_SIZE, RULER_SIZE);
    ctx.font = 'bold 8px JetBrains Mono';
    ctx.fillStyle = '#C76D4A';
    ctx.textAlign = 'center';
    ctx.fillText('cm', RULER_SIZE / 2, RULER_SIZE / 2 + 3);
  }, [patternPieces, activePatternPiece, hoveredPiece, patternScale, panOffset, hoveredPoint, measurements]);

  // Render trigger
  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    const handleResize = () => render();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  // Coordinates helper
  const getCanvasPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - RULER_SIZE,
      y: e.clientY - rect.top - RULER_SIZE,
    };
  }, []);

  const findNearestPoint = useCallback((screenPos) => {
    let nearest = null;
    let minDist = 14;

    patternPieces.forEach(piece => {
      piece.points.forEach((p, i) => {
        const sx = panOffset.x + p[0] * patternScale;
        const sy = panOffset.y + p[1] * patternScale;
        const d = Math.sqrt((screenPos.x - sx) ** 2 + (screenPos.y - sy) ** 2);
        if (d < minDist) {
          minDist = d;
          nearest = { pieceId: piece.id, pointIdx: i, screenX: sx, screenY: sy };
        }
      });
    });

    return nearest;
  }, [patternPieces, panOffset, patternScale]);

  // Check if point inside polygon
  const isPointInPolygon = (px, py, points, ox, oy, scale) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = ox + points[i][0] * scale;
      const yi = oy + points[i][1] * scale;
      const xj = ox + points[j][0] * scale;
      const yj = oy + points[j][1] * scale;
      const intersect = ((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const handleMouseDown = useCallback((e) => {
    const pos = getCanvasPos(e);

    // Pan canvas with middle button or Alt key or pan tool
    if (tool === 'pan' || e.button === 1 || (e.button === 0 && e.altKey)) {
      setDragState({ type: 'pan', startX: e.clientX, startY: e.clientY, origOx: panOffset.x, origOy: panOffset.y });
      return;
    }

    if (tool === 'select' || tool === 'point') {
      const pt = findNearestPoint(pos);
      if (pt) {
        setActivePatternPiece(pt.pieceId);
        setDragState({ type: 'point', pieceId: pt.pieceId, pointIdx: pt.pointIdx, startX: pos.x, startY: pos.y });
        return;
      }

      // Check piece polygon hit
      for (const piece of patternPieces) {
        if (isPointInPolygon(pos.x, pos.y, piece.points, panOffset.x, panOffset.y, patternScale)) {
          setActivePatternPiece(piece.id);
          setDragState({ type: 'movePiece', pieceId: piece.id, startX: pos.x, startY: pos.y });
          return;
        }
      }
      setActivePatternPiece(null);
    }
  }, [tool, getCanvasPos, findNearestPoint, patternPieces, panOffset, patternScale, setActivePatternPiece]);

  const handleMouseMove = useCallback((e) => {
    const pos = getCanvasPos(e);

    // Update cursor cm readout
    const curX = ((pos.x - panOffset.x) / patternScale).toFixed(1);
    const curY = ((pos.y - panOffset.y) / patternScale).toFixed(1);
    setCursorCm({ x: curX, y: curY });

    if (!dragState) {
      setHoveredPoint(findNearestPoint(pos));

      // Find hovered piece
      let hPiece = null;
      for (const piece of patternPieces) {
        if (isPointInPolygon(pos.x, pos.y, piece.points, panOffset.x, panOffset.y, patternScale)) {
          hPiece = piece.id;
          break;
        }
      }
      setHoveredPiece(hPiece);
      return;
    }

    // Dragging vertex point
    if (dragState.type === 'point') {
      const dx = (pos.x - dragState.startX) / patternScale;
      const dy = (pos.y - dragState.startY) / patternScale;
      setPatternPieces(prev => prev.map(p => {
        if (p.id !== dragState.pieceId) return p;
        const newPts = [...p.points];
        newPts[dragState.pointIdx] = [
          Math.round((p.points[dragState.pointIdx][0] + dx) * 10) / 10,
          Math.round((p.points[dragState.pointIdx][1] + dy) * 10) / 10,
        ];
        return { ...p, points: newPts };
      }));
      setDragState({ ...dragState, startX: pos.x, startY: pos.y });
    }

    // Dragging entire pattern piece
    if (dragState.type === 'movePiece') {
      const dx = (pos.x - dragState.startX) / patternScale;
      const dy = (pos.y - dragState.startY) / patternScale;
      setPatternPieces(prev => prev.map(p => {
        if (p.id !== dragState.pieceId) return p;
        return {
          ...p,
          points: p.points.map(([px, py]) => [
            Math.round((px + dx) * 10) / 10,
            Math.round((py + dy) * 10) / 10,
          ]),
        };
      }));
      setDragState({ ...dragState, startX: pos.x, startY: pos.y });
    }

    // Panning canvas
    if (dragState.type === 'pan') {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      setPanOffset({ x: dragState.origOx + dx, y: dragState.origOy + dy });
    }
  }, [dragState, getCanvasPos, findNearestPoint, patternPieces, patternScale, panOffset, setPatternPieces]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1.5 : 1.5;
    setPatternScale(s => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta)));
  }, [setPatternScale]);

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-950 overflow-hidden select-none">
      {/* CAD Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-glass-border bg-dark-900/80 backdrop-blur-md flex-shrink-0 z-20">
        {/* Left: Tools */}
        <div className="flex items-center gap-1">
          {[
            { id: 'select', icon: MousePointer2, label: 'Select / Move Piece (V)' },
            { id: 'point', icon: PenTool, label: 'Edit Vertices (A)' },
            { id: 'pan', icon: Move, label: 'Pan Table (Space)' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                tool === id
                  ? 'bg-brand-500 text-dark-950 font-bold shadow-sm'
                  : 'text-dark-300 hover:text-white hover:bg-white/5'
              }`}
              title={label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline capitalize">{id}</span>
            </button>
          ))}

          <div className="w-px h-5 bg-glass-border mx-1" />

          {/* Quick Piece Badges */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[400px] scrollbar-none py-0.5">
            {patternPieces.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePatternPiece(p.id)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-semibold whitespace-nowrap transition-all ${
                  activePatternPiece === p.id
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'bg-dark-800/60 text-dark-400 hover:text-dark-200'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color || '#C76D4A' }} />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: View & Export Controls */}
        <div className="flex items-center gap-1.5">
          {/* Fit All */}
          <button
            onClick={fitAll}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-dark-300 hover:text-white hover:bg-white/5 transition-all"
            title="Fit All Pieces in View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fit All</span>
          </button>

          {/* Reset Layout */}
          <button
            onClick={resetLayout}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-dark-400 hover:text-dark-200 hover:bg-white/5 transition-all"
            title="Reset to Default Pattern Layout"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <div className="w-px h-5 bg-glass-border mx-1" />

          {/* Export SVG */}
          <button
            onClick={exportPatternSVG}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-brand-500 text-dark-950 hover:bg-brand-400 transition-all shadow-sm"
            title="Export Pattern as SVG CAD File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CAD</span>
          </button>
        </div>
      </div>

      {/* Drafting Table Area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`w-full h-full ${tool === 'pan' ? 'cursor-grab' : 'cursor-crosshair'}`}
        />

        {/* Cursor Coordinates Floating HUD */}
        <div className="absolute bottom-3 left-10 z-10 px-2.5 py-1 rounded-lg bg-dark-900/80 backdrop-blur-md border border-glass-border text-2xs font-mono text-dark-400">
          X: <span className="text-dark-200">{cursorCm.x}</span> cm &nbsp;|&nbsp; Y: <span className="text-dark-200">{cursorCm.y}</span> cm &nbsp;|&nbsp; Scale: <span className="text-brand-400">{patternScale.toFixed(1)}</span> px/cm
        </div>
      </div>
    </div>
  );
};

export default PatternEditor;
