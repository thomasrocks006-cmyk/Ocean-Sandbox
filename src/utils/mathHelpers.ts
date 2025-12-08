import { Vector3 } from 'three';

/**
 * Calculate Archimedes buoyancy force
 * F_buoyancy = ρ * V * g
 * @param density - Fluid density (kg/m³)
 * @param volume - Displaced volume (m³)
 * @param gravity - Gravity acceleration (m/s²)
 */
export function calculateBuoyancyForce(
  density: number,
  volume: number,
  gravity: number
): number {
  return density * volume * Math.abs(gravity);
}

/**
 * Calculate drag force
 * F_drag = 0.5 * ρ * v² * C_d * A
 * @param velocity - Object velocity
 * @param density - Fluid density
 * @param dragCoefficient - Drag coefficient (dimensionless)
 * @param crossSectionalArea - Cross-sectional area (m²)
 */
export function calculateDragForce(
  velocity: Vector3,
  density: number,
  dragCoefficient: number,
  crossSectionalArea: number
): Vector3 {
  const speed = velocity.length();
  if (speed === 0) return new Vector3(0, 0, 0);
  
  const dragMagnitude = 0.5 * density * speed * speed * dragCoefficient * crossSectionalArea;
  const dragDirection = velocity.clone().normalize().multiplyScalar(-1);
  
  return dragDirection.multiplyScalar(dragMagnitude);
}

/**
 * Calculate lift force (perpendicular to velocity)
 * Simplified for fish swimming
 */
export function calculateLiftForce(
  velocity: Vector3,
  density: number,
  liftCoefficient: number,
  area: number,
  upDirection: Vector3 = new Vector3(0, 1, 0)
): Vector3 {
  const speed = velocity.length();
  if (speed === 0) return new Vector3(0, 0, 0);
  
  const liftMagnitude = 0.5 * density * speed * speed * liftCoefficient * area;
  return upDirection.clone().multiplyScalar(liftMagnitude);
}

/**
 * Simple sine wave animation for fish tail
 */
export function fishTailAnimation(time: number, frequency: number, amplitude: number): number {
  return Math.sin(time * frequency) * amplitude;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}
