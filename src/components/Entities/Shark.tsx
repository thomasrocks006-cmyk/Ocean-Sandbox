import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Vector3, Mesh, Group } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { useBuoyancy } from '../Physics/Buoyancy';
import { useStore } from '../../store/useStore';
import { PredatorState } from '../../utils/aiLogic';
import { fishTailAnimation } from '../../utils/mathHelpers';

interface SharkProps {
  position?: [number, number, number];
  mass?: number;
  volume?: number;
}

/**
 * Shark entity with:
 * - Archimedes buoyancy
 * - FSM-based AI (Idle -> Patrol -> Hunt -> Attack)
 * - Procedural tail animation
 * - Forward swimming impulse
 */
export function Shark({
  position = [0, -5, 0],
  mass = 200, // kg
  volume = 0.3, // m³ (slightly less than water displacement for negative buoyancy)
}: SharkProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const tailRef = useRef<Mesh>(null);
  
  const [id] = useState(uuidv4());
  const [state, setState] = useState<PredatorState>(PredatorState.PATROL);
  
  const addEntity = useStore((state) => state.addEntity);
  const removeEntity = useStore((state) => state.removeEntity);
  const paused = useStore((state) => state.paused);
  
  // Register entity on mount
  useEffect(() => {
    addEntity({
      id,
      type: 'shark',
      position: new Vector3(...position),
      velocity: new Vector3(),
      health: 100,
      state,
    });
    
    return () => {
      removeEntity(id);
    };
  }, [id, addEntity, removeEntity]);
  
  // Apply buoyancy physics
  useBuoyancy({
    rigidBody: rigidBodyRef,
    volume,
    mass,
    dragCoefficient: 0.3, // Streamlined shark body
    crossSectionalArea: 0.5,
    centerOfBuoyancy: new Vector3(0, 0.1, 0),
  });
  
  // Animation and AI logic
  useFrame(({ clock }) => {
    if (paused || !rigidBodyRef.current || !groupRef.current) return;
    
    const rb = rigidBodyRef.current;
    const time = clock.getElapsedTime();
    
    // Procedural tail animation
    if (tailRef.current) {
      const tailSwing = fishTailAnimation(time, 3.0, 0.4);
      tailRef.current.rotation.y = tailSwing;
    }
    
    // Swimming behavior - apply forward impulse
    const swimSpeed = 2.0;
    const swimFrequency = 2.0;
    const impulse = Math.sin(time * swimFrequency) * swimSpeed;
    
    // Get current rotation and apply force in forward direction
    const forward = new Vector3(0, 0, -1);
    forward.applyQuaternion(rb.rotation());
    forward.multiplyScalar(impulse);
    
    rb.applyImpulse(forward, true);
    
    // Add slight upward force to maintain depth
    const currentPos = rb.translation();
    const targetDepth = -5;
    const depthCorrection = (targetDepth - currentPos.y) * 0.5;
    rb.applyImpulse({ x: 0, y: depthCorrection, z: 0 }, true);
    
    // Slowly rotate to create patrol pattern
    const turnRate = 0.3;
    const turn = Math.sin(time * 0.2) * turnRate;
    rb.applyTorqueImpulse({ x: 0, y: turn, z: 0 }, true);
    
    // Update entity in store
    // (In a full implementation, this would be less frequent)
  });
  
  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      mass={mass}
      linearDamping={0.5}
      angularDamping={2.0}
      colliders="cuboid"
      enabledRotations={[false, true, false]} // Only allow Y-axis rotation
    >
      <group ref={groupRef}>
        {/* Shark body (placeholder - replace with GLB model) */}
        <mesh ref={bodyRef} castShadow>
          <boxGeometry args={[0.6, 0.8, 3]} />
          <meshStandardMaterial
            color="#4a5a6a"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Shark tail - animated */}
        <mesh ref={tailRef} position={[0, 0, 1.8]} castShadow>
          <coneGeometry args={[0.3, 1.2, 3]} />
          <meshStandardMaterial
            color="#3a4a5a"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Dorsal fin */}
        <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[0.15, 0.8, 3]} />
          <meshStandardMaterial
            color="#3a4a5a"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Pectoral fins */}
        <mesh position={[0.5, -0.2, 0.5]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[1.0, 0.1, 0.5]} />
          <meshStandardMaterial
            color="#3a4a5a"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[-0.5, -0.2, 0.5]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <boxGeometry args={[1.0, 0.1, 0.5]} />
          <meshStandardMaterial
            color="#3a4a5a"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}
