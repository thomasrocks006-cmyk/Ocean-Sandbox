import { Vector3 } from 'three';
import { SensoryInput } from './sensorySystems';
import { SHARK_CONSTANTS } from './sharkBehavior';

/**
 * Finite State Machine for Predator AI
 * States: IDLE, PATROL, HUNT, ATTACK, FLEE (if injured)
 */

export enum PredatorState {
  IDLE = 'IDLE',
  PATROL = 'PATROL',
  INVESTIGATE = 'INVESTIGATE',
  STALK = 'STALK',
  HUNT = 'HUNT',
  ATTACK = 'ATTACK',
  FLEE = 'FLEE',
  REST = 'REST',
}

export interface FSMState {
  current: PredatorState;
  timeInState: number;
  previousState: PredatorState;
}

export interface AIBehaviorOutput {
  targetVelocity: Vector3;
  targetRotation: number | null;
  speedMultiplier: number;
  aggressiveness: number;
  shouldAttack: boolean;
}

/**
 * Initialize FSM state
 */
export function initializeFSM(): FSMState {
  return {
    current: PredatorState.IDLE,
    timeInState: 0,
    previousState: PredatorState.IDLE,
  };
}

/**
 * Update FSM based on sensory input
 * Returns new state and time in state
 */
export function updateFSM(
  currentState: FSMState,
  sensoryInput: SensoryInput,
  deltaTime: number
): FSMState {
  const newState = { ...currentState };
  newState.timeInState += deltaTime;
  
  const previousStateType = newState.current;
  
  // State transition logic
  switch (currentState.current) {
    case PredatorState.IDLE:
      newState.current = transitionFromIdle(sensoryInput, newState.timeInState);
      break;
      
    case PredatorState.PATROL:
      newState.current = transitionFromPatrol(sensoryInput, newState.timeInState);
      break;

    case PredatorState.INVESTIGATE:
      newState.current = transitionFromInvestigate(sensoryInput, newState.timeInState);
      break;

    case PredatorState.STALK:
      newState.current = transitionFromStalk(sensoryInput, newState.timeInState);
      break;
      
    case PredatorState.HUNT:
      newState.current = transitionFromHunt(sensoryInput, newState.timeInState);
      break;
      
    case PredatorState.ATTACK:
      newState.current = transitionFromAttack(sensoryInput, newState.timeInState);
      break;

    case PredatorState.REST:
      newState.current = transitionFromRest(sensoryInput, newState.timeInState);
      break;
      
    case PredatorState.FLEE:
      newState.current = transitionFromFlee(sensoryInput, newState.timeInState);
      break;
  }
  
  // Reset timer if state changed
  if (newState.current !== previousStateType) {
    newState.previousState = previousStateType;
    newState.timeInState = 0;
  }
  
  return newState;
}

/**
 * Transition logic from IDLE state
 */
function transitionFromIdle(sensoryInput: SensoryInput, timeInState: number): PredatorState {
  const { smell, nearestPrey, hunger } = sensoryInput;
  
  // If very hungry, start hunting immediately
  if (hunger > 80) {
    if (smell.detected || nearestPrey) {
      return PredatorState.HUNT;
    }
  }
  
  // If blood detected, investigate
  if (smell.detected) {
    return PredatorState.HUNT;
  }
  
  // If prey nearby and moderately hungry, hunt
  if (nearestPrey && nearestPrey.distance < 30 && hunger > 40) {
    return PredatorState.HUNT;
  }
  
  // After 3 seconds of idle, start patrolling
  if (timeInState > 3) {
    return PredatorState.PATROL;
  }
  
  return PredatorState.IDLE;
}

/**
 * Transition logic from PATROL state
 */
function transitionFromPatrol(sensoryInput: SensoryInput, _timeInState: number): PredatorState {
  const { smell, nearestPrey, hunger } = sensoryInput;
  
  // High hunger overrides caution
  if (hunger > 80 && (smell.detected || nearestPrey)) {
    return PredatorState.HUNT;
  }
  
  // Smell blood (far) -> Investigate
  if (smell.detected && smell.distance > SHARK_CONSTANTS.SENSES.VISION_MURKY) {
    return PredatorState.INVESTIGATE;
  }

  // Smell blood (close) -> Hunt
  if (smell.detected && smell.distance <= SHARK_CONSTANTS.SENSES.VISION_MURKY) {
    return PredatorState.HUNT;
  }
  
  // Prey seen (far) -> Stalk or Investigate based on hunger
  if (nearestPrey && nearestPrey.distance > 15) {
    // Cautious approach unless starving
    return hunger > 90 ? PredatorState.HUNT : PredatorState.STALK;
  }

  // Prey seen (close) -> Hunt or Investigate
  if (nearestPrey && nearestPrey.distance <= 15) {
    // Direct hunt unless low hunger (investigate first)
    return hunger > 40 ? PredatorState.HUNT : PredatorState.INVESTIGATE;
  }
  
  return PredatorState.PATROL;
}

