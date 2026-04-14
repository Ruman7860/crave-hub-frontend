import { getMe, signup, login } from '@/actions/auth/auth.actions'
import SignupClient from '@/components/custom/auth/signup-client'
import { redirect } from 'next/navigation';

const Page = async () => {
  const user = await getMe();

  if (user.error === 'Unauthorized' || user.statusCode === 401) {
    return (
      <SignupClient signup={signup} login={login} />
    )
  }
  else if (user?.role) {
    redirect("/");
  }
  else {
    redirect("/select-role");
  }
}

export default Page
