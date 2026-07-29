import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Star, MessageCircle, Flag, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      className={`h-4 w-4 ${index < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
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
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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

  React.useEffect(() => {
    const previews = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    return () => previews.forEach(URL.revokeObjectURL);
  }, [imageFiles]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const nextFiles = Array.from(files).slice(0, 5 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...nextFiles]);
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      return;
    }
    setSubmitting(true);
    try {
      const images = await Promise.all(imageFiles.map(readFileAsDataUrl));
      await onSubmitReview({ rating, text: comment, images });
      setComment("");
      setImageFiles([]);
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
    <section className="rounded-[32px] bg-slate-50/50 p-6 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {title}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Traveler Reviews
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <div className="rounded-full bg-white px-3 py-1.5 text-slate-600 shadow-sm border border-slate-100">
            <span className="font-semibold text-slate-900">{averageRating.toFixed(1)}</span> / 5 · {reviewCount} reviews
          </div>
          <div className="rounded-full bg-white px-3 py-1.5 text-slate-600 shadow-sm border border-slate-100">
            {reviewCount > 0 ? `${Math.round(averageRating * 20)}% positive` : "No reviews yet"}
          </div>
        </div>
      </div>

      {/* Grid container spanning exactly 520px height on large screens */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:h-[520px]">
        
        {/* Left Column Section */}
        <div className="flex flex-col h-full min-h-0">
          <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm mb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-2xl font-bold text-slate-900">
                  {averageRating.toFixed(1)}
                  <span className="text-xs font-medium text-slate-400">/ 5</span>
                </div>
                <div className="mt-1 flex items-center gap-0.5">{generateStars(Math.round(averageRating))}</div>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortOption(option.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      sortOption === option.value
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100/80 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {sortedReviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
                No reviews yet. Share your experience to help fellow travelers.
              </div>
            ) : (
              sortedReviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-slate-150 bg-white p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-800">{review.username}</span>
                        <span>•</span>
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-0.5">{generateStars(review.rating)}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-slate-400">
                      <span>{review.helpfulCount ?? 0} helpful</span>
                      {review.flagged && (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-600 border border-rose-100">
                          Flagged
                        </span>
                      )}
                    </div>
                  </div>

                  <p
                    className="mt-2.5 text-xs text-slate-600 leading-relaxed whitespace-pre-line overflow-hidden text-ellipsis"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {review.text}
                  </p>

                  {review.images?.length ? (
                    <div className="mt-3 grid gap-2 grid-cols-3">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review visual ${index + 1}`}
                          className="h-20 w-full rounded-xl object-cover border border-slate-100"
                        />
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => setReplyOpen(replyOpen === review.id ? null : review.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-slate-600 transition hover:bg-slate-100"
                    >
                      <MessageCircle className="h-3 w-3" /> Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => onFlagReview(review.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-slate-500 border border-slate-100 transition hover:bg-slate-50"
                    >
                      <Flag className="h-3 w-3" /> Flag
                    </button>
                  </div>

                  {review.replies?.length ? (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                      {review.replies.map((reply) => (
                        <div key={reply.id} className="rounded-xl bg-slate-50/80 p-2.5 text-[11px]">
                          <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
                            <span className="font-semibold text-slate-700">{reply.username}</span>
                            <span>•</span>
                            <span>{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="mt-0.5 text-slate-600 leading-relaxed">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {replyOpen === review.id && currentUser ? (
                    <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3">
                      <Label className="text-[11px] font-semibold text-slate-700" htmlFor={`reply-${review.id}`}>
                        Write a reply
                      </Label>
                      <Textarea
                        id={`reply-${review.id}`}
                        value={replyDraft[review.id] ?? ""}
                        onChange={(event) =>
                          setReplyDraft((prev) => ({ ...prev, [review.id]: event.target.value }))
                        }
                        placeholder="Share a helpful follow-up."
                        className="text-xs min-h-[50px] bg-white"
                      />
                      <Button size="sm" className="h-7 text-[11px]" type="button" onClick={() => submitReply(review.id)} disabled={submitting || !(replyDraft[review.id]?.trim())}>
                        Post Reply
                      </Button>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>

        {/* Right Side Form Panel: Configured as a high-end full height container */}
        <aside className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-h-0">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <ImagePlus className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Share your experience</p>
                <p className="text-[11px] text-slate-400">Tell fellow travelers how it went.</p>
              </div>
            </div>
          </div>

          <form onSubmit={submitReview} className="flex-1 flex flex-col justify-between space-y-4 min-h-0">
            <div className="flex-1 space-y-3 overflow-y-auto pr-0.5 min-h-0">
              {/* Interactive Rating Component */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <span>Your Star Rating</span>
                  <span className="text-rose-500 text-[10px]">*</span>
                </div>
                <div className="flex gap-0.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2 w-max shadow-inner">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded-lg p-1 transition-all hover:bg-white active:scale-95"
                      aria-label={`${value} star rating`}
                    >
                      <Star className={`h-4 w-4 transition ${value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area Section */}
              <div className="space-y-1">
                <Label htmlFor="review-text" className="text-xs font-semibold text-slate-700">
                  Review Details
                </Label>
                <Textarea
                  id="review-text"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={currentUser ? "What made your trip memorable? Detail the service, location, or amenities..." : "Please log in to leave your feedback."}
                  disabled={!currentUser}
                  className="text-xs min-h-[100px] bg-slate-50/30 resize-none focus-visible:bg-white transition-all"
                />
              </div>

              {/* Image Input Selection Block */}
              <div className="space-y-1.5">
                <Label htmlFor="review-images" className="text-xs font-semibold text-slate-700">
                  Add Photos
                </Label>
                <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3">
                  <label
                    htmlFor="review-images"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 cursor-pointer active:scale-95"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    Browse Photos
                  </label>
                  <span className="text-[11px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                    {imageFiles.length} / 5 loaded
                  </span>
                </div>
                <input
                  id="review-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={!currentUser}
                  className="sr-only"
                />
                
                {imagePreviews.length > 0 && (
                  <div className="grid gap-2 grid-cols-3 pt-1">
                    {imagePreviews.map((preview, index) => (
                      <div key={preview} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm h-16">
                        <img src={preview} alt={`Preview index ${index + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/90 text-slate-500 opacity-90 transition hover:bg-white hover:text-rose-600 shadow"
                          aria-label="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Form Action Buttons */}
            <div className="pt-2 border-t border-slate-100">
              <Button 
                type="submit" 
                disabled={!currentUser || submitting || !comment.trim() || rating === 0}
                className="w-full h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition"
              >
                {currentUser ? "Publish Review Content" : "Sign In To Review"}
              </Button>
            </div>
          </form>
        </aside>
      </div>
    </section>
  );
}