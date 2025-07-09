
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate("/login-type");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "My Orders", path: "/orders" },
    { name: "Measurements", path: "/measurements" },
  ];

  // Special links for super admin
  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Manage Users", path: "/admin/users" },
    { name: "Manage Orders", path: "/admin/orders" },
    { name: "Manage Products", path: "/admin/products" },
  ];

  const displayLinks = user?.role === "super_admin" ? adminLinks : navLinks;

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="font-display text-2xl font-bold text-primary">
            NandhaGarments
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center text-gray-500"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {user && (
            <>
              {displayLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-700 hover:text-primary font-medium link-underline"
                >
                  {link.name}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              {user.role !== "super_admin" && (
                <Link to="/orders" className="p-2 text-gray-700 hover:text-primary">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center">
                    <User className="h-5 w-5 mr-1" />
                    <span className="max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  {user.role === "org_admin" && (
                    <DropdownMenuItem onSelect={() => navigate("/organization")}>
                      Organization
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={handleLogout} className="text-red-500">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/login-type">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "md:hidden bg-white border-t border-gray-200 overflow-hidden transition-all duration-300",
          menuOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="container mx-auto px-4 py-2 flex flex-col space-y-3">
          {user &&
            displayLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="py-2 text-gray-700 hover:text-primary font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          {user && (
            <>
              <Link
                to="/profile"
                className="py-2 text-gray-700 hover:text-primary font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              {user.role === "org_admin" && (
                <Link
                  to="/organization"
                  className="py-2 text-gray-700 hover:text-primary font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Organization
                </Link>
              )}
              <Button
                variant="ghost"
                className="justify-start py-2 px-0 text-red-500 hover:text-red-600 font-medium"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          )}
          {!user && (
            <Link
              to="/login-type"
              className="py-2 text-primary hover:text-primary/80 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
