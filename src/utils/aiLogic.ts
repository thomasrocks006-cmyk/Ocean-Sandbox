import { Vector3 } from 'three';

// FSM States for Predators
export enum PredatorState {
  IDLE = 'idle',
  PATROL = 'patrol',
  INVESTIGATE = 'investigate',
  STALK = 'stalk',
  HUNT = 'hunt',
  ATTACK = 'attack',
  FLEE = 'flee',
  REST = 'rest',
}

// Boids algorithm for schooling fish
export interface BoidParams {
  separationDistance: number;
  alignmentDistance: number;
  cohesionDistance: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
}

export const defaultBoidParams: BoidParams = {
  separationDistance: 2.0,
  alignmentDistance: 5.0,
  cohesionDistance: 5.0,
  separationWeight: 1.5,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
};

/**
 * Calculate separation vector (avoid crowding neighbors)
 */
export function calculateSeparation(
  position: Vector3,
  neighbors: Vector3[],
  distance: number
): Vector3 {
  const steer = new Vector3();
  let count = 0;
  
  for (const neighbor of neighbors) {
    const diff = position.clone().sub(neighbor);
    const d = diff.length();
    
    if (d > 0 && d < distance) {
      diff.normalize().divideScalar(d);
      steer.add(diff);
      count++;
    }
  }
  
  if (count > 0) {
    steer.divideScalar(count);
  }
  
  return steer;
}

/**
 * Calculate alignment vector (steer towards average heading)
 */
export function calculateAlignment(
  velocity: Vector3,
  neighborVelocities: Vector3[]
): Vector3 {
  const sum = new Vector3();
  let count = 0;
  
  for (const neighborVel of neighborVelocities) {
    sum.add(neighborVel);
    count++;
  }
  
  if (count > 0) {
    sum.divideScalar(count);
    sum.normalize();
    return sum.sub(velocity.clone().normalize());
  }
  
  return new Vector3();
}

/**
 * Calculate cohesion vector (steer towards center of neighbors)
 */
export function calculateCohesion(
  position: Vector3,
  neighbors: Vector3[],
  distance: number
): Vector3 {
  const sum = new Vector3();
  let count = 0;
  
  for (const neighbor of neighbors) {
    const d = position.distanceTo(neighbor);
    if (d < distance) {
      sum.add(neighbor);
      count++;
    }
  }
  
  if (count > 0) {
    sum.divideScalar(count);
    return sum.sub(position);
  }
  
  return new Vector3();
}

/**
 * Apply boids algorithm
 */
export function applyBoidsAlgorithm(
  position: Vector3,
  velocity: Vector3,
  neighbors: { position: Vector3; velocity: Vector3 }[],
  params: BoidParams = defaultBoidParams
): Vector3 {
  const neighborPositions = neighbors.map(n => n.position);
  const neighborVelocities = neighbors.map(n => n.velocity);
  
  const separation = calculateSeparation(position, neighborPositions, params.separationDistance)
    .multiplyScalar(params.separationWeight);
  
  const alignment = calculateAlignment(velocity, neighborVelocities)
    .multiplyScalar(params.alignmentWeight);
  
  const cohesion = calculateCohesion(position, neighborPositions, params.cohesionDistance)
    .multiplyScalar(params.cohesionWeight);
  
  return new Vector3()
    .add(separation)
    .add(alignment)
    .add(cohesion);
}
