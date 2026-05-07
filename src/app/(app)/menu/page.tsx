import { getMe } from "@/actions/auth/auth.actions";
import { getMenu, getMine } from "@/actions/seller/seller.actions";
import { MenuManagementClient } from "@/components/custom/seller/menu/menu-management-client";
import { Button } from "@/components/ui/button";
import { Store, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MenuPage() {
  const [user, restaurant, menu] = await Promise.all([
    getMe(),
    getMine(),
    getMenu(),
  ]);

  if (user?.role !== "SELLER") {
    redirect("/");
  }

  if (restaurant?.statusCode === 404 || restaurant?.error === "Not Found" || !restaurant?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-orange-200 dark:border-orange-900/50">
          <Store className="w-10 h-10 text-orange-600 dark:text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
          Setup Your Store
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 text-lg">
          Create your restaurant profile before adding menu categories and items.
        </p>
        <Link href="/dashboard/restaurant/new">
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all px-8 py-6 text-lg rounded-xl">
            Create Restaurant
          </Button>
        </Link>
      </div>
    );
  }

  if (menu?.error) {
    return (
      <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6">
        <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 shadow-sm">
          <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            Error Loading Menu
          </h2>
          <p>{menu.message || menu.error}</p>
        </div>
      </div>
    );
  }

  return <MenuManagementClient initialData={menu} />;
}
