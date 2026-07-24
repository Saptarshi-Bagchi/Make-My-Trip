import { useRouter } from "next/router";
import {
  Star,
  MapPin,
  ChevronRight,
  Home,
  Ticket,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { gethotel, handlehotelbooking } from "@/api";
import { ROOM_TYPES } from "@/lib/roomTypes";
import RoomTypeGrid from "@/components/RoomTypeGrid";
import Room3DPreview from "@/components/Room3DPreview";
import { getPreferences, savePreferences } from "@/lib/bookingPreferences";
import { getHotelExtras } from "@/lib/hotelExtras";
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

  if (loading || !hotel) {
    return <Loader />;
  }

  const extras = getHotelExtras(hotel.id, hotel.location);
  const ratingStars = Math.round(extras.rating);

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    setQuantity(isNaN(value) ? 1 : Math.max(1, Math.min(value, hotel.availableRooms)));
  };

  const roomAdjustedPrice = Math.round(liveHotelPrice * selectedRoomType.multiplier);
  const totalPrice = roomAdjustedPrice * quantity;
  const totalTaxes = Math.round(totalPrice * 0.08);
  const totalDiscounts = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + totalTaxes - totalDiscounts;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const HotelContent = () => (
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
  );

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
        <div className="grid gap-8 lg:grid-cols-[2.2fr_0.8fr]">
          <div className="space-y-8">
            <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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

              <div className="mt-8 grid gap-4 lg:grid-cols-[2fr_1fr]">
                <div className="overflow-hidden rounded-[28px] bg-slate-100">
                  <img
                    src={extras.images[0]}
                    alt="Hotel main"
                    className="h-full min-h-[360px] w-full object-cover transition duration-500 hover:scale-[1.02]"
                  />
                </div>
                <div className="grid gap-4">
                  <img
                    src={extras.images[1]}
                    alt="Hotel room"
                    className="h-[176px] w-full rounded-[28px] object-cover transition duration-500 hover:scale-[1.02]"
                  />
                  <img
                    src={extras.images[2]}
                    alt="Hotel lounge"
                    className="h-[176px] w-full rounded-[28px] object-cover transition duration-500 hover:scale-[1.02]"
                  />
                </div>
              </div>

              <div className="mt-8 lg:grid lg:grid-cols-[1.7fr_0.9fr] lg:items-start lg:gap-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Designed for a premium stay
                  </h2>
                  <p className="mt-4 leading-7 text-slate-600">
                    {extras.description}
                  </p>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Location
                  </p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">
                    {hotel.location}
                  </p>
                  <p className="mt-2 text-slate-600">
                    {extras.distanceText}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Choose your room
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {selectedRoomType.name}
                  </h2>
                </div>
                <span className="whitespace-nowrap rounded-3xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  Best value
                </span>
              </div>

              <RoomTypeGrid
                roomTypes={ROOM_TYPES}
                basePrice={liveHotelPrice}
                selectedId={selectedRoomTypeId}
                onSelect={setSelectedRoomTypeId}
              />

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                <Room3DPreview images={selectedRoomType.images} name={selectedRoomType.name} />
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
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
                    <HotelContent />
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
              <div className="mb-4 flex items-center gap-0.5 text-amber-500">
                {[...Array(ratingStars)].map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-amber-500" />
                ))}
                {[...Array(5 - ratingStars)].map((_, index) => (
                  <Star key={index} className="h-4 w-4 text-slate-300" />
                ))}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-slate-900">
                  {extras.rating}
                </span>
                <span className="text-sm font-medium text-slate-400">/ 5</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${(extras.rating / 5) * 100}%` }}
                />
              </div>
              <p className="mt-3 text-slate-600">
                <span className="font-semibold text-emerald-600">{extras.reviewText}</span>{" "}
                · {extras.reviewCount} reviews
              </p>
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
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BookHotelPage;