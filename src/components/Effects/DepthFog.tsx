import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { FogExp2, Color } from 'three';

/**
 * Exponential Height Fog - Depth-based fog system
 * The deeper the camera, the denser and darker the fog
 */

interface DepthFogProps {
  color?: string;
  density?: number;
  heightFalloff?: number;
  minDepth?: number;
  maxDepth?: number;
}

export function DepthFog({
  color = '#0a1f2e',
  density = 0.015,
  heightFalloff = 0.5,
  minDepth = 0,
  maxDepth = -30,
}: DepthFogProps) {
  const { scene, camera } = useThree();

  useEffect(() => {
    // Set initial exponential fog
    scene.fog = new FogExp2(color, density);

    // Custom fog update based on camera height
    const updateFog = () => {
      if (!scene.fog) return;

      const cameraY = camera.position.y;
      
      // Calculate depth factor (0 at surface, 1 at maxDepth)
      const depthFactor = Math.max(0, Math.min(1, (minDepth - cameraY) / (minDepth - maxDepth)));
      
      // Exponential falloff based on depth
      const fogDensity = density + (depthFactor * heightFalloff * density);
      
      // Adjust fog color darkness based on depth
      const surfaceColor = new Color(color);
      const deepColor = new Color('#000510'); // Very dark blue-black at depth
      const currentColor = surfaceColor.clone().lerp(deepColor, depthFactor * 0.7);
      
      // Update fog
      if (scene.fog instanceof FogExp2) {
        scene.fog.density = fogDensity;
        scene.fog.color = currentColor;
      }
    };

    // Update fog on camera movement
    const interval = setInterval(updateFog, 100);
    updateFog();

    return () => {
      clearInterval(interval);
      scene.fog = null;
    };
  }, [scene, camera, color, density, heightFalloff, minDepth, maxDepth]);

  return null;
}

/**
 * Simple animated fog (legacy, for comparison)
 */
export function AnimatedFog({ color = '#0a2d4d' }: { color?: string }) {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new FogExp2(color, 0.015);
    return () => {
      scene.fog = null;
    };
  }, [scene, color]);

  return null;
}
