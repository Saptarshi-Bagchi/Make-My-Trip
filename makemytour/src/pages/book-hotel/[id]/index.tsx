import { useRouter } from "next/router";
import {
  MapPin,
  ChevronRight,
  Home,
  Ticket,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { gethotel, handlehotelbooking, addHotelReview, replyHotelReview, flagHotelReview } from "@/api";
import { ROOM_TYPES } from "@/lib/roomTypes";
import ReviewSection, { type Review } from "@/components/ReviewSection";
import Room3DPreview from "@/components/Room3DPreview";
import RoomTypeGrid from "@/components/RoomTypeGrid";
import { getPreferences, savePreferences } from "@/lib/bookingPreferences";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import SignupDialog from "@/components/SignupDialog";
import Loader from "@/components/Loader";
import { setUser } from "@/store";
import { useDynamicPrice } from "@/lib/useDynamicPrice";

interface Hotel {
  id: string;
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
  reviews?: Review[];
}

const BookHotelPage = () => {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { id } = router.query;
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: any) => state.user.user);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await gethotel();
        const filteredData = data.filter((hotel: any) => hotel.id === id);
        setHotels(filteredData);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchHotels();
  }, [id]);

  const hotel = hotels[0];
  const hotelReviews = hotel?.reviews ?? [];

  const handleReviewSubmit = async (payload: { rating: number; text: string; images: string[] }) => {
    if (!hotel?.id || !user) return;
    try {
      const updatedHotel = await addHotelReview(hotel.id, {
        userId: user.id,
        username: user.firstName ?? user.name ?? "Guest",
        rating: payload.rating,
        text: payload.text,
        images: payload.images,
        createdAt: new Date().toISOString(),
      });
      setHotels([updatedHotel]);
    } catch (error) {
      console.error("Error submitting hotel review:", error);
    }
  };

  const handleReviewReply = async (reviewId: string, text: string) => {
    if (!hotel?.id || !user) return;
    try {
      const updatedHotel = await replyHotelReview(hotel.id, reviewId, {
        userId: user.id,
        username: user.firstName ?? user.name ?? "Guest",
        text,
        createdAt: new Date().toISOString(),
      });
      setHotels([updatedHotel]);
    } catch (error) {
      console.error("Error replying to hotel review:", error);
    }
  };

  const handleReviewFlag = async (reviewId: string) => {
    if (!hotel?.id) return;
    try {
      const updatedHotel = await flagHotelReview(hotel.id, reviewId);
      setHotels([updatedHotel]);
    } catch (error) {
      console.error("Error flagging hotel review:", error);
    }
  };

  const FULL_CAPACITY_HOTEL = 50;
  const { displayPrice: liveHotelPrice } = useDynamicPrice({
    type: "hotel",
    id: hotel?.id,
    basePrice: hotel?.pricePerNight ?? 0,
    availableUnits: hotel?.availableRooms ?? 0,
    fullCapacity: FULL_CAPACITY_HOTEL,
  });

  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(ROOM_TYPES[0].id);

  useEffect(() => {
    if (user?.id) {
      const prefs = getPreferences(user.id);
      if (prefs.preferredRoomTypeId) setSelectedRoomTypeId(prefs.preferredRoomTypeId);
    }
  }, [user?.id]);

  const selectedRoomType = ROOM_TYPES.find((r) => r.id === selectedRoomTypeId) ?? ROOM_TYPES[0];

  const hotelGalleryImages = useMemo(() => {
    const pool = ROOM_TYPES.flatMap((room) => room.images);
    const uniqueImages = Array.from(new Set(pool));
    const shuffled = [...uniqueImages].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [selectedRoomTypeId]);

  if (loading || !hotel) {
    return <Loader />;
  }

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    setQuantity(isNaN(value) ? 1 : Math.max(1, Math.min(value, hotel.availableRooms)));
  };

  const roomAdjustedPrice = Math.round(liveHotelPrice * selectedRoomType.multiplier);
  const totalPrice = roomAdjustedPrice * quantity;
  const totalTaxes = Math.round(totalPrice * 0.08);
  const totalDiscounts = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + totalTaxes - totalDiscounts;

  const handleBooking = async () => {
    try {
      const data = await handlehotelbooking(
        user?.id,
        hotel?.id,
        quantity,
        grandTotal,
        selectedRoomType.name
      );
      const updatedUser = {
        ...user,
        bookings: [...user.bookings, data],
      };
      dispatch(setUser(updatedUser));
      if (user?.id) {
        savePreferences(user.id, { preferredRoomTypeId: selectedRoomType.id });
      }
      setOpen(false);
      setQuantity(1);
      router.push("/profile");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <a href="/" className="font-medium text-blue-600 transition hover:text-blue-700 hover:underline">
              Home
            </a>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <span>{hotel.location}</span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <span className="font-medium text-slate-900">{hotel.hotelName}</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.8fr_0.95fr] lg:items-start">
          <div className="space-y-8">
            <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <div className="grid gap-4 lg:grid-cols-[1.7fr_0.95fr]">
                <div className="overflow-hidden rounded-[28px] bg-slate-100 lg:h-[420px]">
                  <img
                    src={hotelGalleryImages[0]}
                    alt={`${hotel.hotelName} room photo 1`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid gap-4">
                  {hotelGalleryImages.slice(1).map((src, index) => (
                    <div key={index} className="overflow-hidden rounded-[28px] bg-slate-100 h-[204px] lg:h-[205px]">
                      <img
                        src={src}
                        alt={`${hotel.hotelName} room photo ${index + 2}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    {hotel.hotelName}
                  </h1>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {hotel.location}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Choose your room
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {selectedRoomType.name}
                </h2>
              </div>

              <RoomTypeGrid
                roomTypes={ROOM_TYPES}
                basePrice={liveHotelPrice}
                selectedId={selectedRoomTypeId}
                onSelect={setSelectedRoomTypeId}
              />

              <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                <h3 className="mb-3 font-semibold text-slate-900">What's included</h3>
                <div className="space-y-2.5">
                  {selectedRoomType.amenities.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-slate-700">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Your stay
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                  {selectedRoomType.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {quantity} room{quantity > 1 ? "s" : ""} · {hotel.location}
                </p>
              </div>

              <div className="rounded-[28px] border border-blue-100 bg-blue-50 p-5">
                <div className="flex justify-between text-xs font-medium uppercase tracking-[0.2em] text-blue-700/70">
                  <span>Nightly rate</span>
                  <span>₹{roomAdjustedPrice.toLocaleString()}</span>
                </div>
                <div className="mt-4 flex justify-between text-sm text-slate-600">
                  <span>Rooms</span>
                  <span>{quantity}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm text-slate-600">
                  <span>Taxes</span>
                  <span>₹{totalTaxes.toLocaleString()}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>- ₹{Math.abs(totalDiscounts).toLocaleString()}</span>
                </div>
                <div className="mt-5 border-t border-blue-200 pt-4 text-lg font-semibold text-slate-900">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                      Book this stay
                    </button>
                  </DialogTrigger>
                  {user ? (
                    <DialogContent className="sm:max-w-[600px] bg-white">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <Home className="h-5 w-5" />
                          </span>
                          Hotel Booking Details
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-6 mt-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="hotelName" className="flex items-center gap-2 text-slate-600">
                              <MapPin className="w-4 h-4" />
                              Hotel Name
                            </Label>
                            <Input id="hotelName" value={hotel.hotelName} readOnly className="bg-slate-50" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location" className="flex items-center gap-2 text-slate-600">
                              <MapPin className="w-4 h-4" />
                              Location
                            </Label>
                            <Input id="location" value={hotel.location} readOnly className="bg-slate-50" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pricePerNight" className="flex items-center gap-2 text-slate-600">
                              <Ticket className="w-4 h-4" />
                              Price Per Night
                            </Label>
                            <Input
                              id="pricePerNight"
                              value={`₹ ${liveHotelPrice.toLocaleString()}`}
                              readOnly
                              className="bg-slate-50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="availableRooms" className="flex items-center gap-2 text-slate-600">
                              <Ticket className="w-4 h-4" />
                              Available Rooms
                            </Label>
                            <Input
                              id="availableRooms"
                              value={hotel.availableRooms}
                              readOnly
                              className="bg-slate-50"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="quantity" className="flex items-center gap-2 text-slate-600">
                              <Ticket className="w-4 h-4" />
                              Number of Rooms
                            </Label>
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              max={hotel.availableRooms}
                              value={quantity}
                              onChange={handleQuantityChange}
                            />
                          </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                            <CreditCard className="h-5 w-5 text-slate-700" />
                            Fare Summary
                          </div>
                          <div className="space-y-3 text-sm text-slate-600">
                            <div className="flex justify-between">
                              <span>Base fare</span>
                              <span className="font-medium text-slate-800">
                                ₹{totalPrice.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Taxes</span>
                              <span className="font-medium text-slate-800">
                                ₹{totalTaxes.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-emerald-600">
                              <span>Discount</span>
                              <span className="font-medium">
                                - ₹{Math.abs(totalDiscounts).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                              <span>Total</span>
                              <span>₹{grandTotal.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        className="mt-4 w-full transition hover:shadow-md"
                        onClick={handleBooking}
                      >
                        Proceed to Payment
                      </Button>
                    </DialogContent>
                  ) : (
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>Login required</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-slate-600">Please sign in to complete your reservation.</p>
                      <SignupDialog
                        trigger={
                          <Button className="mt-6 w-full">Log In / Sign Up</Button>
                        }
                      />
                    </DialogContent>
                  )}
                </Dialog>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Good to know
              </h3>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Free cancellation until 24 hours before check-in.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span>Instant confirmation, no waiting on approval.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span>Pay securely online or at the property.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <h3 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">
                Why book here
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Best price guarantee with transparent fees.
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Dedicated support for every stay.
                </li>
              </ul>
            </div>

            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <Room3DPreview name={selectedRoomType.name} images={selectedRoomType.images} />
            </div>
          </aside>
        </div>

        <div className="mt-10">
          <ReviewSection
            title="Hotel reviews"
            reviews={hotelReviews}
            currentUser={user}
            onSubmitReview={handleReviewSubmit}
            onSubmitReply={handleReviewReply}
            onFlagReview={handleReviewFlag}
          />
        </div>
      </main>
    </div>
  );
};

export default BookHotelPage;