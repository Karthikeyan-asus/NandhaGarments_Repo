
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Package, 
  Settings,
  LogOut
} from "lucide-react";

export default function AdminSidebar() {
  const navLinks = [
    {
      label: "Dashboard",
      href: "/superadmin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      label: "Orders",
      href: "/superadmin/orders",
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      label: "Products",
      href: "/superadmin/products",
      icon: <Package className="h-5 w-5" />
    },
    {
      label: "Users",
      href: "/superadmin/users",
      icon: <Users className="h-5 w-5" />
    },
    {
      label: "Settings",
      href: "/superadmin/settings",
      icon: <Settings className="h-5 w-5" />
    }
  ];

  return (
    <div className="w-64 shrink-0 bg-white border-r h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-primary">Admin Portal</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <NavLink
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100",
                    isActive && "bg-gray-100 text-primary font-medium"
                  )
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
