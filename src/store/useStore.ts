import { create } from 'zustand';
import { Vector3 } from 'three';

export interface Entity {
  id: string;
  type: 'shark' | 'orca' | 'tuna' | 'diver';
  position: Vector3;
  velocity: Vector3;
  health: number;
  state?: string;
}

interface SimulationState {
  entities: Map<string, Entity>;
  waterLevel: number;
  waterDensity: number;
  gravity: number;
  paused: boolean;
  godMode: boolean;
  
  // Actions
  addEntity: (entity: Entity) => void;
  removeEntity: (id: string) => void;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  togglePause: () => void;
  toggleGodMode: () => void;
  reset: () => void;
}

export const useStore = create<SimulationState>((set) => ({
  entities: new Map(),
  waterLevel: 0,
  waterDensity: 1025, // kg/m³ (seawater)
  gravity: -9.81,
  paused: false,
  godMode: true,
  
  addEntity: (entity) => set((state) => {
    const newEntities = new Map(state.entities);
    newEntities.set(entity.id, entity);
    return { entities: newEntities };
  }),
  
  removeEntity: (id) => set((state) => {
    const newEntities = new Map(state.entities);
    newEntities.delete(id);
    return { entities: newEntities };
  }),
  
  updateEntity: (id, updates) => set((state) => {
    const newEntities = new Map(state.entities);
    const entity = newEntities.get(id);
    if (entity) {
      newEntities.set(id, { ...entity, ...updates });
    }
    return { entities: newEntities };
  }),
  
  togglePause: () => set((state) => ({ paused: !state.paused })),
  
  toggleGodMode: () => set((state) => ({ godMode: !state.godMode })),
  
  reset: () => set({
    entities: new Map(),
    paused: false,
  }),
}));
