import { Vector3, Raycaster, Object3D } from 'three';

/**
 * Sensory System for Predator AI
 * Implements vision (raycasting), smell (distance), and hearing (vibration)
 */

export interface RaycastResult {
  hit: boolean;
  distance: number;
  point: Vector3 | null;
  normal: Vector3 | null;
  object: Object3D | null;
}

export interface VisionData {
  left: RaycastResult;
  center: RaycastResult;
  right: RaycastResult;
  hasObstacle: boolean;
  nearestObstacle: RaycastResult | null;
}

export interface SmellData {
  detected: boolean;
  direction: Vector3 | null;
  distance: number;
  source: any | null;
}

export interface SensoryInput {
  vision: VisionData;
  smell: SmellData;
  nearestPrey: { position: Vector3; distance: number; id: string } | null;
  hunger: number;
}

/**
 * Cast a ray from the shark's position in a given direction
 * @param origin - Starting point of ray
 * @param direction - Direction to cast (normalized)
 * @param maxDistance - Maximum ray length
 * @param scene - Scene to raycast against
 * @returns RaycastResult with hit information
 */
export function castVisionRay(
  origin: Vector3,
  direction: Vector3,
  maxDistance: number = 20,
  objects: Object3D[]
): RaycastResult {
  const raycaster = new Raycaster(origin, direction.normalize(), 0, maxDistance);
  const intersects = raycaster.intersectObjects(objects, true);
  
  if (intersects.length > 0) {
    const hit = intersects[0];
    return {
      hit: true,
      distance: hit.distance,
      point: hit.point,
      normal: hit.face ? hit.face.normal : null,
      object: hit.object,
    };
  }
  
  return {
    hit: false,
    distance: maxDistance,
    point: null,
    normal: null,
    object: null,
  };
}

/**
 * Perform three-ray vision check (left, center, right)
 * Used for obstacle avoidance
 */
export function performVisionCheck(
  position: Vector3,
  forward: Vector3,
  raySpread: number = Math.PI / 6, // 30 degrees
  rayDistance: number = 20,
  obstacles: Object3D[]
): VisionData {
  // Calculate ray directions
  const centerDir = forward.clone().normalize();
  
  // Left ray (rotate counterclockwise around Y-axis)
  const leftDir = centerDir.clone();
  leftDir.applyAxisAngle(new Vector3(0, 1, 0), raySpread);
  
  // Right ray (rotate clockwise around Y-axis)
  const rightDir = centerDir.clone();
  rightDir.applyAxisAngle(new Vector3(0, 1, 0), -raySpread);
  
  // Cast all three rays
  const leftResult = castVisionRay(position, leftDir, rayDistance, obstacles);
  const centerResult = castVisionRay(position, centerDir, rayDistance, obstacles);
  const rightResult = castVisionRay(position, rightDir, rayDistance, obstacles);
  
  // Determine if any obstacle is detected
  const hasObstacle = leftResult.hit || centerResult.hit || rightResult.hit;
  
  // Find nearest obstacle
  let nearestObstacle: RaycastResult | null = null;
  if (hasObstacle) {
    const results = [leftResult, centerResult, rightResult].filter(r => r.hit);
    nearestObstacle = results.reduce((nearest, current) => 
      current.distance < nearest.distance ? current : nearest
    );
  }
  
  return {
    left: leftResult,
    center: centerResult,
    right: rightResult,
    hasObstacle,
    nearestObstacle,
  };
}

/**
 * Calculate steering force to avoid obstacles based on vision
 * Uses potential field method - obstacles create repulsive forces
 */
export function calculateObstacleAvoidance(
  vision: VisionData,
  _currentVelocity: Vector3,
  avoidanceStrength: number = 5.0
): Vector3 {
  const steeringForce = new Vector3(0, 0, 0);
  
  if (!vision.hasObstacle) {
    return steeringForce;
  }
  
  // Weight factors for each ray
  const weights = {
    left: 0.7,
    center: 1.0,
    right: 0.7,
  };
  
  // If left ray hits, steer right
  if (vision.left.hit) {
    const avoidance = 1.0 - (vision.left.distance / 20);
    steeringForce.x += avoidanceStrength * avoidance * weights.left;
  }
  
  // If right ray hits, steer left
  if (vision.right.hit) {
    const avoidance = 1.0 - (vision.right.distance / 20);
    steeringForce.x -= avoidanceStrength * avoidance * weights.right;
  }
  
  // If center ray hits, steer based on which side is clearer
  if (vision.center.hit) {
    const avoidance = 1.0 - (vision.center.distance / 20);
    
    // Check which side has more space
    const leftClear = vision.left.hit ? vision.left.distance : 20;
    const rightClear = vision.right.hit ? vision.right.distance : 20;
    
    if (leftClear > rightClear) {
      steeringForce.x -= avoidanceStrength * avoidance * weights.center;
    } else {
      steeringForce.x += avoidanceStrength * avoidance * weights.center;
    }
  }
  
  return steeringForce;
}

