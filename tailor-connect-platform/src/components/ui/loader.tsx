
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "small" | "medium" | "large";
  className?: string;
  fullScreen?: boolean;
  text?: string;
}

export function Loader({ size = "medium", className, fullScreen, text }: LoaderProps) {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          <div className={cn("loading-spinner", sizeClasses[size], className)} />
          {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("loading-spinner", sizeClasses[size], className)} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function PageLoader({ text }: { text?: string }) {
  return (
    <div className="min-h-[400px] w-full flex items-center justify-center">
      <Loader size="large" text={text || "Loading..."} />
    </div>
  );
}
