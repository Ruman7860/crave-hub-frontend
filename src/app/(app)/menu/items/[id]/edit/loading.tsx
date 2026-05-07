import { LoadingPage } from "@/components/ui/loading-page";

export default function EditMenuItemLoading() {
  return (
    <LoadingPage
      title="Loading Item"
      description="Fetching item details and image preview."
    />
  );
}
