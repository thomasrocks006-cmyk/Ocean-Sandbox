import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3 } from 'three';
import { useStore } from '../../store/useStore';
import { applyBoidsAlgorithm, defaultBoidParams } from '../../utils/aiLogic';

interface SchoolingFishProps {
  count?: number;
  origin?: [number, number, number];
  range?: number;
}

export function SchoolingFish({ 
  count = 100, 
  origin = [0, -5, 0], 
  range = 15 
}: SchoolingFishProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const entities = useStore((state) => state.entities);

  // Initialize fish data
  const fishData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: new Vector3(
        origin[0] + (Math.random() - 0.5) * range,
        origin[1] + (Math.random() - 0.5) * range * 0.5,
        origin[2] + (Math.random() - 0.5) * range
      ),
      velocity: new Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 2
      ),
    }));
  }, [count, origin, range]);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    // Find predators (sharks)
    const predators = Array.from(entities.values())
      .filter(e => e.type === 'shark')
      .map(e => e.position);

    // Update each fish
    fishData.forEach((fish, i) => {
      // 1. Flocking behavior (simplified: only check nearby neighbors for performance)
      // For true performance, we'd use a spatial grid, but for <200 fish, O(N^2) is okay-ish or we just sample random neighbors
      
      // Optimization: Only check 5 random neighbors + closest predator
      const neighbors = [];
      for(let k=0; k<5; k++) {
        const idx = Math.floor(Math.random() * count);
        if (idx !== i) {
          neighbors.push({ position: fishData[idx].position, velocity: fishData[idx].velocity });
        }
      }

      const flockForce = applyBoidsAlgorithm(fish.position, fish.velocity, neighbors, {
        ...defaultBoidParams,
        separationDistance: 1.5,
        alignmentDistance: 4.0,
        cohesionDistance: 4.0,
      });

      // 2. Predator Avoidance
      const avoidanceForce = new Vector3();
      predators.forEach(predPos => {
        const dist = fish.position.distanceTo(predPos);
        if (dist < 10) {
          const fleeDir = new Vector3().subVectors(fish.position, predPos).normalize();
          avoidanceForce.add(fleeDir.multiplyScalar((10 - dist) * 2.0)); // Strong flee force
        }
      });

      // 3. Boundary/Home force (keep them in the area)
      const originVec = new Vector3(...origin);
      const distToHome = fish.position.distanceTo(originVec);
      const homeForce = new Vector3();
      if (distToHome > range) {
        homeForce.subVectors(originVec, fish.position).multiplyScalar(0.05);
      }

      // Apply forces
      const acceleration = new Vector3()
        .add(flockForce.multiplyScalar(2.0))
        .add(avoidanceForce.multiplyScalar(5.0))
        .add(homeForce);

      fish.velocity.add(acceleration.multiplyScalar(delta));
      
      // Limit speed
      const maxSpeed = avoidanceForce.length() > 0.1 ? 8.0 : 3.0; // Swim fast if scared
      if (fish.velocity.length() > maxSpeed) {
        fish.velocity.normalize().multiplyScalar(maxSpeed);
      }

      // Move
      fish.position.add(fish.velocity.clone().multiplyScalar(delta));

      // Update Instance Matrix
      dummy.position.copy(fish.position);
      
      // Orient to velocity
      const lookTarget = fish.position.clone().add(fish.velocity);
      dummy.lookAt(lookTarget);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <coneGeometry args={[0.1, 0.4, 8]} /> {/* Simple fish shape */}
      <meshStandardMaterial color="#88ccff" roughness={0.4} metalness={0.6} />
    </instancedMesh>
  );
}
