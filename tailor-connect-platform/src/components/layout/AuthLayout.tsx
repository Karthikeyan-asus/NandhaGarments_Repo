
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 md:p-8 animate-enter">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold font-display text-gray-900 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
