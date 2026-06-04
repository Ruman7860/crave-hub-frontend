import { LoadingPage } from "@/components/ui/loading-page";

export default function OrdersLoading() {
  return (
    <LoadingPage
      title="Fetching your orders"
      description="Please wait a moment while we fetch your orders."
    />
  );
}