import { useState, useEffect, useContext, useRef } from "react";
import { Clock, Timer, Calendar, User, LogIn, LogOut } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import axios from "axios";

const MyActivity = () => {
  const { user } = useContext(AuthContext);
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState({});
  const [buttonLoading, setButtonLoading] = useState(false);
  const hasRun = useRef(false);

  const getToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const formatTime = dateString =>
    dateString
      ? new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "-";

  const formatDate = dateString => new Date(dateString).toLocaleDateString();

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/users/${user.uid}`);
      setUserData(response.data.users);
      return response.data.users;
    } catch {
      setError("Failed to load user data");
      return {};
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/attendance/${user.uid}`);
      const data = response.data.attendance || [];
      setAttendanceData(data);
      
      const today = getToday();
      const todayRecord = data.find(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      });
      
      if (todayRecord) {
        setCurrentStatus(todayRecord);
      }
      
      return data;
    } catch {
      setError("Failed to fetch attendance data");
      return [];
    }
  };

  const handleCheckIn = async () => {
    if (!user.uid) return;
    
    if (currentStatus?.checkInTime) {
      setError("You have already checked in today. Check-in is only allowed once per day.");
      return;
    }

    try {
      setButtonLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.post("http://localhost:3000/api/attendance/checkin", {
        employeeId: user.uid,
        employeeName: userData.name || "Unknown User",
      });

      if (response.data.success) {
        setCurrentStatus(response.data.attendance);
        setSuccess("Check-in successful!");
        
        await fetchAttendanceData();
        
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Check-in failed:", error);
      if (error.response?.data?.message === "Already checked in today") {
        setError("Already checked in today.");
      } else {
        setError(error.response?.data?.message || "Check-in failed");
      }
    } finally {
      setButtonLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user.uid) return;

    if (!currentStatus?.checkInTime) {
      setError("No check-in record found for today. Please check in first.");
      return;
    }

    if (currentStatus?.checkOutTime) {
      setError("Already checked out today.");
      return;
    }

    try {
      setButtonLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.put("http://localhost:3000/api/attendance/checkout", {
        employeeId: user.uid,
      });

      if (response.data.success) {
        setCurrentStatus(response.data.attendance);
        setSuccess("Check-out successful!");
        
        await fetchAttendanceData();
        
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Check-out failed:", error);
      setError(error.response?.data?.message || "Check-out failed");
    } finally {
      setButtonLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (currentStatus?.checkInTime && currentStatus?.checkOutTime) {
        console.log('Resetting check-in/out times on logout...');
        await axios.delete("http://localhost:3000/api/attendance/reset", {
          data: { employeeId: user.uid },
        });
      }
    } catch (error) {
      console.error("Error during logout reset:", error);
    }
  };

  useEffect(() => {
    if (!user?.uid || hasRun.current) return;
    hasRun.current = true;

    const init = async () => {
      setLoading(true);
      await fetchUserData();
      await fetchAttendanceData();
      setLoading(false);
    };

    init();
  }, [user]);

  useEffect(() => {
    return () => {
      if (!user?.uid) {
        handleLogout();
      }
    };
  }, [user?.uid]);

  if (loading && attendanceData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Activity</h1>
          <p className="text-muted-foreground">Track your work hours and attendance</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">{userData.name || "Loading..."}</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Today's Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <LogIn className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Check-in Time</p>
              <p className="font-medium">{currentStatus?.checkInTime ? formatTime(currentStatus.checkInTime) : "-"}</p>
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

        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
            disabled={buttonLoading || currentStatus?.checkInTime}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {buttonLoading ? "Processing..." : "Check In"}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={buttonLoading || !currentStatus?.checkInTime || currentStatus?.checkOutTime}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            {buttonLoading ? "Processing..." : "Check Out"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4">
            {success}
          </div>
        )}
      </div>

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
                    <td className="py-3 px-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(record.date)}
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