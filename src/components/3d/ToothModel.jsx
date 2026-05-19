/**
 * ToothModel.jsx – Loads Blender-exported GLB models for Modules page
 * Each module can specify its own 3D model file via the modelPath prop
 */
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Text, Html } from "@react-three/drei";

// Preload default tooth model
useGLTF.preload("/models/tooth.glb");

function ToothScene({ modelPath = "/models/tooth.glb", showPulp = true, showLabels = true, autoRotate = true }) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef();

  useFrame((state) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  /* Toggle visibility of pulp/canal nodes based on props */
  const clonedScene = scene.clone();
  clonedScene.traverse((child) => {
    if (!showPulp && (child.name === "Pulp_Chamber" || child.name?.includes("Canal"))) {
      child.visible = false;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={2.0} dispose={null} />
      {showLabels && (
        <group>
          <Text position={[0.8, 0.9, 0]} fontSize={0.08} color="#c9a84c" anchorX="left">Crown (Enamel)</Text>
          <Text position={[0.7, 0.6, 0]} fontSize={0.08} color="#ff4466" anchorX="left">Pulp Chamber</Text>
          <Text position={[0.7, 0.0, 0]} fontSize={0.08} color="#d4c4a8" anchorX="left">CEJ</Text>
          <Text position={[0.6, -0.6, 0]} fontSize={0.08} color="#c9b89a" anchorX="left">Root</Text>
          <Text position={[0.5, -1.1, 0]} fontSize={0.07} color="#888" anchorX="left">Apex</Text>
        </group>
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
        <div style={{ fontSize: 12, fontWeight: 700 }}>Loading 3D Model...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Html>
  );
}

export default function ToothModel3D({
  height = 400,
  modelPath = "/models/tooth.glb",
  showPulp = true,
  showLabels = true,
  autoRotate = true,
}) {
  return (
    <div style={{
      height,
      width: "100%",
      borderRadius: 16,
      overflow: "hidden",
      background: "linear-gradient(135deg, #080e1c 0%, #0d1628 100%)"
    }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} shadows>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#c9a84c" />

        <Suspense fallback={<LoadingFallback />}>
          <ToothScene
            modelPath={modelPath}
            showPulp={showPulp}
            showLabels={showLabels}
            autoRotate={autoRotate}
          />
        </Suspense>

        <OrbitControls enablePan enableZoom enableRotate maxDistance={8} minDistance={2} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
