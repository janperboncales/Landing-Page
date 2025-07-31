
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import ProfileCard from './components/ProfileCard';
import Scene from './components/Scene';

function App() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-gray-900">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
      <div 
        className="relative z-10 flex items-center justify-center w-full h-full"
        style={{ perspective: '1000px' }}
      >
        <ProfileCard />
      </div>
    </main>
  );
}

export default App;