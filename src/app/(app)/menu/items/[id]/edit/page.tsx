import { getMe } from "@/actions/auth/auth.actions";
import { getMenu, getMenuItem, getMine } from "@/actions/seller/seller.actions";
import { MenuItemFormClient } from "@/components/custom/seller/menu/menu-item-form-client";
import { redirect } from "next/navigation";

export default async function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, restaurant, menu, item] = await Promise.all([
    getMe(),
    getMine(),
    getMenu(),
    getMenuItem(id),
  ]);

  if (user?.role !== "SELLER") {
    redirect("/");
  }

  if (restaurant?.statusCode === 404 || restaurant?.error === "Not Found" || !restaurant?.id) {
    redirect("/dashboard/restaurant/new");
  }

  if (menu?.error || item?.error || item?.statusCode === 404) {
    redirect("/menu");
  }

  return <MenuItemFormClient categories={menu.categories ?? []} initialData={item} />;
}
