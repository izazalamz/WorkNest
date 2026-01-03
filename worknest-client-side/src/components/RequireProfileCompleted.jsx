import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Loading from "./Loading";
import { Navigate } from "react-router";
import BlockedProfile from "./BlockedProfile";

const RequireProfileCompleted = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    axios
      .get(`http://localhost:3000/users/${user.uid}`)
      .then((res) => {
        setProfile(res.data.user);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching user profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  if (loading) return <Loading />;
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <p className="text-gray-600">Please refresh the page or contact support.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User profile not found.</p>
          <p className="text-gray-500">Please complete your profile setup.</p>
        </div>
      </div>
    );
  }

  console.log("this is profile", profile);

  if (!profile.profileCompleted) {
    return <Navigate to="/complete-profile" />;
  }

  // Show blocked screen if user is not active
  if (!profile.isActive) {
    return <BlockedProfile />;
  }

  // All checks passed, render children
  return children;
};

export default RequireProfileCompleted;
