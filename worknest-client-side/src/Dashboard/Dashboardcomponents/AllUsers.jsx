import { useEffect, useState } from "react";
import axios from "axios";
import { Shield, User, Trash2, Ban, CheckCircle, Loader2 } from "lucide-react";
import Loading from "../../components/Loading";
import Swal from "sweetalert2";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // toggle block/unblock
  const toggleBlockUser = async (uid, isActive) => {
    try {
      await axios.put(`http://localhost:3000/users/${uid}`, {
        isActive: !isActive,
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // change role
  const changeRole = async (uid, role) => {
    try {
      await axios.put(`http://localhost:3000/users/${uid}`, {
        role: role === "admin" ? "employee" : "admin",
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // delete user
  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(`http://localhost:3000/users/${id}`);

      if (res.data.success) {
        Swal.fire("Deleted!", "User has been deleted.", "success");
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Failed to delete user.", "error");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Users</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and access permissions
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-card border border-border rounded-xl shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-t border-border hover:bg-muted/30 transition"
              >
                {/* User */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      {!user.photoURL ? (
                        <User className="w-4 h-4 text-primary" />
                      ) : (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="w-9 h-9 rounded-full"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Company */}
                <td className="px-5 py-4 text-muted-foreground">
                  {user.companyName || "-"}
                </td>

                {/* Role */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  {user.isActive ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
                      <Ban className="w-3 h-3" />
                      Blocked
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    {/* Change Role */}
                    <button
                      onClick={() => changeRole(user.uid, user.role)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted transition"
                    >
                      Make {user.role === "admin" ? "Employee" : "Admin"}
                    </button>

                    {/* Block / Unblock */}
                    <button
                      onClick={() => toggleBlockUser(user.uid, user.isActive)}
                      className={`px-3 py-1.5 text-xs rounded-lg ${
                        user.isActive
                          ? "bg-error/10 text-error hover:bg-error/20"
                          : "bg-success/10 text-success hover:bg-success/20"
                      }`}
                    >
                      {user.isActive ? "Block" : "Unblock"}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="px-2 py-1.5 rounded-lg text-error hover:bg-error/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-10 text-muted-foreground"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AllUsers;
