import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const DeskBooking = () => {
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDeskId, setActiveDeskId] = useState(null);

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
        const res = await axios.get(
          "http://localhost:3000/dashboard/workspace"
        );

        const activeDesks = (res.data.workspaces || []).filter(
          (d) => d.type === "desk"
        );

        setDesks(activeDesks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDesks();
  }, []);

  /* ---------------- Helpers ---------------- */
  const convertTo24Hour = (time, period) => {
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  };

  /* ---------------- Handlers ---------------- */
  const handleBookClick = (deskId) => {
    setActiveDeskId((prev) => (prev === deskId ? null : deskId));
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
          summary: `Desk Booking - ${desk.name}`,
          description: `
Building: ${desk.location?.building || "N/A"}
Floor: ${desk.location?.floor || "N/A"}
Zone: ${desk.location?.zone || "N/A"}
Capacity: ${desk.capacity || "N/A"}
Description: ${desk.description || "N/A"}
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

        toast.success("Booking added to Google Calendar");
        setActiveDeskId(null);
      },
    });

    tokenClient.requestAccessToken();
  };

  if (loading) return <p className="text-center mt-10">Loading desks...</p>;

  /* ---------------- UI ---------------- */
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Featured Desks</h1>
        <h2 className="text-lg text-gray-600">Check & Book Your Desk!</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {desks.map((desk) => (
          <div key={desk._id} className="border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-lg">{desk.name}</h3>

            {/* Location */}
            <p className="text-sm text-gray-500 mt-1">
              {desk.location?.building || "N/A"}, Floor{" "}
              {desk.location?.floor || "N/A"}, Zone{" "}
              {desk.location?.zone || "N/A"}
            </p>

            {/* Status */}
            <p
              className={`mt-2 text-xs font-medium ${
                desk.status === "active" ? "text-green-600" : "text-red-600"
              }`}
            >
              Status: {desk.status}
            </p>

            {/* Capacity */}
            <p className="text-sm mt-1">
              <strong>Capacity:</strong> {desk.capacity || "N/A"}
            </p>

            {/* Description */}
            {desk.description && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>Description:</strong> {desk.description}
              </p>
            )}

            <button
              disabled={desk.status !== "active"}
              onClick={() => handleBookClick(desk._id)}
              className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-white"
            >
              {activeDeskId === desk._id ? "Cancel" : "Book Desk"}
            </button>

            {activeDeskId === desk._id && (
              <form
                onSubmit={(e) => handleSubmit(e, desk)}
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

export default DeskBooking;