/**
 * Transition logic from INVESTIGATE state
 */
function transitionFromInvestigate(sensoryInput: SensoryInput, timeInState: number): PredatorState {
  const { smell, nearestPrey, hunger } = sensoryInput;

  // If we find prey
  if (nearestPrey) {
    // Attack if starving or after long investigation
    if (hunger > 90) return PredatorState.HUNT;
    
    // If investigated for too long (boring), leave
    if (timeInState > 20) return PredatorState.PATROL;
    
    // Close enough, decide to stalk or hunt
    if (nearestPrey.distance < 10) return PredatorState.HUNT;
    
    // Otherwise stalk
    return PredatorState.STALK;
  }

  // If smell gets stronger/closer, keep investigating or hunt
  if (smell.detected && smell.distance < 10) {
    return PredatorState.HUNT;
  }

  // Give up after 15 seconds if nothing found
  if (timeInState > 15 && !smell.detected) {
    return PredatorState.PATROL;
  }

  return PredatorState.INVESTIGATE;
}

/**
 * Transition logic from STALK state
 */
function transitionFromStalk(sensoryInput: SensoryInput, _timeInState: number): PredatorState {
  const { nearestPrey } = sensoryInput;

  // If lost prey, investigate last known position
  if (!nearestPrey) {
    return PredatorState.INVESTIGATE;
  }

  // If close enough for ambush, HUNT (which leads to ATTACK)
  if (nearestPrey.distance < 10) {
    return PredatorState.HUNT;
  }

  return PredatorState.STALK;
}

/**
 * Transition logic from REST state
 */
function transitionFromRest(sensoryInput: SensoryInput, timeInState: number): PredatorState {
  // Rest for at least 10 seconds
  if (timeInState > 10) {
    return PredatorState.PATROL;
  }
  
  // If threatened or strong stimulus, wake up
  if (sensoryInput.nearestPrey && sensoryInput.nearestPrey.distance < 5) {
    return PredatorState.IDLE;
  }

  return PredatorState.REST;
}

/**
 * Transition logic from HUNT state
 */
function transitionFromHunt(sensoryInput: SensoryInput, timeInState: number): PredatorState {
  const { smell, nearestPrey, hunger, vision } = sensoryInput;
  
  // Close enough to attack
  if (nearestPrey && nearestPrey.distance < 3) {
    return PredatorState.ATTACK;
  }
  
  // Lost target and not very hungry
  if (!smell.detected && !nearestPrey && hunger < 60) {
    return PredatorState.PATROL;
  }
  
  // Lost target but very hungry - keep hunting
  if (!smell.detected && !nearestPrey && hunger >= 60 && timeInState < 10) {
    return PredatorState.HUNT; // Keep searching
  }
  
  // Searched too long without success
  if (!smell.detected && !nearestPrey && timeInState > 10) {
    return PredatorState.PATROL;
  }
  
  // Dangerous obstacle ahead and not desperate
  if (vision.hasObstacle && vision.nearestObstacle!.distance < 5 && hunger < 80) {
    return PredatorState.PATROL; // Abort hunt
  }
  
  return PredatorState.HUNT;
}

/**
 * Transition logic from ATTACK state
 */
function transitionFromAttack(sensoryInput: SensoryInput, timeInState: number): PredatorState {
  const { nearestPrey, hunger } = sensoryInput;
  
  // Attack completed (prey gone or dead)
  if (!nearestPrey) {
    // Satiated after successful kill
    if (timeInState > 2) {
      return PredatorState.IDLE;
    }
  }
  
  // Prey escaped (moved away)
  if (nearestPrey && nearestPrey.distance > 5) {
    if (hunger > 50) {
      return PredatorState.HUNT; // Chase again
    } else {
      return PredatorState.PATROL;
    }
  }
  
  // Attack phase timeout
  if (timeInState > 5) {
    return PredatorState.HUNT; // Re-engage
  }
  
  return PredatorState.ATTACK;
}

/**
 * Transition logic from FLEE state
 * (Future: if shark gets injured by larger predator)
 */
function transitionFromFlee(_sensoryInput: SensoryInput, timeInState: number): PredatorState {
  // After fleeing for 5 seconds, return to patrol
  if (timeInState > 5) {
    return PredatorState.PATROL;
  }
  
  return PredatorState.FLEE;
}

/**
 * Get behavior output based on current state
 * This determines how the shark moves and behaves
 */
