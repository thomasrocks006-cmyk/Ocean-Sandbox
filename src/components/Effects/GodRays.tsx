import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, SphereGeometry, MeshBasicMaterial, ConeGeometry } from 'three';

/**
 * God Rays (Volumetric Lighting) Effect
 * Light rays emanating from the sun through water
 * Uses simple geometry-based approach for performance
 */

interface GodRaysProps {
  sunPosition?: [number, number, number];
  intensity?: number;
  density?: number;
  decay?: number;
  weight?: number;
  exposure?: number;
  samples?: number;
  color?: string;
}

export function GodRays({
  sunPosition = [50, 30, -50],
  intensity = 0.8,
  color = '#4db8ff',
}: Partial<GodRaysProps>) {
  const groupRef = useRef<any>(null);

  // Create sun mesh (visible light source)
  const sunMesh = useMemo(() => {
    const geometry = new SphereGeometry(5, 16, 16);
    const material = new MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      fog: false,
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...sunPosition);
    return mesh;
  }, [sunPosition, color]);

  // Create light ray cones
  const lightRays = useMemo(() => {
    const rays = [];
    const numRays = 8;
    const rayLength = 120;
    const rayWidth = 8;

    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2;
      const spread = 20;
      const x = Math.cos(angle) * spread;
      const z = Math.sin(angle) * spread;

      const geometry = new ConeGeometry(rayWidth, rayLength, 4, 1, true);
      const material = new MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.08 * intensity,
        depthWrite: false,
        fog: false,
      });

      const mesh = new Mesh(geometry, material);
      mesh.rotation.x = Math.PI; // Point downward
      mesh.position.set(x, 0, z);
      
      rays.push(mesh);
    }
    return rays;
  }, [color, intensity]);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle rotation animation
      const time = state.clock.elapsedTime;
      groupRef.current.rotation.y = time * 0.02;
      
      // Subtle pulsing
      const pulse = 0.9 + Math.sin(time * 0.5) * 0.1;
      groupRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={sunPosition}>
      {/* Sun sphere */}
      <primitive object={sunMesh} />
      
      {/* Light ray cones */}
      <group ref={groupRef} position={[0, -60, 0]}>
        {lightRays.map((ray, i) => (
          <primitive key={i} object={ray} />
        ))}
      </group>
    </group>
  );
}
