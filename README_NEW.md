# 🌊 Realistic Ocean Sandbox 2.0

A high-fidelity ocean simulation built with React Three Fiber, featuring realistic physics, AI behavior, and stunning visuals.

## Features

### 🎯 Core Simulation
- **Archimedes Buoyancy System**: Objects displace water and float based on density
- **Fluid Dynamics**: Realistic drag and lift forces
- **Physics-Based Movement**: Powered by Rapier (WASM physics engine)

### 🦈 Intelligent Entities
- **Predators (Sharks/Orcas)**: FSM-based AI (Idle → Patrol → Hunt → Attack)
- **Prey (Fish)**: Boids algorithm for realistic schooling behavior
- **Procedural Animation**: Sine-wave based tail movement

### 🎨 Realistic Visuals
- **PBR Materials**: Physically-based rendering for lifelike appearance
- **HDRI Lighting**: Environment maps for realistic reflections
- **Underwater Fog**: Depth perception and atmosphere
- **Animated Water Surface**: Shader-based wave simulation

### 🎮 God Mode Controls
- Real-time parameter tweaking with Leva
- Add/remove entities dynamically
- Adjust physics properties live
- Pause/resume simulation

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **3D Engine**: @react-three/fiber (Three.js)
- **Physics**: @react-three/rapier
- **State Management**: Zustand
- **UI/Debug**: Leva
- **Post-Processing**: @react-three/postprocessing

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── assets/          # Textures and GLB models
├── components/
│   ├── Core/        # WaterSurface, Lighting, CameraController, Scene
│   ├── Entities/    # Shark, Orca, Tuna, Diver (Logic + Mesh)
│   ├── Physics/     # Buoyancy hook
│   └── UI/          # HUD, GodModeControls
├── store/           # Zustand state management
└── utils/           # Math helpers, AI logic
```

## Controls

- **Orbit**: Left-click + Drag
- **Zoom**: Mouse wheel
- **Pan**: Right-click + Drag
- **Reset View**: Double-click

## Physics Parameters

All parameters can be adjusted in real-time via the Leva panel:

- **Water Density**: 1025 kg/m³ (seawater default)
- **Gravity**: -9.81 m/s²
- **Drag Coefficient**: 0.3 (streamlined) to 1.2 (bluff bodies)

## Adding New Entities

```tsx
import { Shark } from './components/Entities/Shark';

// In Scene.tsx
<Shark position={[x, y, z]} mass={200} volume={0.3} />
```

## Next Steps

1. **Replace Placeholder Models**: Load realistic GLB models for sharks, fish, etc.
2. **Implement Prey AI**: Add Tuna with boids flocking behavior
3. **Add Blood System**: Trigger predator hunting when prey is injured
4. **Raycasting Vision**: Implement line-of-sight detection for predators
5. **Particle Effects**: Bubbles, blood trails, sediment clouds
6. **Sound Design**: Underwater ambience and creature sounds

## Performance Tips

- Use `debug={true}` in Physics component to visualize collision shapes
- Reduce shadow map size if experiencing lag
- Lower water surface geometry resolution on slower devices
- Use LOD (Level of Detail) for distant entities

## License

MIT

---

**Built with ❤️ for realistic ocean simulation**
