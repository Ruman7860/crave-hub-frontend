import { RestaurantFormClient } from "@/components/custom/seller/restaurant-form-client";
import { getMe } from "@/actions/auth/auth.actions";
import { getMine } from "@/actions/seller/seller.actions";
import { redirect } from "next/navigation";

export default async function NewRestaurantPage() {
  const [user, existingRestaurant] = await Promise.all([
    getMe(),
    getMine(),
  ]);

  if (user?.role !== "SELLER") {
    redirect("/");
  }

  if (!existingRestaurant?.error && !existingRestaurant?.statusCode && existingRestaurant?.id) {
    // If they already have a restaurant, redirect to dashboard
    redirect("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Setup Your Store
        </h1>
        <p className="text-gray-500 mt-1">Get started by filling out your restaurant information.</p>
      </div>
      <RestaurantFormClient />
    </div>
  );
}
