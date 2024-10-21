import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { TextureLoader, Color, Float32BufferAttribute } from 'three';

const TerrainMesh = ({ texture }) => {
    const meshRef = useRef();

    // Adjust the rotation speed
    const rotationSpeed = 0.001;

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x += rotationSpeed;
            meshRef.current.rotation.y += rotationSpeed;
        }
    });

    useEffect(() => {
        if (meshRef.current) {
            // Add vertex colors manually (example with gradient)
            const geometry = meshRef.current.geometry;
            const count = geometry.attributes.position.count;
            const colors = [];

            for (let i = 0; i < count; i++) {
                // Color gradient from green (lower points) to brown (higher points)
                const y = geometry.attributes.position.getY(i);
                const color = new Color(
                    y > 0 ? 0.8 : 0.2, // R
                    y > 0 ? 0.5 : 0.6, // G
                    y > 0 ? 0.2 : 0.2  // B
                );
                colors.push(color.r, color.g, color.b);
            }

            geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
        }
    }, []);

    return (
        <mesh ref={meshRef} position={[0, 0, 0]} receiveShadow castShadow>
            {/* Enlarge the plane geometry */}
            <planeGeometry args={[10, 10, 64, 64]} />
            <meshStandardMaterial
                map={texture}
                vertexColors
            />
        </mesh>
    );
};

const TerrainView = ({ imageSrc }) => {
    const [texture, setTexture] = useState(null);

    useEffect(() => {
        const loader = new TextureLoader();
        if (imageSrc) {
            loader.load(
                imageSrc,
                (loadedTexture) => {
                    setTexture(loadedTexture);
                },
                undefined,
                (error) => {
                    console.error('Error loading texture:', error);
                }
            );
        }
    }, [imageSrc]);

    return (
        <Canvas style={{ width: '100%', height: '500px' }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
            {texture && <TerrainMesh texture={texture} />}
            <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
    );
};

export default TerrainView;
