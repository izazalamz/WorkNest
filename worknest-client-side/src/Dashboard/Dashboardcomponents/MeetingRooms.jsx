import React, { useEffect, useState } from "react";
import axios from "axios";

/* 🔐 GOOGLE CONFIG */
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const MeetingRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detailsRoom, setDetailsRoom] = useState(null);
  const [bookingRoom, setBookingRoom] = useState(null);

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

  /* ---------------- Fetch available rooms ---------------- */
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/dashboard/workspaces"
        );

        const activeRooms = (res.data.workspaces || []).filter(
          (w) => w.type === "meeting-room" && w.status === "active"
        );

        setRooms(activeRooms);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  /* ---------------- Helpers ---------------- */
  const handleChange = (e) =>
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });

  const convertTo24Hour = (time, period) => {
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  };

  /* ---------------- Booking ---------------- */
  const handleSubmit = async (e, room) => {
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

          // Convert time to 24h
          const startConv = convertTo24Hour(
            bookingData.startTime,
            bookingData.startPeriod
          );
          const endConv = convertTo24Hour(
            bookingData.endTime,
            bookingData.endPeriod
          );

          const start = new Date(bookingData.date);
          start.setHours(startConv.hours, startConv.minutes, 0, 0);

          const end = new Date(bookingData.date);
          end.setHours(endConv.hours, endConv.minutes, 0, 0);

          const now = new Date();
          if (start < now) {
            alert("❌ You can only book for the present or future time.");
            return;
          }

          // ---------- Google Calendar Event ----------
          const event = {
            summary: `Meeting Room Booking - ${room.name}`,
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
            workspaceId: room._id,
            startAt: start.toISOString(),
            endAt: end.toISOString(),
            googleEventId: insertRes.result.id,
          });

          // ---------- Update frontend ----------
          setRooms((prev) => prev.filter((r) => r._id !== room._id));
          setBookingRoom(null);

          alert("✅ Meeting room booked successfully");
        } catch (err) {
          console.error(err);
          alert("❌ Booking failed");
        }
      },
    });

    tokenClient.requestAccessToken();
  };

  if (loading)
    return <p className="text-center mt-10">Loading meeting rooms...</p>;

  /* ---------------- UI ---------------- */
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Available Meeting Rooms</h1>
        <h2 className="text-lg text-gray-600">
          View details & book instantly
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {rooms.map((room) => (
          <div key={room._id} className="border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-lg">{room.name}</h3>
            <p className="text-xs mt-1 text-green-600">Status: {room.status}</p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setDetailsRoom(room)}
                className="flex-1 rounded bg-indigo-600 py-2 text-white text-sm"
              >
                View Details
              </button>
              <button
                onClick={() => setBookingRoom(room)}
                className="flex-1 rounded bg-slate-900 py-2 text-white text-sm"
              >
                Book Room
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- DETAILS MODAL ---------------- */}
      {detailsRoom && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{detailsRoom.name}</h2>
            <p><strong>Building:</strong> {detailsRoom.location?.building}</p>
            <p><strong>Floor:</strong> {detailsRoom.location?.floor}</p>
            <p><strong>Zone:</strong> {detailsRoom.location?.zone}</p>
            <p><strong>Description:</strong> {detailsRoom.location?.description}</p>
            <p><strong>Capacity:</strong> {detailsRoom.capacity}</p>

            {detailsRoom.amenities?.length > 0 && detailsRoom.amenities[0] !== "" && (
              <div className="mt-3">
                <strong>Amenities:</strong>
                <ul className="list-disc ml-5 mt-1">
                  {detailsRoom.amenities.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setDetailsRoom(null)}
              className="mt-5 w-full rounded bg-gray-800 py-2 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ---------------- BOOKING MODAL ---------------- */}
      {bookingRoom && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Book {bookingRoom.name}</h2>

            <form
              onSubmit={(e) => handleSubmit(e, bookingRoom)}
              className="space-y-3"
            >
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
                onClick={() => setBookingRoom(null)}
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

export default MeetingRooms;