/**
 * Detect scent/blood in the environment
 * Sharks can smell blood from great distances
 */
export function detectScent(
  position: Vector3,
  bloodSources: Array<{ position: Vector3; intensity: number; id: string }>,
  maxRange: number = 50
): SmellData {
  if (bloodSources.length === 0) {
    return {
      detected: false,
      direction: null,
      distance: Infinity,
      source: null,
    };
  }
  
  // Find nearest blood source within range
  let nearestSource = null;
  let nearestDistance = Infinity;
  
  for (const source of bloodSources) {
    const distance = position.distanceTo(source.position);
    if (distance < maxRange && distance < nearestDistance) {
      nearestDistance = distance;
      nearestSource = source;
    }
  }
  
  if (nearestSource) {
    const direction = nearestSource.position.clone().sub(position).normalize();
    return {
      detected: true,
      direction,
      distance: nearestDistance,
      source: nearestSource,
    };
  }
  
  return {
    detected: false,
    direction: null,
    distance: Infinity,
    source: null,
  };
}

/**
 * Find nearest prey entity
 * Used for hunting behavior
 */
export function findNearestPrey(
  position: Vector3,
  preyEntities: Array<{ position: Vector3; id: string; health: number; type: string }>,
  maxRange: number = 30
): { position: Vector3; distance: number; id: string; type: string } | null {
  if (preyEntities.length === 0) return null;
  
  let nearest = null;
  let nearestDistance = Infinity;
  
  for (const prey of preyEntities) {
    // Skip dead prey
    if (prey.health <= 0) continue;
    
    const distance = position.distanceTo(prey.position);
    if (distance < maxRange && distance < nearestDistance) {
      nearestDistance = distance;
      nearest = {
        position: prey.position.clone(),
        distance,
        id: prey.id,
        type: prey.type,
      };
    }
  }
  
  return nearest;
}

/**
 * Calculate steering force toward target (prey or blood)
 * Uses desired velocity - current velocity = steering force
 */
export function calculateSeekingForce(
  currentPosition: Vector3,
  currentVelocity: Vector3,
  targetPosition: Vector3,
  maxSpeed: number = 5.0,
  strength: number = 1.0
): Vector3 {
  // Desired velocity: direction to target at max speed
  const desired = targetPosition.clone()
    .sub(currentPosition)
    .normalize()
    .multiplyScalar(maxSpeed);
  
  // Steering = desired - current
  const steering = desired.sub(currentVelocity).multiplyScalar(strength);
  
  return steering;
}

/**
 * Update hunger level over time
 * Increases gradually, can be reduced by eating
 */
export function updateHunger(
  currentHunger: number,
  deltaTime: number,
  hungerRate: number = 0.5 // Units per second
): number {
  return Math.min(100, currentHunger + hungerRate * deltaTime);
}

/**
 * Check if prey is within attack range
 */
export function canAttackPrey(
  predatorPosition: Vector3,
  preyPosition: Vector3,
  attackRange: number = 2.0
): boolean {
  return predatorPosition.distanceTo(preyPosition) <= attackRange;
}

/**
 * Combine multiple steering forces with weights
 * Used to blend obstacle avoidance, seeking, and other behaviors
 */
export function combineSteeringForces(
  forces: Array<{ force: Vector3; weight: number }>
): Vector3 {
  const combined = new Vector3(0, 0, 0);
  
  for (const { force, weight } of forces) {
    combined.add(force.clone().multiplyScalar(weight));
  }
  
  return combined;
}

/**
 * Visualize raycasts for debugging
 * Returns array of line segments for rendering
 */
export function getVisionDebugLines(
  position: Vector3,
  vision: VisionData,
  forward: Vector3,
  raySpread: number = Math.PI / 6
): Array<{ start: Vector3; end: Vector3; hit: boolean }> {
  const lines = [];
  const rayDistance = 20;
  
  // Center ray
  const centerEnd = position.clone().add(forward.clone().normalize().multiplyScalar(
    vision.center.hit ? vision.center.distance : rayDistance
  ));
  lines.push({ start: position.clone(), end: centerEnd, hit: vision.center.hit });
  
  // Left ray
  const leftDir = forward.clone().normalize();
  leftDir.applyAxisAngle(new Vector3(0, 1, 0), raySpread);
  const leftEnd = position.clone().add(leftDir.multiplyScalar(
    vision.left.hit ? vision.left.distance : rayDistance
  ));
  lines.push({ start: position.clone(), end: leftEnd, hit: vision.left.hit });
  
  // Right ray
  const rightDir = forward.clone().normalize();
  rightDir.applyAxisAngle(new Vector3(0, 1, 0), -raySpread);
  const rightEnd = position.clone().add(rightDir.multiplyScalar(
    vision.right.hit ? vision.right.distance : rayDistance
  ));
  lines.push({ start: position.clone(), end: rightEnd, hit: vision.right.hit });
  
  return lines;
}
