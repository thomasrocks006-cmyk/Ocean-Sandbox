# 🌊 Ocean Sandbox 2.0

A high-fidelity ocean simulation featuring physically accurate Gerstner waves, procedurally animated marine life, and intelligent AI-driven predator behaviors.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Status](https://img.shields.io/badge/status-production--ready-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.160-blue)

---

## 🎯 Project Vision

**Ocean Sandbox is NOT an arcade game** - it's a realistic simulation where users observe emergent behaviors in a physics-driven underwater ecosystem. Think of it as a "marine life terrarium" where you play God, dropping entities into a tank and watching them interact naturally.

---

## ✨ Features

### Module 1: Gerstner Waves (Physics-Based Water)
- **Mathematically accurate** ocean wave simulation
- CPU/GPU synchronized calculations for physics interaction
- Dynamic foam generation at wave crests
- Fresnel reflections and refraction
- Depth-based color gradients
- 256×256 mesh resolution with 4 configurable wave layers

### Module 2: Procedural Animation (Living Predator)
- **Velocity-linked tail beats** - Faster swimming = faster tail
- **Spine bending** with S-curve propagation
- **Banking physics** - Sharks roll into turns (15° max)
- Quadratic amplitude increase toward tail
- 7-part articulated body (head, body, tail, fins, gills)
- Real-time parameter tuning via Leva

### Module 3: The Brain (Sensory AI)
- **Raycasting vision**: 3 forward rays for obstacle detection
- **Smell detection**: Blood sensing within 50-unit radius
- **Hunger mechanics**: 0-100 scale with desperate behavior at 80+
- **Finite State Machine**: IDLE → PATROL → HUNT → ATTACK
- **Intelligent steering**: Multi-force combination with dynamic weights
- **Attack system**: 2.5-unit range, 50 damage per strike

### Module 4: The Atmosphere (Volumetric Lighting)
- **God Rays**: Volumetric light shafts from sun with rotation/pulsing
- **Caustics**: Procedural shader-based light patterns on seafloor
- **Depth Fog**: Exponential fog that darkens with camera depth
- Real-time Leva controls for all atmospheric parameters
- No texture dependencies - fully procedural
- Optimized for 60 FPS performance

---

## 🏗️ Architecture

### Technology Stack
```
Frontend:
├── React 18 (declarative UI)
├── TypeScript 5.5.3 (type safety)
├── Vite 5.4.21 (dev server & bundler)
└── Three.js 0.160 (3D rendering)

3D & Physics:
├── @react-three/fiber 8.15.0 (React renderer for Three.js)
├── @react-three/rapier 1.2.0 (WASM-based physics engine)
├── @react-three/drei 9.95.0 (useful helpers)
└── @react-three/postprocessing 2.16.0 (effects)

State & UI:
├── Zustand 4.5.0 (global state management)
├── Leva 0.9.35 (parameter controls)
└── simplex-noise 4.0.1 (wave generation)
```

### Project Structure
```
Ocean-Sandbox/
├── src/
│   ├── utils/
│   │   ├── gerstnerWaves.ts          # Wave calculations (CPU/GPU)
│   │   ├── sensorySystems.ts         # Vision, smell, prey detection
│   │   ├── predatorFSM.ts            # Finite state machine
│   │   ├── swimAnimation.ts          # Procedural animation
│   │   ├── mathHelpers.ts            # Physics formulas
│   │   └── aiLogic.ts                # Boids, FSM states
│   ├── components/
│   │   ├── Core/
│   │   │   ├── Scene.tsx             # Main scene setup
│   │   │   ├── GerstnerWater.tsx     # Shader-based water
│   │   │   ├── Lighting.tsx          # HDRI + directional lights
│   │   │   └── CameraController.tsx  # Orbit controls
│   │   ├── Entities/
│   │   │   ├── Shark.tsx             # Intelligent predator
│   │   │   └── Obstacles.tsx         # Rocks, blood, coral, kelp
│   │   ├── Effects/
│   │   │   ├── Caustics.tsx          # Procedural caustics shader
│   │   │   ├── DepthFog.tsx          # Exponential height fog
│   │   │   └── GodRays.tsx           # Volumetric light rays
│   │   ├── Physics/
│   │   │   ├── Buoyancy.tsx          # Archimedes force
│   │   │   └── WaterLevelTracker.tsx # Wave sync
│   │   └── UI/
│   │       ├── HUD.tsx               # Simulation stats
│   │       └── GodModeControls.tsx   # Leva panel
│   ├── store/
│   │   └── useStore.ts               # Zustand global state
│   ├── App.tsx                       # Main app component
│   └── main.tsx                      # Entry point
├── docs/
│   ├── MODULE_4_THE_ATMOSPHERE.md    # Full Module 4 docs
│   ├── MODULE_3_THE_BRAIN.md         # Full Module 3 docs
│   ├── MODULE_3_SUMMARY.md           # Implementation summary
│   ├── MODULE_2_PROCEDURAL_ANIMATION.md
│   ├── GERSTNER_WAVES.md
│   └── QUICKSTART.md                 # User guide
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- Modern browser with WebGL 2.0 support

### Installation
```bash
# Clone repository
git clone <repository-url>
cd Ocean-Sandbox

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 (or next available port)
```

### Build for Production
```bash
npm run build
# Output in dist/ folder
```

---

## 🎮 Usage

### Basic Controls
- **Orbit**: Left-click + Drag
- **Zoom**: Mouse Scroll
- **Pan**: Right-click + Drag

### Leva Controls (Right Panel)
Adjust simulation parameters in real-time:
- **Simulation**: Pause, reset
- **Water Properties**: Density, level
- **Gerstner Waves**: Scale, steepness, speed, directions
- **Swim Animation**: Tail frequency, amplitude, banking
- **Module 4: Atmosphere**: 
  - Fog density, height falloff, max depth
  - God rays intensity, ray quality
  - Caustics intensity, speed
  - Toggle individual effects on/off
- **Physics**: Gravity

### HUD (Top-Left)
- Entity counts with type breakdown
- Simulation status (running/paused)
- **Shark AI State** with color coding:
  - 🔵 IDLE - Resting
  - 🟢 PATROL - Wandering (default)
  - 🟠 HUNT - Pursuing at 2x speed
  - 🔴 ATTACK - Striking at 3x speed

---

## 🧪 Testing Scenarios

### Obstacle Avoidance
Watch the shark navigate around rocks using its 3-ray vision system. The shark steers away from obstacles automatically, turning toward the clearer side when blocked.

### Blood Detection
The shark can smell blood within a 50-unit radius. When detected, it transitions to HUNT mode (orange), doubles its speed, and swims directly toward the source.

### Hunger-Driven Behavior
Hunger increases at 0.5 units/second. Above 80, the shark becomes desperate - ignoring obstacles and aggressively seeking prey.

---

## 📚 Documentation

- **[QUICKSTART.md](./docs/QUICKSTART.md)** - User guide with controls and scenarios
- **[MODULE_4_THE_ATMOSPHERE.md](./docs/MODULE_4_THE_ATMOSPHERE.md)** - Volumetric lighting technical docs
- **[MODULE_3_THE_BRAIN.md](./docs/MODULE_3_THE_BRAIN.md)** - Sensory AI technical docs
- **[MODULE_3_SUMMARY.md](./docs/MODULE_3_SUMMARY.md)** - Implementation summary
- **[MODULE_2_PROCEDURAL_ANIMATION.md](./docs/MODULE_2_PROCEDURAL_ANIMATION.md)** - Animation system
- **[GERSTNER_WAVES.md](./docs/GERSTNER_WAVES.md)** - Wave physics

---

## 🔬 Technical Highlights

### Physics Accuracy
- Archimedes buoyancy: `F = ρ * V * g`
- Quadratic drag: `F_drag = 0.5 * ρ * v² * C_d * A`
- Gerstner wave displacement: `Σ(Q_i * A_i * D_i * sin(w_i * t + φ_i))`

### Performance
- **60 FPS** target with 1 shark, 5 obstacles
- 3 raycasts × 60 FPS = 180 checks/second
- WASM-based Rapier physics for efficiency
- Optimized shader calculations

### Code Quality
- ✅ TypeScript strict mode
- ✅ Zero compile errors
- ✅ Comprehensive JSDoc comments
- ✅ Modular architecture
- ✅ Clean separation of concerns

---

## 🛠️ Development

### Project Commands
```bash
npm run dev       # Start dev server with HMR
npm run build     # TypeScript compile + Vite build
npm run preview   # Preview production build
npm run lint      # Run ESLint (if configured)
```

### Adding New Entities
1. Create component in `src/components/Entities/`
2. Add entity type to `useStore.ts`
3. Register in scene with `addEntity()`
4. Implement physics with `<RigidBody>`

### Modifying AI Behavior
Edit `src/utils/predatorFSM.ts`:
- Add new states to `PredatorState` enum
- Implement transition functions
- Define state-specific behaviors
- Update switch statements in `updateFSM()`

---

## 🎯 Roadmap

### Immediate (v2.1)
- [ ] Schooling fish entities (prey)
- [ ] Hunger bar in HUD
- [ ] Debug visualization (vision rays)
- [ ] Multiple shark spawning

### Near-term (v2.2)
- [ ] Prey fleeing behavior
- [ ] Blood spawning on prey death
- [ ] Stamina system (burst speed costs)
- [ ] Memory system (remember last prey position)

### Long-term (v3.0)
- [ ] Multiple species (orca, dolphins)
- [ ] Territorial behaviors
- [ ] Day/night cycle
- [ ] Ocean currents
- [ ] Predator vs predator interactions

---

## 🐛 Known Limitations

1. **Raycasting** uses Three.js (visual), not Rapier (physics) - works for obstacles but not all colliders
2. **Prey entities** framework complete but fish not yet implemented
3. **Hunger display** internal only, not shown in HUD
4. **Debug visualization** helpers exist but not rendered

---

## 🤝 Contributing

This is a simulation sandbox - contributions welcome!

### Areas for Contribution
- New marine species
- Additional environmental obstacles
- Enhanced AI behaviors
- Performance optimizations
- Documentation improvements

### Development Setup
1. Fork repository
2. Create feature branch
3. Make changes with clear commits
4. Update documentation
5. Test thoroughly
6. Submit pull request

---

## 📄 License

MIT License (if applicable) - See LICENSE file

---

## 🙏 Acknowledgments

### Technologies
- **Three.js** - 3D rendering foundation
- **Rapier** - Rust-based physics engine
- **React Three Fiber** - Declarative Three.js
- **Zustand** - Lightweight state management

### Inspiration
- Real-world marine biology
- Gerstner wave mathematics (1802)
- Boids algorithm (Craig Reynolds, 1986)
- Steering behaviors (Craig Reynolds, 1999)

---

## 📞 Contact & Support

**Issues**: Use GitHub Issues for bug reports  
**Questions**: Check documentation files first  
**Development**: All code is well-commented and modular  

---

## 🎉 Credits

**Ocean Sandbox 2.0** - A realistic marine simulation showcasing the intersection of physics, biology, and AI in an interactive 3D environment.

**Version**: 2.0.0  
**Status**: Production-ready  
**Created**: January 2025  
**Modules**: 3 (Waves + Animation + AI)  

---

*Dive into the world of intelligent marine predators in a physically accurate ocean ecosystem.*

🌊 **Happy Simulating!** 🦈
