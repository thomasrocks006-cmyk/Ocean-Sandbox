import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Vector3, Mesh, Group } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { useBuoyancy } from '../Physics/Buoyancy';
import { useStore } from '../../store/useStore';
import {
  applySwimAnimation,
  getVelocityMagnitude,
  getAngularVelocityY,
  calculateSecondaryMotion,
} from '../../utils/swimAnimation';
import {
  performVisionCheck,
  calculateObstacleAvoidance,
  detectScent,
  findNearestPrey,
  calculateSeekingForce,
  updateHunger,
  canAttackPrey,
  combineSteeringForces,
  type SensoryInput,
} from '../../utils/sensorySystems';
import {
  PredatorState,
  initializeFSM,
  updateFSM,
  getBehaviorOutput,
} from '../../utils/predatorFSM';
import {
  determineAttackType,
  calculateAttackDamage,
} from '../../utils/attackSystem';

interface SharkProps {
  position?: [number, number, number];
  mass?: number;
  volume?: number;
}

/**
 * Shark entity with Module 3 Sensory System:
 * - Raycasting vision (3 rays: left, center, right)
 * - Smell detection (blood within 50 units)
 * - Hunger mechanics (increases over time)
 * - FSM-based AI (IDLE -> PATROL -> HUNT -> ATTACK)
 * - Procedural swim animation (Module 2)
 * - Archimedes buoyancy (Module 1)
 */
