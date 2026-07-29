import * as React from "react";
import { useMemo, useState } from "react";
import { Star, MessageCircle, Flag, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type Review = {
  id: string;
  username: string;
  userId?: string;
  createdAt: string;
  rating: number;
  text: string;
  images?: string[];
  flagged?: boolean;
  helpfulCount?: number;
  replies?: Reply[];
};

export type Reply = {
  id: string;
  username: string;
  userId?: string;
  createdAt: string;
  text: string;
};

export type SortOption = "mostHelpful" | "newest" | "highestRated";

interface ReviewSectionProps {
  title: string;
  reviews: Review[];
  currentUser: any;
  onSubmitReview: (payload: { rating: number; text: string; images: string[] }) => Promise<void>;
  onSubmitReply: (reviewId: string, text: string) => Promise<void>;
  onFlagReview: (reviewId: string) => Promise<void>;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "mostHelpful", label: "Most helpful" },
  { value: "newest", label: "Newest" },
  { value: "highestRated", label: "Highest rated" },
];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const generateStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${index < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
    />
  ));
};

export default function ReviewSection({
  title,
  reviews,
  currentUser,
  onSubmitReview,
  onSubmitReply,
  onFlagReview,
}: ReviewSectionProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("mostHelpful");
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortOption === "highestRated") {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0) ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews, sortOption]);

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      return;
    }
    setSubmitting(true);
    try {
      const images = imageUrls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);
      await onSubmitReview({ rating, text: comment, images });
      setComment("");
      setImageUrls("");
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (reviewId: string) => {
    const text = replyDraft[reviewId]?.trim();
    if (!text || !currentUser) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmitReply(reviewId, text);
      setReplyDraft((prev) => ({ ...prev, [reviewId]: "" }));
      setReplyOpen(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {title}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Traveler reviews
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <div className="rounded-3xl bg-slate-50 px-3 py-2 text-slate-700">
            {averageRating.toFixed(1)} / 5 · {reviewCount} reviews
          </div>
          <div className="rounded-3xl bg-slate-50 px-3 py-2 text-slate-700">
            {reviewCount > 0 ? `${Math.round(averageRating * 20)}% positive` : "No reviews yet"}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-50 p-5">
            <div>
              <div className="flex items-center gap-2 text-3xl font-semibold text-slate-900">
                {averageRating.toFixed(1)}
                <span className="text-base text-slate-500">/ 5</span>
              </div>
              <div className="mt-1 flex items-center gap-1">{generateStars(Math.round(averageRating))}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSortOption(option.value)}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                    sortOption === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {sortedReviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
              No reviews yet. Share your experience to help fellow travelers.
            </div>
          ) : (
            sortedReviews.map((review) => (
              <article key={review.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-800">
                      <span className="font-semibold">{review.username}</span>
                      <span className="text-slate-400">•</span>
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1">{generateStars(review.rating)}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{review.helpfulCount ?? 0} found this helpful</span>
                    {review.flagged && (
                      <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700">
                        Flagged for review
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-slate-600 whitespace-pre-line">{review.text}</p>

                {review.images?.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="h-44 w-full rounded-3xl object-cover border border-slate-200"
                      />
                    ))}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setReplyOpen(replyOpen === review.id ? null : review.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
                  >
                    <MessageCircle className="h-4 w-4" /> Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => onFlagReview(review.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:bg-slate-50"
                  >
                    <Flag className="h-4 w-4" /> Flag
                  </button>
                </div>

                {review.replies?.length ? (
                  <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
                    {review.replies.map((reply) => (
                      <div key={reply.id} className="rounded-3xl bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                          <span className="font-semibold">{reply.username}</span>
                          <span className="text-slate-400">•</span>
                          <span>{formatDate(reply.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-slate-600">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {replyOpen === review.id && currentUser ? (
                  <div className="mt-5 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <Label className="text-sm font-semibold" htmlFor={`reply-${review.id}`}>
                      Write a reply
                    </Label>
                    <Textarea
                      id={`reply-${review.id}`}
                      value={replyDraft[review.id] ?? ""}
                      onChange={(event) =>
                        setReplyDraft((prev) => ({ ...prev, [review.id]: event.target.value }))
                      }
                      placeholder="Share a helpful follow-up or encourage the reviewer."
                    />
                    <Button type="button" onClick={() => submitReply(review.id)} disabled={submitting || !(replyDraft[review.id]?.trim())}>
                      Post Reply
                    </Button>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>

        <aside className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="rounded-2xl bg-blue-600 p-2 text-white">
                <ImagePlus className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Add a review</p>
                <p className="text-sm text-slate-500">Share your stay or flight experience with photos.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold">Your rating</span>
              <span className="text-slate-400">(required)</span>
            </div>
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`rounded-full p-2 transition ${value <= rating ? "bg-blue-600 text-white" : "bg-white text-slate-400 hover:bg-slate-100"}`}
                aria-label={`${value} star rating`}
              >
                <Star className="h-4 w-4" />
              </button>
            ))}</div>
          </div>

          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <Label htmlFor="review-text" className="text-sm font-semibold text-slate-700">
                Your review
              </Label>
              <Textarea
                id="review-text"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={currentUser ? "Describe what made your trip memorable." : "Sign in to leave a review."}
                disabled={!currentUser}
              />
            </div>
            <div>
              <Label htmlFor="review-images" className="text-sm font-semibold text-slate-700">
                Photos
              </Label>
              <Input
                id="review-images"
                type="text"
                value={imageUrls}
                onChange={(event) => setImageUrls(event.target.value)}
                placeholder="Image URLs, separated by commas"
                disabled={!currentUser}
              />
              <p className="mt-2 text-xs text-slate-500">
                Add URLs to photos that support your review. Images help other travelers find the best experience.
              </p>
            </div>
            <Button type="submit" disabled={!currentUser || submitting || !comment.trim()}>
              {currentUser ? "Publish review" : "Sign in to review"}
            </Button>
          </form>
        </aside>
      </div>
    </section>
  );
}
