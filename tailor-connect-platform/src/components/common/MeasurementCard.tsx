
import { Card, CardContent } from "@/components/ui/card";
import { Ruler, Check } from "lucide-react";

interface MeasurementCardProps {
  type: "school_uniform" | "sports_wear" | "corporate_wear" | "casual_wear" | string;
  onClick: () => void;
  hasExistingData?: boolean;
  customTitle?: string;
  description?: string; // Added this property
}

export function MeasurementCard({ 
  type, 
  onClick, 
  hasExistingData = false,
  customTitle,
  description
}: MeasurementCardProps) {
  // Card styling based on type
  const getCardStyle = () => {
    switch (type) {
      case "school_uniform":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
      case "sports_wear":
        return "bg-green-50 border-green-200 hover:bg-green-100";
      case "corporate_wear":
        return "bg-purple-50 border-purple-200 hover:bg-purple-100";
      case "casual_wear":
        return "bg-orange-50 border-orange-200 hover:bg-orange-100";
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  // Icon styling based on type
  const getIconStyle = () => {
    switch (type) {
      case "school_uniform":
        return "text-blue-600";
      case "sports_wear":
        return "text-green-600";
      case "corporate_wear":
        return "text-purple-600";
      case "casual_wear":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  // Title formatting
  const getTitle = () => {
    if (customTitle) return customTitle;
    
    return type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card 
      className={`cursor-pointer border ${getCardStyle()} transition-colors duration-300`}
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center">
        <div className={`rounded-full p-3 mr-4 ${getIconStyle()}`}>
          <Ruler className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-lg">{getTitle()}</h3>
          {description ? (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              {hasExistingData ? "View or edit your measurements" : "Add your measurements"}
            </p>
          )}
        </div>
        {hasExistingData && (
          <div className="bg-green-100 rounded-full p-1">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
