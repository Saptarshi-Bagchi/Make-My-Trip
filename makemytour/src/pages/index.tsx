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
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Head from "next/head";

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
    Record<string, "helpful" | "irrelevant">
  >({});
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();

  const systemFontStack = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

  const flightD = [
    { id: 1, from: "Delhi", to: "Mumbai", date: "2025-01-15", price: 5000 },
    { id: 2, from: "Mumbai", to: "Bengaluru", date: "2025-01-16", price: 4500 },
    { id: 3, from: "Bengaluru", to: "Delhi", date: "2025-01-17", price: 5500 },
    { id: 4, from: "Delhi", to: "Kolkata", date: "2025-01-18", price: 6000 },
  ];

  const hotelData = [
    { id: 1, name: "Luxury Palace", city: "Mumbai", price: 15000 },
    { id: 2, name: "Comfort Inn", city: "Delhi", price: 8000 },
    { id: 3, name: "Seaside Resort", city: "Goa", price: 12000 },
    { id: 4, name: "Mountain View Hotel", city: "Shimla", price: 10000 },
  ];
  
  const offers = [
    {
      title: "Domestic Flights",
      description: "Get up to 20% off on domestic flights",
      imageUrl:
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800",
    },
    {
      title: "International Hotels",
      description: "Book luxury hotels worldwide",
      imageUrl:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800",
    },
    {
      title: "Holiday Packages",
      description: "Exclusive deals on holiday packages",
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800",
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
    },
    {
      title: "Tamil Nadu's Charming Hill Town",
      imageUrl:
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800",
    },
    {
      title: "Quaint Little Hill Station in Gujarat",
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800",
    },
    {
      title: "A pleasant summer retreat",
      imageUrl:
        "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=800",
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
      const savedFeedback = window.localStorage.getItem("travel-recommendation-feedback");
      if (savedFeedback) {
        setRecommendationFeedback(JSON.parse(savedFeedback));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

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

  const recommendationTags = useMemo(() => {
    const tags = new Set<string>();
    const text = preferenceSignals.join(" ");

    if (/(goa|bali|beach|coastal|sea|island)/.test(text)) {
      tags.add("beach");
    }
    if (/(shimla|manali|mountain|hill|snow|scenic)/.test(text)) {
      tags.add("mountain");
    }
    if (/(delhi|mumbai|bengaluru|kolkata|city|metro|urban)/.test(text)) {
      tags.add("city");
    }
    if (/(luxury|resort|palace|villa|suite)/.test(text)) {
      tags.add("luxury");
    }
    if (/(family|kids|weekend|holiday)/.test(text)) {
      tags.add("family");
    }

    if (tags.size === 0) {
      tags.add("beach");
      tags.add("luxury");
    }

    return Array.from(tags);
  }, [preferenceSignals]);

  const recommendations = useMemo(() => {
    const baseRecommendations = [
      {
        id: "bali-beach",
        type: "Destination",
        title: "Bali Beach Escape",
        location: "Bali",
        summary: "You liked beaches! Try Bali.",
        tags: ["beach", "relaxation", "island"],
        collaborativeBoost: 26,
        reason:
          "Your recent searches lean toward warm coastal getaways, and similar travelers consistently love this pick.",
      },
      {
        id: "shimla-hills",
        type: "Destination",
        title: "Shimla Mountain Retreat",
        location: "Shimla",
        summary: "A cooler escape that fits the mountain-oriented trips you keep exploring.",
        tags: ["mountain", "scenic", "family"],
        collaborativeBoost: 20,
        reason:
          "This recommendation blends your scenic-holiday signals with a popular choice in our travel community.",
      },
      {
        id: "goa-resort",
        type: "Hotel",
        title: "Seaside Resort in Goa",
        location: "Goa",
        summary: "Stay where sunset views and beach time take center stage.",
        tags: ["beach", "luxury", "relaxation"],
        collaborativeBoost: 22,
        reason:
          "It matches your beach preferences and the stronger collaborative patterns among travelers with similar habits.",
      },
      {
        id: "dubai-city",
        type: "Flight",
        title: "Weekend in Dubai",
        location: "Dubai",
        summary: "A polished city break with premium comfort and easy weekend logistics.",
        tags: ["city", "luxury"],
        collaborativeBoost: 18,
        reason:
          "You tend to favor high-value city breaks, and this option pairs well with that profile.",
      },
    ];

    return baseRecommendations
      .map((item) => {
        let score = item.collaborativeBoost;
        score += item.tags.filter((tag) => recommendationTags.includes(tag)).length * 16;

        if (preferenceSignals.some((signal) => signal.includes(item.location.toLowerCase()))) {
          score += 16;
        }

        if (recommendationFeedback[item.id] === "helpful") {
          score += 18;
        }
        if (recommendationFeedback[item.id] === "irrelevant") {
          score -= 14;
        }

        return { ...item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [preferenceSignals, recommendationFeedback, recommendationTags]);

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
    feedback: "helpful" | "irrelevant"
  ) => {
    const nextFeedback = { ...recommendationFeedback, [id]: feedback };
    setRecommendationFeedback(nextFeedback);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("travel-recommendation-feedback", JSON.stringify(nextFeedback));
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#162624] text-[#EAF2F0]" : "bg-[#F1F6F5] text-[#22322F]"}`} 
      style={{ fontFamily: systemFontStack }}
    >
      <Head>
        <style>{`
          :root {
            --font-display: 'Fraunces', serif;
          }
          .font-display { font-family: var(--font-display); }
        `}</style>
      </Head>

      <main className="relative pb-4" style={{ fontFamily: systemFontStack }}>
        <div
          className="absolute inset-x-0 top-0 h-[420px] pointer-events-none transition-all duration-300"
          style={{
            background: isDark 
              ? "linear-gradient(180deg, #223D38 0%, #1A302C 55%, #162624 100%)"
              : "linear-gradient(180deg, #DCEAE7 0%, #C7DEDA 55%, #F1F6F5 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-[420px] pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(60% 60% at 18% 10%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
          }}
        />

        <div className="relative container mx-auto px-4 pt-10">
          <div className="mx-auto max-w-5xl mb-8 text-center">
            <p className={`font-display text-sm uppercase tracking-[0.35em] ${isDark ? "text-[#7FD1C4]" : "text-[#3E6E6A]"}`}>
              Wander, slowly
            </p>
            <h1 className={`font-display mt-2 text-4xl md:text-5xl font-medium ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>
              Find your next quiet escape
            </h1>
          </div>

          <nav className={`backdrop-blur rounded-2xl mx-auto max-w-5xl mb-6 p-4 overflow-x-auto border shadow-sm transition-colors duration-300 ${
            isDark ? "bg-[#1A302C]/90 border-[#24413D]" : "bg-white/90 border-transparent shadow-[0_8px_30px_-12px_rgba(31,51,48,0.25)]"
          }`}>
            <div className="flex justify-between items-center min-w-max space-x-8">
              <NavItem
                icon={<Plane />}
                text="Flights"
                active={bookingtype === "flights"}
                onClick={() => setbookingtype("flights")}
                isDark={isDark}
              />
              <NavItem
                icon={<Hotel />}
                text="Hotels"
                active={bookingtype === "hotels"}
                onClick={() => setbookingtype("hotels")}
                isDark={isDark}
              />
              <NavItem icon={<HomeIcon />} text="Homestays" isDark={isDark} />
              <NavItem icon={<Umbrella />} text="Holiday" isDark={isDark} />
              <NavItem icon={<Train />} text="Trains" isDark={isDark} />
              <NavItem icon={<Bus />} text="Buses" isDark={isDark} />
              <NavItem icon={<Car />} text="Cabs" isDark={isDark} />
              <NavItem icon={<CreditCard />} text="Forex" isDark={isDark} />
              <NavItem icon={<Shield />} text="Insurance" isDark={isDark} />
            </div>
          </nav>

          <div className={`backdrop-blur rounded-2xl mx-auto max-w-5xl p-6 border transition-colors duration-300 ${
            isDark ? "bg-[#1A302C]/95 border-[#24413D]" : "bg-white/95 border-transparent shadow-[0_8px_30px_-12px_rgba(31,51,48,0.25)]"
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {bookingtype === "flights" && (
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="From"
                    value={from}
                    onChange={setfrom}
                    icon={<MapPin className={isDark ? "text-gray-500" : "text-gray-400"} />}
                    subtitle="Enter city or airport"
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
                  icon={<MapPin className={isDark ? "text-gray-500" : "text-gray-400"} />}
                  subtitle={bookingtype === "flights" ? "Enter city or airport" : "Enter city"}
                  isDark={isDark}
                />
              </div>

              <div className="col-span-1">
                <SearchInput
                  icon={<Calendar className={isDark ? "text-gray-500" : "text-gray-400"} />}
                  placeholder="Date"
                  value={date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setdate(e.target.value)}
                  subtitle="Select a date"
                  type="date"
                  isDark={isDark}
                />
              </div>

              <div className="col-span-1">
                <SearchInput
                  icon={<Users className={isDark ? "text-gray-500" : "text-gray-400"} />}
                  placeholder="Travelers"
                  value={travelers.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => settravelers(parseInt(e.target.value) || 1)}
                  subtitle="Number of travelers"
                  type="number"
                  isDark={isDark}
                />
              </div>

              <Button
                className={`col-span-1 h-full rounded-lg text-white transition-colors ${
                  isDark ? "bg-[#2C504D] hover:bg-[#3E6E6A]" : "bg-[#3E6E6A] hover:bg-[#2C504D]"
                }`}
                style={{ fontFamily: systemFontStack }}
                onClick={handlesearch}
              >
                SEARCH
              </Button>
            </div>

            <div className="mt-6">
              <h2 className={`font-display text-xl font-medium mb-4 ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>
                Search Results
              </h2>
              {searchresults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchresults.map((result) => (
                    <div
                      key={result.id}
                      className={`rounded-xl shadow-sm p-4 border transition-colors ${
                        isDark ? "bg-[#162624] border-[#24413D]" : "bg-white border-[#E3ECE9] hover:shadow-md"
                      }`}
                    >
                      {bookingtype === "flights" ? (
                        <>
                          <p className={`font-semibold text-lg ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>
                            Flight Name: {result.flightName}
                          </p>
                          <h3 className={`font-semibold text-lg ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>
                            {result.from} to {result.to}
                          </h3>
                          <p className={isDark ? "text-[#7FA39D]" : "text-[#62807C]"}>
                            Departure Time: {formatDate(result.departureTime)}
                          </p>
                          <p className={isDark ? "text-[#7FA39D]" : "text-[#62807C]"}>
                            Arrival Time: {formatDate(result.arrivalTime)}
                          </p>
                          <p className={`text-lg font-bold mt-2 ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>
                            ₹{result.price}
                          </p>
                          <Button
                            className={`w-full mt-4 text-white rounded-lg ${
                              isDark ? "bg-[#2C504D] hover:bg-[#3E6E6A]" : "bg-[#3E6E6A] hover:bg-[#2C504D]"
                            }`}
                            style={{ fontFamily: systemFontStack }}
                            onClick={() => handlebooknow(result.id, result)}
                          >
                            Book Now
                          </Button>
                        </>
                      ) : (
                        <>
                          <h3 className={`font-semibold text-lg ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>
                            {result.hotelName}
                          </h3>
                          <p className={isDark ? "text-[#7FA39D]" : "text-[#62807C]"}>City: {result.location}</p>
                          <p className={`text-lg font-bold mt-2 ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>
                            ₹{result.pricePerNight} per night
                          </p>
                          <Button
                            className={`w-full mt-4 text-white rounded-lg ${
                              isDark ? "bg-[#2C504D] hover:bg-[#3E6E6A]" : "bg-[#3E6E6A] hover:bg-[#2C504D]"
                            }`}
                            style={{ fontFamily: systemFontStack }}
                            onClick={() => handlebooknow(result.id, result)}
                          >
                            Book Now
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={isDark ? "text-[#7FA39D]" : "text-[#62807C]"}>
                  No {bookingtype} available for the selected criteria.
                </p>
              )}
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4">
            <section className="my-16">
              <div className={`flex items-center gap-2 mb-4 ${isDark ? "text-[#7FD1C4]" : "text-[#3E6E6A]"}`}>
                <Sparkles className="w-6 h-6" />
                <h2 className={`font-display text-2xl font-medium ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>
                  Personalized Recommendations
                </h2>
              </div>
              <p className={`mb-6 max-w-2xl ${isDark ? "text-[#A7BFBA]" : "text-[#4C6663]"}`}>
                We blend your travel history, prior interactions, and collaborative signals from similar travelers to suggest places worth exploring next.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recommendations.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 transition-shadow ${
                      isDark 
                        ? "bg-[#1A302C] border-[#24413D]" 
                        : "bg-white border-[#E3ECE9] shadow-[0_8px_24px_-16px_rgba(31,51,48,0.3)] hover:shadow-[0_12px_28px_-14px_rgba(31,51,48,0.35)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? "text-[#7FD1C4]" : "text-[#3E6E6A]"}`}>
                          {item.type}
                        </p>
                        <h3 className={`font-display text-lg font-medium ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>
                          {item.title}
                        </h3>
                      </div>
                      <button
                        className={`rounded-full p-2 transition-colors ${isDark ? "text-[#7FA39D] hover:bg-[#162624]" : "text-[#62807C] hover:bg-[#F1F6F5]"}`}
                        title={item.reason}
                        aria-label="Why this recommendation?"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    <p className={`mt-3 text-sm ${isDark ? "text-[#A7BFBA]" : "text-[#4C6663]"}`}>{item.summary}</p>
                    <div className={`mt-4 flex items-center gap-2 text-sm ${isDark ? "text-[#7FA39D]" : "text-[#62807C]"}`}>
                      <Compass className="w-4 h-4" />
                      <span>{item.location}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => handleRecommendationFeedback(item.id, "helpful")}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          recommendationFeedback[item.id] === "helpful"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                            : isDark ? "border-[#24413D] bg-[#162624] text-[#A7BFBA] hover:bg-[#24413D]" : "border-[#E3ECE9] bg-white text-[#4C6663] hover:bg-[#F1F6F5]"
                        }`}
                        style={{ fontFamily: systemFontStack }}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Helpful
                      </button>
                      <button
                        onClick={() => handleRecommendationFeedback(item.id, "irrelevant")}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          recommendationFeedback[item.id] === "irrelevant"
                            ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
                            : isDark ? "border-[#24413D] bg-[#162624] text-[#A7BFBA] hover:bg-[#24413D]" : "border-[#E3ECE9] bg-white text-[#4C6663] hover:bg-[#F1F6F5]"
                        }`}
                        style={{ fontFamily: systemFontStack }}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Not relevant
                      </button>
                    </div>
                    <p className={`mt-4 text-xs ${isDark ? "text-[#62807C]" : "text-[#7C948F]"}`}>
                      Why this recommendation? {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="my-16">
              <h2 className={`font-display text-2xl font-medium mb-8 ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>
                Best Offers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {offers.map((offer, index) => (
                  <OfferCard key={index} {...offer} isDark={isDark} systemFontStack={systemFontStack} />
                ))}
              </div>
            </section>

            <section className="my-16">
              <h2 className={`font-display text-2xl font-medium mb-8 ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>
                Handpicked Collections for You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collections.map((collection, index) => (
                  <CollectionCard key={index} {...collection} />
                ))}
              </div>
            </section>

            <section className="my-16">
              <h2 className={`font-display text-2xl font-medium mb-8 ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>
                Unlock Lesser-Known Wonders of India
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wonders.map((wonder, index) => (
                  <WonderCard key={index} {...wonder} />
                ))}
              </div>
            </section>

            <DownloadApp isDark={isDark} />
          </div>
        </div>
      </main>
    </div>
  );
}

const OfferCard = ({ title, description, imageUrl, isDark, systemFontStack }: any) => {
  return (
    <div className={`rounded-2xl overflow-hidden border transition-shadow ${
      isDark 
        ? "bg-[#1A302C] border-[#24413D]" 
        : "bg-white border-transparent shadow-[0_8px_24px_-16px_rgba(31,51,48,0.3)] hover:shadow-[0_12px_28px_-14px_rgba(31,51,48,0.35)]"
    }`}>
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className={`font-display text-lg font-medium mb-2 ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>{title}</h3>
        <p className={`text-sm ${isDark ? "text-[#7FA39D]" : "text-[#62807C]"}`}>{description}</p>
        <button 
          className={`mt-4 px-6 py-2 text-white rounded-full transition-colors text-sm font-medium ${
            isDark ? "bg-[#2C504D] hover:bg-[#3E6E6A]" : "bg-[#3E6E6A] hover:bg-[#2C504D]"
          }`}
          style={{ fontFamily: systemFontStack }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

const CollectionCard = ({ title, imageUrl, tag }: any) => {
  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-[0_8px_24px_-16px_rgba(31,51,48,0.3)]">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1F3330]/80">
        <div className="absolute top-4 left-4">
          <span className="bg-white/95 text-[#1F3330] text-sm font-semibold px-2 py-1 rounded-full">
            {tag}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-white text-lg font-medium">{title}</h3>
        </div>
      </div>
    </div>
  );
};

const WonderCard = ({ title, imageUrl }: any) => {
  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-[0_8px_24px_-16px_rgba(31,51,48,0.3)]">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1F3330]/80">
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-white text-lg font-medium">{title}</h3>
        </div>
      </div>
    </div>
  );
};

const DownloadApp = ({ isDark }: { isDark: boolean }) => {
  return (
    <div className={`p-8 rounded-2xl max-w-7xl mx-auto mt-8 mb-4 border transition-colors ${
      isDark ? "bg-[#1A302C] border-[#24413D]" : "bg-[#EAF2F0] border-[#DCE7E4]"
    }`}>
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h3 className={`font-display text-xl font-medium mb-2 ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}>Download the app</h3>
          <p className={`mb-4 ${isDark ? "text-[#A7BFBA]" : "text-[#4C6663]"}`}>
            Get the best deals on flights and stays, right from your pocket
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              alt="App Store"
              className="h-10 max-w-full"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Play Store"
              className="h-10 max-w-full"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <QrCode className={`w-24 h-24 ${isDark ? "text-[#7FD1C4]" : "text-[#3E6E6A]"}`} />
          <p className={`text-sm ${isDark ? "text-[#7FA39D]" : "text-[#62807C]"}`}>
            Scan the QR code to download the app
          </p>
        </div>
      </div>
    </div>
  );
};

function NavItem({ icon, text, active = false, onClick, isDark }: any) {
  return (
    <button
      className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
        active
          ? isDark ? "text-[#7FD1C4] bg-[#162624]" : "text-[#3E6E6A] bg-[#EAF2F0]"
          : isDark ? "text-[#7C948F] hover:text-[#7FD1C4] hover:bg-[#162624]" : "text-[#7C948F] hover:text-[#3E6E6A] hover:bg-[#F1F6F5]"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm mt-1 whitespace-nowrap">{text}</span>
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
    <div className={`border rounded-xl p-3 transition-colors cursor-pointer h-full ${
      isDark ? "border-[#24413D] hover:border-[#7FD1C4]" : "border-[#DCE7E4] hover:border-[#3E6E6A]"
    }`}>
      <div className="flex items-center space-x-2">
        {icon}
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate text-[#7C948F]">{placeholder}</div>
          <input
            type={type}
            value={value}
            onChange={onChange}
            className={`font-semibold w-full bg-transparent outline-none ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}
            placeholder={placeholder}
          />
          <div className={`text-xs truncate ${isDark ? "text-[#62807C]" : "text-[#A3B8B4]"}`}>{subtitle}</div>
        </div>
      </div>
    </div>
  );
}