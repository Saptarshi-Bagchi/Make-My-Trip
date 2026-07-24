import React, { useEffect, useRef, useState } from "react";

interface Room3DPreviewProps {
    images: string[];
    name: string;
}

const Room3DPreview = ({ images, name }: Room3DPreviewProps) => {
    const faces = [images[0] ?? "", images[1] ?? images[0] ?? "", images[0] ?? "", images[1] ?? images[0] ?? ""];

    const [rotation, setRotation] = useState(0);
    const isDragging = useRef(false);
    const lastX = useRef(0);

    useEffect(() => {
        const timer = setInterval(() => {
            if (!isDragging.current) {
                setRotation((r) => r + 0.3);
            }
        }, 30);
        return () => clearInterval(timer);
    }, []);

    const startDrag = (clientX: number) => {
        isDragging.current = true;
        lastX.current = clientX;
    };

    const moveDrag = (clientX: number) => {
        if (!isDragging.current) return;
        const deltaX = clientX - lastX.current;
        setRotation((r) => r + deltaX * 0.5);
        lastX.current = clientX;
    };

    const endDrag = () => {
        isDragging.current = false;
    };

    return (
        <div className="flex flex-col items-center py-6">
            <div
                style={{ perspective: "1000px" }}
                className="w-40 h-40 cursor-grab active:cursor-grabbing select-none"
                onMouseDown={(e) => startDrag(e.clientX)}
                onMouseMove={(e) => moveDrag(e.clientX)}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                onTouchStart={(e) => startDrag(e.touches[0].clientX)}
                onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
                onTouchEnd={endDrag}
            >
                <div
                    className="relative w-full h-full"
                    style={{
                        transformStyle: "preserve-3d",
                        transform: `rotateY(${rotation}deg)`,
                    }}
                >
                    {faces.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt={`${name} view ${i + 1}`}
                            draggable={false}
                            className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md"
                            style={{
                                transform: `rotateY(${i * 90}deg) translateZ(80px)`,
                                backfaceVisibility: "hidden",
                            }}
                        />
                    ))}
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Drag to rotate · {name}</p>
        </div>
    );
};

export default Room3DPreview;