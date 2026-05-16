import { getNearbyRestaurants } from "@/actions/customer/customer.actions";
import { CustomerHomeClient } from "@/components/custom/customer/home/customer-home-client";
import { Suspense } from "react";

const Page = async () => {
  const restaurants = await getNearbyRestaurants({ radiusKm: 20 });

  console.log("NearByRestaurants -> ",restaurants);

  return (
    <Suspense fallback={null}>
      <CustomerHomeClient initialRestaurants={Array.isArray(restaurants) ? restaurants : []} />
    </Suspense>
  );
}

export default Page
