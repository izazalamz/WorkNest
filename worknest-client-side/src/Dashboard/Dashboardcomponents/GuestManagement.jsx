import { useState, useEffect, use } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Building2,
  Phone,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";

const GuestManagement = () => {
  const { user } = use(AuthContext);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch guests
  const fetchGuests = async () => {
    setLoading(true);
    try {
      const endpoint =
        filterStatus === "all"
          ? "http://localhost:3000/api/guest/admin/all"
          : `http://localhost:3000/api/guest/admin/all?status=${filterStatus}`;

      const response = await axios.get(endpoint);

      if (response.data.success) {
        setGuests(response.data.guests);
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      toast.error("Failed to fetch guest requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [filterStatus]);

  // Approve guest
  const handleApprove = async (guestId) => {
    if (
      !window.confirm("Are you sure you want to approve this guest request?")
    ) {
      return;
    }

    setActionLoading(guestId);
    try {
      const response = await axios.patch(
        `http://localhost:3000/api/guest/admin/${guestId}/approve`,
        { adminId: user?.uid }
      );

      if (response.data.success) {
        toast.success("Guest request approved! Email sent.");
        fetchGuests();
      }
    } catch (error) {
      console.error("Error approving guest:", error);
      toast.error(error.response?.data?.message || "Failed to approve guest");
    } finally {
      setActionLoading(null);
    }
  };

  // Reject guest
  const handleReject = async (guestId) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    if (reason === null) return; // User cancelled

    setActionLoading(guestId);
    try {
      const response = await axios.patch(
        `http://localhost:3000/api/guest/admin/${guestId}/reject`,
        {
          adminId: user?.uid,
          rejectionReason: reason || "Not specified",
        }
      );

      if (response.data.success) {
        toast.success("Guest request rejected. Email sent.");
        fetchGuests();
      }
    } catch (error) {
      console.error("Error rejecting guest:", error);
      toast.error(error.response?.data?.message || "Failed to reject guest");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter guests by search term
  const filteredGuests = guests.filter(
    (guest) =>
      guest.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (guest.company &&
        guest.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color: "bg-yellow-100 text-yellow-700",
        icon: Clock,
        label: "Pending",
      },
      approved: {
        color: "bg-green-100 text-green-700",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-700",
        icon: XCircle,
        label: "Rejected",
      },
      checked_in: {
        color: "bg-blue-100 text-blue-700",
        icon: CheckCircle,
        label: "Active",
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.color}`}
      >
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  // Get stats
  const stats = {
    pending: guests.filter((g) => g.status === "pending").length,
    approved: guests.filter((g) => g.status === "approved").length,
    rejected: guests.filter((g) => g.status === "rejected").length,
    active: guests.filter((g) => g.status === "checked_in").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Guest Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage guest access requests and demo users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pending}
          color="text-yellow-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Approved"
          value={stats.approved}
          color="text-green-600"
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={stats.rejected}
          color="text-red-600"
        />
        <StatCard
          icon={Users}
          label="Active"
          value={stats.active}
          color="text-blue-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="checked_in">Active</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guest List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <Loading />
        ) : filteredGuests.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No guest requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Guest Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredGuests.map((guest) => (
                  <tr key={guest._id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {guest.fullName}
                        </p>
                        {guest.company && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {guest.company}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {guest.email}
                        </p>
                        {guest.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {guest.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(guest.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(guest.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {guest.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(guest._id)}
                            disabled={actionLoading === guest._id}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {actionLoading === guest._id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleReject(guest._id)}
                            disabled={actionLoading === guest._id}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {actionLoading === guest._id ? "..." : "Reject"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestManagement;

/* ---------------- Components ---------------- */

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 bg-primary/10 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);
