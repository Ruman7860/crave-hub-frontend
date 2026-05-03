import { MapPin, Phone, Clock, FileText, Store } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export function RestaurantView({ restaurant }: { restaurant: any }) {
  if (!restaurant) return null;

  return (
    <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Header Image */}
      <div className="w-full h-64 sm:h-80 relative bg-gray-100 dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
        {restaurant.image ? (
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Store className="w-16 h-16 mb-2 opacity-50" />
            <span className="text-sm font-medium">No Image Provided</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <Badge
            variant={restaurant.isOpen ? "default" : "secondary"}
            className={restaurant.isOpen 
              ? "bg-green-600 hover:bg-green-700 text-white border-none shadow-md px-3 py-1 text-sm font-bold" 
              : "bg-gray-800 text-gray-100 hover:bg-gray-700 border-none shadow-md px-3 py-1 text-sm font-bold"
            }
          >
            {restaurant.isOpen ? "OPEN" : "CLOSED"}
          </Badge>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-5 flex-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {restaurant.name}
            </h2>
            
            {restaurant.description && (
              <div className="flex gap-3 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl">
                <FileText className="w-5 h-5 shrink-0 mt-0.5 text-gray-400" />
                <p className="leading-relaxed text-sm sm:text-base">{restaurant.description}</p>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
              <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                <Phone className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              </div>
              <span className="text-lg">{restaurant.phone || "No phone number"}</span>
            </div>

            <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-red-600 dark:text-red-500" />
              </div>
              <div className="pt-2">
                <p className="font-medium text-lg leading-snug">
                  {restaurant.location?.formattedAddress || "No address provided"}
                </p>
                {restaurant.location?.latitude && restaurant.location?.longitude && (
                  <p className="text-sm text-gray-500 mt-1 font-mono">
                    {restaurant.location.latitude}, {restaurant.location.longitude}
                  </p>
                )}
              </div>
            </div>
            
          </div>
          
          <div className="w-full sm:w-72 shrink-0 bg-gray-50 dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" /> Store Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-800">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Verification</span>
                <Badge variant="outline" className={restaurant.isVerified 
                  ? "text-green-700 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900/50" 
                  : "text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50"}>
                  {restaurant.isVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-800">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Status</span>
                <span className={restaurant.isOpen ? "font-semibold text-green-600 dark:text-green-500" : "font-semibold text-gray-600 dark:text-gray-400"}>
                  {restaurant.isOpen ? "Accepting Orders" : "Offline"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(restaurant.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
