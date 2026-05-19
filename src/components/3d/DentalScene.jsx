/**
 * DentalScene.jsx – Loads Blender GLB models for cyst, tumor, bone pathology views
 * Used in module detail pages for pathology-specific 3D visualization
 */
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Text, Html } from "@react-three/drei";

useGLTF.preload("/models/cyst.glb");
useGLTF.preload("/models/tumor.glb");
useGLTF.preload("/models/bone.glb");

function GLBPathology({ path, scale = 1.5, label, sublabel, labelColor = "#c9a84c" }) {
  const { scene } = useGLTF(path);
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.4;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group>
      <primitive ref={ref} object={scene.clone()} scale={scale} dispose={null} />
      {label && (
        <Text position={[0, 1.5, 0]} fontSize={0.14} color={labelColor} anchorX="center" fontWeight="bold">
          {label}
        </Text>
      )}
      {sublabel && (
        <Text position={[0, -1.4, 0]} fontSize={0.09} color="#888" anchorX="center">
          {sublabel}
        </Text>
      )}
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        color: "#c9a84c", fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid rgba(201,168,76,0.2)",
          borderTop: "3px solid #c9a84c",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <div style={{ fontSize: 12, fontWeight: 700 }}>Loading 3D Model…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Html>
  );
}

const MODEL_CONFIG = {
  cyst:  { path: "/models/cyst.glb",  scale: 1.4, label: "Dentigerous Cyst", sublabel: "Epithelial lining from REE", color: "#c9a84c" },
  tumor: { path: "/models/tumor.glb", scale: 1.3, label: "Ameloblastoma",     sublabel: "Multilocular — Follicular variant", color: "#EF4444" },
  bone:  { path: "/models/bone.glb",  scale: 1.4, label: "Fibrous Dysplasia", sublabel: "Ground-glass appearance — Woven bone trabeculae", color: "#EC4899" },
};

export default function DentalScene3D({ model = "cyst", height = 400 }) {
  const cfg = MODEL_CONFIG[model] || MODEL_CONFIG.cyst;

  return (
    <div style={{
      height,
      width: "100%",
      borderRadius: 16,
      overflow: "hidden",
      background: "linear-gradient(180deg, #080e1c 0%, #0d1628 50%, #080e1c 100%)"
    }}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-dp-muted">Loading 3D Model...</div>
      }>
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }} shadows>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-3, 2, 3]} intensity={0.4} color="#c9a84c" />
          <pointLight position={[3, -2, -3]} intensity={0.3} color="#8B5CF6" />

          <Suspense fallback={<LoadingFallback />}>
            <GLBPathology
              path={cfg.path}
              scale={cfg.scale}
              label={cfg.label}
              sublabel={cfg.sublabel}
              labelColor={cfg.color}
            />
          </Suspense>

          <OrbitControls enablePan enableZoom enableRotate autoRotate autoRotateSpeed={0.5} />
          <Environment preset="night" />
        </Canvas>
      </Suspense>
    </div>
  );
}
