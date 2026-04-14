import { getMe } from "@/actions/auth/auth.actions";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getMe();
  if (user.error === 'Unauthorized' || user.statusCode === 401) {
    redirect("/login");
  }
  if (!user?.role) {
    redirect("/select-role");
  }
  redirect('/home')
}
