import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContext";
import { Calendar, Clock, MapPin, Building2, Users } from "lucide-react";
import Loading from "../../components/Loading";

const MyBookings = () => {
  const { user } = useContext(AuthContext);
  const [pastBookings, setPastBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsItem, setDetailsItem] = useState(null);

  /* ---------------- Fetch bookings (FROM BOOKINGS COLLECTION) ---------------- */
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3000/api/bookings/my?uid=${user.uid}`
        );

        console.log("Bookings API response:", res.data);

        // Module 4, Requirement 4: Separate past and upcoming bookings
        const past = res.data.pastBookings || [];
        const upcoming = res.data.upcomingBookings || [];

        console.log(
          `Received ${past.length} past bookings and ${upcoming.length} upcoming bookings`
        );

        setPastBookings(past);
        setUpcomingBookings(upcoming);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        console.error("Error details:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  /* ---------------- Check-In Booking ---------------- */
  const checkInBooking = async (booking) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/api/bookings/${booking._id}/check-in`
      );

      if (response.data?.success) {
        toast.success("Checked in successfully!");
        setDetailsItem(null);

        // Refresh bookings to update the list
        if (user?.uid) {
          const res = await axios.get(
            `http://localhost:3000/api/bookings/my?uid=${user.uid}`
          );
          setPastBookings(res.data.pastBookings || []);
          setUpcomingBookings(res.data.upcomingBookings || []);
        }
      }
    } catch (err) {
      console.error("Check-in error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to check in";
      toast.error(errorMessage);
    }
  };

  /* ---------------- Cancel Booking ---------------- */
  const cancelBooking = async (booking) => {
    try {
      /* Cancel booking in backend */
      await axios.patch(
        `http://localhost:3000/api/bookings/${booking._id}/cancel`
      );

      // If we reach here, cancellation was successful
      // Remove from upcoming bookings
      setUpcomingBookings((prev) => prev.filter((b) => b._id !== booking._id));
      setDetailsItem(null);

      toast.success("Booking cancelled successfully");

      // Refresh bookings to update the list
      if (user?.uid) {
        const res = await axios.get(
          `http://localhost:3000/api/bookings/my?uid=${user.uid}`
        );
        setPastBookings(res.data.pastBookings || []);
        setUpcomingBookings(res.data.upcomingBookings || []);
      }
    } catch (err) {
      console.error("Cancel booking error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to cancel booking";
      toast.error(errorMessage);
    }
  };

  if (loading) return <Loading />;

  const totalBookings = pastBookings.length + upcomingBookings.length;
  if (totalBookings === 0)
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">My Bookings</h1>
          <h2 className="text-lg text-gray-600">
            View your booked desks & meeting rooms
          </h2>
        </div>
        <div className="text-center mt-20">
          <p className="text-gray-500 text-lg">No bookings yet.</p>
          <p className="text-gray-400 text-sm mt-2">
            Book a desk or meeting room to get started!
          </p>
        </div>
      </div>
    );

  /* ---------------- Helper function to render booking card ---------------- */
  const renderBookingCard = (booking) => {
    const workspaceType = booking.workspaceId?.type || "Unknown";
    const isDesk = workspaceType.toLowerCase() === "desk";
    // Handle both "meeting-room" and "meeting room" formats
    const isMeetingRoom =
      workspaceType.toLowerCase() === "meeting-room" ||
      workspaceType.toLowerCase() === "meeting room";

    return (
      <div
        key={booking._id}
        className="border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {isDesk ? (
              <Building2 className="w-5 h-5 text-indigo-600" />
            ) : isMeetingRoom ? (
              <Users className="w-5 h-5 text-green-600" />
            ) : (
              <MapPin className="w-5 h-5 text-gray-600" />
            )}
            <h3 className="font-semibold text-lg text-gray-800">
              {booking.workspaceId?.name || "Unnamed Workspace"}
            </h3>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              booking.status === "confirmed"
                ? "bg-green-100 text-green-700"
                : booking.status === "checked_in"
                ? "bg-blue-100 text-blue-700"
                : booking.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : booking.status === "no_show"
                ? "bg-orange-100 text-orange-700"
                : booking.status === "expired"
                ? "bg-gray-100 text-gray-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {booking.status === "checked_in"
              ? "Checked In"
              : booking.status === "no_show"
              ? "No Show"
              : booking.status}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(booking.startAt).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              {new Date(booking.startAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {new Date(booking.endAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {booking.workspaceId?.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>
                {booking.workspaceId.location.building || ""}
                {booking.workspaceId.location.floor
                  ? `, Floor ${booking.workspaceId.location.floor}`
                  : ""}
                {booking.workspaceId.location.zone
                  ? `, ${booking.workspaceId.location.zone}`
                  : ""}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {booking.status === "confirmed" &&
            new Date(booking.startAt) <= new Date() &&
            new Date(booking.endAt) > new Date() &&
            !booking.check?.checkInAt && (
              <button
                onClick={() => checkInBooking(booking)}
                className="flex-1 rounded-lg bg-green-600 py-2 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Check In
              </button>
            )}
          <button
            onClick={() => setDetailsItem(booking)}
            className={`${
              booking.status === "confirmed" &&
              new Date(booking.startAt) <= new Date() &&
              new Date(booking.endAt) > new Date() &&
              !booking.check?.checkInAt
                ? "flex-1"
                : "w-full"
            } rounded-lg bg-indigo-600 py-2 text-white text-sm font-medium hover:bg-indigo-700 transition-colors`}
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">My Bookings</h1>
        <h2 className="text-lg text-gray-600">
          View your past and upcoming desk & meeting room bookings
        </h2>
      </div>

      {/* Upcoming Bookings Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Upcoming Bookings
          </h2>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            {upcomingBookings.length}
          </span>
        </div>
        {upcomingBookings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingBookings.map(renderBookingCard)}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No upcoming bookings</p>
            <p className="text-gray-400 text-sm mt-1">
              Book a desk or meeting room to see it here
            </p>
          </div>
        )}
      </div>

      {/* Past Bookings Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Past Bookings</h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {pastBookings.length}
          </span>
        </div>
        {pastBookings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pastBookings.map(renderBookingCard)}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No past bookings</p>
            <p className="text-gray-400 text-sm mt-1">
              Your completed bookings will appear here
            </p>
          </div>
        )}
      </div>

      {/* ---------------- DETAILS MODAL ---------------- */}
      {detailsItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {detailsItem.workspaceId?.name || "Booking Details"}
              </h2>
              <button
                onClick={() => setDetailsItem(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium text-gray-800">
                  {detailsItem.workspaceId?.type || "N/A"}
                </p>
              </div>

              {detailsItem.workspaceId?.location && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Building</p>
                    <p className="font-medium text-gray-800">
                      {detailsItem.workspaceId.location.building || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Floor</p>
                    <p className="font-medium text-gray-800">
                      {detailsItem.workspaceId.location.floor || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Zone</p>
                    <p className="font-medium text-gray-800">
                      {detailsItem.workspaceId.location.zone || "N/A"}
                    </p>
                  </div>
                </>
              )}

              <div>
                <p className="text-sm text-gray-500">Start Time</p>
                <p className="font-medium text-gray-800">
                  {new Date(detailsItem.startAt).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">End Time</p>
                <p className="font-medium text-gray-800">
                  {new Date(detailsItem.endAt).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    detailsItem.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : detailsItem.status === "checked_in"
                      ? "bg-blue-100 text-blue-700"
                      : detailsItem.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : detailsItem.status === "no_show"
                      ? "bg-orange-100 text-orange-700"
                      : detailsItem.status === "expired"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {detailsItem.status === "checked_in"
                    ? "Checked In"
                    : detailsItem.status === "no_show"
                    ? "No Show"
                    : detailsItem.status}
                </span>
              </div>

              {detailsItem.check?.checkInAt && (
                <div>
                  <p className="text-sm text-gray-500">Checked In At</p>
                  <p className="font-medium text-gray-800">
                    {new Date(detailsItem.check.checkInAt).toLocaleString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Show check-in button for confirmed bookings that have started but not checked in */}
            {detailsItem.status === "confirmed" &&
              new Date(detailsItem.startAt) <= new Date() &&
              new Date(detailsItem.endAt) > new Date() &&
              !detailsItem.check?.checkInAt && (
                <button
                  onClick={() => checkInBooking(detailsItem)}
                  className="w-full rounded-lg bg-green-600 py-2.5 text-white font-medium hover:bg-green-700 transition-colors mb-3"
                >
                  Check In
                </button>
              )}

            {/* Only show cancel button for upcoming confirmed bookings */}
            {new Date(detailsItem.endAt) > new Date() &&
              detailsItem.status === "confirmed" && (
                <button
                  onClick={() => cancelBooking(detailsItem)}
                  className="w-full rounded-lg bg-red-600 py-2.5 text-white font-medium hover:bg-red-700 transition-colors mb-3"
                >
                  Cancel Booking
                </button>
              )}

            <button
              onClick={() => setDetailsItem(null)}
              className="w-full rounded-lg bg-gray-800 py-2.5 text-white font-medium hover:bg-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
