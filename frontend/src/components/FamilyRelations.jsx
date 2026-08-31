import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useLang } from "../i18n/LanguageContext";

const CATEGORY_COLOR = {
  always: 0x1e9e5a,
  conditional: 0xd99a1b,
  excludable: 0xd6493a,
};

const NODES = [
  { type: "husband", category: "always" },
  { type: "wife", category: "always" },
  { type: "son", category: "always" },
  { type: "daughter", category: "always" },
  { type: "father", category: "always" },
  { type: "mother", category: "always" },
  { type: "full_brother", category: "excludable" },
  { type: "full_sister", category: "excludable" },
  { type: "consanguine_brother", category: "excludable" },
  { type: "consanguine_sister", category: "excludable" },
  { type: "uterine_brother", category: "excludable" },
  { type: "uterine_sister", category: "excludable" },
  { type: "paternal_grandfather", category: "conditional" },
  { type: "paternal_grandmother", category: "conditional" },
  { type: "maternal_grandmother", category: "conditional" },
];

const RADIUS_BY_CATEGORY = { always: 2.3, excludable: 3.4, conditional: 4.4 };

const NOTES = {
  en: {
    always: "Always Inherits",
    conditional: "Conditional — steps in only if a closer relative is absent",
    excludable: "Can Be Excluded (Ḥajb)",
    intro:
      "This isn't a literal family tree — it groups each relative by how reliably they inherit. Tap or click a node to see why.",
    notes: {
      husband: "Always inherits a fixed share (1/2 or 1/4). Never excluded by other heirs.",
      wife: "Always inherits a fixed share (1/4 or 1/8). Never excluded by other heirs.",
      son: "Always inherits, taking the remainder as a residuary heir. A son's presence excludes all of the deceased's siblings.",
      daughter: "Always inherits — a fixed share alone, or alongside a son as a residuary co-heir.",
      father: "Always inherits — a fixed 1/6, or more as a residuary heir if there's no son.",
      mother: "Always inherits — 1/6 or 1/3. Never excluded, though her share can be reduced by siblings.",
      full_brother: "Inherits only if there is no son, father, or paternal grandfather.",
      full_sister: "Inherits only if there is no son, father, or paternal grandfather; also affected by daughters.",
      consanguine_brother: "Inherits only if there is no full brother, son, father, or paternal grandfather.",
      consanguine_sister: "Inherits only if there is no full sibling, son, father, or paternal grandfather.",
      uterine_brother: "Inherits only if there is no child or father/grandfather — regardless of full/half status.",
      uterine_sister: "Inherits only if there is no child or father/grandfather — regardless of full/half status.",
      paternal_grandfather: "Steps into the father's place, but only once the father has passed away.",
      paternal_grandmother: "Steps into the mother's place, but only once the mother has passed away.",
      maternal_grandmother: "Steps into the mother's place, but only once the mother has passed away.",
    },
  },
  ha: {
    always: "Koyaushe Yana/Tana Gadi",
    conditional: "Sharadi — yana/tana shiga ne kawai idan babu wani mai kusanci",
    excludable: "Ana Iya Cirewa (Hujb)",
    intro:
      "Wannan ba ainihin bishiyar iyali ba ce — ta tara kowane ɗan'uwa bisa yadda tabbacin gadonsu yake. Danna wani node domin ka ga dalili.",
    notes: {
      husband: "Koyaushe yana gadi rabo tabbatacce (1/2 ko 1/4). Ba wanda zai iya cire shi.",
      wife: "Koyaushe tana gadi rabo tabbatacce (1/4 ko 1/8). Ba wanda zai iya cire ta.",
      son: "Koyaushe yana gadi, yana karɓan ragowa a matsayin asaba. Idan akwai ɗa, duk 'yan'uwan mamaci ba sa gadi.",
      daughter: "Koyaushe tana gadi — ko dai rabo tabbatacce ita kaɗai, ko tare da ɗa a matsayin asaba.",
      father: "Koyaushe yana gadi — 1/6 tabbatacce, ko fiye a matsayin asaba idan babu ɗa.",
      mother: "Koyaushe tana gadi — 1/6 ko 1/3, ba a taɓa cire ta, ko da yake 'yan'uwa na iya rage rabonta.",
      full_brother: "Yana gadi ne kawai idan babu ɗa, uba, ko kakan uba.",
      full_sister: "Tana gadi ne kawai idan babu ɗa, uba, ko kakan uba; 'ya'ya mata na iya shafarta.",
      consanguine_brother: "Yana gadi ne kawai idan babu ɗan'uwa (uba da uwa daya), ɗa, uba, ko kakan uba.",
      consanguine_sister: "Tana gadi ne kawai idan babu 'yar'uwa (uba da uwa daya), ɗa, uba, ko kakan uba.",
      uterine_brother: "Yana gadi ne kawai idan babu ɗa ko uba/kaka — ko da menene irin sauran 'yan'uwa.",
      uterine_sister: "Tana gadi ne kawai idan babu ɗa ko uba/kaka — ko da menene irin sauran 'yan'uwa.",
      paternal_grandfather: "Yana maye gurbin uba, amma sai idan uba ya rasu.",
      paternal_grandmother: "Tana maye gurbin uwa, amma sai idan uwa ta rasu.",
      maternal_grandmother: "Tana maye gurbin uwa, amma sai idan uwa ta rasu.",
    },
  },
};

