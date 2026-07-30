export type RecommendationFeedback = "helpful" | "irrelevant";

export interface RecommendationCandidate {
  id: string;
  type: "Destination" | "Hotel" | "Flight";
  title: string;
  location: string;
  bookingUrl: string;
  summary: string;
  tags: string[];
}

export interface RankedRecommendation extends RecommendationCandidate {
  score: number;
  reason: string;
}

interface CommunityProfile {
  interests: string[];
  liked: string[];
}

// Anonymised seed profiles provide a predictable, mock collaborative-filtering
// data set until the app is connected to real aggregate user interactions.
const COMMUNITY_PROFILES: CommunityProfile[] = [
  { interests: ["beach", "luxury", "relaxation", "island"], liked: ["bali-beach", "goa-resort"] },
  { interests: ["mountain", "scenic", "family", "weekend"], liked: ["shimla-hills"] },
  { interests: ["city", "luxury", "weekend"], liked: ["dubai-city"] },
  { interests: ["beach", "family", "holiday"], liked: ["bali-beach", "goa-resort"] },
];

export const RECOMMENDATION_CANDIDATES: RecommendationCandidate[] = [
  {
    id: "bali-beach",
    type: "Destination",
    title: "Bali Beach Escape",
    location: "Bali",
    bookingUrl: "/book-hotel/1",
    summary: "You liked beaches! Try Bali.",
    tags: ["beach", "relaxation", "island"],
  },
  {
    id: "shimla-hills",
    type: "Destination",
    title: "Shimla Mountain Retreat",
    location: "Shimla",
    bookingUrl: "/book-hotel/4",
    summary: "A cooler escape that fits the mountain-oriented trips you keep exploring.",
    tags: ["mountain", "scenic", "family"],
  },
  {
    id: "goa-resort",
    type: "Hotel",
    title: "Seaside Resort in Goa",
    location: "Goa",
    bookingUrl: "/book-hotel/3",
    summary: "Stay where sunset views and beach time take center stage.",
    tags: ["beach", "luxury", "relaxation"],
  },
  {
    id: "dubai-city",
    type: "Flight",
    title: "Weekend in Dubai",
    location: "Dubai",
    bookingUrl: "/book-flight/1",
    summary: "A polished city break with premium comfort and easy weekend logistics.",
    tags: ["city", "luxury", "weekend"],
  },
];

export function deriveRecommendationTags(signals: string[]): string[] {
  const text = signals.join(" ").toLowerCase();
  const tags = new Set<string>();

  if (/(goa|bali|beach|coastal|sea|island)/.test(text)) tags.add("beach");
  if (/(shimla|manali|mountain|hill|snow|scenic)/.test(text)) tags.add("mountain");
  if (/(delhi|mumbai|bengaluru|kolkata|city|metro|urban|dubai)/.test(text)) tags.add("city");
  if (/(luxury|resort|palace|villa|suite)/.test(text)) tags.add("luxury");
  if (/(family|kids|weekend|holiday)/.test(text)) tags.add("family");

  return tags.size > 0 ? [...tags] : ["beach", "luxury"];
}

function overlap(left: string[], right: string[]) {
  return left.filter((value) => right.includes(value)).length;
}

export function rankRecommendations(
  signals: string[],
  feedback: Record<string, RecommendationFeedback>
): RankedRecommendation[] {
  const tags = deriveRecommendationTags(signals);
  const matchingProfiles = COMMUNITY_PROFILES
    .map((profile) => ({ profile, similarity: overlap(tags, profile.interests) / Math.max(tags.length, 1) }))
    .filter(({ similarity }) => similarity > 0);

  return RECOMMENDATION_CANDIDATES
    .map((candidate) => {
      const personalMatches = overlap(candidate.tags, tags);
      const locationMatch = signals.some((signal) => signal.includes(candidate.location.toLowerCase()));
      const communityMatches = matchingProfiles.reduce(
        (total, { profile, similarity }) =>
          total + (profile.liked.includes(candidate.id) ? Math.round(similarity * 20) : 0),
        0
      );
      const feedbackScore = feedback[candidate.id] === "helpful" ? 18 : feedback[candidate.id] === "irrelevant" ? -28 : 0;
      const score = personalMatches * 16 + (locationMatch ? 14 : 0) + communityMatches + feedbackScore;

      const reasonParts: string[] = [];
      if (personalMatches > 0) {
        const matchedTags = candidate.tags.filter((tag) => tags.includes(tag));
        reasonParts.push(`it matches your ${matchedTags.join(" and ")} preferences`);
      }
      if (communityMatches > 0) reasonParts.push("travellers with similar interests also liked it");
      if (feedback[candidate.id] === "helpful") reasonParts.push("you previously marked it helpful");
      if (reasonParts.length === 0) reasonParts.push("it is a popular option for new travellers");

      return { ...candidate, score, reason: `Recommended because ${reasonParts.join(", and ")}.` };
    })
    .filter((candidate) => feedback[candidate.id] !== "irrelevant")
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export function recommendationFeedbackKey(userId?: string): string {
  return `travel-recommendation-feedback:${userId ?? "anonymous"}`;
}
