import { LoadingPage } from "@/components/ui/loading-page";

export default function DashboardLoading() {
  return (
    <LoadingPage
      title="Preparing your workspace"
      description="Please wait a moment while we load your dashboard data and settings."
    />
  );
}
