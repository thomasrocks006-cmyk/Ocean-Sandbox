/**
 * Gerstner Wave Parameters
 * Each wave is defined by: wavelength, direction, steepness, speed
 */
export interface GerstnerWave {
  wavelength: number; // λ (lambda) - distance between wave crests (meters)
  amplitude: number; // A - wave height (meters)
  steepness: number; // Q - 0 to 1, where 1 is maximum before breaking
  speed: number; // phase speed (m/s)
  direction: [number, number]; // normalized 2D direction vector
}

/**
 * Default Gerstner wave configuration for ocean simulation
 */
export const defaultWaves: GerstnerWave[] = [
  {
    wavelength: 8.0,
    amplitude: 0.4,
    steepness: 0.6,
    speed: 2.0,
    direction: [1.0, 0.0],
  },
  {
    wavelength: 6.0,
    amplitude: 0.3,
    steepness: 0.5,
    speed: 1.8,
    direction: [0.7, 0.7],
  },
  {
    wavelength: 4.0,
    amplitude: 0.2,
    steepness: 0.4,
    speed: 1.5,
    direction: [-0.5, 0.866],
  },
  {
    wavelength: 2.0,
    amplitude: 0.1,
    steepness: 0.3,
    speed: 1.0,
    direction: [0.866, -0.5],
  },
];

/**
 * Calculate Gerstner wave displacement at a given point
 * This MUST match the GPU shader implementation exactly for physics sync
 * 
 * Gerstner Wave formula:
 * x' = x - Q * A * D.x * sin(ω * (D·P) - φ * t)
 * y' = A * cos(ω * (D·P) - φ * t)
 * z' = z - Q * A * D.z * sin(ω * (D·P) - φ * t)
 * 
 * where:
 * - ω (omega) = 2π / λ (wave frequency)
 * - φ (phi) = speed * ω (phase constant)
 * - D = direction vector (normalized)
 * - P = point (x, z)
 * - Q = steepness
 * - A = amplitude
 */
export function calculateGerstnerWave(
  x: number,
  z: number,
  time: number,
  wave: GerstnerWave
): { x: number; y: number; z: number } {
  const k = (2 * Math.PI) / wave.wavelength; // wave number (omega)
  const c = wave.speed; // phase speed
  const d = wave.direction;
  const a = wave.amplitude;
  const q = wave.steepness;
  
  const f = k * (d[0] * x + d[1] * z - c * time);
  const sinF = Math.sin(f);
  const cosF = Math.cos(f);
  
  return {
    x: -q * a * d[0] * sinF,
    y: a * cosF,
    z: -q * a * d[1] * sinF,
  };
}

/**
 * Calculate total wave height at a given (x, z) position and time
 * This is the CPU-side function that physics engine uses
 * 
 * @param x - X coordinate in world space
 * @param z - Z coordinate in world space
 * @param time - Current simulation time
 * @param waves - Array of Gerstner waves (defaults to defaultWaves)
 * @returns Total Y displacement (height) at this position
 */
export function getWaveHeight(
  x: number,
  z: number,
  time: number,
  waves: GerstnerWave[] = defaultWaves
): number {
  let height = 0;
  
  for (const wave of waves) {
    const displacement = calculateGerstnerWave(x, z, time, wave);
    height += displacement.y;
  }
  
  return height;
}

/**
 * Calculate full 3D displacement for a point on the water surface
 * Used for advanced physics interactions (objects floating on surface)
 */
export function getWaveDisplacement(
  x: number,
  z: number,
  time: number,
  waves: GerstnerWave[] = defaultWaves
): { x: number; y: number; z: number } {
  const result = { x: 0, y: 0, z: 0 };
  
  for (const wave of waves) {
    const displacement = calculateGerstnerWave(x, z, time, wave);
    result.x += displacement.x;
    result.y += displacement.y;
    result.z += displacement.z;
  }
  
  return result;
}

/**
 * Calculate normal vector at a point on the water surface
 * Used for lighting and reflections
 */
