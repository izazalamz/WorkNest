import React, { useEffect, useState } from "react";
import axios from "axios";

/* 🔐 GOOGLE CONFIG */
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsItem, setDetailsItem] = useState(null);

  const [gapiReady, setGapiReady] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);

  /* ---------------- Load Google APIs ---------------- */
  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });

    const initGapi = async () => {
      await loadScript("https://accounts.google.com/gsi/client");
      await loadScript("https://apis.google.com/js/api.js");

      window.gapi.load("client", async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
          ],
        });
        setGapiReady(true);

        window.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse) => {
            setGoogleToken(tokenResponse.access_token);
          },
        });
      });
    };

    initGapi();
  }, []);

  /* ---------------- Fetch bookings (FROM BOOKINGS COLLECTION) ---------------- */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/bookings/my"
        );

        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  /* ---------------- Cancel Booking ---------------- */
  const cancelBooking = async (booking) => {
    if (!gapiReady) {
      alert("Google API not ready");
      return;
    }

    if (!googleToken) {
      window.tokenClient.requestAccessToken();
      return;
    }

    try {
      window.gapi.client.setToken({ access_token: googleToken });

      /* Delete Google Calendar event */
      if (booking.calendar?.eventId) {
        await window.gapi.client.calendar.events.delete({
          calendarId: "primary",
          eventId: booking.calendar.eventId,
        });
      }

      /* Cancel booking in backend */
      await axios.patch(
        `http://localhost:3000/api/bookings/${booking._id}/cancel`
      );

      setBookings((prev) =>
        prev.filter((b) => b._id !== booking._id)
      );
      setDetailsItem(null);

      alert("✅ Booking cancelled successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Cancel failed");
    }
  };

  if (loading)
    return <p className="text-center mt-10">Loading bookings...</p>;

  if (bookings.length === 0)
    return <p className="text-center mt-10">No bookings yet.</p>;

  /* ---------------- UI ---------------- */
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">My Bookings</h1>
        <h2 className="text-lg text-gray-600">
          View your booked desks & meeting rooms
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {bookings.map((booking) => (
          <div key={booking._id} className="border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-lg">
              {booking.workspaceId?.name}
            </h3>

            <p className="text-xs mt-1 text-orange-600">
              Status: {booking.status}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setDetailsItem(booking)}
                className="flex-1 rounded bg-indigo-600 py-2 text-white text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- DETAILS MODAL ---------------- */}
      {detailsItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {detailsItem.workspaceId?.name}
            </h2>

            <p><strong>Type:</strong> {detailsItem.workspaceId?.type}</p>
            <p><strong>Building:</strong> {detailsItem.workspaceId?.location?.building}</p>
            <p><strong>Floor:</strong> {detailsItem.workspaceId?.location?.floor}</p>
            <p><strong>Zone:</strong> {detailsItem.workspaceId?.location?.zone}</p>

            <p className="mt-2">
              <strong>Booking:</strong>{" "}
              {new Date(detailsItem.startAt).toLocaleString()} –{" "}
              {new Date(detailsItem.endAt).toLocaleString()}
            </p>

            <button
              onClick={() => cancelBooking(detailsItem)}
              className="mt-5 w-full rounded bg-red-600 py-2 text-white"
            >
              Cancel Booking
            </button>

            <button
              onClick={() => setDetailsItem(null)}
              className="mt-3 w-full rounded bg-gray-800 py-2 text-white"
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
