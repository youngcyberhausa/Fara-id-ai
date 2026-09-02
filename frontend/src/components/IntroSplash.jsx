import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SPLASH_DURATION_MS = 3000;

export default function IntroSplash({ onFinish }) {
  const mountRef = useRef(null);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020806);
    scene.fog = new THREE.FogExp2(0x020806, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.1, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const greenLight = new THREE.PointLight(0x00ff9d, 26, 15);
    greenLight.position.set(0, 3, 4);
    scene.add(greenLight);
    const goldLight = new THREE.PointLight(0xffd76a, 22, 12);
    goldLight.position.set(-4, 2, 3);
    scene.add(goldLight);
    const rimLight = new THREE.PointLight(0x008f5c, 18, 10);
    rimLight.position.set(4, -1, -4);
    scene.add(rimLight);

    const logo = new THREE.Group();
    scene.add(logo);

    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd8b45a,
      metalness: 0.9,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    const greenMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x063c29,
      metalness: 0.65,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });

    // Medallion disc + rings
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 0.38, 96), greenMaterial);
    disc.rotation.x = Math.PI / 2;
    logo.add(disc);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.13, 24, 96), goldMaterial);
    logo.add(ring);

    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.055, 16, 96), goldMaterial);
    logo.add(innerRing);

    // 12 small geometric accents around the ring
    const geometryGroup = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const shape = new THREE.Shape();
      shape.moveTo(0, 0.38);
      shape.lineTo(0.16, 0.16);
      shape.lineTo(0.38, 0);
      shape.lineTo(0.16, -0.16);
      shape.lineTo(0, -0.38);
      shape.lineTo(-0.16, -0.16);
      shape.lineTo(-0.38, 0);
      shape.lineTo(-0.16, 0.16);
      shape.closePath();

      const extrude = new THREE.ExtrudeGeometry(shape, {
        depth: 0.08,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.02,
        bevelSegments: 2,
      });
      const mesh = new THREE.Mesh(extrude, goldMaterial);
      mesh.position.set(Math.cos(angle) * 1.78, Math.sin(angle) * 1.78, 0.24);
      mesh.rotation.z = angle;
      mesh.scale.set(0.7, 0.7, 0.7);
      geometryGroup.add(mesh);
    }
    logo.add(geometryGroup);

    // Big "F" symbol
    const FShape = new THREE.Shape();
    FShape.moveTo(-0.55, -0.85);
    FShape.lineTo(-0.55, 0.85);
    FShape.lineTo(0.58, 0.85);
    FShape.lineTo(0.58, 0.55);
    FShape.lineTo(-0.15, 0.55);
    FShape.lineTo(-0.15, 0.12);
    FShape.lineTo(0.42, 0.12);
    FShape.lineTo(0.42, -0.18);
    FShape.lineTo(-0.15, -0.18);
    FShape.lineTo(-0.15, -0.85);
    FShape.closePath();

    const FGeometry = new THREE.ExtrudeGeometry(FShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.04,
      bevelSegments: 4,
      curveSegments: 8,
    });
    const FLogo = new THREE.Mesh(FGeometry, goldMaterial);
    FLogo.position.z = 0.35;
    FLogo.position.x = -0.03;
    logo.add(FLogo);

    // Glow ring on the floor
    const floorRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.7, 0.025, 16, 128),
      new THREE.MeshBasicMaterial({ color: 0x00ff9d })
    );
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.y = -3.75;
    scene.add(floorRing);

    // Particles
    const particleCount = 350;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: 0x4cffb0, size: 0.025, transparent: true, opacity: 0.7 })
    );
    scene.add(particles);

    const clock = new THREE.Clock();
    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      logo.rotation.y += delta * 0.6;
      particles.rotation.y += delta * 0.025;
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    const fadeTimer = setTimeout(() => setFadingOut(true), SPLASH_DURATION_MS - 400);
    const finishTimer = setTimeout(() => onFinish(), SPLASH_DURATION_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 transition-opacity duration-500"
      style={{ opacity: fadingOut ? 0 : 1 }}
    >
      <div ref={mountRef} className="w-full h-full" />
      <div className="fixed top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h1
          className="m-0 text-2xl sm:text-4xl font-bold"
          style={{ color: "#d9b65c", letterSpacing: "6px" }}
        >
          FARA'ID AI
        </h1>
        <p className="mt-2 text-white/75 text-[11px]" style={{ letterSpacing: "3px" }}>
          ISLAMIC INHERITANCE INTELLIGENCE
        </p>
      </div>
      <button
        onClick={onFinish}
        className="fixed bottom-8 right-1/2 translate-x-1/2 sm:right-6 sm:translate-x-0 text-[11px] text-white/60 border border-white/30 rounded-full px-4 py-2"
      >
        Skip →
      </button>
    </div>
  );
}
