import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContext";
import Loading from "../../components/Loading";

const MeetingRooms = () => {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detailsRoom, setDetailsRoom] = useState(null);
  const [bookingRoom, setBookingRoom] = useState(null);

  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  /* ---------------- Fetch available rooms ---------------- */
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(
          "https://worknest-u174.onrender.com/dashboard/workspace"
        );

        // Backend returns { success: true, workspaces: [...] }
        const allWorkspaces = res.data.workspaces || [];
        console.log("All workspaces from API:", allWorkspaces);

        // Filter for meeting rooms - show active rooms, or all rooms if status filter is too strict
        const activeRooms = allWorkspaces.filter(
          (w) =>
            w.type === "meeting-room" && (w.status === "active" || !w.status)
        );

        console.log("Filtered meeting rooms list:", activeRooms);
        setRooms(activeRooms);
      } catch (err) {
        console.error("Error fetching meeting rooms:", err);
        console.error("Response:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  /* ---------------- Helpers ---------------- */
  const handleChange = (e) =>
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });

  /* ---------------- Booking ---------------- */
  const handleSubmit = async (e, room) => {
    e.preventDefault();

    try {
      // Time input already provides 24-hour format (HH:MM)
      const [startHours, startMinutes] = bookingData.startTime
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = bookingData.endTime.split(":").map(Number);

      const start = new Date(bookingData.date);
      start.setHours(startHours, startMinutes, 0, 0);

      const end = new Date(bookingData.date);
      end.setHours(endHours, endMinutes, 0, 0);

      const now = new Date();
      if (start < now) {
        toast.error("You can only book for the present or future time.");
        return;
      }

      // ---------- POST booking to backend (no Google Calendar) ----------
      await axios.post("https://worknest-u174.onrender.com/api/bookings", {
        workspaceId: room._id,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        uid: user?.uid, // Send user UID for proper booking association
      });

      // If we reach here, booking was successful
      // ---------- Update frontend ----------
      setRooms((prev) => prev.filter((r) => r._id !== room._id));
      setBookingRoom(null);
      toast.success("Meeting room booked successfully!");
    } catch (err) {
      console.error("Booking error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Booking failed";
      toast.error(errorMessage);
    }
  };

  if (loading) return <Loading />;

  /* ---------------- UI ---------------- */
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Available Meeting Rooms</h1>
        <h2 className="text-lg text-gray-600">View details & book instantly</h2>
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
            <p>
              <strong>Building:</strong> {detailsRoom.location?.building}
            </p>
            <p>
              <strong>Floor:</strong> {detailsRoom.location?.floor}
            </p>
            <p>
              <strong>Zone:</strong> {detailsRoom.location?.zone}
            </p>
            <p>
              <strong>Description:</strong> {detailsRoom.location?.description}
            </p>
            <p>
              <strong>Capacity:</strong> {detailsRoom.capacity}
            </p>

            {detailsRoom.amenities?.length > 0 &&
              detailsRoom.amenities[0] !== "" && (
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
                className="w-full text-foreground border px-3 py-2 rounded"
              />

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
                className="w-full border text-foreground px-3 py-2 rounded"
              />

              <input
                type="time"
                name="endTime"
                required
                onChange={handleChange}
                className="w-full border text-foreground px-3 py-2 rounded"
              />

              <button
                type="submit"
                className="w-full rounded bg-green-600 py-2 text-white"
              >
                Confirm Booking
              </button>

              <button
                type="button"
                onClick={() => setBookingRoom(null)}
                className="w-full rounded bg-gray-800 py-2 text-background"
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
