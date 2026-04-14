"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeClosed, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from '@react-oauth/google';

interface LoginProps {
  login: (data: any) => Promise<any>;
}

const LoginClient = ({ login }: LoginProps) => {
  const loginSchema = z.object({
    email: z.email("We need a valid email to find your cravings."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    provider: z.string(),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      provider: "EMAIL",
    },
  });

  const onSubmit = async (loginData: z.infer<typeof loginSchema>) => {
    try {
      setLoading(true);
      const result = await login(loginData);
      console.log(result);
      if (result.accessToken) {
        toast.success(result.message || "Login successful!");
        router.push("/select-role");
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        setLoading(true);
        const result = await login({
          provider: "GOOGLE",
          code: codeResponse.code,
        });

        if (result.accessToken) {
          toast.success(result.message || "Logged in with Google!");
          router.push("/select-role");
        } else {
          toast.error(result.message || "Google login failed");
        }
      } catch (error) {
        console.error("Google Auth error:", error);
        toast.error("An error occurred during Google login.");
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login failed", error);
      toast.error("Google login authentication failed");
    },
    flow: "auth-code",
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50 dark:from-orange-950/30 dark:via-red-950/30 dark:to-yellow-950/30 p-4 font-sans">
      <Card className="w-full max-w-[420px] shadow-[0_20px_60px_-15px_rgba(234,88,12,0.2)] dark:shadow-none border-orange-100 dark:border-orange-900/50 rounded-[28px] animate-in fade-in zoom-in-95 duration-500 overflow-hidden bg-white dark:bg-zinc-950">
        {/* Food Visual Top Section */}
        <div className="h-40 sm:h-40 w-full relative bg-orange-100/50 dark:bg-orange-900/20 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop"
            alt="Delicious food"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex items-start">
            <div className="p-6 w-full">
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/30 shadow-sm">
                Crave Hub 🍕
              </span>
            </div>
          </div>
        </div>

        <CardHeader className="space-y-2 px-7 pt-1">
          <CardTitle className="text-[28px] leading-tight font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Cravings start here
          </CardTitle>
          <CardDescription className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
            Hungry? Let's fix that. Login to order your favorites in minutes.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-7 pb-8">
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((loginData) => onSubmit(loginData))}
          >
            <div className="space-y-4">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="font-semibold text-gray-700 dark:text-gray-300 text-[13px] uppercase tracking-wide">
                      Email
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-[18px] w-[18px] text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        {...field}
                        placeholder="foodie@example.com"
                        type="email"
                        className={`pl-11 h-12 bg-gray-50/50 dark:bg-muted/50 border-gray-200 dark:border-gray-800 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 hover:border-orange-200 ${fieldState.error ? "border-red-500/80 focus-visible:ring-red-500/20 bg-red-50/50" : ""
                          }`}
                      />
                    </div>
                    {fieldState.error && (
                      <p className="text-[13px] font-medium text-red-500 animate-in slide-in-from-top-1 ml-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="font-semibold text-gray-700 dark:text-gray-300 text-[13px] uppercase tracking-wide">
                        Password
                      </Label>
                      <a href="#" className="text-[13px] font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 hover:underline underline-offset-4 transition-colors">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-[18px] w-[18px] text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pl-11 h-12 bg-gray-50/50 dark:bg-muted/50 border-gray-200 dark:border-gray-800 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 hover:border-orange-200 ${fieldState.error ? "border-red-500/80 focus-visible:ring-red-500/20 bg-red-50/50" : ""
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <EyeClosed className="h-[18px] w-[18px] text-gray-400" />
                        ) : (
                          <Eye className="h-[18px] w-[18px] text-gray-400" />
                        )}
                      </button>
                    </div>
                    {fieldState.error && (
                      <p className="text-[13px] font-medium text-red-500 animate-in slide-in-from-top-1 ml-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-[16px] font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25 rounded-xl  bg-orange-600 hover:bg-orange-700 text-white border-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Ordering"}
            </Button>
          </form>

          <div className="mt-4 mb-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-yellow-500/95 dark:bg-yellow-500/95"></div>
            <div className="text-[11px] text-gray-400 dark:text-muted-foreground font-bold uppercase tracking-wider">Or continue with</div>
            <div className="flex-1 h-px bg-yellow-500/95 dark:bg-yellow-500/95"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full h-12 bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] font-bold flex items-center justify-center gap-3 rounded-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-muted-foreground font-medium">
            New to Crave Hub?{" "}
            <a href="/signup" className="font-bold text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 hover:underline underline-offset-4 transition-colors">
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginClient;