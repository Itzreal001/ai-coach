import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = ({ count = 100 }) => {
  const points = useRef();

  const particles = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    particles[i] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#4f46e5" transparent opacity={0.6} />
    </points>
  );
};

const TimelineOrb = ({ scene, index, isActive }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.y = time * 0.5 + index;
      meshRef.current.rotation.x = Math.sin(time * 0.3 + index) * 0.2;
      
      if (isActive) {
        meshRef.current.scale.x = 1 + Math.sin(time * 3) * 0.1;
        meshRef.current.scale.y = 1 + Math.sin(time * 3) * 0.1;
        meshRef.current.scale.z = 1 + Math.sin(time * 3) * 0.1;
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[0.8, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={scene?.color || '#4f46e5'} 
          emissive={scene?.color || '#4f46e5'}
          emissiveIntensity={isActive ? 0.5 : 0.2}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.02, 16, 100]} />
        <meshBasicMaterial color={scene?.color || '#4f46e5'} transparent opacity={0.3} />
      </mesh>
    </Float>
  );
};

const SceneEnvironment = () => {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} />
      <ParticleField count={200} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[0, 10, 0]} angle={0.15} penumbra={1} intensity={0.5} />
    </>
  );
};

const EnhancedThreeScene = ({ scenes, currentScene }) => {
  const [hovered, setHovered] = useState(false);
  const [safeScenes, setSafeScenes] = useState([]);
  const [safeCurrentScene, setSafeCurrentScene] = useState(0);

  useEffect(() => {
    console.log('EnhancedThreeScene received:', { scenes, currentScene });
    
    // Validate and set safe scenes
    if (scenes && Array.isArray(scenes) && scenes.length > 0) {
      setSafeScenes(scenes);
      
      // Validate and set safe current scene
      const validatedScene = Math.max(0, Math.min(currentScene, scenes.length - 1));
      setSafeCurrentScene(validatedScene);
      
      console.log('Using safe values:', { safeScenes: scenes, safeCurrentScene: validatedScene });
    } else {
      console.warn('Invalid scenes provided, using fallback');
      setSafeScenes([{
        title: 'Your Future Journey',
        description: 'Your personalized timeline is being prepared...',
        color: '#3b82f6'
      }]);
      setSafeCurrentScene(0);
    }
  }, [scenes, currentScene]);

  // Get current scene data with fallback
  const currentSceneData = safeScenes[safeCurrentScene] || safeScenes[0] || {
    title: 'Future Visualization',
    description: 'Loading your future prediction...',
    color: '#3b82f6'
  };

  console.log('Rendering scene data:', currentSceneData);

  // If no valid scenes, show loading
  if (!safeScenes || safeScenes.length === 0) {
    return (
      <div className="enhanced-three-container">
        <div className="loading-scene">
          <h3>Loading Future Visualization...</h3>
          <p>Preparing your personalized future timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-three-container">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#0f0f23'));
        }}
      >
        <SceneEnvironment />
        
        <group 
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <TimelineOrb 
            scene={currentSceneData} 
            index={safeCurrentScene}
            isActive={true}
          />
        </group>

        <Text
          position={[0, -2.5, 0]}
          color="white"
          fontSize={0.4}
          maxWidth={4}
          textAlign="center"
        >
          {currentSceneData.title?.toUpperCase() || 'YOUR FUTURE'}
        </Text>

        <OrbitControls 
          enableZoom={hovered}
          enablePan={false}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>
      
      <div className="scene-details">
        <h3>{currentSceneData.title || 'Your Journey'}</h3>
        <p>{currentSceneData.description || 'Exploring your future possibilities...'}</p>
        <div className="scene-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${((safeCurrentScene + 1) / safeScenes.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedThreeScene;