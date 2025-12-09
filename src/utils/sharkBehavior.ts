export const SHARK_CONSTANTS = {
  SENSES: {
    SMELL_RANGE: 2000, // meters (2km)
    HEARING_RANGE: 1500, // meters
    LATERAL_LINE_RANGE: 200, // meters
    VISION_CLEAR: 20, // meters
    VISION_MURKY: 5, // meters
    ELECTRORECEPTION: 0.5, // meters
  },
  MOVEMENT: {
    PATROL_SPEED: 3.25, // km/h approx 0.9 m/s
    BURST_SPEED: 13.8, // 50 km/h approx 13.8 m/s
    TURN_SPEED: 2.0,
  },
  STATS: {
    MAX_HUNGER: 100,
    MAX_STAMINA: 100,
    MAX_CURIOSITY: 100,
    HUNGER_DECAY: 0.01, // Very slow
    STAMINA_RECOVERY: 0.5,
    STAMINA_DRAIN_BURST: 5.0,
  }
};

export interface SharkBrainState {
  hunger: number;
  stamina: number;
  curiosity: number;
  fear: number;
  targetId: string | null;
  targetType: 'prey' | 'human' | 'unknown' | null;
  lastMealTime: number;
}

export const INITIAL_BRAIN_STATE: SharkBrainState = {
  hunger: 20, // Starts slightly hungry
  stamina: 100,
  curiosity: 50,
  fear: 0,
  targetId: null,
  targetType: null,
  lastMealTime: Date.now(),
};
