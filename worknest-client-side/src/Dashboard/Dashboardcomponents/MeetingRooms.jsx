import React, { useEffect, useState } from "react";
import axios from "axios";

/* 🔐 GOOGLE CONFIG (FROM .env) */
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const MeetingRooms = () => {
  const [meetingRooms, setMeetingRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoomId, setActiveRoomId] = useState(null);

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

  /* ---------------- Fetch Meeting Rooms ---------------- */
  useEffect(() => {
    const fetchMeetingRooms = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/dashboard/workspace"
        );

        const rooms = (res.data.workspaces || []).filter(
          (w) => w.type === "meeting-room"
        );

        setMeetingRooms(rooms);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingRooms();
  }, []);

  /* ---------------- Helpers ---------------- */
  const convertTo24Hour = (time, period) => {
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  };

  /* ---------------- Handlers ---------------- */
  const handleBookClick = (roomId) => {
    setActiveRoomId((prev) => (prev === roomId ? null : roomId));
    setBookingData({
      date: "",
      startTime: "",
      startPeriod: "AM",
      endTime: "",
      endPeriod: "AM",
    });
  };

  const handleChange = (e) =>
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });

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
        window.gapi.client.setToken(tokenResponse);

        const startConv = convertTo24Hour(
          bookingData.startTime,
          bookingData.startPeriod
        );
        const endConv = convertTo24Hour(
          bookingData.endTime,
          bookingData.endPeriod
        );

        const start = new Date(bookingData.date);
        start.setHours(startConv.hours, startConv.minutes);

        const end = new Date(bookingData.date);
        end.setHours(endConv.hours, endConv.minutes);

        const event = {
          summary: `Meeting Room Booking - ${room.name}`,
          description: `
Building: ${room.location?.building}
Floor: ${room.location?.floor}
Zone: ${room.location?.zone}
Capacity: ${room.capacity}
          `,
          start: {
            dateTime: start.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: end.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };

        await window.gapi.client.calendar.events.insert({
          calendarId: "primary",
          resource: event,
        });

        alert("✅ Meeting room booked & added to Google Calendar");
        setActiveRoomId(null);
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
        <h1 className="text-4xl font-bold mb-4">Meeting Rooms</h1>
        <h2 className="text-lg text-gray-600">
          View availability & book instantly
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {meetingRooms.map((room) => (
          <div key={room._id} className="border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-lg">{room.name}</h3>

            <p className="text-sm text-gray-500 mt-1">
              {room.location?.building}, Floor {room.location?.floor}, Zone{" "}
              {room.location?.zone}
            </p>

            {room.location?.description && (
              <p className="text-xs text-gray-500 mt-1">
                {room.location.description}
              </p>
            )}

            <p className="mt-1 text-sm">
              <span className="font-medium">Capacity:</span>{" "}
              {room.capacity || "N/A"}
            </p>

            <p
              className={`mt-2 text-xs font-medium ${
                room.status === "active" ? "text-green-600" : "text-red-600"
              }`}
            >
              {room.status}
            </p>

            {room.amenities?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {room.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-600"
                  >
                    {a.replace("_", " ")}
                  </span>
                ))}
              </div>
            )}

            <button
              disabled={room.status !== "active"}
              onClick={() => handleBookClick(room._id)}
              className={`mt-4 w-full rounded-lg py-2 text-sm font-semibold ${
                room.status === "active"
                  ? "bg-slate-900 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {activeRoomId === room._id ? "Cancel" : "Book Room"}
            </button>

            {activeRoomId === room._id && (
              <form
                onSubmit={(e) => handleSubmit(e, room)}
                className="mt-4 space-y-2 border-t pt-3"
              >
                <input
                  type="date"
                  name="date"
                  required
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />

                <div className="flex gap-2">
                  <input
                    type="time"
                    name="startTime"
                    required
                    onChange={handleChange}
                    className="flex-1 border px-3 py-2 rounded"
                  />
                  <select
                    name="startPeriod"
                    onChange={handleChange}
                    className="border px-2 rounded"
                  >
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
                  <select
                    name="endPeriod"
                    onChange={handleChange}
                    className="border px-2 rounded"
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded bg-green-600 py-2 text-white"
                >
                  Confirm Booking
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingRooms;
