import { use, useState } from "react";
import { Eye, EyeOff, CheckCircle, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

const SignUp = () => {
  const { createUser, updateUser, googleSignIn } = use(AuthContext);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    agreeToTerms: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError("");
  };

  const passwordRequirements = [
    { text: "At least 6 characters", met: formData.password.length >= 6 },
    { text: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "One number", met: /[0-9]/.test(formData.password) },
    {
      text: "One special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    const isPasswordValid = passwordRequirements.every((req) => req.met);
    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create user in Firebase
      const userCredential = await createUser(
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Check if user exists in MongoDB (404 is expected for new users)
      let userExists = false;
      try {
        const res = await axios.get(`http://localhost:3000/users/${user.uid}`);
        if (res.data.user) {
          userExists = true;
        }
      } catch (err) {
        // 404 is expected for new users - this means they don't exist yet
        if (err.response?.status === 404) {
          userExists = false;
        } else {
          // Only throw if it's a different error
          console.error("Error checking user:", err);
          throw err;
        }
      }

      if (!userExists) {
        // First time signup - create user in MongoDB
        const createResponse = await axios.post("http://localhost:3000/users", {
          uid: user.uid,
          email: user.email,
          name: "",
          profileCompleted: false,
        });

        // Check if user was created successfully
        if (createResponse.data.success) {
          setEmailSent(true);
          showNotification(
            "🎉 Account created! Check your email for confirmation.",
            "success"
          );

          // Navigate after short delay to show the success message
          setTimeout(() => {
            navigate("/complete-profile");
          }, 2000);
        } else {
          throw new Error("Failed to create user");
        }
      } else {
        // User already exists
        const userData = createResponse.data.user;
        if (!userData.profileCompleted) {
          navigate("/complete-profile");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Signup error:", error);

      let errorMessage = "Signup failed. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Please login instead.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await googleSignIn();
      const user = result.user;

      // Check if user exists
      let userExists = false;
      let userData = null;
      try {
        const res = await axios.get(`http://localhost:3000/users/${user.uid}`);
        if (res.data.user) {
          userExists = true;
          userData = res.data.user;
        }
      } catch (err) {
        // 404 is expected for new users
        if (err.response?.status === 404) {
          userExists = false;
        } else {
          console.error("Error checking user:", err);
          throw err;
        }
      }

      if (!userExists) {
        // Create new user
        const createResponse = await axios.post("http://localhost:3000/users", {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "",
          photoURL: user.photoURL,
          profileCompleted: false,
        });

        if (createResponse.data.success) {
          showNotification(
            "🎉 Account created with Google! Check your email.",
            "success"
          );

          setTimeout(() => {
            navigate("/complete-profile");
          }, 2000);
        }
      } else {
        // User exists, navigate based on profile completion
        userData.profileCompleted
          ? navigate("/dashboard")
          : navigate("/complete-profile");
      }
    } catch (error) {
      console.error("Google login error:", error);
      showNotification("Google login failed. Please try again.", "error");
    }
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      formData.name &&
      formData.agreeToTerms &&
      passwordRequirements.every((req) => req.met)
    );
  };

  return (
    <section className="fix-alignment">
      <div className="relative flex w-full flex-col overflow-x-hidden bg-background">
        <div className="layout-container flex grow flex-col">
          <main className="flex-grow">
            <div className="flex min-h-screen">
              {/* Left Column: Image and Branding */}
              <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-muted">
                <div
                  className="absolute inset-0 w-full bg-center bg-no-repeat bg-cover"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCx_VNueuJYIboq53Ae-LLQdRiJ6XahPv-g8lxT4vPHf6XUKZnX7DWqmpwOH-yFi2hA9nGaEE4akPPJbQavwnic8vJ09Z4t-mSF4Xxdynz0Qbe0_-mFK5zoPXHjnpoCIiGXPkd2M8jZ2f_9XghVGMqRSTXCJQEag_59agSB2D-JF8T7PpLrMzFXWTaK3TKF2Zej9Yb88Ic_RRVjN8czgUsgPorWG64jdeCg1hxPQM9SD-_VzSKd2xbIIuAAdr4tuYAD2SzHD5YhsLbr')`,
                  }}
                ></div>
              </div>

              {/* Right Column: Sign Up Form */}
              <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                  {/* Success Message */}
                  {emailSent && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-green-800 text-sm font-medium">
                          Welcome email sent!
                        </p>
                        <p className="text-green-600 text-xs mt-1">
                          Check your inbox at {formData.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
                      <p className="text-error text-sm">{error}</p>
                    </div>
                  )}

                  <h1 className="text-foreground text-3xl font-bold text-left pb-3">
                    Create Your Account
                  </h1>
                  <p className="text-muted-foreground text-base font-normal pb-8">
                    Join WorkNest and transform your hybrid workspace management.
                  </p>

                  <form onSubmit={handleSubmit}>
                    {/* Name Field */}
                    <div className="flex w-full flex-wrap items-end gap-4 pb-4">
                      <label className="flex flex-col min-w-40 flex-1 w-full">
                        <p className="text-foreground text-base font-medium leading-normal pb-2">
                          Full Name
                        </p>
                        <input
                          className="rounded-lg text-foreground outline-primary/50 bg-card h-14 placeholder:text-muted-foreground p-[15px] text-base border border-border focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-colors duration-200"
                          placeholder="Enter your full name"
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          required
                        />
                      </label>
                    </div>

                    {/* Email Field */}
                    <div className="flex w-full flex-wrap items-end gap-4 pb-4">
                      <label className="flex flex-col min-w-40 flex-1 w-full">
                        <p className="text-foreground text-base font-medium leading-normal pb-2">
                          Work Email
                        </p>
                        <input
                          className="rounded-lg text-foreground outline-primary/50 bg-card h-14 placeholder:text-muted-foreground p-[15px] text-base border border-border focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-colors duration-200"
                          placeholder="Enter your work email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          required
                        />
                      </label>
                    </div>

                    {/* Password Field */}
                    <div className="flex w-full flex-wrap items-end gap-4 pb-4">
                      <label className="flex flex-col min-w-40 flex-1 w-full">
                        <div className="flex justify-between items-center pb-2">
                          <p className="text-foreground text-base font-medium leading-normal">
                            Password
                          </p>
                        </div>
                        <div className="flex w-full flex-1 items-stretch rounded-lg">
                          <input
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 bg-card h-14 placeholder:text-muted-foreground p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal rounded-l-lg border border-border transition-colors duration-200"
                            placeholder="Create a password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) =>
                              handleInputChange("password", e.target.value)
                            }
                            required
                          />
                          <button
                            className="text-muted-foreground hover:text-foreground flex border border-l-0 border-border bg-card items-center justify-center px-4 rounded-r-lg transition-colors duration-200"
                            onClick={() => setShowPassword(!showPassword)}
                            type="button"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </label>
                    </div>

                    {/* Password Requirements */}
                    {formData.password && (
                      <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="text-sm font-medium text-foreground mb-2">
                          Password requirements:
                        </p>
                        <div className="space-y-1">
                          {passwordRequirements.map((req, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                  req.met
                                    ? "bg-secondary"
                                    : "bg-muted-foreground/20"
                                }`}
                              >
                                {req.met && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span
                                className={`text-xs ${
                                  req.met
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {req.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-3 mb-6">
                      <input
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={(e) =>
                          handleInputChange("agreeToTerms", e.target.checked)
                        }
                        className="mt-1 rounded border-border text-primary focus:ring-primary/50"
                        required
                      />
                      <label className="text-sm text-muted-foreground">
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-primary hover:underline">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    {/* Sign Up Button */}
                    <button
                      type="submit"
                      className={`w-full font-semibold py-4 rounded-lg transition-colors duration-200 mt-2 h-14 shadow-md hover:shadow-xl flex items-center justify-center ${
                        isFormValid() && !loading
                          ? "bg-primary text-primary-foreground hover:bg-primary-hover cursor-pointer"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                      disabled={!isFormValid() || loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                    <div className="divider text-lg text-foreground/60 my-4">
                      Or
                    </div>
                    <button
                      onClick={handleGoogleLogin}
                      type="button"
                      className="w-full font-semibold py-4 rounded-lg transition-colors duration-200 mt-2 h-14 shadow-lg hover:shadow-xl flex gap-2 items-center justify-center"
                    >
                      <svg
                        version="1.1"
                        height={20}
                        width={20}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                      >
                        <g>
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          ></path>
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          ></path>
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          ></path>
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          ></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </g>
                      </svg>
                      Sign Up with Google
                    </button>
                  </form>

                  {/* Sign In Link */}
                  <div className="mt-8 text-center">
                    <p className="text-base text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        className="font-medium text-primary hover:underline cursor-pointer transition-colors duration-200"
                        to={"/login"}
                      >
                        Sign In
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default SignUp;