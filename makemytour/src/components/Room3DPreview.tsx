import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { RotateCcw, Move3d } from "lucide-react";

interface Room3DPreviewProps {
  images: string[];
  name: string;
}

const ROOM_WIDTH = 300;
const ROOM_DEPTH = 300;
const ROOM_HEIGHT = 190;
const YAW_LIMIT = 70;
const PITCH_LIMIT_UP = 18;
const PITCH_LIMIT_DOWN = 22;

const Room3DPreview = ({ images, name }: Room3DPreviewProps) => {
  const gallery = images.filter(Boolean);

  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const dragStart = useRef({ x: 0, y: 0, yaw: 0, pitch: 0 });

  useEffect(() => {
    if (hasInteracted) return;
    let frame = 0;
    const idleSway = (t: number) => {
      setYaw(Math.sin(t / 2200) * 10);
      frame = requestAnimationFrame(idleSway);
    };
    frame = requestAnimationFrame(idleSway);
    return () => cancelAnimationFrame(frame);
  }, [hasInteracted]);

  if (gallery.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Room preview
        </div>
        <div className="flex h-[260px] items-center justify-center rounded-[20px] bg-white text-sm text-slate-400 ring-1 ring-slate-200">
          No preview available for {name}
        </div>
      </div>
    );
  }

  const back = gallery[0];
  const left = gallery[1] ?? gallery[0];
  const right = gallery[2] ?? gallery[1] ?? gallery[0];
  const floor = gallery[3] ?? gallery[0];

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setHasInteracted(true);
    dragStart.current = { x: e.clientX, y: e.clientY, yaw, pitch };
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const nextYaw = Math.max(-YAW_LIMIT, Math.min(YAW_LIMIT, dragStart.current.yaw + dx * 0.25));
    const nextPitch = Math.max(
      -PITCH_LIMIT_DOWN,
      Math.min(PITCH_LIMIT_UP, dragStart.current.pitch - dy * 0.2)
    );
    setYaw(nextYaw);
    setPitch(nextPitch);
  };

  const handlePointerUp = () => setIsDragging(false);

  const resetView = () => {
    setYaw(0);
    setPitch(0);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        Room preview
      </div>

      <div
        className="relative mx-auto w-full max-w-[320px] touch-none select-none overflow-hidden rounded-[20px] bg-gradient-to-b from-sky-50 to-slate-200 ring-1 ring-slate-200"
        style={{ perspective: "900px", height: 260 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${pitch}deg) rotateY(${yaw}deg)`,
            transition: isDragging ? "none" : "transform 0.25s ease-out",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 overflow-hidden"
            style={{
              width: ROOM_WIDTH,
              height: ROOM_HEIGHT,
              marginLeft: -ROOM_WIDTH / 2,
              marginTop: -ROOM_HEIGHT / 2,
              transform: `translateZ(-${ROOM_DEPTH / 2}px)`,
            }}
          >
            <img src={back} alt={`${name} back wall`} className="h-full w-full object-cover" draggable={false} />
          </div>

          <div
            className="absolute left-1/2 top-1/2 overflow-hidden"
            style={{
              width: ROOM_DEPTH,
              height: ROOM_HEIGHT,
              marginLeft: -ROOM_DEPTH / 2,
              marginTop: -ROOM_HEIGHT / 2,
              transform: `rotateY(90deg) translateZ(-${ROOM_WIDTH / 2}px)`,
            }}
          >
            <img src={left} alt={`${name} left wall`} className="h-full w-full object-cover brightness-90" draggable={false} />
          </div>

          <div
            className="absolute left-1/2 top-1/2 overflow-hidden"
            style={{
              width: ROOM_DEPTH,
              height: ROOM_HEIGHT,
              marginLeft: -ROOM_DEPTH / 2,
              marginTop: -ROOM_HEIGHT / 2,
              transform: `rotateY(-90deg) translateZ(-${ROOM_WIDTH / 2}px)`,
            }}
          >
            <img src={right} alt={`${name} right wall`} className="h-full w-full object-cover brightness-90" draggable={false} />
          </div>

          <div
            className="absolute left-1/2 top-1/2 overflow-hidden"
            style={{
              width: ROOM_WIDTH,
              height: ROOM_DEPTH,
              marginLeft: -ROOM_WIDTH / 2,
              marginTop: -ROOM_DEPTH / 2,
              transform: `rotateX(90deg) translateZ(-${ROOM_HEIGHT / 2}px)`,
            }}
          >
            <img
              src={floor}
              alt={`${name} floor`}
              className="h-full w-full object-cover blur-[1px] brightness-75 saturate-75"
              draggable={false}
            />
            <div className="absolute inset-0 bg-slate-900/20" />
          </div>

          <div
            className="absolute left-1/2 top-1/2 overflow-hidden"
            style={{
              width: ROOM_WIDTH,
              height: ROOM_DEPTH,
              marginLeft: -ROOM_WIDTH / 2,
              marginTop: -ROOM_DEPTH / 2,
              transform: `rotateX(-90deg) translateZ(-${ROOM_HEIGHT / 2}px)`,
            }}
          >
            <img
              src={back}
              alt={`${name} ceiling glow`}
              className="h-full w-full object-cover opacity-30 blur-sm"
              draggable={false}
            />
            <div className="absolute inset-0 bg-white/70" />
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80" />

        {!hasInteracted && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
            <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
              <Move3d className="h-3.5 w-3.5" />
              Drag to look around
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={resetView}
          aria-label="Reset view"
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="mt-3 text-center text-sm text-slate-500">
        Drag inside the room to look around, like a first-person walkthrough.
      </div>
    </div>
  );
};

export default Room3DPreview;