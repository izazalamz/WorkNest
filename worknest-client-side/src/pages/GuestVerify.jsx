import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import axios from "axios";

const GuestVerify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [guestData, setGuestData] = useState(null);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/guest/verify/${token}`
        );

        if (response.data.success) {
          setStatus("success");
          setGuestData(response.data.guest);
          
          // Store guest info in session storage
          sessionStorage.setItem("guestMode", "true");
          sessionStorage.setItem("guestData", JSON.stringify(response.data.guest));
        }
      } catch (err) {
        console.error("Error verifying token:", err);
        setStatus("error");
        setError(
          err.response?.data?.message || "Invalid or expired access token"
        );
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus("error");
      setError("No access token provided");
    }
  }, [token]);

  // Countdown and redirect on success
  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (status === "success" && countdown === 0) {
      navigate("/demo-dashboard");
    }
  }, [status, countdown, navigate]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-12 shadow-xl text-center max-w-md w-full">
          <Loader className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Verifying Access
          </h1>
          <p className="text-muted-foreground">
            Please wait while we verify your guest access token...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-12 shadow-xl text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Access Denied
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {error}
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">
              Your access token may have expired or is invalid. Please request a new guest access.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/guest-request")}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Request New Access
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-12 shadow-xl text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Access Verified! 🎉
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Welcome, <strong>{guestData?.fullName}</strong>!
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              You're being redirected to the demo dashboard in
            </p>
            <p className="text-4xl font-bold text-primary">
              {countdown}
            </p>
          </div>

          <button
            onClick={() => navigate("/demo-dashboard")}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Go to Demo Dashboard Now
          </button>

          {guestData?.accessExpiresAt && (
            <p className="text-xs text-muted-foreground mt-4">
              Your access expires: {new Date(guestData.accessExpiresAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default GuestVerify;