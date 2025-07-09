
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { measurementsService, MeasurementType, MeasurementSection, MeasurementSummary } from "@/api/measurementsService";

export function useMeasurements(userId: string | undefined) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementSummary[]>([]);

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

  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const response = await measurementsService.getUserMeasurements(userId, "individual");
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
  }, [userId, toast]);

  return {
    isLoading,
    measurementTypes,
    measurements,
    setMeasurements
  };
}
