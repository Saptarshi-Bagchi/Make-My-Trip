"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/ThemeContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import FlightList from "@/components/Flights/Flightlist";
import {
  addflight,
  addhotel,
  editflight,
  edithotel,
  getuserbyemail,
} from "@/api";
import HotelList from "@/components/Hotel/Hotel";

const mockFlights = [
  {
    _id: "1",
    flightName: "AirOne 101",
    from: "New York",
    to: "London",
    departureTime: "2023-07-01T08:00",
    arrivalTime: "2023-07-01T20:00",
    price: 500,
    availableSeats: 150,
  },
  {
    _id: "2",
    flightName: "SkyHigh 202",
    from: "Paris",
    to: "Tokyo",
    departureTime: "2023-07-02T10:00",
    arrivalTime: "2023-07-03T06:00",
    price: 800,
    availableSeats: 200,
  },
  {
    _id: "3",
    flightName: "EagleWings 303",
    from: "Los Angeles",
    to: "Sydney",
    departureTime: "2023-07-03T22:00",
    arrivalTime: "2023-07-05T06:00",
    price: 1200,
    availableSeats: 180,
  },
];

const mockHotels = [
  {
    _id: "1",
    hotelName: "Luxury Palace",
    location: "Paris, France",
    pricePerNight: 300,
    availableRooms: 50,
    amenities: "Wi-Fi, Pool, Spa, Restaurant",
  },
  {
    _id: "2",
    hotelName: "Seaside Resort",
    location: "Bali, Indonesia",
    pricePerNight: 200,
    availableRooms: 100,
    amenities: "Beach Access, Wi-Fi, Restaurant, Water Sports",
  },
  {
    _id: "3",
    hotelName: "Mountain Lodge",
    location: "Aspen, Colorado",
    pricePerNight: 250,
    availableRooms: 30,
    amenities: "Ski-in/Ski-out, Fireplace, Hot Tub, Restaurant",
  },
];
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber: string;
}

