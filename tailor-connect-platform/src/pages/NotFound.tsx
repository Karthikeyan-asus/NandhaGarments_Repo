
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-7xl font-display font-bold text-gray-900 mb-4">404</h1>
        <div className="w-16 h-1 bg-primary mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          We couldn't find the page you're looking for. The page might have been removed or the URL might be incorrect.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/">Go to Homepage</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login-type">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
