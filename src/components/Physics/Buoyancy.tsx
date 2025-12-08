import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useStore } from '../../store/useStore';
import { calculateBuoyancyForce, calculateDragForce } from '../../utils/mathHelpers';

export interface BuoyancyProps {
  rigidBody: React.RefObject<RapierRigidBody>;
  volume: number; // m³
  mass: number; // kg
  dragCoefficient?: number;
  crossSectionalArea?: number;
  centerOfBuoyancy?: Vector3; // Offset from center of mass
}

/**
 * Custom hook that applies Archimedes buoyancy and drag forces
 * to a Rapier RigidBody when submerged in water
 */
export function useBuoyancy({
  rigidBody,
  volume,
  mass,
  dragCoefficient = 0.47, // Sphere default
  crossSectionalArea = 1.0,
  centerOfBuoyancy = new Vector3(0, 0, 0),
}: BuoyancyProps) {
  const waterLevel = useStore((state) => state.waterLevel);
  const waterDensity = useStore((state) => state.waterDensity);
  const gravity = useStore((state) => state.gravity);
  const paused = useStore((state) => state.paused);
  
  useFrame(() => {
    if (paused || !rigidBody.current) return;
    
    const rb = rigidBody.current;
    const position = rb.translation();
    const velocity = rb.linvel();
    
    // Calculate depth below water surface
    const depth = waterLevel - position.y;
    
    // Only apply forces if object is below water
    if (depth > 0) {
      // Calculate submersion ratio (0 to 1)
      // For simplicity, we assume full submersion if center is below water
      const submersionRatio = Math.min(depth / 2, 1);
      const displacedVolume = volume * submersionRatio;
      
      // Archimedes Buoyancy Force (upward)
      const buoyancyMagnitude = calculateBuoyancyForce(
        waterDensity,
        displacedVolume,
        gravity
      );
      const buoyancyForce = new Vector3(0, buoyancyMagnitude, 0);
      
      // Apply buoyancy at center of buoyancy
      rb.addForceAtPoint(
        buoyancyForce,
        {
          x: position.x + centerOfBuoyancy.x,
          y: position.y + centerOfBuoyancy.y,
          z: position.z + centerOfBuoyancy.z,
        },
        true
      );
      
      // Drag Force (opposes motion)
      const velocityVec = new Vector3(velocity.x, velocity.y, velocity.z);
      const dragForce = calculateDragForce(
        velocityVec,
        waterDensity,
        dragCoefficient,
        crossSectionalArea
      );
      
      rb.addForce(dragForce, true);
      
      // Apply additional damping for rotational stability underwater
      const angularVel = rb.angvel();
      const angularDamping = new Vector3(
        angularVel.x * -0.5,
        angularVel.y * -0.5,
        angularVel.z * -0.5
      );
      rb.addTorque(angularDamping, true);
    }
  });
}

/**
 * Component wrapper for entities that need buoyancy
 */
export function Buoyancy({
  rigidBody,
  volume,
  mass,
  dragCoefficient,
  crossSectionalArea,
  centerOfBuoyancy,
}: BuoyancyProps) {
  useBuoyancy({
    rigidBody,
    volume,
    mass,
    dragCoefficient,
    crossSectionalArea,
    centerOfBuoyancy,
  });
  
  return null;
}
