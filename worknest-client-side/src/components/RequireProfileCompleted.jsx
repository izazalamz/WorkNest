import axios from "axios";
import { use, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Loading from "./Loading";
import { Navigate } from "react-router";
import BlockedProfile from "./BlockedProfile";

const RequireProfileCompleted = ({ children }) => {
  const { user, loading: authLoading } = use(AuthContext);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

<<<<<<< HEAD
    axios
      .get(`http://localhost:3000/users/${user.uid}`)
      .then((res) => setProfile(res.data.user));
      .get(`http://localhost:3000/api/users/${user.uid}`)
      .then((res) => setProfile(res.data.users));
  }, [user]);
=======
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await axios.get(`http://localhost:3000/users/${user.uid}`);
        setProfile(response.data.users);
        setError(null);
      } catch (err) {
        console.error("Error fetching profile:", err);
        
        // If user doesn't exist, wait a moment and retry (they might be being created)
        if (err.response?.status === 404) {
          setTimeout(async () => {
            try {
              const retryResponse = await axios.get(`http://localhost:3000/users/${user.uid}`);
              setProfile(retryResponse.data.users);
              setError(null);
            } catch (retryErr) {
              setError("Profile not found. Please contact support.");
            }
          }, 1000);
        } else {
          setError("Error loading profile");
        }
      } finally {
        setProfileLoading(false);
      }
    };
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f

  if (!profile) return <Loading />;
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