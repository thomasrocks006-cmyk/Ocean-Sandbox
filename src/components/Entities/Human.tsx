import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Vector3, Group } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store/useStore';
import { useBuoyancy } from '../Physics/Buoyancy';

interface HumanProps {
  position?: [number, number, number];
  type?: 'human' | 'diver';
}

export enum HumanState {
  TREADING = 'treading',
  SWIMMING = 'swimming',
  PANIC = 'panic',
  DEAD = 'dead',
}

export function Human({ position = [5, -1, 5], type = 'human' }: HumanProps) {
  const group = useRef<Group>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [id] = useState(uuidv4());
  const [humanState, setHumanState] = useState<HumanState>(HumanState.TREADING);
  const [health] = useState(100);
  
  // Load human model (temporarily disable FBX animations to fix crash)
  const { scene: humanModel } = useGLTF('/models/human.glb');
  // const swimmingFbx = useFBX('/models/Swimming.fbx');
  // const treadingFbx = useFBX('/models/TreadingWater.fbx');
  
  // Extract animations (disabled temporarily)
  // const { actions: swimActions } = useAnimations(swimmingFbx.animations, group);
  // const { actions: treadActions } = useAnimations(treadingFbx.animations, group);
  
  const addEntity = useStore((state) => state.addEntity);
  const updateEntity = useStore((state) => state.updateEntity);
  const removeEntity = useStore((state) => state.removeEntity);
  const entities = useStore((state) => state.entities);

  // Register entity
  useEffect(() => {
    addEntity({
      id,
      type,
      position: new Vector3(...position),
      velocity: new Vector3(),
      health: 100,
      state: HumanState.TREADING,
    });
    return () => removeEntity(id);
  }, [id, addEntity, removeEntity, type, position]);

  // Buoyancy
  useBuoyancy({
    rigidBody: rigidBodyRef,
    volume: 0.07, // ~70kg human
    mass: 70,
    dragCoefficient: 0.8,
    crossSectionalArea: 0.5,
    centerOfBuoyancy: new Vector3(0, 0.5, 0), // Keep head up
  });

  // Animation Controller (disabled temporarily while FBX animations are fixed)
  useEffect(() => {
    // Stop all actions
    // Object.values(swimActions).forEach(action => action?.stop());
    // Object.values(treadActions).forEach(action => action?.stop());

    // if (humanState === HumanState.SWIMMING || humanState === HumanState.PANIC) {
    //   const action = swimActions['mixamo.com']; // Assuming default mixamo name
    //   if (action) {
    //     action.reset().fadeIn(0.5).play();
    //     action.timeScale = humanState === HumanState.PANIC ? 2.0 : 1.0;
    //   }
    // } else if (humanState === HumanState.TREADING) {
    //   const action = treadActions['mixamo.com'];
    //   if (action) {
    //     action.reset().fadeIn(0.5).play();
    //   }
    // }
    // Dead state: stop animations or play ragdoll (simulated by physics)
  }, [humanState]);

  // AI & Logic Loop
  useFrame((frameState, delta) => {
    if (!rigidBodyRef.current || !group.current) return;

    const currentPos = rigidBodyRef.current.translation();
    const currentVel = rigidBodyRef.current.linvel();
    const posVec = new Vector3(currentPos.x, currentPos.y, currentPos.z);

    // Update store
    updateEntity(id, {
      position: posVec,
      velocity: new Vector3(currentVel.x, currentVel.y, currentVel.z),
      health,
      state: humanState,
    });

    // Check for sharks
    const sharks = Array.from(entities.values()).filter(e => e.type === 'shark');
    let nearestSharkDist = Infinity;
    
    sharks.forEach(shark => {
      const dist = posVec.distanceTo(shark.position);
      if (dist < nearestSharkDist) nearestSharkDist = dist;
    });

    // State Logic
    if (health <= 0) {
      if (humanState !== HumanState.DEAD) setHumanState(HumanState.DEAD);
      return;
    }

    // Panic if shark is close
    if (nearestSharkDist < 15 && humanState !== HumanState.PANIC) {
      setHumanState(HumanState.PANIC);
    } else if (nearestSharkDist > 20 && humanState === HumanState.PANIC) {
      setHumanState(HumanState.SWIMMING); // Calm down eventually
    }

    // Movement Logic
    const moveDir = new Vector3(0, 0, 0);
    
    if (humanState === HumanState.SWIMMING) {
      moveDir.set(0, 0, 1).applyQuaternion(group.current.quaternion);
      rigidBodyRef.current.applyImpulse(moveDir.multiplyScalar(50 * delta), true);
    } else if (humanState === HumanState.PANIC) {
      // Swim away from nearest shark (simplified as random erratic movement for now)
      moveDir.set(Math.sin(frameState.clock.elapsedTime * 5), 0, Math.cos(frameState.clock.elapsedTime * 3));
      rigidBodyRef.current.applyImpulse(moveDir.multiplyScalar(100 * delta), true);
    }

    // Bleeding Logic
    if (health < 100) {
      // Chance to spawn blood particle
      if (Math.random() < 0.05) {
        addEntity({
          id: uuidv4(),
          type: 'blood',
          position: posVec.clone().add(new Vector3((Math.random()-0.5)*0.5, 0, (Math.random()-0.5)*0.5)),
          velocity: new Vector3(0, -0.1, 0), // Sink slowly
          health: 1,
          intensity: (100 - health) / 100,
        });
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders="hull"
      position={position}
      mass={70}
      linearDamping={0.5}
      angularDamping={0.5}
      enabledRotations={[true, true, true]}
    >
      <group ref={group} dispose={null} scale={0.01}>
        {/* Render the human GLB model with animations */}
        <primitive object={humanModel.clone()} />
      </group>
    </RigidBody>
  );
}
