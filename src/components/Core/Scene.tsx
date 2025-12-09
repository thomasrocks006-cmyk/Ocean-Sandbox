import { Physics, RigidBody } from '@react-three/rapier';
import { Lighting } from './Lighting';
import { GerstnerWater } from './GerstnerWater';
import { CameraController } from './CameraController';
import { WaterLevelTracker } from '../Physics/WaterLevelTracker';
import { Rock, BloodCloud, Coral } from '../Entities/Obstacles';
import { SchoolingFish } from '../Entities/SchoolingFish';
import { MarineSnow } from '../Effects/MarineSnow';
import { Bubbles } from '../Effects/Bubbles';
import { Caustics } from '../Effects/Caustics';
import { DepthFog } from '../Effects/DepthFog';
import { GodRays } from '../Effects/GodRays';
import { useStore } from '../../store/useStore';
import { useControls } from 'leva';

/**
 * Main scene setup with physics world, environment, and ground
 * Module 4: Enhanced with volumetric lighting, god rays, caustics, and depth fog
 */
export function Scene({ children }: { children?: React.ReactNode }) {
  const gravity = useStore((state) => state.gravity);
  const paused = useStore((state) => state.paused);
  
  // Module 4: Atmospheric controls
  const {
    enableFog,
    fogDensity,
    fogHeightFalloff,
    fogMaxDepth,
    enableGodRays,
    godRaysIntensity,
    godRaysSamples,
    enableCaustics,
    causticsIntensity,
    causticsSpeed,
  } = useControls('Module 4: Atmosphere', {
    // Depth Fog Controls
    enableFog: { value: true, label: 'Enable Depth Fog' },
    fogDensity: {
      value: 0.015,
      min: 0.001,
      max: 0.05,
      step: 0.001,
      label: 'Fog Density',
    },
    fogHeightFalloff: {
      value: 0.5,
      min: 0.1,
      max: 2.0,
      step: 0.1,
      label: 'Height Falloff',
    },
    fogMaxDepth: {
      value: -30,
      min: -50,
      max: -10,
      step: 1,
      label: 'Max Fog Depth',
    },
    // God Rays Controls
    enableGodRays: { value: true, label: 'Enable God Rays' },
    godRaysIntensity: {
      value: 0.7,
      min: 0,
      max: 1.5,
      step: 0.05,
      label: 'God Rays Intensity',
    },
    godRaysSamples: {
      value: 60,
      min: 30,
      max: 100,
      step: 10,
      label: 'Ray Quality',
    },
    // Caustics Controls
    enableCaustics: { value: true, label: 'Enable Caustics' },
    causticsIntensity: {
      value: 1.0,
      min: 0,
      max: 2.0,
      step: 0.1,
      label: 'Caustics Intensity',
    },
    causticsSpeed: {
      value: 0.05,
      min: 0,
      max: 0.2,
      step: 0.01,
      label: 'Caustics Speed',
    },
  });
  
  return (
    <>
      {/* Camera controls */}
      <CameraController />
      
      {/* Lighting */}
      <Lighting />
      
      {/* Module 4: God Rays (Volumetric Lighting) */}
      {enableGodRays && (
        <GodRays
          sunPosition={[50, 30, -50]}
          intensity={godRaysIntensity}
          density={0.96}
          decay={0.92}
          weight={0.4}
          exposure={0.6}
          samples={godRaysSamples}
          color="#4db8ff"
        />
      )}
      
      {/* Module 4: Depth-based Exponential Fog */}
      {enableFog && (
        <DepthFog
          color="#0a1f2e"
          density={fogDensity}
          heightFalloff={fogHeightFalloff}
          minDepth={0}
          maxDepth={fogMaxDepth}
        />
      )}
      
      {/* Physics world */}
      <Physics
        gravity={[0, gravity, 0]}
        paused={paused}
        debug={false} // Set to true to see collision shapes
      >
        {/* Dynamic water level tracker for Gerstner waves */}
        <WaterLevelTracker />
        
        {/* Ocean floor (static) */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh receiveShadow position={[0, -15, 0]}>
            <boxGeometry args={[100, 1, 100]} />
            <meshStandardMaterial
              color="#8b7355"
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
        </RigidBody>
        
        {/* Test obstacles for Module 3 */}
        <Rock position={[10, -10, -15]} size={2} id="rock-1" />
        <Rock position={[-8, -12, 10]} size={1.5} id="rock-2" />
        <Rock position={[15, -8, 5]} size={2.5} id="rock-3" />
        
        {/* Test blood cloud */}
        <BloodCloud position={[20, -5, 0]} intensity={1.0} id="blood-1" />
        
        {/* Decorative coral */}
        <Coral position={[5, -14, 8]} size={1.5} id="coral-1" />
        <Coral position={[-12, -14, -6]} size={1.2} id="coral-2" color="#ff6347" />
        
        {/* Module 5: Ecosystem & Atmosphere */}
        <SchoolingFish count={150} origin={[0, -5, 0]} range={20} />
        <MarineSnow count={3000} />
        <Bubbles count={200} range={40} />

        {/* All entities will be children */}
        {children}
      </Physics>
      
      {/* Module 4: Caustics on seafloor */}
      {enableCaustics && (
        <Caustics
          position={[0, -14.5, 0]}
          size={100}
          intensity={causticsIntensity}
          speed={causticsSpeed}
        />
      )}
      
      {/* Gerstner Wave Water Surface (non-physical, visual only) */}
      <GerstnerWater
        size={100}
        resolution={256}
        reflectionIntensity={0.6}
        refractionIntensity={0.4}
      />
      
      {/* Grid helper for reference (optional) */}
      <gridHelper args={[100, 50, '#1a4d6d', '#0d2635']} position={[0, -14.5, 0]} />
    </>
  );
}
