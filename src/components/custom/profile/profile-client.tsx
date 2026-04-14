"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Copy, User, CheckCircle2, XCircle, Mail, KeyRound, CalendarDays, Edit3, LogOut, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMe, logout } from "@/actions/auth/auth.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

// Define the User interface locally for strong typing
interface UserProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role?: string;
  isUserVerified: boolean;
  provider: string;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfileClient() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await getMe();
        if (response?.error || !response) {
          toast.error("Failed to fetch profile");
        } else {
          setUser(response);
        }
      } catch (err) {
        toast.error("Failed to authenticate session.");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard!");
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4 opacity-80" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Unable to load profile</h2>
        <p className="text-gray-500 mb-6">Please try logging in again.</p>
        <Button onClick={() => router.push("/login")}>Return to Login</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-in fade-in zoom-in-95 duration-500">
      <Card className="w-full max-w-3xl bg-white shadow-md border border-gray-100 rounded-2xl overflow-hidden relative">
        {/* Header Gradient */}
        <div className="h-20 w-full bg-linear-to-r from-orange-100 to-yellow-100 relative rounded-t-2xl p-6"></div>

        <CardHeader className="relative pb-0 px-6 sm:px-10 pt-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end sm:justify-between gap-4 -mt-16 w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              {/* Profile Avatar */}
              <div className="relative group">
                <div className="relative h-24 w-24 rounded-full ring-4 ring-white shadow-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-300 bg-gray-100 dark:bg-zinc-800">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                {/* Simulated Image Upload Trigger */}
                <button 
                  className="absolute cursor-pointer bottom-0 right-0 h-8 w-8 bg-zinc-900 border-2 border-white dark:border-zinc-950 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg"
                  title="Upload new picture"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              <div className="text-center sm:text-left pb-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                  {user.name || "CraveHub User"}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 rounded-full text-xs font-bold tracking-wider uppercase">
                    {user.role || "UNASSIGNED"}
                  </span>
                  
                  {user.isUserVerified ? (
                    <span className="flex items-center gap-1 text-[13px] font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[13px] font-bold text-red-600 bg-red-100 dark:bg-red-950/30 px-3 py-1 rounded-full">
                      <XCircle className="h-3.5 w-3.5" /> Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="hidden sm:flex self-end mb-2">
              <Button size={"sm"} onClick={() => toast("Edit modal coming soon.")} className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white font-semibold shadow-md transition-all gap-2">
                <Edit3 className="h-4 w-4" /> Edit Profile
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 sm:px-10 mt-8 pb-8 flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Field */}
            <div className="bg-gray-50 dark:bg-muted/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/50 group transition-colors hover:border-gray-200 dark:hover:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  <Mail className="h-4 w-4" /> Email Address
                </div>
                <button 
                  onClick={() => handleCopyEmail(user.email)} 
                  className="p-1.5 cursor-pointer text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:text-orange-400 dark:hover:bg-orange-950/30 rounded-md transition-colors"
                  title="Copy email"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                {user.email}
              </p>
            </div>

            {/* Provider Field */}
            <div className="bg-gray-50 dark:bg-muted/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/50 transition-colors hover:border-gray-200 dark:hover:border-gray-700">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                <KeyRound className="h-4 w-4" /> Authentication
              </div>
              <p className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold">
                {user.provider === "GOOGLE" ? (
                   <>
                     <svg className="w-5 h-5 ml-1 mr-1" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                     </svg>
                     Google Account
                   </>
                ) : (
                  "Standard Email / Password"
                )}
              </p>
            </div>

            {/* Registration Date Field */}
            <div className="bg-gray-50 dark:bg-muted/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/50 transition-colors hover:border-gray-200 dark:hover:border-gray-700">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                <CalendarDays className="h-4 w-4" /> Member Since
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-bold">
                {formatDate(user.createdAt)}
              </p>
            </div>

             {/* Updated Date Field */}
             <div className="bg-gray-50 dark:bg-muted/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/50 transition-colors hover:border-gray-200 dark:hover:border-gray-700">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                <Edit3 className="h-4 w-4" /> Last Updated
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-bold">
                {formatDate(user.updatedAt)}
              </p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />
          
          {/* Action Zone */}
          <div className="flex flex-col sm:flex-row w-full gap-3 pt-2">
            <Button size={"sm"} onClick={() => toast("Edit modal coming soon.")} className="sm:hidden w-full bg-orange-500 hover:bg-orange-600 cursor-pointer text-white font-semibold shadow-md gap-2">
              <Edit3 className="h-4 w-4" /> Edit Profile
            </Button>
            <Button size={"sm"} onClick={handleLogout} className="w-full sm:w-auto sm:ml-auto bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer font-bold shadow-none transition-colors border-0">
               <LogOut className="h-4 w-4 mr-2" />
               Log Out Securely
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// Minimal beautifully animated Skeleton structure
function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 w-full animate-in fade-in">
      <Card className="w-full max-w-2xl bg-white dark:bg-zinc-950 border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden relative shadow-sm">
        <Skeleton className="h-32 w-full rounded-none" />
        <CardHeader className="pb-0 px-8 relative">
           <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 relative">
              <Skeleton className="h-28 w-28 rounded-full border-4 border-white dark:border-zinc-950" />
              <div className="text-center sm:text-left flex flex-col items-center sm:items-start gap-2 pt-2">
                 <Skeleton className="h-8 w-48 rounded-lg" />
                 <div className="flex gap-2">
                   <Skeleton className="h-6 w-20 rounded-full" />
                   <Skeleton className="h-6 w-24 rounded-full" />
                 </div>
              </div>
           </div>
        </CardHeader>
        <CardContent className="px-8 mt-10 pb-8 space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
           </div>
           <Skeleton className="h-px w-full my-6" />
           <div className="flex justify-end gap-3">
             <Skeleton className="h-12 w-32 rounded-xl" />
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
