import axios from "axios";
import { use, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Loading from "./Loading";
import { Navigate } from "react-router";
import BlockedProfile from "./BlockedProfile";

const RequireProfileCompleted = ({ children }) => {
  const { user } = use(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;

    axios
      .get(`http://localhost:3000/users/${user.uid}`)
      .then((res) => setProfile(res.data.user));
  }, [user]);

  if (!profile) return <Loading />;
  console.log("this is profile", profile);

  if (!profile.profileCompleted) {
    return <Navigate to="/complete-profile" />;
  }
  if (!profile.isActive) {
    return <BlockedProfile />;
  }

  return children;
};

export default RequireProfileCompleted;