export function getBehaviorOutput(
  state: PredatorState,
  sensoryInput: SensoryInput,
  currentPosition: Vector3,
  currentVelocity: Vector3
): AIBehaviorOutput {
  switch (state) {
    case PredatorState.IDLE:
      return getIdleBehavior(currentPosition, currentVelocity);
      
    case PredatorState.PATROL:
      return getPatrolBehavior(sensoryInput, currentPosition, currentVelocity);

    case PredatorState.INVESTIGATE:
      return getInvestigateBehavior(sensoryInput, currentPosition, currentVelocity);

    case PredatorState.STALK:
      return getStalkBehavior(sensoryInput, currentPosition, currentVelocity);
      
    case PredatorState.HUNT:
      return getHuntBehavior(sensoryInput, currentPosition, currentVelocity);
      
    case PredatorState.ATTACK:
      return getAttackBehavior(sensoryInput, currentPosition, currentVelocity);

    case PredatorState.REST:
      return getRestBehavior(sensoryInput, currentPosition, currentVelocity);
      
    case PredatorState.FLEE:
      return getFleeBehavior(sensoryInput, currentPosition, currentVelocity);
      
    default:
      return getIdleBehavior(currentPosition, currentVelocity);
  }
}

/**
 * IDLE behavior: Minimal movement, drifting
 */
function getIdleBehavior(
  _currentPosition: Vector3,
  _currentVelocity: Vector3
): AIBehaviorOutput {
  return {
    targetVelocity: new Vector3(0, 0, 0),
    targetRotation: null,
    speedMultiplier: 0.2,
    aggressiveness: 0,
    shouldAttack: false,
  };
}

/**
 * PATROL behavior: Wandering, exploring territory
 */
function getPatrolBehavior(
  sensoryInput: SensoryInput,
  _currentPosition: Vector3,
  _currentVelocity: Vector3
): AIBehaviorOutput {
  const { vision } = sensoryInput;
  
  // Base forward movement
  let targetVelocity = new Vector3(0, 0, 1);
  
  // Add wandering behavior (sinusoidal turn)
  const time = Date.now() * 0.001;
  const wanderAngle = Math.sin(time * 0.3) * 0.5;
  targetVelocity.applyAxisAngle(new Vector3(0, 1, 0), wanderAngle);
  
  // Avoid obstacles
  if (vision.hasObstacle) {
    // Turn away from obstacles
    if (vision.left.hit && !vision.right.hit) {
      targetVelocity.applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 6); // Turn right
    } else if (vision.right.hit && !vision.left.hit) {
      targetVelocity.applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 6); // Turn left
    } else if (vision.center.hit) {
      // Turn toward clearer side
      const leftClear = vision.left.hit ? vision.left.distance : 20;
      const rightClear = vision.right.hit ? vision.right.distance : 20;
      targetVelocity.applyAxisAngle(new Vector3(0, 1, 0), leftClear > rightClear ? -Math.PI / 4 : Math.PI / 4);
    }
  }
  
  return {
    targetVelocity: targetVelocity.normalize().multiplyScalar(2),
    targetRotation: null,
    speedMultiplier: 1.0,
    aggressiveness: 0.1,
    shouldAttack: false,
  };
}

/**
 * INVESTIGATE behavior: Slow approach, circling
 */
function getInvestigateBehavior(
  sensoryInput: SensoryInput,
  currentPosition: Vector3,
  _currentVelocity: Vector3
): AIBehaviorOutput {
  const { smell, nearestPrey } = sensoryInput;
  let targetVelocity = new Vector3(0, 0, 1);

  // Move towards smell source or prey
  if (nearestPrey) {
    const direction = new Vector3().subVectors(nearestPrey.position, currentPosition).normalize();
    targetVelocity = direction;
  } else if (smell.detected) {
    // Follow scent gradient (simplified as moving towards source if known, or just searching)
    // For now, just wander more actively
    const time = Date.now() * 0.001;
    const wanderAngle = Math.sin(time * 1.0) * 1.0; // Faster turns
    targetVelocity.applyAxisAngle(new Vector3(0, 1, 0), wanderAngle);
  }

  return {
    targetVelocity: targetVelocity.normalize().multiplyScalar(1.5),
    targetRotation: null,
    speedMultiplier: 0.5, // Slow
    aggressiveness: 0.3,
    shouldAttack: false,
  };
}

/**
 * STALK behavior: Approach from below/behind
 */
function getStalkBehavior(
  sensoryInput: SensoryInput,
  currentPosition: Vector3,
  _currentVelocity: Vector3
): AIBehaviorOutput {
  const { nearestPrey } = sensoryInput;
  let targetVelocity = new Vector3(0, 0, 1);

  if (nearestPrey) {
    // Target position is below and behind prey
    // Assuming prey is facing its velocity (we don't have prey velocity here, so just stay below)
    const targetPos = nearestPrey.position.clone().add(new Vector3(0, -5, 0)); // 5 meters below
    
    targetVelocity = new Vector3().subVectors(targetPos, currentPosition).normalize();
  }

  return {
    targetVelocity: targetVelocity.normalize().multiplyScalar(2.5),
    targetRotation: null,
    speedMultiplier: 0.8,
    aggressiveness: 0.6,
    shouldAttack: false,
  };
}

