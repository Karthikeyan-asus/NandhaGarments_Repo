
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MeasurementSection, MeasurementSummary } from "@/api/measurementsService";

interface MeasurementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedType: string | null;
  selectedTypeName: string;
  measurementSections: MeasurementSection[];
  formMode: "create" | "edit";
  currentMeasurement: MeasurementSummary | null;
  isConfirmDialogOpen: boolean;
  setIsConfirmDialogOpen: (open: boolean) => void;
  isSubmitting: boolean;
  onConfirmSave: () => void;
  onSubmit: (values: Record<string, any>) => void;
}

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

export function MeasurementDialog({
  isOpen,
  onOpenChange,
  selectedTypeName,
  measurementSections,
  formMode,
  currentMeasurement,
  isConfirmDialogOpen,
  setIsConfirmDialogOpen,
  isSubmitting,
  onConfirmSave,
  onSubmit
}: MeasurementDialogProps) {
  const form = useForm<Record<string, any>>({
    resolver: zodResolver(createMeasurementSchema(measurementSections)),
    defaultValues: {},
  });

  // Set form default values
  React.useEffect(() => {
    if (measurementSections.length > 0) {
      const defaultValues: Record<string, string> = {};
      
      if (formMode === "edit" && currentMeasurement) {
        measurementSections.forEach((section) => {
          section.fields.forEach((field) => {
            const fieldId = `${section.title.replace(/\s+/g, '_').toLowerCase()}_${field.name.replace(/\s+/g, '_').toLowerCase()}`;
            const matchingValue = currentMeasurement.values.find(
              v => v.field_id === field.id || v.field_name === field.name
            );
            defaultValues[fieldId] = matchingValue?.value || "";
          });
        });
      } else {
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create"
                ? `New ${selectedTypeName} Measurements`
                : `Edit ${selectedTypeName} Measurements`}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  onClick={() => onOpenChange(false)}
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

      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={onConfirmSave}
        title="Save Measurements"
        description="Are you sure you want to save these measurements? This will be used for your future orders."
        confirmLabel="Save"
        cancelLabel="Cancel"
        isLoading={isSubmitting}
      />
    </>
  );
}
