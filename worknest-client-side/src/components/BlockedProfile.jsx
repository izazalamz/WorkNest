import {
  ShieldAlert,
  Mail,
  UserX,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router";

const BlockedProfile = () => {
  const adminEmail = "admin@worknest.com";
  const supportEmail = "support@worknest.com";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          {/* Icon Container */}
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 rounded-full bg-error/10 flex items-center justify-center">
              <ShieldAlert className="w-16 h-16 text-error" />
            </div>
            <div className="absolute -top-2 -right-2 animate-pulse">
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Account Restricted
          </h1>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Your profile has been temporarily blocked. Please contact your
            administrator to resolve this issue.
          </p>

          {/* Details Card */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4 mb-6">
              <UserX className="w-6 h-6 text-muted-foreground mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-medium text-foreground mb-2">
                  Possible Reasons
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5"></div>
                    <span>Company policy violation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5"></div>
                    <span>Suspicious activity detected</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5"></div>
                    <span>Account review in progress</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5"></div>
                    <span>Access rights modification</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    Contact Administrator
                  </p>
                  <a
                    href={`mailto:${adminEmail}`}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    {adminEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <a
              href={`mailto:${adminEmail}?subject=Account Blocked - Access Request&body=Hello, my account has been blocked. Please review my access.`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Contact Admin Now
            </a>

            <a
              href={`mailto:${supportEmail}?subject=Blocked Account Support`}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Contact Support
            </a>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-3 text-foreground/80 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Homepage
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground text-center">
              Response time: Typically within 24 hours during business days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedProfile;
