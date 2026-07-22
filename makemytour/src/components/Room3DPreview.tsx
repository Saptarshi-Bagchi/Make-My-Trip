import React from "react";

interface Room3DPreviewProps {
    images: string[];
    name: string;
}

const Room3DPreview = ({ images, name }: Room3DPreviewProps) => {
    const faces = [images[0] ?? "", images[1] ?? images[0] ?? "", images[0] ?? "", images[1] ?? images[0] ?? ""];

    return (
        <div className="flex flex-col items-center py-6">
            <div style={{ perspective: "1000px" }} className="w-40 h-40">
                <div
                    className="relative w-full h-full"
                    style={{
                        transformStyle: "preserve-3d",
                        animation: "room-rotate 10s linear infinite",
                    }}
                >
                    {faces.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt={`${name} view ${i + 1}`}
                            className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md"
                            style={{
                                transform: `rotateY(${i * 90}deg) translateZ(80px)`,
                                backfaceVisibility: "hidden",
                            }}
                        />
                    ))}
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Auto-rotating preview of {name}</p>

            <style jsx>{`
                @keyframes room-rotate {
                    from {
                        transform: rotateY(0deg);
                    }
                    to {
                        transform: rotateY(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default Room3DPreview;