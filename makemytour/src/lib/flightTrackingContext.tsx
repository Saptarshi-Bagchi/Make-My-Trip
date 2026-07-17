import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
    flightStatusSimulator,
    FlightStatusUpdate,
    TrackedFlightInfo,
} from "./flightStatusSimulator";
import { requestNotificationPermission, sendFlightNotification } from "./notifications";

interface FlightTrackingContextValue {
    trackedFlights: FlightStatusUpdate[];
    trackFlight: (info: TrackedFlightInfo) => void;
    untrackFlight: (id: string | number) => void;
    isTracked: (id: string | number) => boolean;
}

const FlightTrackingContext = createContext<FlightTrackingContextValue | null>(null);

export function FlightTrackingProvider({ children }: { children: React.ReactNode }) {
    const [trackedFlights, setTrackedFlights] = useState<FlightStatusUpdate[]>([]);
    const previousRef = useRef<Map<string | number, FlightStatusUpdate>>(new Map());

    useEffect(() => {
        requestNotificationPermission();

        const unsubscribe = flightStatusSimulator.subscribe((update) => {
            setTrackedFlights((prev) => {
                const next = prev.map((f) => (f.id === update.id ? update : f));
                return next;
            });

            const previous = previousRef.current.get(update.id);
            previousRef.current.set(update.id, update);

            if (!previous) return;

            const statusChanged = previous.status !== update.status;
            const delayChanged = previous.delayMinutes !== update.delayMinutes;
            const arrivalChanged = previous.estimatedArrival !== update.estimatedArrival;

            if (statusChanged || delayChanged || arrivalChanged) {
                const title = `${update.flightName ?? "Flight"} (${update.from} → ${update.to})`;
                let body = `Status: ${update.status}`;
                if (update.status === "Delayed" && update.reason) {
                    body += ` — delayed ${update.delayMinutes} min due to ${update.reason}`;
                }
                sendFlightNotification(title, body);
            }
        });

        return unsubscribe;
    }, []);

    const trackFlight = (info: TrackedFlightInfo) => {
        const initial = flightStatusSimulator.track(info);
        previousRef.current.set(info.id, initial);
        setTrackedFlights((prev) => {
            if (prev.some((f) => f.id === info.id)) return prev;
            return [...prev, initial];
        });
    };

    const untrackFlight = (id: string | number) => {
        flightStatusSimulator.untrack(id);
        previousRef.current.delete(id);
        setTrackedFlights((prev) => prev.filter((f) => f.id !== id));
    };

    const isTracked = (id: string | number) => trackedFlights.some((f) => f.id === id);

    return (
        <FlightTrackingContext.Provider
            value={{ trackedFlights, trackFlight, untrackFlight, isTracked }}
        >
            {children}
        </FlightTrackingContext.Provider>
    );
}

export function useFlightTracking(): FlightTrackingContextValue {
    const ctx = useContext(FlightTrackingContext);
    if (!ctx) {
        throw new Error("useFlightTracking must be used within a FlightTrackingProvider");
    }
    return ctx;
}