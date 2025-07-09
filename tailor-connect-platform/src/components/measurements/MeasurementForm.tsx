
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogFooter } from "@/components/ui/dialog";
import { MeasurementSection } from "@/api/measurementsService";

interface MeasurementFormProps {
  measurementSections: MeasurementSection[];
  onSubmit: (values: Record<string, any>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  formMode: "create" | "edit";
  currentMeasurement?: any;
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

export function MeasurementForm({
  measurementSections,
  onSubmit,
  onCancel,
  isSubmitting,
  formMode,
  currentMeasurement
}: MeasurementFormProps) {
  const form = useForm<Record<string, any>>({
    resolver: zodResolver(createMeasurementSchema(measurementSections)),
    defaultValues: {},
  });

  // Set default values when form loads
  useState(() => {
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

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : formMode === "create" ? "Save Measurements" : "Update Measurements"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
