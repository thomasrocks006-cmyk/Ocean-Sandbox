import { useStore } from '../../store/useStore';
import { PredatorState } from '../../utils/predatorFSM';

/**
 * Simple HUD displaying simulation stats
 */
export function HUD() {
  const entities = useStore((state) => state.entities);
  const paused = useStore((state) => state.paused);
  const godMode = useStore((state) => state.godMode);
  
  // Get shark state and hunger
  const sharks = Array.from(entities.values()).filter(e => e.type === 'shark');
  const sharkState = sharks[0]?.state || PredatorState.IDLE;
  
  // Count entities by type
  const rocks = Array.from(entities.values()).filter(e => e.type === 'rock').length;
  const blood = Array.from(entities.values()).filter(e => e.type === 'blood').length;
  const prey = Array.from(entities.values()).filter(e => e.type === 'fish').length;
  
  // Get state color
  const getStateColor = (state: string): string => {
    switch (state) {
      case PredatorState.IDLE:
        return '#4a90e2';
      case PredatorState.PATROL:
        return '#7ed321';
      case PredatorState.INVESTIGATE:
        return '#50e3c2';
      case PredatorState.STALK:
        return '#8b572a';
      case PredatorState.HUNT:
        return '#f5a623';
      case PredatorState.ATTACK:
        return '#d0021b';
      case PredatorState.REST:
        return '#9b9b9b';
      case PredatorState.FLEE:
        return '#bd10e0';
      default:
        return '#ffffff';
    }
  };
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '14px',
        background: 'rgba(0, 0, 0, 0.6)',
        padding: '15px',
        borderRadius: '8px',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
        🌊 Ocean Sandbox 2.0
      </h3>
      <div>Entities: {entities.size} (🦈 {sharks.length} | 🪨 {rocks} | 🩸 {blood} | 🐟 {prey})</div>
      <div>Status: {paused ? '⏸️ PAUSED' : '▶️ RUNNING'}</div>
      <div>Mode: {godMode ? '👁️ GOD MODE' : '👤 OBSERVE'}</div>
      
      {sharks.length > 0 && (
        <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '10px' }}>
          <div style={{ fontSize: '12px' }}>
            <strong>🦈 Shark AI State:</strong>
          </div>
          <div style={{ 
            color: getStateColor(sharkState), 
            fontWeight: 'bold',
            fontSize: '16px',
            marginTop: '5px',
          }}>
            {sharkState}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.8 }}>
        <strong>✨ Module 3: The Brain</strong><br/>
        • Raycasting vision (3 rays)<br/>
        • Smell detection (50 unit range)<br/>
        • Hunger mechanics<br/>
        • FSM-driven behavior<br/>
      </div>
      
      <div style={{ marginTop: '5px', fontSize: '12px', opacity: 0.6 }}>
        <strong>Module 2:</strong> Procedural animation<br/>
        <strong>Module 1:</strong> Gerstner waves<br/>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.7 }}>
        Controls: Orbit = Drag | Zoom = Scroll | Pan = Right-Click
      </div>
    </div>
  );
}
