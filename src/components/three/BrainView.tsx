'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRagStore, RagNode } from '@/store/ragStore';
import { MODE_CONFIG } from '@/lib/modeConfig';
import { Mode } from '@/store/modeStore';

// ── Query node (centre) ───────────────────────────────────────────────────────
function QueryNode({ color }: { color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.8;
            meshRef.current.rotation.x += delta * 0.4;
        }
    });
    return (
        <mesh ref={meshRef}>
            <octahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.8}
                wireframe
            />
        </mesh>
    );
}

// ── Individual retrieved memory node ─────────────────────────────────────────
function MemoryNode({
    node,
    color,
    delay,
}: {
    node: RagNode;
    color: string;
    delay: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const tRef = useRef(0);
    const origin = useMemo(() => new THREE.Vector3(...node.pos), [node.pos]);

    // Imperative THREE.Line to avoid JSX <line> SVG conflict
    const lineObj = useMemo(() => {
        const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(node.pos[0], node.pos[1], node.pos[2]),
        ]);
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25 });
        return new THREE.Line(geo, mat);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [node.pos]);

    useFrame((_, delta) => {
        tRef.current += delta;
        if (meshRef.current) {
            // Float gently
            meshRef.current.position.y = origin.y + Math.sin(tRef.current + delay) * 0.08;
            // Pulse scale by score
            const pulse = 1 + Math.sin(tRef.current * 2 + delay) * 0.06;
            const base = 0.1 + node.score * 0.22;
            meshRef.current.scale.setScalar(base * pulse);
        }
    });

    const opacity = 0.4 + node.score * 0.6;

    return (
        <group>
            {/* Edge line rendered as primitive to avoid SVG <line> type conflict */}
            <primitive object={lineObj} />

            {/* Memory node sphere */}
            <mesh ref={meshRef} position={origin}>
                <sphereGeometry args={[0.18, 12, 12]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={node.score * 2.5}
                    transparent
                    opacity={opacity}
                />
                {/* Score label */}
                <Html distanceFactor={6} center>
                    <div
                        className="text-[9px] font-mono px-1 rounded pointer-events-none whitespace-nowrap"
                        style={{ color, opacity: opacity * 0.9, background: 'rgba(0,0,0,0.6)' }}
                    >
                        {Math.round(node.score * 100)}%
                    </div>
                </Html>
            </mesh>
        </group>
    );
}

// ── Retrieval ripple wave ────────────────────────────────────────────────────
function RetrievalWave({ color }: { color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const tRef = useRef(0);

    useFrame((_, delta) => {
        tRef.current += delta * 1.5;
        if (meshRef.current) {
            const s = tRef.current % 2;
            meshRef.current.scale.setScalar(s * 3);
            (meshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.3 - s * 0.15);
        }
    });

    return (
        <mesh ref={meshRef}>
            <torusGeometry args={[1, 0.02, 8, 64]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
    );
}

// ── Scene compositor ─────────────────────────────────────────────────────────
function BrainScene({ trace, color }: { trace: NonNullable<ReturnType<typeof useRagStore.getState>['activeTrace']>; color: string }) {
    const { camera } = useThree();
    useEffect(() => {
        camera.position.set(0, 0, 7);
    }, [camera]);

    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 0, 0]} intensity={2} color={color} />
            <QueryNode color={color} />
            <RetrievalWave color={color} />
            {trace.nodes.map((node, i) => (
                <MemoryNode key={node.id} node={node} color={color} delay={i * 0.7} />
            ))}
        </>
    );
}

// ── Public component — rendered as an overlay in AIChat ──────────────────────
interface BrainViewProps {
    mode: Mode;
}

export default function BrainView({ mode }: BrainViewProps) {
    const { activeTrace, isVisible, setVisible } = useRagStore();
    const config = MODE_CONFIG[mode];
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Auto-hide after 6 seconds
    useEffect(() => {
        if (!isVisible) return;
        const t = setTimeout(() => setVisible(false), 6000);
        return () => clearTimeout(t);
    }, [isVisible, setVisible]);

    return (
        <AnimatePresence>
            {isVisible && activeTrace && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="absolute inset-0 z-20 pointer-events-none rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
                >
                    {/* Header */}
                    <div className="absolute top-3 left-4 z-30 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: config.accent }} />
                        <span className="text-[10px] font-mono" style={{ color: config.accent }}>
                            NEURAL RETRIEVAL · {activeTrace.nodes.length} nodes · {activeTrace.latencyMs}ms
                            {activeTrace.demo ? ' · DEMO' : ''}
                        </span>
                    </div>

                    {/* Query label */}
                    <div className="absolute top-8 left-4 right-4 z-30">
                        <p className="text-[9px] text-white/40 font-mono truncate">
                            query: &quot;{activeTrace.queryLabel}&quot;
                        </p>
                    </div>

                    {/* 3D Canvas */}
                    <Canvas
                        camera={{ position: [0, 0, 7], fov: 55 }}
                        gl={{ antialias: !isMobile, alpha: true }}
                        style={{ background: 'transparent', width: '100%', height: '100%' }}
                        dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
                    >
                        <BrainScene trace={activeTrace} color={config.accent} />
                    </Canvas>

                    {/* Close hint */}
                    <div className="absolute bottom-3 right-4 z-30">
                        <span className="text-[9px] text-white/20">fades automatically</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
