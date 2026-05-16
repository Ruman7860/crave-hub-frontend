import { getRestaurantDetails, getRestaurantMenu } from "@/actions/customer/customer.actions";
import { RestaurantDetailsClient } from "@/components/custom/customer/restaurant/restaurant-details-client";
import { EmptyState } from "@/components/custom/customer/common/customer-ui";

export default async function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [restaurant, menu] = await Promise.all([
    getRestaurantDetails(id),
    getRestaurantMenu(id),
  ]);

  if ("error" in restaurant || "error" in menu) {
    return (
      <EmptyState
        icon="error"
        title="Restaurant unavailable"
        description="This restaurant could not be loaded right now. Please try another place nearby."
      />
    );
  }

  return <RestaurantDetailsClient restaurant={restaurant} menu={menu} />;
}
