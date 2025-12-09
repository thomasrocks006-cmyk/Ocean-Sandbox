import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3 } from 'three';

interface BubblesProps {
  count?: number;
  speed?: number;
  range?: number;
}

export function Bubbles({ count = 200, speed = 1.0, range = 50 }: BubblesProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  // Initialize bubble data
  const bubbles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: new Vector3(
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range, // Start at various depths
        (Math.random() - 0.5) * range
      ),
      speed: Math.random() * 0.5 + 0.5,
      scale: Math.random() * 0.5 + 0.5,
      offset: Math.random() * Math.PI * 2,
    }));
  }, [count, range]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    bubbles.forEach((bubble, i) => {
      // Rise up
      bubble.position.y += bubble.speed * speed * delta;
      
      // Wiggle
      bubble.position.x += Math.sin(state.clock.elapsedTime + bubble.offset) * 0.01;
      bubble.position.z += Math.cos(state.clock.elapsedTime + bubble.offset) * 0.01;

      // Reset if too high (surface is roughly y=0)
      if (bubble.position.y > 0) {
        bubble.position.y = -20; // Reset to bottom
        bubble.position.x = (Math.random() - 0.5) * range;
        bubble.position.z = (Math.random() - 0.5) * range;
      }

      dummy.position.copy(bubble.position);
      dummy.scale.setScalar(bubble.scale * 0.1); // Small bubbles
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#ffffff"
        transparent
        opacity={0.4}
        roughness={0.1}
        metalness={0.1}
      />
    </instancedMesh>
  );
}
