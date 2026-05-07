import { getMe } from "@/actions/auth/auth.actions";
import { getMenu, getMine } from "@/actions/seller/seller.actions";
import { MenuItemFormClient } from "@/components/custom/seller/menu/menu-item-form-client";
import { redirect } from "next/navigation";

export default async function NewMenuItemPage() {
  const [user, restaurant, menu] = await Promise.all([
    getMe(),
    getMine(),
    getMenu(),
  ]);

  if (user?.role !== "SELLER") {
    redirect("/");
  }

  if (restaurant?.statusCode === 404 || restaurant?.error === "Not Found" || !restaurant?.id) {
    redirect("/dashboard/restaurant/new");
  }

  if (menu?.error) {
    redirect("/menu");
  }

  return <MenuItemFormClient categories={menu.categories ?? []} />;
}
