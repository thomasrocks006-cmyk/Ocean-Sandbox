import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Core/Scene';
import { Shark } from './components/Entities/Shark';
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
          
          {/* Add more entities here */}
          {/* <Shark position={[5, -5, 0]} /> */}
          {/* <Tuna position={[-5, -3, 0]} /> */}
        </Scene>
      </Canvas>
    </div>
  );
}

export default App;
