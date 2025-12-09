import { useControls, button, folder } from 'leva';
import { useStore } from '../../store/useStore';

/**
 * God Mode controls for simulation parameters
 * Uses Leva for real-time tweaking
 */
export function GodModeControls() {
  const togglePause = useStore((state) => state.togglePause);
  const reset = useStore((state) => state.reset);
  
  useControls({
    'Simulation': folder({
      pause: button(() => togglePause()),
      reset: button(() => reset()),
    }),
    'Water Properties': folder({
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
        label: 'Base Water Level',
      },
    }),
    'Gerstner Waves': folder({
      waveScale: {
        value: 1.0,
        min: 0,
        max: 3,
        step: 0.1,
        label: 'Wave Scale',
      },
      waveSteepness: {
        value: 0.6,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Steepness',
      },
      waveSpeed: {
        value: 1.0,
        min: 0.1,
        max: 5,
        step: 0.1,
        label: 'Speed Multiplier',
      },
    }),
    'Swim Animation': folder({
      tailFrequency: {
        value: 2.0,
        min: 0.5,
        max: 5,
        step: 0.1,
        label: 'Tail Beat Frequency',
      },
      tailAmplitude: {
        value: 0.3,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Tail Swing Amount',
      },
      bankingAngle: {
        value: 15,
        min: 0,
        max: 45,
        step: 1,
        label: 'Banking Angle (deg)',
      },
      animationSpeed: {
        value: 1.0,
        min: 0.1,
        max: 3,
        step: 0.1,
        label: 'Overall Speed',
      },
    }),
    'Physics': folder({
      gravity: {
        value: -9.81,
        min: -20,
        max: 0,
        step: 0.1,
        label: 'Gravity (m/s²)',
      },
    }),
  });
  
  return null;
}
