export interface RoomType {
    id: string;
    name: string;
    multiplier: number;
    description: string;
    amenities: string[];
    images: string[];
}

export const ROOM_TYPES: RoomType[] = [
    {
        id: "standard",
        name: "Standard Room",
        multiplier: 1,
        description: "Comfortable room with essential amenities.",
        amenities: ["Free WiFi", "Air Conditioning", "Flat-screen TV"],
        images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800",
        ],
    },
    {
        id: "deluxe",
        name: "Deluxe Room",
        multiplier: 1.35,
        description: "Spacious room with premium furnishings and a city view.",
        amenities: ["Free WiFi", "City View", "Mini Bar", "Premium Bedding"],
        images: [
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800",
        ],
    },
    {
        id: "suite",
        name: "Executive Suite",
        multiplier: 1.8,
        description: "Separate living area with upgraded, luxury amenities.",
        amenities: ["Free WiFi", "Living Area", "Mini Bar", "Bathtub", "Premium Bedding"],
        images: [
            "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800",
        ],
    },
    {
        id: "premium",
        name: "Premium Ocean View Suite",
        multiplier: 2.3,
        description: "Our top-tier suite with panoramic views and full luxury service.",
        amenities: ["Free WiFi", "Ocean View", "Private Balcony", "Butler Service", "Jacuzzi"],
        images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=800",
        ],
    },
];