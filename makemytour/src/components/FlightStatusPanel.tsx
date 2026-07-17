import React, { useEffect, useRef, useState } from "react";
import { Clock, AlertTriangle, Users, Plane, CheckCircle2 } from "lucide-react";
import { FlightStatusUpdate, FlightState } from "@/lib/flightStatusSimulator";

interface FlightStatusPanelProps {
    status: FlightStatusUpdate;
}

const STATUS_STYLES: Record<FlightState, { bg: string; text: string; ring: string; icon: React.ElementType }> = {
    "On Time": { bg: "bg-green-50", text: "text-green-700", ring: "ring-green-300", icon: Clock },
    "Delayed": { bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-300", icon: AlertTriangle },
    "Boarding": { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-300", icon: Users },
    "Departed": { bg: "bg-indigo-50", text: "text-indigo-700", ring: "ring-indigo-300", icon: Plane },
    "Landed": { bg: "bg-gray-100", text: "text-gray-700", ring: "ring-gray-300", icon: CheckCircle2 },
};

function formatRelativeTime(iso: string, nowTick: number): string {
    const seconds = Math.max(0, Math.floor((nowTick - new Date(iso).getTime()) / 1000));
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

function formatClock(iso: string): string {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const FlightStatusPanel = ({ status }: FlightStatusPanelProps) => {
    const [nowTick, setNowTick] = useState(() => Date.now());
    const [justChanged, setJustChanged] = useState(false);
    const previousStatusRef = useRef(status.status);

    useEffect(() => {
        const timer = setInterval(() => setNowTick(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (previousStatusRef.current !== status.status) {
            previousStatusRef.current = status.status;
            setJustChanged(true);
            const timeout = setTimeout(() => setJustChanged(false), 900);
            return () => clearTimeout(timeout);
        }
    }, [status.status]);

    const style = STATUS_STYLES[status.status];
    const Icon = style.icon;

    const departureMs = new Date(status.revisedDeparture).getTime();
    const arrivalMs = new Date(status.estimatedArrival).getTime();
    const progressPercent =
        status.status === "Departed"
            ? Math.min(100, Math.max(0, ((nowTick - departureMs) / (arrivalMs - departureMs)) * 100))
            : null;

    return (
        <div
            className={`rounded-lg border border-gray-200 ${style.bg} p-3 transition-shadow duration-700 ${
                justChanged ? `ring-2 ${style.ring}` : ""
            }`}
            aria-live="polite"
        >
            <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 font-semibold text-sm ${style.text}`}>
                    <Icon className="w-4 h-4" />
                    <span>
                        {status.status === "Delayed"
                            ? `Delayed by ${Math.floor(status.delayMinutes / 60)}h ${status.delayMinutes % 60}m`
                            : status.status}
                    </span>
                </div>
                <span className="text-xs text-gray-400">
                    Updated {formatRelativeTime(status.lastUpdated, nowTick)}
                </span>
            </div>

            <p className="text-xs text-gray-500 mt-1">
                {status.from || "Unknown"} → {status.to || "Unknown"}
            </p>

            {status.status === "Delayed" && status.reason && (
                <p className="text-xs text-gray-500 mt-1">Reason: {status.reason}</p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                <span>Departure: {formatClock(status.revisedDeparture)}</span>
                <span>Estimated arrival: {formatClock(status.estimatedArrival)}</span>
            </div>

            {progressPercent !== null && (
                <div className="mt-2">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-400 rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightStatusPanel;