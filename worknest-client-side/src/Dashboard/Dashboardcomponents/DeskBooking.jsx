import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContext";
import Loading from "../../components/Loading";

const DeskBooking = () => {
  const { user } = useContext(AuthContext);
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detailsDesk, setDetailsDesk] = useState(null);
  const [bookingDesk, setBookingDesk] = useState(null);

  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  /* ---------------- Fetch desks ---------------- */
  useEffect(() => {
    const fetchDesks = async () => {
      try {
        const res = await axios.get(
          "https://worknest-u174.onrender.com/dashboard/workspace"
        );

        // Backend returns { success: true, workspaces: [...] }
        const allWorkspaces = res.data.workspaces || [];
        console.log("All workspaces from API:", allWorkspaces);

        // Filter for desks - show active desks, or all desks if status filter is too strict
        const deskList = allWorkspaces.filter(
          (d) => d.type === "desk" && (d.status === "active" || !d.status)
        );

        console.log("Filtered desk list:", deskList);
        setDesks(deskList);
      } catch (err) {
        console.error("Error fetching desks:", err);
        console.error("Response:", err.response?.data);
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
        workspaceId: desk._id,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        uid: user?.uid, // Send user UID for proper booking association
      });

      // If we reach here, booking was successful
      // ---------- Update frontend ----------
      setDesks((prev) => prev.filter((d) => d._id !== desk._id));
      setBookingDesk(null);
      toast.success("Desk booked successfully!");
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

            {detailsDesk.amenities?.length > 0 &&
              detailsDesk.amenities[0] !== "" && (
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

            <form
              onSubmit={(e) => handleSubmit(e, bookingDesk)}
              className="space-y-3"
            >
              <input
                type="date"
                name="date"
                min={new Date().toISOString().split("T")[0]}
                required
                onChange={handleChange}
                className="w-full border text-foreground px-3 py-2 rounded"
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
                onClick={() => setBookingDesk(null)}
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

export default DeskBooking;
