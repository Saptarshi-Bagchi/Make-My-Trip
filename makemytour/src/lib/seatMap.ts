export interface Seat {
    id: string;
    row: number;
    col: string;
    isPremium: boolean;
    isOccupied: boolean;
}

const TOTAL_ROWS = 30;
const COLUMNS = ["A", "B", "C", "D", "E", "F"];
const PREMIUM_ROWS = 5;
const OCCUPIED_COUNT = 10;
export const PREMIUM_SEAT_SURCHARGE = 800;

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

function mulberry32(seed: number) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function generateSeatMap(flightId: string): Seat[] {
    const rand = mulberry32(hashString(flightId));
    const seats: Seat[] = [];

    for (let row = 1; row <= TOTAL_ROWS; row++) {
        for (const col of COLUMNS) {
            seats.push({ id: `${row}${col}`, row, col, isPremium: row <= PREMIUM_ROWS, isOccupied: false });
        }
    }

    const occupiedIndices = new Set<number>();
    while (occupiedIndices.size < OCCUPIED_COUNT) {
        occupiedIndices.add(Math.floor(rand() * seats.length));
    }
    occupiedIndices.forEach((i) => (seats[i].isOccupied = true));

    return seats;
}

export function calculateSeatSurcharge(selectedSeats: Seat[]): number {
    return selectedSeats.filter((s) => s.isPremium).length * PREMIUM_SEAT_SURCHARGE;
}