function UserSearch({ isDark }: { isDark: boolean }) {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await getuserbyemail(email);
    const mockUser: User = data;
    setUser(mockUser);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Search user by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={isDark ? "bg-[#121827] border-[#2A3854] text-white placeholder-slate-500 focus-visible:ring-indigo-500/40" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus-visible:ring-indigo-500/30"}
          />
        </div>
        <Button 
          type="submit"
          className={`text-white transition-colors ${
            isDark ? "bg-indigo-600 hover:bg-indigo-500" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          Search
        </Button>
      </form>
      {user && (
        <div className={`border p-4 rounded-xl transition-colors ${isDark ? "bg-[#121827] border-[#2A3854]" : "bg-indigo-50/60 border-indigo-100"}`}>
          <h3 className={`font-bold mb-2 font-display ${isDark ? "text-white" : "text-slate-900"}`}>User Details</h3>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            <strong className={isDark ? "text-white" : "text-slate-900"}>Name:</strong> {user.firstName} {user.lastName}
          </p>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            <strong className={isDark ? "text-white" : "text-slate-900"}>Email:</strong> {user.email}
          </p>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            <strong className={isDark ? "text-white" : "text-slate-900"}>Role:</strong> {user.role}
          </p>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            <strong className={isDark ? "text-white" : "text-slate-900"}>Phone:</strong> {user.phoneNumber}
          </p>
        </div>
      )}
    </div>
  );
}

interface Hotel {
  id?: string;
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
}

function AddEditHotel({ hotel, isDark }: { hotel: Hotel | null; isDark: boolean }) {
  const [formData, setFormData] = useState<Hotel>({
    hotelName: "",
    location: "",
    pricePerNight: 0,
    availableRooms: 0,
    amenities: "",
  });

  useEffect(() => {
    if (hotel) {
      setFormData(hotel);
    } else {
      setFormData({
        hotelName: "",
        location: "",
        pricePerNight: 0,
        availableRooms: 0,
        amenities: "",
      });
    }
  }, [hotel]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hotel) {
      await edithotel(
        hotel.id,
        formData.hotelName,
        formData.location,
        formData.pricePerNight,
        formData.availableRooms,
        formData.amenities
      );
      return;
    }
    await addhotel(
      formData.hotelName,
      formData.location,
      formData.pricePerNight,
      formData.availableRooms,
      formData.amenities
    );
    if (!hotel) {
      setFormData({
        hotelName: "",
        location: "",
        pricePerNight: 0,
        availableRooms: 0,
        amenities: "",
      });
    }
  };

  const inputStyles = isDark
    ? "bg-[#121827] border-[#2A3854] text-white focus-visible:ring-indigo-500/40"
    : "bg-white border-slate-200 text-slate-900 focus-visible:ring-indigo-500/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className={`text-lg font-semibold mb-2 font-display ${isDark ? "text-white" : "text-slate-900"}`}>
        {hotel ? "Edit Hotel" : "Add New Hotel"}
      </h3>
      <div>
        <Label htmlFor="hotelName" className={isDark ? "text-slate-400" : "text-slate-600"}>Hotel Name</Label>
        <Input
          id="hotelName"
          name="hotelName"
          value={formData.hotelName}
          onChange={handleChange}
          required
          className={inputStyles}
        />
      </div>
      <div>
        <Label htmlFor="location" className={isDark ? "text-slate-400" : "text-slate-600"}>Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className={inputStyles}
        />
      </div>
      <div>
        <Label htmlFor="pricePerNight" className={isDark ? "text-slate-400" : "text-slate-600"}>Price Per Night</Label>
        <Input
          id="pricePerNight"
          name="pricePerNight"
          type="number"
          value={formData.pricePerNight}
          onChange={handleChange}
          required
          className={inputStyles}
        />
      </div>
      <div>
        <Label htmlFor="availableRooms" className={isDark ? "text-slate-400" : "text-slate-600"}>Available Rooms</Label>
        <Input
          id="availableRooms"
          name="availableRooms"
          type="number"
          value={formData.availableRooms}
          onChange={handleChange}
          required
          className={inputStyles}
        />
      </div>
      <div>
        <Label htmlFor="amenities" className={isDark ? "text-slate-400" : "text-slate-600"}>Amenities</Label>
        <Textarea
          id="amenities"
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          required
          className={inputStyles}
        />
      </div>
      <Button 
        type="submit"
        className={`text-white transition-colors ${
          isDark ? "bg-indigo-600 hover:bg-indigo-500" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {hotel ? "Update Hotel" : "Add Hotel"}
      </Button>
    </form>
  );
}

interface Flight {
  id?: string;
  flightName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

function AddEditFlight({ flight, isDark }: { flight: Flight | null; isDark: boolean }) {
  const [formData, setFormData] = useState<Flight>({
    flightName: "",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    price: 0,
    availableSeats: 0,
  });

  useEffect(() => {
    if (flight) {
      setFormData(flight);
    } else {
      setFormData({
        flightName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: 0,
        availableSeats: 0,
      });
    }
  }, [flight]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting flight data:", formData);
    if (flight) {
      await editflight(
        flight?.id,
        formData.flightName,
        formData.from,
        formData.to,
        formData.departureTime,
        formData.arrivalTime,
        formData.price,
        formData.availableSeats
      );
      return;
    }
    await addflight(
      formData.flightName,
      formData.from,
      formData.to,
      formData.departureTime,
      formData.arrivalTime,
      formData.price,
      formData.availableSeats
    );
    if (!flight) {
      setFormData({
        flightName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: 0,
        availableSeats: 0,
      });
    }
  };

  const inputStyles = isDark
    ? "bg-[#121827] border-[#2A3854] text-white focus-visible:ring-indigo-500/40"
    : "bg-white border-slate-200 text-slate-900 focus-visible:ring-indigo-500/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className={`text-lg font-semibold mb-2 font-display ${isDark ? "text-white" : "text-slate-900"}`}>
        {flight ? "Edit Flight" : "Add New Flight"}
      </h3>
      <div>
        <Label htmlFor="flightName" className={isDark ? "text-slate-400" : "text-slate-600"}>Flight Name</Label>
        <Input
          id="flightName"
          name="flightName"
          value={formData.flightName}
          onChange={handleChange}
          required
          className={inputStyles}
        />
      </div>
      <div>
        <Label htmlFor="from" className={isDark ? "text-slate-400" : "text-slate-600"}>From</Label>
        <Input
          id="from"
          name="from"
          value={formData.from}
          onChange={handleChange}
          required
          className={inputStyles}
        />
      </div>
      <div>
        <Label htmlFor="to" className={isDark ? "text-slate-400" : "text-slate-600"}>To</Label>
        <Input
          id="to"
          name="to"
          value={formData.to}
          onChange={handleChange}
          required
          className={inputStyles}
        />
      </div>
      <div>
        <Label htmlFor="departureTime" className={isDark ? "text-slate-400" : "text-slate-600"}>Departure Time</Label>
        <Input
          id="departureTime"
          name="departureTime"
          type="datetime-local"
          value={formData.departureTime}
          onChange={handleChange}
          required
          className={inputStyles}
        />
      </div>
      <div>
        <Label htmlFor="arrivalTime" className={isDark ? "text-slate-400" : "text-slate-600"}>Arrival Time</Label>
        <Input
          id="arrivalTime"
          name="arrivalTime"
          type="datetime-local"
          value={formData.arrivalTime}
          onChange={handleChange}
          required
          className={inputStyles}
        />
      </div>
      <div>
        <Label htmlFor="price" className={isDark ? "text-slate-400" : "text-slate-600"}>Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
          className={inputStyles}
        />
      </div>
      <div>
        <Label htmlFor="availableSeats" className={isDark ? "text-slate-400" : "text-slate-600"}>Available Seats</Label>
        <Input
          id="availableSeats"
          name="availableSeats"
          type="number"
          value={formData.availableSeats}
          onChange={handleChange}
          required
          className={inputStyles}
        />
      </div>
      <Button 
        type="submit"
        className={`text-white transition-colors ${
          isDark ? "bg-indigo-600 hover:bg-indigo-500" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {flight ? "Update Flight" : "Add Flight"}
      </Button>
    </form>
  );
}

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("flights");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const cardStyles = isDark
    ? "bg-[#121827]/90 border-[#222F43] text-slate-100 shadow-2xl shadow-black/20"
    : "bg-white/90 border-slate-200 shadow-xl shadow-slate-200/50 text-slate-900";

  const tabTriggerStyles = (isActive: boolean) => {
    if (isDark) {
      return isActive
        ? "text-white bg-indigo-600 shadow-sm"
        : "text-slate-400 hover:text-white hover:bg-[#1A2234]";
    }
    return isActive
      ? "text-indigo-700 bg-white shadow-sm"
      : "text-slate-500 hover:text-indigo-600 hover:bg-white/70";
  };

  const scrollbarStyles = isDark
    ? "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#121827] [&::-webkit-scrollbar-thumb]:bg-[#2A3854] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-indigo-600"
    : "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-indigo-300";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-[#0A0D14] text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <p className={`mb-2 text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>MakeMyTour control centre</p>
        <h1 className={`font-display text-3xl font-bold tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>
          Admin Dashboard
        </h1>
        <p className={`mt-2 text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}>Manage flights, hotels, and traveller accounts from one place.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full grid-cols-3 p-1 rounded-xl mb-6 backdrop-blur border transition-colors ${
          isDark ? "bg-[#121827]/90 border-[#222F43]" : "bg-slate-100/90 border-slate-200"
        }`}>
          <TabsTrigger value="flights" className={tabTriggerStyles(activeTab === "flights")}>Flights</TabsTrigger>
          <TabsTrigger value="hotels" className={tabTriggerStyles(activeTab === "hotels")}>Hotels</TabsTrigger>
          <TabsTrigger value="users" className={tabTriggerStyles(activeTab === "users")}>Users</TabsTrigger>
        </TabsList>

        <TabsContent value="flights">
          <Card className={cardStyles}>
            <CardHeader>
              <CardTitle className={`font-display text-xl ${isDark ? "text-white" : "text-slate-900"}`}>Manage Flights</CardTitle>
              <CardDescription className={isDark ? "text-slate-400" : "text-slate-600"}>
                Add, edit, or remove flights from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`max-h-[420px] overflow-y-auto pr-2 custom-scrollbar ${scrollbarStyles}`}>
                  <FlightList onSelect={setSelectedFlight} isDark={isDark} />
                </div>
                <AddEditFlight flight={selectedFlight} isDark={isDark} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotels">
          <Card className={cardStyles}>
            <CardHeader>
              <CardTitle className={`font-display text-xl ${isDark ? "text-white" : "text-slate-900"}`}>Manage Hotels</CardTitle>
              <CardDescription className={isDark ? "text-slate-400" : "text-slate-600"}>
                Add, edit, or remove hotels from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`max-h-[420px] overflow-y-auto pr-2 custom-scrollbar ${scrollbarStyles}`}>
                  <HotelList onSelect={setSelectedHotel} isDark={isDark} />
                </div>
                <AddEditHotel hotel={selectedHotel} isDark={isDark} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className={cardStyles}>
            <CardHeader>
              <CardTitle className={`font-display text-xl ${isDark ? "text-white" : "text-slate-900"}`}>User Management</CardTitle>
              <CardDescription className={isDark ? "text-slate-400" : "text-slate-600"}>Search for users by email.</CardDescription>
            </CardHeader>
            <CardContent>
              <UserSearch isDark={isDark} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
