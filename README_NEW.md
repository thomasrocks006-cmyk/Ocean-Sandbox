# 🌊 Realistic Ocean Sandbox 2.0

A high-fidelity ocean simulation built with React Three Fiber, featuring **Gerstner Wave physics**, **procedural creature animation**, realistic buoyancy, AI behavior, and stunning visuals.

## 🆕 Latest Updates
- **Module 2 Complete!** 🦈 **Procedural Animation System** - Living predators with spine bending, velocity-linked tail beats, and banking physics. [See details →](MODULE_2_PROCEDURAL_ANIMATION.md)
- **Module 1 Complete!** 🌊 **Gerstner Wave Water** - Physically accurate waves with GPU/CPU synchronization. [See details →](GERSTNER_WAVES.md)

## Features

### 🎯 Core Simulation
- **Archimedes Buoyancy System**: Objects displace water and float based on density
- **Dynamic Wave Interaction**: Entities respond to Gerstner wave motion in real-time
- **Fluid Dynamics**: Realistic drag and lift forces
- **Physics-Based Movement**: Powered by Rapier (WASM physics engine)
- **CPU/GPU Synchronization**: Wave calculations match perfectly between visual and physical

### 🦈 Intelligent Entities
- **Predators (Sharks/Orcas)**: 
  - FSM-based AI (Idle → Patrol → Hunt → Attack)
  - **Procedural swim animation** with spine bending
  - **Velocity-linked tail beats** (faster swimming = faster tail)
  - **Banking physics** (roll into turns like real fish)
  - Dynamic buoyancy interaction with waves
- **Prey (Fish)**: Boids algorithm for realistic schooling behavior
- **Procedural Animation**: Real-time spine deformation and secondary motion

### 🎨 Realistic Visuals
- **PBR Materials**: Physically-based rendering for lifelike appearance
- **HDRI Lighting**: Environment maps for realistic reflections
- **Underwater Fog**: Depth perception and atmosphere
- **Gerstner Wave Water**: Physically accurate wave simulation with:
  - Trochoidal wave shapes (peaked crests, flat troughs)
  - Multi-directional wave patterns
  - Dynamic foam generation
  - Fresnel reflections
  - Refraction distortion
  - Real-time configurability

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
# Open http://localhost:5173/
```

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🌊 Water System Details

### Gerstner Waves
The simulation uses **Gerstner (trochoidal) waves** for realistic ocean motion:

```typescript
// Configure 4 waves with different properties
defaultWaves = [
  { wavelength: 8.0, amplitude: 0.4, steepness: 0.6, speed: 2.0, direction: [1, 0] },
  { wavelength: 6.0, amplitude: 0.3, steepness: 0.5, speed: 1.8, direction: [0.7, 0.7] },
  { wavelength: 4.0, amplitude: 0.2, steepness: 0.4, speed: 1.5, direction: [-0.5, 0.866] },
  { wavelength: 2.0, amplitude: 0.1, steepness: 0.3, speed: 1.0, direction: [0.866, -0.5] },
]
```

**Features:**
- Real-time vertex displacement on 256×256 grid
- Perfect physics synchronization via `getWaveHeight(x, z, time)`
- Dynamic foam at wave crests
- Fresnel reflections (angle-dependent)
- Depth-based color gradients

**Read more:** [GERSTNER_WAVES.md](GERSTNER_WAVES.md)

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
