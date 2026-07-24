export interface HotelExtras {
    rating: number;
    reviewCount: number;
    reviewText: string;
    description: string;
    distanceText: string;
    images: string[];
}

const IMAGE_POOL = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200",
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200",
    "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=1200",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200",
];

const DESCRIPTIONS = [
    "A well-loved stay in {location}, known for attentive service and comfortable rooms.",
    "Set in the heart of {location}, offering a relaxed base for both leisure and business travelers.",
    "A modern property in {location} with a strong reputation for cleanliness and hospitality.",
    "Popular with return guests, this {location} property blends comfort with convenient access to local attractions.",
    "A reliable choice in {location}, praised for its friendly staff and well-maintained rooms.",
];

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

export function getHotelExtras(hotelId: string, location: string): HotelExtras {
    const rand = mulberry32(hashString(hotelId));

    const rating = Math.round((3 + rand() * 2) * 10) / 10;
    const reviewCount = Math.floor(150 + rand() * 1000);
    const reviewText =
        rating >= 4.5 ? "Excellent" : rating >= 4 ? "Very Good" : rating >= 3.5 ? "Good" : "Fair";
    const description = DESCRIPTIONS[Math.floor(rand() * DESCRIPTIONS.length)].replace(
        /{location}/g,
        location
    );
    const walkMinutes = Math.floor(3 + rand() * 12);
    const distanceText = `${walkMinutes} minute walk to central ${location}`;

    const shuffledPool = [...IMAGE_POOL].sort(() => rand() - 0.5);
    const images = shuffledPool.slice(0, 3);

    return { rating, reviewCount, reviewText, description, distanceText, images };
}