export function Shark({
  position = [0, -5, 0],
  mass = 200, // kg
  volume = 0.3, // m³
}: SharkProps) {
  const { scene } = useThree();
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const tailRef = useRef<Mesh>(null);
  const lastAttackTime = useRef(0);
  
  // Load shark GLB model
  const { scene: sharkModel } = useGLTF('/models/shark.glb');
  
  const [id] = useState(uuidv4());
  const [fsmState, setFsmState] = useState(initializeFSM());
  const [hunger, setHunger] = useState(30); // Start slightly hungry
  
  const addEntity = useStore((state) => state.addEntity);
  const removeEntity = useStore((state) => state.removeEntity);
  const updateEntity = useStore((state) => state.updateEntity);
  const entities = useStore((state) => state.entities);
  const paused = useStore((state) => state.paused);
  
  // Register entity on mount
  useEffect(() => {
    addEntity({
      id,
      type: 'shark',
      position: new Vector3(...position),
      velocity: new Vector3(),
      health: 100,
      state: fsmState.current,
    });
    
    return () => {
      removeEntity(id);
    };
  }, [id, addEntity, removeEntity]);
  
  // Apply buoyancy physics with dynamic wave sampling
  useBuoyancy({
    rigidBody: rigidBodyRef,
    volume,
    mass,
    dragCoefficient: 0.3, // Streamlined shark body
    crossSectionalArea: 0.5,
    centerOfBuoyancy: new Vector3(0, 0.1, 0),
    useDynamicWaves: true, // Enable Gerstner wave interaction
  });
  
  // Main AI and animation loop
  useFrame(({ clock }, delta) => {
    if (paused || !rigidBodyRef.current || !groupRef.current) return;
    
    const rb = rigidBodyRef.current;
    const time = clock.getElapsedTime();
    
    // Get current physics state
    const velocity = rb.linvel();
    const angularVel = rb.angvel();
    const currentPos = rb.translation();
    const position3 = new Vector3(currentPos.x, currentPos.y, currentPos.z);
    const velocity3 = new Vector3(velocity.x, velocity.y, velocity.z);
    
    // Calculate forward direction
    const rotation = rb.rotation();
    const yaw = Math.atan2(
      2 * (rotation.w * rotation.y + rotation.x * rotation.z),
      1 - 2 * (rotation.y * rotation.y + rotation.z * rotation.z)
    );
    const forward = new Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    
    // ========== MODULE 3: SENSORY SYSTEM ==========
    
    // 1. Vision System - Raycasting for obstacle avoidance
    const obstacles = Array.from(entities.values())
      .filter(e => e.type === 'rock' || e.type === 'coral')
      .map(e => scene.getObjectByName(e.id))
      .filter(Boolean) as any[];
    
    const vision = performVisionCheck(position3, forward, Math.PI / 6, 20, obstacles);
    
    // 2. Smell System - Blood detection
    const bloodSources = Array.from(entities.values())
      .filter(e => e.type === 'blood')
      .map(e => ({ position: e.position, intensity: 1.0, id: e.id }));
    
    const smell = detectScent(position3, bloodSources, 50);
    
    // 3. Prey Detection
    const preyEntities = Array.from(entities.values())
      .filter(e => (e.type === 'fish' || e.type === 'tuna' || e.type === 'seal' || e.type === 'human' || e.type === 'diver') && e.health > 0)
      .map(e => ({ position: e.position, id: e.id, health: e.health, type: e.type }));
    
    const nearestPrey = findNearestPrey(position3, preyEntities, 30);
    
    // 4. Hunger System
    const newHunger = updateHunger(hunger, delta, 0.5);
    setHunger(newHunger);
    
    // Assemble sensory input
    const sensoryInput: SensoryInput = {
      vision,
      smell,
      nearestPrey,
      hunger: newHunger,
    };
    
    // ========== FSM UPDATE ==========
    
    const newFsmState = updateFSM(fsmState, sensoryInput, delta);
    if (newFsmState.current !== fsmState.current) {
      setFsmState(newFsmState);
      // Update store
      updateEntity(id, { state: newFsmState.current });
    } else {
      setFsmState(newFsmState);
    }
    
    // Get behavior from FSM
    const behavior = getBehaviorOutput(fsmState.current, sensoryInput, position3, velocity3);
    
    // ========== ATTACK LOGIC ==========
    if (fsmState.current === PredatorState.ATTACK && nearestPrey && nearestPrey.distance < 2.0) {
      const now = clock.elapsedTime;
      if (now - lastAttackTime.current > 2.0) { // 2 second cooldown
        lastAttackTime.current = now;
        
        // Determine attack type
        const attackType = determineAttackType(velocity3, nearestPrey.type);
        
        // Calculate damage
        const result = calculateAttackDamage(attackType, velocity3);
        
        // Apply damage to prey
        const preyEntity = entities.get(nearestPrey.id);
        if (preyEntity) {
          const newHealth = Math.max(0, preyEntity.health - result.damage);
          updateEntity(nearestPrey.id, { health: newHealth });
          
          // Spawn blood
          if (result.bleedIntensity > 0) {
             for(let i=0; i<5 * result.bleedIntensity; i++) {
                addEntity({
                  id: uuidv4(),
                  type: 'blood',
                  position: nearestPrey.position.clone().add(new Vector3((Math.random()-0.5), (Math.random()-0.5), (Math.random()-0.5))),
                  velocity: new Vector3((Math.random()-0.5)*0.5, -0.1, (Math.random()-0.5)*0.5),
                  health: 1,
                  intensity: result.bleedIntensity,
                });
             }
          }
          
          // Feed shark
          if (result.damage > 0) {
            setHunger(Math.max(0, hunger - 20)); // Reduce hunger
          }
        }
      }
    }

    // ========== STEERING & MOVEMENT ==========
    
    // Calculate obstacle avoidance force
    const avoidanceForce = calculateObstacleAvoidance(vision, velocity3, 8.0);
    
    // Calculate seeking force (toward prey or blood)
    let seekingForce = new Vector3(0, 0, 0);
    if (nearestPrey && (fsmState.current === PredatorState.HUNT || fsmState.current === PredatorState.ATTACK || fsmState.current === PredatorState.STALK)) {
      seekingForce = calculateSeekingForce(position3, velocity3, nearestPrey.position, 4.0, 1.5);
    } else if (smell.detected && smell.direction) {
      seekingForce = smell.direction.clone().multiplyScalar(3.0);
    }
    
    // Combine forces with weights
    const steeringForces = [
      { force: avoidanceForce, weight: hunger > 80 ? 0.3 : 1.0 }, // Ignore obstacles when desperate
      { force: seekingForce, weight: 0.8 },
      { force: behavior.targetVelocity, weight: 0.5 },
    ];
    
    const combinedSteering = combineSteeringForces(steeringForces);
    
    // Apply steering forces
    rb.applyImpulse(
      { x: combinedSteering.x * delta * 10, y: 0, z: combinedSteering.z * delta * 10 },
      true
    );
    
    // Apply speed multiplier from behavior
    const swimForce = 3.0 * behavior.speedMultiplier;
    const swimFrequency = 2.0 + getVelocityMagnitude(velocity) * 0.3;
    const impulse = Math.sin(time * swimFrequency) * swimForce;
    
    const forwardThrust = forward.clone().multiplyScalar(impulse * delta);
    rb.applyImpulse(forwardThrust, true);
    
    // ========== DEPTH CONTROL ==========
    
    const targetDepth = -5;
    const depthError = targetDepth - currentPos.y;
    const depthCorrection = depthError * 0.8 * delta;
    rb.applyImpulse({ x: 0, y: depthCorrection, z: 0 }, true);
    
    // ========== ANIMATION ==========
    
    const swimSpeed = getVelocityMagnitude(velocity);
    const turnRate = getAngularVelocityY(angularVel);
    
    // Apply procedural swim animation to body
    if (bodyRef.current) {
      applySwimAnimation(bodyRef.current, {
        swimSpeed,
        turnRate,
        time,
        baseFrequency: 2.0 * behavior.speedMultiplier,
        amplitudeScale: 0.3,
        bankingAngle: Math.PI / 12,
      });
    }
    
    // Tail animation
    if (tailRef.current) {
      const tailFrequency = 2.0 + swimSpeed * 0.5;
      const tailAmplitude = 0.6 + Math.min(swimSpeed * 0.2, 0.4);
      tailRef.current.rotation.y = Math.sin(time * tailFrequency * Math.PI * 2) * tailAmplitude;
    }
    
    // Banking effect
    groupRef.current.rotation.z = -turnRate * 1.5;
    
    // Secondary motion
    const secondaryMotion = calculateSecondaryMotion(time, 2.0);
    rb.applyImpulse({ x: 0, y: secondaryMotion.bodyWave * 0.5 * delta, z: 0 }, true);
    
    // ========== ATTACK LOGIC ==========
    
    if (behavior.shouldAttack && nearestPrey) {
      if (canAttackPrey(position3, nearestPrey.position, 2.5)) {
        // Deal damage to prey
        const preyEntity = entities.get(nearestPrey.id);
        if (preyEntity) {
          updateEntity(nearestPrey.id, { health: Math.max(0, preyEntity.health - 50) });
          // Reset hunger on successful kill
          if (preyEntity.health <= 0) {
            setHunger(0);
          }
        }
      }
    }
  });
  
  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      mass={mass}
      linearDamping={0.5}
      angularDamping={2.0}
      colliders="hull"
      enabledRotations={[false, true, true]} // Allow Y (yaw) and Z (roll) rotation
    >
      <group ref={groupRef} scale={0.5}>
        {/* Render the shark GLB model */}
        <primitive object={sharkModel.clone()} />
        
        {/* Keep ref meshes for animation but make them invisible */}
        <mesh ref={bodyRef} visible={false}>
          <boxGeometry args={[0.6, 0.8, 3]} />
        </mesh>
        <mesh ref={tailRef} visible={false}>
          <coneGeometry args={[0.3, 1.2, 3]} />
        </mesh>
      </group>
    </RigidBody>
  );
}
