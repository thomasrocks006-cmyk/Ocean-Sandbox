import { Environment, Sky } from '@react-three/drei';

/**
 * Realistic lighting setup for underwater scene
 * - HDRI environment for reflections
 * - Directional light simulating sun rays penetrating water
 * - Ambient light for overall illumination
 */
export function Lighting() {
  return (
    <>
      {/* HDRI Environment for realistic reflections */}
      <Environment preset="sunset" />
      
      {/* Sun light penetrating water surface */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        color="#87CEEB" // Sky blue tint
      />
      
      {/* Ambient underwater lighting */}
      <ambientLight intensity={0.3} color="#1e4d7b" />
      
      {/* Hemisphere light for natural gradient (sky to ground) */}
      <hemisphereLight
        intensity={0.5}
        color="#87CEEB" // Sky color
        groundColor="#1a3a52" // Deep ocean color
      />
      
      {/* Fill light from below (scattered light in water) */}
      <pointLight
        position={[0, -10, 0]}
        intensity={0.2}
        color="#2c5f8d"
        distance={50}
        decay={2}
      />
    </>
  );
}
