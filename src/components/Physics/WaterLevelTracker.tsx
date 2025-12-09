import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import { getWaveHeight } from '../../utils/gerstnerWaves';

/**
 * Dynamic Water Level Tracker
 * Updates the global water level based on Gerstner wave calculations
 * This allows physics objects to interact with the dynamic wave surface
 */
export function WaterLevelTracker() {
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Sample multiple points and average for a stable water level
    // In a full implementation, this would be per-object for precise buoyancy
    const samples = [
      getWaveHeight(0, 0, time),
      getWaveHeight(5, 5, time),
      getWaveHeight(-5, 5, time),
      getWaveHeight(5, -5, time),
      getWaveHeight(-5, -5, time),
    ];
    
    const averageHeight = samples.reduce((a, b) => a + b, 0) / samples.length;
    
    // Update store with current wave height
    // Note: In production, each object should sample its own position
    useStore.setState({ waterLevel: averageHeight });
  });
  
  return null;
}
