import { useEffect, useMemo } from 'react';
import { useStudio } from '@/context/StudioContext';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown,
  Type, Square, Circle, Image, Layers, Box, Grid3X3, Scissors,
  Activity, Gauge, AlertTriangle, CheckCircle2, Zap,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════════
   Object Browser & Simulation Monitors
   ─────────────────────────────────────────────────────────────────────────────
   Enhanced LayersPanel with:
   - Hierarchical scene tree (mesh, cloth sim, pattern pieces, design layers)
   - Simulation monitors (max strain, seam gap, solver stats)
   - Quick filters by object type
   ═══════════════════════════════════════════════════════════════════════════════ */

const typeIcons = {
  'i-text': Type, text: Type, rect: Square, circle: Circle, image: Image,
  simulation: Grid3X3, mesh: Box, pattern: Scissors, design: Square,
};

const typeColors = {
  simulation: 'text-emerald-400',
  mesh: 'text-purple-400',
  pattern: 'text-brand-400',
  design: 'text-dark-400',
};

const LayersPanel = () => {
  const {
    layers, fabricRef, activeObject, setActiveObject, syncLayers,
    sceneObjects, selectedSceneObject, setSelectedSceneObject, syncSceneObjects,
    simulationStats, simulationRunning,
    category,
  } = useStudio();
  const canvas = () => fabricRef.current;

  // Sync scene objects when layers change
  useEffect(() => {
    syncSceneObjects();
  }, [layers, syncSceneObjects]);

  const selectLayer = (obj) => {
    if (!canvas() || !obj) return;
    canvas().setActiveObject(obj);
    canvas().renderAll();
    setActiveObject(obj);
  };

  const toggleVisibility = (e, obj) => {
    e.stopPropagation();
    obj.set('visible', !obj.visible);
    canvas().renderAll();
    syncLayers();
  };

  const toggleLock = (e, obj) => {
    e.stopPropagation();
    const locked = obj.lockMovementX;
    obj.set({ lockMovementX: !locked, lockMovementY: !locked, lockScalingX: !locked, lockScalingY: !locked, lockRotation: !locked });
    canvas().renderAll();
    syncLayers();
  };

  const deleteLayer = (e, obj) => {
    e.stopPropagation();
    canvas().remove(obj);
    canvas().discardActiveObject();
    canvas().renderAll();
  };

  const moveLayer = (e, obj, direction) => {
    e.stopPropagation();
    if (direction === 'up') canvas().bringForward(obj);
    else canvas().sendBackwards(obj);
    canvas().renderAll();
    syncLayers();
  };

  // Strain severity for color coding
  const strainColor = useMemo(() => {
    const s = simulationStats.maxStrain;
    if (s > 0.5) return '#ef4444';
    if (s > 0.2) return '#eab308';
    return '#22c55e';
  }, [simulationStats.maxStrain]);

  const gapColor = useMemo(() => {
    const g = simulationStats.maxSeamGap;
    if (g > 0.05) return '#ef4444';
    if (g > 0.02) return '#eab308';
    return '#22c55e';
  }, [simulationStats.maxSeamGap]);

  // Category-specific label
  const categoryLabel = {
    clothing: 'Garment Scene',
    artwork: 'Artwork Scene',
    accessories: 'Accessory Scene',
  }[category] || 'Scene';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-glass-border">
        <Layers className="w-4 h-4 text-brand-400" />
        <span className="text-xs font-semibold text-dark-100">{categoryLabel}</span>
        <span className="ml-auto text-2xs text-dark-500 font-mono">{sceneObjects.length} obj</span>
      </div>

      {/* ── Simulation Monitors ────────────────────────────────────────── */}
      <div className="px-3 py-2 border-b border-glass-border bg-dark-900/30 space-y-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Activity className="w-3 h-3 text-brand-400" />
          <span className="text-2xs font-semibold text-dark-500 uppercase tracking-widest">Simulation Monitor</span>
          {simulationRunning && (
            <span className="ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-2xs text-emerald-400 font-bold">LIVE</span>
            </span>
          )}
        </div>

        {/* Max Strain Gauge */}
        <div className="flex items-center gap-2">
          <Gauge className="w-3 h-3 flex-shrink-0" style={{ color: strainColor }} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-2xs text-dark-400">Max Strain</span>
              <span className="text-2xs font-mono font-bold" style={{ color: strainColor }}>
                {(simulationStats.maxStrain * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, simulationStats.maxStrain * 200)}%`,
                  backgroundColor: strainColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Seam Gap */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: gapColor }} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-2xs text-dark-400">Seam Gap</span>
              <span className="text-2xs font-mono font-bold" style={{ color: gapColor }}>
                {(simulationStats.maxSeamGap * 1000).toFixed(1)} mm
              </span>
            </div>
            <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, simulationStats.maxSeamGap * 2000)}%`,
                  backgroundColor: gapColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Solver Stats */}
        <div className="flex items-center gap-3 text-2xs text-dark-500">
          <span className="flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" />
            {simulationStats.solverIterationsUsed} iter
          </span>
          <span className="flex items-center gap-1">
            ⚡ {simulationStats.fps} fps
          </span>
          <span className="flex items-center gap-1">
            {simulationStats.convergence > 0.8
              ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
              : <AlertTriangle className="w-2.5 h-2.5 text-yellow-500" />
            }
            {(simulationStats.convergence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* ── Scene Object Tree ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {sceneObjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6 px-4 text-center">
            <Layers className="w-8 h-8 text-dark-600 mb-2" />
            <p className="text-xs text-dark-500">No objects yet. Add elements to the scene.</p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {/* Scene hierarchy grouping */}
            {['mesh', 'simulation', 'pattern', 'design'].map((type) => {
              const items = sceneObjects.filter(o => o.type === type);
              if (items.length === 0) return null;

              const groupLabels = {
                mesh: '3D Meshes',
                simulation: 'Physics',
                pattern: 'Pattern Pieces',
                design: 'Design Layers',
              };

              return (
                <div key={type}>
                  <div className="px-2 py-1 text-2xs font-semibold text-dark-600 uppercase tracking-wider">
                    {groupLabels[type]}
                  </div>
                  {items.map((obj, i) => {
                    const Icon = typeIcons[obj.icon] || typeIcons[obj.type] || Square;
                    const colorClass = typeColors[obj.type] || 'text-dark-400';
                    const isActive = selectedSceneObject === obj.id
                      || (obj.fabricObj && activeObject === obj.fabricObj);

                    return (
                      <div
                        key={obj.id}
                        onClick={() => {
                          setSelectedSceneObject(obj.id);
                          if (obj.fabricObj) selectLayer(obj.fabricObj);
                        }}
                        className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${
                          isActive
                            ? 'bg-brand-500/20 border border-brand-500/30'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-brand-400' : colorClass}`} />
                        <span className={`text-xs flex-1 truncate ${isActive ? 'text-dark-100' : 'text-dark-300'}`}>
                          {obj.name}
                        </span>

                        {/* Type-specific badges */}
                        {obj.type === 'simulation' && (
                          <span className="text-2xs text-dark-500 font-mono">
                            {obj.particleCount}p
                          </span>
                        )}
                        {obj.type === 'pattern' && obj.seamAllowance > 0 && (
                          <span className="text-2xs text-dark-500 font-mono">
                            SA:{obj.seamAllowance}cm
                          </span>
                        )}

                        {/* Layer actions (design objects only) */}
                        {obj.type === 'design' && obj.fabricObj && (
                          <div className="hidden group-hover:flex items-center gap-0.5">
                            <button onClick={(e) => moveLayer(e, obj.fabricObj, 'up')} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-dark-400 hover:text-dark-200" title="Move up"><ChevronUp className="w-3 h-3" /></button>
                            <button onClick={(e) => moveLayer(e, obj.fabricObj, 'down')} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-dark-400 hover:text-dark-200" title="Move down"><ChevronDown className="w-3 h-3" /></button>
                            <button onClick={(e) => toggleVisibility(e, obj.fabricObj)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-dark-400 hover:text-dark-200" title="Toggle visibility">
                              {obj.fabricObj.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            <button onClick={(e) => toggleLock(e, obj.fabricObj)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-dark-400 hover:text-dark-200" title="Lock/unlock">
                              {obj.fabricObj.lockMovementX ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            </button>
                            <button onClick={(e) => deleteLayer(e, obj.fabricObj)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 text-dark-400 hover:text-red-400" title="Delete"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LayersPanel;
