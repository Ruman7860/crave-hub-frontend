import { getMe } from "@/actions/auth/auth.actions";
import SelectRoleClient from "@/components/custom/select-role/select-role-client";

const Page = async () => {
  const userResponse = await getMe();
  const user = userResponse.data || userResponse;

  return <SelectRoleClient user={user} />;
}

export default Page;