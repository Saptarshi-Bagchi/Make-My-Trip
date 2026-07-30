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
  XCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { clearUser, setUser } from "@/store";
import { editprofile, getflight, cancelBooking, getUserRefunds } from "@/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFlightTracking } from "@/lib/flightTrackingContext";
import { useEffect } from "react";
import FlightStatusPanel from "@/components/FlightStatusPanel";
import CancelBookingDialog from "@/components/CancelBookingDialog";
import RefundStatusCard from "@/components/RefundStatusCard";
import { calculateRefund, calculateHotelRefund, RefundCalculation } from "@/lib/refundPolicy";
import { getAllRefunds, RefundWithStatus } from "@/lib/refundTracker";
import { useTheme } from "@/components/ThemeContext";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
      [field]: value,
    }));
  };

  const bookingsWithOriginalIndex = (user?.bookings ?? []).map((b: any, idx: number) => ({
    ...b,
    __originalIndex: idx,
  }));
  const flightBookings = bookingsWithOriginalIndex.filter((b: any) => b?.type === "Flight").slice().reverse();
  const hotelBookings = bookingsWithOriginalIndex.filter((b: any) => b?.type === "Hotel").slice().reverse();

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

  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [refunds, setRefunds] = useState<RefundWithStatus[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setRefunds([]);
      return;
    }

    const loadRefunds = async () => {
      try {
        const records = await getUserRefunds(user.id);
        if (Array.isArray(records)) setRefunds(getAllRefunds(records));
      } catch {}
    };

    loadRefunds();
    const timer = setInterval(loadRefunds, 60000);
    return () => clearInterval(timer);
  }, [user?.id]);

  const getRefundForTarget = (booking: any): RefundCalculation => {
    if (booking.type === "Flight") {
      const flight = flightsById[booking.bookingId];
      return calculateRefund(booking.totalPrice, flight?.departureTime ?? new Date().toISOString());
    }
    return calculateHotelRefund(booking.totalPrice);
  };

  const handleConfirmCancel = async (reason: string, refundAmount: number, refundPercentage: number) => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      const label =
        cancelTarget.type === "Flight"
          ? `${flightsById[cancelTarget.bookingId]?.from ?? "?"} → ${flightsById[cancelTarget.bookingId]?.to ?? "?"}`
          : `Hotel booking ${cancelTarget.bookingId}`;

      const updatedUser = await cancelBooking(user?.id, cancelTarget.__originalIndex, {
        entityType: cancelTarget.type === "Flight" ? "flight" : "hotel",
        label,
        reason,
        refundAmount,
        refundPercentage,
      });
      dispatch(setUser(updatedUser));
      setRefunds(getAllRefunds(updatedUser.refunds ?? []));

      setCancelTarget(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsCancelling(false);
    }
  };

  // Landing-page palette configurations
  const cardStyles = isDark 
    ? "bg-[#121826]/90 border-[#222F43] text-[#F1F5F9] shadow-xl shadow-black/20" 
    : "bg-white/90 border-slate-200/80 shadow-lg shadow-slate-200/50 text-[#0F172A]";

  const inputStyles = isDark 
    ? "bg-[#1A2234] border-[#2A3854] text-[#F1F5F9] focus:border-indigo-500 focus-visible:ring-0" 
    : "bg-white border-slate-200 text-[#0F172A] focus:border-indigo-600 focus-visible:ring-0";

  const subtextStyles = isDark ? "text-slate-400" : "text-slate-600";
  const labelStyles = isDark ? "text-slate-400" : "text-slate-500";

  const renderBookingCard = (booking: any, index: any) => {
    const liveStatus =
      booking.type === "Flight"
        ? trackedFlights.find((f) => f.id === booking.bookingId)
        : null;

    const isFlightDeparted = booking.type === "Flight" && liveStatus?.status === "Departed";
    const isFlightLanded = booking.type === "Flight" && liveStatus?.status === "Landed";
    const canCancel = booking.type !== "Flight" || !(isFlightDeparted || isFlightLanded);

    return (
      <div
        key={index}
        className={`border rounded-xl p-4 transition-all ${
          isDark ? "border-[#2A3854] bg-[#1A2234]/70 hover:border-indigo-500/50" : "border-slate-200 bg-white shadow-sm hover:shadow-lg"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {booking?.type === "Flight" ? (
              <div className={`p-2 rounded-lg ${isDark ? "bg-indigo-950/80 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}>
                <Plane className="w-6 h-6" />
              </div>
            ) : (
              <div className={`p-2 rounded-lg ${isDark ? "bg-indigo-950/80 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}>
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="font-semibold font-display">{booking?.type}</h3>
              <p className={`text-sm ${subtextStyles}`}>
                Booking ID: {booking?.bookingId}
              </p>
              {booking?.type === "Flight" && booking?.seatNumbers && (
                <p className={`text-xs font-medium mt-0.5 ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
                  Seats: {booking.seatNumbers}
                </p>
              )}
              {booking?.type === "Hotel" && booking?.roomType && (
                <p className={`text-xs font-medium mt-0.5 ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
                  {booking.roomType}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold font-display">
              ₹ {booking?.totalPrice.toLocaleString("en-IN")}
            </p>
            <p className={`text-sm ${subtextStyles}`}>{booking?.type}</p>
          </div>
        </div>

        {liveStatus && (
          <div className="mb-3">
            <FlightStatusPanel status={liveStatus} />
          </div>
        )}

        <div className={`flex flex-wrap gap-4 text-sm pt-3 border-t ${isDark ? "border-[#2A3854] text-slate-400" : "border-slate-200 text-slate-600"}`}>
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

        {canCancel ? (
          <button
            onClick={() => setCancelTarget(booking)}
            className="w-full mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-rose-500 hover:text-rose-600 border border-rose-500/10 hover:border-rose-500/20 hover:bg-rose-500/5 rounded-lg py-2 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Cancel Booking
          </button>
        ) : (
          <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            isDark ? "border-[#2A3854] bg-[#1A2234] text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"
          }`}>
            {booking.type === "Flight" ? "This flight has already departed, so cancellation is no longer available." : "Cancellation is no longer available for this booking."}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0A0D14] text-[#F1F5F9]" : "bg-[#F8FAFC] text-[#0F172A]"}`}>
      <main className="mx-auto max-w-7xl px-4 py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Profile Details Card */}
          <div className="md:col-span-1">
            <div className={`rounded-xl p-6 border transition-colors ${cardStyles}`}>
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Your Details
                  </p>
                  <h2 className="mt-1 text-xl font-bold font-display">Profile</h2>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`flex items-center space-x-1 text-sm font-semibold ${isDark ? "text-indigo-300 hover:text-indigo-200" : "text-indigo-600 hover:text-indigo-700"}`}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelStyles}`}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) => handleEditFormChange("firstName", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-sm transition-colors ${inputStyles}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelStyles}`}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) => handleEditFormChange("lastName", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-sm transition-colors ${inputStyles}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelStyles}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => handleEditFormChange("email", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-sm transition-colors ${inputStyles}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelStyles}`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userData.phoneNumber}
                      onChange={(e) => handleEditFormChange("phoneNumber", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-sm transition-colors ${inputStyles}`}
                    />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={handleSave}
                      className={`flex-1 text-white py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center space-x-2 ${
                        "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setUserData({ ...editForm });
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors flex items-center justify-center space-x-2 ${
                        isDark 
                          ? "bg-[#1A2234] border-[#2A3854] text-slate-300 hover:bg-[#22304A]" 
                          : "bg-slate-100 border-transparent text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center space-x-3">
                    <User className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-400"}`} />
                    <div>
                      <p className="font-medium text-sm">
                        {user?.firstName} {user?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-400"}`} />
                    <p className="text-sm">{user?.email}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-400"}`} />
                    <p className="text-sm">{user?.phoneNumber}</p>
                  </div>
                  
                  <div className={`border-t pt-4 ${isDark ? "border-[#2A3854]" : "border-slate-200"}`}>
                    <button
                      className="w-full flex items-center justify-center space-x-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bookings & Summary Ledger Panel */}
          <div className="md:col-span-2">
            <div className={`rounded-xl p-6 border transition-colors ${cardStyles}`}>
              <div className="mb-4">
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Transactions
                </p>
                <h2 className="mt-1 text-xl font-bold font-display">My Bookings</h2>
              </div>

              <Tabs defaultValue="flights" className="w-full">
                <TabsList className={`flex space-x-1 rounded-xl p-1 mb-6 border ${
                  isDark ? "bg-[#1A2234] border-[#2A3854]" : "bg-slate-100 border-slate-200"
                }`}>
                  <TabsTrigger 
                    value="flights"
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all data-[state=active]:shadow-sm ${
                      isDark 
                        ? "data-[state=active]:bg-indigo-950/90 data-[state=active]:text-white text-slate-400" 
                        : "data-[state=active]:bg-white data-[state=active]:text-indigo-600 text-slate-600"
                    }`}
                  >
                    Flights
                  </TabsTrigger>
                  <TabsTrigger 
                    value="hotels"
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all data-[state=active]:shadow-sm ${
                      isDark 
                        ? "data-[state=active]:bg-indigo-950/90 data-[state=active]:text-white text-slate-400" 
                        : "data-[state=active]:bg-white data-[state=active]:text-indigo-600 text-slate-600"
                    }`}
                  >
                    Hotels
                  </TabsTrigger>
                  <TabsTrigger 
                    value="refunds"
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all data-[state=active]:shadow-sm ${
                      isDark 
                        ? "data-[state=active]:bg-indigo-950/90 data-[state=active]:text-white text-slate-400" 
                        : "data-[state=active]:bg-white data-[state=active]:text-indigo-600 text-slate-600"
                    }`}
                  >
                    Refunds
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="flights" className="mt-0 focus-visible:outline-none">
                  <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
                    {flightBookings.length > 0 ? (
                      flightBookings.map((booking: any, index: any) => renderBookingCard(booking, index))
                    ) : (
                      <div className={`rounded-xl border border-dashed p-8 text-center text-xs ${
                        isDark ? "border-[#2A3854] bg-[#1A2234] text-slate-400" : "border-slate-200 bg-slate-50/50 text-slate-500"
                      }`}>
                        You do not have any flight bookings yet. Start planning your next journey.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="hotels" className="mt-0 focus-visible:outline-none">
                  <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
                    {hotelBookings.length > 0 ? (
                      hotelBookings.map((booking: any, index: any) => renderBookingCard(booking, index))
                    ) : (
                      <div className={`rounded-xl border border-dashed p-8 text-center text-xs ${
                        isDark ? "border-[#2A3854] bg-[#1A2234] text-slate-400" : "border-slate-200 bg-slate-50/50 text-slate-500"
                      }`}>
                        You have no hotel bookings right now. Explore stays and create a new reservation.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="refunds" className="mt-0 focus-visible:outline-none">
                  <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
                    {refunds.length > 0 ? (
                      refunds.map((refund) => <RefundStatusCard key={refund.id} refund={refund} />)
                    ) : (
                      <div className={`rounded-xl border border-dashed p-8 text-center text-xs ${
                        isDark ? "border-[#2A3854] bg-[#1A2234] text-slate-400" : "border-slate-200 bg-slate-50/50 text-slate-500"
                      }`}>
                        No refund activity yet. Cancellations will appear here once they are processed.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {cancelTarget && (
        <CancelBookingDialog
          open={Boolean(cancelTarget)}
          onOpenChange={(open) => !open && setCancelTarget(null)}
          totalPrice={cancelTarget.totalPrice}
          refund={getRefundForTarget(cancelTarget)}
          onConfirm={handleConfirmCancel}
          isSubmitting={isCancelling}
        />
      )}
    </div>
  );
};

export default ProfilePage;
