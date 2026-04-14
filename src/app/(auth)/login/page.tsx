import { getMe, login } from '@/actions/auth/auth.actions'
import LoginClient from '@/components/custom/auth/login-client'
import { redirect } from 'next/navigation';

const Page = async () => {
  const user = await getMe();

  if (user.error === 'Unauthorized' || user.statusCode === 401) {
    return (
      <LoginClient login={login} />
    )
  }
  else if(user?.role){
    redirect("/");
  }
  else{
    redirect("/select-role");
  }
}

export default Page