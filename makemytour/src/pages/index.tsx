import { getflight, gethotel } from "@/api";
import Loader from "@/components/Loader";
import { SearchSelect } from "@/components/SearchSelect";
import SignupDialog from "@/components/SignupDialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeContext";
import {
  Bus,
  Calendar,
  Car,
  Compass,
  CreditCard,
  HomeIcon,
  Hotel,
  Info,
  MapPin,
  Plane,
  QrCode,
  Shield,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Train,
  Umbrella,
  Users,
  Tag,
  Map,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Head from "next/head";
import {
  rankRecommendations,
  recommendationFeedbackKey,
  type RecommendationFeedback,
} from "@/lib/recommendationEngine";

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [bookingtype, setbookingtype] = useState("flights");
  const [from, setfrom] = useState("");
  const [to, setto] = useState("");
  const [date, setdate] = useState("");
  const [travelers, settravelers] = useState(1);
  const [searchresults, setsearchresult] = useState<any[]>([]);
  const [hotel, sethotel] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [flight, setflight] = useState<any[]>([]);
  const [interactionSignals, setInteractionSignals] = useState<string[]>([]);
  const [recommendationFeedback, setRecommendationFeedback] = useState<
    Record<string, RecommendationFeedback>
  >({});
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();

  const systemFontStack = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

  const offers = [
    {
      title: "Domestic Flights",
      description: "Get up to 20% off on domestic flights",
      imageUrl:
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800",
      badge: "FLIGHT20",
    },
    {
      title: "International Hotels",
      description: "Book luxury hotels worldwide",
      imageUrl:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800",
      badge: "LUXURY30",
    },
    {
      title: "Holiday Packages",
      description: "Exclusive deals on holiday packages",
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800",
      badge: "ESCAPE15",
    },
  ];

  const collections = [
    {
      title: "Stays in & Around Delhi",
      imageUrl:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800",
      tag: "TOP 8",
    },
    {
      title: "Stays in & Around Mumbai",
      imageUrl:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800",
      tag: "TOP 8",
    },
    {
      title: "Stays in & Around Bangalore",
      imageUrl:
        "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800",
      tag: "TOP 9",
    },
    {
      title: "Beach Destinations",
      imageUrl:
        "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=800",
      tag: "TOP 11",
    },
  ];

  const wonders = [
    {
      title: "Shimla's Best Kept Secret",
      imageUrl:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800",
      sub: "Himachal Pradesh",
    },
    {
      title: "Tamil Nadu's Charming Hill Town",
      imageUrl:
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800",
      sub: "Kodaikanal",
    },
    {
      title: "Quaint Little Hill Station in Gujarat",
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800",
      sub: "Saputara",
    },
    {
      title: "A pleasant summer retreat",
      imageUrl:
        "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=800",
      sub: "Coorg",
    },
  ];

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await gethotel();
        sethotel(Array.isArray(data) ? data : []);
        const flightdata = await getflight();
        setflight(Array.isArray(flightdata) ? flightdata : []);
      } catch (error) {
        console.error(error);
        sethotel([]);
        setflight([]);
      } finally {
        setloading(false);
      }
    };

    fetchdata();
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedFeedback = window.localStorage.getItem(recommendationFeedbackKey(user?.id));
      if (savedFeedback) {
        setRecommendationFeedback(JSON.parse(savedFeedback));
      }
    } catch (error) {
      console.error(error);
    }
  }, [user?.id]);

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();

    (flight ?? []).forEach((f) => {
      cities.add(f.from);
      cities.add(f.to);
    });

    (hotel ?? []).forEach((h) => {
      cities.add(h.location);
    });

    return Array.from(cities).map((city) => ({
      value: city,
      label: city,
    }));
  }, [flight, hotel]);

  const preferenceSignals = useMemo(() => {
    const signals = [...interactionSignals];

    if (user?.bookings?.length) {
      user.bookings.forEach((booking: any) => {
        if (booking?.type === "Flight") {
          const matchedFlight = (flight ?? []).find((item: any) => item.id === booking.bookingId);
          if (matchedFlight?.from) signals.push(matchedFlight.from);
          if (matchedFlight?.to) signals.push(matchedFlight.to);
        }

        if (booking?.type === "Hotel") {
          const matchedHotel = (hotel ?? []).find((item: any) => item.id === booking.bookingId);
          if (matchedHotel?.location) signals.push(matchedHotel.location);
        }
      });
    }

    return Array.from(new Set(signals.map((signal) => signal.toLowerCase()).filter(Boolean)));
  }, [flight, hotel, interactionSignals, user?.bookings]);

  const recommendations = useMemo(
    () => rankRecommendations(preferenceSignals, recommendationFeedback),
    [preferenceSignals, recommendationFeedback]
  );

  const handlesearch = () => {
    const nextSignals = [bookingtype, from, to].filter(Boolean);
    setInteractionSignals((prev) => Array.from(new Set([...prev, ...nextSignals])));

    if (bookingtype === "flights") {
      const results = flight.filter(
        (FLIGHT) =>
          FLIGHT.from.toLowerCase() === from.toLowerCase() &&
          FLIGHT.to.toLowerCase() === to.toLowerCase()
      );
      setsearchresult(results);
    } else if (bookingtype === "hotels") {
      const results = hotel.filter(
        (hotel) => hotel.location.toLowerCase() === to.toLowerCase()
      );
      setsearchresult(results);
    }
  };

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

  const handlebooknow = (id: any, result?: any) => {
    const nextSignals = [bookingtype, result?.to ?? result?.location ?? "", result?.from ?? ""].filter(Boolean);
    setInteractionSignals((prev) => Array.from(new Set([...prev, ...nextSignals])));

    if (bookingtype === "flights") {
      router.push(`/book-flight/${id}`);
    } else {
      router.push(`/book-hotel/${id}`);
    }
  };

  const handleRecommendationFeedback = (
    id: string,
    feedback: RecommendationFeedback
  ) => {
    const nextFeedback = { ...recommendationFeedback, [id]: feedback };
    setRecommendationFeedback(nextFeedback);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(recommendationFeedbackKey(user?.id), JSON.stringify(nextFeedback));
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#0A0D14] text-[#F1F5F9]" : "bg-[#F8FAFC] text-[#0F172A]"
      }`} 
      style={{ fontFamily: systemFontStack }}
    >
      <Head>
        <style>{`
          :root {
            --font-display: 'Plus Jakarta Sans', sans-serif;
          }
          .font-display { font-family: var(--font-display); }
        `}</style>
      </Head>

      <main className="relative pb-16" style={{ fontFamily: systemFontStack }}>
        {/* Glow ambient background overlay */}
        <div
          className="absolute inset-x-0 top-0 h-[550px] pointer-events-none transition-all duration-300 overflow-hidden"
          style={{
            background: isDark 
              ? "radial-gradient(circle at 50% 0%, rgba(79, 70, 229, 0.25) 0%, rgba(30, 58, 138, 0.15) 40%, rgba(10, 13, 20, 0) 75%)"
              : "radial-gradient(circle at 50% 0%, rgba(224, 231, 255, 0.9) 0%, rgba(243, 232, 255, 0.5) 50%, rgba(248, 250, 252, 0) 100%)",
          }}
        />

        <div className="relative container mx-auto px-4 pt-12">
          <div className="mx-auto max-w-5xl mb-8 text-center">
            <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3 ${
              isDark ? "bg-indigo-950/80 text-indigo-300 border border-indigo-700/50" : "bg-indigo-100 text-indigo-700"
            }`}>
              Explore the World
            </span>
            <h1 className={`font-display text-4xl md:text-6xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Find your next adventure
            </h1>
          </div>

          {/* Navigation Bar */}
          <nav className={`backdrop-blur-xl rounded-2xl mx-auto max-w-5xl mb-6 p-3 overflow-x-auto border shadow-lg transition-all duration-300 ${
            isDark ? "bg-[#121826]/80 border-[#222F43]" : "bg-white/80 border-slate-200/80 shadow-slate-200/50"
          }`}>
            <div className="flex justify-between items-center min-w-max space-x-2">
              <NavItem
                icon={<Plane className="w-5 h-5 text-indigo-400" />}
                text="Flights"
                active={bookingtype === "flights"}
                onClick={() => setbookingtype("flights")}
                isDark={isDark}
              />
              <NavItem
                icon={<Hotel className="w-5 h-5 text-blue-400" />}
                text="Hotels"
                active={bookingtype === "hotels"}
                onClick={() => setbookingtype("hotels")}
                isDark={isDark}
              />
              <NavItem icon={<HomeIcon className="w-5 h-5 text-amber-400" />} text="Homestays" isDark={isDark} />
              <NavItem icon={<Umbrella className="w-5 h-5 text-emerald-400" />} text="Holiday" isDark={isDark} />
              <NavItem icon={<Train className="w-5 h-5 text-sky-400" />} text="Trains" isDark={isDark} />
              <NavItem icon={<Bus className="w-5 h-5 text-orange-400" />} text="Buses" isDark={isDark} />
              <NavItem icon={<Car className="w-5 h-5 text-indigo-400" />} text="Cabs" isDark={isDark} />
              <NavItem icon={<CreditCard className="w-5 h-5 text-teal-400" />} text="Forex" isDark={isDark} />
              <NavItem icon={<Shield className="w-5 h-5 text-cyan-400" />} text="Insurance" isDark={isDark} />
            </div>
          </nav>

          {/* Search Box */}
          <div className={`backdrop-blur-xl rounded-2xl mx-auto max-w-5xl p-6 border shadow-2xl transition-all duration-300 ${
            isDark 
              ? "bg-[#121826]/90 border-[#222F43] shadow-black/60" 
              : "bg-white/90 border-slate-200/80 shadow-slate-200/60"
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {bookingtype === "flights" && (
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="From"
                    value={from}
                    onChange={setfrom}
                    icon={<MapPin className={isDark ? "text-indigo-400" : "text-indigo-600"} />}
                    subtitle="Departure location"
                    isDark={isDark}
                  />
                </div>
              )}

              <div className="col-span-1">
                <SearchSelect
                  options={cityOptions}
                  placeholder={bookingtype === "flights" ? "To" : "City"}
                  value={to}
                  onChange={setto}
                  icon={<MapPin className={isDark ? "text-indigo-400" : "text-indigo-600"} />}
                  subtitle={bookingtype === "flights" ? "Arrival location" : "Destination city"}
                  isDark={isDark}
                />
              </div>

              <div className="col-span-1">
                <SearchInput
                  icon={<Calendar className={isDark ? "text-indigo-400" : "text-indigo-600"} />}
                  placeholder="Date"
                  value={date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setdate(e.target.value)}
                  subtitle="Select travel date"
                  type="date"
                  isDark={isDark}
                />
              </div>

              <div className="col-span-1">
                <SearchInput
                  icon={<Users className={isDark ? "text-indigo-400" : "text-indigo-600"} />}
                  placeholder="Travelers"
                  value={travelers.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => settravelers(parseInt(e.target.value) || 1)}
                  subtitle="Number of guests"
                  type="number"
                  isDark={isDark}
                />
              </div>

              {/* TWO-COLOR GRADIENT BUTTON */}
              <Button
                className={`col-span-1 h-full rounded-xl font-bold tracking-wider uppercase text-white transition-all duration-300 shadow-lg ${
                  isDark 
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-950/50" 
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-200"
                }`}
                style={{ fontFamily: systemFontStack }}
                onClick={handlesearch}
              >
                SEARCH
              </Button>
            </div>

            {/* Search Results */}
            <div className="mt-8">
              <h2 className={`font-display text-xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                Search Results
              </h2>
              {searchresults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchresults.map((result) => (
                    <div
                      key={result.id}
                      className={`rounded-2xl shadow-md p-5 border transition-all ${
                        isDark 
                          ? "bg-[#1A2234] border-[#2A3854] hover:border-indigo-500/50" 
                          : "bg-white border-slate-200 hover:shadow-lg"
                      }`}
                    >
                      {bookingtype === "flights" ? (
                        <>
                          <p className={`font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                            {result.flightName}
                          </p>
                          <h3 className={`font-medium text-base mb-2 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                            {result.from} → {result.to}
                          </h3>
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Dep: {formatDate(result.departureTime)}
                          </p>
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Arr: {formatDate(result.arrivalTime)}
                          </p>
                          <p className={`text-xl font-extrabold mt-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                            ₹{result.price}
                          </p>
                          <Button
                            className={`w-full mt-4 text-white font-semibold rounded-xl ${
                              isDark ? "bg-indigo-600 hover:bg-indigo-500" : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                            style={{ fontFamily: systemFontStack }}
                            onClick={() => handlebooknow(result.id, result)}
                          >
                            Book Flight
                          </Button>
                        </>
                      ) : (
                        <>
                          <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                            {result.hotelName}
                          </h3>
                          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Location: {result.location}</p>
                          <p className={`text-xl font-extrabold mt-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                            ₹{result.pricePerNight} <span className="text-xs font-normal text-slate-400">/ night</span>
                          </p>
                          <Button
                            className={`w-full mt-4 text-white font-semibold rounded-xl ${
                              isDark ? "bg-indigo-600 hover:bg-indigo-500" : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                            style={{ fontFamily: systemFontStack }}
                            onClick={() => handlebooknow(result.id, result)}
                          >
                            Book Room
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  No {bookingtype} available for the selected criteria.
                </p>
              )}
            </div>
          </div>

          {/* COLORFUL SECTIONS */}
          <div className="max-w-7xl mx-auto px-4">
            
            {/* SECTION 1: RECOMMENDATIONS */}
            <section className={`my-16 p-8 rounded-3xl border transition-all ${
              isDark 
                ? "bg-gradient-to-br from-[#111827] via-[#151D30] to-[#0F172A] border-[#22304A] shadow-2xl shadow-indigo-950/20" 
                : "bg-gradient-to-br from-purple-50/60 via-white to-indigo-50/60 border-purple-100 shadow-xl shadow-purple-100/30"
            }`}>
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <Sparkles className="w-6 h-6 animate-pulse text-indigo-400" />
                <h2 className={`font-display text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Personalized Recommendations
                </h2>
              </div>
              <p className={`mb-6 max-w-2xl text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                Tailored picks calculated from your recent activity, destinations, and travel trends.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recommendations.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                      isDark 
                        ? "bg-[#182238]/90 border-[#2A3B5C] shadow-lg hover:border-indigo-500/50" 
                        : "bg-white border-purple-100 shadow-md hover:shadow-xl"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isDark ? "bg-indigo-900/60 text-indigo-300 border border-indigo-700/50" : "bg-purple-100 text-purple-700"
                          }`}>
                            {item.type}
                          </span>
                          <h3 className={`font-display text-lg font-bold mt-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                            {item.title}
                          </h3>
                        </div>
                        <button
                          className={`rounded-full p-2 transition-colors ${isDark ? "text-slate-400 hover:bg-[#22304A]" : "text-slate-400 hover:bg-slate-100"}`}
                          title={item.reason}
                          aria-label="Why this recommendation?"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                      <p className={`mt-3 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{item.summary}</p>
                      <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${isDark ? "text-indigo-300" : "text-purple-600"}`}>
                        <Compass className="w-4 h-4" />
                        <span>{item.location}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200/20 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRecommendationFeedback(item.id, "helpful")}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                            recommendationFeedback[item.id] === "helpful"
                              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                              : isDark ? "border-[#2A3B5C] bg-[#121A2B] text-slate-300 hover:bg-[#22304A]" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                          style={{ fontFamily: systemFontStack }}
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRecommendationFeedback(item.id, "irrelevant")}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                            recommendationFeedback[item.id] === "irrelevant"
                              ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                              : isDark ? "border-[#2A3B5C] bg-[#121A2B] text-slate-300 hover:bg-[#22304A]" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                          style={{ fontFamily: systemFontStack }}
                          title="Not relevant"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <Button
                        size="sm"
                        className={`rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isDark
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                        style={{ fontFamily: systemFontStack }}
                        onClick={() => router.push(item.bookingUrl)}
                      >
                        Book Now
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 2: BEST OFFERS */}
            <section className={`my-16 p-8 rounded-3xl border transition-all ${
              isDark 
                ? "bg-gradient-to-br from-[#291705] via-[#1C120A] to-[#120E1A] border-[#523213] shadow-2xl shadow-amber-950/20" 
                : "bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-amber-50/50 border-amber-200/80 shadow-xl shadow-amber-100/30"
            }`}>
              <div className="flex items-center gap-2 mb-6">
                <Tag className="w-5 h-5 text-amber-500" />
                <h2 className={`font-display text-2xl font-bold ${isDark ? "text-amber-50" : "text-slate-900"}`}>
                  Best Offers
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {offers.map((offer, index) => (
                  <OfferCard key={index} {...offer} isDark={isDark} systemFontStack={systemFontStack} />
                ))}
              </div>
            </section>

            {/* SECTION 3: COLLECTIONS */}
            <section className={`my-16 p-8 rounded-3xl border transition-all ${
              isDark 
                ? "bg-gradient-to-br from-[#061E24] via-[#09151C] to-[#0A101D] border-[#10404C] shadow-2xl shadow-cyan-950/20" 
                : "bg-gradient-to-br from-cyan-50/60 via-slate-50 to-teal-50/40 border-cyan-100 shadow-xl shadow-cyan-100/20"
            }`}>
              <h2 className={`font-display text-2xl font-bold mb-8 ${isDark ? "text-cyan-50" : "text-slate-900"}`}>
                Handpicked Collections for You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collections.map((collection, index) => (
                  <CollectionCard key={index} {...collection} isDark={isDark} />
                ))}
              </div>
            </section>

            {/* SECTION 4: LESSER KNOWN WONDERS */}
            <section className={`my-16 p-8 rounded-3xl border transition-all ${
              isDark 
                ? "bg-gradient-to-br from-[#0B1A30] via-[#0D1527] to-[#120F24] border-[#1D355E] shadow-2xl shadow-blue-950/20" 
                : "bg-gradient-to-br from-sky-50/70 via-indigo-50/40 to-blue-50/60 border-sky-200/80 shadow-xl shadow-sky-100/30"
            }`}>
              <div className="flex items-center gap-2 mb-6">
                <Map className="w-5 h-5 text-sky-400" />
                <h2 className={`font-display text-2xl font-bold ${isDark ? "text-sky-50" : "text-slate-900"}`}>
                  Unlock Lesser-Known Wonders of India
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wonders.map((wonder, index) => (
                  <WonderCard key={index} {...wonder} isDark={isDark} />
                ))}
              </div>
            </section>

            {/* DOWNLOAD APP SECTION */}
            <DownloadApp isDark={isDark} />
          </div>
        </div>
      </main>
    </div>
  );
}

const OfferCard = ({ title, description, imageUrl, badge, isDark, systemFontStack }: any) => {
  return (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
      isDark 
        ? "bg-[#21150B]/80 border-[#422915] shadow-xl hover:border-amber-500/50" 
        : "bg-white border-amber-200/60 shadow-md hover:shadow-xl"
    }`}>
      <div className="relative">
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
        {badge && (
          <span className={`absolute top-3 right-3 text-xs font-extrabold px-3 py-1 rounded-full backdrop-blur-md shadow-md ${
            isDark ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-amber-500 text-white"
          }`}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className={`font-display text-lg font-bold mb-2 ${isDark ? "text-amber-100" : "text-slate-900"}`}>{title}</h3>
        <p className={`text-sm ${isDark ? "text-amber-200/70" : "text-slate-600"}`}>{description}</p>
        <button 
          className={`mt-5 px-6 py-2.5 text-white rounded-xl transition-all text-sm font-semibold shadow-md ${
            isDark ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-950/50" : "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
          }`}
          style={{ fontFamily: systemFontStack }}
        >
          Claim Offer
        </button>
      </div>
    </div>
  );
};

const CollectionCard = ({ title, imageUrl, tag, isDark }: any) => {
  return (
    <div className={`relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
      isDark ? "border border-cyan-900/50 shadow-xl" : "shadow-md"
    }`}>
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#041216] via-[#041216]/40 to-transparent">
        <div className="absolute top-4 left-4">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-400 text-slate-950 shadow-md">
            {tag}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-white text-lg font-bold leading-snug">{title}</h3>
        </div>
      </div>
    </div>
  );
};

const WonderCard = ({ title, imageUrl, sub, isDark }: any) => {
  return (
    <div className={`relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
      isDark ? "border border-blue-900/50 shadow-xl" : "shadow-md"
    }`}>
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060E1A] via-[#060E1A]/40 to-transparent">
        <div className="absolute bottom-4 left-4 right-4">
          {sub && <p className="text-xs font-semibold text-sky-400 mb-1">{sub}</p>}
          <h3 className="font-display text-white text-lg font-bold leading-snug">{title}</h3>
        </div>
      </div>
    </div>
  );
};

const DownloadApp = ({ isDark }: { isDark: boolean }) => {
  return (
    <div className={`p-8 rounded-3xl max-w-7xl mx-auto mt-12 mb-4 border transition-all duration-300 ${
      isDark 
        ? "bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border-indigo-700/40 shadow-2xl shadow-indigo-950/20" 
        : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-transparent shadow-xl"
    }`}>
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h3 className="font-display text-2xl font-bold mb-2 text-white">Download the app</h3>
          <p className="mb-4 text-sm text-indigo-100">
            Get exclusive mobile discounts and instant flight tracking directly on your phone
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              alt="App Store"
              className="h-10 max-w-full hover:opacity-90 transition-opacity cursor-pointer"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Play Store"
              className="h-10 max-w-full hover:opacity-90 transition-opacity cursor-pointer"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 rounded-2xl border backdrop-blur-md bg-white/10 border-white/20">
          <QrCode className="w-16 h-16 text-white" />
          <p className="text-xs font-medium max-w-[120px] text-indigo-100">
            Scan QR code to install mobile app
          </p>
        </div>
      </div>
    </div>
  );
};

function NavItem({ icon, text, active = false, onClick, isDark }: any) {
  return (
    <button
      className={`flex flex-col items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${
        active
          ? isDark ? "bg-indigo-950/90 border border-indigo-700/60 shadow-sm" : "bg-indigo-50 border border-indigo-100"
          : isDark ? "text-slate-400 hover:text-white hover:bg-[#1A2333]" : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className={`text-xs mt-1.5 whitespace-nowrap font-bold ${active ? (isDark ? "text-white" : "text-indigo-600") : ""}`}>{text}</span>
    </button>
  );
}

function SearchInput({
  icon,
  placeholder,
  value,
  onChange,
  subtitle,
  type = "text",
  isDark
}: any) {
  return (
    <div className={`border rounded-xl p-3 transition-all cursor-pointer h-full ${
      isDark 
        ? "bg-[#1A2234]/70 border-[#2A3854] hover:border-indigo-500/70" 
        : "bg-white border-slate-200 hover:border-indigo-500"
    }`}>
      <div className="flex items-center space-x-3">
        {icon}
        <div className="flex-1 min-w-0">
          <div className={`text-xs truncate font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{placeholder}</div>
          <input
            type={type}
            value={value}
            onChange={onChange}
            className={`font-bold text-sm w-full bg-transparent outline-none ${isDark ? "text-white" : "text-slate-900"}`}
            placeholder={placeholder}
          />
          <div className={`text-[10px] truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>{subtitle}</div>
        </div>
      </div>
    </div>
  );
}
