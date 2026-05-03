import { getMine } from "@/actions/seller/seller.actions";
import { getMe } from "@/actions/auth/auth.actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { RestaurantView } from "@/components/custom/seller/restaurant-view";

export default async function DashboardPage() {
  const [user, restaurant] = await Promise.all([
    getMe(),
    getMine(),
  ]);

  if (user?.role !== "SELLER") {
    redirect("/");
  }

  console.log("Restaurant", restaurant);

  if (restaurant?.statusCode === 404 || restaurant?.error === "Not Found" || restaurant?.message === "Restaurant not found") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-orange-200 dark:border-orange-900/50">
          <Store className="w-10 h-10 text-orange-600 dark:text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
          Welcome to Seller Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 text-lg">
          You haven't set up your restaurant yet. Create your restaurant profile to start receiving orders and managing your menu.
        </p>
        <Link href="/dashboard/restaurant/new">
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all px-8 py-6 text-lg rounded-xl">
            Create Restaurant
          </Button>
        </Link>
      </div>
    );
  }

  if (restaurant?.error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 shadow-sm">
        <h2 className="font-semibold text-lg mb-1">Error Loading Dashboard</h2>
        <p>{restaurant.message || restaurant.error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Manage your restaurant details and settings.</p>
        </div>
        <Link href="/dashboard/restaurant/edit">
          <Button variant="outline" className="border-gray-200 dark:border-zinc-800 shadow-sm rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900">
            Edit Restaurant
          </Button>
        </Link>
      </div>
      <RestaurantView restaurant={restaurant} />
    </div>
  );
}