export function getWaveNormal(
  x: number,
  z: number,
  time: number,
  waves: GerstnerWave[] = defaultWaves
): { x: number; y: number; z: number } {
  let nx = 0;
  let nz = 0;
  let totalQ = 0;
  
  for (const wave of waves) {
    const k = (2 * Math.PI) / wave.wavelength;
    const c = wave.speed;
    const d = wave.direction;
    const a = wave.amplitude;
    const q = wave.steepness;
    totalQ += q;
    
    const f = k * (d[0] * x + d[1] * z - c * time);
    const cosF = Math.cos(f);
    
    const wa = k * a;
    nx -= d[0] * wa * cosF;
    nz -= d[1] * wa * cosF;
  }
  
  // Construct normal: cross product of tangent vectors
  const ny = 1 - totalQ * (nx * nx + nz * nz);
  
  // Normalize
  const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
  
  return {
    x: nx / length,
    y: ny / length,
    z: nz / length,
  };
}

/**
 * Generate GLSL code for Gerstner waves
 * This ensures CPU and GPU calculations match exactly
 */
export function generateGerstnerWaveGLSL(waves: GerstnerWave[]): string {
  let code = `
vec3 gerstnerWave(vec2 position, float time) {
  vec3 totalDisplacement = vec3(0.0);
  vec3 tangent = vec3(1.0, 0.0, 0.0);
  vec3 binormal = vec3(0.0, 0.0, 1.0);
  
`;

  waves.forEach((wave, index) => {
    const k = (2 * Math.PI) / wave.wavelength;
    const c = wave.speed;
    const dx = wave.direction[0];
    const dz = wave.direction[1];
    const a = wave.amplitude;
    const q = wave.steepness;
    
    code += `
  // Wave ${index + 1}
  {
    float k = ${k.toFixed(6)};
    float c = ${c.toFixed(6)};
    vec2 d = vec2(${dx.toFixed(6)}, ${dz.toFixed(6)});
    float a = ${a.toFixed(6)};
    float q = ${q.toFixed(6)};
    
    float f = k * (dot(d, position) - c * time);
    float sinF = sin(f);
    float cosF = cos(f);
    
    totalDisplacement.x += -q * a * d.x * sinF;
    totalDisplacement.y += a * cosF;
    totalDisplacement.z += -q * a * d.y * sinF;
    
    tangent += vec3(-q * d.x * d.x * a * k * cosF, d.x * a * k * sinF, -q * d.x * d.y * a * k * cosF);
    binormal += vec3(-q * d.x * d.y * a * k * cosF, d.y * a * k * sinF, -q * d.y * d.y * a * k * cosF);
  }
`;
  });
  
  code += `
  return totalDisplacement;
}

vec3 gerstnerNormal(vec2 position, float time) {
  vec3 tangent = vec3(1.0, 0.0, 0.0);
  vec3 binormal = vec3(0.0, 0.0, 1.0);
  
`;

  waves.forEach((wave) => {
    const k = (2 * Math.PI) / wave.wavelength;
    const c = wave.speed;
    const dx = wave.direction[0];
    const dz = wave.direction[1];
    const a = wave.amplitude;
    const q = wave.steepness;
    
    code += `
  {
    float k = ${k.toFixed(6)};
    float c = ${c.toFixed(6)};
    vec2 d = vec2(${dx.toFixed(6)}, ${dz.toFixed(6)});
    float a = ${a.toFixed(6)};
    float q = ${q.toFixed(6)};
    
    float f = k * (dot(d, position) - c * time);
    float wa = k * a;
    float cosF = cos(f);
    
    tangent.x += -q * d.x * d.x * wa * cosF;
    tangent.y += d.x * wa * sin(f);
    tangent.z += -q * d.x * d.y * wa * cosF;
    
    binormal.x += -q * d.x * d.y * wa * cosF;
    binormal.y += d.y * wa * sin(f);
    binormal.z += -q * d.y * d.y * wa * cosF;
  }
`;
  });
  
  code += `
  return normalize(cross(binormal, tangent));
}
`;

  return code;
}
