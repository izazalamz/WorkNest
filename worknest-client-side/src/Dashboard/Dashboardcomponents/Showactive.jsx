import { useState, useEffect } from "react";
import { Users, Clock, CheckCircle, XCircle, RefreshCw, User, Building2, Home } from "lucide-react";

export default function ShowActive() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchActiveUsers();
    
    const interval = setInterval(() => {
      fetchActiveUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/attendance/active-today");
      
      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setActiveUsers(data.data);
        setLastUpdated(new Date());
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch active users:", err);
      setError(err.message || "Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const formatActiveTime = (hours) => {
    if (!hours || hours <= 0) return "-";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const activeCount = activeUsers.filter(u => u.isActive).length;
  const checkedOutCount = activeUsers.filter(u => u.status === 'checked_out').length;
  const officeCount = activeUsers.filter(u => u.workMode === 'office').length;
  const remoteCount = activeUsers.filter(u => u.workMode === 'remote').length;

  if (loading && activeUsers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Status</h1>
            <p className="text-gray-600">Monitor today's attendance in real-time</p>
          </div>
        </div>
        
        <button
          onClick={fetchActiveUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Currently Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <XCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Checked Out</p>
              <p className="text-2xl font-bold text-gray-900">{checkedOutCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Office</p>
              <p className="text-2xl font-bold text-gray-900">{officeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Remote</p>
              <p className="text-2xl font-bold text-gray-900">{remoteCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Active Users List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Today's Attendance</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Employee</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Work Mode</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Check-in</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Check-out</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Active Time</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No attendance records for today</p>
                  </td>
                </tr>
              ) : (
                activeUsers.map((user, index) => (
                  <tr 
                    key={user.employeeId} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.employeeName}</p>
                          <p className="text-sm text-gray-500">{user.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : user.status === 'checked_out' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                          <XCircle className="w-4 h-4" />
                          Checked Out
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {user.workMode === 'office' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          <Building2 className="w-4 h-4" />
                          Office
                        </span>
                      ) : user.workMode === 'remote' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          <Home className="w-4 h-4" />
                          Remote
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {formatTime(user.checkInTime)}
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {formatTime(user.checkOutTime)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">
                        {formatActiveTime(user.totalHours)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}