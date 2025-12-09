import { useRef } from 'react';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';

interface RockProps {
  position: [number, number, number];
  size?: number;
  id: string;
}

/**
 * Rock obstacle - static object for sharks to avoid
 */
export function Rock({ position, size = 1, id }: RockProps) {
  const _rockRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<any>(null);
  
  // Random variation in shape
  const scaleX = 0.8 + Math.random() * 0.4;
  
  const rotation: [number, number, number] = [
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  ];
  
  return (
    <RigidBody
      ref={_rockRef}
      position={position}
      type="fixed"
      colliders="hull"
      userData={{ type: 'rock', id }}
      name={id} // Add name for raycasting
    >
      <group rotation={rotation}>
        <mesh ref={meshRef} castShadow receiveShadow>
          <dodecahedronGeometry args={[size * scaleX, 1]} />
          <meshStandardMaterial
            color="#555555"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        
        {/* Add some detail with smaller rocks */}
        <mesh position={[size * 0.3, size * 0.2, 0]} castShadow>
          <dodecahedronGeometry args={[size * 0.3, 0]} />
          <meshStandardMaterial
            color="#666666"
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
        
        <mesh position={[-size * 0.2, -size * 0.1, size * 0.2]} castShadow>
          <dodecahedronGeometry args={[size * 0.25, 0]} />
          <meshStandardMaterial
            color="#444444"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}

interface BloodCloudProps {
  position: [number, number, number];
  intensity?: number;
  id: string;
}

/**
 * Blood cloud - attracts sharks via smell
 */
export function BloodCloud({ position, intensity = 1.0, id }: BloodCloudProps) {
  const meshRef = useRef<any>(null);
  const time = useRef(0);
  
  useFrame((_state, delta) => {
    time.current += delta;
    
    if (meshRef.current) {
      // Pulsate
      const pulse = 1.0 + Math.sin(time.current * 2) * 0.2;
      meshRef.current.scale.set(pulse, pulse, pulse);
      
      // Slow rotation
      meshRef.current.rotation.y += delta * 0.5;
      
      // Fade opacity over time
      const age = time.current;
      const maxAge = 30; // 30 seconds lifetime
      const opacity = Math.max(0, 1.0 - age / maxAge) * intensity;
      meshRef.current.material.opacity = opacity;
    }
  });
  
  return (
    <group position={position} userData={{ type: 'blood', id, intensity }}>
      {/* Main cloud */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial
          color="#8b0000"
          transparent
          opacity={0.4 * intensity}
          depthWrite={false}
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshBasicMaterial
          color="#ff0000"
          transparent
          opacity={0.6 * intensity}
          depthWrite={false}
        />
      </mesh>
      
      {/* Particles (simulated with small spheres) */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 1.2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * 0.5;
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial
              color="#aa0000"
              transparent
              opacity={0.5 * intensity}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

interface CoralProps {
  position: [number, number, number];
  size?: number;
  id: string;
  color?: string;
}

/**
 * Coral decoration - adds visual interest
 */
export function Coral({ position, size = 1, id, color = '#ff7f50' }: CoralProps) {
  const meshRef = useRef<any>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      // Gentle sway
      meshRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });
  
  return (
    <RigidBody
      position={position}
      type="fixed"
      colliders="hull"
      userData={{ type: 'coral', id }}
      name={id}
    >
      <group ref={meshRef}>
        {/* Main trunk */}
        <mesh position={[0, size * 0.5, 0]} castShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.15, size, 6]} />
          <meshStandardMaterial
            color={color}
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
        
        {/* Branches */}
        {[...Array(5)].map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          const radius = size * 0.3;
          const height = size * 0.7 + Math.random() * size * 0.3;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <mesh
              key={i}
              position={[x, height, z]}
              rotation={[0, angle, Math.PI / 6]}
              castShadow
            >
              <cylinderGeometry args={[size * 0.05, size * 0.08, size * 0.5, 4]} />
              <meshStandardMaterial
                color={color}
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>
          );
        })}
      </group>
    </RigidBody>
  );
}

/**
 * Kelp/Seaweed - tall swaying plants
 */
export function Kelp({ position, size = 1, id }: Omit<CoralProps, 'color'>) {
  const meshRef = useRef<any>(null);
  const time = useRef(Math.random() * 100);
  
  useFrame((_state, delta) => {
    time.current += delta;
    
    if (meshRef.current) {
      // Wave motion
      meshRef.current.rotation.z = Math.sin(time.current * 0.8) * 0.3;
      meshRef.current.rotation.x = Math.cos(time.current * 0.6) * 0.2;
    }
  });
  
  return (
    <RigidBody
      position={position}
      type="fixed"
      colliders="hull"
      userData={{ type: 'kelp', id }}
      name={id}
    >
      <group ref={meshRef}>
        {/* Multiple segments for realistic sway */}
        {[...Array(8)].map((_, i) => {
          const segmentHeight = size * 0.6;
          const y = i * segmentHeight * 0.25;
          const width = size * 0.15 * (1 - i * 0.1);
          
          return (
            <mesh key={i} position={[0, y, 0]} castShadow>
              <cylinderGeometry args={[width, width * 1.1, segmentHeight, 8]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#2d5016' : '#3a6b1f'}
                roughness={0.9}
                metalness={0.0}
              />
            </mesh>
          );
        })}
        
        {/* Top bulb */}
        <mesh position={[0, size * 1.2, 0]} castShadow>
          <sphereGeometry args={[size * 0.2, 8, 8]} />
          <meshStandardMaterial
            color="#4a7c2f"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}
