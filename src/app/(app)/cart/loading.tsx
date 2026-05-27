import { LoadingPage } from "@/components/ui/loading-page";

export default function DashboardLoading() {
  return (
    <LoadingPage
      title="Preparing your cart"
      description="Please wait a moment while we load your cart data and settings."
    />
  );
}