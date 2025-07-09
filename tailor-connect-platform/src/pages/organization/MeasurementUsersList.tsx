
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, Plus, User } from "lucide-react";

interface MeasurementType {
  id: string;
  name: string;
}

interface UserMeasurement {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  department: string;
  updated_at: string;
  has_measurement: boolean;
}

// Mock service for measurement users
const orgMeasurementsService = {
  getMeasurementType: async (typeId: string): Promise<{success: boolean, type: MeasurementType}> => {
    // This would be replaced with an actual API call
    return {
      success: true,
      type: {
        id: typeId,
        name: typeId === "mt-001" ? "School Uniform" : 
              typeId === "mt-002" ? "Sports Wear" : 
              typeId === "mt-003" ? "Corporate Wear" : "Casual Wear"
      }
    };
  },
  
  getUserMeasurementsByType: async (orgId: string, typeId: string): Promise<{success: boolean, measurements: UserMeasurement[]}> => {
    // This would be replaced with an actual API call
    return {
      success: true,
      measurements: [
        {
          id: "meas-001",
          user_id: "user-001",
          user_name: "Michael Johnson",
          user_email: "michael@example.com",
          department: "Sales",
          updated_at: "2025-04-15T10:30:00Z",
          has_measurement: true
        },
        {
          id: "meas-002",
          user_id: "user-002",
          user_name: "Sarah Williams",
          user_email: "sarah@example.com",
          department: "Marketing",
          updated_at: "2025-04-12T14:20:00Z",
          has_measurement: true
        },
        {
          id: "user-003",
          user_id: "user-003",
          user_name: "Robert Brown",
          user_email: "robert@example.com",
          department: "Development",
          updated_at: "",
          has_measurement: false
        }
      ]
    };
  }
};

export default function MeasurementUsersList() {
  const { typeId } = useParams<{ typeId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [measurementType, setMeasurementType] = useState<MeasurementType | null>(null);
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurement[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!typeId || !user || !user.orgId) {
        navigate('/organization/measurements');
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch measurement type info
        const typeResponse = await orgMeasurementsService.getMeasurementType(typeId);
        
        if (typeResponse.success) {
          setMeasurementType(typeResponse.type);
          
          // Fetch measurements for this type
          const measurementsResponse = await orgMeasurementsService.getUserMeasurementsByType(user.orgId, typeId);
          
          if (measurementsResponse.success) {
            setUserMeasurements(measurementsResponse.measurements);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load measurement data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [typeId, user, navigate, toast]);

  const handleAddMeasurement = (userId: string) => {
    navigate(`/organization/org-user-measurements/${userId}?type=${typeId}`);
  };
  
  const handleEditMeasurement = (userId: string) => {
    navigate(`/organization/org-user-measurements/${userId}?type=${typeId}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageLoader text="Loading employee measurements..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary flex items-center"
          onClick={() => navigate("/organization/measurements")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Measurement Types
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            {measurementType?.name} Measurements
          </h1>
          <p className="text-gray-600">
            View and manage employee measurements for {measurementType?.name}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Employee Measurements</CardTitle>
                <CardDescription>
                  Select an employee to add or edit their measurements
                </CardDescription>
              </div>
              <Button className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Add New Employee
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userMeasurements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No employees found. Add employees first.
                    </TableCell>
                  </TableRow>
                ) : (
                  userMeasurements.map((measurement) => (
                    <TableRow key={measurement.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{measurement.user_name}</TableCell>
                      <TableCell>{measurement.user_email}</TableCell>
                      <TableCell>{measurement.department || "—"}</TableCell>
                      <TableCell>
                        {measurement.has_measurement ? 
                          new Date(measurement.updated_at).toLocaleDateString() : 
                          <span className="text-gray-500 text-sm italic">Not measured</span>
                        }
                      </TableCell>
                      <TableCell>
                        {measurement.has_measurement ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMeasurement(measurement.user_id)}
                            className="flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span>Edit</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddMeasurement(measurement.user_id)}
                            className="flex items-center"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            <span>Add</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
