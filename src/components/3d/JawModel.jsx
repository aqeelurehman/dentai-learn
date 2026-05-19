/**
 * JawModel.jsx – Loads Blender-exported jaw GLB model
 * Used for mandibular architecture visualization with optional pathology markers
 */
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Text, Html } from "@react-three/drei";

useGLTF.preload("/models/jaw.glb");

function JawScene({ showPathology = false, pathologyType = "cyst" }) {
  const { scene } = useGLTF("/models/jaw.glb");
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const pathologyColors = { cyst: "#c9a84c", tumor: "#8B5CF6", dysplasia: "#EC4899" };
  const pathologyLabels = { cyst: "Cyst", tumor: "Tumor", dysplasia: "Fibrous Dysplasia" };

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      <primitive object={scene.clone()} scale={1.3} dispose={null} />

      {showPathology && (
        <group>
          <mesh position={pathologyType === "cyst" ? [0.8, 0.3, 0.5] : pathologyType === "tumor" ? [-0.6, 0.3, 0.4] : [0, 0.3, 0.6]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color={pathologyColors[pathologyType]}
              transparent opacity={0.6}
              emissive={pathologyColors[pathologyType]}
              emissiveIntensity={0.3}
            />
          </mesh>
          <Text
            position={pathologyType === "cyst" ? [0.8, 0.6, 0.5] : pathologyType === "tumor" ? [-0.6, 0.6, 0.4] : [0, 0.6, 0.6]}
            fontSize={0.08}
            color={pathologyColors[pathologyType]}
            anchorX="center"
          >
            {pathologyLabels[pathologyType]}
          </Text>
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
        <div style={{ fontSize: 12, fontWeight: 700 }}>Loading Jaw Model…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Html>
  );
}

export default function JawModel3D({ height = 350, showPathology = false, pathologyType = "cyst" }) {
  return (
    <div style={{
      height,
      width: "100%",
      borderRadius: 16,
      overflow: "hidden",
      background: "linear-gradient(135deg, #080e1c 0%, #0d1628 100%)"
    }}>
      <Canvas camera={{ position: [0, 2, 3.5], fov: 40 }} shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
        <pointLight position={[-2, 3, 2]} intensity={0.4} color="#c9a84c" />

        <Suspense fallback={<LoadingFallback />}>
          <JawScene showPathology={showPathology} pathologyType={pathologyType} />
        </Suspense>

        <OrbitControls enablePan enableZoom enableRotate maxDistance={8} minDistance={2} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
