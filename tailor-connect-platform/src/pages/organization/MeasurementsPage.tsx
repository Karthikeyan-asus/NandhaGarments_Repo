
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loader";
import { MeasurementCard } from "@/components/common/MeasurementCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { measurementsService } from "@/api/measurementsService";

interface MeasurementType {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function OrganizationMeasurementsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);

  // Fetch measurement types
  useEffect(() => {
    const fetchMeasurementTypes = async () => {
      try {
        const response = await measurementsService.getAllTypes();
        if (response.success) {
          setMeasurementTypes(response.types);
        }
      } catch (error) {
        console.error("Failed to fetch measurement types:", error);
        toast({
          title: "Error",
          description: "Failed to load measurement types",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeasurementTypes();
  }, [toast]);

  const handleTypeSelect = (typeId: string) => {
    navigate(`/organization/measurements/${typeId}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageLoader text="Loading measurement types..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Employee Measurements
          </h1>
          <p className="text-gray-600">
            Select a measurement type to manage employee measurements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {measurementTypes.map((type) => (
            <MeasurementCard
              key={type.id}
              type={type.name.toLowerCase().replace(/\s+/g, '_') as any}
              onClick={() => handleTypeSelect(type.id)}
              customTitle={type.name}
              description={type.description}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
