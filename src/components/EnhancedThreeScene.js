import React, { useRef, useState } from 'react';
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
      
      // Pulsing animation for active scene
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
          color={scene.color} 
          emissive={scene.color}
          emissiveIntensity={isActive ? 0.5 : 0.2}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
      
      {/* Orbital rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.02, 16, 100]} />
        <meshBasicMaterial color={scene.color} transparent opacity={0.3} />
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
            scene={scenes[currentScene]} 
            index={currentScene}
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
          {scenes[currentScene].title.toUpperCase()}
        </Text>

        <OrbitControls 
          enableZoom={hovered}
          enablePan={false}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>
      
      <div className="scene-details">
        <h3>{scenes[currentScene].title}</h3>
        <p>{scenes[currentScene].description}</p>
        <div className="scene-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedThreeScene;