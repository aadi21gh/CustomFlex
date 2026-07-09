import { useStudio } from '@/context/StudioContext';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown,
  Type, Square, Circle, Image, Layers,
} from 'lucide-react';

const typeIcons = { 'i-text': Type, text: Type, rect: Square, circle: Circle, image: Image };

const LayersPanel = () => {
  const { layers, fabricRef, activeObject, setActiveObject, syncLayers } = useStudio();
  const canvas = () => fabricRef.current;

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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-glass-border">
        <Layers className="w-4 h-4 text-brand-400" />
        <span className="text-xs font-semibold text-white">Layers</span>
        <span className="ml-auto text-xs text-dark-500">{layers.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6 px-4 text-center">
            <Layers className="w-8 h-8 text-dark-600 mb-2" />
            <p className="text-xs text-dark-500">No layers yet. Add shapes, text, or images to get started.</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {layers.filter(l => l.id !== '__grid__').map((layer, i) => {
              const Icon = typeIcons[layer.type] || Square;
              const isActive = activeObject && layer.obj === activeObject;

              return (
                <div
                  key={i}
                  onClick={() => selectLayer(layer.obj)}
                  className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                    isActive ? 'bg-brand-500/20 border border-brand-500/30' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-brand-400' : 'text-dark-500'}`} />
                  <span className={`text-xs flex-1 truncate ${layer.visible === false ? 'opacity-40 line-through' : ''} ${isActive ? 'text-white' : 'text-dark-300'}`}>
                    {layer.name}
                  </span>

                  {/* Layer actions */}
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button onClick={(e) => moveLayer(e, layer.obj, 'up')} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-dark-400 hover:text-white" title="Move up"><ChevronUp className="w-3 h-3" /></button>
                    <button onClick={(e) => moveLayer(e, layer.obj, 'down')} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-dark-400 hover:text-white" title="Move down"><ChevronDown className="w-3 h-3" /></button>
                    <button onClick={(e) => toggleVisibility(e, layer.obj)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-dark-400 hover:text-white" title="Toggle visibility">
                      {layer.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <button onClick={(e) => toggleLock(e, layer.obj)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-dark-400 hover:text-white" title="Lock/unlock">
                      {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </button>
                    <button onClick={(e) => deleteLayer(e, layer.obj)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 text-dark-400 hover:text-red-400" title="Delete"><Trash2 className="w-3 h-3" /></button>
                  </div>
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
