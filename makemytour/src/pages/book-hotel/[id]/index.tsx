import { useRouter } from "next/router";
import {
  MapPin,
  ChevronRight,
  Home,
  Ticket,
  CreditCard,
  ShieldCheck,
  Info,
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
import { useTheme } from "@/components/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  // Harmonized palette styling from the Flight template
  const cardStyles = isDark 
    ? "bg-[#1A302C] border-[#24413D] text-[#EAF2F0]" 
    : "bg-white border-transparent shadow-[0_8px_30px_-12px_rgba(31,51,48,0.15)] text-[#22322F]";

  const inputStyles = isDark 
    ? "bg-[#162624] border-[#24413D] text-[#EAF2F0] focus:border-[#7FD1C4]" 
    : "bg-white border-[#DCE7E4] text-[#1F3330] focus:border-[#3E6E6A]";

  const labelStyles = isDark ? "text-[#7FA39D]" : "text-[#62807C]";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#162624] text-[#EAF2F0]" : "bg-[#f4f7fa] text-[#22322F]"}`}>
      <div className={`border-b transition-colors ${isDark ? "border-[#24413D] bg-[#1A302C]/50 backdrop-blur-md" : "bg-white border-gray-100"}`}>
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className={`flex flex-wrap items-center gap-2 text-sm ${isDark ? "text-[#A7BFBA]" : "text-gray-500"}`}>
            <a href="/" className={`font-medium transition hover:underline ${isDark ? "text-[#7FD1C4] hover:text-[#aef3e8]" : "text-blue-600 hover:text-blue-700"}`}>
              Home
            </a>
            <ChevronRight className={`h-4 w-4 ${isDark ? "text-[#24413D]" : "text-slate-300"}`} />
            <span>{hotel.location}</span>
            <ChevronRight className={`h-4 w-4 ${isDark ? "text-[#24413D]" : "text-slate-300"}`} />
            <span className={`font-medium ${isDark ? "text-[#EAF2F0]" : "text-slate-900"}`}>{hotel.hotelName}</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.8fr_0.95fr] lg:items-start">
          {/* Main Grid Options */}
          <div className="space-y-6">
            <section className={`rounded-xl p-6 border transition-colors ${cardStyles}`}>
              <div className="grid gap-4 lg:grid-cols-[1.7fr_0.95fr]">
                <div className={`overflow-hidden rounded-xl lg:h-[420px] ${isDark ? "bg-[#162624]" : "bg-slate-100"}`}>
                  <img
                    src={hotelGalleryImages[0]}
                    alt={`${hotel.hotelName} room photo 1`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid gap-4">
                  {hotelGalleryImages.slice(1).map((src, index) => (
                    <div key={index} className={`overflow-hidden rounded-xl h-[204px] lg:h-[205px] ${isDark ? "bg-[#162624]" : "bg-slate-100"}`}>
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
                  <h1 className="text-2xl font-bold font-display">{hotel.hotelName}</h1>
                  <p className={`mt-2 flex items-center gap-1.5 text-sm ${isDark ? "text-[#A7BFBA]" : "text-gray-600"}`}>
                    <MapPin className={`h-4 w-4 ${isDark ? "text-[#7FD1C4]" : "text-[#3E6E6A]"}`} />
                    {hotel.location}
                  </p>
                </div>
                <button className={`text-sm font-medium flex items-center ${isDark ? "text-[#7FD1C4] hover:text-[#aef3e8]" : "text-blue-600 hover:text-blue-700"}`}>
                  <Info className="w-4 h-4 mr-1" />
                  View Property Rules
                </button>
              </div>
            </section>

            <section className={`rounded-xl p-6 border transition-colors ${cardStyles}`}>
              <div className="mb-5">
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-[#7C948F]" : "text-gray-500"}`}>
                  Choose your room
                </p>
                <h2 className="mt-2 text-xl font-bold font-display">
                  {selectedRoomType.name}
                </h2>
              </div>

              <RoomTypeGrid
                roomTypes={ROOM_TYPES}
                basePrice={liveHotelPrice}
                selectedId={selectedRoomTypeId}
                onSelect={setSelectedRoomTypeId}
              />

              <div className={`mt-6 rounded-xl border p-5 text-sm transition-colors ${isDark ? "bg-[#162624] border-[#24413D] text-[#A7BFBA]" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                <h3 className={`mb-3 font-semibold ${isDark ? "text-[#EAF2F0]" : "text-slate-900"}`}>What's included</h3>
                <div className="space-y-2.5">
                  {selectedRoomType.amenities.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <aside className="space-y-6">
            <div className={`rounded-xl p-6 border transition-colors ${cardStyles}`}>
              <div className="mb-5">
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-[#7C948F]" : "text-gray-500"}`}>
                  Your stay
                </p>
                <h2 className="mt-2 text-lg font-bold font-display">
                  {selectedRoomType.name}
                </h2>
                <p className={`mt-1 text-sm ${isDark ? "text-[#A7BFBA]" : "text-gray-600"}`}>
                  {quantity} room{quantity > 1 ? "s" : ""} · {hotel.location}
                </p>
              </div>

              <div className={`rounded-xl border p-5 transition-colors ${isDark ? "border-[#24413D] bg-[#162624]" : "border-blue-100 bg-blue-50/50"}`}>
                <div className={`flex justify-between text-xs font-medium uppercase tracking-[0.2em] ${isDark ? "text-[#7FD1C4]" : "text-blue-700"}`}>
                  <span>Nightly rate</span>
                  <span>₹{roomAdjustedPrice.toLocaleString()}</span>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <span className={isDark ? "text-[#A7BFBA]" : "text-gray-600"}>Rooms</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className={isDark ? "text-[#A7BFBA]" : "text-gray-600"}>Taxes</span>
                  <span className="font-medium">₹{totalTaxes.toLocaleString()}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm text-green-500">
                  <span className="font-medium">Discount</span>
                  <span className="font-medium">- ₹{Math.abs(totalDiscounts).toLocaleString()}</span>
                </div>
                <div className={`mt-5 border-t pt-4 text-lg font-bold font-display ${isDark ? "border-[#24413D]" : "border-blue-100"}`}>
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${
                      isDark ? "bg-[#2C504D] hover:bg-[#3E6E6A]" : "bg-[#3E6E6A] hover:bg-[#2C504D]"
                    }`}>
                      Book this stay
                    </button>
                  </DialogTrigger>
                  {user ? (
                    <DialogContent className={`sm:max-w-[600px] border transition-colors ${isDark ? "bg-[#1A302C] border-[#24413D] text-[#EAF2F0]" : "bg-white text-[#22322F]"}`}>
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center font-display">
                          <span className={`flex h-10 w-10 items-center justify-center rounded-full mr-2 ${isDark ? "bg-[#24413D] text-[#7FD1C4]" : "bg-blue-50 text-[#3E6E6A]"}`}>
                            <Home className="h-5 w-5" />
                          </span>
                          Hotel Booking Details
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-6 mt-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="hotelName" className={`flex items-center ${labelStyles}`}>
                              <MapPin className="w-4 h-4 mr-2" />
                              Hotel Name
                            </Label>
                            <Input id="hotelName" value={hotel.hotelName} readOnly className={inputStyles} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location" className={`flex items-center ${labelStyles}`}>
                              <MapPin className="w-4 h-4 mr-2" />
                              Location
                            </Label>
                            <Input id="location" value={hotel.location} readOnly className={inputStyles} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pricePerNight" className={`flex items-center ${labelStyles}`}>
                              <Ticket className="w-4 h-4 mr-2" />
                              Price Per Night
                            </Label>
                            <Input
                              id="pricePerNight"
                              value={`₹ ${liveHotelPrice.toLocaleString()}`}
                              readOnly
                              className={inputStyles}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="availableRooms" className={`flex items-center ${labelStyles}`}>
                              <Ticket className="w-4 h-4 mr-2" />
                              Available Rooms
                            </Label>
                            <Input
                              id="availableRooms"
                              value={hotel.availableRooms}
                              readOnly
                              className={inputStyles}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="quantity" className={`flex items-center ${labelStyles}`}>
                              <Ticket className="w-4 h-4 mr-2" />
                              Number of Rooms
                            </Label>
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              max={hotel.availableRooms}
                              value={quantity}
                              onChange={handleQuantityChange}
                              className={inputStyles}
                            />
                          </div>
                        </div>

                        <div className={`rounded-xl border p-5 transition-colors ${isDark ? "bg-[#162624] border-[#24413D]" : "bg-gray-100"}`}>
                          <div className="mb-4 flex items-center gap-2 text-lg font-bold font-display">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            Fare Summary
                          </div>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className={isDark ? "text-[#A7BFBA]" : "text-gray-600"}>Base fare</span>
                              <span className="font-medium">
                                ₹{totalPrice.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDark ? "text-[#A7BFBA]" : "text-gray-600"}>Taxes</span>
                              <span className="font-medium">
                                ₹{totalTaxes.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-green-500">
                              <span>Discount</span>
                              <span className="font-medium">
                                - ₹{Math.abs(totalDiscounts).toLocaleString()}
                              </span>
                            </div>
                            <div className={`flex justify-between border-t pt-3 text-base font-bold font-display ${isDark ? "border-[#24413D]" : "border-gray-200"}`}>
                              <span>Total</span>
                              <span>₹{grandTotal.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        className={`w-full mt-4 text-white font-medium ${
                          isDark ? "bg-[#2C504D] hover:bg-[#3E6E6A]" : "bg-[#3E6E6A] hover:bg-[#2C504D]"
                        }`}
                        onClick={handleBooking}
                      >
                        Proceed to Payment
                      </Button>
                    </DialogContent>
                  ) : (
                    <DialogContent className={`border transition-colors ${isDark ? "bg-[#1A302C] border-[#24413D] text-[#EAF2F0]" : "bg-white text-[#22322F]"}`}>
                      <DialogHeader>
                        <DialogTitle className="font-display">Login required</DialogTitle>
                      </DialogHeader>
                      <p className={isDark ? "text-[#A7BFBA]" : "text-gray-600"}>Please sign in to complete your reservation.</p>
                      <SignupDialog
                        trigger={
                          <Button className={`w-full mt-6 text-white font-medium ${
                            isDark ? "bg-[#2C504D] hover:bg-[#3E6E6A]" : "bg-[#3E6E6A] hover:bg-[#2C504D]"
                          }`}>Log In / Sign Up</Button>
                        }
                      />
                    </DialogContent>
                  )}
                </Dialog>
              </div>
            </div>

            <div className={`rounded-xl p-6 border transition-colors ${cardStyles}`}>
              <h3 className={`mb-4 text-sm font-semibold uppercase tracking-[0.2em] ${isDark ? "text-[#7C948F]" : "text-slate-500"}`}>
                Good to know
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Free cancellation until 24 hours before check-in.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Ticket className={`mt-0.5 h-4 w-4 shrink-0 ${isDark ? "text-[#7FD1C4]" : "text-blue-500"}`} />
                  <span>Instant confirmation, no waiting on approval.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CreditCard className={`mt-0.5 h-4 w-4 shrink-0 ${isDark ? "text-[#7FD1C4]" : "text-blue-500"}`} />
                  <span>Pay securely online or at the property.</span>
                </li>
              </ul>
            </div>

            <div className={`rounded-xl p-6 border transition-colors ${cardStyles}`}>
              <h3 className="mb-4 text-lg font-bold font-display">
                Why book here
              </h3>
              <ul className="space-y-3 text-sm">
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

            <div className={`rounded-xl p-6 border transition-colors ${cardStyles}`}>
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