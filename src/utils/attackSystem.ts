import { Vector3 } from 'three';

export enum AttackType {
  BUMP = 'bump',
  BITE_AND_RELEASE = 'bite_and_release',
  THRASH = 'thrash',
  BREACH = 'breach',
}

export interface AttackResult {
  damage: number;
  bleedIntensity: number;
  severedLimb: boolean;
  force: Vector3;
  type: AttackType;
}

export const ATTACK_CONSTANTS = {
  BITE_FORCE: 18000, // Newtons (Great White max)
  TEETH_SHARPNESS: 0.9, // 0-1
  BREACH_SPEED_THRESHOLD: 10, // m/s
  CRITICAL_DAMAGE_THRESHOLD: 50,
};

/**
 * Determine the type of attack based on shark's state and approach
 */
export function determineAttackType(
  sharkVelocity: Vector3,
  targetType: string
): AttackType {
  const speed = sharkVelocity.length();
  const verticalVelocity = sharkVelocity.y;

  // Breach: High speed, coming from below
  if (verticalVelocity > 5 && speed > ATTACK_CONSTANTS.BREACH_SPEED_THRESHOLD) {
    return AttackType.BREACH;
  }

  // Humans: Often investigated or bite-and-release
  if (targetType === 'human' || targetType === 'diver') {
    // If moving slowly, it might just be a bump/investigation
    if (speed < 2) return AttackType.BUMP;
    return AttackType.BITE_AND_RELEASE;
  }

  // Seals/Fish: Thrash to kill
  return AttackType.THRASH;
}

/**
 * Calculate damage and effects of an attack
 */
export function calculateAttackDamage(
  attackType: AttackType,
  sharkVelocity: Vector3
): AttackResult {
  let baseDamage = 0;
  let bleedIntensity = 0;
  let severedLimb = false;
  let forceMultiplier = 1.0;

  switch (attackType) {
    case AttackType.BUMP:
      baseDamage = 5;
      bleedIntensity = 0;
      forceMultiplier = 0.5;
      break;

    case AttackType.BITE_AND_RELEASE:
      baseDamage = 40; // Significant but survivable
      bleedIntensity = 0.5; // Heavy bleeding
      forceMultiplier = 1.0;
      break;

    case AttackType.THRASH:
      baseDamage = 100; // Fatal
      bleedIntensity = 1.0; // Massive bleeding
      severedLimb = true;
      forceMultiplier = 1.5;
      break;

    case AttackType.BREACH:
      baseDamage = 150; // Instant kill usually
      bleedIntensity = 0.8;
      severedLimb = Math.random() > 0.5;
      forceMultiplier = 3.0;
      break;
  }

  // Physics force applied to target
  const force = sharkVelocity.clone().normalize().multiplyScalar(ATTACK_CONSTANTS.BITE_FORCE * forceMultiplier);

  return {
    damage: baseDamage,
    bleedIntensity,
    severedLimb,
    force,
    type: attackType,
  };
}
