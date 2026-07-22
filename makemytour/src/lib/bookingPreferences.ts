export interface BookingPreferences {
    preferredSeatColumn?: string;
    preferredRoomTypeId?: string;
}

function key(userId: string): string {
    return `booking-preferences:${userId}`;
}

export function getPreferences(userId: string): BookingPreferences {
    if (typeof window === "undefined" || !userId) return {};
    const raw = window.localStorage.getItem(key(userId));
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

export function savePreferences(userId: string, prefs: Partial<BookingPreferences>): void {
    if (typeof window === "undefined" || !userId) return;
    const current = getPreferences(userId);
    window.localStorage.setItem(key(userId), JSON.stringify({ ...current, ...prefs }));
}