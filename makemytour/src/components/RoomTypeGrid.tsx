import React from "react";
import { Check } from "lucide-react";
import { RoomType } from "@/lib/roomTypes";

interface RoomTypeGridProps {
    roomTypes: RoomType[];
    basePrice: number;
    selectedId: string;
    onSelect: (id: string) => void;
}

const RoomTypeGrid = ({ roomTypes, basePrice, selectedId, onSelect }: RoomTypeGridProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roomTypes.map((room) => {
                const isSelected = room.id === selectedId;
                const price = Math.round(basePrice * room.multiplier);
                return (
                    <button
                        key={room.id}
                        onClick={() => onSelect(room.id)}
                        className={`text-left border rounded-xl overflow-hidden transition-all ${
                            isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <div className="relative h-28 bg-gray-100">
                            <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                            {isSelected && (
                                <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                                    <Check className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm">{room.name}</h4>
                                <span className="font-bold text-sm">₹{price.toLocaleString("en-IN")}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{room.description}</p>
                            <p className="text-[11px] text-gray-400">{room.amenities.slice(0, 3).join(" · ")}</p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default RoomTypeGrid;