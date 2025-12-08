import { useStore } from '../../store/useStore';

/**
 * Simple HUD displaying simulation stats
 */
export function HUD() {
  const entities = useStore((state) => state.entities);
  const paused = useStore((state) => state.paused);
  const godMode = useStore((state) => state.godMode);
  
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
      <div>Entities: {entities.size}</div>
      <div>Status: {paused ? '⏸️ PAUSED' : '▶️ RUNNING'}</div>
      <div>Mode: {godMode ? '👁️ GOD MODE' : '👤 OBSERVE'}</div>
      <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.7 }}>
        Controls: Orbit = Drag | Zoom = Scroll | Pan = Right-Click
      </div>
    </div>
  );
}
