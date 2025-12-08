import { useControls, button } from 'leva';
import { useStore } from '../../store/useStore';

/**
 * God Mode controls for simulation parameters
 * Uses Leva for real-time tweaking
 */
export function GodModeControls() {
  const togglePause = useStore((state) => state.togglePause);
  const reset = useStore((state) => state.reset);
  const paused = useStore((state) => state.paused);
  
  useControls({
    'Simulation': {
      pause: button(() => togglePause()),
      reset: button(() => reset()),
    },
    'Water Properties': {
      waterDensity: {
        value: 1025,
        min: 800,
        max: 1200,
        step: 1,
        label: 'Density (kg/m³)',
      },
      waterLevel: {
        value: 0,
        min: -10,
        max: 10,
        step: 0.1,
        label: 'Water Level',
      },
    },
    'Physics': {
      gravity: {
        value: -9.81,
        min: -20,
        max: 0,
        step: 0.1,
        label: 'Gravity (m/s²)',
      },
    },
  });
  
  return null;
}
