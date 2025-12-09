import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial, Color } from 'three';

/**
 * Animated water surface using vertex shader displacement
 * Simulates waves using Perlin/Simplex noise
 */
export function WaterSurface() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });
  
  // Custom shader for realistic water surface
  const vertexShader = `
    uniform float time;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    // Simple wave function
    vec3 wave(vec3 pos) {
      float k1 = 0.5;
      float k2 = 0.3;
      float speed1 = 0.8;
      float speed2 = 1.2;
      
      pos.y += sin(pos.x * k1 + time * speed1) * 0.3;
      pos.y += sin(pos.z * k2 + time * speed2) * 0.2;
      pos.y += cos(pos.x * 0.4 + pos.z * 0.4 + time * 0.5) * 0.15;
      
      return pos;
    }
    
    void main() {
      vPosition = position;
      vec3 displaced = wave(position);
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `;
  
  const fragmentShader = `
    uniform float time;
    uniform vec3 waterColor;
    uniform vec3 deepWaterColor;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      // Gradient from surface to depth
      float depth = -vPosition.y * 0.1;
      vec3 color = mix(waterColor, deepWaterColor, depth);
      
      // Add some shimmer
      float shimmer = sin(vPosition.x * 10.0 + time * 2.0) * 0.05;
      color += shimmer;
      
      // Transparency
      gl_FragColor = vec4(color, 0.7);
    }
  `;
  
  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[100, 100, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          time: { value: 0 },
          waterColor: { value: new Color('#1ca3ec') },
          deepWaterColor: { value: new Color('#0a4d68') },
        }}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
