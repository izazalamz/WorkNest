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

    axios
      .get(`http://localhost:3000/users/${user.uid}`)
      .then((res) => setProfile(res.data.user));
      .get(`http://localhost:3000/api/users/${user.uid}`)
      .then((res) => setProfile(res.data.users));
  }, [user]);

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