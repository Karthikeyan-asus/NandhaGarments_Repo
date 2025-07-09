
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loader";
import { MeasurementCard } from "@/components/common/MeasurementCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { 
  measurementsService, 
  MeasurementSection, 
  MeasurementSummary,
  MeasurementType 
} from "@/api/measurementsService";
import { usersService, OrgUserResponse } from "@/api/usersService";
import { ArrowLeft } from "lucide-react";

// Dynamic schema generation based on measurement sections
const createMeasurementSchema = (sections: MeasurementSection[]) => {
  const schemaFields: Record<string, any> = {};
  
  sections.forEach((section) => {
    section.fields.forEach((field) => {
      const fieldId = `${section.title.replace(/\s+/g, '_').toLowerCase()}_${field.name.replace(/\s+/g, '_').toLowerCase()}`;
      schemaFields[fieldId] = z.string().optional();
    });
  });
  
  return z.object(schemaFields);
};

export default function OrgUserMeasurementsPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<OrgUserResponse | null>(null);
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementSummary[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTypeName, setSelectedTypeName] = useState<string>("");
  const [measurementSections, setMeasurementSections] = useState<MeasurementSection[]>([]);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [currentMeasurement, setCurrentMeasurement] = useState<MeasurementSummary | null>(null);

  // Create form with dynamic schema
  const form = useForm<Record<string, any>>({
    resolver: zodResolver(createMeasurementSchema(measurementSections)),
    defaultValues: {},
  });

  // Redirect if not org_admin
  useEffect(() => {
    if (user && user.role !== 'org_admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch employee details
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!userId || !user || !user.orgId) return;
      
      try {
        const response = await usersService.getOrgUsersByOrg(user.orgId);
        if (response.success) {
          const foundEmployee = response.users.find(u => u.id === userId);
          if (foundEmployee) {
            setEmployee(foundEmployee);
          } else {
            toast({
              title: "Error",
              description: "Employee not found",
              variant: "destructive",
            });
            navigate("/org-users");
          }
        }
      } catch (error) {
        console.error("Failed to fetch employee:", error);
        toast({
          title: "Error",
          description: "Failed to load employee data",
          variant: "destructive",
        });
        navigate("/org-users");
      }
    };

    fetchEmployee();
  }, [userId, user, navigate, toast]);

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

  // Fetch employee measurements
  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const response = await measurementsService.getUserMeasurements(userId, "org_user");
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

  // Reset form when measurement sections change
  useEffect(() => {
    if (measurementSections.length > 0) {
      const defaultValues: Record<string, string> = {};
      
      if (formMode === "edit" && currentMeasurement) {
        // Populate form with existing measurement data
        measurementSections.forEach((section) => {
          section.fields.forEach((field) => {
            const fieldId = `${section.title.replace(/\s+/g, '_').toLowerCase()}_${field.name.replace(/\s+/g, '_').toLowerCase()}`;
            
            // Find matching value for this field
            const matchingValue = currentMeasurement.values.find(
              v => v.field_id === field.id || v.field_name === field.name
            );
            
            defaultValues[fieldId] = matchingValue?.value || "";
          });
        });
      } else {
        // Empty form for new measurements
        measurementSections.forEach((section) => {
          section.fields.forEach((field) => {
            const fieldId = `${section.title.replace(/\s+/g, '_').toLowerCase()}_${field.name.replace(/\s+/g, '_').toLowerCase()}`;
            defaultValues[fieldId] = "";
          });
        });
      }
      
      form.reset(defaultValues);
    }
  }, [measurementSections, formMode, currentMeasurement, form]);

  const handleMeasurementCardClick = async (typeId: string, typeName: string) => {
    setSelectedType(typeId);
    setSelectedTypeName(typeName);
    
    try {
      // Get measurement sections for this type
      const sectionsResponse = await measurementsService.getSectionsByType(typeId);
      
      if (sectionsResponse.success) {
        setMeasurementSections(sectionsResponse.sections);
        
        // Check if we already have measurements for this type
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

  const handleFormSubmit = (values: Record<string, any>) => {
    setIsSubmitting(true);
    setIsConfirmDialogOpen(true);
  };

  const confirmSaveMeasurements = async () => {
    if (!userId || !selectedType) return;
    
    try {
      // Process form data into the measurement structure
      const measurementValues = measurementSections.flatMap((section) => {
        return section.fields.map((field) => {
          const fieldId = `${section.title.replace(/\s+/g, '_').toLowerCase()}_${field.name.replace(/\s+/g, '_').toLowerCase()}`;
          return {
            field_id: field.id,
            value: form.getValues(fieldId) || ''
          };
        });
      });
      
      let response;
      
      if (formMode === "create") {
        // Create new measurement
        response = await measurementsService.createMeasurement(
          userId,
          "org_user",
          selectedType,
          measurementValues
        );
      } else if (currentMeasurement) {
        // Update existing measurement
        response = await measurementsService.updateMeasurement(
          currentMeasurement.id,
          measurementValues
        );
      }
      
      if (response && response.success) {
        toast({
          title: formMode === "create" ? "Measurements Saved" : "Measurements Updated",
          description: "The measurements have been successfully saved.",
        });
        
        // Refresh measurements data
        const updatedResponse = await measurementsService.getUserMeasurements(userId, "org_user");
        if (updatedResponse.success) {
          setMeasurements(updatedResponse.measurements);
        }
        
        setIsMeasurementDialogOpen(false);
        setIsConfirmDialogOpen(false);
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

  if (isLoading || !employee) {
    return (
      <MainLayout>
        <PageLoader text="Loading measurements..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary flex items-center"
          onClick={() => navigate("/org-users")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employee List
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Measurements for {employee.name}</h1>
          <p className="text-gray-600">
            Select a measurement type to view or update measurements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {measurementTypes.map((type) => (
            <MeasurementCard
              key={type.id}
              type={type.name.toLowerCase().replace(/\s+/g, '_') as any}
              onClick={() => handleMeasurementCardClick(type.id, type.name)}
              hasExistingData={hasMeasurementForType(type.id)}
              customTitle={type.name}
            />
          ))}
        </div>
      </div>

      {/* Measurement Form Dialog */}
      <Dialog open={isMeasurementDialogOpen} onOpenChange={setIsMeasurementDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create"
                ? `New ${selectedTypeName} Measurements`
                : `Edit ${selectedTypeName} Measurements`}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              <Tabs defaultValue={measurementSections[0]?.title.toLowerCase().replace(/\s+/g, '-')}>
                <TabsList className="flex flex-wrap w-full">
                  {measurementSections.map((section) => (
                    <TabsTrigger
                      key={section.id}
                      value={section.title.toLowerCase().replace(/\s+/g, '-')}
                      className="flex-1"
                    >
                      {section.title}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {measurementSections.map((section) => (
                  <TabsContent
                    key={section.id}
                    value={section.title.toLowerCase().replace(/\s+/g, '-')}
                    className="pt-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.fields.map((field) => {
                        const fieldId = `${section.title.replace(/\s+/g, '_').toLowerCase()}_${field.name.replace(/\s+/g, '_').toLowerCase()}`;
                        
                        return (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name={fieldId}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel>
                                  {field.name}
                                  <span className="text-gray-500 text-sm ml-1">({field.unit})</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={`Enter ${field.name.toLowerCase()}`}
                                    {...formField}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMeasurementDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {formMode === "create" ? "Save Measurements" : "Update Measurements"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={confirmSaveMeasurements}
        title="Save Measurements"
        description="Are you sure you want to save these measurements? This will be used for future orders."
        confirmLabel="Save"
        cancelLabel="Cancel"
        isLoading={isSubmitting}
      />
    </MainLayout>
  );
}
