import { Physics, RigidBody } from '@react-three/rapier';
import { Lighting } from './Lighting';
import { WaterSurface } from './WaterSurface';
import { CameraController } from './CameraController';
import { useStore } from '../../store/useStore';

/**
 * Main scene setup with physics world, environment, and ground
 */
export function Scene({ children }: { children?: React.ReactNode }) {
  const gravity = useStore((state) => state.gravity);
  const paused = useStore((state) => state.paused);
  
  return (
    <>
      {/* Camera controls */}
      <CameraController />
      
      {/* Lighting */}
      <Lighting />
      
      {/* Underwater fog for depth perception */}
      <fog attach="fog" args={['#0a2d4d', 10, 80]} />
      
      {/* Physics world */}
      <Physics
        gravity={[0, gravity, 0]}
        paused={paused}
        debug={false} // Set to true to see collision shapes
      >
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
        
        {/* Water surface visual (non-physical) */}
        <WaterSurface />
        
        {/* All entities will be children */}
        {children}
      </Physics>
      
      {/* Grid helper for reference (optional) */}
      <gridHelper args={[100, 50, '#1a4d6d', '#0d2635']} position={[0, -14.5, 0]} />
    </>
  );
}
