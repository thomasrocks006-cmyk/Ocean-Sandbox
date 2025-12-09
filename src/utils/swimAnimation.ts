import { Mesh, Euler } from 'three';

/**
 * Procedural Fish Animation System
 * Implements realistic swimming motion through vertex deformation,
 * spine bending, and banking behavior
 */

export interface SwimAnimationParams {
  swimSpeed: number; // Current forward speed (m/s)
  turnRate: number; // Current angular velocity (rad/s)
  time: number; // Current simulation time
  baseFrequency?: number; // Base tail beat frequency (Hz)
  amplitudeScale?: number; // How much the tail swings (radians)
  bankingAngle?: number; // Max banking angle during turns (radians)
  spineSegments?: number; // Number of segments for spine deformation
}

/**
 * Calculate tail beat frequency based on swimming speed
 * Faster swimming = faster tail beats (biomechanically accurate)
 * 
 * Formula: frequency = baseFrequency + (speed * speedMultiplier)
 */
export function calculateTailFrequency(
  speed: number,
  baseFrequency: number = 2.0,
  speedMultiplier: number = 0.3
): number {
  return baseFrequency + Math.abs(speed) * speedMultiplier;
}

/**
 * Calculate spine curvature along the body
 * Uses sine wave propagating from head to tail
 * 
 * @param position - Normalized position along spine (0=head, 1=tail)
 * @param time - Current time
 * @param frequency - Tail beat frequency
 * @param amplitude - Maximum bend angle
 * @returns Rotation angle at this spine position
 */
export function calculateSpineCurvature(
  position: number, // 0 to 1
  time: number,
  frequency: number,
  amplitude: number
): number {
  // Wave propagates from head to tail
  // Amplitude increases toward tail (head is stiffer)
  const localAmplitude = amplitude * position * position; // Quadratic increase
  const phase = position * Math.PI * 2; // Wave along spine
  
  return Math.sin(time * frequency * Math.PI * 2 - phase) * localAmplitude;
}

/**
 * Calculate banking angle based on turn rate
 * Fish roll into turns to reduce drag (like aircraft)
 * 
 * Formula: bank = turnRate * bankingFactor (clamped to maxAngle)
 */
export function calculateBankingAngle(
  turnRate: number,
  maxBankingAngle: number = Math.PI / 12 // 15 degrees
): number {
  const bankingFactor = 2.0;
  const bankAngle = -turnRate * bankingFactor; // Negative because turn right = bank right
  
  // Clamp to max angle
  return Math.max(-maxBankingAngle, Math.min(maxBankingAngle, bankAngle));
}

/**
 * Apply procedural swim animation to a fish mesh
 * This is the main function called every frame
 */
export function applySwimAnimation(
  mesh: Mesh | null,
  params: SwimAnimationParams
): void {
  if (!mesh) return;
  
  const {
    swimSpeed,
    turnRate,
    time,
    baseFrequency = 2.0,
    amplitudeScale = 0.3,
    bankingAngle = Math.PI / 12,
    spineSegments: _spineSegments = 5,
  } = params;
  
  // Calculate dynamic tail beat frequency based on speed
  const frequency = calculateTailFrequency(swimSpeed, baseFrequency);
  
  // Calculate spine curvature (simplified for single mesh)
  // For full spine deformation, we'd modify vertices, but rotation works well
  const tailPosition = 0.8; // Tail is at 80% along spine
  const tailRotation = calculateSpineCurvature(tailPosition, time, frequency, amplitudeScale);
  
  // Apply tail rotation
  mesh.rotation.y = tailRotation;
  
  // Calculate banking angle
  const bankAngle = calculateBankingAngle(turnRate, bankingAngle);
  
  // Apply banking (roll) rotation
  mesh.rotation.z = bankAngle;
}

/**
 * Advanced: Deform mesh vertices for multi-segment spine
 * This creates a more realistic undulating motion along the entire body
 * 
 * @param mesh - Mesh with modifiable geometry
 * @param time - Current time
 * @param frequency - Tail beat frequency
 * @param amplitude - Maximum deformation
 */
export function deformSpineVertices(
  mesh: Mesh,
  time: number,
  frequency: number,
  amplitude: number
): void {
  const geometry = mesh.geometry;
  if (!geometry.attributes.position) return;
  
  const positionAttribute = geometry.attributes.position;
  const vertexCount = positionAttribute.count;
  
  // Iterate through all vertices
  for (let i = 0; i < vertexCount; i++) {
    const x = positionAttribute.getX(i);
    const z = positionAttribute.getZ(i);
    
    // Determine position along spine (assuming Z-axis is front-to-back)
    // Normalize to 0-1 range
    const spinePosition = (z + 1.5) / 3.0; // Assuming shark is 3 units long
    
    if (spinePosition < 0 || spinePosition > 1) continue;
    
    // Calculate lateral displacement (X-axis bending)
    const curvature = calculateSpineCurvature(spinePosition, time, frequency, amplitude);
    const lateralOffset = Math.sin(curvature) * spinePosition * 0.3;
    
    // Apply deformation
    positionAttribute.setX(i, x + lateralOffset);
  }
  
  // Mark geometry as needing update
  positionAttribute.needsUpdate = true;
  geometry.computeVertexNormals();
}

/**
 * Calculate secondary motion (fins, body roll)
 * Adds subtle movements for realism
 */
export function calculateSecondaryMotion(
  time: number,
  baseFrequency: number
): {
  pectoralFinAngle: number;
  dorsalFinSway: number;
  bodyWave: number;
} {
  // Pectoral fins oscillate slightly (steering/stability)
  const pectoralFinAngle = Math.sin(time * baseFrequency * Math.PI * 1.5) * 0.1;
  
  // Dorsal fin has subtle sway
  const dorsalFinSway = Math.sin(time * baseFrequency * Math.PI * 0.8) * 0.05;
  
  // Body has slight vertical wave (not just side-to-side)
  const bodyWave = Math.sin(time * baseFrequency * Math.PI * 2.5) * 0.02;
  
  return {
    pectoralFinAngle,
    dorsalFinSway,
    bodyWave,
  };
}

/**
 * Interpolate between two rotation states (smoothing)
 * Prevents sudden animation changes
 */
export function smoothRotation(
  current: Euler,
  target: Euler,
  smoothingFactor: number = 0.1
): Euler {
  return new Euler(
    current.x + (target.x - current.x) * smoothingFactor,
    current.y + (target.y - current.y) * smoothingFactor,
    current.z + (target.z - current.z) * smoothingFactor,
    current.order
  );
}

/**
 * Get velocity magnitude from rigid body
 * Helper to extract speed from Rapier physics
 */
export function getVelocityMagnitude(velocity: { x: number; y: number; z: number }): number {
  return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
}

/**
 * Calculate turn rate from angular velocity
 * Helper to extract turn rate from Rapier physics
 */
export function getAngularVelocityY(angularVel: { x: number; y: number; z: number }): number {
  return angularVel.y;
}
