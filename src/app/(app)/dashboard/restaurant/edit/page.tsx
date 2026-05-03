import { RestaurantFormClient } from "@/components/custom/seller/restaurant-form-client";
import { getMe } from "@/actions/auth/auth.actions";
import { getMine } from "@/actions/seller/seller.actions";
import { redirect } from "next/navigation";

export default async function EditRestaurantPage() {
  const [user, existingRestaurant] = await Promise.all([
    getMe(),
    getMine(),
  ]);

  if (user?.role !== "SELLER") {
    redirect("/");
  }

  if (existingRestaurant?.statusCode === 404 || existingRestaurant?.error === "Not Found" || !existingRestaurant?.id) {
    // If they don't have a restaurant, redirect to dashboard or new
    redirect("/dashboard/restaurant/new");
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Edit Your Store
        </h1>
        <p className="text-gray-500 mt-1">Update your restaurant details and settings below.</p>
      </div>
      <RestaurantFormClient initialData={existingRestaurant} />
    </div>
  );
}
