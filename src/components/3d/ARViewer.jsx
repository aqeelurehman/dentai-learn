/**
 * ARViewer.jsx – Loads Blender-exported GLB models for AR topics
 * Models are in /public/models/*.glb, created via Blender Python scripts
 * This file is code-split and lazy-loaded when a user opens an AR topic
 */
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Text, Float, Html } from "@react-three/drei";

/* ── GLB paths ── */
const MODEL_PATHS = {
  tooth:      "/models/tooth.glb",
  cyst:       "/models/cyst.glb",
  resorption: "/models/resorption.glb",
  jaw:        "/models/jaw.glb",
  tumor:      "/models/tumor.glb",
  bone:       "/models/bone.glb",
};

/* ── Preload all models so they stream in parallel ── */
Object.values(MODEL_PATHS).forEach((path) => useGLTF.preload(path));

/* ── Label config per model (anatomy annotations) ── */
const MODEL_LABELS = {
  tooth: [
    { text: "Enamel",    pos: [0.8, 0.8, 0],  color: "#c9a84c" },
    { text: "Pulp",      pos: [0.7, 0.3, 0],  color: "#ff3355" },
    { text: "CEJ",       pos: [0.6, 0.0, 0],  color: "#d4c4a8" },
    { text: "Root",      pos: [0.6, -0.6, 0], color: "#c9b89a" },
    { text: "Apex",      pos: [0.5, -1.1, 0], color: "#888888" },
  ],
  cyst: [
    { text: "Cyst Wall (Fibrous)",  pos: [0, 1.4, 0],   color: "#c9a84c", bold: true },
    { text: "Epithelial Lining",    pos: [0, 1.15, 0],   color: "#e0a0a5" },
    { text: "Fluid Content",        pos: [0, -1.3, 0],   color: "#7bb8d4" },
    { text: "Unerupted Tooth",      pos: [0.6, 0.25, 0], color: "#e8dcc8" },
  ],
  resorption: [
    { text: "External Root Resorption", pos: [0, 1.2, 0],   color: "#F59E0B", bold: true },
    { text: "Howship's Lacunae",        pos: [0.6, -0.4, 0], color: "#ff4444" },
    { text: "Osteoclast Markers",       pos: [0.7, -0.7, 0], color: "#c060c0" },
    { text: "Inflammatory Tissue",      pos: [0, -1.3, 0],   color: "#ff6666" },
  ],
  jaw: [
    { text: "Mandibular Arch",     pos: [0, 1.0, 0],    color: "#10B981", bold: true },
    { text: "IAN Canal",           pos: [0, -0.6, 0],   color: "#ff4444" },
    { text: "Mental Foramen",      pos: [0.7, 0.4, 0],  color: "#888888" },
    { text: "Alveolar Ridge",      pos: [0, 0.65, 0.5], color: "#c9a84c" },
  ],
  tumor: [
    { text: "Ameloblastoma",                pos: [0, 1.4, 0],  color: "#EF4444", bold: true },
    { text: "Multilocular soap-bubble",     pos: [0, 1.1, 0],  color: "#888888" },
    { text: "Stellate Reticulum",           pos: [0, 0, 0.5],  color: "#e080a0" },
    { text: "Locally aggressive",           pos: [0, -1.2, 0], color: "#fca5a5" },
  ],
  bone: [
    { text: "Fibrous Dysplasia",            pos: [0, 1.2, 0],  color: "#EC4899", bold: true },
    { text: "Ground-glass appearance",      pos: [0, 0.9, 0],  color: "#888888" },
    { text: "Chinese-letter pattern",       pos: [0, -1.0, 0], color: "#f9a8d4" },
  ],
};

/* ── Individual GLB Model Component ── */
function GLBModel({ path, scale = 1.8, rotationSpeed = 0.4 }) {
  const { scene } = useGLTF(path);
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
    }
  });

  return (
    <primitive
      ref={ref}
      object={scene.clone()}
      scale={scale}
      dispose={null}
    />
  );
}

/* ── Floating Labels ── */
function ModelLabels({ labels = [] }) {
  return (
    <group>
      {labels.map((l, i) => (
        <Float key={i} speed={1.2} floatIntensity={l.bold ? 0.2 : 0.1}>
          <Text
            position={l.pos}
            fontSize={l.bold ? 0.11 : 0.08}
            color={l.color}
            anchorX="center"
            fontWeight={l.bold ? "bold" : "normal"}
          >
            {l.text}
          </Text>
        </Float>
      ))}
    </group>
  );
}

/* ── Loading Fallback inside Canvas ── */
function LoadingFallback() {
  return (
    <Html center>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        color: "#c9a84c",
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid rgba(201,168,76,0.2)",
          borderTop: "3px solid #c9a84c",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <div style={{ fontSize: 13, fontWeight: 700 }}>Loading Blender Model…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Html>
  );
}

/* ── Main ARViewer Export ── */
export default function ARViewer({ model = "tooth" }) {
  const path = MODEL_PATHS[model] || MODEL_PATHS.tooth;
  const labels = MODEL_LABELS[model] || [];

  /* Scale adjustments per model for best viewport fit */
  const scaleMap = {
    tooth: 2.0, cyst: 1.5, resorption: 1.8,
    jaw: 1.3, tumor: 1.4, bone: 1.5,
  };
  const speedMap = {
    tooth: 0.5, cyst: 0.4, resorption: 0.35,
    jaw: 0.3, tumor: 0.35, bone: 0.25,
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <Canvas shadows camera={{ position: [0, 0.5, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.9} castShadow />
        <pointLight position={[-3, 2, 3]} intensity={0.35} color="#c9a84c" />
        <pointLight position={[3, -2, -3]} intensity={0.25} color="#8B5CF6" />

        <Suspense fallback={<LoadingFallback />}>
          <GLBModel
            path={path}
            scale={scaleMap[model] || 1.8}
            rotationSpeed={speedMap[model] || 0.4}
          />
          <ModelLabels labels={labels} />
        </Suspense>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          autoRotate
          autoRotateSpeed={0.8}
          maxDistance={8}
          minDistance={1.5}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
