import React from 'react';
import ReactDOM from 'react-dom/client';
import { useGLTF } from '@react-three/drei';
import App from './App.tsx';
import './index.css';

// Preload 3D models for faster initial load
useGLTF.preload('/models/shark.glb');
useGLTF.preload('/models/human.glb');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
