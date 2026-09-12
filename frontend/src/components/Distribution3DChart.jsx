import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const COLORS = [
  "#059669", "#0891b2", "#7c3aed", "#dc2626", "#d97706",
  "#2563eb", "#db2777", "#65a30d", "#9333ea", "#0d9488",
];

function Slice({ startAngle, endAngle, color }) {
  const radius = 2;
  const height = 0.6;

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.absarc(0, 0, radius, startAngle, endAngle, false);
    s.lineTo(0, 0);
    return s;
  }, [startAngle, endAngle]);

  const geometry = useMemo(
    () => new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false }),
    [shape]
  );

  return (
    <mesh geometry={geometry} position={[0, 0, -height / 2]}>
      <meshStandardMaterial color={color} metalness={0.15} roughness={0.5} />
    </mesh>
  );
}

function ChartGroup({ slices }) {
  const group = useRef();
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z += delta * 0.15;
  });
  return (
    <group ref={group} rotation={[Math.PI / 2.6, 0, 0]}>
      {slices.map((s, i) => (
        <Slice key={i} startAngle={s.startAngle} endAngle={s.endAngle} color={s.color} />
      ))}
    </group>
  );
}

export default function Distribution3DChart({ breakdown, currency }) {
  const slices = useMemo(() => {
    let angle = -Math.PI / 2;
    return (breakdown || []).map((b, i) => {
      const fraction = (b.share_percent || 0) / 100;
      const sweep = fraction * Math.PI * 2;
      const slice = {
        startAngle: angle,
        endAngle: angle + sweep,
        color: COLORS[i % COLORS.length],
        label: b.label,
        percent: b.share_percent,
        amount: b.amount_total,
      };
      angle += sweep;
      return slice;
    });
  }, [breakdown]);

  if (!slices.length) return null;

  return (
    <div className="mt-6">
      <div
        style={{ height: 240, touchAction: "none" }}
        className="rounded-xl overflow-hidden bg-gray-50 border border-gray-200"
      >
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 4, 5]} intensity={0.8} />
          <ChartGroup slices={slices} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-gray-600 truncate">
              {s.label} — {s.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
