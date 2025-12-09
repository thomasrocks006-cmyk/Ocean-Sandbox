import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Core/Scene';
import { Shark } from './components/Entities/Shark';
import { Human } from './components/Entities/Human';
import { HUD } from './components/UI/HUD';
import { GodModeControls } from './components/UI/GodModeControls';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000814' }}>
      <HUD />
      <GodModeControls />
      
      <Canvas
        shadows
        camera={{
          position: [15, 10, 15],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
      >
        <Scene>
          {/* Spawn initial shark */}
          <Shark position={[0, -5, 0]} />
          
          {/* Spawn Humans */}
          <Human position={[10, -1, 5]} type="human" />
          <Human position={[-10, -1, -5]} type="diver" />
          
          {/* Add more entities here */}
        </Scene>
      </Canvas>
    </div>
  );
}

export default App;
