import React, { useEffect, useState } from "react";
import axios from "axios";

/* 🔐 GOOGLE CONFIG */
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const DeskBooking = () => {
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detailsDesk, setDetailsDesk] = useState(null);
  const [bookingDesk, setBookingDesk] = useState(null);

  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "",
    startPeriod: "AM",
    endTime: "",
    endPeriod: "AM",
  });

  const [gapiReady, setGapiReady] = useState(false);

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
      });
    };

    initGapi();
  }, []);

  /* ---------------- Fetch desks ---------------- */
  useEffect(() => {
    const fetchDesks = async () => {
      try {
        const res = await axios.get("http://localhost:3000/dashboard/workspaces");

        const deskList = (res.data.workspaces || []).filter(
          (d) => d.type === "desk" && d.status === "active"
        );

        setDesks(deskList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDesks();
  }, []);

  /* ---------------- Helpers ---------------- */
  const handleChange = (e) =>
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });

  /* ---------------- Booking ---------------- */
  const handleSubmit = async (e, desk) => {
    e.preventDefault();

    if (!gapiReady || !window.google) {
      alert("Google API still loading");
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (tokenResponse) => {
        try {
          window.gapi.client.setToken(tokenResponse);

          // ---------- Convert input type="time" + AM/PM to correct hours ----------
          const [startHoursRaw, startMinutes] = bookingData.startTime
            .split(":")
            .map(Number);
          const [endHoursRaw, endMinutes] = bookingData.endTime
            .split(":")
            .map(Number);

          let startHours = startHoursRaw;
          let endHours = endHoursRaw;

          if (bookingData.startPeriod === "PM" && startHours !== 12) startHours += 12;
          if (bookingData.startPeriod === "AM" && startHours === 12) startHours = 0;

          if (bookingData.endPeriod === "PM" && endHours !== 12) endHours += 12;
          if (bookingData.endPeriod === "AM" && endHours === 12) endHours = 0;

          const start = new Date(bookingData.date);
          start.setHours(startHours, startMinutes, 0, 0);

          const end = new Date(bookingData.date);
          end.setHours(endHours, endMinutes, 0, 0);

          const now = new Date();
          if (start < now) {
            alert("❌ You can only book for the present or future time.");
            return;
          }

          // ---------- Google Calendar Event ----------
          const event = {
            summary: `Desk Booking - ${desk.name}`,
            start: {
              dateTime: start.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: end.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          };

          const insertRes = await window.gapi.client.calendar.events.insert({
            calendarId: "primary",
            resource: event,
          });

          // ---------- POST booking to backend ----------
          await axios.post("http://localhost:3000/api/bookings", {
            workspaceId: desk._id,
            startAt: start.toISOString(),
            endAt: end.toISOString(),
            googleEventId: insertRes.result.id,
          });

          // ---------- Update frontend ----------
          setDesks((prev) => prev.filter((d) => d._id !== desk._id));
          setBookingDesk(null);

          alert("✅ Desk booked successfully");
        } catch (err) {
          console.error(err);
          alert("❌ Booking failed");
        }
      },
    });

    tokenClient.requestAccessToken();
  };

  if (loading) return <p className="text-center mt-10">Loading desks...</p>;

  /* ---------------- UI ---------------- */
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Available Desks</h1>
        <h2 className="text-lg text-gray-600">View details & book instantly</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {desks.map((desk) => (
          <div key={desk._id} className="border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-lg">{desk.name}</h3>

            <p className="text-xs mt-1 text-green-600">Status: {desk.status}</p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setDetailsDesk(desk)}
                className="flex-1 rounded bg-indigo-600 py-2 text-white text-sm"
              >
                View Details
              </button>

              <button
                onClick={() => setBookingDesk(desk)}
                className="flex-1 rounded bg-slate-900 py-2 text-white text-sm"
              >
                Book Desk
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- DETAILS MODAL ---------------- */}
      {detailsDesk && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{detailsDesk.name}</h2>

            <p>
              <strong>Building:</strong> {detailsDesk.location?.building}
            </p>
            <p>
              <strong>Floor:</strong> {detailsDesk.location?.floor}
            </p>
            <p>
              <strong>Zone:</strong> {detailsDesk.location?.zone}
            </p>
            <p>
              <strong>Description:</strong> {detailsDesk.location?.description}
            </p>
            <p>
              <strong>Capacity:</strong> {detailsDesk.capacity}
            </p>

            {detailsDesk.amenities?.length > 0 && detailsDesk.amenities[0] !== "" && (
              <div className="mt-3">
                <strong>Amenities:</strong>
                <ul className="list-disc ml-5 mt-1">
                  {detailsDesk.amenities.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setDetailsDesk(null)}
              className="mt-5 w-full rounded bg-gray-800 py-2 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ---------------- BOOKING MODAL ---------------- */}
      {bookingDesk && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Book {bookingDesk.name}</h2>

            <form onSubmit={(e) => handleSubmit(e, bookingDesk)} className="space-y-3">
              <input
                type="date"
                name="date"
                min={new Date().toISOString().split("T")[0]}
                required
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />

              <div className="flex gap-2">
                <input
                  type="time"
                  name="startTime"
                  min={
                    bookingData.date === new Date().toISOString().split("T")[0]
                      ? new Date().toTimeString().slice(0, 5)
                      : undefined
                  }
                  required
                  onChange={handleChange}
                  className="flex-1 border px-3 py-2 rounded"
                />
                <select name="startPeriod" onChange={handleChange} className="border px-2 rounded">
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="time"
                  name="endTime"
                  required
                  onChange={handleChange}
                  className="flex-1 border px-3 py-2 rounded"
                />
                <select name="endPeriod" onChange={handleChange} className="border px-2 rounded">
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>

              <button type="submit" className="w-full rounded bg-green-600 py-2 text-white">
                Confirm Booking
              </button>

              <button
                type="button"
                onClick={() => setBookingDesk(null)}
                className="w-full rounded bg-gray-800 py-2 text-white"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeskBooking;