/**
 * REST behavior: Slow swimming for ram ventilation
 */
function getRestBehavior(
  _sensoryInput: SensoryInput,
  _currentPosition: Vector3,
  currentVelocity: Vector3
): AIBehaviorOutput {
  // Just keep swimming forward slowly
  const targetVelocity = currentVelocity.clone().normalize().multiplyScalar(1.0);

  return {
    targetVelocity,
    targetRotation: null,
    speedMultiplier: 0.3,
    aggressiveness: 0,
    shouldAttack: false,
  };
}

/**
 * HUNT behavior: Pursuing prey or blood scent
 */
function getHuntBehavior(
  sensoryInput: SensoryInput,
  currentPosition: Vector3,
  _currentVelocity: Vector3
): AIBehaviorOutput {
  const { smell, nearestPrey, hunger, vision } = sensoryInput;
  
  let targetVelocity = new Vector3(0, 0, 1);
  let speedMultiplier = 2.0; // Doubled speed in hunt mode
  
  // If desperate (hunger > 80), ignore some obstacles
  const desperate = hunger > 80;
  
  // Primary target: nearest prey
  if (nearestPrey) {
    const direction = nearestPrey.position.clone().sub(currentPosition).normalize();
    targetVelocity = direction;
    
    // Increase speed when close
    if (nearestPrey.distance < 10) {
      speedMultiplier = 2.5;
    }
  }
  // Secondary target: blood scent
  else if (smell.detected && smell.direction) {
    targetVelocity = smell.direction.clone();
  }
  
  // Obstacle avoidance (unless desperate)
  if (vision.hasObstacle && !desperate) {
    if (vision.center.hit && vision.center.distance < 8) {
      // Emergency turn
      const leftClear = vision.left.hit ? vision.left.distance : 20;
      const rightClear = vision.right.hit ? vision.right.distance : 20;
      const turnDirection = leftClear > rightClear ? -1 : 1;
      targetVelocity.applyAxisAngle(new Vector3(0, 1, 0), turnDirection * Math.PI / 3);
    }
  }
  
  return {
    targetVelocity: targetVelocity.normalize().multiplyScalar(2 * speedMultiplier),
    targetRotation: null,
    speedMultiplier,
    aggressiveness: 0.7,
    shouldAttack: false,
  };
}

/**
 * ATTACK behavior: Close-range aggressive movement
 */
function getAttackBehavior(
  sensoryInput: SensoryInput,
  currentPosition: Vector3,
  _currentVelocity: Vector3
): AIBehaviorOutput {
  const { nearestPrey } = sensoryInput;
  
  let targetVelocity = new Vector3(0, 0, 1);
  
  if (nearestPrey) {
    // Direct lunge toward prey
    targetVelocity = nearestPrey.position.clone().sub(currentPosition).normalize();
  }
  
  return {
    targetVelocity: targetVelocity.normalize().multiplyScalar(3), // Maximum speed
    targetRotation: null,
    speedMultiplier: 3.0,
    aggressiveness: 1.0,
    shouldAttack: true,
  };
}

/**
 * FLEE behavior: Escape from threat
 */
function getFleeBehavior(
  _sensoryInput: SensoryInput,
  _currentPosition: Vector3,
  currentVelocity: Vector3
): AIBehaviorOutput {
  // Flee away from nearest threat (future feature)
  const fleeDirection = currentVelocity.clone().normalize();
  
  return {
    targetVelocity: fleeDirection.multiplyScalar(4),
    targetRotation: null,
    speedMultiplier: 4.0,
    aggressiveness: 0,
    shouldAttack: false,
  };
}

/**
 * Get state-specific debug info
 */
export function getStateDebugInfo(state: PredatorState, timeInState: number): string {
  return `${state} (${timeInState.toFixed(1)}s)`;
}

/**
 * Get color for state visualization
 */
export function getStateColor(state: PredatorState): string {
  switch (state) {
    case PredatorState.IDLE:
      return '#4a90e2'; // Blue
    case PredatorState.PATROL:
      return '#7ed321'; // Green
    case PredatorState.INVESTIGATE:
      return '#50e3c2'; // Cyan
    case PredatorState.STALK:
      return '#8b572a'; // Brown
    case PredatorState.HUNT:
      return '#f5a623'; // Orange
    case PredatorState.ATTACK:
      return '#d0021b'; // Red
    case PredatorState.REST:
      return '#9b9b9b'; // Grey
    case PredatorState.FLEE:
      return '#bd10e0'; // Purple
    default:
      return '#ffffff';
  }
}