function fibonacciSphere(count, radius) {
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1 || 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    pts.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }
  return pts;
}

export default function FamilyRelations({ onBack }) {
  const { t, lang } = useLang();
  const copy = NOTES[lang] || NOTES.en;
  const mountRef = useRef(null);
  const stateRef = useRef({});
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.minDistance = 4;
    controls.maxDistance = 14;

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const light1 = new THREE.PointLight(0xffffff, 1.1);
    light1.position.set(6, 8, 6);
    scene.add(light1);
    const light2 = new THREE.PointLight(0x88ccaa, 0.5);
    light2.position.set(-6, -4, -4);
    scene.add(light2);

    const group = new THREE.Group();
    scene.add(group);

    // Center: the deceased
    const centerGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      emissive: 0x5c4a0f,
      emissiveIntensity: 0.4,
      roughness: 0.35,
      metalness: 0.3,
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    group.add(centerMesh);

    // Heir nodes, grouped by category radius via fibonacci sphere distribution
    const byCategory = { always: [], excludable: [], conditional: [] };
    NODES.forEach((n) => byCategory[n.category].push(n));

    const meshes = [];
    Object.entries(byCategory).forEach(([category, list]) => {
      const radius = RADIUS_BY_CATEGORY[category];
      const positions = fibonacciSphere(list.length, radius);
      list.forEach((node, i) => {
        const geo = new THREE.SphereGeometry(0.22, 24, 24);
        const baseColor = CATEGORY_COLOR[category];
        const mat = new THREE.MeshStandardMaterial({
          color: baseColor,
          emissive: baseColor,
          emissiveIntensity: 0.15,
          roughness: 0.5,
          metalness: 0.1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(positions[i]);
        mesh.userData = { type: node.type, category, baseColor };
        group.add(mesh);
        meshes.push(mesh);

        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          positions[i],
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: baseColor, transparent: true, opacity: 0.35 });
        group.add(new THREE.Line(lineGeo, lineMat));
      });
    });

    // Raycasting for click/tap selection
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    function onPointerDown(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(meshes);
      if (hits.length > 0) {
        setSelected(hits[0].object.userData.type);
      }
    }
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const w = mount.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    }
    window.addEventListener("resize", onResize);

    stateRef.current = { meshes };

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      meshes.forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Highlight the selected node's material without rebuilding the scene
  useEffect(() => {
    const meshes = stateRef.current.meshes || [];
    meshes.forEach((m) => {
      const isSelected = m.userData.type === selected;
      m.material.emissiveIntensity = isSelected ? 0.9 : 0.15;
      const s = isSelected ? 1.5 : 1;
      m.scale.set(s, s, s);
    });
  }, [selected]);

  const selectedNode = NODES.find((n) => n.type === selected);

  return (
    <div>
      <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1.5 mb-4">
        ← {t.back}
      </button>

      <h1 className="text-lg font-semibold text-gray-900">{t.relationsTitle}</h1>
      <p className="text-sm text-gray-500 mt-1">{copy.intro}</p>

      <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div ref={mountRef} className="w-full" style={{ height: 420 }} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#1e9e5a" }} />
          {copy.always}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#d99a1b" }} />
          {copy.conditional}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#d6493a" }} />
          {copy.excludable}
        </span>
      </div>

      {/* Info panel */}
      {selectedNode && (
        <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-sm font-semibold text-gray-900">{t.heirs?.[selectedNode.type]}</div>
          <div
            className="inline-block text-[10px] font-medium rounded-full px-2 py-0.5 mt-1"
            style={{
              background:
                selectedNode.category === "always"
                  ? "#e7f6ee"
                  : selectedNode.category === "conditional"
                  ? "#fdf2df"
                  : "#fbe9e7",
              color:
                selectedNode.category === "always"
                  ? "#1e9e5a"
                  : selectedNode.category === "conditional"
                  ? "#a86f0e"
                  : "#b8382c",
            }}
          >
            {copy[selectedNode.category]}
          </div>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{copy.notes[selectedNode.type]}</p>
        </div>
      )}

      {/* Tap-to-select heir chips (mirrors the 3D nodes for easy access without needing to aim) */}
      <div className="flex flex-wrap gap-2 mt-4">
        {NODES.map((n) => (
          <button
            key={n.type}
            onClick={() => setSelected(n.type)}
            className="text-[11px] px-2.5 py-1 rounded-full border transition"
            style={{
              borderColor: selected === n.type ? "#0c5f2f" : "#e5e7eb",
              background: selected === n.type ? "#0c5f2f" : "white",
              color: selected === n.type ? "white" : "#374151",
            }}
          >
            {t.heirs?.[n.type]}
          </button>
        ))}
      </div>
    </div>
  );
}
