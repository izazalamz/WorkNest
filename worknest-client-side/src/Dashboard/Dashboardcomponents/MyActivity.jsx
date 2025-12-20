import { useState, useEffect, useContext } from "react";
import { Clock, Timer, Calendar, User, LogIn, LogOut } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import axios from "axios";

const MyActivity = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState({});
  const { user } = useContext(AuthContext);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/users/${user.uid}`);
      setUserData(response.data.users);
    } catch {
      setError("Failed to load user data");
    }
  };

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/attendance/${user.uid}`);
      const data = response.data.attendance || [];
      setAttendanceData(data);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayRecord = data.find(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime() && !record.checkOutTime;
      });

      setCurrentStatus(todayRecord || null);
    } catch {
      setError("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  // Auto check-in
  const handleAutoCheckIn = async () => {
    try {
      setLoading(true);
      await axios.post("http://localhost:3000/api/attendance/checkin", {
        employeeId: user.uid,
        employeeName: userData.name || "Unknown User",
      });
      await fetchAttendanceData();
    } catch {
      setError("Auto check-in failed");
    } finally {
      setLoading(false);
    }
  };

  // Auto check-out
  const handleAutoCheckOut = async () => {
    try {
      setLoading(true);
      await axios.put("http://localhost:3000/api/attendance/checkout", {
        employeeId: user.uid,
      });
      await fetchAttendanceData();
    } catch {
      setError("Auto check-out failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    // Fetch user info, then auto check-in
    fetchUserData().then(() => handleAutoCheckIn());

    // Auto check-out on page unload (close tab/refresh)
    const handleBeforeUnload = async () => {
      await handleAutoCheckOut();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);

  // Helpers to format date/time
  const formatTime = dateString =>
    dateString ? new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
  const formatDate = dateString => new Date(dateString).toLocaleDateString();

  if (loading && attendanceData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Clock className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Activity</h1>
          <p className="text-muted-foreground">Track your work hours and attendance</p>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">{userData.name || "Loading..."}</span>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Today's Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <LogIn className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Check-in Time</p>
              <p className="font-medium">{currentStatus ? formatTime(currentStatus.checkInTime) : "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <LogOut className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Check-out Time</p>
              <p className="font-medium">{currentStatus?.checkOutTime ? formatTime(currentStatus.checkOutTime) : "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Timer className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Hours Today</p>
              <p className="font-medium">{currentStatus?.totalHours ? `${currentStatus.totalHours.toFixed(2)} hrs` : "-"}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Attendance History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Check-in Time</th>
                <th className="text-left py-3 px-4 font-medium">Check-out Time</th>
                <th className="text-left py-3 px-4 font-medium">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-muted-foreground">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendanceData.map((record, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(record.date)}
                      </div>
                    </td>
                    <td className="py-3 px-4">{formatTime(record.checkInTime)}</td>
                    <td className="py-3 px-4">{formatTime(record.checkOutTime)}</td>
                    <td className="py-3 px-4">{record.totalHours ? `${record.totalHours.toFixed(2)} hrs` : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyActivity;
