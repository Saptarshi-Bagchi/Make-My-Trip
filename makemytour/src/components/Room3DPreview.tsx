import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import * as THREE from "three";
import { RotateCcw, Move3d } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

const WALL_FRONT_IMAGE = "https://images.unsplash.com/photo-1544641724-73f0d1bee38b?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const WALL_BACK_IMAGE = "https://plus.unsplash.com/premium_photo-1677344201811-4c459a88c538?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const WALL_LEFT_IMAGE = "https://images.unsplash.com/photo-1624847706671-a7bf2f92ede0?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const WALL_RIGHT_IMAGE = "https://images.unsplash.com/photo-1722890552195-d90342de9a77?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const FLOOR_IMAGE = "https://images.unsplash.com/32/Mc8kW4x9Q3aRR3RkP5Im_IMG_4417.jpg?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const CEILING_IMAGE = "https://images.unsplash.com/photo-1487266659293-c4762f375955?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

interface Room3DPreviewProps {
  images: string[];
  name: string;
}

const ROOM_WIDTH = 4;
const ROOM_HEIGHT = 2.6;
const ROOM_DEPTH = 4;
const PITCH_MIN = -55;
const PITCH_MAX = 65;

const WALL_ASPECT = ROOM_WIDTH / ROOM_HEIGHT;
const FLOOR_CEILING_ASPECT = ROOM_WIDTH / ROOM_DEPTH;

type VerticalAnchor = "top" | "center" | "bottom";
type HorizontalAnchor = "left" | "center" | "right";

function fitCoverUV(
  texture: THREE.Texture,
  faceAspect: number,
  verticalAnchor: VerticalAnchor = "bottom",
  horizontalAnchor: HorizontalAnchor = "center"
) {
  const img = texture.image as HTMLImageElement | undefined;
  if (!img || !img.width || !img.height) return;
  const imgAspect = img.width / img.height;

  if (imgAspect > faceAspect) {
    const repeatX = faceAspect / imgAspect;
    const offsetX =
      horizontalAnchor === "left" ? 0 : horizontalAnchor === "right" ? 1 - repeatX : (1 - repeatX) / 2;
    texture.repeat.set(repeatX, 1);
    texture.offset.set(offsetX, 0);
  } else {
    const repeatY = imgAspect / faceAspect;
    const offsetY =
      verticalAnchor === "bottom" ? 0 : verticalAnchor === "top" ? 1 - repeatY : (1 - repeatY) / 2;
    texture.repeat.set(1, repeatY);
    texture.offset.set(0, offsetY);
  }
}

const Room3DPreview = ({ name }: Room3DPreviewProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const draggingRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const resetRef = useRef(() => {});

  // Pass dynamic colors into ThreeJS to handle backdrop canvas color updates
  const sceneBgColor = isDark ? 0x162624 : 0xf4f7fa;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const width = host.clientWidth;
    const height = host.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneBgColor);

    const camera = new THREE.PerspectiveCamera(72, width / height, 0.05, 50);
    camera.rotation.order = "YXZ";

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const surfaceMaterial = (
      src: string,
      faceAspect: number,
      tint?: number,
      verticalAnchor: VerticalAnchor = "bottom",
      horizontalAnchor: HorizontalAnchor = "center"
    ) => {
      const texture = loader.load(src, (loadedTexture) => {
        fitCoverUV(loadedTexture, faceAspect, verticalAnchor, horizontalAnchor);
        setReady(true);
      });
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
      if (tint !== undefined) material.color.set(tint);
      return material;
    };

    const materials = [
      surfaceMaterial(WALL_RIGHT_IMAGE, WALL_ASPECT, undefined, "top"), 
      surfaceMaterial(WALL_LEFT_IMAGE, WALL_ASPECT, undefined, "bottom"), 
      surfaceMaterial(CEILING_IMAGE, FLOOR_CEILING_ASPECT, 0xe4e8ee), 
      surfaceMaterial(FLOOR_IMAGE, FLOOR_CEILING_ASPECT, 0xbfc6d1), 
      surfaceMaterial(WALL_FRONT_IMAGE, WALL_ASPECT, undefined, "center"), 
      surfaceMaterial(WALL_BACK_IMAGE, WALL_ASPECT), 
    ];

    const geometry = new THREE.BoxGeometry(ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH);
    const room = new THREE.Mesh(geometry, materials);
    scene.add(room);

    let frameId = 0;
    const animate = (t: number) => {
      if (!hasInteractedRef.current) {
        yawRef.current = Math.sin(t / 2600) * 18;
      }
      camera.rotation.y = THREE.MathUtils.degToRad(yawRef.current);
      camera.rotation.x = THREE.MathUtils.degToRad(pitchRef.current);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    resetRef.current = () => {
      yawRef.current = 0;
      pitchRef.current = 0;
      hasInteractedRef.current = false;
      setHasInteracted(false);
    };

    const handleResize = () => {
      if (!host) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      materials.forEach((material) => {
        if (material.map) material.map.dispose();
        material.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [sceneBgColor]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    hasInteractedRef.current = true;
    setHasInteracted(true);
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    yawRef.current -= dx * 0.3;
    pitchRef.current = Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitchRef.current - dy * 0.3));
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  // Shared booking template variables
  const cardStyles = isDark 
    ? "bg-[#121826] border-[#2A3854] text-[#F1F5F9]" 
    : "bg-white border-transparent shadow-[0_8px_30px_-12px_rgba(31,51,48,0.15)] text-[#0F172A]";
  
  const innerContainerStyles = isDark ? "bg-[#1A2234] border-[#2A3854]" : "bg-slate-50 border-slate-100";
  const labelStyles = isDark ? "text-[#94A3B8]" : "text-gray-500";
  const subtextStyles = isDark ? "text-[#94A3B8]" : "text-gray-600";
  const buttonStyles = isDark 
    ? "bg-[#121826]/90 text-[#F1F5F9] border-[#2A3854] hover:bg-[#2A3854]" 
    : "bg-white/90 text-slate-700 border-slate-200 hover:bg-white";

  return (
    <div className={`rounded-xl border p-4 transition-colors ${cardStyles}`}>
      <div className={`mb-4 text-center text-xs font-semibold uppercase tracking-[0.24em] ${labelStyles}`}>
        Room preview
      </div>

      <div
        className={`relative mx-auto w-full max-w-[320px] touch-none select-none overflow-hidden rounded-xl border ${innerContainerStyles}`}
        style={{ height: 260 }}
        role="img"
        aria-label={`3D preview of ${name}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div ref={hostRef} className="h-full w-full" />

        {!ready && (
          <div className={`absolute inset-0 flex items-center justify-center text-sm ${
            isDark ? "bg-[#1A2234] text-[#94A3B8]" : "bg-slate-100 text-slate-400"
          }`}>
            Loading roomâ€¦
          </div>
        )}

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80" />

        {!hasInteracted && ready && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
            <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm ${buttonStyles}`}>
              <Move3d className="h-3.5 w-3.5" />
              Drag to look around
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => resetRef.current()}
          aria-label="Reset view"
          className={`absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors backdrop-blur-sm ${buttonStyles}`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className={`mt-3 text-center text-sm ${subtextStyles}`}>
        Drag inside the room to look around, like a first-person walkthrough.
      </div>
    </div>
  );
};

export default Room3DPreview;
