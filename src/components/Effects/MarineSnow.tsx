import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, AdditiveBlending } from 'three';

interface MarineSnowProps {
  count?: number;
  color?: string;
  opacity?: number;
  speed?: number;
}

export function MarineSnow({ 
  count = 2000, 
  color = '#ffffff', 
  opacity = 0.6,
  speed = 0.2 
}: MarineSnowProps) {
  const points = useRef<Points>(null);

  // Generate random particles
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 100; // x
      temp[i * 3 + 1] = (Math.random() - 0.5) * 60 - 10; // y (mostly underwater)
      temp[i * 3 + 2] = (Math.random() - 0.5) * 100; // z
    }
    return temp;
  }, [count]);

  useFrame((_state, delta) => {
    if (!points.current) return;

    // Subtle drift movement
    points.current.rotation.y += delta * 0.02 * speed;
    points.current.position.y -= delta * 0.5 * speed;

    // Reset height to create infinite loop effect
    if (points.current.position.y < -10) {
      points.current.position.y = 0;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={color}
        transparent
        opacity={opacity}
        blending={AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}
