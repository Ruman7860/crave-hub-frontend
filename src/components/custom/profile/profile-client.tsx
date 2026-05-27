"use client";

import Image from "next/image";
import { Copy, User, CheckCircle2, XCircle, Mail, KeyRound, CalendarDays, Edit3, LogOut, ShieldAlert, MapPin, PackageOpen, Settings, Bell, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth/auth.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

interface ProfileClientProps {
  user: UserProfile;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard!");
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
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

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 flex flex-col items-center justify-center">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4 opacity-80" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Unable to load profile</h2>
        <Button onClick={() => router.push("/login")} className="mt-4">Return to Login</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            My Profile
          </h1>
          <p className="text-gray-500 mt-1">Manage your account settings and preferences.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => toast("Edit modal coming soon.")}
            className="border-gray-200 dark:border-zinc-800 shadow-sm rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <Edit3 className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="shadow-sm rounded-lg cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" /> Log Out
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 flex flex-col items-center text-center shadow-sm">
            <div className="relative group mb-6 mt-2">
              <div className="relative h-32 w-32 rounded-full ring-4 ring-gray-50 dark:ring-zinc-900 shadow-inner overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-zinc-800">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <button
                className="absolute cursor-pointer bottom-0 right-0 h-10 w-10 bg-zinc-900 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg"
                title="Upload new picture"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {user.name || "CraveHub User"}
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 rounded-full text-xs font-bold tracking-wider uppercase">
                {user.role || "UNASSIGNED"}
              </span>

              {user.isUserVerified ? (
                <span className="flex items-center gap-1 text-[13px] font-bold text-green-700 bg-green-50 border border-green-200 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400 px-3 py-1 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[13px] font-bold text-red-700 bg-red-50 border border-red-200 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 px-3 py-1 rounded-full">
                  <XCircle className="h-3.5 w-3.5" /> Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Account Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account Details</h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Address
                    </label>
                    <button
                      onClick={() => handleCopyEmail(user.email)}
                      className="text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                      title="Copy email"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    <p className="text-gray-900 dark:text-gray-100 font-medium truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <KeyRound className="h-4 w-4" /> Authentication
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-100 dark:border-zinc-800/80 flex items-center">
                    {user.provider === "GOOGLE" ? (
                      <>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">Google Account</span>
                      </>
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100 font-medium">Standard Email / Password</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" /> Member Since
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Edit3 className="h-4 w-4" /> Last Updated
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
            <MapPin className="h-5 w-5 text-orange-600" /> Saved Addresses
          </h3>
          <div className="mt-4 space-y-3">
            {[
              ["Home", "Use current location for faster delivery"],
              ["Work", "Add office address and delivery notes"],
            ].map(([label, address]) => (
              <div key={label} className="rounded-xl border border-orange-100 bg-orange-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="font-bold text-gray-950 dark:text-gray-50">{label}</p>
                <p className="mt-1 text-sm text-gray-500">{address}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
            <PackageOpen className="h-5 w-5 text-orange-600" /> Order History
          </h3>
          <div className="mt-4 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-5 text-center dark:border-zinc-800">
            <p className="font-bold text-gray-950 dark:text-gray-50">No orders yet</p>
            <p className="mt-1 text-sm text-gray-500">Your Crave Hub orders will appear here after checkout.</p>
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
            <Settings className="h-5 w-5 text-orange-600" /> Settings
          </h3>
          <div className="mt-4 space-y-3">
            {[
              [Bell, "Order alerts", "Push and email updates"],
              [CreditCard, "Payment methods", "Cards and UPI options"],
              [ShieldAlert, "Privacy", "Account safety controls"],
            ].map(([Icon, label, description]) => {
              const SettingsIcon = Icon as typeof Bell;
              return (
                <button key={label as string} className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                  <SettingsIcon className="h-4 w-4 text-gray-500" />
                  <span>
                    <span className="block text-sm font-bold text-gray-950 dark:text-gray-50">{label as string}</span>
                    <span className="block text-xs text-gray-500">{description as string}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
