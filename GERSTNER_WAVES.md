# 🌊 Gerstner Wave Water System - Technical Documentation

## Overview
The Gerstner Wave system replaces the simple sine-wave water with a physically accurate wave simulation that synchronizes between GPU (visual) and CPU (physics) calculations.

## What Changed

### ❌ Removed
- `WaterSurface.tsx` - Simple sine wave shader (static)

### ✅ Added
1. **`gerstnerWaves.ts`** - Core wave mathematics
2. **`GerstnerWater.tsx`** - Advanced shader-based water surface
3. **`WaterLevelTracker.tsx`** - Physics synchronization component
4. Updated **`Buoyancy.tsx`** - Dynamic wave sampling
5. Updated **`Scene.tsx`** - New water system integration

## Gerstner Wave Theory

### Mathematical Formula
```
x' = x - Q * A * D.x * sin(ω * (D·P) - φ * t)
y' = A * cos(ω * (D·P) - φ * t)
z' = z - Q * A * D.z * sin(ω * (D·P) - φ * t)
```

Where:
- **ω (omega)** = 2π / λ (wave frequency from wavelength)
- **φ (phi)** = speed * ω (phase constant)
- **D** = direction vector (normalized 2D)
- **P** = point position (x, z)
- **Q** = steepness (0-1, controls wave sharpness)
- **A** = amplitude (wave height)
- **λ (lambda)** = wavelength (distance between crests)

### Why Gerstner Waves?
- **Trochoidal Shape**: Realistic peaked crests and flat troughs
- **Horizontal Displacement**: Particles move in circles, not just up/down
- **Summable**: Multiple waves combine naturally
- **Physics-Matchable**: Can be calculated on CPU for exact physics sync

## Implementation Details

### 1. CPU-Side Wave Calculation (`gerstnerWaves.ts`)

```typescript
getWaveHeight(x: number, z: number, time: number): number
```
- Returns Y displacement at any world position
- Used by physics engine for buoyancy calculations
- **MUST** match GPU shader exactly

```typescript
getWaveDisplacement(x, z, time): {x, y, z}
```
- Returns full 3D displacement
- Used for precise object positioning on surface

```typescript
getWaveNormal(x, z, time): {x, y, z}
```
- Calculates surface normal for lighting/forces
- Useful for boat tilting, splash angles

### 2. GPU Shader (`GerstnerWater.tsx`)

**Vertex Shader:**
- Displaces each vertex using Gerstner formula
- Generates GLSL code dynamically from wave parameters
- Calculates normals for lighting

**Fragment Shader:**
- **Fresnel Effect**: Reflections stronger at grazing angles
- **Depth-Based Coloring**: Darker water in deep areas
- **Foam Generation**: Appears at wave crests and steep normals
- **Specular Highlights**: Sun reflections
- **Refraction Distortion**: Underwater objects appear distorted

### 3. Physics Synchronization

**Problem:** GPU and CPU need identical wave calculations
**Solution:**
- `generateGerstnerWaveGLSL()` creates shader code from TypeScript config
- Same `defaultWaves` array used by both
- `WaterLevelTracker` samples waves every frame

**Dynamic Buoyancy:**
```typescript
useBuoyancy({
  useDynamicWaves: true  // Enable per-frame wave sampling
})
```
- Each object samples wave height at its position
- Buoyancy force updates in real-time with waves
- Objects ride waves naturally

## Wave Configuration

### Default Wave Setup (4 waves)
```typescript
defaultWaves = [
  { wavelength: 8.0,  amplitude: 0.4, steepness: 0.6, speed: 2.0, direction: [1, 0] },
  { wavelength: 6.0,  amplitude: 0.3, steepness: 0.5, speed: 1.8, direction: [0.7, 0.7] },
  { wavelength: 4.0,  amplitude: 0.2, steepness: 0.4, speed: 1.5, direction: [-0.5, 0.866] },
  { wavelength: 2.0,  amplitude: 0.1, steepness: 0.3, speed: 1.0, direction: [0.866, -0.5] },
]
```

### Wave Parameters Guide

| Parameter | Range | Effect |
|-----------|-------|--------|
| **wavelength** | 1-20m | Distance between crests (larger = slower rolling) |
| **amplitude** | 0.1-2m | Wave height (half of peak-to-trough) |
| **steepness** | 0-1 | 0=sine wave, 1=breaking wave (0.6 recommended) |
| **speed** | 0.5-5 m/s | Phase velocity (how fast crests move) |
| **direction** | [-1,1] | Normalized 2D vector (e.g., [1,0] = positive X) |

