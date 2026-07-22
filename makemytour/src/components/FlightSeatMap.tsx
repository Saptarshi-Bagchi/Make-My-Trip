import React from "react";
import { Seat } from "@/lib/seatMap";

interface FlightSeatMapProps {
    seats: Seat[];
    selectedSeatIds: string[];
    onToggle: (seatId: string) => void;
    maxSelectable: number;
}

const FlightSeatMap = ({ seats, selectedSeatIds, onToggle, maxSelectable }: FlightSeatMapProps) => {
    const rows = Array.from(new Set(seats.map((s) => s.row))).sort((a, b) => a - b);
    const columns = ["A", "B", "C", "D", "E", "F"];

    const seatAt = (row: number, col: string) => seats.find((s) => s.row === row && s.col === col);

    const handleClick = (seat: Seat) => {
        if (seat.isOccupied) return;
        const isSelected = selectedSeatIds.includes(seat.id);
        if (!isSelected && selectedSeatIds.length >= maxSelectable) return;
        onToggle(seat.id);
    };

    const seatClass = (seat: Seat) => {
        const isSelected = selectedSeatIds.includes(seat.id);
        if (seat.isOccupied) return "bg-gray-300 text-gray-400 cursor-not-allowed";
        if (isSelected) return "bg-blue-600 text-white border-blue-700";
        if (seat.isPremium) return "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100";
        return "bg-white text-gray-700 border-gray-300 hover:bg-blue-50";
    };

    return (
        <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-center gap-4 mb-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" /> Available
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 inline-block" /> Premium
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Selected
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-gray-300 inline-block" /> Occupied
                </div>
            </div>

            <div className="mx-auto max-w-xs bg-white rounded-t-full rounded-b-lg border border-gray-200 pt-6 pb-4 px-3">
                <div className="max-h-64 overflow-y-auto pr-1">
                    {rows.map((row) => (
                        <div key={row} className="flex items-center justify-center gap-1 mb-1">
                            <span className="w-5 text-[10px] text-gray-400 text-right">{row}</span>
                            {columns.slice(0, 3).map((col) => {
                                const seat = seatAt(row, col);
                                if (!seat) return null;
                                return (
                                    <button
                                        key={col}
                                        onClick={() => handleClick(seat)}
                                        disabled={seat.isOccupied}
                                        className={`w-6 h-6 rounded text-[9px] border flex items-center justify-center transition-colors ${seatClass(seat)}`}
                                        title={seat.id}
                                    >
                                        {col}
                                    </button>
                                );
                            })}
                            <span className="w-4" />
                            {columns.slice(3, 6).map((col) => {
                                const seat = seatAt(row, col);
                                if (!seat) return null;
                                return (
                                    <button
                                        key={col}
                                        onClick={() => handleClick(seat)}
                                        disabled={seat.isOccupied}
                                        className={`w-6 h-6 rounded text-[9px] border flex items-center justify-center transition-colors ${seatClass(seat)}`}
                                        title={seat.id}
                                    >
                                        {col}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-3">
                {selectedSeatIds.length} / {maxSelectable} seats selected
            </p>
        </div>
    );
};

export default FlightSeatMap;