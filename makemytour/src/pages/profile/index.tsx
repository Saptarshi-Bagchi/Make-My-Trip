import React, { useState, useMemo } from "react";
import {
  User,
  Phone,
  Mail,
  Edit2,
  MapPin,
  Calendar,
  CreditCard,
  X,
  Check,
  LogOut,
  Plane,
  Building2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { clearUser, setUser } from "@/store";
import { editprofile, getflight } from "@/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFlightTracking } from "@/lib/flightTrackingContext";
import { useEffect } from "react";
import FlightStatusPanel from "@/components/FlightStatusPanel";
const index = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();

  const logout = () => {
    dispatch(clearUser());
    router.push("/");
  };
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: user?.firstName ? user?.firstName : "",
    lastName: user?.lastName ? user?.lastName : "",
    email: user?.email ? user?.email : "",
    phoneNumber: user?.phoneNumber ? user?.phoneNumber : "",
  });

  const [editForm, setEditForm] = useState({ ...userData });
  const handleSave = async () => {
    try {
      const data = await editprofile(
        user?.id,
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.phoneNumber
      );
      dispatch(setUser(data));
      setIsEditing(false);
    } catch (error) {
      setUserData(editForm);
      setIsEditing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const handleEditFormChange = (field: any, value: any) => {
    setUserData((prevState) => ({
      ...prevState,
      [field]: value, // Update the specific field dynamically
    }));
  };

  const flightBookings = user?.bookings?.filter((b: any) => b?.type === "Flight") ?? [];
  const hotelBookings = user?.bookings?.filter((b: any) => b?.type === "Hotel") ?? [];

  const { trackedFlights, trackFlight, isTracked } = useFlightTracking();

  const [allFlights, setAllFlights] = useState<any[]>([]);

  useEffect(() => {
    getflight().then((data: any) => {
      if (data) setAllFlights(data);
    });
  }, []);

  const flightsById = useMemo(() => {
    const map: Record<string, any> = {};
    allFlights.forEach((flight: any) => {
      map[flight.id] = flight;
    });
    return map;
  }, [allFlights]);

  useEffect(() => {
    flightBookings.forEach((booking: any) => {
      if (isTracked(booking.bookingId)) return;
      const flight = flightsById[booking.bookingId];
      if (!flight) return;
      trackFlight({
        id: booking.bookingId,
        flightName: flight.flightName,
        from: flight.from,
        to: flight.to,
        scheduledDeparture: flight.departureTime,
        scheduledArrival: flight.arrivalTime,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.bookings, flightsById]);

  const renderBookingCard = (booking: any, index: any) => {
    const liveStatus =
      booking.type === "Flight"
        ? trackedFlights.find((f) => f.id === booking.bookingId)
        : null;

    return (
      <div
        key={index}
        className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md hover:border-gray-300 transition-all"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {booking?.type === "Flight" ? (
              <div className="bg-blue-100 p-2 rounded-lg">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
            ) : (
              <div className="bg-green-100 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold">{booking?.type}</h3>
              <p className="text-sm text-gray-500">
                Booking ID: {booking?.bookingId}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">
              ₹ {booking?.totalPrice.toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-gray-500">{booking?.type}</p>
          </div>
        </div>

        {liveStatus && (
          <div className="mb-3">
            <FlightStatusPanel status={liveStatus} />
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(booking?.date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{booking?.type}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CreditCard className="w-4 h-4" />
            <span>Paid</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-72px)] pt-6 pb-6 px-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80")',
        }}
      />
      <div className="absolute inset-0 bg-white/70" />
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">Profile</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-red-600 flex items-center space-x-1 hover:text-red-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={userData.firstName}
                        onChange={(e) => handleEditFormChange("firstName", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={userData.lastName}
                        onChange={(e) => handleEditFormChange("lastName", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => handleEditFormChange("email", e.target.value)}

                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={userData.phoneNumber}
                        onChange={(e) => handleEditFormChange("phoneNumber", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({ ...user });
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {user?.firstName} {user?.lastName}
                        </p>
                        {/* <p className="text-sm text-gray-500">{userData.role}</p> */}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <p>{user?.email}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <p>{user?.phoneNumber}</p>
                    </div>
                    <button
                      className="w-full mt-4 flex items-center justify-center space-x-2 text-red-600 hover:text-red-700"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bookings Section */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-xl font-bold mb-4">My Bookings</h2>

                <Tabs defaultValue="flights">
                  <TabsList>
                    <TabsTrigger value="flights">Flights</TabsTrigger>
                    <TabsTrigger value="hotels">Hotels</TabsTrigger>
                  </TabsList>

                  <TabsContent value="flights">
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                      {flightBookings.map((booking: any, index: any) =>
                        renderBookingCard(booking, index)
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="hotels">
                    <div className="space-y-6">
                      {hotelBookings.map((booking: any, index: any) =>
                        renderBookingCard(booking, index)
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;