### Tuning Tips
- **Calmer Sea**: Reduce amplitude, lower steepness to 0.3-0.4
- **Stormy Sea**: Increase amplitude (1-2m), steepness to 0.7-0.8
- **Multi-Directional**: Use opposing directions for choppy water
- **Performance**: Fewer waves = faster (2-4 waves ideal)

## Visual Features

### 1. Foam System
- Appears at wave **crests** (high Y values)
- Intensifies with **steep normals** (breaking waves)
- Animated with noise patterns
- Blends using `mix(waterColor, foamColor, foam)`

### 2. Fresnel Reflections
```glsl
fresnel = pow(1 - dot(viewDir, normal), 3.0)
```
- Water more reflective at shallow viewing angles
- See sky reflections when looking across surface
- See through water when looking straight down

### 3. Depth-Based Coloring
```glsl
color = mix(waterColor, deepWaterColor, depthFactor)
```
- Bright blue at surface
- Dark blue in deep areas
- Enhances depth perception

### 4. Refraction (Planned Enhancement)
Currently simplified - full implementation would:
- Render underwater scene to texture
- Distort UV coordinates based on normals
- Sample distorted texture for refracted view

## Performance Considerations

### Resolution vs Quality
```typescript
<GerstnerWater
  resolution={128}  // Low (fast)
  resolution={256}  // Medium (balanced) ✓ Default
  resolution={512}  // High (detailed but slower)
/>
```

### Wave Count Impact
- 2 waves: Very fast, simple patterns
- 4 waves: Balanced, complex enough ✓ Default
- 6+ waves: Rich detail, GPU intensive

### Optimization Techniques
1. **LOD (Level of Detail)**: Use lower resolution at distance
2. **Frustum Culling**: Don't render off-screen water
3. **Wave Simplification**: Reduce waves far from camera
4. **Update Rate**: Sample physics at 30Hz, render at 60Hz

## Usage Examples

### Basic Water Surface
```typescript
<GerstnerWater />
```

### Customized Appearance
```typescript
<GerstnerWater
  size={200}
  resolution={512}
  waterColor="#1ca3ec"
  deepWaterColor="#0a4d68"
  foamColor="#ffffff"
  reflectionIntensity={0.8}
  refractionIntensity={0.5}
/>
```

### Physics-Synced Object
```typescript
const Boat = () => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  
  useBuoyancy({
    rigidBody: rigidBodyRef,
    volume: 2.0,
    mass: 500,
    useDynamicWaves: true  // Rides the waves!
  });
  
  return <RigidBody ref={rigidBodyRef}>...</RigidBody>;
};
```

### Custom Wave Configuration
```typescript
// In gerstnerWaves.ts
export const stormyWaves: GerstnerWave[] = [
  { wavelength: 12, amplitude: 1.5, steepness: 0.8, speed: 3, direction: [1, 0] },
  { wavelength: 8, amplitude: 1.0, steepness: 0.7, speed: 2.5, direction: [0, 1] },
  { wavelength: 5, amplitude: 0.8, steepness: 0.6, speed: 2, direction: [-0.7, 0.7] },
];
```

## Testing the System

### Visual Checks
1. **Wave Motion**: Crests should travel in specified directions
2. **Foam**: Should appear on peaked crests
3. **Reflections**: Sky visible at shallow angles
4. **Depth**: Color darkens with distance underwater

### Physics Checks
1. **Buoyancy**: Shark should rise/fall with waves
2. **Stability**: No jittering or teleporting
3. **Sync**: Visual and physical heights match
4. **Performance**: Maintains 60 FPS with 1-2 entities

### Debug Mode
```typescript
// Enable physics debug visualization
<Physics debug={true}>
```

## Known Limitations

1. **No Wave Obstacles**: Waves don't reflect off terrain
2. **Simplified Reflection**: Uses approximation, not true render target
3. **No Breaking Waves**: Steepness >0.85 unrealistic
4. **Uniform Density**: Assumes all water same density
5. **No Currents**: Waves don't create flow

## Future Enhancements

1. **FFT Ocean**: Inverse FFT for realistic ocean spectrum
2. **Shore Interaction**: Waves break on beaches
3. **Particle Spray**: Water droplets from crests
4. **Subsurface Scattering**: Light through water
5. **Caustics**: Underwater light patterns
6. **Dynamic Weather**: Wind affects wave parameters

## References

- [GPU Gems: Effective Water Simulation](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models)
- [Gerstner Wave Theory](https://en.wikipedia.org/wiki/Trochoidal_wave)
- [Real-Time Rendering of Water Waves](http://www.dgp.toronto.edu/~stam/reality/Research/pdf/sig2000.pdf)

---

**Status**: ✅ Module 1 Complete - High-End Water with Gerstner Waves
