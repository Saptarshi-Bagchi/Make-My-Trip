import { useRouter } from "next/router";
import {
  Plane,
  Luggage,
  Clock,
  Calendar,
  MapPin,
  Gift,
  CreditCard,
  AlertCircle,
  ArrowRight,
  Star,
  Info,
  Ticket
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  getflight,
  handleflightbooking,
  addFlightReview,
  replyFlightReview,
  flagFlightReview,
} from "@/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReviewSection, { type Review } from "@/components/ReviewSection";
import { generateSeatMap, calculateSeatSurcharge, Seat } from "@/lib/seatMap";
import FlightSeatMap from "@/components/FlightSeatMap";
import { savePreferences } from "@/lib/bookingPreferences";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@/components/ThemeContext";

interface Flight {
  id: string;
  flightName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  reviews?: Review[];
}

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
import SignupDialog from "@/components/SignupDialog";
import Loader from "@/components/Loader";
import { setUser } from "@/store";
import { useDynamicPrice } from "@/lib/useDynamicPrice";
import DynamicPricingCard from "@/components/DynamicPricingCard";

const BookFlightPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [open, setopem] = useState(false);
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const data = await getflight();
        const filteredData = data.filter((flight: any) => flight.id === id);
        setFlights(filteredData);
      } catch (error) {
        console.error("Error fetching flights:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFlights();
  }, [id]);

  const flight = flights[0];
  const flightReviews = useMemo(() => flight?.reviews ?? [], [flight?.reviews]);

  const handleReviewSubmit = async (payload: { rating: number; text: string; images: string[] }) => {
    if (!flight?.id || !user) return;
    try {
      const updatedFlight = await addFlightReview(flight.id, {
        userId: user.id,
        username: user.firstName ?? user.name ?? "Guest",
        rating: payload.rating,
        text: payload.text,
        images: payload.images,
        createdAt: new Date().toISOString(),
      });
      setFlights([updatedFlight]);
    } catch (error) {
      console.error("Error submitting flight review:", error);
    }
  };

  const handleReviewReply = async (reviewId: string, text: string) => {
    if (!flight?.id || !user) return;
    try {
      const updatedFlight = await replyFlightReview(flight.id, reviewId, {
        userId: user.id,
        username: user.firstName ?? user.name ?? "Guest",
        text,
        createdAt: new Date().toISOString(),
      });
      setFlights([updatedFlight]);
    } catch (error) {
      console.error("Error replying to flight review:", error);
    }
  };

  const handleReviewFlag = async (reviewId: string) => {
    if (!flight?.id) return;
    try {
      const updatedFlight = await flagFlightReview(flight.id, reviewId);
      setFlights([updatedFlight]);
    } catch (error) {
      console.error("Error flagging flight review:", error);
    }
  };

  const FULL_CAPACITY_FLIGHT = 180;
  const {
    breakdown: priceBreakdown,
    displayPrice: liveFlightPrice,
    isFrozen,
    freeze,
    history: priceHistory,
    freezeCurrentPrice,
    unfreeze,
  } = useDynamicPrice({
    type: "flight",
    id: flight?.id,
    basePrice: flight?.price ?? 0,
    availableUnits: flight?.availableSeats ?? 0,
    fullCapacity: FULL_CAPACITY_FLIGHT,
  });

  const seatMap = useMemo(() => (flight?.id ? generateSeatMap(flight.id) : []), [flight?.id]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [activeBookingTab, setActiveBookingTab] = useState("details");
  const selectedSeats = seatMap.filter((s: Seat) => selectedSeatIds.includes(s.id));
  const seatSurcharge = calculateSeatSurcharge(selectedSeats);

  const toggleSeat = (seatId: string) => {
    setSelectedSeatIds((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  useEffect(() => {
    setSelectedSeatIds((prev) => prev.slice(0, quantity));
  }, [quantity]);

  if (loading) {
    return <Loader />;
  }
  if (flights.length === 0) {
    return <div className={`p-8 text-center ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>No flight data available for this ID.</div>;
  }

  const flightDetails = {
    from: "Bengaluru",
    to: "New Delhi",
    date: "Thursday, Jan 16",
    flightNo: "IX 2747",
    aircraft: "Airbus A320",
    airline: "Air India Express",
    departureTime: "17:55",
    arrivalTime: "20:55",
    duration: "3h 0m",
    departureTerminal: "Bengaluru International Airport, Terminal T2",
    arrivalTerminal: "Indira Gandhi International Airport, Terminal T3",
    cabinBaggage: "7 Kgs / Adult",
    checkInBaggage: "15 Kgs (1 piece only) / Adult",
  };

  const fareSummary = {
    baseFare: 6124,
    taxes: 1374,
    otherServices: 249,
    discounts: -250,
    total: 7497,
  };

  const promoOffers = [
    {
      code: "MMTSECURE",
      description: "Get an instant discount of ₹299 on your flight booking and Trip Secure with this coupon!",
      amount: 299,
    },
    {
      code: "SPECIALUPI",
      description: "Use this code and get ₹362 instant discount on payments via UPI only!",
      amount: 362,
    },
  ];

  const hotels = [
    {
      name: "Hotel Park Tree",
      rating: 4,
      price: 9000,
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800",
      location: "Near Airport, New Delhi",
    },
    {
      name: "Lemon Tree Premier",
      rating: 4,
      price: 43875,
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800",
      location: "Connaught Place, New Delhi",
    },
    {
      name: "Hotel Kian",
      rating: 4,
      price: 1968,
      image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800",
      location: "Karol Bagh, New Delhi",
    },
  ];

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(dateString);
    return date.toLocaleString("en-US", options);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = Number.parseInt(e.target.value);
    setQuantity(isNaN(value) ? 1 : Math.max(1, Math.min(value, flight.availableSeats)));
  };

  // Fixed Calculations Decoupling Seat Surcharges from Pure Base Fare
  const baseFlightFare = liveFlightPrice * quantity;
  const totalTaxes = fareSummary?.taxes * quantity;
  const totalOtherServices = fareSummary?.otherServices * quantity;
  const totalDiscounts = fareSummary?.discounts * quantity;
  const grandTotal = baseFlightFare + seatSurcharge + totalTaxes + totalOtherServices - totalDiscounts;

  const handlebooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeatIds.length !== quantity) return;
    try {
      const seatNumbersStr = selectedSeatIds.join(", ");
      const data = await handleflightbooking(
        user?.id,
        flight?.id,
        quantity,
        grandTotal,
        seatNumbersStr
      );
      const updateuser = {
        ...user,
        bookings: [...user.bookings, data],
      };
      dispatch(setUser(updateuser));
      if (user?.id) {
        savePreferences(user.id, {
          preferredSeatColumn: selectedSeats[0]?.col,
        });
      }
      setopem(false);
      setQuantity(1);
      setSelectedSeatIds([]);
      router.push("/profile");
    } catch (error) {
      console.log(error);
    }
  };

  const cardStyles = isDark 
    ? "bg-[#1A302C] border-[#24413D] text-[#EAF2F0]" 
    : "bg-white border-transparent shadow-[0_8px_30px_-12px_rgba(31,51,48,0.15)] text-[#22322F]";

  const inputStyles = isDark 
    ? "bg-[#162624] border-[#24413D] text-[#EAF2F0] focus:border-[#7FD1C4]" 
    : "bg-white border-[#DCE7E4] text-[#1F3330] focus:border-[#3E6E6A]";

  const labelStyles = isDark ? "text-[#7FA39D]" : "text-[#62807C]";

  const tabTriggerStyles = (isActive: boolean) => {
    if (isDark) {
      return isActive ? "text-[#7FD1C4] bg-[#162624]" : "text-[#7C948F] hover:text-[#7FD1C4]";
    }
    return isActive ? "text-[#3E6E6A] bg-[#EAF2F0]" : "text-[#7C948F] hover:text-[#3E6E6A]";
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#162624] text-[#EAF2F0]" : "bg-[#f4f7fa] text-[#22322F]"}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Details */}
            <div className={`rounded-xl p-6 border transition-colors ${cardStyles}`}>
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center flex-wrap gap-4 mb-2">
                    <h2 className="text-lg font-bold flex items-center font-display">
                      <span>{flight?.from}</span>
                      <ArrowRight className={`w-5 h-5 mx-2 ${isDark ? "text-[#7FD1C4]" : "text-[#3E6E6A]"}`} />
                      <span>{flight?.to}</span>
                    </h2>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${isDark ? "bg-red-950/50 text-red-400" : "bg-red-100 text-red-600"}`}>
                      CANCELLATION FEES APPLY
                    </span>
                  </div>
                  <div className={`flex items-center text-sm ${isDark ? "text-[#A7BFBA]" : "text-gray-600"}`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(flight.departureTime)}</span>
                    <span className="mx-2">•</span>
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Non Stop - {flightDetails.duration}</span>
                  </div>
                </div>
                <button className={`text-sm font-medium flex items-center ${isDark ? "text-[#7FD1C4] hover:text-[#aef3e8]" : "text-blue-600 hover:text-blue-700"}`}>
                  <Info className="w-4 h-4 mr-1" />
                  View Fare Rules
                </button>
              </div>

              <div className={`flex items-center space-x-4 mb-6 p-4 rounded-xl ${isDark ? "bg-[#162624]" : "bg-blue-50/50"}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? "bg-[#24413D]" : "bg-blue-100"}`}>
                  <Plane className={`w-6 h-6 ${isDark ? "text-[#7FD1C4]" : "text-blue-600"}`} />
                </div>
                <div>
                  <div className="font-semibold font-display">{flight.flightName}</div>
                  <div className={`text-sm ${isDark ? "text-[#A7BFBA]" : "text-gray-600"}`}>
                    {flightDetails.flightNo} • {flightDetails.aircraft}
                  </div>
                </div>
                <div className="ml-auto text-sm">
                  <span className={`px-3 py-1 rounded-full ${isDark ? "bg-[#24413D] text-[#7FD1C4]" : "bg-blue-50 text-blue-600"}`}>
                    Economy
                  </span>
                  <span className={`ml-2 ${isDark ? "text-[#7C948F]" : "text-gray-600"}`}>MMTSPECIAL</span>
                </div>
              </div>

              <div className={`flex flex-wrap md:flex-nowrap justify-between items-start gap-6 border-t pt-6 ${isDark ? "border-[#24413D]" : "border-gray-100"}`}>
                <div>
                  <div className="text-2xl font-bold font-display">{formatDate(flight.departureTime)}</div>
                  <div className={`text-sm mt-1 flex items-start ${isDark ? "text-[#A7BFBA]" : "text-gray-600"}`}>
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                    {flight.from} International Airport, Terminal T2
                  </div>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className={`text-sm mb-1 ${isDark ? "text-[#7C948F]" : "text-gray-600"}`}>{flightDetails.duration}</div>
                  <div className={`w-32 h-0.5 relative my-2 ${isDark ? "bg-[#24413D]" : "bg-gray-300"}`}>
                    <div className={`absolute -top-2 right-0 w-4 h-4 rounded-full flex items-center justify-center ${isDark ? "bg-[#24413D]" : "bg-gray-300"}`}>
                      <Plane className={`w-3 h-3 ${isDark ? "text-[#A7BFBA]" : "text-gray-600"}`} />
                    </div>
                  </div>
                  <div className={`text-xs ${isDark ? "text-[#7C948F]" : "text-gray-500"}`}>Non-stop</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-display">{formatDate(flight.arrivalTime)}</div>
                  <div className={`text-sm mt-1 flex items-start justify-end ${isDark ? "text-[#A7BFBA]" : "text-gray-600"}`}>
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                    {flight.to} International Airport, Terminal T3
                  </div>
                </div>
              </div>

              <div className={`flex flex-wrap gap-6 mt-6 text-sm border-t pt-4 ${isDark ? "border-[#24413D] text-[#A7BFBA]" : "border-gray-100 text-gray-600"}`}>
                <div className="flex items-center">
                  <Luggage className="w-5 h-5 mr-2" />
                  <span>Cabin Baggage: {flightDetails.cabinBaggage}</span>
                </div>
                <div className="flex items-center">
                  <Luggage className="w-5 h-5 mr-2" />
                  <span>Check-in Baggage: {flightDetails.checkInBaggage}</span>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className={`rounded-xl p-6 border transition-colors ${cardStyles}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center font-display">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                  Cancellation & Date Change Policy
                </h2>
                <button className={`text-sm font-medium ${isDark ? "text-[#7FD1C4] hover:text-[#aef3e8]" : "text-blue-600 hover:text-blue-700"}`}>
                  View Policy
                </button>
              </div>
              <div className={`p-6 rounded-xl ${isDark ? "bg-[#162624]" : "bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-[#24413D]" : "bg-blue-100"}`}>
                      <Plane className={`w-5 h-5 ${isDark ? "text-[#7FD1C4]" : "text-blue-600"}`} />
                    </div>
                    <span className="font-semibold font-display">BLR-DEL</span>
                  </div>
                  <div className="font-bold text-lg font-display">₹ 4,300</div>
                </div>
                <div className="h-2.5 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"></div>
                <div className={`flex justify-between mt-2 text-xs ${isDark ? "text-[#7C948F]" : "text-gray-600"}`}>
                  <span>Now</span>
                  <span>16 Jan, 15:55</span>
                  <span>16 Jan, 17:55</span>
                </div>
              </div>
            </div>

            {/* Hotel Offers */}
            <div className={`rounded-xl p-6 border transition-colors ${cardStyles}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center font-display">
                  <Gift className="w-5 h-5 mr-2 text-red-500" />
                  Book a Flight & unlock these offers
                </h2>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${isDark ? "bg-red-950/60 text-red-400" : "bg-red-100 text-red-600"}`}>
                  Flyer Exclusive Deal
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hotels.map((hotel, index) => (
                  <div
                    key={index}
                    className={`border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 ${
                      isDark ? "bg-[#162624] border-[#24413D]" : "bg-white border-gray-100"
                    }`}
                  >
                    <div className="relative">
                      <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${isDark ? "bg-[#1A302C] text-[#EAF2F0]" : "bg-white text-gray-800 shadow-sm"}`}>
                        Best Seller
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 font-display">{hotel.name}</h3>
                      <div className={`flex items-center text-sm mb-2 ${isDark ? "text-[#A7BFBA]" : "text-gray-600"}`}>
                        <MapPin className="w-4 h-4 mr-1" />
                        {hotel.location}
                      </div>
                      <div className="flex items-center justify-between border-t pt-3 mt-2 border-transparent">
                        <div className="flex items-center text-yellow-500">
                          {[...Array(hotel.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <div className="text-right">
                          <div className={`text-xs ${isDark ? "text-[#7C948F]" : "text-gray-500"}`}>Starting from</div>
                          <div className="font-bold text-lg font-display">₹ {hotel.price.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ReviewSection
              title="Flight reviews"
              reviews={flightReviews}
              currentUser={user}
              onSubmitReview={handleReviewSubmit}
              onSubmitReply={handleReviewReply}
              onFlagReview={handleReviewFlag}
            />
          </div>

          {/* Fare Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl p-6 border sticky top-24 transition-colors ${cardStyles}`}>
              <h2 className="text-lg font-bold mb-6 flex items-center font-display">
                <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                Fare Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={isDark ? "text-[#A7BFBA]" : "text-gray-600"}>Base Fare</span>
                  <span className="font-medium">₹ {baseFlightFare.toLocaleString()}</span>
                </div>
                {seatSurcharge > 0 && (
                  <div className="flex justify-between items-center text-amber-500 font-medium">
                    <span>Seat Selection Surcharge</span>
                    <span>₹ {seatSurcharge.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className={isDark ? "text-[#A7BFBA]" : "text-gray-600"}>Taxes and Surcharges</span>
                  <span className="font-medium">₹ {totalTaxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? "text-[#A7BFBA]" : "text-gray-600"}>Other Services</span>
                  <span className="font-medium">₹ {totalOtherServices.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-green-500">
                  <span className="font-medium">Discounts</span>
                  <span className="font-medium">- ₹ {Math.abs(totalDiscounts).toLocaleString()}</span>
                </div>
                <div className={`border-t pt-3 mt-3 ${isDark ? "border-[#24413D]" : "border-gray-100"}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg font-display">Total Amount</span>
                    <span className="font-bold text-lg font-display">₹ {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 mb-6">
                <DynamicPricingCard
                  type="flight"
                  breakdown={priceBreakdown}
                  displayPrice={liveFlightPrice}
                  isFrozen={isFrozen}
                  freeze={freeze}
                  history={priceHistory}
                  onFreeze={() => freezeCurrentPrice(24)}
                  onUnfreeze={unfreeze}
                />
              </div>

              <Dialog open={open} onOpenChange={setopem}>
                <DialogTrigger asChild>
                  <Button className={`w-full text-white font-semibold transition-colors ${
                    isDark ? "bg-[#2C504D] hover:bg-[#3E6E6A]" : "bg-[#3E6E6A] hover:bg-[#2C504D]"
                  }`}>
                    Book Now
                  </Button>
                </DialogTrigger>
                {user ? (
                  <DialogContent className={`sm:max-w-[600px] border transition-colors ${isDark ? "bg-[#1A302C] border-[#24413D] text-[#EAF2F0]" : "bg-white text-[#22322F]"}`}>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold flex items-center font-display">
                        <Plane className={`w-6 h-6 mr-2 ${isDark ? "text-[#7FD1C4]" : "text-[#3E6E6A]"}`} />
                        Flight Booking Details
                      </DialogTitle>
                    </DialogHeader>
                    <Tabs value={activeBookingTab} onValueChange={setActiveBookingTab} className="mt-4">
                      <TabsList className={`grid w-full grid-cols-2 p-1 rounded-xl transition-colors mb-4 ${
                        isDark ? "bg-[#162624] border border-[#24413D]" : "bg-gray-100"
                      }`}>
                        <TabsTrigger value="details" className={tabTriggerStyles(activeBookingTab === "details")}>Details & Fare</TabsTrigger>
                        <TabsTrigger value="seats" className={tabTriggerStyles(activeBookingTab === "seats")}>
                          Select Seats {selectedSeatIds.length > 0 && `(${selectedSeatIds.length}/${quantity})`}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="details">
                        <div className="grid gap-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="flightName" className={`flex items-center ${labelStyles}`}>
                                <Plane className="w-4 h-4 mr-2" />
                                Flight Name
                              </Label>
                              <Input id="flightName" value={flight?.flightName} readOnly className={inputStyles} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="from" className={`flex items-center ${labelStyles}`}>
                                <MapPin className="w-4 h-4 mr-2" />
                                From
                              </Label>
                              <Input id="from" value={flight?.from} readOnly className={inputStyles} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="to" className={`flex items-center ${labelStyles}`}>
                                <MapPin className="w-4 h-4 mr-2" />
                                To
                              </Label>
                              <Input id="to" value={flight?.to} readOnly className={inputStyles} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="departureTime" className={`flex items-center ${labelStyles}`}>
                                <Calendar className="w-4 h-4 mr-2" />
                                Departure Time
                              </Label>
                              <Input id="departureTime" value={new Date(flight.departureTime).toLocaleString()} readOnly className={inputStyles} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="arrivalTime" className={`flex items-center ${labelStyles}`}>
                                <Clock className="w-4 h-4 mr-2" />
                                Arrival Time
                              </Label>
                              <Input id="arrivalTime" value={new Date(flight.arrivalTime).toLocaleString()} readOnly className={inputStyles} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="quantity" className={`flex items-center ${labelStyles}`}>
                                <Ticket className="w-4 h-4 mr-2" />
                                Number of Tickets
                              </Label>
                              <Input id="quantity" type="number" min="1" max={flight.availableSeats} value={quantity} onChange={handleQuantityChange} className={inputStyles} />
                            </div>
                          </div>

                          <div className={`rounded-lg p-4 transition-colors ${isDark ? "bg-[#162624] border border-[#24413D]" : "bg-gray-100"}`}>
                            <h3 className="text-lg font-bold mb-4 flex items-center font-display">
                              <CreditCard className="w-5 h-5 mr-2" />
                              Fare Summary
                            </h3>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className={isDark ? "text-[#A7BFBA]" : "text-gray-600"}>Base Fare</span>
                                <span className="font-medium">₹ {baseFlightFare.toLocaleString()}</span>
                              </div>
                              {seatSurcharge > 0 && (
                                <div className="flex justify-between items-center text-amber-500 font-medium">
                                  <span>Premium Seat Surcharge</span>
                                  <span className="font-medium">₹ {seatSurcharge.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className={isDark ? "text-[#A7BFBA]" : "text-gray-600"}>Taxes and Surcharges</span>
                                <span className="font-medium">₹ {totalTaxes.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className={isDark ? "text-[#A7BFBA]" : "text-gray-600"}>Other Services</span>
                                <span className="font-medium">₹ {totalOtherServices.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-green-500">
                                <span className="font-medium">Discounts</span>
                                <span className="font-medium">- ₹ {Math.abs(totalDiscounts).toLocaleString()}</span>
                              </div>
                              <div className={`border-t pt-2 mt-2 ${isDark ? "border-[#24413D]" : "border-gray-200"}`}>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-lg font-display">Total Amount</span>
                                  <span className="font-bold text-lg font-display">₹ {grandTotal.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="seats">
                        <FlightSeatMap
                          seats={seatMap}
                          selectedSeatIds={selectedSeatIds}
                          onToggle={toggleSeat}
                          maxSelectable={quantity}
                        />
                      </TabsContent>
                    </Tabs>

                    <Button
                      className={`w-full mt-4 text-white font-medium ${
                        isDark ? "bg-[#2C504D] hover:bg-[#3E6E6A]" : "bg-[#3E6E6A] hover:bg-[#2C504D]"
                      }`}
                      onClick={handlebooking}
                      disabled={selectedSeatIds.length !== quantity}
                    >
                      {selectedSeatIds.length !== quantity
                        ? `Select ${quantity} seat${quantity > 1 ? "s" : ""} to continue`
                        : "Proceed to Payment"}
                    </Button>
                  </DialogContent>
                ) : (
                  <DialogContent className={`border transition-colors ${isDark ? "bg-[#1A302C] border-[#24413D] text-[#EAF2F0]" : "bg-white text-[#22322F]"}`}>
                    <DialogHeader>
                      <DialogTitle className="font-display">Login Required</DialogTitle>
                    </DialogHeader>
                    <p className={isDark ? "text-[#A7BFBA]" : "text-gray-600"}>Please log in to continue with your booking.</p>
                    <SignupDialog
                      trigger={
                        <Button className={`w-full text-white font-medium ${
                          isDark ? "bg-[#2C504D] hover:bg-[#3E6E6A]" : "bg-[#3E6E6A] hover:bg-[#2C504D]"
                        }`}>
                          Log In / Sign Up
                        </Button>
                      }
                    />
                  </DialogContent>
                )}
              </Dialog>

              {/* Promo Codes */}
              <div className="mt-8">
                <div className={`p-6 rounded-xl border transition-colors ${isDark ? "bg-[#162624] border-[#24413D]" : "bg-[#FFF8E7] border-transparent"}`}>
                  <h3 className={`font-bold mb-4 flex items-center font-display ${isDark ? "text-[#7FD1C4]" : "text-yellow-700"}`}>
                    <Gift className="w-5 h-5 mr-2" />
                    PROMO CODES
                  </h3>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Enter promo code here"
                      className={`w-full px-4 py-3 rounded-lg focus:ring-2 transition-all ${
                        isDark 
                          ? "bg-[#1A302C] border-[#24413D] text-[#EAF2F0] focus:ring-[#7FD1C4] placeholder-[#7C948F]" 
                          : "bg-white border-gray-200 focus:ring-red-500 placeholder-gray-400"
                      }`}
                    />
                  </div>
                  {promoOffers.map((offer, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg mb-3 shadow-sm border transition-colors ${
                        isDark ? "bg-[#1A302C] border-[#24413D]" : "bg-white border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="promo"
                          className={`mt-1.5 h-4 w-4 focus:ring-offset-0 ${isDark ? "text-[#7FD1C4] accent-[#7FD1C4]" : "text-red-600"}`}
                        />
                        <div>
                          <div className={`font-semibold ${isDark ? "text-[#7FD1C4]" : "text-red-600"}`}>
                            {offer.code}
                          </div>
                          <p className={`text-sm mt-1 ${isDark ? "text-[#A7BFBA]" : "text-gray-600"}`}>
                            {offer.description}
                          </p>
                          <button className={`text-sm font-medium mt-2 block ${isDark ? "text-[#7FD1C4] hover:underline" : "text-blue-600 hover:text-blue-700"}`}>
                            Terms & Conditions
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookFlightPage;