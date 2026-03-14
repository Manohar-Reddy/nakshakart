"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const PAINT_COLORS = [
  { name: "White",      hex: "#F5F5F0" },
  { name: "Cream",      hex: "#FFF8DC" },
  { name: "Beige",      hex: "#D4B896" },
  { name: "Sand",       hex: "#C2A882" },
  { name: "Terracotta", hex: "#C1664A" },
  { name: "Olive",      hex: "#8A9A5B" },
  { name: "Sky Blue",   hex: "#87CEEB" },
  { name: "Navy",       hex: "#2C3E6B" },
  { name: "Charcoal",   hex: "#3C3C3C" },
  { name: "Stone Gray", hex: "#9A9A8A" },
  { name: "Brick Red",  hex: "#8B3A3A" },
  { name: "Mint",       hex: "#A8D8B9" },
  { name: "Yellow",     hex: "#F5E642" },
  { name: "Peach",      hex: "#FFCBA4" },
  { name: "Lavender",   hex: "#B57EDC" },
  { name: "Dark Green", hex: "#2D5A27" },
];

const CLADDING = [
  { name: "Brick",  file: "/textures/brick.jpg",  color: "#8B3A3A", repeat: 3 },
  { name: "Marble", file: "/textures/marble.jpg", color: "#f0f0f0", repeat: 2 },
  { name: "Wood",   file: "/textures/wood.jpg",   color: "#8B6340", repeat: 3 },
  { name: "Slate",  file: "/textures/slate.jpg",  color: "#4a4a5a", repeat: 4 },
  { name: "Tiles",  file: "/textures/tiles.jpg",  color: "#cccccc", repeat: 4 },
];

