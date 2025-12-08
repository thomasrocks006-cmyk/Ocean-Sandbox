import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

/**
 * Camera controller for God Mode perspective
 * Allows user to orbit, zoom, and pan around the scene
 */
export function CameraController() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set initial camera position
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return (
    <OrbitControls
      makeDefault
      maxPolarAngle={Math.PI / 2} // Prevent going below ground
      minDistance={5}
      maxDistance={100}
      enableDamping
      dampingFactor={0.05}
      target={[0, 0, 0]}
    />
  );
}
