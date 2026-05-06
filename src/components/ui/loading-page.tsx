import { Loader2 } from "lucide-react";

interface LoadingPageProps {
  title?: string;
  description?: string;
}

export function LoadingPage({ 
  title = "Loading...", 
  description = "Please wait a moment while we fetch the required data." 
}: LoadingPageProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center w-full px-4 animate-in fade-in duration-500 zoom-in-95">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="relative flex items-center justify-center">
          {/* Outer pinging ring for emphasis */}
          <div className="absolute w-16 h-16 rounded-full border-4 border-orange-100 dark:border-orange-900/30 animate-ping opacity-75" />
          
          {/* Inner stable ring containing the spinner */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500 ring-1 ring-orange-100 dark:ring-orange-900/50 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