export default function ModelViewerClient({ url }: { url: string }) {
  const mountRef            = useRef<HTMLDivElement>(null);
  const allMeshesRef        = useRef<THREE.Mesh[]>([]);
  const isColorModeRef      = useRef(false);
  const activeMaterialRef   = useRef<{ type: "color"; hex: string } | { type: "cladding"; index: number } | null>(null);
  const showFeedbackRef     = useRef<(msg: string) => void>(() => {});
  const hoveredMeshRef      = useRef<THREE.Mesh | null>(null);
  const originalEmissiveRef = useRef<Map<THREE.Mesh, { color: THREE.Color; intensity: number }>>(new Map());

  const [isColorMode,      setIsColorMode]      = useState(false);
  const [activeTab,        setActiveTab]        = useState<"colors" | "cladding">("colors");
  const [selectedColor,    setSelectedColor]    = useState("#F5F5F0");
  const [selectedCladding, setSelectedCladding] = useState<number | null>(null);
  const [hoveredName,      setHoveredName]      = useState<string | null>(null);
  const [feedback,         setFeedback]         = useState<string | null>(null);
  const [paintedCount,     setPaintedCount]     = useState(0);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  };
  useEffect(() => { showFeedbackRef.current = showFeedback; });
  useEffect(() => { isColorModeRef.current  = isColorMode; }, [isColorMode]);

  useEffect(() => {
    if (!mountRef.current || !url) return;
    const container = mountRef.current;
    const width  = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2535);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    camera.position.set(20, 20, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace    = THREE.SRGBColorSpace;
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.shadowMap.enabled   = true;
    renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed  = 3.0;
    controls.zoomSpeed    = 1.2;
    controls.panSpeed     = 0.8;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.2;

    // Lights
    scene.add(new THREE.HemisphereLight(0xffeebb, 0x080820, 2));
    const sun = new THREE.DirectionalLight(0xfff4e0, 3);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near   = 0.5;
    sun.shadow.camera.far    = 500;
    sun.shadow.camera.left   = -50;
    sun.shadow.camera.right  =  50;
    sun.shadow.camera.top    =  50;
    sun.shadow.camera.bottom = -50;
    sun.shadow.bias = -0.001;
    scene.add(sun);
    [[-50,50,-50],[50,30,-50],[-50,30,50],[0,-50,0]].forEach(([x,y,z]) => {
      const l = new THREE.DirectionalLight(0xffffff, 1);
      l.position.set(x,y,z); scene.add(l);
    });

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshLambertMaterial({ color: 0x2a3a4a, side: THREE.DoubleSide })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    scene.add(new THREE.GridHelper(100, 50, 0x334455, 0x223344));

    // Load GLB
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      const model = gltf.scene;
      const box    = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale  = 10 / maxDim;

      model.scale.setScalar(scale);
      model.position.x = -center.x * scale;
      model.position.y = -box.min.y * scale;
      model.position.z = -center.z * scale;
      model.updateMatrixWorld(true);
      scene.add(model);

      const meshes: THREE.Mesh[] = [];
      model.traverse((child: any) => {
        if (!child.isMesh) return;
        child.castShadow    = true;
        child.receiveShadow = true;
        child.material      = child.material.clone();
        child.material.side = THREE.DoubleSide;
        const mat = child.material as THREE.MeshStandardMaterial;
        originalEmissiveRef.current.set(child, {
          color:     mat.emissive ? mat.emissive.clone() : new THREE.Color(0),
          intensity: mat.emissiveIntensity || 0,
        });
        meshes.push(child);
      });
      allMeshesRef.current = meshes;

      const fitRadius = maxDim * scale * 1.8;
      camera.position.set(fitRadius, fitRadius * 0.8, fitRadius);
      controls.target.set(0, (size.y * scale) / 2, 0);
      controls.update();
    }, undefined, (err) => console.error("GLB error:", err));

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();
    let mouseDown  = false;
    let mouseMoved = false;

    const restoreHovered = () => {
      if (!hoveredMeshRef.current) return;
      const mat  = hoveredMeshRef.current.material as THREE.MeshStandardMaterial;
      const orig = originalEmissiveRef.current.get(hoveredMeshRef.current);
      if (mat.emissive) {
        mat.emissive.copy(orig?.color || new THREE.Color(0));
        mat.emissiveIntensity = orig?.intensity || 0;
      }
      hoveredMeshRef.current = null;
    };

    const onMouseDown = () => { mouseDown = true; mouseMoved = false; };
    const onMouseUp   = () => { mouseDown = false; };

    const onMouseMove = (e: MouseEvent) => {
      if (mouseDown) { mouseMoved = true; return; }
      if (!isColorModeRef.current) {
        restoreHovered();
        setHoveredName(null);
        renderer.domElement.style.cursor = "default";
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(allMeshesRef.current, false);

      if (hits.length > 0) {
        const mesh = hits[0].object as THREE.Mesh;
        if (mesh !== hoveredMeshRef.current) {
          restoreHovered();
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.emissive) {
            const active = activeMaterialRef.current;
            if (active?.type === "color") {
              const c = new THREE.Color(active.hex);
              mat.emissive.set(c.multiplyScalar(0.5));
              mat.emissiveIntensity = 0.7;
            } else {
              mat.emissive.set(0x4488ff);
              mat.emissiveIntensity = 0.5;
            }
          }
          hoveredMeshRef.current = mesh;
          const raw = (mesh.material as any)?.name || mesh.name || "Surface";
          const clean = raw.replace(/Structural_-_/g,"").replace(/_FLAT_PART/g,"").replace(/_/g," ").trim().slice(0,40);
          setHoveredName(clean);
        }
        renderer.domElement.style.cursor = "crosshair";
      } else {
        restoreHovered();
        setHoveredName(null);
        renderer.domElement.style.cursor = "default";
      }
    };

    const onMouseClick = (e: MouseEvent) => {
      if (mouseMoved || !isColorModeRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(allMeshesRef.current, false);

      if (hits.length > 0) {
        const mesh   = hits[0].object as THREE.Mesh;
        const active = activeMaterialRef.current;
        if (!active) { showFeedbackRef.current("⚠️ Select a color or cladding first!"); return; }

        restoreHovered();

        if (active.type === "color") {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.map = null;
          mat.color.set(active.hex);
          mat.emissive?.set(0x000000);
          mat.emissiveIntensity = 0;
          mat.needsUpdate = true;
          originalEmissiveRef.current.set(mesh, { color: new THREE.Color(0), intensity: 0 });
          const name = PAINT_COLORS.find(c => c.hex === active.hex)?.name || "Custom";
          showFeedbackRef.current(`✅ ${name} applied!`);
          setPaintedCount(p => p + 1);
        } else {
          const c = CLADDING[active.index];
          new THREE.TextureLoader().load(c.file, (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(c.repeat, c.repeat);
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.map = texture;
            mat.color.set(c.color);
            mat.emissive?.set(0x000000);
            mat.emissiveIntensity = 0;
            mat.needsUpdate = true;
            originalEmissiveRef.current.set(mesh, { color: new THREE.Color(0), intensity: 0 });
            showFeedbackRef.current(`✅ ${c.name} applied!`);
            setPaintedCount(p => p + 1);
          });
        }
      }
    };

    renderer.domElement.addEventListener("mousedown",  onMouseDown);
    renderer.domElement.addEventListener("mousemove",  onMouseMove);
    renderer.domElement.addEventListener("mouseup",    onMouseUp);
    renderer.domElement.addEventListener("click",      onMouseClick);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      controls.handleResize();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("mousedown",  onMouseDown);
      renderer.domElement.removeEventListener("mousemove",  onMouseMove);
      renderer.domElement.removeEventListener("mouseup",    onMouseUp);
      renderer.domElement.removeEventListener("click",      onMouseClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [url]);

  const handleColorSelect = (hex: string) => {
    setSelectedColor(hex);
    setSelectedCladding(null);
    activeMaterialRef.current = { type: "color", hex };
    if (!isColorMode) setIsColorMode(true);
  };

  const handleCladdingSelect = (i: number) => {
    setSelectedCladding(i);
    activeMaterialRef.current = { type: "cladding", index: i };
    if (!isColorMode) setIsColorMode(true);
  };

  const resetAll = () => {
    allMeshesRef.current.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.map = null;
      mat.color.set(0xffffff);
      mat.emissive?.set(0x000000);
      mat.emissiveIntensity = 0;
      mat.needsUpdate = true;
    });
    setPaintedCount(0);
    activeMaterialRef.current = null;
    setSelectedColor("#F5F5F0");
    setSelectedCladding(null);
    hoveredMeshRef.current = null;
    setHoveredName(null);
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl"
      style={{ border: "1px solid rgba(147,51,234,0.3)" }}>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 border-b border-gray-700 flex-wrap">
        <button onClick={() => setIsColorMode(!isColorMode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            isColorMode ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}>
          {isColorMode ? "🖌️ Paint Mode ON" : "🖌️ Paint Mode OFF"}
        </button>
        <button onClick={resetAll}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-700 text-gray-300 hover:bg-red-700 hover:text-white transition">
          🔄 Reset
        </button>
        {paintedCount > 0 && (
          <span className="text-xs text-green-300 bg-green-900 px-2 py-1 rounded-lg">
            🎨 {paintedCount} painted
          </span>
        )}
        {feedback && (
          <span className="text-xs text-yellow-200 bg-yellow-800 px-3 py-1 rounded-lg">
            {feedback}
          </span>
        )}
        {isColorMode && hoveredName && (
          <span className="text-xs text-blue-200 bg-blue-900 px-2 py-1 rounded-lg ml-auto truncate max-w-xs">
            👆 {hoveredName}
          </span>
        )}
      </div>

      {/* 3D Viewer — full width */}
      <div style={{ position: "relative" }}>
        <div ref={mountRef} style={{ width: "100%", height: "400px", backgroundColor: "#1a2535" }} />
        {/* Hover tooltip overlay */}
        {isColorMode && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-black bg-opacity-70 text-white text-xs px-4 py-1.5 rounded-full">
              {hoveredName
                ? `🖌️ Click to paint "${hoveredName}"`
                : activeMaterialRef.current
                  ? "👆 Hover any surface to preview · click to paint"
                  : "👇 Select color or cladding below · then hover & click surface"}
            </div>
          </div>
        )}
      </div>

      {/* ── Color & Cladding Panel BELOW viewer — always visible ── */}
      <div className="bg-gray-900 border-t border-gray-700">

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button onClick={() => setActiveTab("colors")}
            className={`flex-1 py-2 text-xs font-bold transition ${
              activeTab === "colors"
                ? "bg-purple-700 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}>
            🎨 Paint Colors
          </button>
          <button onClick={() => setActiveTab("cladding")}
            className={`flex-1 py-2 text-xs font-bold transition ${
              activeTab === "cladding"
                ? "bg-teal-700 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}>
            🪨 Stone & Cladding
          </button>
        </div>

        <div className="p-3">

          {/* ── Colors ── */}
          {activeTab === "colors" && (
            <div>
              <div className="flex gap-2 flex-wrap mb-3">
                {PAINT_COLORS.map((c) => (
                  <button key={c.hex} onClick={() => handleColorSelect(c.hex)}
                    title={c.name}
                    className={`w-9 h-9 rounded-xl border-2 transition hover:scale-110 flex-shrink-0 ${
                      selectedColor === c.hex && activeMaterialRef.current?.type === "color"
                        ? "border-white scale-110 shadow-lg shadow-white/20"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: c.hex }} />
                ))}
                {/* Custom color */}
                <div className="relative flex-shrink-0" title="Custom color">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border-2 border-dashed border-gray-500 bg-transparent"
                  />
                </div>
              </div>

              {/* Selected color indicator */}
              {activeMaterialRef.current?.type === "color" && (
                <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 text-xs">
                  <div className="w-5 h-5 rounded border border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: selectedColor }} />
                  <span className="text-gray-300">
                    <span className="text-white font-semibold">
                      {PAINT_COLORS.find(c => c.hex === selectedColor)?.name || "Custom"}
                    </span> selected — hover a wall to preview, click to paint
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Cladding ── */}
          {activeTab === "cladding" && (
            <div>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {CLADDING.map((c, i) => (
                  <button key={c.name} onClick={() => handleCladdingSelect(i)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition hover:scale-105 ${
                      selectedCladding === i
                        ? "border-teal-400 bg-teal-900 bg-opacity-40 shadow-lg"
                        : "border-gray-700 hover:border-gray-500 hover:bg-gray-800"
                    }`}>
                    <div className="w-12 h-12 rounded-lg border border-gray-600"
                      style={{
                        backgroundImage: `url(${c.file})`,
                        backgroundSize: "cover",
                        backgroundColor: c.color,
                      }} />
                    <span className="text-xs text-gray-300 font-medium">{c.name}</span>
                    {selectedCladding === i && (
                      <span className="text-xs text-teal-400 font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {selectedCladding !== null && (
                <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 text-xs">
                  <div className="w-5 h-5 rounded border border-gray-600 flex-shrink-0"
                    style={{
                      backgroundImage: `url(${CLADDING[selectedCladding].file})`,
                      backgroundSize: "cover",
                    }} />
                  <span className="text-gray-300">
                    <span className="text-white font-semibold">{CLADDING[selectedCladding].name}</span> selected
                    — hover a wall to preview, click to apply
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls hint */}
      <div className="flex justify-center gap-4 py-2 bg-gray-900 border-t border-gray-700 text-xs text-gray-500 flex-wrap">
        <span>🖱️ Left drag = Rotate 360°</span>
        <span>🖱️ Middle drag = Pan</span>
        <span>🖱️ Scroll = Zoom</span>
        {isColorMode && <span>🖌️ Hover = preview · Click = paint</span>}
      </div>
    </div>
  );
}