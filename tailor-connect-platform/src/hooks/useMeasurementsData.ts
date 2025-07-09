
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { measurementsService, MeasurementType, MeasurementSummary } from "@/api/measurementsService";

export function useMeasurementsData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementSummary[]>([]);

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
      }
    };

    fetchMeasurementTypes();
  }, [toast]);

  // Fetch measurements
  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const response = await measurementsService.getUserMeasurements(user.id, "individual");
        if (response.success) {
          setMeasurements(response.measurements);
        }
      } catch (error) {
        console.error("Failed to fetch measurements:", error);
        toast({
          title: "Error",
          description: "Failed to load measurements",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeasurements();
  }, [user, toast]);

  const hasMeasurementForType = (typeId: string) => {
    return measurements.some((m) => m.type_id === typeId);
  };

  return {
    isLoading,
    measurementTypes,
    measurements,
    setMeasurements,
    hasMeasurementForType
  };
}
