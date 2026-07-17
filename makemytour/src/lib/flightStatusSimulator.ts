export type FlightState =
    | "On Time"
    | "Delayed"
    | "Boarding"
    | "Departed"
    | "Landed";

export interface TrackedFlightInfo {
    id: string | number;
    flightName?: string;
    from: string;
    to: string;
    scheduledDeparture: string;
    scheduledArrival: string;
}

export interface FlightStatusUpdate {
    id: string | number;
    from: string;
    to: string;
    flightName?: string;
    status: FlightState;
    delayMinutes: number;
    reason: string | null;
    scheduledDeparture: string;
    revisedDeparture: string;
    estimatedArrival: string;
    lastUpdated: string;
}

interface TrackedFlightRecord {
    info: TrackedFlightInfo;
    isDelayed: boolean;
    reason: string | null;
}

const DELAY_REASONS = [
    "Air traffic congestion",
    "Bad weather at destination",
    "Late arrival of aircraft",
    "Technical inspection",
    "Crew scheduling",
];

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

//N speed for N*t multiplier
const TESTING_SPEED_MULTIPLIER = 1;

const DELAY_CHANCE = 0.2;
const REAL_DELAY_MINUTES = 60;
const REAL_DELAY_REVEAL_MINUTES = 90;
const REAL_BOARDING_MINUTES = 30;
const REAL_TAKEOFF_GAP_MINUTES = 0;
const REAL_FLIGHT_DURATION_MINUTES = 120;

const DELAY_AMOUNT = (REAL_DELAY_MINUTES * MINUTE) / TESTING_SPEED_MULTIPLIER;
const DELAY_REVEAL_WINDOW = (REAL_DELAY_REVEAL_MINUTES * MINUTE) / TESTING_SPEED_MULTIPLIER;
const BOARDING_WINDOW = (REAL_BOARDING_MINUTES * MINUTE) / TESTING_SPEED_MULTIPLIER;
const TAKEOFF_GAP = (REAL_TAKEOFF_GAP_MINUTES * MINUTE) / TESTING_SPEED_MULTIPLIER;
const FLIGHT_DURATION = (REAL_FLIGHT_DURATION_MINUTES * MINUTE) / TESTING_SPEED_MULTIPLIER;

function randomOf<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

class FlightStatusSimulator {
    private flights = new Map<string | number, TrackedFlightRecord>();
    private listeners = new Set<(update: FlightStatusUpdate) => void>();
    private timer: ReturnType<typeof setInterval> | null = null;

    start(intervalMs = Math.max(1000, 30000 / TESTING_SPEED_MULTIPLIER)) {
        if (this.timer) return;
        this.timer = setInterval(() => this.tick(), intervalMs);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    subscribe(listener: (update: FlightStatusUpdate) => void) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    track(info: TrackedFlightInfo): FlightStatusUpdate {
        if (!this.flights.has(info.id)) {
            const isDelayed = Math.random() < DELAY_CHANCE;
            const reason = isDelayed ? randomOf(DELAY_REASONS) : null;
            this.flights.set(info.id, { info, isDelayed, reason });
            this.start();
        }
        return this.computeStatus(info.id)!;
    }

    untrack(id: string | number) {
        this.flights.delete(id);
        if (this.flights.size === 0) this.stop();
    }

    getAll(): FlightStatusUpdate[] {
        return Array.from(this.flights.keys())
            .map((id) => this.computeStatus(id))
            .filter((u): u is FlightStatusUpdate => u !== null);
    }

    private tick() {
        this.flights.forEach((_, id) => {
            const update = this.computeStatus(id);
            if (update) this.listeners.forEach((listener) => listener(update));
        });
    }

    private computeStatus(id: string | number): FlightStatusUpdate | null {
        const record = this.flights.get(id);
        if (!record) return null;

        const { info, isDelayed, reason } = record;
        const now = Date.now();
        const scheduled = new Date(info.scheduledDeparture).getTime();
        const effectiveDeparture = isDelayed ? scheduled + DELAY_AMOUNT : scheduled;
        const boardingStart = effectiveDeparture - BOARDING_WINDOW;
        const takeoff = effectiveDeparture + TAKEOFF_GAP;
        const delayRevealPoint = scheduled - DELAY_REVEAL_WINDOW;

        const realArrival = new Date(info.scheduledArrival).getTime();
        const landing = Number.isFinite(realArrival)
            ? (isDelayed ? realArrival + DELAY_AMOUNT : realArrival)
            : takeoff + FLIGHT_DURATION;

        let status: FlightState;
        if (now >= landing) {
            status = "Landed";
        } else if (now >= takeoff) {
            status = "Departed";
        } else if (now >= boardingStart) {
            status = "Boarding";
        } else if (isDelayed && now >= delayRevealPoint) {
            status = "Delayed";
        } else {
            status = "On Time";
        }

        return {
            id: info.id,
            from: info.from,
            to: info.to,
            flightName: info.flightName,
            status,
            delayMinutes: isDelayed ? REAL_DELAY_MINUTES : 0,
            reason: status === "Delayed" ? reason : null,
            scheduledDeparture: info.scheduledDeparture,
            revisedDeparture: new Date(effectiveDeparture).toISOString(),
            estimatedArrival: new Date(landing).toISOString(),
            lastUpdated: new Date(now).toISOString(),
        };
    }
}

export const flightStatusSimulator = new FlightStatusSimulator();