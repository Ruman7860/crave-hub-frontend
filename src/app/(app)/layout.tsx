import { getMe } from '@/actions/auth/auth.actions';
import { redirect } from 'next/navigation';
import React from 'react';
import { Navbar } from '@/components/navbar';

const Layout = async ({ children }: { children: React.ReactNode }) => {
    const user = await getMe();
    console.log(user);
    if (user.error === 'Unauthorized' || user.statusCode === 401) {
        redirect("/login");
    }
    if (!user?.role) {
        redirect("/select-role");
    }

    return (
        <div className="w-full min-h-screen bg-gray-50/30 dark:bg-zinc-950">
            <Navbar role={user.role} user = {user} />
            <main className='w-full min-h-[calc(100vh-64px)] bg-linear-to-br from-orange-50 via-red-50 to-yellow-50 dark:from-orange-950/30 dark:via-red-950/30 dark:to-yellow-950/30 p-4 font-sans'>
                {children}
            </main>
        </div>
    )
}

export default Layout;