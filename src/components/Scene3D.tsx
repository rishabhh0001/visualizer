"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

// Custom random sphere generator to avoid relying on `maath` which broke Vercel types
function generateSpherePositions(count: number, radius: number) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const r = radius * Math.cbrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
}

function ParticleField() {
    const ref = useRef<THREE.Points>(null);
    const sphere = useMemo(() => generateSpherePositions(3000, 2.5), []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 30;
            ref.current.rotation.y -= delta / 40;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#10b981"
                    size={0.008}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
}

function AbstractAudioCore() {
    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            {/* Outer shell */}
            <Sphere args={[1, 64, 64]} scale={1.2}>
                <MeshDistortMaterial
                    color="#10b981"
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                    wireframe
                    transparent
                    opacity={0.15}
                />
            </Sphere>

            {/* Inner glowing core */}
            <Sphere args={[0.7, 32, 32]}>
                <MeshDistortMaterial
                    color="#06b6d4"
                    attach="material"
                    distort={0.6}
                    speed={3}
                    roughness={0.1}
                    metalness={1}
                    emissive="#06b6d4"
                    emissiveIntensity={0.5}
                />
            </Sphere>
        </Float>
    );
}

export function Scene3D() {
    return (
        <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none">
            <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#10b981" />
                <directionalLight position={[-10, -10, -5]} intensity={1} color="#06b6d4" />
                <ParticleField />
                <AbstractAudioCore />
            </Canvas>
        </div>
    );
}
