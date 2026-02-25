'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useModeStore } from '@/store/modeStore';
import * as THREE from 'three';

// ---- Binary Particle Field (Developer) ----
function BinaryParticleField() {
    const mesh = useRef<THREE.Points>(null!);
    const count = 2000;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            pos[i] = (Math.random() - 0.5) * 20;
        }
        return pos;
    }, []);

    useFrame((state) => {
        mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
        mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#00ffcc" size={0.05} transparent opacity={0.75} />
        </points>
    );
}

// ---- Geometric Floater (Student) ----
function GeometricFloater() {
    const groupRef = useRef<THREE.Group>(null!);
    useFrame((state) => {
        groupRef.current.rotation.x = state.clock.elapsedTime * 0.2;
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    });

    return (
        <group ref={groupRef}>
            <mesh position={[0, 0, 0]}>
                <icosahedronGeometry args={[2, 1]} />
                <meshStandardMaterial color="#a78bfa" wireframe />
            </mesh>
            <mesh position={[3, 1, -2]}>
                <torusGeometry args={[0.8, 0.3, 8, 20]} />
                <meshStandardMaterial color="#c4b5fd" wireframe />
            </mesh>
            <mesh position={[-3, -1, -1]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#7c3aed" wireframe />
            </mesh>
        </group>
    );
}

// ---- Data Grid Sphere (Enquiry) ----
function DataGridSphere() {
    const meshRef = useRef<THREE.Mesh>(null!);
    const gridRef = useRef<THREE.GridHelper>(null!);

    useFrame((state) => {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
        meshRef.current.rotation.x = state.clock.elapsedTime * 0.05;
        if (gridRef.current) {
            (gridRef.current.material as THREE.Material & { opacity: number }).opacity =
                0.2 + 0.1 * Math.sin(state.clock.elapsedTime);
        }
    });

    return (
        <>
            <mesh ref={meshRef}>
                <sphereGeometry args={[2, 24, 24]} />
                <meshStandardMaterial color="#f59e0b" wireframe />
            </mesh>
            <gridHelper
                ref={gridRef}
                args={[20, 20, '#f59e0b', '#27272a']}
                position={[0, -3, 0]}
            />
        </>
    );
}

// ---- Organic Blob (Everyday) ----
function OrganicBlob() {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const geo = meshRef.current.geometry as THREE.SphereGeometry;
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const len = Math.sqrt(x * x + y * y + z * z);
            const nx = x / len;
            const ny = y / len;
            const nz = z / len;
            const wave = 0.3 * Math.sin(nx * 3 + t) * Math.cos(ny * 3 + t * 0.5) * Math.sin(nz * 2 + t * 0.7);
            pos.setXYZ(i, nx * (1.8 + wave), ny * (1.8 + wave), nz * (1.8 + wave));
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
        meshRef.current.rotation.y = t * 0.1;
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1.8, 64, 64]} />
            <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.1} />
        </mesh>
    );
}

// ---- Cosmic Network (System) ----
function CosmicNetwork() {
    const groupRef = useRef<THREE.Group>(null!);
    const nodeCount = 30;

    const nodes = useMemo(() => {
        return Array.from({ length: nodeCount }, () => ({
            position: [
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
            ] as [number, number, number],
        }));
    }, []);

    useFrame((state) => {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    });

    return (
        <group ref={groupRef}>
            {nodes.map((node, i) => (
                <mesh key={i} position={node.position}>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1} />
                </mesh>
            ))}
        </group>
    );
}

// ---- Scene Router ----
function ThreeScene() {
    const activeMode = useModeStore((s) => s.activeMode);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            {activeMode === 'developer' && <BinaryParticleField />}
            {activeMode === 'student' && <GeometricFloater />}
            {activeMode === 'enquiry' && <DataGridSphere />}
            {activeMode === 'everyday' && <OrganicBlob />}
            {activeMode === 'system' && <CosmicNetwork />}
        </>
    );
}

// ---- Main Export ----
export default function ThreeBackground() {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ThreeScene />
            </Canvas>
        </div>
    );
}
