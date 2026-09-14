import { useState, useMemo, useEffect, useRef } from 'react';
import { useStudio } from '@/context/StudioContext';
import { MATERIAL_PRESETS } from '@/lib/utils';
import {
  Layers, Workflow, Weight, Gauge, Wind, Droplets,
  Activity, Zap, CheckCircle2, AlertTriangle, Info,
  ChevronDown, ChevronRight, Sparkles,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════════
   MaterialPreview — Material Properties Inspector & Simulation Diagnostics
   ─────────────────────────────────────────────────────────────────────────────
   Displays material presets per category with property details (weight, weave,
   stretch, drape) and real-time simulation diagnostics.
   ═══════════════════════════════════════════════════════════════════════════════ */

// Weave pattern micro-texture renderer
const WeavePreview = ({ weave, color }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 64;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#1a1b20';
    ctx.fillRect(0, 0, size, size);

    const baseColor = color || '#C76D4A';

    switch (weave) {
      case 'Plain': {
        // Checkerboard pattern
        for (let y = 0; y < size; y += 4) {
          for (let x = 0; x < size; x += 4) {
            const isOver = ((x / 4) + (y / 4)) % 2 === 0;
            ctx.fillStyle = isOver ? hexAlpha(baseColor, 0.4) : hexAlpha(baseColor, 0.15);
            ctx.fillRect(x, y, 4, 4);
          }
        }
        break;
      }
      case 'Twill': {
        // Diagonal lines
        for (let y = 0; y < size; y += 3) {
          for (let x = 0; x < size; x += 3) {
            const isOver = ((x / 3) + (y / 3)) % 3 === 0;
            ctx.fillStyle = isOver ? hexAlpha(baseColor, 0.45) : hexAlpha(baseColor, 0.12);
            ctx.fillRect(x, y, 3, 3);
          }
        }
        break;
      }
      case 'Satin': {
        // Smooth with occasional interlacing
        ctx.fillStyle = hexAlpha(baseColor, 0.3);
        ctx.fillRect(0, 0, size, size);
        for (let y = 0; y < size; y += 8) {
          for (let x = (y / 8 * 2) % 8; x < size; x += 8) {
            ctx.fillStyle = hexAlpha(baseColor, 0.5);
            ctx.fillRect(x, y, 3, 3);
          }
        }
        break;
      }
      case 'Knit': {
        // V-shaped knit pattern
        for (let y = 0; y < size; y += 6) {
          for (let x = 0; x < size; x += 4) {
            ctx.fillStyle = hexAlpha(baseColor, 0.35);
            ctx.beginPath();
            ctx.moveTo(x, y + 3);
            ctx.lineTo(x + 2, y);
            ctx.lineTo(x + 4, y + 3);
            ctx.lineTo(x + 2, y + 6);
            ctx.closePath();
            ctx.fill();
          }
        }
        break;
      }
      default: {
        // Solid surface
        ctx.fillStyle = hexAlpha(baseColor, 0.25);
        ctx.fillRect(0, 0, size, size);
        // Subtle noise
        for (let i = 0; i < 200; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          ctx.fillStyle = hexAlpha(baseColor, Math.random() * 0.15);
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }, [weave, color]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg border border-glass-border"
      style={{ width: 64, height: 64, imageRendering: 'pixelated' }}
    />
  );
};

// Stat bar component
const StatBar = ({ label, value, max = 1, unit = '', color = '#C76D4A', icon: Icon }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3 h-3 text-dark-500" />}
          <span className="text-2xs text-dark-400 font-medium">{label}</span>
        </div>
        <span className="text-2xs font-mono text-dark-300">{typeof value === 'number' ? value.toFixed(value < 10 ? 2 : 0) : value}{unit}</span>
      </div>
      <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const MaterialPreview = () => {
  const {
    category, materialPreset, setMaterialPreset,
    simulationStats, simulationRunning, simulationRef,
  } = useStudio();

  const [expandedSection, setExpandedSection] = useState('material'); // 'material' | 'diagnostics' | 'params'
  const presets = MATERIAL_PRESETS[category] || MATERIAL_PRESETS.clothing;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Category-specific labels
  const categoryLabels = {
    clothing: { title: 'Fabric Material', subtitle: 'Textile properties and simulation parameters' },
    artwork: { title: 'Substrate Material', subtitle: 'Print surface properties and mounting specs' },
    accessories: { title: 'Surface Material', subtitle: 'Case/accessory material properties' },
  };

  const labels = categoryLabels[category] || categoryLabels.clothing;

  // Convergence status
  const convergenceStatus = useMemo(() => {
    const c = simulationStats.convergence;
    if (c > 0.8) return { label: 'Converged', color: '#22c55e', icon: CheckCircle2 };
    if (c > 0.4) return { label: 'Settling', color: '#eab308', icon: Activity };
    return { label: 'Diverging', color: '#ef4444', icon: AlertTriangle };
  }, [simulationStats.convergence]);

  return (
    <div className="h-full flex flex-col text-sm overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-glass-border bg-dark-900/20">
        <Layers className="w-4 h-4 text-brand-400 animate-pulse" />
        <div>
          <span className="text-xs font-semibold text-dark-100">{labels.title}</span>
          <p className="text-2xs text-dark-500">{labels.subtitle}</p>
        </div>
      </div>

      {/* ── Material Selection ──────────────────────────────────────────── */}
      <div className="border-b border-glass-border">
        <button
          onClick={() => toggleSection('material')}
          className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-white/5 transition-colors"
        >
          <span className="text-2xs font-semibold text-dark-500 uppercase tracking-widest">Material Preset</span>
          {expandedSection === 'material'
            ? <ChevronDown className="w-3.5 h-3.5 text-dark-500" />
            : <ChevronRight className="w-3.5 h-3.5 text-dark-500" />
          }
        </button>

        {expandedSection === 'material' && (
          <div className="px-4 pb-4 space-y-2">
            {/* Preset buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setMaterialPreset(preset)}
                  className={`p-2 rounded-lg text-left transition-all duration-200 ${
                    materialPreset.id === preset.id
                      ? 'bg-brand-500/15 ring-1 ring-brand-500/30'
                      : 'bg-dark-900/40 hover:bg-white/5 border border-glass-border'
                  }`}
                >
                  <span className={`text-2xs font-bold block truncate ${
                    materialPreset.id === preset.id ? 'text-brand-400' : 'text-dark-300'
                  }`}>
                    {preset.name}
                  </span>
                  <span className="text-2xs text-dark-500 block mt-0.5">
                    {preset.weight > 0 ? `${preset.weight} ${preset.unit}` : preset.unit}
                    {preset.weave !== 'N/A' ? ` · ${preset.weave}` : ''}
                  </span>
                </button>
              ))}
            </div>

            {/* Active material detail card */}
            <div className="mt-3 p-3 rounded-xl bg-dark-900/60 border border-glass-border">
              <div className="flex items-start gap-3">
                <WeavePreview weave={materialPreset.weave} color={materialPreset.color || '#C76D4A'} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-dark-100">{materialPreset.name}</h4>
                  <p className="text-2xs text-dark-500 mt-1 leading-relaxed">{materialPreset.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-3 pt-3 border-t border-glass-border">
                {materialPreset.weight > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Weight className="w-3 h-3 text-dark-500" />
                    <span className="text-2xs text-dark-400">Weight</span>
                    <span className="text-2xs font-mono text-dark-200 ml-auto">{materialPreset.weight} {materialPreset.unit}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Workflow className="w-3 h-3 text-dark-500" />
                  <span className="text-2xs text-dark-400">Weave</span>
                  <span className="text-2xs font-mono text-dark-200 ml-auto">{materialPreset.weave}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3 h-3 text-dark-500" />
                  <span className="text-2xs text-dark-400">Stretch</span>
                  <span className="text-2xs font-mono text-dark-200 ml-auto">{materialPreset.stretch}%</span>
                </div>
                {materialPreset.threadCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-dark-500" />
                    <span className="text-2xs text-dark-400">Thread</span>
                    <span className="text-2xs font-mono text-dark-200 ml-auto">{materialPreset.threadCount}/in</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Simulation Parameters ──────────────────────────────────────── */}
      <div className="border-b border-glass-border">
        <button
          onClick={() => toggleSection('params')}
          className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-white/5 transition-colors"
        >
          <span className="text-2xs font-semibold text-dark-500 uppercase tracking-widest">Simulation Params</span>
          {expandedSection === 'params'
            ? <ChevronDown className="w-3.5 h-3.5 text-dark-500" />
            : <ChevronRight className="w-3.5 h-3.5 text-dark-500" />
          }
        </button>

        {expandedSection === 'params' && (
          <div className="px-4 pb-4 space-y-3">
            <StatBar label="Stiffness" value={materialPreset.stiffness} max={1} color="#C76D4A" icon={Gauge} />
            <StatBar label="Bending Resistance" value={materialPreset.bending} max={1} color="#8A9A7B" icon={Workflow} />
            <StatBar label="Drape Coefficient" value={materialPreset.drape} max={1} color="#D89377" icon={Droplets} />
            <StatBar label="Damping" value={materialPreset.damping} max={1} color="#B2C0A5" icon={Wind} />
            <StatBar label="Friction" value={materialPreset.friction} max={1} color="#E7B8A4" icon={Zap} />
          </div>
        )}
      </div>

      {/* ── Simulation Diagnostics ─────────────────────────────────────── */}
      <div className="border-b border-glass-border">
        <button
          onClick={() => toggleSection('diagnostics')}
          className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xs font-semibold text-dark-500 uppercase tracking-widest">Diagnostics</span>
            {simulationRunning && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-2xs text-emerald-400 font-semibold">LIVE</span>
              </span>
            )}
          </div>
          {expandedSection === 'diagnostics'
            ? <ChevronDown className="w-3.5 h-3.5 text-dark-500" />
            : <ChevronRight className="w-3.5 h-3.5 text-dark-500" />
          }
        </button>

        {expandedSection === 'diagnostics' && (
          <div className="px-4 pb-4 space-y-3">
            {/* Convergence status */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-dark-900/40 border border-glass-border">
              <convergenceStatus.icon
                className="w-4 h-4"
                style={{ color: convergenceStatus.color }}
              />
              <div className="flex-1">
                <span className="text-2xs font-bold" style={{ color: convergenceStatus.color }}>
                  {convergenceStatus.label}
                </span>
                <span className="text-2xs text-dark-500 ml-2">
                  {(simulationStats.convergence * 100).toFixed(0)}% stable
                </span>
              </div>
            </div>

            {/* Real-time metrics */}
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="FPS" value={simulationStats.fps} unit="" icon="⚡" />
              <MetricCard label="Particles" value={simulationStats.particleCount} unit="" icon="◉" />
              <MetricCard label="Constraints" value={simulationStats.constraintCount} unit="" icon="⬡" />
              <MetricCard label="Iterations" value={simulationStats.solverIterationsUsed} unit="/f" icon="↻" />
            </div>

            {/* Energy */}
            <StatBar
              label="Kinetic Energy"
              value={simulationStats.energy}
              max={100}
              color={simulationStats.energy > 50 ? '#ef4444' : simulationStats.energy > 20 ? '#eab308' : '#22c55e'}
              icon={Zap}
            />

            <StatBar
              label="Max Strain"
              value={simulationStats.maxStrain * 100}
              max={100}
              unit="%"
              color={simulationStats.maxStrain > 0.5 ? '#ef4444' : simulationStats.maxStrain > 0.2 ? '#eab308' : '#22c55e'}
              icon={Activity}
            />

            <StatBar
              label="Avg Strain"
              value={simulationStats.avgStrain * 100}
              max={50}
              unit="%"
              color="#8A9A7B"
              icon={Activity}
            />
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="p-4 mt-auto">
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-brand-500/5 border border-brand-500/10">
          <Info className="w-3.5 h-3.5 text-brand-400 mt-0.5 flex-shrink-0" />
          <p className="text-2xs text-dark-400 leading-relaxed">
            Material properties affect XPBD simulation behavior. Higher stiffness = less stretch. Higher drape = more flowing fabric.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Metric Card ───────────────────────────────────────────────────────────── */
const MetricCard = ({ label, value, unit, icon }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-dark-900/40 border border-glass-border">
    <span className="text-sm">{icon}</span>
    <div>
      <span className="text-2xs text-dark-500 block">{label}</span>
      <span className="text-xs font-mono font-bold text-dark-200">{value}{unit}</span>
    </div>
  </div>
);

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function hexAlpha(hex, alpha) {
  if (!hex || hex.length < 7) return `rgba(199, 109, 74, ${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default MaterialPreview;
