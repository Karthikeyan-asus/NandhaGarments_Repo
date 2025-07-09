
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageLoader } from "@/components/ui/loader";
import { MeasurementCard } from "@/components/common/MeasurementCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { measurementsService, MeasurementSection } from "@/api/measurementsService";
import { useMeasurements } from "@/hooks/useMeasurements";
import { MeasurementForm } from "@/components/measurements/MeasurementForm";

export default function IndividualMeasurementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isLoading, measurementTypes, measurements, setMeasurements } = useMeasurements(user?.id);
  
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTypeName, setSelectedTypeName] = useState<string>("");
  const [measurementSections, setMeasurementSections] = useState<MeasurementSection[]>([]);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [currentMeasurement, setCurrentMeasurement] = useState<any>(null);

  const handleMeasurementCardClick = async (typeId: string, typeName: string) => {
    setSelectedType(typeId);
    setSelectedTypeName(typeName);
    
    try {
      const sectionsResponse = await measurementsService.getSectionsByType(typeId);
      
      if (sectionsResponse.success) {
        setMeasurementSections(sectionsResponse.sections);
        
        const existingMeasurement = measurements.find(m => m.type_id === typeId);
        
        if (existingMeasurement) {
          setFormMode("edit");
          setCurrentMeasurement(existingMeasurement);
        } else {
          setFormMode("create");
          setCurrentMeasurement(null);
        }
        
        setIsMeasurementDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to load measurement sections:", error);
      toast({
        title: "Error",
        description: "Failed to load measurement form",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (values: Record<string, any>) => {
    if (!user || !selectedType) return;
    
    setIsSubmitting(true);
    try {
      const measurementValues = measurementSections.flatMap((section) => {
        return section.fields.map((field) => {
          const fieldId = `${section.title.replace(/\s+/g, '_').toLowerCase()}_${field.name.replace(/\s+/g, '_').toLowerCase()}`;
          return {
            field_id: field.id,
            value: values[fieldId] || ''
          };
        });
      });
      
      let response;
      
      if (formMode === "create") {
        response = await measurementsService.createMeasurement(
          user.id,
          "individual",
          selectedType,
          measurementValues
        );
      } else if (currentMeasurement) {
        response = await measurementsService.updateMeasurement(
          currentMeasurement.id,
          measurementValues
        );
      }
      
      if (response && response.success) {
        toast({
          title: formMode === "create" ? "Measurements Saved" : "Measurements Updated",
          description: "Your measurements have been successfully saved.",
        });
        
        const updatedResponse = await measurementsService.getUserMeasurements(user.id, "individual");
        if (updatedResponse.success) {
          setMeasurements(updatedResponse.measurements);
        }
        
        setIsMeasurementDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to save measurements:", error);
      toast({
        title: "Error",
        description: "Failed to save measurements",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasMeasurementForType = (typeId: string) => {
    return measurements.some((m) => m.type_id === typeId);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageLoader text="Loading your measurements..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">My Measurements</h1>
          <p className="text-gray-600">
            Select a measurement type to view or update your measurements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {measurementTypes.map((type) => (
            <MeasurementCard
              key={type.id}
              type={type.name.toLowerCase().replace(/\s+/g, '_')}
              onClick={() => handleMeasurementCardClick(type.id, type.name)}
              hasExistingData={hasMeasurementForType(type.id)}
              customTitle={type.name}
              description={type.description}
            />
          ))}
        </div>
      </div>

      <Dialog open={isMeasurementDialogOpen} onOpenChange={setIsMeasurementDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create"
                ? `New ${selectedTypeName} Measurements`
                : `Edit ${selectedTypeName} Measurements`}
            </DialogTitle>
          </DialogHeader>
          
          <MeasurementForm
            measurementSections={measurementSections}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsMeasurementDialogOpen(false)}
            isSubmitting={isSubmitting}
            formMode={formMode}
            currentMeasurement={currentMeasurement}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
