
import { useState } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function LoginTypePage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleCardClick = (type: string) => {
    switch (type) {
      case "business":
        navigate("/login/business");
        break;
      case "individual":
        navigate("/login/individual");
        break;
      case "super-admin":
        navigate("/super-admin/login");
        break;
      default:
        break;
    }
  };

  return (
    <AuthLayout
      title="Welcome to NandhaGarments"
      description="Please select your account type to continue"
    >
      <div className="grid gap-6 mt-8">
        <Card
          className={cn(
            "cursor-pointer border-2 transition-all duration-300 transform card-hover",
            hoveredCard === "business" ? "border-primary scale-105" : ""
          )}
          onClick={() => handleCardClick("business")}
          onMouseEnter={() => setHoveredCard("business")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M20 7h-9m9 7h-9m9 7h-9M4 7l3 3 3-3M4 17l3 3 3-3"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Business (B2B)</h3>
                <p className="text-sm text-gray-600">
                  For organizations and corporate accounts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer border-2 transition-all duration-300 transform card-hover",
            hoveredCard === "individual" ? "border-primary scale-105" : ""
          )}
          onClick={() => handleCardClick("individual")}
          onMouseEnter={() => setHoveredCard("individual")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-green-600"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Individual</h3>
                <p className="text-sm text-gray-600">
                  For personal accounts and individual customers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4 text-sm text-gray-600">
          <span>Super Admin?</span>{" "}
          <button
            onClick={() => handleCardClick("super-admin")}
            className="text-primary font-medium hover:underline"
          >
            Click here
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
