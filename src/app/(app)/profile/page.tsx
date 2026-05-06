import ProfileClient from "@/components/custom/profile/profile-client";
import { getMe } from "@/actions/auth/auth.actions";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getMe();

  if (!user || user.error) {
    redirect("/login");
  }

  return <ProfileClient user={user} />;
}
