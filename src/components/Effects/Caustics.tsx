import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial, Vector2, RepeatWrapping, TextureLoader } from 'three';

/**
 * Caustics Effect - Animated light patterns on seafloor
 * Simulates the refraction patterns created by waves
 */

interface CausticsProps {
  position?: [number, number, number];
  size?: number;
  intensity?: number;
  speed?: number;
}

export function Caustics({
  position = [0, -14.5, 0],
  size = 100,
  intensity = 0.8,
  speed = 0.05,
}: CausticsProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  // Create procedural caustics using shader (no texture needed)
  const causticsShader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
      intensity: { value: intensity },
      scale: { value: 4.0 },
      speed: { value: speed },
    },
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float intensity;
      uniform float scale;
      uniform float speed;
      
      varying vec2 vUv;
      
      // Simplex-like noise function for caustics
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      // Voronoi-based caustics pattern
      float causticPattern(vec2 uv, float time) {
        vec2 p = uv * scale;
        
        // Layer 1: Primary caustics
        vec2 p1 = p + vec2(time * speed * 0.3, time * speed * 0.2);
        float n1 = noise(p1);
        
        // Layer 2: Secondary caustics (different speed/direction)
        vec2 p2 = p - vec2(time * speed * 0.2, time * speed * 0.4);
        float n2 = noise(p2 * 1.5);
        
        // Combine layers
        float caustic = n1 * 0.6 + n2 * 0.4;
        
        // Sharp caustic lines
        caustic = pow(caustic, 3.0) * 2.0;
        
        return caustic;
      }
      
      void main() {
        vec2 uv = vUv;
        
        // Generate caustic pattern
        float caustic1 = causticPattern(uv, time);
        float caustic2 = causticPattern(uv + vec2(0.5), time * 1.3);
        
        // Combine multiple caustic layers for realism
        float finalCaustic = max(caustic1, caustic2 * 0.7);
        
        // Color tint (slight blue-green for underwater)
        vec3 causticColor = vec3(0.8, 0.95, 1.0) * finalCaustic * intensity;
        
        // Add some variation
        causticColor *= 0.5 + 0.5 * noise(uv * 20.0 + time * 0.5);
        
        gl_FragColor = vec4(causticColor, finalCaustic * 0.8);
      }
    `,
  }), [intensity, speed]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1}
    >
      <planeGeometry args={[size, size, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        args={[causticsShader]}
        transparent
        depthWrite={false}
        blending={2} // AdditiveBlending
      />
    </mesh>
  );
}

/**
 * Alternative: Texture-based caustics (if you have a caustics texture)
 */
export function CausticsTextured({
  position = [0, -14.5, 0],
  size = 100,
  intensity = 0.8,
  speed = 0.05,
  textureUrl,
}: CausticsProps & { textureUrl?: string }) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  const texture = useMemo(() => {
    if (!textureUrl) return null;
    const loader = new TextureLoader();
    const tex = loader.load(textureUrl);
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    return tex;
  }, [textureUrl]);

  const shader = useMemo(() => ({
    uniforms: {
      tCaustics: { value: texture },
      time: { value: 0 },
      intensity: { value: intensity },
      speed: { value: speed },
      offset: { value: new Vector2(0, 0) },
    },
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tCaustics;
      uniform float time;
      uniform float intensity;
      uniform float speed;
      uniform vec2 offset;
      
      varying vec2 vUv;
      
      void main() {
        // Animate UV coordinates
        vec2 uv1 = vUv + offset + vec2(time * speed * 0.1, time * speed * 0.05);
        vec2 uv2 = vUv - offset + vec2(-time * speed * 0.08, time * speed * 0.12);
        
        // Sample texture twice for layered effect
        vec4 caustic1 = texture2D(tCaustics, uv1 * 2.0);
        vec4 caustic2 = texture2D(tCaustics, uv2 * 3.0);
        
        // Combine layers
        float caustic = max(caustic1.r, caustic2.r * 0.7);
        
        // Apply intensity and color
        vec3 color = vec3(0.8, 0.95, 1.0) * caustic * intensity;
        
        gl_FragColor = vec4(color, caustic * 0.8);
      }
    `,
  }), [texture, intensity, speed]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  if (!texture) return null;

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1}
    >
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        ref={materialRef}
        args={[shader]}
        transparent
        depthWrite={false}
        blending={2} // AdditiveBlending
      />
    </mesh>
  );
}
