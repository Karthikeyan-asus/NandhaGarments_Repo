
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import HomePage from "@/pages/HomePage";

// Individual User Pages
import IndividualOrdersPage from "@/pages/individual/OrdersPage";
import IndividualProductsPage from "@/pages/individual/ProductsPage";
import IndividualMeasurementsPage from "@/pages/individual/MeasurementsPage";

// Organization Admin Pages
import OrganizationOrdersPage from "@/pages/organization/OrdersPage";
import OrganizationProductsPage from "@/pages/organization/ProductsPage";
import OrganizationMeasurementsPage from "@/pages/organization/MeasurementsPage";
import MeasurementUsersList from "@/pages/organization/MeasurementUsersList";
import OrgUserManagementPage from "@/pages/OrgUserManagementPage"; 
import OrgUserMeasurementsPage from "@/pages/OrgUserMeasurementsPage";
import OrderForEmployeePage from "@/pages/OrderForEmployeePage";

// Super Admin Pages
import SuperAdminOrdersPage from "@/pages/superadmin/OrdersPage";
import SuperAdminManageUsersPage from "@/pages/superadmin/ManageUsersPage";
import SuperAdminManageProductsPage from "@/pages/superadmin/ManageProductsPage";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import LoginTypePage from "@/pages/auth/LoginTypePage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import OrgAdminLoginPage from "@/pages/auth/OrgAdminLoginPage";
import SuperAdminLoginPage from "@/pages/auth/SuperAdminLoginPage";
import LoginIndividual from "@/pages/auth/LoginIndividual";
import LoginBusiness from "@/pages/auth/LoginBusiness";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login-type" element={<LoginTypePage />} />
          <Route path="/login/individual" element={<LoginIndividual />} />
          <Route path="/login/business" element={<LoginBusiness />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/org-admin/login" element={<OrgAdminLoginPage />} />
          <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
          
          {/* Individual User Routes */}
          <Route path="/individual/orders" element={<IndividualOrdersPage />} />
          <Route path="/individual/products" element={<IndividualProductsPage />} />
          <Route path="/individual/measurements" element={<IndividualMeasurementsPage />} />
          
          {/* Organization Admin Routes */}
          <Route path="/organization/orders" element={<OrganizationOrdersPage />} />
          <Route path="/organization/products" element={<OrganizationProductsPage />} />
          <Route path="/organization/measurements" element={<OrganizationMeasurementsPage />} />
          <Route path="/organization/measurements/:typeId" element={<MeasurementUsersList />} />
          <Route path="/org-users" element={<OrgUserManagementPage />} />
          <Route path="/organization/org-users" element={<OrgUserManagementPage />} />
          <Route path="/organization/org-user-measurements/:userId" element={<OrgUserMeasurementsPage />} />
          <Route path="/organization/order-for-employee/:userId" element={<OrderForEmployeePage />} />
          <Route path="/org-user-measurements/:userId" element={<OrgUserMeasurementsPage />} />
          <Route path="/order-for-employee/:userId" element={<OrderForEmployeePage />} />
          
          {/* Super Admin Routes */}
          <Route path="/superadmin/orders" element={<SuperAdminOrdersPage />} />
          <Route path="/superadmin/users" element={<SuperAdminManageUsersPage />} />
          <Route path="/superadmin/products" element={<SuperAdminManageProductsPage />} />
          
          {/* Legacy Routes (redirecting to new structure) */}
          <Route path="/orders" element={<Navigate to="/individual/orders" replace />} />
          <Route path="/products" element={<Navigate to="/individual/products" replace />} />
          <Route path="/measurements" element={<Navigate to="/individual/measurements" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
