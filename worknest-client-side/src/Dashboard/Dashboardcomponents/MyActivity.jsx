import { useState, useEffect, useContext, useRef } from "react";
<<<<<<< HEAD
import {
  Clock,
  Timer,
  Calendar,
  User,
  LogIn,
  LogOut,
  Building2,
  Home,
} from "lucide-react";
=======
import { Clock, Timer, Calendar, User, LogIn, LogOut, Building2, Home } from "lucide-react";
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
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
  const [selectedWorkMode, setSelectedWorkMode] = useState(null);
  const hasRun = useRef(false);

<<<<<<< HEAD
  const getToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const formatTime = (dateString) =>
=======
  const formatTime = dateString =>
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
    dateString
      ? new Date(dateString).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const fetchUserData = async () => {
    try {
<<<<<<< HEAD
      const response = await axios.get(
        `http://localhost:3000/users/${user.uid}`
      );
      setUserData(response.data.user);
      return response.data.user;
    } catch {
=======
      const response = await axios.get(`http://localhost:3000/users/${user.uid}`);
      setUserData(response.data.users);
      return response.data.users;
    } catch (err) {
      console.error("Error fetching user data:", err);
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
      setError("Failed to load user data");
      return {};
    }
  };

  const fetchAttendanceData = async () => {
    try {
      console.log("🔄 Fetching attendance data for user:", user.uid);
      const response = await axios.get(
        `http://localhost:3000/api/attendance/${user.uid}`
      );
      const data = response.data.attendance || [];
      console.log("📊 Received attendance data:", data);

      setAttendanceData(data);

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const todayTime = today.getTime();

      console.log(
        "🔍 Looking for today's record (UTC midnight):",
        today.toISOString()
      );

      const todayRecord = data.find((record) => {
        if (!record.date) {
          console.log("⚠️ Record has no date:", record);
          return false;
        }

        const recordDate = new Date(record.date);
        recordDate.setUTCHours(0, 0, 0, 0);
        const recordTime = recordDate.getTime();

        const isMatch = recordTime === todayTime;
        console.log(
          `  Comparing: ${recordDate.toISOString()} === ${today.toISOString()} → ${isMatch}`
        );

        return isMatch;
      });

      if (todayRecord) {
        console.log("✅ Today's record FOUND:", todayRecord);
        setCurrentStatus(todayRecord);
        setSelectedWorkMode(todayRecord.workMode);
      } else {
        console.log("❌ No record found for today");
        setCurrentStatus(null);
        setSelectedWorkMode(null);
      }

      return data;
    } catch (err) {
      console.error("❌ Error fetching attendance:", err);

      if (err.response?.status === 404) {
        console.log("ℹ️ No attendance records found for this user yet");
        setAttendanceData([]);
        setCurrentStatus(null);
      } else {
        setError("Failed to fetch attendance data");
      }
      return [];
    }
  };

  const handleCheckIn = async () => {
    if (!user.uid) return;

    if (currentStatus?.checkInTime) {
      setError(
        "You have already checked in today. Check-in is only allowed once per day."
      );
      return;
    }

    if (!selectedWorkMode) {
      setError(
        "Please select your work mode (Office or Remote) before checking in."
      );
      return;
    }

    if (!userData.name) {
      setError("Loading user data, please try again...");
      return;
    }

    try {
      setButtonLoading(true);
      setError("");
      setSuccess("");

      console.log("🔵 Sending check-in request...");
      console.log("📝 Using data:", {
        employeeId: user.uid,
        employeeName: userData.name,
        workMode: selectedWorkMode,
      });

      const response = await axios.post(
        "http://localhost:3000/api/attendance/checkin",
        {
          employeeId: user.uid,
          employeeName: userData.name,
          workMode: selectedWorkMode,
        }
      );

      console.log("✅ Check-in response:", response.data);

      if (response.data.success) {
        const attendanceRecord = response.data.attendance;
        console.log("📝 Setting current status to:", attendanceRecord);

        setCurrentStatus(attendanceRecord);
        setSuccess(
          `Check-in successful! Work mode: ${
            selectedWorkMode === "office" ? "Office" : "Remote"
          }`
        );

        setTimeout(async () => {
          console.log("🔄 Refreshing attendance data after check-in...");
          await fetchAttendanceData();
        }, 500);
<<<<<<< HEAD

=======
        
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("❌ Check-in failed:", error);
      console.error("Response data:", error.response?.data);
<<<<<<< HEAD

=======
      
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
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

      console.log("🔴 Sending check-out request...");
      console.log("📝 Current status before checkout:", currentStatus);
<<<<<<< HEAD

      const response = await axios.put(
        "http://localhost:3000/api/attendance/checkout",
        {
          employeeId: user.uid,
        }
      );

=======
      
      const response = await axios.put("http://localhost:3000/api/attendance/checkout", {
        employeeId: user.uid,
      });

>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
      console.log("✅ Check-out response:", response.data);

      if (response.data.success) {
        const attendanceRecord = response.data.attendance;
        console.log("📝 Setting current status to:", attendanceRecord);

        setCurrentStatus(attendanceRecord);
        setSuccess("Check-out successful!");

        setTimeout(async () => {
          console.log("🔄 Refreshing attendance data after check-out...");
          await fetchAttendanceData();
        }, 500);
<<<<<<< HEAD

=======
        
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("❌ Check-out failed:", error);
      console.error("Response data:", error.response?.data);
      setError(error.response?.data?.message || "Check-out failed");
    } finally {
      setButtonLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (currentStatus?.checkInTime && currentStatus?.checkOutTime) {
        console.log("Resetting check-in/out times on logout...");
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
          <p className="text-muted-foreground">
            Track your work hours and attendance
          </p>
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
<<<<<<< HEAD

=======
        
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
        {/* Work Mode Selection */}
        {!currentStatus?.checkInTime && (
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Select Work Mode:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedWorkMode("office")}
                disabled={currentStatus?.checkInTime}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition ${
                  selectedWorkMode === "office"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white hover:border-blue-400"
                } ${
                  currentStatus?.checkInTime
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <Building2 className="w-6 h-6" />
                <span className="font-medium">Office</span>
              </button>

              <button
                onClick={() => setSelectedWorkMode("remote")}
                disabled={currentStatus?.checkInTime}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition ${
                  selectedWorkMode === "remote"
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-gray-300 bg-white hover:border-purple-400"
                } ${
                  currentStatus?.checkInTime
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="font-medium">Remote</span>
              </button>
            </div>
          </div>
        )}

        {/* Current Work Mode Display (when checked in) */}
        {currentStatus?.checkInTime && currentStatus?.workMode && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              {currentStatus.workMode === "office" ? (
                <>
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-700">
                    Working from Office
                  </span>
                </>
              ) : (
                <>
                  <Home className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-700">
                    Working Remotely
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <LogIn className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Check-in Time</p>
              <p className="font-medium">
                {currentStatus?.checkInTime
                  ? formatTime(currentStatus.checkInTime)
                  : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <LogOut className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Check-out Time</p>
              <p className="font-medium">
                {currentStatus?.checkOutTime
                  ? formatTime(currentStatus.checkOutTime)
                  : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Timer className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Hours Today</p>
              <p className="font-medium">
                {currentStatus?.totalHours
                  ? `${currentStatus.totalHours.toFixed(2)} hrs`
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
<<<<<<< HEAD
            disabled={
              buttonLoading ||
              currentStatus?.checkInTime ||
              !userData.name ||
              !selectedWorkMode
            }
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {buttonLoading
              ? "Processing..."
              : !userData.name
              ? "Loading..."
              : !selectedWorkMode
              ? "Select Work Mode"
              : "Check In"}
=======
            disabled={buttonLoading || currentStatus?.checkInTime || !userData.name || !selectedWorkMode}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {buttonLoading ? "Processing..." : !userData.name ? "Loading..." : !selectedWorkMode ? "Select Work Mode" : "Check In"}
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
          </button>
          <button
            onClick={handleCheckOut}
            disabled={
              buttonLoading ||
              !currentStatus?.checkInTime ||
              currentStatus?.checkOutTime
            }
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
                <th className="text-left py-3 px-4 font-medium">Work Mode</th>
<<<<<<< HEAD
                <th className="text-left py-3 px-4 font-medium">
                  Check-in Time
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  Check-out Time
                </th>
=======
                <th className="text-left py-3 px-4 font-medium">Check-in Time</th>
                <th className="text-left py-3 px-4 font-medium">Check-out Time</th>
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
                <th className="text-left py-3 px-4 font-medium">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length === 0 ? (
                <tr>
<<<<<<< HEAD
                  <td
                    colSpan="5"
                    className="text-center py-8 text-muted-foreground"
                  >
=======
                  <td colSpan="5" className="text-center py-8 text-muted-foreground">
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
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
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {record.workMode === "office" ? (
                          <>
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-700 font-medium">
                              Office
                            </span>
                          </>
                        ) : (
                          <>
                            <Home className="w-4 h-4 text-purple-600" />
                            <span className="text-purple-700 font-medium">
                              Remote
                            </span>
                          </>
                        )}
                      </div>
                    </td>
<<<<<<< HEAD
                    <td className="py-3 px-4">
                      {formatTime(record.checkInTime)}
                    </td>
                    <td className="py-3 px-4">
                      {formatTime(record.checkOutTime)}
                    </td>
                    <td className="py-3 px-4">
                      {record.totalHours
                        ? `${record.totalHours.toFixed(2)} hrs`
                        : "-"}
                    </td>
=======
                    <td className="py-3 px-4">{formatTime(record.checkInTime)}</td>
                    <td className="py-3 px-4">{formatTime(record.checkOutTime)}</td>
                    <td className="py-3 px-4">{record.totalHours ? `${record.totalHours.toFixed(2)} hrs` : "-"}</td>
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
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
import { useState, useEffect, useContext, useRef } from "react";
import { Clock, Timer, Calendar, User, LogIn, LogOut, Building2, Home } from "lucide-react";
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
  const [selectedWorkMode, setSelectedWorkMode] = useState(null);
  const hasRun = useRef(false);

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
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
      return {};
    }
  };

  const fetchAttendanceData = async () => {
    try {
      console.log("🔄 Fetching attendance data for user:", user.uid);
      const response = await axios.get(`http://localhost:3000/api/attendance/${user.uid}`);
      const data = response.data.attendance || [];
      console.log("📊 Received attendance data:", data);
      
      setAttendanceData(data);
      
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const todayTime = today.getTime();
      
      console.log("🔍 Looking for today's record (UTC midnight):", today.toISOString());
      
      const todayRecord = data.find(record => {
        if (!record.date) {
          console.log("⚠️ Record has no date:", record);
          return false;
        }
        
        const recordDate = new Date(record.date);
        recordDate.setUTCHours(0, 0, 0, 0);
        const recordTime = recordDate.getTime();
        
        const isMatch = recordTime === todayTime;
        console.log(`  Comparing: ${recordDate.toISOString()} === ${today.toISOString()} → ${isMatch}`);
        
        return isMatch;
      });
      
      if (todayRecord) {
        console.log("✅ Today's record FOUND:", todayRecord);
        setCurrentStatus(todayRecord);
        setSelectedWorkMode(todayRecord.workMode);
      } else {
        console.log("❌ No record found for today");
        setCurrentStatus(null);
        setSelectedWorkMode(null);
      }
      
      return data;
    } catch (err) {
      console.error("❌ Error fetching attendance:", err);
      
      if (err.response?.status === 404) {
        console.log("ℹ️ No attendance records found for this user yet");
        setAttendanceData([]);
        setCurrentStatus(null);
      } else {
        setError("Failed to fetch attendance data");
      }
      return [];
    }
  };

  const handleCheckIn = async () => {
    if (!user.uid) return;
    
    if (currentStatus?.checkInTime) {
      setError("You have already checked in today. Check-in is only allowed once per day.");
      return;
    }

    if (!selectedWorkMode) {
      setError("Please select your work mode (Office or Remote) before checking in.");
      return;
    }

    if (!userData.name) {
      setError("Loading user data, please try again...");
      return;
    }

    try {
      setButtonLoading(true);
      setError("");
      setSuccess("");

      console.log("🔵 Sending check-in request...");
      console.log("📝 Using data:", {
        employeeId: user.uid,
        employeeName: userData.name,
        workMode: selectedWorkMode
      });
      
      const response = await axios.post("http://localhost:3000/api/attendance/checkin", {
        employeeId: user.uid,
        employeeName: userData.name,
        workMode: selectedWorkMode,
      });

      console.log("✅ Check-in response:", response.data);

      if (response.data.success) {
        const attendanceRecord = response.data.attendance;
        console.log("📝 Setting current status to:", attendanceRecord);
        
        setCurrentStatus(attendanceRecord);
        setSuccess(`Check-in successful! Work mode: ${selectedWorkMode === 'office' ? 'Office' : 'Remote'}`);
        
        setTimeout(async () => {
          console.log("🔄 Refreshing attendance data after check-in...");
          await fetchAttendanceData();
        }, 500);
        
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("❌ Check-in failed:", error);
      console.error("Response data:", error.response?.data);
      
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

      console.log("🔴 Sending check-out request...");
      console.log("📝 Current status before checkout:", currentStatus);
      
      const response = await axios.put("http://localhost:3000/api/attendance/checkout", {
        employeeId: user.uid,
      });

      console.log("✅ Check-out response:", response.data);

      if (response.data.success) {
        const attendanceRecord = response.data.attendance;
        console.log("📝 Setting current status to:", attendanceRecord);
        
        setCurrentStatus(attendanceRecord);
        setSuccess("Check-out successful!");
        
        setTimeout(async () => {
          console.log("🔄 Refreshing attendance data after check-out...");
          await fetchAttendanceData();
        }, 500);
        
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("❌ Check-out failed:", error);
      console.error("Response data:", error.response?.data);
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
        
        {/* Work Mode Selection */}
        {!currentStatus?.checkInTime && (
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Select Work Mode:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedWorkMode('office')}
                disabled={currentStatus?.checkInTime}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition ${
                  selectedWorkMode === 'office'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white hover:border-blue-400'
                } ${currentStatus?.checkInTime ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Building2 className="w-6 h-6" />
                <span className="font-medium">Office</span>
              </button>
              
              <button
                onClick={() => setSelectedWorkMode('remote')}
                disabled={currentStatus?.checkInTime}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition ${
                  selectedWorkMode === 'remote'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-300 bg-white hover:border-purple-400'
                } ${currentStatus?.checkInTime ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Home className="w-6 h-6" />
                <span className="font-medium">Remote</span>
              </button>
            </div>
          </div>
        )}

        {/* Current Work Mode Display (when checked in) */}
        {currentStatus?.checkInTime && currentStatus?.workMode && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              {currentStatus.workMode === 'office' ? (
                <>
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-700">Working from Office</span>
                </>
              ) : (
                <>
                  <Home className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-700">Working Remotely</span>
                </>
              )}
            </div>
          </div>
        )}

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
            disabled={buttonLoading || currentStatus?.checkInTime || !userData.name || !selectedWorkMode}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {buttonLoading ? "Processing..." : !userData.name ? "Loading..." : !selectedWorkMode ? "Select Work Mode" : "Check In"}
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
                <th className="text-left py-3 px-4 font-medium">Work Mode</th>
                <th className="text-left py-3 px-4 font-medium">Check-in Time</th>
                <th className="text-left py-3 px-4 font-medium">Check-out Time</th>
                <th className="text-left py-3 px-4 font-medium">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted-foreground">
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
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {record.workMode === 'office' ? (
                          <>
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-700 font-medium">Office</span>
                          </>
                        ) : (
                          <>
                            <Home className="w-4 h-4 text-purple-600" />
                            <span className="text-purple-700 font-medium">Remote</span>
                          </>
                        )}
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
import { useState, useEffect, useContext } from "react";
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
  const [selectedWorkMode, setSelectedWorkMode] = useState(null);
  const hasRun = useRef(false);

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
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
      return {};
    }
  };

  const fetchAttendanceData = async () => {
    try {
      console.log("🔄 Fetching attendance data for user:", user.uid);
      const response = await axios.get(`http://localhost:3000/api/attendance/${user.uid}`);
      const data = response.data.attendance || [];
      console.log("📊 Received attendance data:", data);
      
      setAttendanceData(data);

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const todayTime = today.getTime();
      
      console.log("🔍 Looking for today's record (UTC midnight):", today.toISOString());
      
      const todayRecord = data.find(record => {
        if (!record.date) {
          console.log("⚠️ Record has no date:", record);
          return false;
        }
        
        const recordDate = new Date(record.date);
        recordDate.setUTCHours(0, 0, 0, 0);
        const recordTime = recordDate.getTime();
        
        const isMatch = recordTime === todayTime;
        console.log(`  Comparing: ${recordDate.toISOString()} === ${today.toISOString()} → ${isMatch}`);
        
        return isMatch;
      });
      
      if (todayRecord) {
        console.log("✅ Today's record FOUND:", todayRecord);
        setCurrentStatus(todayRecord);
        setSelectedWorkMode(todayRecord.workMode);
      } else {
        console.log("❌ No record found for today");
        setCurrentStatus(null);
        setSelectedWorkMode(null);
      }
      
      return data;
    } catch (err) {
      console.error("❌ Error fetching attendance:", err);
      
      if (err.response?.status === 404) {
        console.log("ℹ️ No attendance records found for this user yet");
        setAttendanceData([]);
        setCurrentStatus(null);
      } else {
        setError("Failed to fetch attendance data");
      }
      return [];
    }
  };

  const handleCheckIn = async () => {
    if (!user.uid) return;
    
    if (currentStatus?.checkInTime) {
      setError("You have already checked in today. Check-in is only allowed once per day.");
      return;
    }

    if (!selectedWorkMode) {
      setError("Please select your work mode (Office or Remote) before checking in.");
      return;
    }

    if (!userData.name) {
      setError("Loading user data, please try again...");
      return;
    }

    try {
      setButtonLoading(true);
      setError("");
      setSuccess("");

      console.log("🔵 Sending check-in request...");
      console.log("📝 Using data:", {
        employeeId: user.uid,
        employeeName: userData.name,
        workMode: selectedWorkMode
      });
      
      const response = await axios.post("http://localhost:3000/api/attendance/checkin", {
        employeeId: user.uid,
        employeeName: userData.name,
        workMode: selectedWorkMode,
      });

      console.log("✅ Check-in response:", response.data);

      if (response.data.success) {
        const attendanceRecord = response.data.attendance;
        console.log("📝 Setting current status to:", attendanceRecord);
        
        setCurrentStatus(attendanceRecord);
        setSuccess(`Check-in successful! Work mode: ${selectedWorkMode === 'office' ? 'Office' : 'Remote'}`);
        
        setTimeout(async () => {
          console.log("🔄 Refreshing attendance data after check-in...");
          await fetchAttendanceData();
        }, 500);
        
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("❌ Check-in failed:", error);
      console.error("Response data:", error.response?.data);
      
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

      console.log("🔴 Sending check-out request...");
      console.log("📝 Current status before checkout:", currentStatus);
      
      const response = await axios.put("http://localhost:3000/api/attendance/checkout", {
        employeeId: user.uid,
      });

      console.log("✅ Check-out response:", response.data);

      if (response.data.success) {
        const attendanceRecord = response.data.attendance;
        console.log("📝 Setting current status to:", attendanceRecord);
        
        setCurrentStatus(attendanceRecord);
        setSuccess("Check-out successful!");
        
        setTimeout(async () => {
          console.log("🔄 Refreshing attendance data after check-out...");
          await fetchAttendanceData();
        }, 500);
        
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("❌ Check-out failed:", error);
      console.error("Response data:", error.response?.data);
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
        
        {/* Work Mode Selection */}
        {!currentStatus?.checkInTime && (
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Select Work Mode:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedWorkMode('office')}
                disabled={currentStatus?.checkInTime}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition ${
                  selectedWorkMode === 'office'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white hover:border-blue-400'
                } ${currentStatus?.checkInTime ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Building2 className="w-6 h-6" />
                <span className="font-medium">Office</span>
              </button>
              
              <button
                onClick={() => setSelectedWorkMode('remote')}
                disabled={currentStatus?.checkInTime}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition ${
                  selectedWorkMode === 'remote'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-300 bg-white hover:border-purple-400'
                } ${currentStatus?.checkInTime ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Home className="w-6 h-6" />
                <span className="font-medium">Remote</span>
              </button>
            </div>
          </div>
        )}

        {/* Current Work Mode Display (when checked in) */}
        {currentStatus?.checkInTime && currentStatus?.workMode && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              {currentStatus.workMode === 'office' ? (
                <>
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-700">Working from Office</span>
                </>
              ) : (
                <>
                  <Home className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-700">Working Remotely</span>
                </>
              )}
            </div>
          </div>
        )}

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
            disabled={buttonLoading || currentStatus?.checkInTime || !userData.name || !selectedWorkMode}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {buttonLoading ? "Processing..." : !userData.name ? "Loading..." : !selectedWorkMode ? "Select Work Mode" : "Check In"}
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
                <th className="text-left py-3 px-4 font-medium">Work Mode</th>
                <th className="text-left py-3 px-4 font-medium">Check-in Time</th>
                <th className="text-left py-3 px-4 font-medium">Check-out Time</th>
                <th className="text-left py-3 px-4 font-medium">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted-foreground">
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