import { getMe } from '@/actions/auth/auth.actions';
import { redirect } from 'next/navigation';
import React from 'react'

const Layout = async ({children}: {children: React.ReactNode}) => {
  const user = await getMe();
  if (user.error === 'Unauthorized' || user.statusCode === 401) {
    redirect("/login");
  }
  else if(user?.role){
    redirect("/");
  }
  return (
    <div className='min-h-screen flex justify-center items-center'>
      {children}
    </div>
  )
}

export default Layout;